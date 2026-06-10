// DR.PRINT — Google Apps Script Backend
// ⚠️  After pasting: Deploy → Manage Deployments → pencil → New Version → Deploy
// After first deploy, run fixSheetHeaders() once manually to add headers to existing sheets

var CONFIG = {
  NOTIFY_EMAIL:    'drprint.3dwork@gmail.com',
  SHEET_ID:        '1sbwHc558ryWlydU2a_UJdVFlfanNxEsAU9xkC_hV_Wk',
  DRIVE_FOLDER_ID: '10FynrdveH-em7KtwNr4y6jgN6gJNp3zz',
};

// ── Entry points ──────────────────────────────────────────────────
function doGet(e) {
  if (!e || !e.parameter || !e.parameter.payload) {
    return jsonOut('{"status":"running"}', '');
  }
  try {
    var d  = JSON.parse(e.parameter.payload);
    var cb = e.parameter.callback || '';
    if (d.type === 'get_reviews')   return getReviews(cb);
    if (d.type === 'submit_review') { handleReview(d); return jsonOut('{"ok":true}', cb); }
    processData(d);
  } catch(err) { Logger.log('GET ERR: ' + err); }
  return jsonOut('{"ok":true}', '');
}

function doPost(e) {
  try {
    var raw = (e.postData && e.postData.contents) ? e.postData.contents : '{}';
    processData(JSON.parse(raw));
  } catch(err) { Logger.log('POST ERR: ' + err); }
  return jsonOut('{"ok":true}', '');
}

function processData(d) {
  var type = d.type || '';
  if      (type === 'file_upload')   handleFileUpload(d);
  else if (type === 'custom_order')  handleCustomOrder(d);
  else if (type === 'shop_order')    handleShopOrder(d);
  else if (type === 'contact')       handleContact(d);
  else if (type === 'submit_review') handleReview(d);
}

// ── FILE UPLOAD ───────────────────────────────────────────────────
// Saves files to Drive + sends ONE email with ALL print settings + file attachments
// NO second email is sent when has_files = true in handleCustomOrder
function handleFileUpload(d) {
  try {
    var files = d.files || [];
    var o     = d.order || {};
    var root  = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    var folderName = (o.name || 'Customer') + ' — ' + (o.material || '') + ' — ' + ts();
    var folder     = root.createFolder(folderName);
    var folderUrl  = 'https://drive.google.com/drive/folders/' + folder.getId();

    var emailBlobs = [], fileNames = [];
    for (var i = 0; i < files.length; i++) {
      var f     = files[i];
      var bytes = Utilities.base64Decode(f.data);
      folder.createFile(Utilities.newBlob(bytes, f.mimetype || 'application/octet-stream', f.filename));
      emailBlobs.push(Utilities.newBlob(bytes, f.mimetype || 'application/octet-stream', f.filename));
      fileNames.push(f.filename);
    }

    // ONE complete email — files attached + all print settings
    var body =
      '━━ CUSTOMER ━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Name:          ' + (o.name         || '—') + '\n' +
      'Email:         ' + (o.email        || '—') + '\n' +
      'Phone:         ' + (o.phone        || '—') + '\n\n' +
      '━━ PRINT SETTINGS ━━━━━━━━━━━━━━━━\n' +
      'Material:      ' + (o.material     || '—') + '\n' +
      'Color:         ' + (o.color        || '—') + '\n' +
      'Infill:        ' + (o.infill_pct   || '—') + ' — ' + (o.infill_pattern || '—') + '\n' +
      'Walls:         ' + (o.walls        || '—') + '\n' +
      'Layer Height:  ' + (o.layer_height || '—') + '\n' +
      'Quantity:      ' + (o.quantity     || '—') + '\n' +
      'Notes:         ' + (o.notes        || '—') + '\n\n' +
      '━━ FILES (' + fileNames.length + ') ━━━━━━━━━━━━━━━━━━━━\n' +
      fileNames.join('\n') + '\n\n' +
      'Drive Folder:  ' + folderUrl;

    GmailApp.sendEmail(
      CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] ' + (o.name || 'Customer') + ' — ' + (o.material || '') + ' — ' + fileNames.length + ' file' + (fileNames.length > 1 ? 's' : ''),
      body,
      {
        attachments: emailBlobs,
        replyTo:     o.email || CONFIG.NOTIFY_EMAIL,
        name:        o.name  || 'Customer',
      }
    );

    Logger.log('File upload done: ' + fileNames.join(', '));
  } catch(err) {
    Logger.log('FILE UPLOAD ERR: ' + err.toString());
  }
}

