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
    syncId: eventData.syncId || crypto.randomUUID(),
    timestamp: eventData.timestamp || Date.now(),
    synced: false
  };
  await db.events.put(fullEvent);
  
  // Background sync
  syncToCloud(fullEvent);
  
  return fullEvent.syncId;
}

export async function updateEvent(syncId, changes) {
  await db.events.update(syncId, { ...changes, synced: false });
  const updated = await db.events.get(syncId);
  syncToCloud(updated);
  return syncId;
}

export async function deleteEvent(syncId) {
  await db.events.delete(syncId);
  deleteFromCloud(syncId);
}


export async function clearAllEvents() {
  return await db.events.clear();
}
