# BabyTrack Sync Issues Tracker

### 🔴 Critical Sync Bugs

- [x] **1. Duplicate Rows on Multi-Operation Sync (Backend)**
  * **File:** `backend.gs`
  * **Issue:** `handleSyncOperations` fails to update its `rowMap` after appending a new row. If a single sync batch contains multiple operations for the same `syncId` (e.g., CREATE then UPDATE), the backend will duplicate the row instead of updating the newly created one.

- [x] **2. Broken Timestamp Parsing (Backend)**
  * **File:** `backend.gs` (now `Code.gs`)
  * **Issue:** FIXED. The logic now handles raw numbers, ISO strings, and formatted strings (commas) robustly.

- [ ] **3. Settings Sync is "Fire and Forget" (Frontend)**
  * **File:** `src/hooks/useSettings.js`
  * **Issue:** Settings updates bypass the `syncQueue` and attempt an immediate `fetch`. If the user is offline, the settings are saved locally but dropped from the network, causing permanent desynchronization between devices.

### 🟡 Moderate Race Conditions & Edge Cases

- [ ] **4. Concurrent Sync Race Condition (Frontend)**
  * **File:** `src/hooks/useEvents.js` / `src/utils/sync.js`
  * **Issue:** Rapidly firing `addEvent` or `updateEvent` triggers multiple parallel `syncToCloud()` calls. They can concurrently read the exact same `syncQueue` operations and send duplicates to the backend.

- [ ] **5. Local Overwrite Glitch during "Sync Now" (Frontend)**
  * **File:** `src/utils/sync.js` (`fetchFromCloud`)
  * **Issue:** Running a manual fetch pulls remote data and immediately overwrites local data. If there are pending local operations in the `syncQueue` that haven't been uploaded yet, the UI will temporarily revert to the older server state.

- [ ] **6. Inconsistent `lastSync` Data Type (Frontend)**
  * **File:** `src/utils/sync.js`
  * **Issue:** `fetchFromCloud` saves timestamps as `Date.now()` (number), but `syncToCloud` still uses `new Date().toISOString()` (string). This creates a type mismatch in the IndexedDB `settings` table.
