// DR.PRINT — Google Apps Script Backend
// Deploy → Manage Deployments → pencil → New Version → Deploy

var CONFIG = {
  NOTIFY_EMAIL:    'drprint.3dwork@gmail.com',
  SHEET_ID:        '1sbwHc558ryWlydU2a_UJdVFlfanNxEsAU9xkC_hV_Wk',
  DRIVE_FOLDER_ID: '10FynrdveH-em7KtwNr4y6jgN6gJNp3zz',
};

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.payload) {
    return out('{"status":"running"}');
  }
  try { processData(JSON.parse(e.parameter.payload)); }
  catch(err) { Logger.log('GET ERR: ' + err); }
  return out('{"ok":true}');
}

function doPost(e) {
  try {
    var raw = (e.postData && e.postData.contents) ? e.postData.contents : '{}';
    Logger.log('POST: ' + raw.substring(0, 200));
    processData(JSON.parse(raw));
  } catch(err) { Logger.log('POST ERR: ' + err); }
  return out('{"ok":true}');
}

function processData(d) {
  var type = d.type || '';
  if      (type === 'file_upload')  handleFileUpload(d);
  else if (type === 'custom_order') handleCustomOrder(d);
  else if (type === 'shop_order')   handleShopOrder(d);
  else if (type === 'contact')      handleContact(d);
}

// ── File Upload — customer folder + single link + clean attachments ──
function handleFileUpload(d) {
  try {
    var files  = d.files || [];
    var o      = d.order || {};
    var root   = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    // Create a unique folder per customer: "Suraj TP — PLA — 12 Jan 2025 14:30"
    var folderName = (o.name || 'Customer') + ' — ' + (o.material || '') + ' — ' + ts();
    var customerFolder = root.createFolder(folderName);
    customerFolder.addViewer(CONFIG.NOTIFY_EMAIL); // share only with you, not public
    var folderUrl = 'https://drive.google.com/drive/folders/' + customerFolder.getId();

    // Save each file to the customer folder
    // Create TWO separate blobs — one for Drive, one for email attachment
    var emailBlobs = [];
    var fileNames  = [];

    for (var i = 0; i < files.length; i++) {
      var f     = files[i];
      var bytes = Utilities.base64Decode(f.data);

      // Blob 1 → save to Drive
      var driveBlob = Utilities.newBlob(bytes, f.mimetype || 'application/octet-stream', f.filename);
      customerFolder.createFile(driveBlob);

      // Blob 2 → attach to email (fresh blob, same bytes)
      var emailBlob = Utilities.newBlob(bytes, f.mimetype || 'application/octet-stream', f.filename);
      emailBlobs.push(emailBlob);
      fileNames.push(f.filename);
    }

    // ONE email: all files attached + single folder link + full order details
    var body =
      '── Files (' + fileNames.length + ') ──\n' +
      fileNames.join('\n') + '\n\n' +
      'Customer Folder: ' + folderUrl + '\n\n' +
      '── Order Details ──\n' +
      'Name: '         + (o.name||'—')         + '\n' +
      'Email: '        + (o.email||'—')        + '\n' +
      'Phone: '        + (o.phone||'—')        + '\n' +
      'Material: '     + (o.material||'—')     + '\n' +
      'Color: '        + (o.color||'—')        + '\n' +
      'Infill: '       + (o.infill_pct||'—')   + ' — ' + (o.infill_pattern||'—') + '\n' +
      'Walls: '        + (o.walls||'—')        + '\n' +
      'Layer Height: ' + (o.layer_height||'—') + '\n' +
      'Quantity: '     + (o.quantity||'—')     + '\n' +
      'Notes: '        + (o.notes||'—');

    GmailApp.sendEmail(
      CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] ' + (o.name||'Customer') + ' — ' + (o.material||'') + ' — ' + fileNames.length + ' file' + (fileNames.length > 1 ? 's' : ''),
      body,
      {
        attachments: emailBlobs,
        replyTo:     (o.email || CONFIG.NOTIFY_EMAIL),
        name:        (o.name  || 'DrPrinT Customer'),
      }
    );

    Logger.log('Done: ' + fileNames.length + ' files saved to "' + folderName + '" | ' + folderUrl);
  } catch(err) {
    Logger.log('FILE UPLOAD ERR: ' + err.toString());
  }
}

