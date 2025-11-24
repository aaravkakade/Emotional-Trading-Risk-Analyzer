import { useState, useEffect } from 'react'

function TradeList() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/trades')
      
      if (!response.ok) {
        throw new Error('Failed to fetch trades')
      }

      const data = await response.json()
      setTrades(data.trades || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching trades:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="trade-list">Loading trades...</div>
  }

  if (error) {
    return <div className="trade-list error">Error: {error}</div>
  }

  if (trades.length === 0) {
    return (
      <div className="trade-list">
        <h2>Your Trades</h2>
        <p>No trades saved yet. Submit a trade to see it here!</p>
      </div>
    )
  }

  return (
    <div className="trade-list">
      <h2>Your Trades ({trades.length})</h2>
      <button onClick={fetchTrades} className="refresh-btn">Refresh</button>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Ticker</th>
            <th>Action</th>
            <th>Shares</th>
            <th>Price</th>
            <th>Risk Score</th>
            <th>Emotional?</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className={trade.is_emotional ? 'emotional' : ''}>
              <td>{new Date(trade.date).toLocaleDateString()}</td>
              <td>{trade.ticker}</td>
              <td className={trade.action === 'buy' ? 'buy' : 'sell'}>
                {trade.action.toUpperCase()}
              </td>
              <td>{trade.shares}</td>
              <td>${parseFloat(trade.price).toFixed(2)}</td>
              <td>
                <span className={`risk-score risk-${trade.risk_score >= 50 ? 'high' : trade.risk_score >= 30 ? 'medium' : 'low'}`}>
                  {trade.risk_score}/100
                </span>
              </td>
              <td>{trade.is_emotional ? '⚠️ Yes' : '✓ No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TradeList

