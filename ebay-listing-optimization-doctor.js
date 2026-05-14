import { workflow, node, trigger, sticky, placeholder, newCredential, expr } from '@n8n/workflow-sdk';

const driveTrigger = trigger({
  type: 'n8n-nodes-base.googleDriveTrigger',
  version: 1,
  config: {
    name: 'Watch eBay Reports Folder',
    parameters: {
      pollTimes: { item: [{ mode: 'everyHour' }] },
      triggerOn: 'specificFolder',
      folderToWatch: { __rl: true, mode: 'list', value: '' }
    },
    credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
    position: [240, 300]
  },
  output: [{ id: 'abc123', name: 'ebay_promoted_report.csv', mimeType: 'text/csv' }]
});

const downloadCsv = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  config: {
    name: 'Download CSV Report',
    parameters: {
      resource: 'file',
      operation: 'download',
      fileId: { __rl: true, mode: 'id', value: expr('{{ $json.id }}') },
      options: {
        binaryPropertyName: 'csvData'
      }
    },
    credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
    position: [460, 300]
  },
  output: [{ id: 'abc123', name: 'ebay_promoted_report.csv' }]
});

const parseAndAnalyze = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse and Analyze eBay Listings',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const items = $input.all();
const results = [];
const today = new Date().toISOString().split('T')[0];

for (const item of items) {
  try {
    const binaryKey = Object.keys(item.binary || {})[0];
    if (!binaryKey) continue;

    const csvText = Buffer.from(item.binary[binaryKey].data, 'base64').toString('utf-8');
    const lines = csvText.replace(/^\\uFEFF/, '').split(/\\r?\\n/).filter(l => l.trim());
    if (lines.length < 2) continue;

    const parseLine = (line) => {
      const cells = [];
      let inQuotes = false;
      let cell = '';
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { cells.push(cell); cell = ''; }
        else { cell += ch; }
      }
      cells.push(cell);
      return cells.map(c => c.trim());
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());

    const col = (...names) => {
      for (const n of names) {
        const i = headers.findIndex(h => h.includes(n));
        if (i >= 0) return i;
      }
      return -1;
    };

    const colDate     = col('date', 'report date');
    const colCampaign = col('campaign name', 'campaign');
    const colItemId   = col('item id', 'item number', 'listing id');
    const colSku      = col('custom label', 'sku', 'seller sku');
    const colTitle    = col('item title', 'title', 'listing title');
    const colPrice    = col('sold price', 'item price', 'price');
    const colImp      = col('impressions');
    const colClicks   = col('clicks');
    const colQty      = col('quantity sold', 'qty sold', 'units sold', 'sales quantity');
    const colSales    = col('total sales', 'sales amount', 'revenue', 'sales');
    const colAdFees   = col('total ad fees', 'ad fees', 'promoted listing fees', 'ad spend', 'spend');

    const toNum = v => { const n = parseFloat(String(v || 0).replace(/[^0-9.-]/g, '')); return isNaN(n) ? 0 : n; };
    const get   = (row, i) => (i >= 0 && i < row.length) ? row[i] : '';

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const row = parseLine(lines[i]);

      const imp    = toNum(get(row, colImp));
      const clicks = toNum(get(row, colClicks));
      const qty    = toNum(get(row, colQty));
      const sales  = toNum(get(row, colSales));
      const fees   = toNum(get(row, colAdFees));
      const price  = toNum(get(row, colPrice));

      if (imp === 0 && clicks === 0 && sales === 0 && fees === 0) continue;

      const ctr  = imp > 0    ? (clicks / imp)  * 100 : 0;
      const conv = clicks > 0 ? (qty / clicks)   * 100 : 0;
      const roas = fees > 0   ? sales / fees           : 0;

      let priority = 99;
      if      (imp >= 1000 && clicks === 0) priority = 1;
      else if (clicks >= 5 && qty === 0)    priority = 2;
      else if (fees >= 2 && sales === 0)    priority = 3;
      else if (qty >= 1 && roas >= 10)      priority = 4;
      else if (imp >= 800 && clicks === 0)  priority = 5;
      else if (ctr < 0.2 && imp >= 500)     priority = 6;

      let problem = 'Monitor';
      let action  = 'No action required at this time';

      if (imp >= 800 && clicks === 0) {
        problem = 'High impressions, zero clicks';
        action  = 'Improve main photo, title, and reduce price by 5%';
      } else if (clicks >= 5 && qty === 0) {
        problem = 'Clicks but no sales';
        action  = 'Reduce price by 5-10%, check item specifics and description';
      } else if (fees >= 2 && sales === 0) {
        problem = 'Ad spend without sales';
        action  = 'Lower ad rate to 3-4% or remove from campaign';
      } else if (qty >= 1 && roas >= 10) {
        problem = 'Winner listing';
        action  = 'Keep active, do not reduce price, use similar title/photo strategy';
      } else if (ctr < 0.2 && imp >= 500) {
        problem = 'Low CTR';
        action  = 'Improve main photo and first 5 words of title';
      } else if (conv >= 3) {
        problem = 'Good conversion';
        action  = 'Keep price stable and maintain ad rate';
      }

      results.push({ json: {
        date:               get(row, colDate) || today,
        campaign_name:      get(row, colCampaign),
        item_id:            get(row, colItemId),
        sku:                get(row, colSku),
        title:              get(row, colTitle),
        price:              price,
        impressions:        imp,
        clicks:             clicks,
        ctr:                parseFloat(ctr.toFixed(4)),
        quantity_sold:      qty,
        sales:              sales,
        ad_fees:            fees,
        roas:               parseFloat(roas.toFixed(2)),
        conversion_rate:    parseFloat(conv.toFixed(4)),
        problem:            problem,
        recommended_action: action,
        priority:           priority,
        approval_status:    'Pending'
      }});
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
}

