import { CONFIG } from '../config';
import { db } from '../db';

export async function syncToCloud(data, isSettings = false) {
  if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('REPLACE_WITH_YOUR_URL')) {
    return;
  }

  const passwordSetting = await db.settings.get('syncPassword');
  const password = passwordSetting?.value || '';

  const payload = isSettings 
    ? { type: 'settings_update', settings: data, password }
    : { ...data, password };

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
      const formattedEvents = remoteEvents.map(e => ({
        ...e,
        quantity_ml: e.quantity ? parseInt(e.quantity) : undefined,
        endTime: e.endtime || undefined,
        timestamp: e.timestamp
      }));
      await db.events.bulkPut(formattedEvents);
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
