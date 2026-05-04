// Google Apps Script Backend for BabyTrack
// Save this as a Standalone Script or bound to your Spreadsheet

const EVENTS_SHEET = 'Events';
const SETTINGS_SHEET = 'Settings';
const PROD_SPREADSHEET_ID = '1sCCtw5lMPUT_HnFE64vePRTBychSdFwwvHcJd1smB3U';
const TEST_SPREADSHEET_ID = '1e2ZhPhIbNQ7aYwCSvOxdgCTXlFiegsE7sxNzfqqF_CQ';
const isTest = true;
const SPREADSHEET_ID = isTest ? TEST_SPREADSHEET_ID: PROD_SPREADSHEET_ID;

// Set a property named 'ACCESS_PASSWORD' in Project Settings > Script Properties
const ACCESS_PASSWORD = PropertiesService.getScriptProperties().getProperty('ACCESS_PASSWORD');

function doGet(e) {
  return ContentService.createTextOutput("BabyTrack API is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Auth Check
    if (data.password !== ACCESS_PASSWORD) {
      return createJsonResponse({ status: 'error', message: 'Unauthorized' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (data.type) {
      case 'fetch_delta':
        return handleFetchDelta(ss, data);
      case 'sync_operations':
        return handleSyncOperations(ss, data);
      case 'fetch_settings':
      case 'settings_update':
        return handleSettings(ss, data);
      default:
        return createJsonResponse({ status: 'error', message: 'Unknown type' });
    }
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.message });
  }
}

function handleFetchDelta(ss, data) {
  const sheet = ss.getSheetByName(EVENTS_SHEET);
  if (!sheet) return createJsonResponse([]);
  
  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) return createJsonResponse([]);
  
  const headers = sheetData[0].map(h => String(h).toLowerCase().replace(/\s+/g, ''));
  const syncTime = Number(data.lastSyncTime) || 0;
  const rows = sheetData.slice(1);
  
  const result = processRowsForDelta(headers, rows, syncTime);
  return createJsonResponse(result);
}

/**
 * Isolated function to process and filter rows for delta sync.
 * Testable in Code.test.gs.
 */
function processRowsForDelta(headers, rows, syncTime) {
  const lastUpdatedIdx = headers.indexOf('lastupdated');
  const timestampIdx = headers.indexOf('timestamp');
  const result = [];
  
  rows.forEach((row, rowIndex) => {
    const rawLU = lastUpdatedIdx >= 0 ? row[lastUpdatedIdx] : null;
    let rowTs = parseTs(rawLU);
    
    // Fallback to primary timestamp if lastupdated is missing
    if (rowTs === 0) {
      const rawTS = timestampIdx >= 0 ? row[timestampIdx] : null;
      rowTs = parseTs(rawTS);
    }
    
    if (syncTime === 0 || rowTs > syncTime) {
      let obj = {};
      headers.forEach((header, i) => {
        let val = row[i];
        
        // Ensure time fields are always clean numbers
        if (header === 'timestamp' || header === 'endtime' || header === 'lastupdated') {
          const clean = String(val || "").replace(/[^0-9]/g, "");
          const num = Number(clean);
          val = (!isNaN(num) && num > 0) ? num : val;
        }
        
        obj[header] = val;
      });
      result.push(obj);
    }
  });
  
  return result;
}

function handleSyncOperations(ss, data) {
  const sheet = ss.getSheetByName(EVENTS_SHEET);
  if (!sheet) return createJsonResponse({ status: 'error', message: 'Sheet not found' });
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).toLowerCase().replace(/\s+/g, ''));
  const syncIdIdx = headers.indexOf('syncid');
  
  const rowMap = new Map();
  for (let i = 1; i < values.length; i++) {
    rowMap.set(String(values[i][syncIdIdx]), i + 1);
  }
  
  let nextNewRowIndex = values.length + 1;
  const now = new Date();

  data.operations.forEach(op => {
    if (op.action === 'SETTINGS_UPDATE') {
      const sSheet = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET).appendRow(['Key', 'Value', 'Lastupdated']).getSheetValues();
      const sData = sSheet.getDataRange().getValues();
      const key = op.payload.key;
      const val = op.payload.value;
      const luTime = now.getTime();
      let found = false;
      for (let i = 1; i < sData.length; i++) {
        if (String(sData[i][0]) === String(key)) {
          sSheet.getRange(i + 1, 2, 1, 2).setValues([[val, luTime]]);
          found = true;
          break;
        }
      }
      if (!found) sSheet.appendRow([key, val, luTime]);
      return;
    }

    const rowIndex = rowMap.get(String(op.syncId));
    const existingRow = (rowIndex && rowIndex <= values.length) ? values[rowIndex - 1] : [];
    
    // Call our isolated builder function
    const newRow = buildRowData(headers, op, existingRow, now);

    if (rowIndex) {
      sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
      rowMap.set(String(op.syncId), nextNewRowIndex);
      nextNewRowIndex++;
    }
  });
  
  return createJsonResponse({ status: 'success' });
}