// ── CUSTOM ORDER ──────────────────────────────────────────────────
// Always writes to sheet. Only sends email if NO files were attached.
function handleCustomOrder(d) {
  // Write to sheet
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = getOrCreateSheet(ss, 'Custom Orders',
      ['Timestamp','Name','Email','Phone','Material','Color','Infill %','Infill Pattern','Walls','Layer Height','Qty','Notes','Files','Status']);
    s.appendRow([
      ts(), d.name||'', d.email||'', d.phone||'', d.material||'', d.color||'',
      d.infill_pct||'', d.infill_pattern||'', d.walls||'', d.layer_height||'',
      d.quantity||'', d.notes||'', d.files||'None', 'New'
    ]);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }

  // Skip email if files already sent via handleFileUpload — avoids double email
  if (d.has_files) {
    Logger.log('Skipping order email — file upload email already sent');
    return;
  }

  // No files — send order email with all print settings
  try {
    var body =
      '━━ CUSTOMER ━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Name:          ' + (d.name         || '—') + '\n' +
      'Email:         ' + (d.email        || '—') + '\n' +
      'Phone:         ' + (d.phone        || '—') + '\n\n' +
      '━━ PRINT SETTINGS ━━━━━━━━━━━━━━━━\n' +
      'Material:      ' + (d.material     || '—') + '\n' +
      'Color:         ' + (d.color        || '—') + '\n' +
      'Infill:        ' + (d.infill_pct   || '—') + ' — ' + (d.infill_pattern || '—') + '\n' +
      'Walls:         ' + (d.walls        || '—') + '\n' +
      'Layer Height:  ' + (d.layer_height || '—') + '\n' +
      'Quantity:      ' + (d.quantity     || '—') + '\n' +
      'Notes:         ' + (d.notes        || '—') + '\n\n' +
      'Files:         None';
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Custom Order (no file) — ' + (d.material || '') + ' — ' + (d.name || ''),
      body);
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── SHOP ORDER ────────────────────────────────────────────────────
function handleShopOrder(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = getOrCreateSheet(ss, 'Shop Orders',
      ['Timestamp','Name','Phone','UPI Ref','Total','Items','Status']);
    var iStr = Array.isArray(d.items)
      ? d.items.map(function(i){ return i.name + ' x' + i.qty; }).join(', ')
      : String(d.items || '');
    s.appendRow([ts(), d.name||'', d.phone||'', d.transaction_id||'', 'Rs.'+(d.total||''), iStr, 'Payment Received']);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }
  try {
    var items = Array.isArray(d.items)
      ? d.items.map(function(i){ return i.name + ' x' + i.qty + ' @ Rs.' + i.price; }).join('\n')
      : String(d.items || '');
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Shop Order Rs.' + (d.total||'') + ' — ' + (d.name||''),
      '━━ CUSTOMER ━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Name:     ' + (d.name||'') + '\n' +
      'Phone:    ' + (d.phone||'') + '\n' +
      'UPI Ref:  ' + (d.transaction_id||'') + '\n' +
      'Total:    Rs.' + (d.total||'') + '\n\n' +
      '━━ ITEMS ━━━━━━━━━━━━━━━━━━━━━━━━━\n' + items);
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── CONTACT ───────────────────────────────────────────────────────
function handleContact(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = getOrCreateSheet(ss, 'Contact',
      ['Timestamp','Name','Email','Project Type','Material','Description','Status']);
    s.appendRow([ts(), d.name||'', d.email||'', d.project_type||'', d.material||'', d.description||'', 'New']);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }
  try {
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Enquiry — ' + (d.project_type||'') + ' — ' + (d.name||''),
      '━━ CUSTOMER ━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Name:    ' + (d.name||'') + '\n' +
      'Email:   ' + (d.email||'') + '\n' +
      'Type:    ' + (d.project_type||'') + '\n' +
      'Material:' + (d.material||'') + '\n\n' +
      '━━ MESSAGE ━━━━━━━━━━━━━━━━━━━━━━━\n' + (d.description||''));
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── REVIEWS — Submit ──────────────────────────────────────────────
function handleReview(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = getOrCreateSheet(ss, 'Reviews',
      ['Timestamp','Name','Email','Role','Rating','Message','Date','Approved']);
    s.appendRow([ts(), d.name||'', d.email||'', d.role||'', d.rating||5, d.message||'', d.date||ts(), 'Yes']);
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] New Review — ' + (d.name||'Someone') + ' (' + (d.rating||5) + '★)',
      'Name:    ' + (d.name||'') + '\nEmail:   ' + (d.email||'') +
      '\nRole:    ' + (d.role||'—') + '\nRating:  ' + (d.rating||5) + '/5' +
      '\n\nReview:\n' + (d.message||''));
  } catch(err) { Logger.log('REVIEW ERR: ' + err.toString()); }
}

