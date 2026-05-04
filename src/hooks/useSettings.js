import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncToCloud } from '../utils/sync';

export function useSettings() {
  const settingsArray = useLiveQuery(() => db.settings.toArray());
  
  const settings = {};
  if (settingsArray) {
    settingsArray.forEach(s => {
      settings[s.key] = s.value;
    });
  }
  
  return {
    settings,
    updateSetting: async (key, value) => {
      await db.settings.put({ key, value });
      
      // Add to sync queue instead of direct fire-and-forget sync
      await db.syncQueue.put({
        action: 'SETTINGS_UPDATE',
        syncId: `setting-${key}`,
        payload: { key, value },
        timestamp: Date.now()
      });
      
      syncToCloud();
    },
    resetSettings: async () => {
      // Capture the password to preserve it
      const password = await db.settings.get('syncPassword');
      await db.settings.clear();
      // Restore the password if it existed
      if (password) await db.settings.put(password);
    }
  };
}
