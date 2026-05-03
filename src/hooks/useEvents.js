import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncToCloud } from '../utils/sync';

export function useEvents(type = null) {
  return useLiveQuery(
    () => {
      let collection = type ? db.events.where('type').equals(type) : db.events.toCollection();
      return collection
        .filter(e => e.status !== 'DELETED')
        .sortBy('timestamp')
        .then(arr => arr.reverse());
    },
    [type]
  );
}

export async function addEvent(eventData) {
  const fullEvent = {
    ...eventData,
    syncId: eventData.syncId || crypto.randomUUID(),
    timestamp: eventData.timestamp || Date.now(),
    status: 'ACTIVE',
    version: 1,
    synced: false
  };
  await db.events.put(fullEvent);
  
  await db.syncQueue.put({
    action: 'CREATE',
    syncId: fullEvent.syncId,
    payload: fullEvent,
    timestamp: Date.now()
  });
  
  // Background sync
  syncToCloud();
  
  return fullEvent.syncId;
}

export async function updateEvent(syncId, changes) {
  const existing = await db.events.get(syncId);
  const newVersion = (existing?.version || 0) + 1;
  const updated = { ...existing, ...changes, version: newVersion, synced: false };
  await db.events.put(updated);
  
  await db.syncQueue.put({
    action: 'UPDATE',
    syncId,
    payload: updated,
    timestamp: Date.now()
  });
  
  syncToCloud();
  return syncId;
}

export async function deleteEvent(syncId) {
  const existing = await db.events.get(syncId);
  const newVersion = (existing?.version || 0) + 1;
  const deletedEvent = { ...existing, status: 'DELETED', version: newVersion, synced: false };
  await db.events.put(deletedEvent);
  
  await db.syncQueue.put({
    action: 'UPDATE_STATUS',
    syncId,
    payload: { status: 'DELETED', version: newVersion },
    timestamp: Date.now()
  });
  
  syncToCloud();
}

export async function clearAllEvents() {
  await db.events.clear();
  await db.syncQueue.clear();
  await db.settings.put({ key: 'lastFetchTime', value: 0 });
  await db.settings.put({ key: 'lastSync', value: 0 });
}
