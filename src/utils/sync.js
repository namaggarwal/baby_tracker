import { CONFIG } from '../config';
import { db } from '../db';

export async function syncToCloud(data, isSettings = false) {
  if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('REPLACE_WITH_YOUR_URL')) {
    return;
  }

  const passwordSetting = await db.settings.get('syncPassword');
  const password = passwordSetting?.value || '';

  let payload;
  if (isSettings) {
    payload = { type: 'settings_update', settings: data, password };
  } else {
    payload = { 
      ...data, 
      password,
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : '',
      endTime: data.endTime ? new Date(data.endTime).toISOString() : ''
    };
  }

  try {
    await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    await db.settings.put({ key: 'lastSync', value: new Date().toISOString() });
    return true;
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
    // 1. Fetch Events using POST for security
    const eventsResponse = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ type: 'fetch_events', password })
    });
    // For POST we need to follow the redirect if not using no-cors. 
    // Actually, GAS redirects from POST to a GET, but we can just use the response if handled correctly.
    // However, GAS 'doPost' returns the content directly if we use ContentService.
    const remoteEvents = await eventsResponse.json();
    
    if (remoteEvents.status === 'error') throw new Error(remoteEvents.message);
    
    if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
      const existingEvents = await db.events.toArray();
      const existingMap = new Map(existingEvents.map(e => [e.syncId, e]));

      const formattedEvents = remoteEvents
        .filter(e => e.syncid || e.id)
        .map(e => {
          const syncId = e.syncid || String(e.id);
          const existing = existingMap.get(syncId);
          
          let ts = existing?.timestamp || Date.now();
          if (e.timestamp) {
            let parsedTs = Number(e.timestamp);
            if (isNaN(parsedTs)) parsedTs = new Date(e.timestamp).getTime();
            if (!isNaN(parsedTs)) ts = parsedTs;
          }
          
          let et = existing?.endTime || undefined;
          if (e.endtime) {
            let parsedEt = Number(e.endtime);
            if (isNaN(parsedEt)) parsedEt = new Date(e.endtime).getTime();
            if (!isNaN(parsedEt)) et = parsedEt;
          }

          return {
            syncId,
            type: e.type,
            subtype: e.subtype || undefined,
            timestamp: ts,
            endTime: et,
            duration: e.duration || undefined,
            notes: e.notes || undefined,
            size: e.size || undefined,
            quantity_ml: e.quantity ? parseInt(e.quantity) : undefined,
            side: e.side || undefined,
            dosage: e.dosage || undefined,
            synced: true,
          };
        });
      try {
        await db.events.bulkPut(formattedEvents);
      } catch (err) {
        console.error('bulkPut events failed:', err);
      }
    }

    // 2. Fetch Settings using POST for security
    const settingsResponse = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ type: 'fetch_settings', password })
    });
    const remoteSettings = await settingsResponse.json();
    
    if (remoteSettings.status === 'error') throw new Error(remoteSettings.message);
    
    if (Array.isArray(remoteSettings) && remoteSettings.length > 0) {
      for (const item of remoteSettings) {
        let val = item.value;
        if (!isNaN(val) && val !== '') val = Number(val);
        await db.settings.put({ key: item.key, value: val });
      }
    }

    await db.settings.put({ key: 'lastSync', value: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Fetch from cloud failed:', error);
    return false;
  }
}

export async function deleteFromCloud(id) {
  if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('REPLACE_WITH_YOUR_URL')) {
    return;
  }

  const passwordSetting = await db.settings.get('syncPassword');
  const password = passwordSetting?.value || '';

  try {
    await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_event', id, password }),
    });
  } catch (error) {
    console.error('Delete sync failed:', error);
  }
}
