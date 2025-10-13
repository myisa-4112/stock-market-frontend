import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from './contexts/WebSocketContext.jsx'; 

// Component Imports
import { StockSearch } from './components/StockSearch.jsx';
import { TradingForm } from './components/TradingForm.jsx';
import { TradingStatusPage } from './components/TradingStatusPage.jsx';

export default function App() {
  return (
    // Wrap the Router with our WebSocketProvider
    <WebSocketProvider>
      <Router>
        <div className='min-h-screen bg-background'>
          <div className='container max-w-2xl mx-auto px-4 py-8'>
            <Routes>
              <Route path="/" element={<StockSearch />} />
              <Route path="/trade" element={<TradingForm />} />
              <Route path="/status" element={<TradingStatusPage />} />
            </Routes>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                border: '1px solid #713200',
                padding: '16px',
                color: '#fff',
                background: 'black',
              },
            }}
          />
        </div>
      </Router>
    </WebSocketProvider>
  );
}
