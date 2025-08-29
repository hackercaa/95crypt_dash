import React from 'react';
import { TokenCard } from './TokenCard';
import { Loader2 } from 'lucide-react';
import { Token, PriceData } from '../types';

interface TokenGridProps {
  tokens: Token[];
  priceData: Record<string, PriceData>;
  loading: boolean;
  error: string | null;
  selectedToken: string;
  onTokenSelect: (symbol: string) => void;
  onRemoveToken: (id: string) => void;
}

export const TokenGrid: React.FC<TokenGridProps> = ({
  tokens,
  priceData,
  loading,
  error,
  selectedToken,
  onTokenSelect,
  onRemoveToken
}) => {
  if (loading && tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading tokens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-xl p-6 text-center">
        <p className="text-red-300">Error loading tokens: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Token Portfolio</h2>
        <div className="text-sm text-gray-400">
          {tokens.length} tokens tracked
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tokens.map(token => (
          <TokenCard
            key={token.id}
            token={token}
            priceData={priceData[token.symbol]}
            isSelected={selectedToken === token.symbol}
            onClick={() => onTokenSelect(token.symbol)}
            onRemove={() => onRemoveToken(token.id)}
          />
        ))}
      </div>
      
      {tokens.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No tokens added yet</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Token" to get started</p>
        </div>
      )}
    </div>
  );
};