/**
 * Isolated function to construct a row. 
 * Can be tested in backend.test.gs without touching the sheet.
 */
function buildRowData(headers, op, existingRow = [], now = new Date()) {
  const payload = op.payload || {};
  
  return headers.map((header, i) => {
    // 1. Last Updated - Always set to current time of sync
    if (header === 'lastupdated') return now.getTime();
    
    // 2. Sync ID - From payload, op, or existing
    if (header === 'syncid') return payload.syncId || op.syncId || (existingRow[i] || '');

    // 3. Check for matching key in payload (case-insensitive)
    const payloadKey = Object.keys(payload).find(k => k.toLowerCase() === header);
    
    // 4. Specific handling for Timestamps (Plain Text Unix MS)
    if (header === 'timestamp' || header === 'endtime') {
      const val = (payloadKey !== undefined ? payload[payloadKey] : null) || existingRow[i];
      if (!val) return (header === 'timestamp' ? now.getTime() : '');
      return Number(val) || val;
    }

    // 5. Use payload value if provided
    if (payloadKey !== undefined && payload[payloadKey] !== null && payload[payloadKey] !== undefined) {
      let val = payload[payloadKey];
      // Numeric cleanup
      if (header === 'quantity_ml' || header === 'quantity') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
      }
      if (header === 'version') return parseInt(val) || 1;
      return val;
    }

    // 6. Special mapping for quantity vs quantity_ml aliases
    if (header === 'quantity' || header === 'quantity_ml') {
       const qKey = Object.keys(payload).find(k => k.toLowerCase() === 'quantity' || k.toLowerCase() === 'quantity_ml');
       if (qKey && payload[qKey] !== undefined && payload[qKey] !== null) {
         return parseInt(payload[qKey]) || payload[qKey];
       }
    }

    // 7. Preserve existing data for partial updates (e.g., DELETE just sends status)
    if (existingRow.length > i && existingRow[i] !== undefined && existingRow[i] !== null && existingRow[i] !== '') {
      return existingRow[i];
    }

    // 8. Fallback defaults for brand new rows
    if (header === 'status') return 'ACTIVE';
    if (header === 'version') return 1;
    
    return '';
  });
}

function handleSettings(ss, data) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet && data.type === 'fetch_settings') return createJsonResponse([]);

  if (data.type === 'settings_update') {
    // Legacy support for direct settings_update (if still used)
    // In new version, this is handled in handleSyncOperations via SETTINGS_UPDATE action
    return createJsonResponse({ status: 'error', message: 'Use sync_operations for settings updates' });
  } else {
    const sheetData = sheet.getDataRange().getValues();
    if (sheetData.length <= 1) return createJsonResponse([]);
    
    const headers = sheetData[0].map(h => String(h).toLowerCase().replace(/\s+/g, ''));
    const luIdx = headers.indexOf('lastupdated');
    const syncTime = Number(data.lastSyncTime) || 0;
    
    const rows = sheetData.slice(1);
    const result = [];
    
    rows.forEach(row => {
      const rowLU = luIdx >= 0 ? parseTs(row[luIdx]) : 0;
      if (syncTime === 0 || rowLU > syncTime) {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        result.push(obj);
      }
    });
    return createJsonResponse(result);
  }
}

function parseTs(v) {
  if (typeof v === 'number' && v > 0) return v;
  if (!v) return 0;
  
  // 1. Try standard numeric parsing (works for "1714838400000")
  const n = Number(v);
  if (!isNaN(n) && n > 1000000000) return n; // Ensure it's a large enough number to be a timestamp
  
  // 2. Try standard Date parsing (works for "2026-05-04")
  const d = new Date(v).getTime();
  if (!isNaN(d) && d > 0) return d;
  
  // 3. Fallback: Strip formatting characters (works for "1,714,838,400,000")
  const clean = String(v).replace(/[^0-9]/g, "");
  const n2 = Number(clean);
  if (!isNaN(n2) && n2 > 1000000000) return n2;
  
  return 0;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
