import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Play,
  Target,
  Shield,
  Landmark,
  Clock,
  Repeat,
  DivideSquare,
  DiamondPlus,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input'; // Added missing Input import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import toast from 'react-hot-toast';

// Define a default stock object to prevent errors if the prop is not passed
const defaultStock = {
  symbol: '---',
  name: 'Loading...',
  price: 0.00,
  exchangeToken: null, 
};

export const TradingForm = ({ stock = defaultStock, onBack }) => {
  // State initialization
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
  const [price, setPrice] = useState(stock.price); 

  // Effect to fetch the latest price when the stock symbol changes
  useEffect(() => {
    // Do not fetch if the stock symbol is the default loading state
    if (!stock || stock.symbol === '---') {
      return;
    }

    // console.log("exchange token:", stock.exchange_token);

    const fetchPrice = async () => {
      try {
        const res = await fetch(`http://127.0.1.0:3000/cmp/${stock.symbol}`);
        if (!res.ok) {
          throw new Error('Failed to fetch price');
        }
        const json = await res.json();
        // Assuming the API returns an object like { price: 123.45 }
        // We take the first value from the object. Adjust if the format differs.
        const fetchedPrice = Object.values(json)[0];
        if (typeof fetchedPrice === 'number') {
          setPrice(fetchedPrice);
        }
      } catch (error) {
        console.error("Price fetch error:", error);
        toast.error("Could not fetch latest stock price.");
      }
    };

    fetchPrice();
  }, [stock.symbol]); // Re-run this effect when the stock symbol changes

  // Add a loading state or return null if stock is not yet available
  if (!stock || stock.symbol === '---') {
    return <div>Loading stock data...</div>;
  }

  // Consolidated function to handle form submission and API call
  const handleStartLoop = async () => {
    // --- 1. Field Validation ---
    const requiredFields = { position, tradeType, orderType, takeProfit, stopLoss, frequency, qtyTargetDivisions, qtyStopLossDivision };
    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value) {
        toast.error(`Please select or enter a value for ${fieldName}.`);
        return; // Stop execution if a field is missing
      }
    }

    const tpValue = parseFloat(takeProfit);
    const slValue = parseFloat(stopLoss);
    const currentPrice = parseFloat(price);

    if (isNaN(tpValue) || isNaN(slValue)) {
      toast.error('Take Profit and Stop Loss must be valid numbers.');
      return;
    }

    // --- 2. Logical Validation (TP/SL vs. Current Price) ---
    if (position === 'Buy') {
      if (tpValue <= currentPrice) {
        toast.error('For a "Buy" position, Take Profit must be higher than the current price.');
        return;
      }
      if (slValue >= currentPrice) {
        toast.error('For a "Buy" position, Stop Loss must be lower than the current price.');
        return;
      }
    } else { // Position is 'Sell'
      if (tpValue >= currentPrice) {
        toast.error('For a "Sell" position, Take Profit must be lower than the current price.');
        return;
      }
      if (slValue <= currentPrice) {
        toast.error('For a "Sell" position, Stop Loss must be higher than the current price.');
        return;
      }
    }

    setIsLoading(true);

    // --- 3. Construct API Payload ---
    const orderData = {
      trading_symbol: stock.symbol,
      exchange_token: stock.exchange_token || '',
      exchange: exchange,
      transaction_type: position.toUpperCase(),
      order_type: orderType.toUpperCase(),
      quantity: parseInt(quantity, 10),
      target_price: takeProfit,
      stop_loss: stopLoss,
      frequency: parseInt(frequency, 10),
      quantity_target_division: parseInt(qtyTargetDivisions, 10),
      quantity_stoploss_division: parseInt(qtyStopLossDivision, 10)
    };

    // console.log("ORDER DATA============>>>>>>>>>>", orderData);

    // --- 4. Make the API Call ---
    try {
      const response = await fetch('http://127.0.1.0:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      await response.json();
      toast.success(`Trading loop started for ${orderData.trading_symbol}!`);

    } catch (error) {
      console.error('Failed to start trading loop:', error);
      toast.error(`Submission Failed: ${error.message}`);
    } finally {
      setIsLoading(false); // Ensure loading is turned off
    }
  };

  const isBuy = position === 'Buy';

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='h-10 w-10 cursor-pointer hover:bg-white/10'
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Setup Trading Parameters</h1>
          <p className='text-muted-foreground'>
            Configure your trading strategy
          </p>
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
              <div className='text-2xl font-bold'>
                ₹{price}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Column 1 */}
            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='position' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' /> Position
                </Label>
                <Select onValueChange={(value) => setPosition(value)} value={position}>
                  <SelectTrigger><SelectValue placeholder="Select a position" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sell">Sell</SelectItem>
                    <SelectItem value="Buy">Buy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='tradeType' className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' /> Type
                </Label>
                <Select onValueChange={(value) => setTradeType(value)} value={tradeType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intraday">Intraday</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='orderType' className='flex items-center gap-2'>
                  <ShoppingCart className='h-4 w-4' /> Order Type
                </Label>
                <Select onValueChange={(value) => setOrderType(value)} value={orderType}>
                  <SelectTrigger><SelectValue placeholder="Select order type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Market">Market</SelectItem>
                    <SelectItem value="Limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Column 2 */}
            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='exchange' className='flex items-center gap-2'>
                  <Landmark className='h-4 w-4' /> Exchange
                </Label>
                <Select onValueChange={(value) => setExchange(value)} defaultValue={exchange}>
                  <SelectTrigger><SelectValue placeholder="Select exchange" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSE">NSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='quantity' className='flex items-center gap-2'>
                  <DiamondPlus className='h-4 w-4' /> Quantity
                </Label>
                <Input id='quantity' type='number' placeholder='e.g., 2' value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='frequency' className='flex items-center gap-2'>
                  <Repeat className='h-4 w-4' /> Frequency
                </Label>
                <Input id='frequency' type='number' placeholder='e.g., 10' value={frequency} onChange={(e) => setFrequency(e.target.value)} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='qtyTargetDivisions' className='flex items-center gap-2'>
                  <DivideSquare className='h-4 w-4' /> Qty Target Divisions
                </Label>
                <Input id='qtyTargetDivisions' type='number' placeholder='e.g., 2' value={qtyTargetDivisions} onChange={(e) => setQtyTargetDivisions(e.target.value)} />
              </div>
            </div>
            {/* Column 3 */}
            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='qtyStopLossDivision' className='flex items-center gap-2'>
                  <DivideSquare className='h-4 w-4' /> Qty Stop Loss Division
                </Label>
                <Input id='qtyStopLossDivision' type='number' placeholder='e.g., 2' value={qtyStopLossDivision} onChange={(e) => setQtyStopLossDivision(e.target.value)} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='takeProfit' className={`flex items-center gap-2 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                  <Target className='h-4 w-4' /> Take Profit (TP)
                </Label>
                <Input id='takeProfit' type='number' placeholder='Enter take profit price' value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} step='0.01' />
                <p className='text-xs text-muted-foreground'>
                  TP should be {isBuy ? 'higher' : 'lower'} than current price: ₹{price}
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='stopLoss' className={`flex items-center gap-2 ${isBuy ? 'text-red-500' : 'text-green-500'}`}>
                  <Shield className='h-4 w-4' /> Stop Loss (SL)
                </Label>
                <Input id='stopLoss' type='number' placeholder='Enter stop loss price' value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} step='0.01' />
                <p className='text-xs text-muted-foreground'>
                  SL should be {isBuy ? 'lower' : 'higher'} than current price: ₹{price}
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-center'>
            <Button
              onClick={handleStartLoop}
              disabled={isLoading}
              className='w-50 h-14 hover:bg-white/80 text-lg bg-white text-black font-semibold glow-effect mt-6'
              size='lg'
            >
              {isLoading ? (
                'Starting Loop...'
              ) : (
                <>
                  <Play className='mr-2 h-5 w-5' />
                  Start Trading Loop
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
