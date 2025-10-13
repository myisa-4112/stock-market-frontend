import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [eventLog, setEventLog] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connectWebSocket = () => {
    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      console.log("WebSocket is already connected or connecting.");
      return;
    }
    console.log("Attempting to connect WebSocket...");
    setConnectionStatus('connecting');
    ws.current = new WebSocket('ws://127.0.1.0:3000/ws/positions');

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setConnectionStatus('connected');
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };

    ws.current.onmessage = (event) => {
      // 1. Log whenever ANY message arrives.
      console.log('CONTEXT: onmessage event fired!');
      
      // 2. Log the raw, unprocessed data from the server.
      console.log('CONTEXT: Raw event.data:', event.data);

      if (!event.data || (typeof event.data === 'string' && !event.data.trim())) {
        console.warn("CONTEXT: Received empty or whitespace-only message. Ignoring.");
        return;
      }
      // ... rest of onmessage function
      let parsedMessage;
      let isJson = false;
      try {
        parsedMessage = JSON.parse(event.data);
        isJson = true;
      } catch (error) {
        console.error("CONTEXT: Failed to parse JSON. Treating as plain text.", error);
        parsedMessage = { event: 'MESSAGE', message: String(event.data), timestamp: new Date().toISOString() };
      }
      const normalizedMessage = {
        event: parsedMessage.event || 'UPDATE',
        message: parsedMessage.message || (isJson ? JSON.stringify(parsedMessage) : String(parsedMessage)),
        timestamp: parsedMessage.timestamp || new Date().toISOString(),
        ...(parsedMessage.data && { data: parsedMessage.data })
      };
      console.log('CONTEXT: Parsed and normalized message:', normalizedMessage);
      console.log('CONTEXT: Calling setEventLog to update UI...');
      setEventLog(prevLog => [normalizedMessage, ...prevLog].slice(0, 100));
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setConnectionStatus('error');
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket disconnected. Reconnecting in 3s...", event.reason);
      setConnectionStatus('disconnected');
      // Only set a new timeout if one isn't already scheduled
      if (!reconnectTimeout.current) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectTimeout.current = null; // Clear the ref after timeout runs
          connectWebSocket();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    // CHANGE: Wrap the initial connection in a short timeout
    // This gives the backend server a moment to start up in a dev environment.
    const initialConnectTimeout = setTimeout(() => {
      connectWebSocket();
    }, 500); // 500ms delay

    return () => {
      clearTimeout(initialConnectTimeout); // Clean up the initial timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (data) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log('CONTEXT: Sending message:', data); // CRITICAL LOG
        ws.current.send(JSON.stringify(data));
        return true;
      } else {
        console.error("CONTEXT: Cannot send message, WebSocket is not open.");
        return false;
      }
  };

  const value = {
    eventLog,
    connectionStatus,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

