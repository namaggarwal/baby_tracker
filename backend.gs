// Google Apps Script Backend for BabyTrack
// Save this as a Standalone Script or bound to your Spreadsheet

const EVENTS_SHEET = 'Events';
const SETTINGS_SHEET = 'Settings';
const SPREADSHEET_ID = '1sCCtw5lMPUT_HnFE64vePRTBychSdFwwvHcJd1smB3U';

// Fetch password from Script Properties (Project Settings > Script Properties)
// Set a property named 'ACCESS_PASSWORD' with your secret key
const ACCESS_PASSWORD = PropertiesService.getScriptProperties().getProperty('ACCESS_PASSWORD');

function doGet(e) {
  // doGet is now just a health check, no sensitive data exposed
  return ContentService.createTextOutput("BabyTrack API is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.password !== ACCESS_PASSWORD) {
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle "Fetch" requests via POST for security
    if (data.type === 'fetch_events' || data.type === 'fetch_settings') {
      const sheetName = data.type === 'fetch_settings' ? SETTINGS_SHEET : EVENTS_SHEET;
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      
      const sheetData = sheet.getDataRange().getValues();
      const displayData = sheet.getDataRange().getDisplayValues();
      if (sheetData.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      
      const headers = sheetData[0];
      const rows = sheetData.slice(1);
      const displayRows = displayData.slice(1);
      const result = rows.map((row, rowIndex) => {
        let obj = {};
        headers.forEach((header, i) => {
          const val = row[i];
          const key = header.toLowerCase().replace(/\s+/g, '');
          // Convert Date objects (from date-formatted cells) to Unix ms
          if (val instanceof Date) {
            const time = val.getTime();
            if (isNaN(time)) {
              // If it's an invalid date (caused by Google Sheets overflow), use the display string
              obj[key] = displayRows[rowIndex][i];
            } else {
              obj[key] = time;
            }
          } else {
            obj[key] = val;
          }
        });
        return obj;
      });
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    // Handle delete
    if (data.type === 'delete_event') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(EVENTS_SHEET);
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(data.syncId || data.id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheetName = data.type === 'settings_update' ? SETTINGS_SHEET : EVENTS_SHEET;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (data.type === 'settings_update') {
      sheet.clear();
      sheet.appendRow(['Key', 'Value']);
      Object.keys(data.settings).forEach(key => {
        sheet.appendRow([key, data.settings[key]]);
      });
    } else {
      // 1. Check if an entry with this syncId already exists
      const idToFind = data.syncId || data.id;
      let rowIndex = -1;
      
      if (idToFind) {
        const values = sheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]) === String(idToFind)) {
            rowIndex = i + 1;
            break;
          }
        }
      }
      
      const rowData = [
        data.syncId || data.id || Utilities.getUuid(),
        data.timestamp || Date.now(),
        data.endTime || '',
        data.type,
        data.subtype || '',
        data.duration || '',
        data.notes || '',
        data.size || '',
        data.quantity_ml || '',
        data.side || '',
        data.dosage || ''
      ];

      if (rowIndex > 0) {
        // Update existing row
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Add new row
        sheet.appendRow(rowData);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
