import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, X, ChevronDown, RefreshCw, Star, Zap, Building2, Activity, Clock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { Token, PriceData } from '../types';

interface FilterState {
  search: string;
  dateRange: 'all' | 'today' | '7days' | '30days' | '3months' | 'custom';
  customDateStart: string;
  customDateEnd: string;
  priceRange: { min: string; max: string };
  volumeRange: { min: string; max: string };
  tradeCountRange: { min: string; max: string };
  athRange: { min: string; max: string };
  atlRange: { min: string; max: string };
  percentFromAthRange: { min: string; max: string };
  priceChange: 'all' | 'positive' | 'negative' | 'significant';
  tradingStatus: 'all' | 'trading' | 'halt' | 'break';
  newExchanges: 'all' | 'yes' | 'no';
  scrapedRecently: 'all' | '1hour' | '6hours' | '24hours';
  exchanges: string[];
  exchangeType: 'all' | 'cex' | 'dex';
}

interface CompactTokenFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  filteredResults: number;
  isLoading?: boolean;
  tokens: Token[];
  priceData?: Record<string, PriceData>;
}

export const CompactTokenFilters: React.FC<CompactTokenFiltersProps> = ({
  onFiltersChange,
  totalResults,
  filteredResults,
  isLoading = false,
  tokens,
  priceData = {}
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    customDateStart: '',
    customDateEnd: '',
    priceRange: { min: '', max: '' },
    volumeRange: { min: '', max: '' },
    tradeCountRange: { min: '', max: '' },
    athRange: { min: '', max: '' },
    atlRange: { min: '', max: '' },
    percentFromAthRange: { min: '', max: '' },
    priceChange: 'all',
    tradingStatus: 'all',
    newExchanges: 'all',
    scrapedRecently: 'all',
    exchanges: [],
    exchangeType: 'all'
  });

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [showSearchHelp, setShowSearchHelp] = useState(false);

  // Available exchanges
  const availableExchanges = {
    cex: ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Huobi', 'OKX', 'Gate.io', 'MEXC', 'Bybit', 'Bitfinex', 'Crypto.com', 'Gemini', 'Bitstamp'],
    dex: ['Uniswap', 'SushiSwap', 'PancakeSwap', 'Curve', 'Balancer', '1inch', 'dYdX', 'Compound', 'Aave', 'MakerDAO', 'Yearn Finance']
  };

  // Enhanced search function with & and | operators
  const evaluateSearchQuery = (token: Token, query: string): boolean => {
    if (!query.trim()) return true;
    
    // Handle & (AND) and | (OR) operators
    if (query.includes('|')) {
      // OR logic - any condition must match
      return query.split('|').some(orTerm => evaluateSearchQuery(token, orTerm.trim()));
    }
    
    if (query.includes('&')) {
      // AND logic - all conditions must match
      return query.split('&').every(andTerm => evaluateSearchQuery(token, andTerm.trim()));
    }
    
    // Single term evaluation
    const searchTerm = query.toLowerCase().trim();
    const tokenPrice = priceData[token.symbol];
    
    // Column-specific searches
    if (searchTerm.includes(':')) {
      const [column, value] = searchTerm.split(':');
      const cleanValue = value.trim();
      
      switch (column.trim()) {
        case 'symbol':
          return token.symbol.toLowerCase().includes(cleanValue);
        case 'name':
          return token.name.toLowerCase().includes(cleanValue);
        case 'price':
          if (!tokenPrice?.averagePrice) return false;
          if (cleanValue.startsWith('>')) {
            return tokenPrice.averagePrice > parseFloat(cleanValue.substring(1));
          } else if (cleanValue.startsWith('<')) {
            return tokenPrice.averagePrice < parseFloat(cleanValue.substring(1));
          } else if (cleanValue.startsWith('=')) {
            return Math.abs(tokenPrice.averagePrice - parseFloat(cleanValue.substring(1))) < 0.01;
          } else {
            return tokenPrice.averagePrice.toString().includes(cleanValue);
          }
        case 'change':
          if (!tokenPrice?.change24h) return false;
          if (cleanValue.startsWith('>')) {
            return tokenPrice.change24h > parseFloat(cleanValue.substring(1));
          } else if (cleanValue.startsWith('<')) {
            return tokenPrice.change24h < parseFloat(cleanValue.substring(1));
          } else {
            return tokenPrice.change24h.toString().includes(cleanValue);
          }
        case 'exchange':
          const tokenExchanges = [
            ...(token.exchangeData?.exchanges || []),
            ...(token.exchanges || [])
          ].map(e => e.toLowerCase());
          return tokenExchanges.some(exchange => exchange.includes(cleanValue));
        case 'status':
          const status = tokenPrice?.exchanges?.mexc?.status?.toLowerCase() || '';
          return status.includes(cleanValue);
        case 'volume':
          if (!tokenPrice?.exchanges?.mexc?.volume24h) return false;
          if (cleanValue.startsWith('>')) {
            return tokenPrice.exchanges.mexc.volume24h > parseFloat(cleanValue.substring(1));
          } else if (cleanValue.startsWith('<')) {
            return tokenPrice.exchanges.mexc.volume24h < parseFloat(cleanValue.substring(1));
          } else {
            return tokenPrice.exchanges.mexc.volume24h.toString().includes(cleanValue);
          }
        case 'ath':
          if (!token.allTimeHigh) return false;
          if (cleanValue.startsWith('>')) {
            return token.allTimeHigh > parseFloat(cleanValue.substring(1));
          } else if (cleanValue.startsWith('<')) {
            return token.allTimeHigh < parseFloat(cleanValue.substring(1));
          } else {
            return token.allTimeHigh.toString().includes(cleanValue);
          }
        default:
          // Fallback to general search
          break;
      }
    }
    
    // General search across all fields
    const searchableText = [
      token.symbol,
      token.name,
      ...(token.exchangeData?.exchanges || []),
      ...(token.exchanges || []),
      tokenPrice?.exchanges?.mexc?.status || '',
      tokenPrice?.averagePrice?.toString() || '',
      token.allTimeHigh?.toString() || '',
      token.allTimeLow?.toString() || ''
    ].join(' ').toLowerCase();
    
    // Handle quoted exact matches
    if (searchTerm.startsWith('"') && searchTerm.endsWith('"')) {
      const exactTerm = searchTerm.slice(1, -1);
      return searchableText.includes(exactTerm);
    }
    
    // Handle multiple terms (space-separated OR logic)
    const terms = searchTerm.split(/\s+/).filter(term => term.length > 0);
    return terms.some(term => searchableText.includes(term));
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const resetAllFilters = () => {
    const resetFilters: FilterState = {
      search: '',
      dateRange: 'all',
      customDateStart: '',
      customDateEnd: '',
      priceRange: { min: '', max: '' },
      volumeRange: { min: '', max: '' },
      tradeCountRange: { min: '', max: '' },
      athRange: { min: '', max: '' },
      atlRange: { min: '', max: '' },
      percentFromAthRange: { min: '', max: '' },
      priceChange: 'all',
      tradingStatus: 'all',
      newExchanges: 'all',
      scrapedRecently: 'all',
      exchanges: [],
      exchangeType: 'all'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const clearAllFilters = () => {
    resetAllFilters();
  };

  const toggleExchange = (exchange: string) => {
    const newExchanges = filters.exchanges.includes(exchange)
      ? filters.exchanges.filter(e => e !== exchange)
      : [...filters.exchanges, exchange];
    updateFilters({ exchanges: newExchanges });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.volumeRange.min || filters.volumeRange.max) count++;
    if (filters.tradeCountRange.min || filters.tradeCountRange.max) count++;
    if (filters.athRange.min || filters.athRange.max) count++;
    if (filters.atlRange.min || filters.atlRange.max) count++;
    if (filters.percentFromAthRange.min || filters.percentFromAthRange.max) count++;
    if (filters.priceChange !== 'all') count++;
    if (filters.tradingStatus !== 'all') count++;
    if (filters.newExchanges !== 'all') count++;
    if (filters.scrapedRecently !== 'all') count++;
    if (filters.exchanges.length > 0) count++;
    if (filters.exchangeType !== 'all') count++;
    return count;
  };

  const getFilteredExchanges = () => {
    if (filters.exchangeType === 'cex') return availableExchanges.cex;
    if (filters.exchangeType === 'dex') return availableExchanges.dex;
    return [...availableExchanges.cex, ...availableExchanges.dex];
  };

  const activeFilterCount = getActiveFilterCount();

  // Quick filter pills
  const quickFilters = [
    {
      key: 'trending',
      label: '⚡ Trending',
      tooltip: 'Currently trending tokens based on popularity and activity. Shows tokens with high social mentions, search interest, and trading volume. Perfect for identifying what the market is currently focused on.',
      action: () => updateFilters({ search: 'change:>5 & volume:>1000000', priceChange: 'positive' })
    },
    {
      key: 'new',
      label: '⭐ New',
      tooltip: 'Recently added tokens (last 7 days) for discovering new opportunities. Great for finding fresh projects and early investment opportunities before they become mainstream.',
      action: () => updateFilters({ dateRange: '7days' })
    },
    {
      key: 'gainers',
      label: '📈 Gainers',
      tooltip: 'Positive 24h price changes only, filter out declining tokens. Ideal for momentum trading, identifying strong performers, and finding tokens with positive market sentiment.',
      action: () => updateFilters({ search: 'change:>0', priceChange: 'positive' })
    },
    {
      key: 'losers',
      label: '📉 Losers',
      tooltip: 'Negative 24h changes, find potential buying opportunities. Perfect for value investing, identifying oversold conditions, and finding tokens at discount prices.',
      action: () => updateFilters({ search: 'change:<0', priceChange: 'negative' })
    },
    {
      key: 'highVolume',
      label: '🏢 High Volume',
      tooltip: 'Tokens on 10+ exchanges, better liquidity and adoption. Shows well-established tokens with wide availability, easier trading, and lower slippage risk.',
      action: () => updateFilters({ search: 'volume:>5000000' })
    },
    {
      key: 'recent',
      label: '📅 Recent',
      tooltip: 'Tokens added to dashboard in last 7 days. Helps you focus on your most recent additions and newly tracked investments for portfolio management.',
      action: () => updateFilters({ dateRange: '7days' })
    },
    {
      key: 'tradingActive',
      label: '🔄 Trading Active',
      tooltip: 'Only actively trading tokens, filters out halted pairs. Ensures you only see tokens that can be traded right now, avoiding suspended or delisted pairs.',
      action: () => updateFilters({ search: 'status:trading', tradingStatus: 'trading' })
    },
    {
      key: 'newListings',
      label: '📊 New Listings',
      tooltip: 'Tokens with new exchange listings in last 24h. Identifies tokens gaining adoption and expanding availability, often leading to increased liquidity and price appreciation.',
      action: () => updateFilters({ newExchanges: 'yes' })
    }
  ];

  const activeFilters = useMemo(() => {
    const active = [];
    
    if (filters.search) {
      active.push({
        key: 'search',
        label: `Search: "${filters.search}"`,
        tooltip: `Active Search Filter: Currently searching for "${filters.search}". This search is applied across all token data using advanced operators. Click X to remove this search filter and show all tokens.`,
        onRemove: () => updateFilters({ search: '' })
      });
    }
    
    if (filters.dateRange !== 'all') {
      const dateLabels = {
        today: 'Today',
        '7days': 'Last 7 Days',
        '30days': 'Last 30 Days',
        '3months': 'Last 3 Months',
        custom: 'Custom Range'
      };
      active.push({
        key: 'dateRange',
        label: `Date: ${dateLabels[filters.dateRange]}`,
        tooltip: `Active Date Filter: Currently showing tokens added in the ${dateLabels[filters.dateRange].toLowerCase()} timeframe. This filters your token list based on when you added them to your dashboard. Click X to show tokens from all time periods.`,
        onRemove: () => updateFilters({ dateRange: 'all' })
      });
    }
    
    if (filters.priceChange !== 'all') {
      const changeLabels = {
        positive: 'Gainers Only',
        negative: 'Losers Only',
        significant: 'Significant Changes (±5%)'
      };
      active.push({
        key: 'priceChange',
        label: `Change: ${changeLabels[filters.priceChange]}`,
        tooltip: `Active Price Change Filter: Currently showing only ${changeLabels[filters.priceChange].toLowerCase()}. This filters tokens based on their 24-hour price performance. Click X to show tokens with any price change.`,
        onRemove: () => updateFilters({ priceChange: 'all' })
      });
    }
    
    if (filters.tradingStatus !== 'all') {
      const statusLabels = {
        trading: 'Active Trading',
        halt: 'Trading Halted',
        break: 'Trading Paused'
      };
      active.push({
        key: 'tradingStatus',
        label: `Status: ${statusLabels[filters.tradingStatus]}`,
        tooltip: `Active Trading Status Filter: Currently showing only tokens with '${statusLabels[filters.tradingStatus]}' trading status. This filters based on MEXC exchange trading availability. Click X to show tokens with any trading status.`,
        onRemove: () => updateFilters({ tradingStatus: 'all' })
      });
    }
    
    if (filters.exchanges.length > 0) {
      active.push({
        key: 'exchanges',
        label: `Exchanges: ${filters.exchanges.length} selected`,
        tooltip: `Active Exchange Filter: Currently filtering by ${filters.exchanges.length} selected exchanges: ${filters.exchanges.join(', ')}. Only tokens listed on these exchanges are shown. Click X to show tokens from all exchanges.`,
        onRemove: () => updateFilters({ exchanges: [] })
      });
    }
    
    if (filters.newExchanges !== 'all') {
      active.push({
        key: 'newExchanges',
        label: 'New Listings: Yes',
        tooltip: 'Active New Listings Filter: Currently showing only tokens that gained new exchange listings in the last scraper run. This helps identify tokens with growing adoption and expanding availability. Click X to show all tokens regardless of new listings.',
        onRemove: () => updateFilters({ newExchanges: 'all' })
      });
    }
    
    if (filters.priceRange.min || filters.priceRange.max) {
      const min = filters.priceRange.min || '0';
      const max = filters.priceRange.max || '∞';
      active.push({
        key: 'priceRange',
        label: `Price: $${min} - $${max}`,
        tooltip: `Active Price Range Filter: Currently showing tokens with prices between $${min} and $${max}. This filters tokens based on their current market price. Click X to show tokens at any price level.`,
        onRemove: () => updateFilters({ priceRange: { min: '', max: '' } })
      });
    }
    
    return active;
  }, [filters]);

  return (
    <div className="card-modern overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Advanced Token Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-primary text-gray-950 px-3 py-1 rounded-full text-sm font-bold shadow-glow">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">{filteredResults.toLocaleString()}</span> of{' '}
              <span className="font-medium text-white">{totalResults.toLocaleString()}</span> tokens
            </div>
            
            <button
              onClick={resetAllFilters}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1 text-sm px-3 py-1 rounded-lg hover:bg-gray-700"
              title="Reset all filters to default values. This will clear all active filters including search, date ranges, price filters, exchange selections, and advanced options. Use this to quickly return to viewing all tokens without any filtering applied."
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-danger-400 hover:text-danger-300 text-sm font-semibold transition-colors flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-danger-500/10"
                title="Clear all currently active filters. This removes all applied filters and shows the complete token list. Different from Reset - this only clears active filters while Reset also resets the interface to default state."
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-gray-300">Quick Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => (
              <button
                key={filter.key}
                onClick={filter.action}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transform hover:scale-105"
                title={filter.tooltip}
              >
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="flex items-center space-x-1 mb-1">
              <Search className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Search</label>
              <button
                onClick={() => setShowSearchHelp(!showSearchHelp)}
                className="text-gray-400 hover:text-primary-400 transition-colors"
                title="Show advanced search help and examples. Learn about search operators, column-specific searches, and advanced syntax for powerful token filtering."
              >
                <span className="text-xs bg-gray-700 px-1 py-0.5 rounded">?</span>
              </button>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="input-modern w-full px-3 py-2 text-sm"
              placeholder="Search tokens..."
              title="Advanced search with & (AND) and | (OR) operators. Examples: 'BTC & price:>40000', 'symbol:ETH | symbol:BTC', 'exchange:binance & change:>5'. Use column:value syntax for specific searches."
            />
            {showSearchHelp && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs z-10">
                <div className="font-semibold text-white mb-2">Search Examples:</div>
                <div className="space-y-1 text-gray-300">
                  <div>• <code>BTC | ETH</code> - Find tokens containing BTC OR ETH</div>
                  <div>• <code>BTC & price:&gt;40000</code> - BTC AND price above $40,000</div>
                  <div>• <code>"Bitcoin"</code> - Exact name match</div>
                  <div>• <code>symbol:BTC</code> - Search specific column</div>
                  <div>• <code>price:&gt;100</code> - Price greater than $100</div>
                  <div>• <code>exchange:binance & change:&gt;5</code> - On Binance AND gaining 5%+</div>
                  <div>• <code>status:trading | status:halt</code> - Trading OR halted status</div>
                  <div>• <code>ath:&gt;1000 & volume:&gt;1000000</code> - High ATH AND high volume</div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Date Range</label>
            </div>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilters({ dateRange: e.target.value as any })}
              className="input-modern w-full px-3 py-2 text-sm"
              title="Filter tokens by when you added them to your dashboard. Useful for focusing on recent additions, tracking portfolio growth over time, or analyzing tokens added during specific market conditions."
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Price Change */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Price Change</label>
            </div>
            <select
              value={filters.priceChange}
              onChange={(e) => updateFilters({ priceChange: e.target.value as any })}
              className="input-modern w-full px-3 py-2 text-sm"
              title="Filter by 24-hour price performance. 'Positive' shows only gaining tokens for momentum trading. 'Negative' shows declining tokens for value opportunities. 'Significant' shows tokens with major moves (±5%) for volatility trading."
            >
              <option value="all">All Changes</option>
              <option value="positive">Gainers Only</option>
              <option value="negative">Losers Only</option>
              <option value="significant">Significant (±5%)</option>
            </select>
          </div>

          {/* Trading Status */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Activity className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Trading Status</label>
            </div>
            <select
              value={filters.tradingStatus}
              onChange={(e) => updateFilters({ tradingStatus: e.target.value as any })}
              className="input-modern w-full px-3 py-2 text-sm"
              title="Filter by MEXC exchange trading status. 'Trading' shows only actively tradeable tokens. 'Halt' shows suspended tokens. 'Break' shows temporarily paused tokens. Essential for ensuring tradability before placing orders."
            >
              <option value="all">All Status</option>
              <option value="trading">Trading Active</option>
              <option value="halt">Trading Halted</option>
              <option value="break">Trading Paused</option>
            </select>
          </div>

          {/* New Exchanges */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">New Exchanges</label>
            </div>
            <select
              value={filters.newExchanges}
              onChange={(e) => updateFilters({ newExchanges: e.target.value as any })}
              className="input-modern w-full px-3 py-2 text-sm"
              title="Filter by whether tokens gained new exchange listings recently. 'Yes' shows tokens with expanding availability and growing adoption. 'No' shows tokens without recent exchange additions. Great for identifying trending tokens."
            >
              <option value="all">All Tokens</option>
              <option value="yes">Has New Listings</option>
              <option value="no">No New Listings</option>
            </select>
          </div>

          {/* Scraped Recently */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Data Freshness</label>
            </div>
            <select
              value={filters.scrapedRecently}
              onChange={(e) => updateFilters({ scrapedRecently: e.target.value as any })}
              className="input-modern w-full px-3 py-2 text-sm"
              title="Filter by how recently exchange data was collected. Fresh data ensures accurate exchange counts and listings. Older data might be outdated. Use this to ensure you're working with the most current information."
            >
              <option value="all">All Data</option>
              <option value="1hour">Last Hour</option>
              <option value="6hours">Last 6 Hours</option>
              <option value="24hours">Last 24 Hours</option>
            </select>
          </div>
        </div>

        {/* Advanced Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
            title="Toggle advanced filtering options including price ranges, volume filters, ATH/ATL ranges, exchange selection, and more detailed filtering criteria for power users and detailed analysis."
          >
            <span className="text-sm font-semibold">Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedExpanded && (
        <div className="p-4 bg-gray-850/30 border-b border-gray-800">
          <div className="space-y-6">
            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.customDateStart}
                    onChange={(e) => updateFilters({ customDateStart: e.target.value })}
                    className="input-modern w-full px-3 py-2 text-sm"
                    title="Select the earliest date for tokens to include in results. Only tokens added on or after this date will be shown. Useful for analyzing portfolio additions during specific time periods or market conditions."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.customDateEnd}
                    onChange={(e) => updateFilters({ customDateEnd: e.target.value })}
                    className="input-modern w-full px-3 py-2 text-sm"
                    title="Select the latest date for tokens to include in results. Only tokens added on or before this date will be shown. Combine with start date to create precise time windows for analysis."
                  />
                </div>
              </div>
            )}

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Price Range (USD)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => updateFilters({ priceRange: { ...filters.priceRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min price"
                    step="0.01"
                    title="Minimum price filter. Enter the lowest price you want to see. Useful for filtering out very cheap tokens or focusing on higher-value investments. Leave empty for no minimum limit."
                  />
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => updateFilters({ priceRange: { ...filters.priceRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max price"
                    step="0.01"
                    title="Maximum price filter. Enter the highest price you want to see. Useful for finding affordable tokens or excluding expensive ones from your analysis. Leave empty for no maximum limit."
                  />
                </div>
              </div>

              {/* Volume Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>24h Volume Range</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.volumeRange.min}
                    onChange={(e) => updateFilters({ volumeRange: { ...filters.volumeRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min volume"
                    title="Minimum 24-hour trading volume in USD. Higher volume indicates better liquidity and easier trading. Use this to filter out low-liquidity tokens that might have high slippage or difficulty trading."
                  />
                  <input
                    type="number"
                    value={filters.volumeRange.max}
                    onChange={(e) => updateFilters({ volumeRange: { ...filters.volumeRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max volume"
                    title="Maximum 24-hour trading volume in USD. Use this to focus on smaller or mid-cap tokens by excluding extremely high-volume major cryptocurrencies from your analysis."
                  />
                </div>
              </div>

              {/* Trade Count Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>Trade Count Range</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.tradeCountRange.min}
                    onChange={(e) => updateFilters({ tradeCountRange: { ...filters.tradeCountRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min trades"
                    title="Minimum number of individual trades in 24 hours. Higher trade counts indicate active market participation and better liquidity. Use this to find tokens with consistent trading activity."
                  />
                  <input
                    type="number"
                    value={filters.tradeCountRange.max}
                    onChange={(e) => updateFilters({ tradeCountRange: { ...filters.tradeCountRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max trades"
                    title="Maximum number of individual trades in 24 hours. Use this to exclude extremely active tokens or focus on tokens with moderate trading activity levels."
                  />
                </div>
              </div>

              {/* ATH Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span>ATH Range (USD)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.athRange.min}
                    onChange={(e) => updateFilters({ athRange: { ...filters.athRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min ATH"
                    step="0.01"
                    title="Minimum all-time high price. Filter for tokens that have proven they can reach certain price levels. Higher ATH values indicate tokens with established track records and proven market demand."
                  />
                  <input
                    type="number"
                    value={filters.athRange.max}
                    onChange={(e) => updateFilters({ athRange: { ...filters.athRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max ATH"
                    step="0.01"
                    title="Maximum all-time high price. Use this to focus on tokens that haven't reached extremely high valuations, potentially finding undervalued opportunities or avoiding overpriced assets."
                  />
                </div>
              </div>

              {/* ATL Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <TrendingDown className="w-4 h-4 text-blue-400" />
                  <span>ATL Range (USD)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.atlRange.min}
                    onChange={(e) => updateFilters({ atlRange: { ...filters.atlRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min ATL"
                    step="0.01"
                    title="Minimum all-time low price. Filter out tokens that have fallen to extremely low levels. Higher ATL values might indicate tokens with better price stability and support levels."
                  />
                  <input
                    type="number"
                    value={filters.atlRange.max}
                    onChange={(e) => updateFilters({ atlRange: { ...filters.atlRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max ATL"
                    step="0.01"
                    title="Maximum all-time low price. Use this to find tokens that have experienced significant drawdowns, potentially identifying oversold conditions or high-risk investments."
                  />
                </div>
              </div>

              {/* % from ATH Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>% from ATH Range</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.percentFromAthRange.min}
                    onChange={(e) => updateFilters({ percentFromAthRange: { ...filters.percentFromAthRange, min: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Min %"
                    title="Minimum percentage from all-time high. Negative values show how far below ATH. Use -90 to find tokens that are at least 90% below their peak, potentially identifying oversold opportunities."
                  />
                  <input
                    type="number"
                    value={filters.percentFromAthRange.max}
                    onChange={(e) => updateFilters({ percentFromAthRange: { ...filters.percentFromAthRange, max: e.target.value } })}
                    className="input-modern px-3 py-2 text-sm"
                    placeholder="Max %"
                    title="Maximum percentage from all-time high. Use -10 to find tokens within 10% of their ATH, or positive values to find tokens making new highs. Great for value vs growth analysis."
                  />
                </div>
              </div>
            </div>

            {/* Exchange Selection */}
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>Exchange Selection</span>
                </label>
                
                <div className="flex space-x-2">
                  {[
                    { 
                      value: 'all', 
                      label: 'All Exchanges',
                      tooltip: 'Show tokens from all exchanges (both centralized and decentralized). This gives you the complete view of all available tokens across all platforms.'
                    },
                    { 
                      value: 'cex', 
                      label: 'CEX Only',
                      tooltip: 'Show only tokens from centralized exchanges like Binance, Coinbase, Kraken. These typically have higher liquidity, easier fiat on/off ramps, and more regulatory compliance.'
                    },
                    { 
                      value: 'dex', 
                      label: 'DEX Only',
                      tooltip: 'Show only tokens from decentralized exchanges like Uniswap, SushiSwap, PancakeSwap. These often have newer tokens, DeFi protocols, and require wallet connections.'
                    }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilters({ exchangeType: option.value as any, exchanges: [] })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filters.exchangeType === option.value
                          ? 'bg-gradient-primary text-gray-950 shadow-glow'
                          : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 border border-gray-600/30'
                      }`}
                      title={option.tooltip}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {getFilteredExchanges().map(exchange => (
                  <label
                    key={exchange}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/30 transition-colors border border-gray-800 hover:border-gray-700"
                    title={`Filter to show only tokens listed on ${exchange}. Multiple exchanges can be selected to show tokens available on any of the selected platforms. This uses OR logic - tokens on ANY selected exchange will be shown.`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.exchanges.includes(exchange)}
                      onChange={() => toggleExchange(exchange)}
                      className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-white text-sm">{exchange}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="p-4 bg-gray-850/20 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-300">Active Filters:</span>
            <button
              onClick={clearAllFilters}
              className="text-danger-400 hover:text-danger-300 text-xs transition-colors flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-danger-500/10"
              title="Clear all currently active filters at once. This will remove all applied filters and show the complete unfiltered token list. Use this for a quick reset when you have multiple filters applied."
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-300 px-3 py-1 rounded-full text-sm border border-primary-600/30"
                title={filter.tooltip}
              >
                <span>{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="hover:text-primary-200 transition-colors"
                  title={`Remove this ${filter.key} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};