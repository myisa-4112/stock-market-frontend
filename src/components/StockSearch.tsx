import { useState } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Input } from './ui/input'
import { Card } from './ui/card'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockSearchProps {
  onStockSelect: (stock: Stock) => void
}

const POPULAR_STOCKS: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2985.5, // Placeholder
    change: 15.2, // Placeholder
    changePercent: 0.51, // Placeholder
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    price: 1580.75, // Placeholder
    change: -5.1, // Placeholder
    changePercent: -0.32, // Placeholder
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    price: 3670.3, // Placeholder
    change: 30.15, // Placeholder
    changePercent: 0.83, // Placeholder
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    price: 1520.1, // Placeholder
    change: -8.9, // Placeholder
    changePercent: -0.58, // Placeholder
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    price: 1105.45, // Placeholder
    change: 12.5, // Placeholder
    changePercent: 1.14, // Placeholder
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd',
    price: 2470.8, // Placeholder
    change: 5.6, // Placeholder
    changePercent: 0.23, // Placeholder
  },
  {
    symbol: 'L&T',
    name: 'Larsen & Toubro Ltd',
    price: 3350.6, // Placeholder
    change: 25.8, // Placeholder
    changePercent: 0.77, // Placeholder
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd',
    price: 435.9, // Placeholder
    change: -1.2, // Placeholder
    changePercent: -0.27, // Placeholder
  },
]

export const StockSearch = ({ onStockSelect }: StockSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStocks = POPULAR_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-4xl font-bold gradient-text'>Stock Trader</h1>
        <p className='text-muted-foreground'>
          Search and select a stock to start trading
        </p>
      </div>

      <div className='relative'>
        <Search className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
        <Input
          placeholder='Search stocks (AAPL, GOOGL, etc.)'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10 h-12 text-lg'
        />
      </div>

      <div className='grid gap-3'>
        <h2 className='text-lg font-semibold text-foreground'>
          Popular Stocks
        </h2>
        {filteredStocks.map((stock) => (
          <Card
            key={stock.symbol}
            className='glass-card p-4 cursor-pointer transition-all duration-300 hover:glow-effect hover:scale-[1.02] active:scale-[0.98]'
            onClick={() => onStockSelect(stock)}
          >
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-lg text-foreground'>
                    {stock.symbol}
                  </span>
                  {stock.change > 0 ? (
                    <TrendingUp className='h-4 w-4 text-profit' />
                  ) : (
                    <TrendingDown className='h-4 w-4 text-loss' />
                  )}
                </div>
                <p className='text-muted-foreground text-sm'>{stock.name}</p>
              </div>
              <div className='text-right'>
                <div className='font-bold text-lg'>
                  ₹{stock.price.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stock.change > 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {stock.change > 0 ? '+' : ''}
                  {stock.change.toFixed(2)} (
                  {stock.changePercent > 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
