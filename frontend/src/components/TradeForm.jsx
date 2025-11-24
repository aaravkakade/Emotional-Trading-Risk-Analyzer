import { useState } from 'react'

function TradeForm() {
  const [ticker, setTicker] = useState('')
  const [action, setAction] = useState('buy')
  const [shares, setShares] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const tradeData = { ticker, action, shares, price, date, mood, notes }
      
      const response = await fetch('http://localhost:5000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze trade')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message)
      console.error('Error submitting trade:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="trade-form">
      <h2>Log a New Trade</h2>
      
      <div className="form-group">
        <label htmlFor="ticker">Ticker Symbol *</label>
        <input
          type="text"
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g., AAPL"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="action">Buy or Sell *</label>
        <select
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="shares">Shares *</label>
          <input
            type="number"
            id="shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="e.g., 10"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price per Share *</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 150.50"
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="date">Trade Date *</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="mood">Mood (Optional)</label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="">Select mood...</option>
          <option value="confident">Confident</option>
          <option value="anxious">Anxious</option>
          <option value="excited">Excited</option>
          <option value="fearful">Fearful</option>
          <option value="calm">Calm</option>
          <option value="fomo">FOMO</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this trade..."
          rows="3"
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Analyzing...' : 'Log Trade'}
      </button>
    </form>

    {error && (
      <div className="error-message">
        <p>Error: {error}</p>
      </div>
    )}

    {analysis && (
      <div className="analysis-results">
        <h3>Analysis Results</h3>
        
        <div className="risk-score">
          <h4>Emotional Risk Score: {analysis.riskScore}/100</h4>
          {analysis.isEmotional ? (
            <p className="emotional-warning">⚠️ This trade shows signs of emotional decision-making</p>
          ) : (
            <p className="rational-message">✓ This trade appears rational</p>
          )}
        </div>

        {analysis.flags && analysis.flags.length > 0 && (
          <div className="flags">
            <h4>Warnings Detected:</h4>
            <ul>
              {analysis.flags.map((flag, index) => (
                <li key={index} className={`flag flag-${flag.severity}`}>
                  {flag.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.analysis && (
          <div className="market-data">
            <h4>Market Context:</h4>
            <ul>
              <li>Your Trade Price: ${analysis.analysis.tradePrice}</li>
              <li>7-Day Average: ${analysis.analysis.avg7Day}</li>
              <li>30-Day Average: ${analysis.analysis.avg30Day}</li>
              <li>30-Day High: ${analysis.analysis.max30Day}</li>
              <li>30-Day Low: ${analysis.analysis.min30Day}</li>
              <li>Volatility: ${analysis.analysis.volatility}</li>
            </ul>
          </div>
        )}
      </div>
    )}
  </>
  )
}

export default TradeForm

