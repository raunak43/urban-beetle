// Paste this into the Google Sheet's Extensions → Apps Script, then Deploy → New deployment → Web app
// (Execute as: Me, Who has access: Anyone). Put the web app URL in SHEETS_WEBHOOK_URL on Vercel.
// The website (lib/sheets.ts) posts each new enquiry here, and it's added as a row on the first sheet.

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // two enquiries at once mustn't overwrite each other
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(data.columns);
      sheet.getRange(1, 1, 1, data.columns.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    // A leading = + - or @ would make the sheet treat a client's answer as a formula, so it's quoted.
    var safe = data.row.map(function (v) {
      v = String(v == null ? "" : v);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sheet.appendRow(safe);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
