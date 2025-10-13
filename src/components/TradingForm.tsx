import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Target, Shield, Landmark, Clock, Repeat,
  DivideSquare, DiamondPlus, TrendingUp, ShoppingCart
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import toast from 'react-hot-toast';
import axios from 'axios';
// STEP 1: Import the hook to access the shared connection
import { useWebSocket } from '../contexts/WebSocketContext.jsx';

const defaultStock = {
  symbol: '---',
  name: 'Loading...',
  exchange_token: null,
};

export const TradingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // STEP 2: Get the sendMessage function from our shared context
  const { sendMessage, connectionStatus } = useWebSocket();

  const stock = location.state?.selectedStock || defaultStock;
  const [position, setPosition] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [orderType, setOrderType] = useState('');
  const [exchange, setExchange] = useState('NSE');
  const [frequency, setFrequency] = useState('');
  const [qtyTargetDivisions, setQtyTargetDivisions] = useState('');
  const [quantity, setQuantity] = useState('');
  const [qtyStopLossDivision, setQtyStopLossDivision] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    // ... price fetching logic is unchanged ...
    if (!stock || stock.symbol === '---') return;
    setPrice(null);
    const fetchPrice = async () => {
      try {
        const res = await fetch(`http://127.0.1.0:3000/cmp/${stock.symbol}`);
        if (!res.ok) throw new Error('Failed to fetch price');
        const json = await res.json();
        const fetchedPrice = Object.values(json)[0];
        if (typeof fetchedPrice === 'number') {
          setPrice(fetchedPrice);
        } else { setPrice(0); }
      } catch (error) {
        console.error("Price fetch error:", error);
        toast.error("Could not fetch latest stock price.");
        setPrice(0);
      }
    };
    fetchPrice();
  }, [stock.symbol]);

  const handleStartLoop = async () => {
    // ... validation logic is unchanged ...
    if (price === null) {
      toast.error("Waiting for price data to load.");
      return;
    }
    const requiredFields = { position, tradeType, orderType, takeProfit, stopLoss, frequency, qtyTargetDivisions, qtyStopLossDivision };
    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value) {
        toast.error(`Please provide a value for ${fieldName}.`);
        return;
      }
    }

    setIsLoading(true);

    const orderData = {
      trading_symbol: stock.symbol,
      exchange_token: stock.exchange_token || '',
      exchange,
      transaction_type: position.toUpperCase(),
      order_type: orderType.toUpperCase(),
      quantity: parseInt(quantity, 10),
      target_price: takeProfit,
      stop_loss: stopLoss,
      frequency: parseInt(frequency, 10),
      quantity_target_division: parseInt(qtyTargetDivisions, 10),
      quantity_stoploss_division: parseInt(qtyStopLossDivision, 10)
    };

    try{
      const res = await axios.post('http://127.0.1.0:3000/order', orderData);
      console.log("results",res);
      
      if (res.data.status === 'success') {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending order:", error);
      toast.error("Failed to send order. Please try again.");
      setIsLoading(false);
      return;
    }
    
    // STEP 3: Use the context's sendMessage function. DO NOT create a new WebSocket here.
    const wasSent = sendMessage(orderData);

    if (wasSent) {
      toast.success(`Order for ${orderData.trading_symbol} sent successfully!`);
      navigate('/status', { state: { orderDetails: orderData } });
    } else {
      toast.error("Failed to send order. Connection not ready.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // ... margin fetching logic is unchanged ...
    if (!quantity || parseInt(quantity, 10) <= 0 || !position || !orderType) return;
    const debounceTimer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const requestData = {
            trading_symbol: stock.symbol,
            order_type: orderType.toUpperCase(),
            transaction_type: position.toUpperCase(),
            quantity: Number(quantity),
          };
          const res = await axios.post('http://127.0.1.0:3000/margin', requestData);
          toast.success(`Total Margin Required: ${res.data.total_requirement.toFixed(2)}`);
        } catch (error) { toast.error("Failed to fetch margin requirements."); }
      };
      fetchData();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [quantity, position, orderType, stock.symbol]);

  const isBuy = position === 'Buy';

  return (
     <div className='space-y-6'>
        {/* ... The entire JSX for the form is unchanged ... */}
        <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => navigate('/')} className='h-10 w-10 cursor-pointer hover:bg-white/10'><ArrowLeft className='h-5 w-5' /></Button>
            <div>
                <h1 className='text-2xl font-bold'>Setup Trading Parameters</h1>
                <p className='text-muted-foreground'>Configure your trading strategy</p>
            </div>
        </div>
        <Card className='glass-card p-6'>
            <div className='space-y-4'>
                <div className='flex items-center justify-between pb-4 border-b border-border'>
                    <div>
                        <h3 className='text-xl font-bold'>{stock.name}</h3>
                        <p className='text-muted-foreground'>{stock.symbol}</p>
                    </div>
                    <div className='text-right'>
                        <div className='text-2xl font-bold'>₹{price !== null ? price.toFixed(2) : '...'}</div>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-6'>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><TrendingUp className='h-4 w-4' /> Position</Label><Select onValueChange={setPosition} value={position}><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger><SelectContent><SelectItem value="Sell">Sell</SelectItem><SelectItem value="Buy">Buy</SelectItem></SelectContent></Select></div>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><Clock className='h-4 w-4' /> Type</Label><Select onValueChange={setTradeType} value={tradeType}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Intraday">Intraday</SelectItem><SelectItem value="Delivery">Delivery</SelectItem></SelectContent></Select></div>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><ShoppingCart className='h-4 w-4' /> Order Type</Label><Select onValueChange={setOrderType} value={orderType}><SelectTrigger><SelectValue placeholder="Select order type" /></SelectTrigger><SelectContent><SelectItem value="Market">Market</SelectItem><SelectItem value="Limit">Limit</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className='space-y-6'>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><Landmark className='h-4 w-4' /> Exchange</Label><Select onValueChange={setExchange} defaultValue={exchange}><SelectTrigger><SelectValue placeholder="Select exchange" /></SelectTrigger><SelectContent><SelectItem value="NSE">NSE</SelectItem></SelectContent></Select></div>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><DiamondPlus className='h-4 w-4' /> Quantity</Label><Input type='number' placeholder='e.g., 2' value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><Repeat className='h-4 w-4' /> Frequency</Label><Input type='number' placeholder='e.g., 10' value={frequency} onChange={(e) => setFrequency(e.target.value)} /></div>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><DivideSquare className='h-4 w-4' /> Qty Target Divisions</Label><Input type='number' placeholder='e.g., 2' value={qtyTargetDivisions} onChange={(e) => setQtyTargetDivisions(e.target.value)} /></div>
                    </div>
                    <div className='space-y-6'>
                        <div className='space-y-2'><Label className='flex items-center gap-2'><DivideSquare className='h-4 w-4' /> Qty Stop Loss Division</Label><Input type='number' placeholder='e.g., 2' value={qtyStopLossDivision} onChange={(e) => setQtyStopLossDivision(e.target.value)} /></div>
                        <div className='space-y-2'><Label className={`flex items-center gap-2 ${isBuy ? 'text-green-500' : 'text-red-500'}`}><Target className='h-4 w-4' /> Take Profit (TP)</Label><Input type='number' placeholder='Enter take profit price' value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} step='0.01' /></div>
                        <div className='space-y-2'><Label className={`flex items-center gap-2 ${isBuy ? 'text-red-500' : 'text-green-500'}`}><Shield className='h-4 w-4' /> Stop Loss (SL)</Label><Input type='number' placeholder='Enter stop loss price' value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} step='0.01' /></div>
                    </div>
                </div>
                <div className='flex justify-center'>
                    <Button onClick={handleStartLoop} disabled={isLoading || price === null || connectionStatus !== 'connected'} className='w-50 h-14 hover:bg-white/80 text-lg bg-white text-black font-semibold glow-effect mt-6' size='lg'>
                        {connectionStatus !== 'connected' ? 'Connecting...' : isLoading ? 'Sending...' : <><Play className='mr-2 h-5 w-5' /> Start Trading Loop</>}
                    </Button>
                </div>
            </div>
        </Card>
    </div>
  );
};

