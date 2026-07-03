/**
 * Google Apps Script Web App to capture form submissions.
 * Handle POST request from the website.
 */
function doPost(e) {
  // Get active sheet (make sure columns are: Timestamp, Name, Email, Service, Details)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    var parameter = e.parameter;

    // In case the data is sent as raw JSON instead of form-urlencoded
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
    var service = parameter.service || "";
    var details = parameter.details || "";

    // Append to sheet
    sheet.appendRow([timestamp, name, email, service, details]);

    // Return success response with CORS headers enabled
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Submission recorded successfully"
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

/**
 * Handle OPTIONS preflight requests for CORS if sent by some browsers
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
