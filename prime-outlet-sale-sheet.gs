/**
 * Prime Outlet — Sale Agent sheet menu
 * Paste into the Control spreadsheet: Extensions → Apps Script → new file.
 * If the project already has an onOpen(), delete the one below and call
 * addSaleAgentMenu_() from the existing onOpen() instead.
 */

// ==== Fill these three values ====
const N8N_BASE_URL = 'https://YOUR-N8N-DOMAIN';              // e.g. https://primeoutlet.app.n8n.cloud
const N8N_SECRET   = 'CHANGE_ME_SAME_AS_APPS_SCRIPT';        // same as webhookSecret in both n8n Config nodes
const SALE_SHEET   = 'Sale Agent';
// =================================

const REFRESH_PATH = '/webhook/prime-outlet-sale-refresh';
const RUN_PATH     = '/webhook/prime-outlet-sale-run';
const HEADERS = ['Ապրանք', 'Իմ գին', 'Շուկայի միջին', 'Առաջարկ', 'Մաքուր շահույթ', 'Margin %',
                 'Հաստատո՞ւմ', 'Կարգավիճակ', 'Item ID', 'SKU', 'Min Price', 'Sale Price'];

function onOpen() {
  addSaleAgentMenu_();
}

function addSaleAgentMenu_() {
  SpreadsheetApp.getUi()
    .createMenu('🟢 Sale Agent')
    .addItem('▶ RUN — ստեղծել հաստատվածները', 'runApproved')
    .addItem('🔄 Թարմացնել առաջարկները', 'refreshSuggestions')
    .addSeparator()
    .addItem('⚙️ Կարգավորել tab-ը (մեկ անգամ)', 'setupSaleSheet')
    .addToUi();
}

function runApproved() {
  const ui = SpreadsheetApp.getUi();
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) { ui.alert('Առաջարկներ չկան։ Նախ սեղմիր «🔄 Թարմացնել առաջարկները»։'); return; }

  const rows = sh.getRange(2, 1, last - 1, 12).getDisplayValues();
  const approved = rows.filter(r => String(r[6]).trim().toUpperCase() === 'ԱՅՈ' && !String(r[7]).startsWith('✅'));
  if (!approved.length) { ui.alert('«Հաստատո՞ւմ» սյունակում ԱՅՈ նշված տող չկա։'); return; }

  const list = approved.slice(0, 15).map(r => '• ' + r[0].slice(0, 45) + '   ' + r[3]).join('\n');
  const more = approved.length > 15 ? '\n… և ևս ' + (approved.length - 15) : '';
  const ok = ui.alert('Ստեղծե՞լ ' + approved.length + ' sale event', list + more, ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  SpreadsheetApp.getActive().toast('Ստեղծվում է…', 'Sale Agent', 30);
  try {
    const res = post_(RUN_PATH);
    ui.alert('Պատրաստ է',
      '✅ Ստեղծված՝ ' + (res.done || 0) + '\n❌ Սխալ՝ ' + (res.failed || 0) +
      '\n\nՄանրամասները «Կարգավիճակ» սյունակում։', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Պատասխան չստացվեց',
      'n8n-ը կարող է դեռ աշխատել։ 1 րոպեից նայիր «Կարգավիճակ» սյունակին։\n\n' + e.message, ui.ButtonSet.OK);
  }
}

function refreshSuggestions() {
  try {
    post_(REFRESH_PATH);
    SpreadsheetApp.getActive().toast('Սկսվեց։ 1–3 րոպեից աղյուսակը կթարմանա։', 'Sale Agent', 10);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Չհաջողվեց սկսել', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function setupSaleSheet() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SALE_SHEET) || ss.insertSheet(SALE_SHEET);
  if (sh.getMaxColumns() < 12) sh.insertColumnsAfter(sh.getMaxColumns(), 12 - sh.getMaxColumns());

  sh.getRange(1, 1, 1, 12).setValues([HEADERS])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#1e5631')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 36);

  const widths = [380, 80, 110, 150, 120, 80, 110, 320];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.hideColumns(9, 4); // Item ID, SKU, Min Price, Sale Price — used by n8n only

  const n = sh.getMaxRows() - 1;
  sh.getRange(2, 2, n, 2).setNumberFormat('$#,##0.00');
  sh.getRange(2, 5, n, 1).setNumberFormat('$#,##0.00');
  sh.getRange(2, 6, n, 1).setNumberFormat('0.0"%"');
  sh.getRange(2, 2, n, 7).setHorizontalAlignment('center');

  const decision = sh.getRange(2, 7, n, 1);
  decision.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['ԱՅՈ', 'ՈՉ'], true).setAllowInvalid(false).build());
  decision.setFontWeight('bold');

  const status = sh.getRange(2, 8, n, 1);
  const rule = (range, text, bg, fg, starts) => {
    const b = SpreadsheetApp.newConditionalFormatRule().setBackground(bg).setFontColor(fg).setRanges([range]);
    return (starts ? b.whenTextStartsWith(text) : b.whenTextEqualTo(text)).build();
  };
  sh.setConditionalFormatRules([
    rule(decision, 'ԱՅՈ', '#d9ead3', '#1e5631', false),
    rule(decision, 'ՈՉ', '#eeeeee', '#666666', false),
    rule(status, '✅', '#d9ead3', '#1e5631', true),
    rule(status, '❌', '#f4cccc', '#990000', true),
    rule(status, '⚠️', '#fff2cc', '#7f6000', true),
    rule(status, '⏸', '#eeeeee', '#666666', true),
  ]);
  ss.setActiveSheet(sh);
  ss.toast('Tab-ը պատրաստ է։', 'Sale Agent', 5);
}

function getSheet_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SALE_SHEET);
  if (!sh) throw new Error('«' + SALE_SHEET + '» tab-ը չկա։ Սեղմիր «⚙️ Կարգավորել tab-ը»։');
  return sh;
}

function post_(path) {
  const res = UrlFetchApp.fetch(N8N_BASE_URL.replace(/\/+$/, '') + path, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ secret: N8N_SECRET }),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 300) throw new Error('n8n ' + code + ': ' + text.slice(0, 300));
  try { return JSON.parse(text); } catch (e) { return {}; }
}
