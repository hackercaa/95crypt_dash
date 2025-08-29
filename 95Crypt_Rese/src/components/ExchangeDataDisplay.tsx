import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, RefreshCw, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ExchangeData {
  symbol: string;
  totalExchanges: number;
  exchanges: string[];
  newExchanges24h: string[];
  removedExchanges24h: string[];
  exchangeChange24h: number;
  lastUpdated: number;
  previousUpdate?: number;
  dataSource: string;
  isFirstRun?: boolean;
  error?: string;
}

interface ExchangeDataDisplayProps {
  symbol: string;
  compact?: boolean;
  showRefreshButton?: boolean;
  onDataUpdate?: (data: ExchangeData) => void;
}

export const ExchangeDataDisplay: React.FC<ExchangeDataDisplayProps> = ({
  symbol,
  compact = false,
  showRefreshButton = true,
  onDataUpdate
}) => {
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/tokens/${symbol}/exchange-data`);
      if (!response.ok) throw new Error('Failed to fetch exchange data');
      
      const data = await response.json();
      setExchangeData(data);
      setError(null);
      
      if (onDataUpdate) {
        onDataUpdate(data);
      }
    } catch (err) {
      console.error('Error fetching exchange data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`http://localhost:3001/api/tokens/${symbol}/refresh-exchange-data`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to refresh exchange data');
      
      const result = await response.json();
      setExchangeData(result.data);
      setError(null);
      
      if (onDataUpdate) {
        onDataUpdate(result.data);
      }
    } catch (err) {
      console.error('Error refreshing exchange data:', err);
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExchangeData();
  }, [symbol]);

  const getDataFreshnessStatus = () => {
    if (!exchangeData?.lastUpdated) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const now = Date.now();
    const hoursSinceUpdate = (now - exchangeData.lastUpdated) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) {
      return { status: 'fresh', color: 'green', text: 'Fresh' };
    } else if (hoursSinceUpdate < 6) {
      return { status: 'good', color: 'blue', text: 'Good' };
    } else if (hoursSinceUpdate < 24) {
      return { status: 'stale', color: 'yellow', text: 'Stale' };
    } else {
      return { status: 'outdated', color: 'red', text: 'Outdated' };
    }
  };

  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} bg-gray-800/50 rounded-lg border border-gray-700`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-gray-300 text-sm">Loading exchange data...</span>
        </div>
      </div>
    );
  }

  if (error && !exchangeData) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} bg-red-900/20 rounded-lg border border-red-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">Failed to load exchange data</span>
          </div>
          {showRefreshButton && (
            <button
              onClick={() => fetchExchangeData()}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-red-200 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (!exchangeData) return null;

  const freshness = getDataFreshnessStatus();
  const hasGrowth = exchangeData.exchangeChange24h > 0;
  const hasDecline = exchangeData.exchangeChange24h < 0;

  if (compact) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">{exchangeData.totalExchanges} Exchanges</span>
          </div>
          
          {exchangeData.exchangeChange24h !== 0 && (
            <div className={`flex items-center space-x-1 text-xs ${
              hasGrowth ? 'text-green-400' : 'text-red-400'
            }`}>
              {hasGrowth ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{hasGrowth ? '+' : ''}{exchangeData.exchangeChange24h}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className={`text-${freshness.color}-400`}>
            {freshness.text} • {format(new Date(exchangeData.lastUpdated), 'HH:mm')}
          </span>
          
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Exchange Data</h3>
            <p className="text-sm text-gray-400">
              Data from {exchangeData.dataSource} • Last updated {format(new Date(exchangeData.lastUpdated), 'MMM dd, HH:mm')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Data Freshness Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs bg-${freshness.color}-600/20 text-${freshness.color}-300 border border-${freshness.color}-600/30`}>
            <div className={`w-2 h-2 rounded-full bg-${freshness.color}-400 ${freshness.status === 'fresh' ? 'animate-pulse' : ''}`} />
            <span>{freshness.text}</span>
          </div>
          
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {exchangeData.error && (
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-sm font-medium">Warning</span>
          </div>
          <p className="text-yellow-200 text-sm mt-1">{exchangeData.error}</p>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Total Exchanges</span>
          </div>
          <div className="text-2xl font-bold text-white">{exchangeData.totalExchanges}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-300">New (24h)</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            +{exchangeData.newExchanges24h.length}
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-gray-300">Removed (24h)</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            -{exchangeData.removedExchanges24h.length}
          </div>
        </div>
      </div>

      {/* Exchange Changes */}
      {(exchangeData.newExchanges24h.length > 0 || exchangeData.removedExchanges24h.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* New Exchanges */}
          {exchangeData.newExchanges24h.length > 0 && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-300">New Exchanges (24h)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exchangeData.newExchanges24h.map(exchange => (
                  <span
                    key={exchange}
                    className="px-2 py-1 bg-green-600/20 text-green-300 text-sm rounded-full border border-green-600/30"
                  >
                    {exchange}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Removed Exchanges */}
          {exchangeData.removedExchanges24h.length > 0 && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="font-medium text-red-300">Removed Exchanges (24h)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exchangeData.removedExchanges24h.map(exchange => (
                  <span
                    key={exchange}
                    className="px-2 py-1 bg-red-600/20 text-red-300 text-sm rounded-full border border-red-600/30"
                  >
                    {exchange}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Exchanges */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-300">All Exchanges ({exchangeData.exchanges.length})</span>
          <a
            href={`https://cryptocurrencyalerting.com/coin/${symbol.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 text-sm"
          >
            <span>View on CryptocurrencyAlerting</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {exchangeData.exchanges.map(exchange => (
            <span
              key={exchange}
              className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30"
            >
              {exchange}
            </span>
          ))}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>
              Last scraped: {format(new Date(exchangeData.lastUpdated), 'MMM dd, yyyy HH:mm:ss')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Data source: {exchangeData.dataSource}</span>
          </div>
        </div>
      </div>
    </div>
  );
};