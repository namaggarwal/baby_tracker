import { CONFIG } from '../config';
import { db } from '../db';

export async function syncToCloud() {
  if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('REPLACE_WITH_YOUR_URL')) {
    return;
  }

  const passwordSetting = await db.settings.get('syncPassword');
  const password = passwordSetting?.value || '';

  const operations = await db.syncQueue.toArray();
  if (operations.length === 0) return true;

  const payload = {
    type: 'sync_operations',
    operations,
    password
  };

  try {
    const res = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // We expect JSON back from sync_operations
    const text = await res.text();
    let result;
    try { result = JSON.parse(text); } catch (e) { result = { status: 'success' }; }

    if (result.status !== 'error') {
      console.log('Sync operations successful');
      const ids = operations.map(op => op.id);
      await db.syncQueue.bulkDelete(ids);
      await db.settings.put({ key: 'lastSync', value: new Date().toISOString() });
      return true;
    }
    console.warn('Sync operations failed on server:', result.message);
    return false;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}

export async function fetchFromCloud() {
  if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('REPLACE_WITH_YOUR_URL')) {
    return null;
  }

  const passwordSetting = await db.settings.get('syncPassword');
  const password = passwordSetting?.value || '';

  try {
    // 1. Fetch Events using POST
    const lastSyncSetting = await db.settings.get('lastFetchTime');
    // Subtract 5 minutes (300000ms) as a safety buffer to ensure no overlapping updates are missed
    const lastSyncTime = lastSyncSetting?.value
      ? Math.max(0, new Date(lastSyncSetting.value).getTime() - 300000)
      : 0;

    const eventsResponse = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ type: 'fetch_delta', lastSyncTime, password })
    });
    const remoteEvents = await eventsResponse.json();
    console.log({ remoteEvents });
    if (remoteEvents.status === 'error') throw new Error(remoteEvents.message);

    if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
      console.log('Remote data received, items:', remoteEvents.length);
      const existingEvents = await db.events.toArray();
      const existingMap = new Map(existingEvents.map(e => [e.syncId, e]));

      const formattedEvents = remoteEvents
        .map(e => {
          // Robustly find syncId and type regardless of casing
          const findKey = (obj, key) => {
            const lowerKey = key.toLowerCase();
            const realKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
            return realKey ? obj[realKey] : undefined;
          };

          const rawSyncId = findKey(e, 'syncid') || findKey(e, 'id');
          const syncId = String(rawSyncId || '');
          if (!syncId) return null;

          const status = String(findKey(e, 'status') || 'ACTIVE').toUpperCase();
          if (status === 'DELETED') {
            return { syncId, status: 'DELETED', _deleteMe: true };
          }

          const type = String(findKey(e, 'type') || '').toLowerCase();

          // Prioritize original event timestamp over sync time (lastupdated)
          let ts = Number(findKey(e, 'timestamp'));
          if (isNaN(ts) || ts <= 0) {
            ts = new Date(findKey(e, 'timestamp')).getTime();
          }
          if (isNaN(ts) || ts <= 0) {
            ts = Number(findKey(e, 'lastupdated'));
          }
          if (isNaN(ts) || ts <= 0) {
            ts = new Date(findKey(e, 'lastupdated')).getTime();
          }
          if (isNaN(ts) || ts <= 0) ts = Date.now();

          let et = Number(findKey(e, 'endtime'));
          if (isNaN(et) || et <= 0) {
            et = new Date(findKey(e, 'endtime')).getTime();
          }
          if (isNaN(et) || et <= 0) et = undefined;

          return {
            syncId,
            type,
            subtype: findKey(e, 'subtype') || undefined,
            timestamp: ts,
            endTime: et,
            duration: findKey(e, 'duration') || undefined,
            notes: findKey(e, 'notes') || undefined,
            size: findKey(e, 'size') || undefined,
            quantity_ml: parseInt(findKey(e, 'quantity_ml') || findKey(e, 'quantity')) || undefined,
            side: findKey(e, 'side') || undefined,
            dosage: findKey(e, 'dosage') || undefined,
            status: 'ACTIVE',
            version: Number(findKey(e, 'version')) || 1,
            synced: true,
          };
        })
        .filter(e => e !== null);

      const toDelete = formattedEvents.filter(e => e._deleteMe).map(e => e.syncId);
      const toPut = formattedEvents.filter(e => !e._deleteMe);

      if (toDelete.length > 0) await db.events.bulkDelete(toDelete);
      if (toPut.length > 0) {
        console.log(`Putting ${toPut.length} items into local DB`);
        await db.events.bulkPut(toPut);
      }
    } else {
      console.log('No new data received from cloud.');
    }

    // 2. Fetch Settings using POST for security
    const lastSettingsSyncSetting = await db.settings.get('lastSettingsFetchTime');
    const lastSettingsSyncTime = lastSettingsSyncSetting?.value
      ? Math.max(0, Number(lastSettingsSyncSetting.value) - 300000)
      : 0;

    const settingsResponse = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ 
        type: 'fetch_settings', 
        password,
        lastSyncTime: lastSettingsSyncTime 
      })
    });
    const remoteSettings = await settingsResponse.json();

    if (remoteSettings.status === 'error') throw new Error(remoteSettings.message);

    if (Array.isArray(remoteSettings) && remoteSettings.length > 0) {
      console.log('Remote settings received, items:', remoteSettings.length);
      for (const item of remoteSettings) {
        let val = item.value;
        // Key-value mapping from the delta result
        const key = item.key;
        if (val !== null && val !== undefined && !isNaN(val) && val !== '' && typeof val !== 'boolean') {
          val = Number(val);
        }
        if (key) {
          await db.settings.put({ key, value: val });
        }
      }
    }

    await db.settings.put({ key: 'lastFetchTime', value: Date.now() });
    await db.settings.put({ key: 'lastSettingsFetchTime', value: Date.now() });
    return true;
  } catch (error) {
    console.error('Fetch from cloud failed:', error);
    return false;
  }
}
