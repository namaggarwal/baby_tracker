import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

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
  return await db.events.add({
    ...eventData,
    timestamp: eventData.timestamp || new Date().toISOString(),
    synced: false
  });
}

export async function updateEvent(id, changes) {
  return await db.events.update(id, { ...changes, synced: false });
}

export async function deleteEvent(id) {
  return await db.events.delete(id);
}

export async function clearAllEvents() {
  return await db.events.clear();
}