return results;`
    },
    position: [680, 300]
  },
  output: [{
    date: '2024-01-15',
    campaign_name: 'Spring Campaign',
    item_id: '123456789',
    sku: 'SKU-001',
    title: 'Leather Wallet Vintage',
    price: 29.99,
    impressions: 1200,
    clicks: 0,
    ctr: 0,
    quantity_sold: 0,
    sales: 0,
    ad_fees: 0,
    roas: 0,
    conversion_rate: 0,
    problem: 'High impressions, zero clicks',
    recommended_action: 'Improve main photo, title, and reduce price by 5%',
    priority: 1,
    approval_status: 'Pending'
  }]
});

const sortListings = node({
  type: 'n8n-nodes-base.sort',
  version: 1,
  config: {
    name: 'Sort by Priority and Impressions',
    parameters: {
      type: 'simple',
      sortFieldsUi: {
        sortField: [
          { fieldName: 'priority', order: 'ascending' },
          { fieldName: 'impressions', order: 'descending' }
        ]
      }
    },
    position: [900, 300]
  },
  output: [{
    date: '2024-01-15',
    campaign_name: 'Spring Campaign',
    item_id: '123456789',
    sku: 'SKU-001',
    title: 'Leather Wallet Vintage',
    price: 29.99,
    impressions: 1200,
    clicks: 0,
    ctr: 0,
    quantity_sold: 0,
    sales: 0,
    ad_fees: 0,
    roas: 0,
    conversion_rate: 0,
    problem: 'High impressions, zero clicks',
    recommended_action: 'Improve main photo, title, and reduce price by 5%',
    priority: 1,
    approval_status: 'Pending'
  }]
});

const writeToSheets = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'Write to Optimization Sheet',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: { __rl: true, mode: 'list', value: '' },
      sheetName: { __rl: true, mode: 'name', value: 'eBay Optimization' },
      columns: expr('{{ {"mappingMode": "autoMapInputData", "value": null} }}'),
      options: {
        cellFormat: 'USER_ENTERED'
      }
    },
    credentials: { googleSheetsOAuth2Api: newCredential('Google Sheets OAuth2') },
    position: [1120, 300]
  },
  output: [{ updatedRows: 1 }]
});

const countTotals = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Count Report Totals',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const items = $('Sort by Priority and Impressions').all();
let highImpNoClicks = 0, clicksNoSales = 0, adSpendNoSales = 0, winners = 0;

for (const item of items) {
  const p = item.json.problem || '';
  if (p === 'High impressions, zero clicks') highImpNoClicks++;
  else if (p === 'Clicks but no sales')      clicksNoSales++;
  else if (p === 'Ad spend without sales')   adSpendNoSales++;
  else if (p === 'Winner listing')           winners++;
}

return [{ json: { highImpNoClicks, clicksNoSales, adSpendNoSales, winners } }];`
    },
    position: [1340, 300]
  },
  output: [{ highImpNoClicks: 3, clicksNoSales: 2, adSpendNoSales: 1, winners: 4 }]
});

