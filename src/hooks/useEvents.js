import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncToCloud, deleteFromCloud } from '../utils/sync';

export function useEvents(type = null) {
  return useLiveQuery(
    () => {
      if (type) {
        return db.events.where('type').equals(type).reverse().sortBy('timestamp');
      }
      return db.events.orderBy('timestamp').reverse().toArray();
    },
    [type]
  );
}

export async function addEvent(eventData) {
  const fullEvent = {
    ...eventData,
    timestamp: eventData.timestamp || new Date().toISOString(),
    synced: false
  };
  const id = await db.events.add(fullEvent);
  
  // Background sync
  syncToCloud({ ...fullEvent, id });
  
  return id;
}

export async function updateEvent(id, changes) {
  await db.events.update(id, { ...changes, synced: false });
  const updated = await db.events.get(id);
  syncToCloud(updated);
  return id;
}

export async function deleteEvent(id) {
  await db.events.delete(id);
  deleteFromCloud(id);
}

export async function clearAllEvents() {
  return await db.events.clear();
}
