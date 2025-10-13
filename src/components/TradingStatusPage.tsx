import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "./ui/card";
import { Button } from './ui/button';
import { useWebSocket } from '../contexts/WebSocketContext.jsx'; // Import the custom hook
import { useEffect } from 'react';



const PositionTracker = () => {
  const navigate = useNavigate();
  const { eventLog, connectionStatus } = useWebSocket();

  // console.log("Events LOg================>>>>>>",eventLog);
  

  // This function remains the same
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    eventLog.forEach((event) => {
      if (event.event === 'loop_end') {
        navigate('/');
      }
    });
  }, [eventLog]);
  
  return (
    <Card className="glass-card mt-6">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-bold">Live Event Log</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {eventLog.length} events
          </span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            ● {connectionStatus.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto space-y-2">
        {/* ... (this JSX for displaying the log remains exactly the same) ... */}
        {eventLog.length === 0 && (
          <p className="text-muted-foreground">
            {connectionStatus === 'connected' ? 'Waiting for events...' : 'Connecting to server...'}
          </p>
        )}
        {eventLog.map((event, index) => (
          <div key={index} className="border-l-2 border-gray-700 pl-3 py-1 hover:bg-white/5 transition-colors">
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-400 whitespace-nowrap">
                [{event.event}]
              </span>
              <div className="flex-1">
                <span className="text-muted-foreground break-words">
                  {event.message}
                </span>
                {event.data && (
                  <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
            {event.timestamp && (
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const TradingStatusPage = () => {
  // ... (this parent component remains exactly the same)
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  if (!orderDetails) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">No Trading Data</h1>
        <p className="text-muted-foreground mt-2">Please set up a new trade first.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go to Search</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Live Trading Status</h1>
          <p className='text-muted-foreground'>
            Monitoring loop for <span className="font-bold">{orderDetails.trading_symbol}</span>
          </p>
        </div>
      </div>

      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold border-b border-border pb-2 mb-4">Submitted Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <p><strong>Symbol:</strong> {orderDetails.trading_symbol}</p>
          <p><strong>Position:</strong> {orderDetails.transaction_type}</p>
          <p><strong>Quantity:</strong> {orderDetails.quantity}</p>
          <p><strong>Order Type:</strong> {orderDetails.order_type}</p>
          <p className="text-green-400"><strong>Take Profit:</strong> ₹{orderDetails.target_price}</p>
          <p className="text-red-400"><strong>Stop Loss:</strong> ₹{orderDetails.stop_loss}</p>
        </div>
      </Card>

      <PositionTracker />
    </div>
  );
};
