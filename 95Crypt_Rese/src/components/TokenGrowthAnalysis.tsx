import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Eye, Plus, Bell, ChevronDown, ChevronUp, BarChart3, Activity, Zap, Star, Calendar, Building2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Token } from '../types';

interface TokenGrowthData {
  id: string;
  symbol: string;
  name: string;
  currentExchangeCount: number;
  previousExchangeCount: number;
  exchangeChange: number;
  percentageChange: number;
  currentPrice: number | null;
  exchanges: string[];
  newExchanges: string[];
  removedExchanges: string[];
  dataPoints: number;
  lastUpdated: number;
  dateAdded: number;
}

interface TokenPerformanceData {
  date: string;
  exchangeCount: number;
  newExchanges: string[];
  removedExchanges: string[];
  netChange: number;
}

interface TokenGrowthAnalysisProps {
  selectedToken?: Token | null;
}

export const TokenGrowthAnalysis: React.FC<TokenGrowthAnalysisProps> = ({ selectedToken }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '1day' | '3days' | '7days' | '30days'>('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [exchangeRange, setExchangeRange] = useState({ min: '', max: '' });
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showPerformanceTracking, setShowPerformanceTracking] = useState(false);

  const [growthData, setGrowthData] = useState<TokenGrowthData[]>([
    {
      id: '1',
      symbol: 'AAVE',
      name: 'Aave',
      currentExchangeCount: 41,
      previousExchangeCount: 0,
      exchangeChange: 41,
      percentageChange: 100,
      currentPrice: 95.42,
      exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'Gate.io', 'KuCoin', 'Huobi', 'OKX'],
      newExchanges: ['Binance', 'Coinbase', 'Kraken'],
      removedExchanges: [],
      dataPoints: 2,
      lastUpdated: Date.now() - 3600000,
      dateAdded: Date.now() - 86400000 * 7
    },
    {
      id: '2',
      symbol: 'UNI',
      name: 'Uniswap',
      currentExchangeCount: 35,
      previousExchangeCount: 28,
      exchangeChange: 7,
      percentageChange: 25,
      currentPrice: 8.75,
      exchanges: ['Binance', 'Coinbase', 'MEXC', 'Gate.io', 'KuCoin'],
      newExchanges: ['MEXC', 'Gate.io'],
      removedExchanges: [],
      dataPoints: 5,
      lastUpdated: Date.now() - 1800000,
      dateAdded: Date.now() - 86400000 * 14
    },
    {
      id: '3',
      symbol: 'BTC',
      name: 'Bitcoin',
      currentExchangeCount: 2,
      previousExchangeCount: 25,
      exchangeChange: -23,
      percentageChange: -92,
      currentPrice: 45000,
      exchanges: ['MEXC', 'Gate.io'],
      newExchanges: [],
      removedExchanges: ['Binance', 'Coinbase', 'Kraken', 'KuCoin'],
      dataPoints: 9,
      lastUpdated: Date.now() - 900000,
      dateAdded: Date.now() - 86400000 * 30
    },
    {
      id: '4',
      symbol: 'LINK',
      name: 'Chainlink',
      currentExchangeCount: 15,
      previousExchangeCount: 22,
      exchangeChange: -7,
      percentageChange: -32,
      currentPrice: 14.25,
      exchanges: ['Binance', 'Coinbase', 'MEXC'],
      newExchanges: [],
      removedExchanges: ['Huobi', 'OKX'],
      dataPoints: 4,
      lastUpdated: Date.now() - 2700000,
      dateAdded: Date.now() - 86400000 * 21
    }
  ]);

  // Mock performance data for the selected token
  const generatePerformanceData = (token: Token): TokenPerformanceData[] => {
    const data: TokenPerformanceData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    let currentExchangeCount = 5;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      currentExchangeCount = Math.max(1, currentExchangeCount + change);
      
      const newExchanges = change > 0 ? [`Exchange${i}`, `Platform${i}`].slice(0, change) : [];
      const removedExchanges = change < 0 ? [`OldExchange${i}`].slice(0, Math.abs(change)) : [];
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        exchangeCount: currentExchangeCount,
        newExchanges,
        removedExchanges,
        netChange: change
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (selectedToken) {
      setShowPerformanceTracking(true);
    }
  }, [selectedToken]);

  const getFilteredData = () => {
    if (!isEnabled) return [];

    let filtered = [...growthData];

    if (searchTerm) {
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = Date.now();
    switch (dateFilter) {
      case '1day':
        filtered = filtered.filter(token => now - token.lastUpdated < 86400000);
        break;
      case '3days':
        filtered = filtered.filter(token => now - token.lastUpdated < 3 * 86400000);
        break;
      case '7days':
        filtered = filtered.filter(token => now - token.lastUpdated < 7 * 86400000);
        break;
      case '30days':
        filtered = filtered.filter(token => now - token.lastUpdated < 30 * 86400000);
        break;
    }

    if (priceRange.min) {
      filtered = filtered.filter(token => 
        token.currentPrice !== null && token.currentPrice >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(token => 
        token.currentPrice !== null && token.currentPrice <= parseFloat(priceRange.max)
      );
    }

    if (exchangeRange.min) {
      filtered = filtered.filter(token => 
        token.currentExchangeCount >= parseInt(exchangeRange.min)
      );
    }
    if (exchangeRange.max) {
      filtered = filtered.filter(token => 
        token.currentExchangeCount <= parseInt(exchangeRange.max)
      );
    }

    return filtered;
  };

  const growingTokens = getFilteredData().filter(token => token.exchangeChange > 0);
  const decliningTokens = getFilteredData().filter(token => token.exchangeChange < 0);

  const toggleTokenExpansion = (tokenId: string) => {
    const newExpanded = new Set(expandedTokens);
    if (newExpanded.has(tokenId)) {
      newExpanded.delete(tokenId);
    } else {
      newExpanded.add(tokenId);
    }
    setExpandedTokens(newExpanded);
  };

  const PerformanceTracker: React.FC<{ token: Token }> = ({ token }) => {
    const performanceData = generatePerformanceData(token);
    
    return (
      <div className="card-modern p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-gray-950 font-bold shadow-md">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{token.symbol} Performance Tracking</h3>
              <p className="text-gray-400">Exchange listing performance over the last 30 days</p>
            </div>
          </div>
          <button
            onClick={() => setShowPerformanceTracking(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Performance Chart */}
        <div className="bg-gray-850/50 rounded-xl p-4 mb-6 border border-gray-800">
          <h4 className="font-bold text-white mb-4">Exchange Count Over Time</h4>
          <div className="h-64 flex items-end space-x-1">
            {performanceData.slice(-14).map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-primary rounded-t"
                  style={{ height: `${(data.exchangeCount / 20) * 100}%`, minHeight: '4px' }}
                  title={`${data.exchangeCount} exchanges on ${format(new Date(data.date), 'MMM dd')}`}
                />
                <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-left">
                  {format(new Date(data.date), 'MM/dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Changes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <h4 className="font-bold text-success-400 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Recent Additions</span>
            </h4>
            <div className="space-y-2">
              {performanceData.slice(-7).filter(d => d.newExchanges.length > 0).map((data, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-1">
                    {data.newExchanges.map(exchange => (
                      <span key={exchange} className="badge-modern badge-success text-xs">
                        {exchange}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-400">{format(new Date(data.date), 'MMM dd')}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <h4 className="font-bold text-danger-400 mb-3 flex items-center space-x-2">
              <TrendingDown className="w-5 h-5" />
              <span>Recent Removals</span>
            </h4>
            <div className="space-y-2">
              {performanceData.slice(-7).filter(d => d.removedExchanges.length > 0).map((data, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-1">
                    {data.removedExchanges.map(exchange => (
                      <span key={exchange} className="badge-modern badge-danger text-xs">
                        {exchange}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-400">{format(new Date(data.date), 'MMM dd')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-white">{performanceData[performanceData.length - 1]?.exchangeCount || 0}</div>
            <div className="text-sm text-gray-400">Current Exchanges</div>
          </div>
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-success-400">
              +{performanceData.reduce((sum, d) => sum + d.newExchanges.length, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Added (30d)</div>
          </div>
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-danger-400">
              -{performanceData.reduce((sum, d) => sum + d.removedExchanges.length, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Removed (30d)</div>
          </div>
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800 text-center">
            <div className={`text-2xl font-bold ${
              performanceData.reduce((sum, d) => sum + d.netChange, 0) >= 0 ? 'text-success-400' : 'text-danger-400'
            }`}>
              {performanceData.reduce((sum, d) => sum + d.netChange, 0) >= 0 ? '+' : ''}
              {performanceData.reduce((sum, d) => sum + d.netChange, 0)}
            </div>
            <div className="text-sm text-gray-400">Net Change (30d)</div>
          </div>
        </div>
      </div>
    );
  };

  const TokenCard: React.FC<{ token: TokenGrowthData; isGrowing: boolean }> = ({ token, isGrowing }) => {
    const isExpanded = expandedTokens.has(token.id);
    
    return (
      <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-gray-950 font-bold shadow-md">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <button className="text-xl font-bold text-white hover:text-primary-400 transition-colors">
                {token.symbol}
              </button>
              <div className="text-sm text-gray-400">{token.name}</div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
            isGrowing ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'
          }`}>
            {isGrowing ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-bold">
              {isGrowing ? '+' : ''}{token.exchangeChange} exchanges
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="text-white text-lg">
            <span className="font-bold text-primary-400">{token.symbol}</span>
            <span className="text-gray-300"> {isGrowing ? 'gained' : 'lost'} </span>
            <span className="font-bold">{Math.abs(token.exchangeChange)}</span>
            <span className="text-gray-300"> exchange{Math.abs(token.exchangeChange) !== 1 ? 's' : ''} (from </span>
            <span className="font-bold">{token.previousExchangeCount}</span>
            <span className="text-gray-300"> to </span>
            <span className="font-bold">{token.currentExchangeCount}</span>
            <span className="text-gray-300">) - </span>
            <span className={`font-bold ${isGrowing ? 'text-success-400' : 'text-danger-400'}`}>
              {isGrowing ? '+' : ''}{token.percentageChange}% change
            </span>
            <span className="text-gray-300"> over </span>
            <span className="font-bold">{token.dataPoints}</span>
            <span className="text-gray-300"> data points</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold">Current Price</div>
            <div className="font-bold text-white text-lg">
              {token.currentPrice ? `$${token.currentPrice.toFixed(2)}` : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold">Exchange Count</div>
            <div className="font-bold text-white text-lg">{token.currentExchangeCount}</div>
          </div>
        </div>

        <button
          onClick={() => toggleTokenExpansion(token.id)}
          className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors mb-4 p-3 rounded-xl hover:bg-gray-850/50"
        >
          <span className="font-semibold">Exchange Details</span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <div className="space-y-4 border-t border-gray-800 pt-6">
            <div>
              <div className="text-sm font-bold text-gray-300 mb-3">Current Exchanges</div>
              <div className="flex flex-wrap gap-2">
                {token.exchanges.map(exchange => (
                  <span
                    key={exchange}
                    className="badge-modern badge-info"
                  >
                    {exchange}
                  </span>
                ))}
              </div>
            </div>

            {token.newExchanges.length > 0 && (
              <div>
                <div className="text-sm font-bold text-success-400 mb-3">New Exchanges</div>
                <div className="text-xs text-gray-400 mb-2">Recently added listings:</div>
                <div className="flex flex-wrap gap-2">
                  {token.newExchanges.map(exchange => (
                    <span
                      key={exchange}
                      className="badge-modern badge-success"
                    >
                      {exchange}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {token.removedExchanges.length > 0 && (
              <div>
                <div className="text-sm font-bold text-danger-400 mb-3">Removed Exchanges</div>
                <div className="text-xs text-gray-400 mb-2">Recently delisted from:</div>
                <div className="flex flex-wrap gap-2">
                  {token.removedExchanges.map(exchange => (
                    <span
                      key={exchange}
                      className="badge-modern badge-danger"
                    >
                      {exchange}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-850/50 rounded-lg p-3 border border-gray-800">
                <span className="text-gray-400 font-semibold">Last Updated:</span>
                <div className="text-white font-bold">{format(new Date(token.lastUpdated), 'MMM dd, HH:mm')}</div>
              </div>
              <div className="bg-gray-850/50 rounded-lg p-3 border border-gray-800">
                <span className="text-gray-400 font-semibold">Date Added:</span>
                <div className="text-white font-bold">{format(new Date(token.dateAdded), 'MMM dd, yyyy')}</div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-glow text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>View Details</span>
              </button>
              <button className="flex-1 bg-gradient-success hover:shadow-glow-success text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Details</span>
              </button>
              <button className="flex-1 bg-gradient-to-r from-warning-500 to-warning-600 hover:shadow-glow text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Set Alerts</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isEnabled) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">Token Growth Analysis</h1>
              <p className="text-gray-400 mt-1">Track token exchange listings and growth patterns</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 font-semibold">Enable Analysis</span>
            <button
              onClick={() => setIsEnabled(true)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-600 transition-colors hover:bg-gray-500"
            >
              <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1 shadow-md" />
            </button>
          </div>
        </div>
        
        <div className="card-modern p-16 text-center">
          <Activity className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">Token Growth Analysis Disabled</h3>
          <p className="text-gray-400 text-lg">Enable the toggle above to view token growth and decline analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Token Growth Analysis</h1>
            <p className="text-gray-400 mt-1">Track token exchange listings and growth patterns</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 font-semibold">Enable Analysis</span>
          <button
            onClick={() => setIsEnabled(false)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gradient-primary transition-colors shadow-glow"
          >
            <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-7 shadow-md" />
          </button>
        </div>
      </div>

      {/* Performance Tracking Section */}
      {showPerformanceTracking && selectedToken && (
        <PerformanceTracker token={selectedToken} />
      )}

      {/* Modern Filters */}
      <div className="card-modern p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-12 pr-4 py-3"
                placeholder="Search tokens..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Date Filter</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="input-modern w-full px-4 py-3"
            >
              <option value="all">All</option>
              <option value="1day">Last 1 day</option>
              <option value="3days">Last 3 days</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="input-modern w-full px-3 py-3"
                placeholder="Min"
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="input-modern w-full px-3 py-3"
                placeholder="Max"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Exchange Count</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={exchangeRange.min}
                onChange={(e) => setExchangeRange({ ...exchangeRange, min: e.target.value })}
                className="input-modern w-full px-3 py-3"
                placeholder="Min"
              />
              <input
                type="number"
                value={exchangeRange.max}
                onChange={(e) => setExchangeRange({ ...exchangeRange, max: e.target.value })}
                className="input-modern w-full px-3 py-3"
                placeholder="Max"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setPriceRange({ min: '', max: '' });
                setExchangeRange({ min: '', max: '' });
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Growing Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-success-600/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Growing Tokens</h2>
            <p className="text-gray-400">Tokens gaining exchange listings</p>
          </div>
          <span className="badge-modern badge-success text-lg px-4 py-2">
            {growingTokens.length} tokens
          </span>
        </div>
        
        {growingTokens.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {growingTokens.map(token => (
              <TokenCard key={token.id} token={token} isGrowing={true} />
            ))}
          </div>
        ) : (
          <div className="card-modern p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No growing tokens found</h3>
            <p className="text-gray-400">No growing tokens found with current filters</p>
          </div>
        )}
      </div>

      {/* Declining Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-danger-600/20 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-danger-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Declining Tokens</h2>
            <p className="text-gray-400">Tokens losing exchange listings</p>
          </div>
          <span className="badge-modern badge-danger text-lg px-4 py-2">
            {decliningTokens.length} tokens
          </span>
        </div>
        
        {decliningTokens.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {decliningTokens.map(token => (
              <TokenCard key={token.id} token={token} isGrowing={false} />
            ))}
          </div>
        ) : (
          <div className="card-modern p-12 text-center">
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No declining tokens found</h3>
            <p className="text-gray-400">No declining tokens found with current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};