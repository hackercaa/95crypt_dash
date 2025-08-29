import React from 'react';
import { TrendingUp, TrendingDown, X, ExternalLink } from 'lucide-react';
import { Token, PriceData } from '../types';
import { format } from 'date-fns';

interface TokenCardProps {
  token: Token;
  priceData?: PriceData;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  token,
  priceData,
  isSelected,
  onClick,
  onRemove
}) => {
  const isPositive = priceData?.change24h && priceData.change24h > 0;
  
  return (
    <div
      className={`relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isSelected 
          ? 'border-blue-500 shadow-blue-500/20 shadow-lg' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-3 right-3 w-6 h-6 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{token.symbol}</h3>
            <p className="text-sm text-gray-400">{token.name}</p>
          </div>
          {priceData && (
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {priceData.change24h > 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        {priceData ? (
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-white">
                ${priceData.averagePrice.toFixed(4)}
              </div>
              <div className="text-xs text-gray-400">Average price</div>
              
              {/* Trading Status Indicator */}
              {priceData.exchanges.mexc?.status && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  priceData.exchanges.mexc.tradingEnabled 
                    ? 'bg-success-500/20 text-success-400' 
                    : 'bg-warning-500/20 text-warning-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    priceData.exchanges.mexc.tradingEnabled ? 'bg-success-400 animate-pulse' : 'bg-warning-400'
                  }`} />
                  {priceData.exchanges.mexc.status}
                </div>
              )}
            </div>
            
            {/* 24h High/Low */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {priceData.exchanges.mexc?.high24h && (
                <div className="bg-green-600/10 rounded-lg p-2 border border-green-600/20">
                  <div className="text-xs text-green-400">24h High</div>
                  <div className="font-medium text-green-300 text-sm">
                    ${priceData.exchanges.mexc.high24h.toFixed(4)}
                  </div>
                </div>
              )}
              {priceData.exchanges.mexc?.low24h && (
                <div className="bg-red-600/10 rounded-lg p-2 border border-red-600/20">
                  <div className="text-xs text-red-400">24h Low</div>
                  <div className="font-medium text-red-300 text-sm">
                    ${priceData.exchanges.mexc.low24h.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {priceData.exchanges.mexc && (
                <div className="bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">MEXC</div>
                  <div className="font-medium text-white">
                    ${priceData.exchanges.mexc.price.toFixed(4)}
                  </div>
                  {priceData.exchanges.mexc.volume24h && (
                    <div className="text-xs text-gray-500">
                      Vol: ${(priceData.exchanges.mexc.volume24h / 1000000).toFixed(2)}M
                    </div>
                  )}
                </div>
              )}
              {priceData.exchanges.gateio && (
                <div className="bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Gate.io</div>
                  <div className="font-medium text-white">
                    ${priceData.exchanges.gateio.price.toFixed(4)}
                  </div>
                  {priceData.exchanges.gateio.volume24h && (
                    <div className="text-xs text-gray-500">
                      Vol: ${(priceData.exchanges.gateio.volume24h / 1000000).toFixed(2)}M
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* ATH/ATL Display */}
            {(token.allTimeHigh || token.allTimeLow) && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  {token.allTimeHigh && (
                    <div className="text-center">
                      <div className="text-xs text-yellow-400 font-medium">ATH</div>
                      <div className="text-sm font-bold text-yellow-300">
                        ${token.allTimeHigh.toFixed(4)}
                      </div>
                      {priceData && (
                        <div className="text-xs text-gray-400">
                          {((priceData.averagePrice - token.allTimeHigh) / token.allTimeHigh * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}
                  {token.allTimeLow && (
                    <div className="text-center">
                      <div className="text-xs text-blue-400 font-medium">ATL</div>
                      <div className="text-sm font-bold text-blue-300">
                        ${token.allTimeLow.toFixed(4)}
                      </div>
                      {priceData && (
                        <div className="text-xs text-gray-400">
                          +{((priceData.averagePrice - token.allTimeLow) / token.allTimeLow * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {token.athLastUpdated && (
                  <div className="text-xs text-gray-500 text-center mt-1">
                    Updated: {format(new Date(token.athLastUpdated), 'MM/dd/yy')}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {token.exchanges.map(exchange => (
              <span
                key={exchange}
                className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
              >
                {exchange.toUpperCase()}
              </span>
            ))}
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};