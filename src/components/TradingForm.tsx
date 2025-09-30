import { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Target,
  Shield,
  Landmark,
  Clock,
  Repeat,
  DivideSquare,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';

// NOTE: These are placeholder components. In a real app, you would import them from your UI library.
const Button = ({ children, ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${props.className}`}
  >
    {children}
  </button>
);
const Card = ({ children, ...props }) => (
  <div {...props} className={`rounded-lg border bg-card text-card-foreground shadow-sm ${props.className}`}>
    {children}
  </div>
);
const Label = ({ children, ...props }) => (
  <label {...props} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${props.className}`}>
    {children}
  </label>
);
const Input = (props) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}
  />
);
const Select = ({ children, ...props }) => (
    <select {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}>
        {children}
    </select>
);

// A placeholder hook for toast notifications
const useToast = () => {
    const toast = ({ title, description, variant }) => {
        // In a real app, this would trigger a toast notification.
        // We'll just log it to the console for this example.
        console.log(`TOAST (${variant || 'default'}): ${title} - ${description}`);
        // A simple alert for visibility in the browser
        window.alert(`[${title}] ${description}`);
    };
    return { toast };
};


export const TradingForm = ({ stock, onBack }) => {
  // State initialization based on the provided image
  const [position, setPosition] = useState('Sell');
  const [tradeType, setTradeType] = useState('Intraday');
  const [orderType, setOrderType] = useState('Market');
  const [exchange, setExchange] = useState('NSE');
  const [frequency, setFrequency] = useState('10');
  const [qtyTargetDivisions, setQtyTargetDivisions] = useState('2');
  const [qtyStopLossDivision, setQtyStopLossDivision] = useState('2');
  const [takeProfit, setTakeProfit] = useState('1100');
  const [stopLoss, setStopLoss] = useState('490');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartLoop = async () => {
    const requiredFields = { takeProfit, stopLoss, frequency, qtyTargetDivisions, qtyStopLossDivision };
    for (const [fieldName, value] of Object.entries(requiredFields)) {
        if (!value) {
            toast({
                title: 'Missing Values',
                description: `Please enter a value for ${fieldName}.`,
                variant: 'destructive',
            });
            return;
        }
    }

    const tpValue = parseFloat(takeProfit);
    const slValue = parseFloat(stopLoss);

    if (isNaN(tpValue) || isNaN(slValue)) {
      toast({
        title: 'Invalid Values',
        description: 'Please enter valid numeric values for Take Profit and Stop Loss.',
        variant: 'destructive',
      });
      return;
    }

    if (position === 'Buy' && tpValue <= stock.price) {
      toast({
        title: 'Invalid Take Profit',
        description: 'For a "Buy" position, Take Profit should be higher than the current price.',
        variant: 'destructive',
      });
      return;
    }
     if (position === 'Buy' && slValue >= stock.price) {
      toast({
        title: 'Invalid Stop Loss',
        description: 'For a "Buy" position, Stop Loss should be lower than the current price.',
        variant: 'destructive',
      });
      return;
    }

    if (position === 'Sell' && tpValue >= stock.price) {
      toast({
        title: 'Invalid Take Profit',
        description: 'For a "Sell" position, Take Profit should be lower than the current price.',
        variant: 'destructive',
      });
      return;
    }

    if (position === 'Sell' && slValue <= stock.price) {
      toast({
        title: 'Invalid Stop Loss',
        description: 'For a "Sell" position, Stop Loss should be higher than the current price.',
        variant: 'destructive',
      });
      return;
    }


    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Trading Loop Started!',
        description: `Started ${exchange} ${tradeType} ${position} loop for ${stock.symbol} with TP: ₹${tpValue} & SL: ₹${slValue}`,
      });
    }, 2000);
  };

  const isBuy = position === 'Buy';
  const potentialProfit = isBuy ? parseFloat(takeProfit) - stock.price : stock.price - parseFloat(takeProfit);
  const potentialLoss = isBuy ? stock.price - parseFloat(stopLoss) : parseFloat(stopLoss) - stock.price;
  const profitPercentage = (potentialProfit / stock.price) * 100;
  const lossPercentage = (potentialLoss / stock.price) * 100;


  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='h-10 w-10'
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
              <h3 className='text-xl font-bold'>{stock.symbol}</h3>
              <p className='text-muted-foreground'>{stock.name}</p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold'>
                ₹{stock.price.toFixed(2)}
              </div>
              <div
                className={`text-sm font-medium ${
                  stock.change > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stock.change > 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({stock.changePercent > 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
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
                    <Select id='position' value={position} onChange={(e) => setPosition(e.target.value)}>
                        <option value="Sell">Sell</option>
                        <option value="Buy">Buy</option>
                    </Select>
                </div>
                 <div className='space-y-2'>
                    <Label htmlFor='tradeType' className='flex items-center gap-2'>
                        <Clock className='h-4 w-4' /> Type
                    </Label>
                    <Select id='tradeType' value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                        <option value="Intraday">Intraday</option>
                        <option value="Delivery">Delivery</option>
                    </Select>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='orderType' className='flex items-center gap-2'>
                        <ShoppingCart className='h-4 w-4' /> Order Type
                    </Label>
                    <Select id='orderType' value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                    </Select>
                </div>
            </div>
            {/* Column 2 */}
             <div className='space-y-6'>
                <div className='space-y-2'>
                    <Label htmlFor='exchange' className='flex items-center gap-2'>
                        <Landmark className='h-4 w-4' /> Exchange
                    </Label>
                    <Select id='exchange' value={exchange} onChange={(e) => setExchange(e.target.value)}>
                        <option value="NSE">NSE</option>
                        <option value="BSE">BSE</option>
                    </Select>
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
                        TP should be {isBuy ? 'higher' : 'lower'} than current price: ₹{stock.price.toFixed(2)}
                    </p>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='stopLoss' className={`flex items-center gap-2 ${isBuy ? 'text-red-500' : 'text-green-500'}`}>
                        <Shield className='h-4 w-4' /> Stop Loss (SL)
                    </Label>
                    <Input id='stopLoss' type='number' placeholder='Enter stop loss price' value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} step='0.01' />
                     <p className='text-xs text-muted-foreground'>
                        SL should be {isBuy ? 'lower' : 'higher'} than current price: ₹{stock.price.toFixed(2)}
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

