import express from 'express'
import cors from 'cors'
import { analyzeTrade } from './analyzeTrade.js'
import { initDatabase, saveTrade, getAllTrades } from './database.js'

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' })
})

// Endpoint to receive and process trade data
app.post('/api/trades', async (req, res) => {
  try {
    const tradeData = req.body
    console.log('Received trade:', tradeData)
    
    // Analyze the trade for emotional patterns
    const analysis = await analyzeTrade(tradeData)
    
    // Save to database
    await saveTrade(tradeData, analysis)
    
    res.json({ 
      message: 'Trade analyzed and saved successfully',
      trade: tradeData,
      analysis: analysis
    })
  } catch (error) {
    console.error('Error processing trade:', error)
    res.status(500).json({ error: 'Failed to process trade' })
  }
})

// Endpoint to get all trades
app.get('/api/trades', async (req, res) => {
  try {
    const trades = await getAllTrades()
    res.json({ trades })
  } catch (error) {
    console.error('Error fetching trades:', error)
    res.status(500).json({ error: 'Failed to fetch trades' })
  }
})

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

