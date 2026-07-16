/**
 * Google Apps Script Web App to capture form submissions.
 * Handle POST request from the website.
 */
function doPost(e) {
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

  // Handle chatbot actions securely (proxying user query to Gemini API)
  if (parameter && parameter.action === "chat") {
    try {
      var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
      if (!apiKey) {
        return ContentService.createTextOutput(JSON.stringify({
          "result": "error",
          "error": "GEMINI_API_KEY is not configured in Script Properties."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
      
      var contents = [];
      if (parameter.history) {
        var parsedHistory = typeof parameter.history === 'string' ? JSON.parse(parameter.history) : parameter.history;
        if (Array.isArray(parsedHistory)) {
          contents = parsedHistory.map(function(item) {
            return {
              "role": item.role === "bot" ? "model" : "user",
              "parts": [{ "text": item.text }]
            };
          });
        }
      }
      
      if (parameter.message) {
        contents.push({
          "role": "user",
          "parts": [{ "text": parameter.message }]
        });
      }

      var payload = {
        "contents": contents,
        "systemInstruction": {
          "parts": [
            {
              "text": "You are Xelo, an elite growth AI consultant for Gexelo, a premium digital systems agency. Your goal is to guide visitors, answer technical questions, explain Gexelo's services, and encourage them to scale their business. \n\nServices details:\n- Launch Tier (starts at ₹25,000): 5-page conversion website, responsive layout, basic SEO, basic support.\n- Growth Tier (starts at ₹60,000): Custom UI/UX, CMS integration, blogs, advanced SEO, 90-day support.\n- Scale Tier (Custom Quote): AI chatbots, CRM & API integrations, ecommerce storefronts, automation, dedicated VIP support.\n\nGuidelines:\n- Your tone is professional, consultative, extremely intelligent, concise, and focused on scaling. \n- Keep responses short (under 3 sentences per paragraph, maximum 2 paragraphs) and structured in clear markdown (use bullets where appropriate).\n- Keep all descriptions aligned with digital engineering and growth. \n- Always encourage booking a free strategy consultation by using Gexelo's contact form, or scrolling down to get started."
            }
          ]
        }
      };

      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      var response = UrlFetchApp.fetch(url, options);
      var responseText = response.getContentText();
      var responseJson = JSON.parse(responseText);

      var reply = "";
      if (responseJson.candidates && responseJson.candidates[0] && responseJson.candidates[0].content && responseJson.candidates[0].content.parts[0]) {
        reply = responseJson.candidates[0].content.parts[0].text;
      } else {
        reply = "I'm experiencing a high volume of requests. How can I help you scale today?";
      }

      return ContentService.createTextOutput(JSON.stringify({
        "result": "success",
        "reply": reply
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        "result": "error",
        "error": err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

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
    var SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/1yG4tlVrCtuzfHyBzRkT1ztmmNr-HoCI25ivaGJFCjMI/edit?gid=0#gid=0";

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

    // Accept multiple common names for the mobile number field for maximum robustness
    var phone = parameter.phone || parameter.mobile || parameter.tel || parameter.number || parameter['mobile-number'] || parameter['phone-number'] || "";
    var service = parameter.service || "";
    var details = parameter.details || "";

    console.log("Recording row: Timestamp=" + timestamp + ", Name=" + name + ", Email=" + email + ", Phone=" + phone + ", Service=" + service + ", Details=" + details);

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
