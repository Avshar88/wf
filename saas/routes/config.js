const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('./middleware');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const cfg = db.prepare('SELECT * FROM user_config WHERE user_id = ?').get(req.userId);
  if (!cfg) return res.json({});
  // Never return raw tokens — mask them
  const masked = { ...cfg };
  if (masked.ebay_basic_auth) masked.ebay_basic_auth = '••••' + masked.ebay_basic_auth.slice(-6);
  if (masked.ebay_refresh_token) masked.ebay_refresh_token = '••••' + masked.ebay_refresh_token.slice(-6);
  if (masked.openai_api_key) masked.openai_api_key = 'sk-••••' + masked.openai_api_key.slice(-4);
  res.json(masked);
});

router.post('/', authMiddleware, (req, res) => {
  const {
    ebay_basic_auth, ebay_refresh_token,
    ebay_fulfillment_policy_id, ebay_payment_policy_id, ebay_return_policy_id,
    ebay_merchant_location_key, openai_api_key, rainforest_api_key
  } = req.body;

  const existing = db.prepare('SELECT user_id FROM user_config WHERE user_id = ?').get(req.userId);

  if (existing) {
    const fields = [];
    const values = [];
    const map = {
      ebay_basic_auth, ebay_refresh_token,
      ebay_fulfillment_policy_id, ebay_payment_policy_id, ebay_return_policy_id,
      ebay_merchant_location_key, openai_api_key, rainforest_api_key
    };
    for (const [k, v] of Object.entries(map)) {
      if (v && !v.startsWith('••••')) { fields.push(`${k} = ?`); values.push(v); }
    }
    if (fields.length) {
      values.push(req.userId);
      db.prepare(`UPDATE user_config SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`).run(...values);
    }
  } else {
    db.prepare(`
      INSERT INTO user_config
        (user_id, ebay_basic_auth, ebay_refresh_token, ebay_fulfillment_policy_id,
         ebay_payment_policy_id, ebay_return_policy_id, ebay_merchant_location_key,
         openai_api_key, rainforest_api_key)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(
      req.userId,
      ebay_basic_auth || '', ebay_refresh_token || '',
      ebay_fulfillment_policy_id || '', ebay_payment_policy_id || '',
      ebay_return_policy_id || '', ebay_merchant_location_key || 'default',
      openai_api_key || '', rainforest_api_key || ''
    );
  }

  res.json({ success: true });
});

module.exports = router;
