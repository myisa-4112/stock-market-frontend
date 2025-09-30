import { useState } from 'react'
import { TradingForm } from './components/TradingForm'
import { StockSearch } from './components/StockSearch'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function App() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock)
  }

  const handleBack = () => {
    setSelectedStock(null)
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container max-w-2xl mx-auto px-4 py-8'>
        {selectedStock ? (
          <TradingForm stock={selectedStock} onBack={handleBack} />
        ) : (
          <StockSearch onStockSelect={handleStockSelect} />
        )}
      </div>
    </div>
  )
}
