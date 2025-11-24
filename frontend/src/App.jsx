import TradeForm from './components/TradeForm'
import TradeList from './components/TradeList'

function App() {
  return (
    <div className="App">
      <h1>Emotional Trading Risk Analyzer</h1>
      <p>Welcome! This app will help you analyze your trading behavior.</p>
      <TradeForm />
      <TradeList />
    </div>
  )
}

export default App

