# Emotional Trading Risk Analyzer

A web application to help users identify emotional or impulsive trading behavior based on their trade history. The app analyzes your trades using statistical measures (z-scores, percentiles) to detect patterns like FOMO buying, panic selling, and other emotionally-driven decisions.

## Features

- **Manual Trade Logging**: Log trades with ticker, buy/sell, shares, price, date, mood, and notes
- **Emotional Pattern Detection**: Automatically detects:
  - FOMO buying (buying during price spikes)
  - Panic selling (selling during price dips)
  - Buying at peaks / Selling at bottoms
  - Extreme overpaying / underselling
  - High volatility trading
- **Statistical Analysis**: Uses z-scores and percentiles for data-driven scoring
- **Risk Scoring**: Calculates emotional risk score (0-100) based on detected patterns
- **Trade History**: View all saved trades in a table with risk scores
- **Real-time Analysis**: Fetches historical stock data and compares your trade to market conditions

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **SQLite** - Database for storing trades
- **yahoo-finance2** - Stock price data API

## Project Structure

```
Emotional-Trading-Risk-Analyzer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TradeForm.jsx      # Form to log new trades
│   │   │   └── TradeList.jsx      # Display all saved trades
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite configuration
├── backend/
│   ├── server.js                  # Express server
│   ├── analyzeTrade.js            # Trade analysis logic
│   ├── database.js                # Database functions
│   └── package.json               # Backend dependencies
├── database/
│   └── trades.db                  # SQLite database (created automatically)
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or navigate to the project directory**

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## How It Works

1. **Log a Trade**: Fill out the form with trade details (ticker, action, shares, price, date, etc.)

2. **Analysis**: The backend:
   - Fetches 30 days of historical price data for the ticker
   - Calculates statistical measures (z-scores, percentiles, volatility)
   - Compares your trade price to market conditions
   - Detects emotional trading patterns

3. **Scoring**: Each pattern adds points to the risk score:
   - Z-score > 1.5 standard deviations: 20-50 points (scales with extremity)
   - Trading at extreme percentiles (top/bottom 5%): 15-35 points
   - High volatility: 8-15 points

4. **Results**: You see:
   - Emotional risk score (0-100)
   - Warnings for detected patterns
   - Market context (averages, volatility, z-scores, percentiles)

5. **Storage**: Trades are saved to SQLite database for future reference

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/trades` - Submit and analyze a new trade
- `GET /api/trades` - Get all saved trades

## Future Enhancements

- Analytics dashboard with charts/graphs
- Portfolio concentration analysis
- Trading frequency analysis
- Performance tracking (comparing emotional vs rational trades)
- Export trade history
- More sophisticated pattern detection

## License

This project is for educational purposes.