// ── REVIEWS — Fetch ───────────────────────────────────────────────
function getReviews(cb) {
  try {
    var ss   = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s    = ss.getSheetByName('Reviews');
    if (!s) return jsonOut('{"reviews":[]}', cb);
    var rows = s.getDataRange().getValues();
    if (rows.length <= 1) return jsonOut('{"reviews":[]}', cb);
    var reviews = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (String(r[7]).toLowerCase().trim() !== 'yes') continue;
      reviews.push({ name: String(r[1]||''), email: String(r[2]||''), role: String(r[3]||''), rating: Number(r[4]||5), message: String(r[5]||''), date: String(r[6]||'') });
    }
    reviews.reverse();
    return jsonOut(JSON.stringify({ reviews: reviews }), cb);
  } catch(err) {
    Logger.log('GET REVIEWS ERR: ' + err);
    return jsonOut('{"reviews":[]}', cb);
  }
}

// ── HELPERS ───────────────────────────────────────────────────────

// Gets sheet by name, creates it with bold headers if it doesn't exist
function getOrCreateSheet(ss, name, headers) {
  var s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.appendRow(headers);
    s.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#111111')
      .setFontColor('#ffffff');
    s.setFrozenRows(1);
  }
  return s;
}

// ⬇ Run this ONCE manually after deploying to fix headers on existing sheets
function fixSheetHeaders() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  var sheets = {
    'Custom Orders': ['Timestamp','Name','Email','Phone','Material','Color','Infill %','Infill Pattern','Walls','Layer Height','Qty','Notes','Files','Status'],
    'Shop Orders':   ['Timestamp','Name','Phone','UPI Ref','Total','Items','Status'],
    'Contact':       ['Timestamp','Name','Email','Project Type','Material','Description','Status'],
    'Reviews':       ['Timestamp','Name','Email','Role','Rating','Message','Date','Approved'],
  };

  for (var name in sheets) {
    var s = ss.getSheetByName(name);
    if (!s) continue;
    var headers = sheets[name];
    var firstRow = s.getRange(1, 1, 1, headers.length).getValues()[0];
    var isEmpty  = firstRow.every(function(c){ return c === '' || c === null; });
    var isNumber = (typeof firstRow[0] === 'number');

    if (isEmpty || isNumber) {
      // No headers — insert a new row at top
      s.insertRowBefore(1);
      s.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      // Overwrite existing row 1 with correct headers
      s.getRange(1, 1, 1, s.getLastColumn()).setValues([headers.concat(Array(Math.max(0, s.getLastColumn() - headers.length)).fill(''))]);
    }
    s.getRange(1, 1, 1, s.getLastColumn())
      .setFontWeight('bold')
      .setBackground('#111111')
      .setFontColor('#ffffff');
    s.setFrozenRows(1);
    Logger.log('Fixed headers for: ' + name);
  }
  Logger.log('All sheet headers fixed!');
}

function ts() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss');
}
function jsonOut(t, cb) {
  if (cb && cb.length > 0) {
    return ContentService.createTextOutput(cb + '(' + t + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(t)
    .setMimeType(ContentService.MimeType.JSON);
}