// ── Custom Order — sheet always, email only if no files ──────────
function handleCustomOrder(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = ss.getSheetByName('Custom Orders');
    if (!s) {
      s = ss.insertSheet('Custom Orders');
      s.appendRow(['Timestamp','Name','Email','Phone','Material','Color','Infill','Pattern','Walls','Layer Height','Qty','Notes','Files','Status']);
      s.getRange(1,1,1,13).setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
      s.setFrozenRows(1);
    }
    s.appendRow([ts(), d.name||'', d.email||'', d.phone||'', d.material||'', d.color||'', 
      d.infill_pct||'', d.infill_pattern||'', d.walls||'', d.layer_height||'',
      d.quantity||'', d.notes||'', d.files||'None', 'New']);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }

  // Skip email if files already sent — that email has everything
  if (d.has_files) {
    Logger.log('Skipping order email — already sent with files');
    return;
  }

  try {
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Custom Print (no file) — ' + (d.material||'') + ' — ' + (d.name||''),
      'Name: '+(d.name||'')+'\nEmail: '+(d.email||'')+'\nPhone: '+(d.phone||'')+
      '\nMaterial: '+(d.material||'')+'\nColor: '+(d.color||'—')+'\nInfill: '+(d.infill_pct||'')+' — '+(d.infill_pattern||'')+
      '\nWalls: '+(d.walls||'')+'\nLayer Height: '+(d.layer_height||'')+
      '\nQuantity: '+(d.quantity||'')+'\nNotes: '+(d.notes||'—')+'\nFiles: None'
    );
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── Shop Order ────────────────────────────────────────────────────
function handleShopOrder(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = ss.getSheetByName('Shop Orders');
    if (!s) {
      s = ss.insertSheet('Shop Orders');
      s.appendRow(['Timestamp','Name','Phone','UPI Ref','Total','Items','Status']);
      s.getRange(1,1,1,7).setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
      s.setFrozenRows(1);
    }
    var iStr = Array.isArray(d.items) ? d.items.map(function(i){ return i.name+' x'+i.qty; }).join(', ') : String(d.items||'');
    s.appendRow([ts(), d.name||'', d.phone||'', d.transaction_id||'', 'Rs.'+(d.total||''), iStr, 'Payment Received']);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }
  try {
    var items = Array.isArray(d.items) ? d.items.map(function(i){ return i.name+' x'+i.qty+' @ Rs.'+i.price; }).join('\n') : String(d.items||'');
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Order Rs.'+(d.total||'')+' — '+(d.name||''),
      'Customer: '+(d.name||'')+'\nPhone: '+(d.phone||'')+'\nUPI Ref: '+(d.transaction_id||'')+'\nTotal: Rs.'+(d.total||'')+'\n\nItems:\n'+items);
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── Contact ───────────────────────────────────────────────────────
function handleContact(d) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var s  = ss.getSheetByName('Contact');
    if (!s) {
      s = ss.insertSheet('Contact');
      s.appendRow(['Timestamp','Name','Email','Project Type','Material','Description','Status']);
      s.getRange(1,1,1,7).setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
      s.setFrozenRows(1);
    }
    s.appendRow([ts(), d.name||'', d.email||'', d.project_type||'', d.material||'', d.description||'', 'New']);
  } catch(err) { Logger.log('SHEET ERR: ' + err.toString()); }
  try {
    GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      '[DrPrinT] Enquiry — '+(d.project_type||'')+' — '+(d.name||''),
      'Name: '+(d.name||'')+'\nEmail: '+(d.email||'')+'\nType: '+(d.project_type||'')+'\nMaterial: '+(d.material||'')+'\nColor: '+(d.color||'—')+'\nMessage: '+(d.description||''));
  } catch(err) { Logger.log('EMAIL ERR: ' + err.toString()); }
}

// ── Helpers ───────────────────────────────────────────────────────
function ts() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss');
}
function out(t) {
  return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.JSON);
}
function runTest() {
  handleCustomOrder({ type:'custom_order', name:'Test', email:'drprint.3dwork@gmail.com',
    phone:'9999999999', material:'PLA', infill_pct:'20%', infill_pattern:'Gyroid',
    walls:'3', layer_height:'0.2mm', quantity:'1', notes:'Test', files:'None', has_files:false });
}
