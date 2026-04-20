const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/app.db'
  : path.join(__dirname, 'app.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_config (
    user_id INTEGER PRIMARY KEY,
    ebay_basic_auth TEXT,
    ebay_refresh_token TEXT,
    ebay_fulfillment_policy_id TEXT,
    ebay_payment_policy_id TEXT,
    ebay_return_policy_id TEXT,
    ebay_merchant_location_key TEXT DEFAULT 'default',
    openai_api_key TEXT,
    rainforest_api_key TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    credits_used INTEGER NOT NULL,
    published INTEGER DEFAULT 0,
    review_needed INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    filename TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_session_id TEXT UNIQUE,
    credits INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = db;
