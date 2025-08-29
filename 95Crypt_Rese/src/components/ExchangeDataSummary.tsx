import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, RefreshCw, Clock, BarChart3, Activity } from 'lucide-react';

interface ExchangeDataSummary {
  totalTokens: number;
  totalExchanges: number;
  averageExchangesPerToken: number;
  tokensWithGrowth: number;
  tokensWithDecline: number;
  lastUpdated: number | null;
  dataFreshness: {
    fresh: number;
    stale: number;
    outdated: number;
  };
}

export const ExchangeDataSummary: React.FC = () => {
  const [summary, setSummary] = useState<ExchangeDataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exchange-data/summary');
      if (!response.ok) {
        let errorMessage = 'Failed to fetch summary';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response body isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching exchange data summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      // Get all tokens first
      const tokensResponse = await fetch('http://localhost:3001/api/tokens');
      const tokens = await tokensResponse.json();
      const symbols = tokens.map((token: any) => token.symbol);
      
      // Batch refresh all tokens
      const refreshResponse = await fetch('http://localhost:3001/api/tokens/batch-refresh-exchange-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      
      if (!refreshResponse.ok) throw new Error('Batch refresh failed');
      
      // Refresh summary
      await fetchSummary();
    } catch (error) {
      console.error('Error refreshing all exchange data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-gray-300">Loading exchange data summary...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>No exchange data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Exchange Data Summary</h3>
            <p className="text-xs text-gray-400">
              Overview of all token exchange data
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefreshAll}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Total Tokens</span>
          </div>
          <div className="text-xl font-bold text-white">{summary.totalTokens}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Total Exchanges</span>
          </div>
          <div className="text-xl font-bold text-white">{summary.totalExchanges}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-gray-300">Growing Tokens</span>
          </div>
          <div className="text-xl font-bold text-green-400">{summary.tokensWithGrowth}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-gray-300">Declining Tokens</span>
          </div>
          <div className="text-xl font-bold text-red-400">{summary.tokensWithDecline}</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Avg Exchanges/Token</span>
          </div>
          <div className="text-lg font-bold text-white">{summary.averageExchangesPerToken}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-300">Last Updated</span>
          </div>
          <div className="text-xs text-white">
            {summary.lastUpdated ? 
              new Date(summary.lastUpdated).toLocaleString() : 
              'Never'
            }
          </div>
        </div>
      </div>

      {/* Data Freshness */}
      <div className="bg-gray-700/30 rounded-lg p-3">
        <h4 className="font-medium text-gray-300 mb-2 text-sm">Data Freshness</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-base font-bold text-green-400">{summary.dataFreshness.fresh}</div>
            <div className="text-xs text-gray-400">Fresh (&lt;1h)</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-yellow-400">{summary.dataFreshness.stale}</div>
            <div className="text-xs text-gray-400">Stale (1-24h)</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-red-400">{summary.dataFreshness.outdated}</div>
            <div className="text-xs text-gray-400">Outdated (&gt;24h)</div>
          </div>
        </div>
      </div>
    </div>
  );
};