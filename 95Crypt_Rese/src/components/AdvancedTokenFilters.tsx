import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Calendar, Building2, Activity, X, ChevronDown, RefreshCw, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface FilterState {
  // Exchange-Specific Filters
  selectedExchanges: string[];
  exchangeType: 'all' | 'cex' | 'dex';
  
  // Listing Status Filters
  recentlyListed: 'all' | '24h' | '7d' | '30d' | '90d';
  listingTrend: 'all' | 'gaining' | 'losing' | 'stable';
  exchangeCountRange: { min: number; max: number };
  
  // Popularity Trend Filters
  popularityTrend: 'all' | 'trending' | 'gaining' | 'losing' | 'stable';
  popularityTimeframe: '1d' | '7d' | '30d';
  minPopularityScore: number;
  
  // General Filters
  search: string;
  sortBy: 'date_listed' | 'exchange_count' | 'popularity_score' | 'name' | 'volume';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedTokenFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  filteredResults: number;
  isLoading?: boolean;
}

export const AdvancedTokenFilters: React.FC<AdvancedTokenFiltersProps> = ({
  onFiltersChange,
  totalResults,
  filteredResults,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<FilterState>({
    selectedExchanges: [],
    exchangeType: 'all',
    recentlyListed: 'all',
    listingTrend: 'all',
    exchangeCountRange: { min: 1, max: 50 },
    popularityTrend: 'all',
    popularityTimeframe: '7d',
    minPopularityScore: 0,
    search: '',
    sortBy: 'popularity_score',
    sortOrder: 'desc'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'exchange' | 'listing' | 'popularity' | null>(null);

  // Exchange options with categories
  const exchanges = {
    cex: [
      'Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Huobi', 'OKX', 'Gate.io', 'MEXC',
      'Bybit', 'Bitfinex', 'Crypto.com', 'FTX', 'Gemini', 'Bitstamp'
    ],
    dex: [
      'Uniswap', 'SushiSwap', 'PancakeSwap', 'Curve', 'Balancer', '1inch',
      'dYdX', 'Compound', 'Aave', 'MakerDAO', 'Yearn Finance'
    ]
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      selectedExchanges: [],
      exchangeType: 'all',
      recentlyListed: 'all',
      listingTrend: 'all',
      exchangeCountRange: { min: 1, max: 50 },
      popularityTrend: 'all',
      popularityTimeframe: '7d',
      minPopularityScore: 0,
      search: '',
      sortBy: 'popularity_score',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleExchange = (exchange: string) => {
    const newExchanges = filters.selectedExchanges.includes(exchange)
      ? filters.selectedExchanges.filter(e => e !== exchange)
      : [...filters.selectedExchanges, exchange];
    updateFilters({ selectedExchanges: newExchanges });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.selectedExchanges.length > 0) count++;
    if (filters.exchangeType !== 'all') count++;
    if (filters.recentlyListed !== 'all') count++;
    if (filters.listingTrend !== 'all') count++;
    if (filters.exchangeCountRange.min > 1 || filters.exchangeCountRange.max < 50) count++;
    if (filters.popularityTrend !== 'all') count++;
    if (filters.minPopularityScore > 0) count++;
    return count;
  };

  const getFilteredExchanges = () => {
    if (filters.exchangeType === 'cex') return exchanges.cex;
    if (filters.exchangeType === 'dex') return exchanges.dex;
    return [...exchanges.cex, ...exchanges.dex];
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="card-modern overflow-hidden">
      {/* Filter Header */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">Advanced Token Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-primary text-gray-950 px-3 py-1 rounded-full text-sm font-bold shadow-glow">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">{filteredResults.toLocaleString()}</span> of{' '}
              <span className="font-medium text-white">{totalResults.toLocaleString()}</span> tokens
            </div>
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-danger-400 hover:text-danger-300 text-sm font-semibold transition-colors flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-danger-500/10"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Search and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="input-modern w-full pl-12 pr-4 py-3 text-base"
              placeholder="Search tokens..."
            />
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
            className="input-modern px-4 py-3 text-base"
          >
            <option value="popularity_score">Sort by Popularity</option>
            <option value="exchange_count">Sort by Exchange Count</option>
            <option value="date_listed">Sort by Date Listed</option>
            <option value="name">Sort by Name</option>
            <option value="volume">Sort by Volume</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
            className="input-modern px-4 py-3 text-base"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-6 space-y-8">
        {/* Exchange-Specific Filters */}
        <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
          <button
            onClick={() => setActiveSection(activeSection === 'exchange' ? null : 'exchange')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold text-white">Exchange Filters</h3>
              {filters.selectedExchanges.length > 0 && (
                <span className="badge-modern badge-info">
                  {filters.selectedExchanges.length} selected
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              activeSection === 'exchange' ? 'rotate-180' : ''
            }`} />
          </button>

          {activeSection === 'exchange' && (
            <div className="mt-4 space-y-4">
              {/* Exchange Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Type</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All Exchanges' },
                    { value: 'cex', label: 'Centralized (CEX)' },
                    { value: 'dex', label: 'Decentralized (DEX)' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilters({ exchangeType: option.value as any, selectedExchanges: [] })}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        filters.exchangeType === option.value
                          ? 'bg-gradient-primary text-gray-950 shadow-glow'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exchange Selection */}
              <div>
                <label className="block text-base font-semibold text-gray-300 mb-3">
                  Select Exchanges ({getFilteredExchanges().length} available)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {getFilteredExchanges().map(exchange => (
                    <label
                      key={exchange}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={filters.selectedExchanges.includes(exchange)}
                        onChange={() => toggleExchange(exchange)}
                        className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-white text-sm font-medium">{exchange}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Listing Status Filters */}
        <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
          <button
            onClick={() => setActiveSection(activeSection === 'listing' ? null : 'listing')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-success-400" />
              <h3 className="text-xl font-bold text-white">Listing Status Filters</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              activeSection === 'listing' ? 'rotate-180' : ''
            }`} />
          </button>

          {activeSection === 'listing' && (
            <div className="mt-4 space-y-4">
              {/* Recently Listed */}
              <div>
                <label className="block text-base font-semibold text-gray-300 mb-3">Recently Listed</label>
                <select
                  value={filters.recentlyListed}
                  onChange={(e) => updateFilters({ recentlyListed: e.target.value as any })}
                  className="input-modern w-full px-4 py-3 text-base"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              {/* Listing Trend */}
              <div>
                <label className="block text-base font-semibold text-gray-300 mb-3">Listing Trend</label>
                <select
                  value={filters.listingTrend}
                  onChange={(e) => updateFilters({ listingTrend: e.target.value as any })}
                  className="input-modern w-full px-4 py-3 text-base"
                >
                  <option value="all">All Trends</option>
                  <option value="gaining">Gaining Listings</option>
                  <option value="losing">Losing Listings</option>
                  <option value="stable">Stable Listings</option>
                </select>
              </div>

              {/* Exchange Count Range */}
              <div>
                <label className="block text-base font-semibold text-gray-300 mb-3">
                  Exchange Count Range ({filters.exchangeCountRange.min} - {filters.exchangeCountRange.max})
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.exchangeCountRange.min}
                      onChange={(e) => updateFilters({
                        exchangeCountRange: { ...filters.exchangeCountRange, min: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400 mt-2 font-medium">Min: {filters.exchangeCountRange.min}</div>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.exchangeCountRange.max}
                      onChange={(e) => updateFilters({
                        exchangeCountRange: { ...filters.exchangeCountRange, max: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400 mt-2 font-medium">Max: {filters.exchangeCountRange.max}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Popularity Trend Filters */}
        <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
          <button
            onClick={() => setActiveSection(activeSection === 'popularity' ? null : 'popularity')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-info-400" />
              <h3 className="text-xl font-bold text-white">Popularity Filters</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              activeSection === 'popularity' ? 'rotate-180' : ''
            }`} />
          </button>

          {activeSection === 'popularity' && (
            <div className="mt-4 space-y-4">
              {/* Popularity Trend */}
              <div>
               <label className="block text-base font-semibold text-gray-300 mb-3">Popularity Trend</label>
                <select
                  value={filters.popularityTrend}
                  onChange={(e) => updateFilters({ popularityTrend: e.target.value as any })}
                 className="input-modern w-full px-4 py-3 text-base"
                >
                  <option value="all">All Trends</option>
                  <option value="trending">🔥 Trending Now</option>
                  <option value="gaining">📈 Gaining Popularity</option>
                  <option value="losing">📉 Losing Popularity</option>
                  <option value="stable">➡️ Stable Popularity</option>
                </select>
              </div>

              {/* Popularity Timeframe */}
              <div>
               <label className="block text-base font-semibold text-gray-300 mb-3">Analysis Timeframe</label>
                <div className="flex space-x-2">
                  {[
                    { value: '1d', label: '1 Day' },
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilters({ popularityTimeframe: option.value as any })}
                     className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        filters.popularityTimeframe === option.value
                         ? 'bg-gradient-to-r from-info-500 to-info-600 text-white shadow-glow'
                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Popularity Score */}
              <div>
               <label className="block text-base font-semibold text-gray-300 mb-3">
                  Minimum Popularity Score: {filters.minPopularityScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minPopularityScore}
                  onChange={(e) => updateFilters({ minPopularityScore: parseInt(e.target.value) })}
                  className="w-full"
                />
               <div className="flex justify-between text-sm text-gray-400 mt-2 font-medium">
                  <span>0 (Low)</span>
                  <span>50 (Medium)</span>
                  <span>100 (High)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="p-6 bg-gray-850/30 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-gray-300">Active Filters:</span>
            <button
              onClick={clearAllFilters}
              className="text-danger-400 hover:text-danger-300 text-sm font-semibold transition-colors flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-danger-500/10"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset All</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {filters.search && (
              <span className="badge-modern badge-info flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>"{filters.search}"</span>
                <button onClick={() => updateFilters({ search: '' })}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            
            {filters.selectedExchanges.length > 0 && (
              <span className="badge-modern badge-info flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>{filters.selectedExchanges.length} exchanges</span>
                <button onClick={() => updateFilters({ selectedExchanges: [] })}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            
            {filters.recentlyListed !== 'all' && (
              <span className="badge-modern badge-success flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Listed: {filters.recentlyListed}</span>
                <button onClick={() => updateFilters({ recentlyListed: 'all' })}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            
            {filters.popularityTrend !== 'all' && (
              <span className="badge-modern badge-warning flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>{filters.popularityTrend}</span>
                <button onClick={() => updateFilters({ popularityTrend: 'all' })}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};