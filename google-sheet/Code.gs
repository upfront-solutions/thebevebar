/**
 * The BeveBar: quote leads -> Google Sheet
 *
 * Setup (5 minutes). Tip: use a private/incognito window signed into ONE Google account only.
 * 1. Make a new Google Sheet (e.g. "BeveBar Leads").
 * 2. Extensions > Apps Script. Delete what's there and paste this whole file. Save (disk icon).
 * 3. In the toolbar's function menu pick "setup", then click Run.
 *    Approve: Review permissions > pick your account > Advanced > Go to (project name) > Allow.
 *    The sheet gets its header row. This is the only approval step.
 * 4. Deploy > New deployment > gear icon > "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy.
 * 5. Copy the Web app URL (ends in /exec) and paste it into js/config.js as sheetUrl,
 *    then upload that file to GitHub.
 *
 * Each person gets ONE row. The row is created when they finish the contact page
 * (Status "Viewed estimate") and updated to "Quote sent" if they send it.
 */

var COLUMNS = [
  'Last updated', 'Status', 'Name', 'Email', 'Phone', 'Event type', 'Event date', 'Start time', 'End time', 'Hours',
  'Guests', 'Address', 'Miles from Anaheim', 'Indoor/Outdoor', 'Service', 'Cup size', 'Package', 'Custom cups',
  'Baristas', 'Keg swaps', 'ParTea Jugs', 'Add On Bundles', 'Customizations', 'Heard about us', 'Notes',
  'Estimate total', 'Breakdown', 'Page', 'Lead ID'
];
var KEYS = [
  'updated', 'status', 'name', 'email', 'phone', 'eventType', 'eventDate', 'startTime', 'endTime', 'hours',
  'guests', 'address', 'milesFromAnaheim', 'eventSpace', 'serviceType', 'cupSize', 'package', 'customCups',
  'baristas', 'kegSwaps', 'partea_jugs', 'addon_bundles', 'customizations', 'howHeard', 'notes',
  'estimateTotal', 'breakdown', 'page', 'leadId'
];

// Run this once from the editor (step 3) to approve access and add the header row.
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    d.updated = new Date();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }
    var row = KEYS.map(function (k) { return d[k] === undefined ? '' : d[k]; });
    var idCol = KEYS.indexOf('leadId') + 1;
    var last = sheet.getLastRow();
    var found = -1;
    if (last > 1) {
      var ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === d.leadId) { found = i + 2; break; }
    }
    if (found > 0) {
      // never downgrade "Quote sent" back to an earlier status
      var prev = sheet.getRange(found, KEYS.indexOf('status') + 1).getValue();
      if (prev === 'Quote sent') row[KEYS.indexOf('status')] = 'Quote sent';
      sheet.getRange(found, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