const sendTelegram = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send eBay Doctor Report',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: placeholder('Your Telegram Chat ID (use @get_id_bot)'),
      text: expr(
        'eBay Listing Doctor report is ready. Today you have:\n' +
        '{{ $json.highImpNoClicks }} high impression zero click listings,\n' +
        '{{ $json.clicksNoSales }} click no sale listings,\n' +
        '{{ $json.adSpendNoSales }} ad spend no sale listings,\n' +
        '{{ $json.winners }} winner listings.\n' +
        'Check Google Sheet for action list.'
      ),
      additionalFields: {
        appendAttribution: false,
        disable_web_page_preview: true
      }
    },
    credentials: { telegramApi: newCredential('Telegram Bot API') },
    position: [1560, 300]
  },
  output: [{ ok: true }]
});

const setupNote = sticky(
  '## eBay Listing Doctor — Setup Guide\n\n' +
  '**Step 1:** Connect credentials:\n' +
  '- Google Drive OAuth2 (Watch + Download nodes)\n' +
  '- Google Sheets OAuth2 (Write node)\n' +
  '- Telegram Bot API (Notification node)\n\n' +
  '**Step 2:** In "Watch eBay Reports Folder" → select your Drive folder\n\n' +
  '**Step 3:** In "Write to Optimization Sheet" → select your Google Sheet document\n\n' +
  '**Step 4:** In "Send eBay Doctor Report" → enter your Telegram Chat ID\n\n' +
  '**Step 5:** Create a sheet tab named exactly: **eBay Optimization**\n' +
  'Add these column headers in row 1 (exact match required):\n' +
  'date | campaign_name | item_id | sku | title | price | impressions | clicks | ctr | quantity_sold | sales | ad_fees | roas | conversion_rate | problem | recommended_action | priority | approval_status\n\n' +
  '**Priority Guide:**\n' +
  '1 = Critical: 1000+ impressions, 0 clicks\n' +
  '2 = Clicks but no sale\n' +
  '3 = Ad spend wasted\n' +
  '4 = Winner listing\n' +
  '5 = 800-999 impressions, 0 clicks\n' +
  '6 = Low CTR\n' +
  '99 = Monitor only\n\n' +
  '**This workflow does NOT update eBay. Seller must approve all actions.**',
  [driveTrigger, downloadCsv, parseAndAnalyze, sortListings, writeToSheets, countTotals, sendTelegram],
  { color: 2 }
);

export default workflow('ebay-listing-doctor', 'eBay Listing Optimization Doctor')
  .add(driveTrigger)
  .to(downloadCsv)
  .to(parseAndAnalyze)
  .to(sortListings)
  .to(writeToSheets)
  .to(countTotals)
  .to(sendTelegram)
  .add(setupNote);
