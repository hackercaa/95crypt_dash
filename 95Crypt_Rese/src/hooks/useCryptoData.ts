import { useState, useEffect } from 'react';
import { Token, PriceData } from '../types';
import { useWebSocket } from './useWebSocket';
import toast from 'react-hot-toast';

export const useCryptoData = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, subscribeToToken } = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.on('price_update', (data: PriceData & { symbol: string }) => {
        setPriceData(prev => ({
          ...prev,
          [data.symbol]: data
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('price_update');
      }
    };
  }, [socket]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/tokens');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      const data = await response.json();
      setTokens(data);
      
      // Subscribe to price updates for all tokens
      data.forEach((token: Token) => {
        console.log('Subscribing to price updates for:', token.symbol);
        subscribeToToken(token.symbol);
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addToken = async (tokenData: Omit<Token, 'id'>) => {
    try {
      if (!tokenData.symbol) {
        throw new Error('Token symbol is required');
      }
      
      const response = await fetch('http://localhost:3001/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenData)
      });
      
      if (!response.ok) throw new Error('Failed to add token');
      const newToken = await response.json();
      setTokens(prev => [...prev, newToken]);
      subscribeToToken(newToken.symbol);
      return newToken;
    } catch (err) {
      console.error('Error adding token:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add token');
    }
  };

  const removeToken = async (id: string) => {
    try {
      if (!id) {
        throw new Error('Token ID is required');
      }
      
      const response = await fetch(`http://localhost:3001/api/tokens/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'User requested deletion',
          deletedBy: 'current_user'
        })
      });
      
      if (!response.ok) throw new Error('Failed to remove token');
      setTokens(prev => prev.filter(token => token.id !== id));
      toast.success('Token removed successfully');
    } catch (err) {
      console.error('Error removing token:', err);
      toast.error('Failed to remove token');
      throw err;
    }
  };

  const refreshData = () => {
    fetchTokens();
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return {
    tokens,
    priceData,
    loading,
    error,
    refreshData,
    addToken,
    removeToken
  };
};