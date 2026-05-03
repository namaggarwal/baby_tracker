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
      // Sync all settings together for consistency
      const updatedArray = await db.settings.toArray();
      const allSettings = {};
      updatedArray.forEach(s => {
        allSettings[s.key] = s.value;
      });
      syncToCloud(allSettings, true);
    },
    resetSettings: async () => {
      await db.settings.clear();
    }
  };
}
