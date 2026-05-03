// Google Apps Script Backend for BabyTrack
// Save this as a Standalone Script or bound to your Spreadsheet

const EVENTS_SHEET = 'Events';
const SETTINGS_SHEET = 'Settings';
const SPREADSHEET_ID = '1sCCtw5lMPUT_HnFE64vePRTBychSdFwwvHcJd1smB3U';

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
  const displayData = sheet.getDataRange().getDisplayValues();
  if (sheetData.length <= 1) return createJsonResponse([]);
  
  const headers = sheetData[0].map(h => String(h).toLowerCase().replace(/\s+/g, ''));
  const lastUpdatedIdx = headers.indexOf('lastupdated');
  const timestampIdx = headers.indexOf('timestamp');
  
  const syncTime = Number(data.lastSyncTime) || 0;
  const rows = sheetData.slice(1);
  const displayRows = displayData.slice(1);
  
  // Important: Use a standard array for the result
  const result = [];
  
  rows.forEach((row, rowIndex) => {
    const rawLU = lastUpdatedIdx >= 0 ? row[lastUpdatedIdx] : null;
    const displayLU = lastUpdatedIdx >= 0 ? displayRows[rowIndex][lastUpdatedIdx] : null;
    let rowTs = parseTs(rawLU, displayLU);
    
    if (rowTs === 0) {
      const rawTS = timestampIdx >= 0 ? row[timestampIdx] : null;
      const displayTS = timestampIdx >= 0 ? displayRows[rowIndex][timestampIdx] : null;
      rowTs = parseTs(rawTS, displayTS);
    }
    
    if (syncTime === 0 || rowTs > syncTime) {
      let obj = {};
      headers.forEach((header, i) => {
        const val = row[i];
        if (val instanceof Date) {
          const time = val.getTime();
          obj[header] = isNaN(time) ? displayRows[rowIndex][i] : time;
        } else {
          obj[header] = val;
        }
      });
      result.push(obj);
    }
  });
  
  return createJsonResponse(result);
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
  
  data.operations.forEach(op => {
    const payload = op.payload;
    const rowIndex = rowMap.get(String(op.syncId));
    const now = Date.now();
    
    let existingRow = [];
    if (rowIndex) {
      existingRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    }

    const newRow = headers.map((header, i) => {
      // 1. Always update LastUpdated
      if (header === 'lastupdated') return now;
      
      // 2. Identify the field in the payload (case-insensitive)
      const payloadKey = Object.keys(payload).find(k => k.toLowerCase() === header);
      if (payloadKey !== undefined) return payload[payloadKey];
      
      // Special mapping for quantity vs quantity_ml
      if (header === 'quantity' || header === 'quantity_ml') {
        const qKey = Object.keys(payload).find(k => k.toLowerCase() === 'quantity' || k.toLowerCase() === 'quantity_ml');
        if (qKey) return payload[qKey];
      }

      // 3. For existing rows, preserve EVERYTHING ELSE exactly as is
      if (rowIndex && existingRow[i] !== undefined && existingRow[i] !== null && existingRow[i] !== '') {
        return existingRow[i];
      }

      // 4. Fallback defaults ONLY for brand new rows
      if (header === 'syncid') return payload.syncId || op.syncId;
      if (header === 'status') return payload.status || 'ACTIVE';
      if (header === 'timestamp') return payload.timestamp || now;
      if (header === 'version') return payload.version || 1;
      
      return '';
    });

    if (rowIndex) {
      sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }
  });
  
  return createJsonResponse({ status: 'success' });
}

function handleSettings(ss, data) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet && data.type === 'fetch_settings') return createJsonResponse([]);

  if (data.type === 'settings_update') {
    if (!sheet) {
       ss.insertSheet(SETTINGS_SHEET).appendRow(['Key', 'Value']);
    } else {
       sheet.clear();
       sheet.appendRow(['Key', 'Value']);
    }
    const targetSheet = ss.getSheetByName(SETTINGS_SHEET);
    Object.keys(data.settings).forEach(key => {
      targetSheet.appendRow([key, data.settings[key]]);
    });
    return createJsonResponse({ status: 'success' });
  } else {
    const sheetData = sheet.getDataRange().getValues();
    if (sheetData.length <= 1) return createJsonResponse([]);
    const headers = sheetData[0];
    const rows = sheetData.slice(1);
    const result = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header.toLowerCase()] = row[i];
      });
      return obj;
    });
    return createJsonResponse(result);
  }
}

function parseTs(v, displayV) {
  if (v instanceof Date && !isNaN(v.getTime())) return v.getTime();
  const clean = (val) => String(val || "").replace(/[^0-9]/g, "");
  let n = Number(clean(v));
  if (n > 0) return n;
  let n2 = Number(clean(displayV));
  if (n2 > 0) return n2;
  let d = new Date(v).getTime();
  if (!isNaN(d) && d > 0) return d;
  let d2 = new Date(displayV).getTime();
  return isNaN(d2) ? 0 : d2;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
