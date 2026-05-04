/**
 * UNIT TESTS FOR BACKEND LOGIC
 * You can run these functions in the Google Apps Script editor to verify sync behavior.
 */

function runAllTests() {
  testBuildRow_Create();
  testBuildRow_UpdateStatus();
  testBuildRow_PartialUpdate();
  testProcessRowsForDelta();
  Logger.log('✅ All tests passed!');
}

function testProcessRowsForDelta() {
  const headers = ['syncid', 'type', 'timestamp', 'lastupdated'];
  const syncTime = 1000; // Only fetch rows > 1000
  
  const rows = [
    ['id-old', 'feed', 500, 500],             // Should be filtered out
    ['id-new', 'feed', 1500, 1500],           // Should be included
    ['id-formatted', 'feed', 2000, "2,000"], // Should be included (handling commas)
    ['id-fallback', 'feed', 3000, ""],        // Should be included (using timestamp fallback)
  ];
  
  const result = processRowsForDelta(headers, rows, syncTime);
  
  assertEqual(result.length, 3, 'Should include 3 rows (old row filtered out)');
  assertEqual(result[0].syncid, 'id-new', 'First included row check');
  assertEqual(result[1].lastupdated, 2000, 'Comma formatting should be stripped and returned as Number');
  assertEqual(result[2].syncid, 'id-fallback', 'Fallback to timestamp worked');
  assertEqual(result[2].lastupdated, "", 'Lastupdated should remain empty string as in the sheet');
}

function testBuildRow_Create() {
  const headers = ['syncid', 'type', 'timestamp', 'status', 'version', 'lastupdated'];
  const now = new Date('2026-05-04T12:00:00Z');
  const expectedTs = new Date('2026-05-04T10:00:00Z').getTime();
  
  const op = {
    syncId: 'test-123',
    payload: {
      type: 'feed',
      timestamp: expectedTs,
      quantity_ml: 120
    }
  };
  
  const row = buildRowData(headers, op, [], now);
  
  assertEqual(row[0], 'test-123', 'SyncID should match');
  assertEqual(row[1], 'feed', 'Type should match');
  assertEqual(row[2], expectedTs, 'Timestamp should be preserved as Number');
  assertEqual(row[3], 'ACTIVE', 'New rows should default to ACTIVE');
  assertEqual(row[5], now.getTime(), 'LastUpdated should be now as Number');
}

function testBuildRow_UpdateStatus() {
  const headers = ['syncid', 'type', 'timestamp', 'status', 'version', 'lastupdated'];
  const now = new Date('2026-05-04T13:00:00Z');
  const originalTs = new Date('2026-05-04T10:00:00Z').getTime();
  
  // Simulation of existing data in the sheet (All Numbers)
  const existingRow = ['test-123', 'feed', originalTs, 'ACTIVE', 1, new Date('2026-05-04T10:05:00Z').getTime()];
  
  // Partial update payload sent by deleteEvent()
  const op = {
    syncId: 'test-123',
    payload: {
      status: 'DELETED',
      version: 2
    }
  };
  
  const row = buildRowData(headers, op, existingRow, now);
  
  assertEqual(row[0], 'test-123', 'ID preserved');
  assertEqual(row[1], 'feed', 'Type should be preserved from existing row');
  assertEqual(row[2], originalTs, 'IMPORTANT: Original timestamp MUST be preserved on delete');
  assertEqual(row[3], 'DELETED', 'Status should change to DELETED');
  assertEqual(row[4], 2, 'Version should update');
  assertEqual(row[5], now.getTime(), 'LastUpdated updated to current sync time');
}

function testBuildRow_PartialUpdate() {
  const headers = ['syncid', 'type', 'quantity_ml', 'notes', 'lastupdated'];
  const existing = ['id-1', 'feed', 100, 'Original notes', new Date()];
  
  const op = {
    syncId: 'id-1',
    payload: { quantity_ml: 150 } // Update quantity only
  };
  
  const row = buildRowData(headers, op, existing);
  
  assertEqual(row[2], 150, 'Quantity updated');
  assertEqual(row[3], 'Original notes', 'Notes preserved from existing row');
}

/** 
 * Simple Assertion Helper 
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message} | Expected: ${expected} | Actual: ${actual}`);
  }
}
