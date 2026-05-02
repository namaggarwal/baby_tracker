import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

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
    },
    resetSettings: async () => {
      await db.settings.clear();
    }
  };
}
