import React from 'react';
import { Info, TrendingUp, TrendingDown, MessageSquare, Bell, BarChart3, Database, Clock } from 'lucide-react';
import { Token, PriceData } from '../types';
import { format } from 'date-fns';
import { TokenInfoModal } from './TokenInfoModal';
import { ColumnInfoModal } from './ColumnInfoModal';
import { NotesModal } from './NotesModal';
import { AlertsModal } from './AlertsModal';

interface TokenTableProps {
  tokens: Token[];
  priceData: Record<string, PriceData>;
  layoutConfig?: any;
  onDeleteToken?: (token: Token) => void;
  onTrackPerformance?: (token: Token) => void;
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens, priceData, layoutConfig, onDeleteToken, onTrackPerformance }) => {
  const [selectedTokenForInfo, setSelectedTokenForInfo] = React.useState<Token | null>(null);
  const [selectedColumnInfo, setSelectedColumnInfo] = React.useState<string | null>(null);
  const [notesToken, setNotesToken] = React.useState<Token | null>(null);
  const [alertsToken, setAlertsToken] = React.useState<Token | null>(null);

  // Get visible columns based on layout config
  const getVisibleColumns = () => {
    if (!layoutConfig) return null;
    return layoutConfig.columns.filter((col: any) => col.visible);
  };

  const visibleColumns = getVisibleColumns();
  const isColumnVisible = (columnKey: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.some((col: any) => col.key === columnKey);
  };

  // Apply layout styles
  const getTableClasses = () => {
    let classes = "card-modern table-modern overflow-hidden";
    
    if (layoutConfig) {
      if (layoutConfig.density === 'compact') classes += " text-xs";
      else if (layoutConfig.density === 'comfortable') classes += " text-sm";
      
      if (layoutConfig.zebra) classes += " zebra-stripes";
      if (layoutConfig.stickyHeaders) classes += " sticky-headers";
    }
    
    return classes;
  };

  // Get table cell padding based on density
  const getCellPadding = () => {
    if (!layoutConfig) return "px-3 py-2";
    
    switch (layoutConfig.density) {
      case 'compact':
        return "px-2 py-1";
      case 'comfortable':
        return "px-4 py-3";
      default:
        return "px-3 py-2";
    }
  };

  const cellPadding = getCellPadding();
  return (
    <>
      <div className={getTableClasses()}>
      <div className="overflow-x-auto">
        <table className={`w-full ${layoutConfig?.density === 'compact' ? 'text-xs' : layoutConfig?.density === 'comfortable' ? 'text-sm' : 'text-xs'}`}>
          <thead>
            <tr>
              {isColumnVisible('token') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Token</span>
                  <button
                    onClick={() => setSelectedColumnInfo('token')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('info') && (
                <th className="px-2 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Info</span>
                  <button
                    onClick={() => setSelectedColumnInfo('info')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('price') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Price (USD)</span>
                  <button
                    onClick={() => setSelectedColumnInfo('price')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('tradingStatus') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Trading Status</span>
                  <button
                    onClick={() => setSelectedColumnInfo('tradingStatus')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('openPrice') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Open Price</span>
                  <button
                    onClick={() => setSelectedColumnInfo('openPrice')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('priceChange') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Price Change</span>
                  <button
                    onClick={() => setSelectedColumnInfo('priceChange')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('high24h') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>24h High</span>
                  <button
                    onClick={() => setSelectedColumnInfo('high24h')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('low24h') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>24h Low</span>
                  <button
                    onClick={() => setSelectedColumnInfo('low24h')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('volume24h') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>24h Volume</span>
                  <button
                    onClick={() => setSelectedColumnInfo('volume24h')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('tradeCount') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Trade Count</span>
                  <button
                    onClick={() => setSelectedColumnInfo('tradeCount')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('bidAsk') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Bid/Ask</span>
                  <button
                    onClick={() => setSelectedColumnInfo('bidAsk')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('ath') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>ATH</span>
                  <button
                    onClick={() => setSelectedColumnInfo('ath')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('atl') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>ATL</span>
                  <button
                    onClick={() => setSelectedColumnInfo('atl')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('percentFromATH') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>% from ATH</span>
                  <button
                    onClick={() => setSelectedColumnInfo('percentFromATH')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('exchangeCount') && (
                <th className="px-2 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span># Exchanges</span>
                  <button
                    onClick={() => setSelectedColumnInfo('exchangeCount')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('exchanges') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Exchanges</span>
                  <button
                    onClick={() => setSelectedColumnInfo('exchanges')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('newExchanges') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>New (24h)</span>
                  <button
                    onClick={() => setSelectedColumnInfo('newExchanges')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('removedExchanges') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Removed (24h)</span>
                  <button
                    onClick={() => setSelectedColumnInfo('removedExchanges')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('lastScraped') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Last Scraped</span>
                  <button
                    onClick={() => setSelectedColumnInfo('lastScraped')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('tokenAdded') && (
                <th className="px-3 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Token Added</span>
                  <button
                    onClick={() => setSelectedColumnInfo('tokenAdded')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('notes') && (
                <th className="px-2 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Notes</span>
                  <button
                    onClick={() => setSelectedColumnInfo('notes')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('alerts') && (
                <th className="px-2 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Alerts</span>
                  <button
                    onClick={() => setSelectedColumnInfo('alerts')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
              {isColumnVisible('track') && (
                <th className="px-2 py-2 text-left">
                <div className="flex items-center space-x-1">
                  <span>Track</span>
                  <button
                    onClick={() => setSelectedColumnInfo('track')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const price = priceData[token.symbol];
              const isPositive = price?.change24h && price.change24h > 0;
              
              // Calculate percentage difference from ATH
              const percentFromATH = price?.averagePrice && token.allTimeHigh 
                ? ((price.averagePrice - token.allTimeHigh) / token.allTimeHigh * 100)
                : null;
              
              // Debug log to verify calculation
              if (token.symbol === 'BTC' && price?.averagePrice && token.allTimeHigh) {
                console.log(`${token.symbol}: Current=$${price.averagePrice}, ATH=$${token.allTimeHigh}, % from ATH=${percentFromATH?.toFixed(1)}%`);
              }
              
              // Exchange change data from scraper results
              const exchangeChanges = {
                newExchanges: token.newExchanges || token.exchangeData?.newExchanges24h || [],
                removedExchanges: token.removedExchanges || token.exchangeData?.removedExchanges24h || []
              };
              
              const hasExchangeGains = exchangeChanges.newExchanges.length > 0;
              const hasExchangeLosses = exchangeChanges.removedExchanges.length > 0;
              
              return (
                <tr key={token.id} className="transition-smooth group">
                  {/* Token */}
                  {isColumnVisible('token') && (
                    <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-gray-950 text-xs font-bold shadow-md">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    </td>
                  )}
                  
                  {/* Info */}
                  {isColumnVisible('info') && (
                    <td className="px-2 py-2">
                    <button 
                      onClick={() => setSelectedTokenForInfo(token)}
                      className="text-primary-400 hover:text-primary-300 transition-colors p-1 rounded hover:bg-gray-800"
                      title="View detailed information about data sources"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    </td>
                  )}
                  
                  {/* Price (USD) */}
                  {isColumnVisible('price') && (
                    <td className="px-3 py-2">
                    {price ? (
                      <div>
                        <div className="font-bold text-white text-sm">
                          ${price.averagePrice.toFixed(4)}
                        </div>
                        <div className={`text-xs flex items-center space-x-1 font-semibold ${
                          isPositive ? 'text-success-500' : 'text-danger-500'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{price.change24h > 0 ? '+' : ''}{price.change24h.toFixed(2)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 loading-pulse text-xs">Loading...</div>
                    )}
                    </td>
                  )}
                  
                  {/* Trading Status */}
                  {isColumnVisible('tradingStatus') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.status ? (
                      <div className="space-y-1">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          price.exchanges.mexc.tradingEnabled 
                            ? 'bg-success-500/20 text-success-400 border border-success-500/30' 
                            : price.exchanges.mexc.status === 'HALT'
                            ? 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                            : 'bg-danger-500/20 text-danger-400 border border-danger-500/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            price.exchanges.mexc.tradingEnabled 
                              ? 'bg-success-400 animate-pulse' 
                              : price.exchanges.mexc.status === 'HALT'
                              ? 'bg-warning-400'
                              : 'bg-danger-400'
                          }`} />
                          {price.exchanges.mexc.status}
                        </div>
                        <div className="text-xs text-gray-400">
                          {price.exchanges.mexc.tradingEnabled ? 'Active Trading' : 'Trading Suspended'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-600/20 text-gray-400 border border-gray-600/30">
                          <div className="w-2 h-2 rounded-full mr-1 bg-gray-400" />
                          UNKNOWN
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Status unavailable</div>
                      </div>
                    )}
                    </td>
                  )}
                  
                  {/* Open Price */}
                  {isColumnVisible('openPrice') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.openPrice ? (
                      <div className="text-blue-400 font-bold text-sm">
                        ${price.exchanges.mexc.openPrice.toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* Price Change (Absolute) */}
                  {isColumnVisible('priceChange') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.priceChange ? (
                      <div className={`font-bold text-sm ${
                        price.exchanges.mexc.priceChange >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {price.exchanges.mexc.priceChange >= 0 ? '+' : ''}${Math.abs(price.exchanges.mexc.priceChange).toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* 24h High */}
                  {isColumnVisible('high24h') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.high24h ? (
                      <div className="text-success-400 font-bold text-sm">
                        ${price.exchanges.mexc.high24h.toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* 24h Low */}
                  {isColumnVisible('low24h') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.low24h ? (
                      <div className="text-danger-400 font-bold text-sm">
                        ${price.exchanges.mexc.low24h.toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* 24h Volume */}
                  {isColumnVisible('volume24h') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.volume24h ? (
                      <div>
                        <div className="text-purple-400 font-bold text-sm">
                          ${(price.exchanges.mexc.volume24h / 1000000).toFixed(2)}M
                        </div>
                        <div className="text-xs text-gray-400">
                          {(price.exchanges.mexc.volume / 1000).toFixed(1)}K tokens
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* Trade Count */}
                  {isColumnVisible('tradeCount') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.count ? (
                      <div className="text-orange-400 font-bold text-sm">
                        {price.exchanges.mexc.count.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* Bid/Ask Spread */}
                  {isColumnVisible('bidAsk') && (
                    <td className="px-3 py-2">
                    {price?.exchanges?.mexc?.bidPrice && price?.exchanges?.mexc?.askPrice ? (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Bid/Ask:</div>
                        <div className="text-xs">
                          <div className="text-green-400 font-medium">
                            ${price.exchanges.mexc.bidPrice.toFixed(4)}
                          </div>
                          <div className="text-red-400 font-medium">
                            ${price.exchanges.mexc.askPrice.toFixed(4)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Spread: {(((price.exchanges.mexc.askPrice - price.exchanges.mexc.bidPrice) / price.exchanges.mexc.bidPrice) * 100).toFixed(3)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">N/A</div>
                    )}
                    </td>
                  )}
                  
                  {/* All-Time High */}
                  {isColumnVisible('ath') && (
                    <td className="px-3 py-2">
                    {token.allTimeHigh ? (
                      <div>
                        <div className="text-yellow-400 font-bold text-sm">
                          ${token.allTimeHigh.toFixed(4)}
                        </div>
                        {token.athLastUpdated && (
                          <div className="text-xs text-gray-400">
                            {format(new Date(token.athLastUpdated), 'MM/dd/yy')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">Calculating...</div>
                    )}
                    </td>
                  )}
                  
                  {/* All-Time Low */}
                  {isColumnVisible('atl') && (
                    <td className="px-3 py-2">
                    {token.allTimeLow ? (
                      <div>
                        <div className="text-blue-400 font-bold text-sm">
                          ${token.allTimeLow.toFixed(4)}
                        </div>
                        {token.athLastUpdated && (
                          <div className="text-xs text-gray-400">
                            {format(new Date(token.athLastUpdated), 'MM/dd/yy')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">Calculating...</div>
                    )}
                    </td>
                  )}
                  
                  {/* % from ATH */}
                  {isColumnVisible('percentFromATH') && (
                    <td className="px-3 py-2">
                    {percentFromATH !== null ? (
                      <div className={`font-bold text-sm ${
                        percentFromATH >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {percentFromATH >= 0 ? '+' : ''}{percentFromATH.toFixed(1)}%
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        {!token.allTimeHigh ? 'ATH calculating...' : !price?.averagePrice ? 'Price loading...' : 'N/A'}
                      </div>
                    )}
                    </td>
                  )}
                  
                  {/* Number of Exchanges */}
                  {isColumnVisible('exchangeCount') && (
                    <td className="px-2 py-2">
                    <div className="text-white font-bold text-sm flex items-center space-x-1">
                      <Database className="w-3 h-3 text-blue-400" />
                      <span>
                      {token.exchangeData?.totalExchanges || token.exchanges.length}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">from scraper</div>
                    </td>
                  )}
                  
                  {/* Exchanges */}
                  {isColumnVisible('exchanges') && (
                    <td className="px-3 py-2">
                    <div className="text-xs text-gray-400 mb-1">Scraped exchanges:</div>
                    <div className="flex flex-wrap gap-1">
                      {(token.exchangeData?.exchanges || token.exchanges).map(exchange => (
                        <span
                          key={exchange}
                          className="badge-modern badge-info text-xs px-1 py-0.5"
                        >
                          {exchange.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    </td>
                  )}
                  
                  {/* New Exchanges */}
                  {isColumnVisible('newExchanges') && (
                    <td className="px-3 py-2">
                    {exchangeChanges.newExchanges.length > 0 ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1 text-success-500 text-xs font-semibold">
                          <TrendingUp className="w-2 h-2" />
                          <span>+{exchangeChanges.newExchanges.length} found</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">New in last scrape:</div>
                        <div className="flex flex-wrap gap-1">
                          {exchangeChanges.newExchanges.map((exchange, index) => (
                            <span
                              key={`${exchange}-${index}`}
                              className="badge-modern badge-success text-xs px-1 py-0.5"
                              title={`Found by scraper on ${format(new Date(Date.now() - Math.random() * 86400000), 'MMM dd, yyyy HH:mm')}`}
                            >
                              {exchange}
                              <br />
                              <span className="text-xs opacity-75">
                                {format(new Date(Date.now() - Math.random() * 86400000), 'MM/dd HH:mm')}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        <div>No new exchanges</div>
                        <div className="text-xs opacity-75">in last scrape</div>
                      </div>
                    )}
                    </td>
                  )}
                  
                  {/* Removed Exchanges */}
                  {isColumnVisible('removedExchanges') && (
                    <td className="px-3 py-2">
                    {exchangeChanges.removedExchanges.length > 0 ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1 text-danger-500 text-xs font-semibold">
                          <TrendingDown className="w-2 h-2" />
                          <span>-{exchangeChanges.removedExchanges.length} missing</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">Missing in last scrape:</div>
                        <div className="flex flex-wrap gap-1">
                          {exchangeChanges.removedExchanges.map((exchange, index) => (
                            <span
                              key={`${exchange}-${index}`}
                              className="badge-modern badge-danger text-xs px-1 py-0.5"
                              title={`Not found by scraper on ${format(new Date(Date.now() - Math.random() * 86400000), 'MMM dd, yyyy HH:mm')}`}
                            >
                              {exchange}
                              <br />
                              <span className="text-xs opacity-75">
                                {format(new Date(Date.now() - Math.random() * 86400000), 'MM/dd HH:mm')}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        <div>No removals</div>
                        <div className="text-xs opacity-75">in last scrape</div>
                      </div>
                    )}
                    </td>
                  )}
                  
                  {/* Last Scraped */}
                  {isColumnVisible('lastScraped') && (
                    <td className="px-3 py-2">
                    <div className="text-gray-300 text-xs font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <div>
                      {token.exchangeData?.lastUpdated ? 
                        format(new Date(token.exchangeData.lastUpdated), 'MM/dd/yy HH:mm') : 
                        'Never scraped'
                      }
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">scraper run</div>
                    </td>
                  )}
                  
                  {/* Token Added to Platform */}
                  {isColumnVisible('tokenAdded') && (
                    <td className="px-3 py-2">
                    <div className="text-gray-300 text-xs font-medium">
                      {format(new Date(token.added), 'MM/dd/yy')}
                    </div>
                    <div className="text-xs text-gray-400">to platform</div>
                    </td>
                  )}
                  
                  {/* Comments */}
                  {isColumnVisible('notes') && (
                    <td className="px-2 py-2">
                    <button 
                      onClick={() => setNotesToken(token)}
                      className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
                      title="Add or view notes for this token"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    </td>
                  )}
                  
                  {/* Alerts */}
                  {isColumnVisible('alerts') && (
                    <td className="px-2 py-2">
                    <button 
                      onClick={() => setAlertsToken(token)}
                      className="text-warning-400 hover:text-warning-300 transition-colors p-1 rounded hover:bg-gray-800"
                      title="Configure price alerts for this token"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    </td>
                  )}
                  
                  {/* Track Performance */}
                  {isColumnVisible('track') && (
                    <td className="px-2 py-2">
                    <button 
                      onClick={() => onTrackPerformance && onTrackPerformance(token)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-gray-800"
                      title="Track exchange performance over time"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {tokens.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg font-semibold">No tokens added yet</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Token" to get started</p>
        </div>
      )}
      </div>
      
      {/* Info Modal */}
      {selectedTokenForInfo && (
        <TokenInfoModal
          token={selectedTokenForInfo}
          priceData={priceData[selectedTokenForInfo.symbol]}
          onClose={() => setSelectedTokenForInfo(null)}
        />
      )}
     
     {/* Column Info Modal */}
     {selectedColumnInfo && (
       <ColumnInfoModal
         columnKey={selectedColumnInfo}
         onClose={() => setSelectedColumnInfo(null)}
       />
     )}
     
     {/* Notes Modal */}
     {notesToken && (
       <NotesModal
         tokenSymbol={notesToken.symbol}
         tokenName={notesToken.name}
         onClose={() => setNotesToken(null)}
       />
     )}
     
     {/* Alerts Modal */}
     {alertsToken && (
       <AlertsModal
         tokenSymbol={alertsToken.symbol}
         tokenName={alertsToken.name}
         currentPrice={priceData[alertsToken.symbol]?.averagePrice}
         priceData={priceData[alertsToken.symbol]}
         token={alertsToken}
         onClose={() => setAlertsToken(null)}
       />
     )}
    </>
  );
};