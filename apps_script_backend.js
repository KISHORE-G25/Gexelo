/**
 * Google Apps Script Web App to capture form submissions.
 * Handle POST request from the website.
 */
function doPost(e) {
  var sheet;

  try {
    // Attempt 1: Try to get the active sheet (works if script is container-bound to a Google Sheet)
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSpreadsheet) {
      sheet = activeSpreadsheet.getActiveSheet();
    }
  } catch (err) {
    // If it's a standalone script, getActiveSpreadsheet() might throw an error or return null
  }

  // Attempt 2: Standalone fallback
  if (!sheet) {
    // NOTE: If you are using a standalone script, replace the string below with your Spreadsheet ID:
    // e.g. "1vXXXXXXXX_XXXXXXX_XXXXXXXX" (from the spreadsheet URL)
    var SPREADSHEET_ID = "1yG4tlVrCtuzfHyBzRkT1ztmmNr-HoCI25ivaGJFCjMI";

    // Auto-extract ID if full URL is provided
    if (SPREADSHEET_ID && SPREADSHEET_ID.indexOf("docs.google.com") !== -1) {
      var matches = SPREADSHEET_ID.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (matches && matches[1]) {
        SPREADSHEET_ID = matches[1];
      }
    }

    try {
      if (SPREADSHEET_ID && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE") {
        sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
      }
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        "result": "error",
        "error": "Could not access the spreadsheet. SPREADSHEET_ID may be invalid: " + err.toString()
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Error out if we couldn't resolve any sheet
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": "Spreadsheet not found. If this is a standalone script, open apps_script_backend.js and configure SPREADSHEET_ID."
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var parameter = e.parameter;

    // In case the data is sent as raw JSON
    if (e.postData && e.postData.contents) {
      try {
        var json = JSON.parse(e.postData.contents);
        parameter = json;
      } catch (err) {
        // Not a JSON string, fallback to standard parameters
      }
    }

    // Map incoming parameters to sheet columns
    var timestamp = new Date();
    var name = parameter.name || "";
    var email = parameter.email || "";
    var phone = parameter.phone || "";
    var service = parameter.service || "";
    var details = parameter.details || "";

    // Append to sheet (Make sure your Google Sheet has columns: Timestamp, Name, Email, Phone, Service, Details)
    sheet.appendRow([timestamp, name, email, phone, service, details]);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Submission recorded successfully"
    }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS preflight requests for CORS if sent by some browsers
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
