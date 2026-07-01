import { Database } from 'bun:sqlite';

const db = new Database('rugpool.db', { create: true });

db.run(`CREATE TABLE IF NOT EXISTS coins (
  address TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  description TEXT DEFAULT '',
  imageUrl TEXT DEFAULT '',
  creator TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`);

export function saveCoin(address, { name, ticker, description, imageUrl, creator }) {
  db.run(
    'INSERT OR REPLACE INTO coins (address, name, ticker, description, imageUrl, creator) VALUES (?, ?, ?, ?, ?, ?)',
    [address.toLowerCase(), name, ticker, description || '', imageUrl || '', creator.toLowerCase()]
  );
}

export function getCoin(address) {
  return db.query('SELECT * FROM coins WHERE address = ?').get(address.toLowerCase());
}

export function getAllCoins() {
  return db.query('SELECT * FROM coins ORDER BY created_at DESC').all();
}

db.run(`CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  coin_address TEXT NOT NULL,
  value TEXT NOT NULL,
  tokens_out TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`);

export function savePurchase(wallet, coinAddress, value, tokensOut, txHash) {
  db.run(
    'INSERT INTO purchases (wallet, coin_address, value, tokens_out, tx_hash) VALUES (?, ?, ?, ?, ?)',
    [wallet.toLowerCase(), coinAddress.toLowerCase(), value, tokensOut, txHash]
  );
}

export function getPurchases(wallet) {
  return db.query('SELECT * FROM purchases WHERE wallet = ? ORDER BY created_at DESC').all(wallet.toLowerCase());
}
