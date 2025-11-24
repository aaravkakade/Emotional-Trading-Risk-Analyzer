import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create database connection
const dbPath = path.join(__dirname, '../database/trades.db')
const db = new sqlite3.Database(dbPath)

// Promisify database methods for async/await
const dbRun = promisify(db.run.bind(db))
const dbAll = promisify(db.all.bind(db))
const dbGet = promisify(db.get.bind(db))

// Initialize database - create tables if they don't exist
export async function initDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      action TEXT NOT NULL,
      shares REAL NOT NULL,
      price REAL NOT NULL,
      date TEXT NOT NULL,
      mood TEXT,
      notes TEXT,
      risk_score INTEGER,
      is_emotional INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  console.log('Database initialized successfully')
}

// Save a trade to the database
export async function saveTrade(trade, analysis) {
  const { ticker, action, shares, price, date, mood, notes } = trade
  const riskScore = analysis.riskScore || 0
  const isEmotional = analysis.isEmotional ? 1 : 0
  
  await dbRun(
    `INSERT INTO trades (ticker, action, shares, price, date, mood, notes, risk_score, is_emotional)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticker, action, shares, price, date, mood || null, notes || null, riskScore, isEmotional]
  )
  
  return { success: true }
}

// Get all trades
export async function getAllTrades() {
  const trades = await dbAll('SELECT * FROM trades ORDER BY date DESC, created_at DESC')
  return trades
}

// Get trades by ticker
export async function getTradesByTicker(ticker) {
  const trades = await dbAll(
    'SELECT * FROM trades WHERE ticker = ? ORDER BY date DESC',
    [ticker]
  )
  return trades
}

// Get database connection (for closing if needed)
export function getDb() {
  return db
}

