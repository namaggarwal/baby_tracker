import Dexie from 'dexie';

// New DB name forces a clean start with syncId as primary key
export const db = new Dexie('BabyTrackDB_v2');

db.version(1).stores({
  events: 'syncId, type, timestamp, synced',
  settings: 'key'
});
