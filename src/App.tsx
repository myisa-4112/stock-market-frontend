import { useState } from 'react'
import { TradingForm } from './components/TradingForm'
import { StockSearch } from './components/StockSearch'
import { Toaster } from 'react-hot-toast';

interface Stock {
  name: string;
  symbol: string;
  exchange_token: string;
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
      <Toaster 
        position="top-right" 
        toastOptions={{
        className: '',
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#fff',
          background: 'black',
        },
      }}
      />
    </div>
  )
}
