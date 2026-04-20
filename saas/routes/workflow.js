const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const db = require('../db/database');
const { authMiddleware } = require('./middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/run', authMiddleware, upload.single('file'), async (req, res) => {
  const cfg = db.prepare('SELECT * FROM user_config WHERE user_id = ?').get(req.userId);

  if (!cfg || !cfg.ebay_basic_auth || !cfg.ebay_refresh_token || !cfg.openai_api_key) {
    return res.status(400).json({ error: 'Please save your API credentials in Settings first' });
  }

  if (!req.file) return res.status(400).json({ error: 'Please upload an XLSX file' });

  const XLSX = require('xlsx');
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  const validRows = rows.filter(r => String(r['UPC'] || r['upc'] || '').replace(/\D/g, '').length >= 6);
  if (validRows.length === 0) return res.status(400).json({ error: 'No valid rows with UPC found in file' });

  const payload = {
    ebay_basic_auth: cfg.ebay_basic_auth,
    ebay_refresh_token: cfg.ebay_refresh_token,
    ebay_fulfillment_policy_id: cfg.ebay_fulfillment_policy_id,
    ebay_payment_policy_id: cfg.ebay_payment_policy_id,
    ebay_return_policy_id: cfg.ebay_return_policy_id,
    ebay_merchant_location_key: cfg.ebay_merchant_location_key || 'default',
    openai_api_key: cfg.openai_api_key,
    rainforest_api_key: cfg.rainforest_api_key || '',
    xlsx_base64: req.file.buffer.toString('base64'),
    xlsx_filename: req.file.originalname
  };

  let n8nResult = null;
  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 300000
    });
    n8nResult = await response.json();
  } catch (e) {
    return res.status(502).json({ error: 'Workflow execution failed: ' + e.message });
  }

  const results = Array.isArray(n8nResult) ? n8nResult : [n8nResult];
  const published = results.filter(r => r.status === 'published').length;
  const reviewNeeded = results.filter(r => r.status === 'review_needed' || r.status === 'api_error').length;

  db.prepare(`
    INSERT INTO runs (user_id, credits_used, published, review_needed, errors, filename)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.userId, validRows.length, published, reviewNeeded, results.filter(r => r.status === 'api_error').length, req.file.originalname);

  res.json({ published, review_needed: reviewNeeded, results });
});

router.get('/history', authMiddleware, (req, res) => {
  const runs = db.prepare('SELECT * FROM runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.userId);
  res.json(runs);
});

module.exports = router;
