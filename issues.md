# BabyTrack Sync Issues Tracker

### 🔴 Critical Sync Bugs

- [x] **1. Duplicate Rows on Multi-Operation Sync (Backend)**
  * **File:** `backend.gs`
  * **Issue:** `handleSyncOperations` fails to update its `rowMap` after appending a new row. If a single sync batch contains multiple operations for the same `syncId` (e.g., CREATE then UPDATE), the backend will duplicate the row instead of updating the newly created one.

- [x] **2. Broken Timestamp Parsing (Backend)**
  * **File:** `backend.gs` (now `Code.gs`)
  * **Issue:** FIXED. The logic now handles raw numbers, ISO strings, and formatted strings (commas) robustly.

- [x] **3. Settings Sync is "Fire and Forget" (Frontend)**
  * **File:** `src/hooks/useSettings.js`
  * **Issue:** FIXED. Settings updates are now added to the `syncQueue` and the backend handles them row-by-row with delta sync support.

### 🟡 Moderate Race Conditions & Edge Cases

- [x] **4. Concurrent Sync Race Condition (Frontend)**
  * **File:** `src/utils/sync.js`
  * **Issue:** FIXED. Added an `isSyncing` lock to prevent multiple parallel sync/fetch calls.

- [x] **5. Local Overwrite Glitch during "Sync Now" (Frontend)**
  * **File:** `src/utils/sync.js`
  * **Issue:** FIXED. Fetch logic now checks the `syncQueue` and skips updating any event that has a pending local edit, protecting un-synced data.

- [x] **6. Inconsistent `lastSync` Data Type (Frontend)**
  * **File:** `src/utils/sync.js`
  * **Issue:** FIXED. Unified all sync timestamps to use `Date.now()` (number) for consistency.
