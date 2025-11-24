import yahooFinance from 'yahoo-finance2'

/**
 * Analyzes a trade to detect emotional trading patterns
 * @param {Object} trade - Trade data { ticker, action, shares, price, date }
 * @returns {Object} Analysis results with emotional risk score and flags
 */
export async function analyzeTrade(trade) {
  const { ticker, action, price, date } = trade
  const tradePrice = parseFloat(price)
  const tradeDate = new Date(date)
  
  // Calculate date range for historical data (30 days before trade)
  const startDate = new Date(tradeDate)
  startDate.setDate(startDate.getDate() - 30)
  
  try {
    // Fetch historical price data
    const historicalData = await yahooFinance.historical(ticker, {
      period1: Math.floor(startDate.getTime() / 1000),
      period2: Math.floor(tradeDate.getTime() / 1000),
      interval: '1d'
    })
    
    if (!historicalData || historicalData.length === 0) {
      return {
        error: 'Could not fetch historical data for this ticker',
        riskScore: 50
      }
    }
    
    // Extract closing prices
    const prices = historicalData.map(day => day.close)
    const recentPrices = prices.slice(-7) // Last 7 days
    const allPrices = prices // All 30 days
    
    // Calculate metrics
    const avg7Day = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const avg30Day = allPrices.reduce((a, b) => a + b, 0) / allPrices.length
    const max30Day = Math.max(...allPrices)
    const min30Day = Math.min(...allPrices)
    const priceRange = max30Day - min30Day
    
    // Calculate volatility (standard deviation)
    const variance = allPrices.reduce((sum, price) => {
      return sum + Math.pow(price - avg30Day, 2)
    }, 0) / allPrices.length
    const volatility = Math.sqrt(variance)
    
    // Calculate z-score: how many standard deviations away from the mean
    const zScore30Day = volatility > 0 ? (tradePrice - avg30Day) / volatility : 0
    const zScore7Day = recentPrices.length > 1 ? (() => {
      const recentVariance = recentPrices.reduce((sum, price) => {
        return sum + Math.pow(price - avg7Day, 2)
      }, 0) / recentPrices.length
      const recentVolatility = Math.sqrt(recentVariance)
      return recentVolatility > 0 ? (tradePrice - avg7Day) / recentVolatility : 0
    })() : 0
    
    // Calculate percentile: where does trade price fall in the distribution
    const sortedPrices = [...allPrices].sort((a, b) => a - b)
    const percentile = (sortedPrices.filter(p => p <= tradePrice).length / sortedPrices.length) * 100
    
    // Detect emotional patterns using statistical measures
    const flags = []
    let riskScore = 0
    
    // Pattern 1: FOMO Buying (statistically significant price spike)
    // Z-score > 1.5 standard deviations above 7-day mean
    if (action === 'buy' && zScore7Day > 1.5) {
      const severity = zScore7Day > 3 ? 'high' : zScore7Day > 2 ? 'medium' : 'low'
      const deviation = ((tradePrice - avg7Day) / avg7Day * 100).toFixed(1)
      flags.push({
        type: 'fomo_buying',
        message: `⚠️ FOMO Alert: You bought ${deviation}% above 7-day average (${zScore7Day.toFixed(2)} std devs)`,
        severity: severity
      })
      // Score based on z-score: 1.5-2 = 20pts, 2-3 = 35pts, 3+ = 50pts
      riskScore += zScore7Day > 3 ? 50 : zScore7Day > 2 ? 35 : 20
    }
    
    // Pattern 2: Panic Selling (statistically significant price dip)
    // Z-score < -1.5 standard deviations below 7-day mean
    if (action === 'sell' && zScore7Day < -1.5) {
      const severity = zScore7Day < -3 ? 'high' : zScore7Day < -2 ? 'medium' : 'low'
      const deviation = Math.abs((tradePrice - avg7Day) / avg7Day * 100).toFixed(1)
      flags.push({
        type: 'panic_selling',
        message: `⚠️ Panic Alert: You sold ${deviation}% below 7-day average (${Math.abs(zScore7Day).toFixed(2)} std devs)`,
        severity: severity
      })
      riskScore += zScore7Day < -3 ? 50 : zScore7Day < -2 ? 35 : 20
    }
    
    // Pattern 3: Buying at extreme percentile (top 5% of prices)
    if (action === 'buy' && percentile >= 95) {
      flags.push({
        type: 'buying_at_peak',
        message: `⚠️ Peak Buying: You bought at ${percentile.toFixed(1)}th percentile (top 5% of 30-day range)`,
        severity: percentile >= 99 ? 'high' : 'medium'
      })
      // Score based on percentile: 95-97 = 15pts, 97-99 = 25pts, 99+ = 35pts
      riskScore += percentile >= 99 ? 35 : percentile >= 97 ? 25 : 15
    }
    
    // Pattern 4: Selling at extreme percentile (bottom 5% of prices)
    if (action === 'sell' && percentile <= 5) {
      flags.push({
        type: 'selling_at_bottom',
        message: `⚠️ Bottom Selling: You sold at ${percentile.toFixed(1)}th percentile (bottom 5% of 30-day range)`,
        severity: percentile <= 1 ? 'high' : 'medium'
      })
      riskScore += percentile <= 1 ? 35 : percentile <= 3 ? 25 : 15
    }
    
    // Pattern 5: High volatility trading (coefficient of variation > 5%)
    const coefficientOfVariation = (volatility / avg30Day) * 100
    if (coefficientOfVariation > 5) {
      flags.push({
        type: 'high_volatility',
        message: `⚠️ High Volatility: Stock volatility is ${coefficientOfVariation.toFixed(1)}% (above 5% threshold)`,
        severity: coefficientOfVariation > 10 ? 'high' : 'medium'
      })
      riskScore += coefficientOfVariation > 10 ? 15 : 8
    }
    
    // Pattern 6: Extreme deviation from 30-day mean (z-score > 2)
    if (action === 'buy' && zScore30Day > 2) {
      const deviation = ((tradePrice - avg30Day) / avg30Day * 100).toFixed(1)
      flags.push({
        type: 'extreme_overpaying',
        message: `⚠️ Extreme Overpaying: You bought ${deviation}% above 30-day average (${zScore30Day.toFixed(2)} std devs)`,
        severity: zScore30Day > 3 ? 'high' : 'medium'
      })
      riskScore += zScore30Day > 3 ? 30 : 20
    }
    
    // Pattern 7: Extreme deviation below mean for sells
    if (action === 'sell' && zScore30Day < -2) {
      const deviation = Math.abs((tradePrice - avg30Day) / avg30Day * 100).toFixed(1)
      flags.push({
        type: 'extreme_underselling',
        message: `⚠️ Extreme Underselling: You sold ${deviation}% below 30-day average (${Math.abs(zScore30Day).toFixed(2)} std devs)`,
        severity: zScore30Day < -3 ? 'high' : 'medium'
      })
      riskScore += zScore30Day < -3 ? 30 : 20
    }
    
    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100)
    
    return {
      riskScore,
      flags,
      analysis: {
        tradePrice,
        avg7Day: avg7Day.toFixed(2),
        avg30Day: avg30Day.toFixed(2),
        max30Day: max30Day.toFixed(2),
        min30Day: min30Day.toFixed(2),
        volatility: volatility.toFixed(2),
        priceRange: priceRange.toFixed(2),
        zScore30Day: zScore30Day.toFixed(2),
        zScore7Day: zScore7Day.toFixed(2),
        percentile: percentile.toFixed(1),
        coefficientOfVariation: coefficientOfVariation.toFixed(2)
      },
      isEmotional: riskScore >= 30
    }
  } catch (error) {
    console.error('Error analyzing trade:', error)
    return {
      error: 'Failed to analyze trade',
      riskScore: 50
    }
  }
}

