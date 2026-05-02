import Dexie from 'dexie';

export const db = new Dexie('BabyTrackDB');

db.version(1).stores({
  events: '++id, type, timestamp, synced',
  settings: 'key'
});
