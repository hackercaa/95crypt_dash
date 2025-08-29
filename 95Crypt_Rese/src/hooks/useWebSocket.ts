import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  const subscribeToToken = (symbol: string) => {
    if (socket) {
      socket.emit('subscribe_token', symbol);
    }
  };

  const unsubscribeFromToken = (symbol: string) => {
    if (socket) {
      socket.emit('unsubscribe_token', symbol);
    }
  };

  return {
    socket,
    isConnected,
    subscribeToToken,
    unsubscribeFromToken
  };
};