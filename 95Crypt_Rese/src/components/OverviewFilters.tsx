import React, { useState } from 'react';
import { Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, X, ChevronDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface FilterState {
  search: string;
  dateRange: 'all' | 'today' | '7days' | '30days' | '3months' | 'custom';
  customDateStart: string;
  customDateEnd: string;
  priceRange: { min: string; max: string };
  exchangeCount: { min: string; max: string };
  priceChange: 'all' | 'positive' | 'negative' | 'significant';
  exchanges: string[];
  status: 'all' | 'active' | 'new' | 'declining';
}

interface OverviewFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  filteredResults: number;
}

export const OverviewFilters: React.FC<OverviewFiltersProps> = ({
  onFiltersChange,
  totalResults,
  filteredResults
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    customDateStart: '',
    customDateEnd: '',
    priceRange: { min: '', max: '' },
    exchangeCount: { min: '', max: '' },
    priceChange: 'all',
    exchanges: [],
    status: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableExchanges = ['MEXC', 'Gate.io', 'Binance', 'Coinbase', 'KuCoin', 'Huobi', 'OKX', 'Kraken'];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      dateRange: 'all',
      customDateStart: '',
      customDateEnd: '',
      priceRange: { min: '', max: '' },
      exchangeCount: { min: '', max: '' },
      priceChange: 'all',
      exchanges: [],
      status: 'all'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.exchangeCount.min || filters.exchangeCount.max) count++;
    if (filters.priceChange !== 'all') count++;
    if (filters.exchanges.length > 0) count++;
    if (filters.status !== 'all') count++;
    return count;
  };

  const toggleExchange = (exchange: string) => {
    const newExchanges = filters.exchanges.includes(exchange)
      ? filters.exchanges.filter(e => e !== exchange)
      : [...filters.exchanges, exchange];
    updateFilters({ exchanges: newExchanges });
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {activeFilterCount}
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              Showing {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} tokens
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
            >
              <span className="text-sm">{isExpanded ? 'Collapse' : 'Expand'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="p-4 bg-gray-700/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search tokens..."
            />
          </div>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilters({ dateRange: e.target.value as any })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Price Change */}
          <select
            value={filters.priceChange}
            onChange={(e) => updateFilters({ priceChange: e.target.value as any })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Changes</option>
            <option value="positive">Positive (+)</option>
            <option value="negative">Negative (-)</option>
            <option value="significant">Significant (±5%)</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value as any })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tokens</option>
            <option value="active">Active</option>
            <option value="new">New Listings</option>
            <option value="declining">Declining</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-white">Advanced Filters</h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.customDateStart}
                  onChange={(e) => updateFilters({ customDateStart: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.customDateEnd}
                  onChange={(e) => updateFilters({ customDateEnd: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Price Range (USD)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => updateFilters({ priceRange: { ...filters.priceRange, min: e.target.value } })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min price"
                step="0.01"
              />
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => updateFilters({ priceRange: { ...filters.priceRange, max: e.target.value } })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max price"
                step="0.01"
              />
            </div>
          </div>

          {/* Exchange Count Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Count Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                value={filters.exchangeCount.min}
                onChange={(e) => updateFilters({ exchangeCount: { ...filters.exchangeCount, min: e.target.value } })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min exchanges"
                min="0"
              />
              <input
                type="number"
                value={filters.exchangeCount.max}
                onChange={(e) => updateFilters({ exchangeCount: { ...filters.exchangeCount, max: e.target.value } })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max exchanges"
                min="0"
              />
            </div>
          </div>

          {/* Exchange Selection */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Exchanges</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableExchanges.map(exchange => (
                  <label
                    key={exchange}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.exchanges.includes(exchange)}
                      onChange={() => toggleExchange(exchange)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white text-sm">{exchange}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="p-4 bg-gray-700/20 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Active Filters:</span>
            <button
              onClick={clearAllFilters}
              className="text-red-400 hover:text-red-300 text-xs transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <span>Search: "{filters.search}"</span>
                <button onClick={() => updateFilters({ search: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.dateRange !== 'all' && (
              <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <span>Date: {filters.dateRange}</span>
                <button onClick={() => updateFilters({ dateRange: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priceChange !== 'all' && (
              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <span>Change: {filters.priceChange}</span>
                <button onClick={() => updateFilters({ priceChange: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <span>Status: {filters.status}</span>
                <button onClick={() => updateFilters({ status: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.exchanges.length > 0 && (
              <span className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                <span>Exchanges: {filters.exchanges.length} selected</span>
                <button onClick={() => updateFilters({ exchanges: [] })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};