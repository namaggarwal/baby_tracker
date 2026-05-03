import Dexie from 'dexie';

// New DB name forces a clean start with syncId as primary key
export const db = new Dexie('BabyTrackDB');

db.version(1).stores({
  events: 'syncId, type, timestamp, synced',
  settings: 'key'
});

db.version(2).stores({
  events: 'syncId, type, timestamp, synced',
  settings: 'key',
  syncQueue: '++id, action, syncId, timestamp'
});
