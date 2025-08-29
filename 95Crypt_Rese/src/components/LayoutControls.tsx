import React, { useState } from 'react';
import { Layout, Grid, List, Eye, EyeOff, Settings, ChevronDown, ChevronUp, RotateCcw, Columns, Table, Car as Card } from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  category: 'basic' | 'price' | 'trading' | 'market' | 'historical' | 'exchange' | 'system' | 'actions';
}

interface LayoutState {
  viewMode: 'table' | 'cards' | 'compact';
  density: 'comfortable' | 'standard' | 'compact';
  columns: ColumnConfig[];
  showCategories: boolean;
  autoHideColumns: boolean;
  stickyHeaders: boolean;
  zebra: boolean;
}

interface LayoutControlsProps {
  onLayoutChange: (layout: LayoutState) => void;
  totalColumns: number;
  visibleColumns: number;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  onLayoutChange,
  totalColumns,
  visibleColumns
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [layout, setLayout] = useState<LayoutState>({
    viewMode: 'table',
    density: 'standard',
    showCategories: true,
    autoHideColumns: false,
    stickyHeaders: true,
    zebra: true,
    columns: [
      // Basic Information
      { key: 'token', label: 'Token', visible: true, width: 'md', category: 'basic' },
      { key: 'info', label: 'Info', visible: true, width: 'sm', category: 'basic' },
      
      // Price Data
      { key: 'price', label: 'Price (USD)', visible: true, width: 'md', category: 'price' },
      { key: 'priceChange', label: 'Price Change', visible: true, width: 'md', category: 'price' },
      { key: 'openPrice', label: 'Open Price', visible: true, width: 'md', category: 'price' },
      
      // Trading Information
      { key: 'tradingStatus', label: 'Trading Status', visible: true, width: 'md', category: 'trading' },
      { key: 'bidAsk', label: 'Bid/Ask', visible: true, width: 'md', category: 'trading' },
      
      // Market Data
      { key: 'high24h', label: '24h High', visible: true, width: 'md', category: 'market' },
      { key: 'low24h', label: '24h Low', visible: true, width: 'md', category: 'market' },
      { key: 'volume24h', label: '24h Volume', visible: true, width: 'md', category: 'market' },
      { key: 'tradeCount', label: 'Trade Count', visible: true, width: 'md', category: 'market' },
      
      // Historical Data
      { key: 'ath', label: 'ATH', visible: true, width: 'md', category: 'historical' },
      { key: 'atl', label: 'ATL', visible: true, width: 'md', category: 'historical' },
      { key: 'percentFromATH', label: '% from ATH', visible: true, width: 'md', category: 'historical' },
      
      // Exchange Data
      { key: 'exchangeCount', label: '# Exchanges', visible: true, width: 'sm', category: 'exchange' },
      { key: 'exchanges', label: 'Exchanges', visible: true, width: 'lg', category: 'exchange' },
      { key: 'newExchanges', label: 'New (24h)', visible: true, width: 'md', category: 'exchange' },
      { key: 'removedExchanges', label: 'Removed (24h)', visible: true, width: 'md', category: 'exchange' },
      { key: 'lastScraped', label: 'Last Scraped', visible: true, width: 'md', category: 'exchange' },
      
      // System Information
      { key: 'tokenAdded', label: 'Token Added', visible: true, width: 'md', category: 'system' },
      
      // Actions
      { key: 'notes', label: 'Notes', visible: true, width: 'sm', category: 'actions' },
      { key: 'alerts', label: 'Alerts', visible: true, width: 'sm', category: 'actions' },
      { key: 'track', label: 'Track', visible: true, width: 'sm', category: 'actions' }
    ]
  });

  // Smart Layout Presets with proper tooltips
  const layoutPresets = [
    {
      name: 'Essential Trading',
      description: 'Core trading data - price, status, volume',
      tooltip: 'Perfect for active traders who need quick decisions. Shows only the most critical data: current price, trading status, price changes, volume, and trade count. Hides less important columns to reduce clutter and focus on actionable trading information. Ideal for day trading, scalping, and rapid market analysis.',
      icon: '📊',
      columns: ['token', 'info', 'price', 'tradingStatus', 'priceChange', 'volume24h', 'tradeCount', 'alerts'],
      settings: { density: 'standard', stickyHeaders: true, zebra: false }
    },
    {
      name: 'Price Analysis',
      description: 'Focus on price movements and history',
      tooltip: 'Ideal for technical analysis and price research. Displays comprehensive price data including current price, opening price, daily highs/lows, all-time highs/lows, and percentage from ATH. Perfect for identifying support/resistance levels, analyzing price patterns, and making informed entry/exit decisions.',
      icon: '📈',
      columns: ['token', 'info', 'price', 'openPrice', 'high24h', 'low24h', 'ath', 'atl', 'percentFromATH'],
      settings: { density: 'comfortable', stickyHeaders: true, zebra: true }
    },
    {
      name: 'Exchange Tracking',
      description: 'Monitor exchange listings and changes',
      tooltip: 'Essential for tracking token adoption across exchanges. Shows exchange count, full exchange list, new listings, removed listings, and scraping timestamps. Great for identifying tokens gaining or losing exchange support, monitoring liquidity expansion, and spotting early adoption trends.',
      icon: '🏢',
      columns: ['token', 'info', 'price', 'exchangeCount', 'exchanges', 'newExchanges', 'removedExchanges', 'lastScraped', 'track'],
      settings: { density: 'standard', stickyHeaders: true, zebra: true }
    },
    {
      name: 'Market Overview',
      description: 'Comprehensive market data view',
      tooltip: 'Balanced view combining price, trading, and market data. Shows current price, trading status, volume metrics, bid/ask spreads, exchange count, and ATH. Perfect for general market monitoring, portfolio management, and making informed investment decisions.',
      icon: '🌐',
      columns: ['token', 'info', 'price', 'tradingStatus', 'volume24h', 'tradeCount', 'bidAsk', 'exchangeCount', 'ath'],
      settings: { density: 'standard', stickyHeaders: true, zebra: true }
    },
    {
      name: 'Quick Monitor',
      description: 'Minimal view for quick monitoring',
      tooltip: 'Streamlined for speed and efficiency. Shows only essential data: token, price, price change, trading status, exchange count, and alerts. Automatically applies compact density for faster scanning. Perfect for quick portfolio checks, monitoring alerts, and rapid market assessment.',
      icon: '⚡',
      columns: ['token', 'price', 'priceChange', 'tradingStatus', 'exchangeCount', 'alerts'],
      settings: { density: 'compact', stickyHeaders: false, zebra: false }
    },
    {
      name: 'Research Mode',
      description: 'Detailed analysis with all historical data',
      tooltip: 'Comprehensive research view with historical data focus. Includes price history, ATH/ATL analysis, exchange tracking, and research tools. Automatically enables comfortable spacing and sticky headers for extended analysis sessions. Ideal for fundamental analysis, due diligence, and long-term investment research.',
      icon: '🔬',
      columns: ['token', 'info', 'price', 'ath', 'atl', 'percentFromATH', 'exchanges', 'newExchanges', 'removedExchanges', 'tokenAdded', 'notes', 'track'],
      settings: { density: 'comfortable', stickyHeaders: true, zebra: true }
    },
    {
      name: 'Mobile Friendly',
      description: 'Optimized for mobile screens',
      tooltip: 'Optimized for small screens and mobile devices. Shows only the most important data that fits comfortably on mobile. Automatically enables compact density and auto-hide features for better mobile experience. Perfect for on-the-go monitoring and mobile trading.',
      icon: '📱',
      columns: ['token', 'price', 'priceChange', 'tradingStatus', 'exchangeCount', 'alerts'],
      settings: { density: 'compact', autoHideColumns: true, stickyHeaders: false, zebra: false }
    },
    {
      name: 'Full Dashboard',
      description: 'Show all available data columns',
      tooltip: 'Complete data view showing all 23 available columns. Perfect for comprehensive analysis when you need to see everything. Automatically optimizes settings for viewing large amounts of data with sticky headers and zebra stripes. Best for power users and detailed market research.',
      icon: '🎛️',
      columns: 'all',
      settings: { density: 'standard', stickyHeaders: true, zebra: true }
    }
  ];

  const updateLayout = (newLayout: Partial<LayoutState>) => {
    const updatedLayout = { ...layout, ...newLayout };
    setLayout(updatedLayout);
    onLayoutChange(updatedLayout);
  };

  const applyPreset = (preset: typeof layoutPresets[0]) => {
    const updatedColumns = layout.columns.map(col => ({
      ...col,
      visible: preset.columns === 'all' ? true : preset.columns.includes(col.key)
    }));
    
    // Apply preset-specific settings
    const presetSettings: Partial<LayoutState> = {
      columns: updatedColumns,
      ...preset.settings
    };
    
    updateLayout(presetSettings);
  };

  const toggleColumn = (columnKey: string) => {
    const updatedColumns = layout.columns.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    updateLayout({ columns: updatedColumns });
  };

  const toggleCategory = (category: string) => {
    const categoryColumns = layout.columns.filter(col => col.category === category);
    const allVisible = categoryColumns.every(col => col.visible);
    
    const updatedColumns = layout.columns.map(col =>
      col.category === category ? { ...col, visible: !allVisible } : col
    );
    updateLayout({ columns: updatedColumns });
  };

  const resetLayout = () => {
    const resetColumns = layout.columns.map(col => ({ ...col, visible: true }));
    updateLayout({
      viewMode: 'table',
      density: 'standard',
      columns: resetColumns,
      showCategories: true,
      autoHideColumns: false,
      stickyHeaders: true,
      zebra: true
    });
  };

  const categories = [
    { 
      key: 'basic', 
      label: 'Basic Info', 
      icon: Table, 
      color: 'text-blue-400', 
      tooltip: 'Essential token identification: symbol, name, and detailed info button. Always keep these visible for token recognition and accessing detailed information about data sources and calculations.' 
    },
    { 
      key: 'price', 
      label: 'Price Data', 
      icon: Grid, 
      color: 'text-green-400', 
      tooltip: 'Current and historical price information: live price, price changes, and opening prices. Core data for trading decisions, technical analysis, and understanding price movements over time.' 
    },
    { 
      key: 'trading', 
      label: 'Trading Info', 
      icon: Settings, 
      color: 'text-purple-400', 
      tooltip: 'Real-time trading data: current trading status and bid/ask spreads. Critical for understanding market liquidity, trading availability, and execution costs before placing orders.' 
    },
    { 
      key: 'market', 
      label: 'Market Data', 
      icon: Layout, 
      color: 'text-orange-400', 
      tooltip: '24-hour market statistics: daily highs/lows, trading volume, and transaction counts. Essential for market analysis, volatility assessment, and understanding trading activity levels.' 
    },
    { 
      key: 'historical', 
      label: 'Historical', 
      icon: RotateCcw, 
      color: 'text-yellow-400', 
      tooltip: 'Long-term price history: all-time highs, all-time lows, and percentage from ATH. Valuable for understanding token performance over time, identifying value opportunities, and assessing long-term trends.' 
    },
    { 
      key: 'exchange', 
      label: 'Exchange Data', 
      icon: Columns, 
      color: 'text-indigo-400', 
      tooltip: 'Exchange listing information: total exchanges, exchange lists, new/removed listings, and scraping timestamps. Key for tracking token adoption, liquidity expansion, and market accessibility.' 
    },
    { 
      key: 'system', 
      label: 'System Info', 
      icon: Settings, 
      color: 'text-gray-400', 
      tooltip: 'Platform metadata: when tokens were added to your dashboard. Useful for tracking your portfolio history, managing recent additions, and organizing your token collection.' 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      icon: Eye, 
      color: 'text-pink-400', 
      tooltip: 'Interactive features: notes, alerts, and performance tracking. Tools for managing and monitoring your tokens, setting up notifications, and conducting detailed analysis.' 
    }
  ];

  const getVisibleColumnsInCategory = (category: string) => {
    return layout.columns.filter(col => col.category === category && col.visible).length;
  };

  const getTotalColumnsInCategory = (category: string) => {
    return layout.columns.filter(col => col.category === category).length;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-modern">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-850/80 to-gray-800/80 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Layout className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Layout Controls</h3>
            </div>
            <div className="text-xs text-gray-400">
              {visibleColumns}/{totalColumns} columns visible
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={resetLayout}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1 text-xs px-2 py-1 rounded hover:bg-gray-700/50"
              title="Reset all layout settings to default values. This will show all columns, set standard density, enable sticky headers and zebra stripes, and return to table view mode. Use this to quickly return to the original layout configuration."
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              title={`${isExpanded ? 'Collapse' : 'Expand'} layout controls to ${isExpanded ? 'hide' : 'show'} detailed column management, view modes, density settings, and display options. Use this to access advanced layout customization features.`}
            >
              <span className="text-xs">{isExpanded ? 'Collapse' : 'Expand'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Smart Presets */}
        <div className="mt-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold text-gray-300">Smart Presets:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {layoutPresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
                title={preset.tooltip}
              >
                <span>{preset.icon}</span>
                <span className="hidden sm:inline">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Layout Options */}
        <div className="flex items-center space-x-4 mt-3">
          {/* View Mode */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">View:</span>
            {[
              { 
                key: 'table', 
                label: 'Table', 
                icon: Table,
                tooltip: 'Standard table view with rows and columns. Best for detailed data analysis and comparison across multiple tokens. Supports all column customization options, sorting, and filtering. Ideal for comprehensive data review and professional analysis.'
              },
              { 
                key: 'cards', 
                label: 'Cards', 
                icon: Card,
                tooltip: 'Card-based layout with each token in its own card. More visual and easier to scan. Good for portfolio overview and quick token identification. Each card shows key metrics in an organized, visually appealing format.'
              },
              { 
                key: 'compact', 
                label: 'Compact', 
                icon: List,
                tooltip: 'Dense list view with minimal spacing. Fits more tokens on screen. Ideal for monitoring large portfolios or when screen space is limited. Reduces visual clutter while maintaining essential information.'
              }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => updateLayout({ viewMode: mode.key as 'table' | 'cards' | 'compact' })}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                  layout.viewMode === mode.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
                }`}
                title={mode.tooltip}
              >
                <mode.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Density */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">Density:</span>
            {[
              { 
                key: 'comfortable', 
                label: 'Comfortable',
                tooltip: 'Extra spacing and larger text. Easier to read and less eye strain. Best for detailed analysis sessions or when you have plenty of screen space. Reduces information density but improves readability and reduces fatigue during long research sessions.'
              },
              { 
                key: 'standard', 
                label: 'Standard',
                tooltip: 'Balanced spacing and normal text size. Good compromise between information density and readability. Recommended for most use cases. Provides optimal balance between showing enough data and maintaining comfortable reading experience.'
              },
              { 
                key: 'compact', 
                label: 'Compact',
                tooltip: 'Minimal spacing and smaller text. Fits more data on screen. Perfect for monitoring many tokens or when working on smaller screens. Maximizes information density while maintaining legibility for efficient portfolio monitoring.'
              }
            ].map(density => (
              <button
                key={density.key}
                onClick={() => updateLayout({ density: density.key as 'comfortable' | 'standard' | 'compact' })}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  layout.density === density.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
                }`}
                title={density.tooltip}
              >
                {density.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Display Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
              <input
                type="checkbox"
                checked={layout.stickyHeaders}
                onChange={(e) => updateLayout({ stickyHeaders: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span 
                className="text-white text-sm" 
                title="Keep column headers visible at the top while scrolling through the table. Useful for large token lists where you need to reference column names. Prevents losing context when scrolling through hundreds of tokens and maintains column identification."
              >
                Sticky Headers
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
              <input
                type="checkbox"
                checked={layout.zebra}
                onChange={(e) => updateLayout({ zebra: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span 
                className="text-white text-sm" 
                title="Alternating row background colors for better readability. Makes it easier to follow data across columns, especially in wide tables with many columns. Reduces eye strain and helps prevent reading the wrong row when scanning horizontally across data."
              >
                Zebra Stripes
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
              <input
                type="checkbox"
                checked={layout.autoHideColumns}
                onChange={(e) => updateLayout({ autoHideColumns: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span 
                className="text-white text-sm" 
                title="Automatically hide less important columns on mobile devices to improve readability. Keeps only essential columns visible on small screens for better mobile experience. Prioritizes core trading data over secondary information on space-constrained devices."
              >
                Auto-hide on Mobile
              </span>
            </label>
          </div>

          {/* Column Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Columns className="w-4 h-4 text-purple-400" />
              <span>Column Visibility</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => {
                const Icon = category.icon;
                const visibleCount = getVisibleColumnsInCategory(category.key);
                const totalCount = getTotalColumnsInCategory(category.key);
                const allVisible = visibleCount === totalCount;
                
                return (
                  <div key={category.key} className="bg-gray-850/50 rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setActiveCategory(activeCategory === category.key ? null : category.key)}
                        className="flex items-center space-x-2 text-left flex-1"
                        title={category.tooltip}
                      >
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <span className="text-white font-medium text-sm">{category.label}</span>
                        <span className="text-xs text-gray-400">({visibleCount}/{totalCount})</span>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${
                          activeCategory === category.key ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      <button
                        onClick={() => toggleCategory(category.key)}
                        className={`p-1 rounded transition-colors ${
                          allVisible ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'
                        }`}
                        title={`${allVisible ? 'Hide' : 'Show'} all ${category.label.toLowerCase()} columns. ${category.tooltip}`}
                      >
                        {allVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {activeCategory === category.key && (
                      <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                        {layout.columns
                          .filter(col => col.category === category.key)
                          .map(column => {
                            const columnTooltips: Record<string, string> = {
                              token: 'Token symbol and name display. Essential for identifying which cryptocurrency you\'re viewing. Always keep visible for token recognition.',
                              info: 'Information button to view detailed data sources, API endpoints, and calculation methods. Click to understand how each data point is collected and calculated.',
                              price: 'Current market price in USD, averaged across multiple exchanges. Real-time data updated every 3 seconds via WebSocket for accurate trading decisions.',
                              priceChange: 'Absolute price change in USD over 24 hours. Shows actual dollar amount gained or lost, not percentage. Useful for understanding real value movement.',
                              openPrice: 'Opening price at start of 24-hour period (00:00 UTC). Compare with current price to see daily movement and trading range.',
                              tradingStatus: 'Current trading status on MEXC exchange. Shows if token can be actively traded (TRADING) or is suspended (HALT/BREAK). Critical before placing orders.',
                              bidAsk: 'Current highest bid and lowest ask prices with spread percentage. Shows market liquidity and trading costs. Lower spreads indicate better liquidity.',
                              high24h: 'Highest price reached in last 24 hours. Useful for understanding daily volatility and resistance levels. Compare with current price for position.',
                              low24h: 'Lowest price reached in last 24 hours. Shows daily support levels and volatility range. Useful for identifying entry opportunities.',
                              volume24h: 'Total trading volume in last 24 hours (USD value + token count). Higher volume indicates more liquidity and easier trading with less slippage.',
                              tradeCount: 'Number of individual trades in last 24 hours. Higher count indicates active market participation and better liquidity for order execution.',
                              ath: 'All-time highest price ever recorded. Calculated from up to 2 years of historical data. Shows token\'s peak performance and potential.',
                              atl: 'All-time lowest price ever recorded. Shows worst-case historical performance and potential support levels during market crashes.',
                              percentFromATH: 'Percentage difference from all-time high. Negative values show how far below peak the token trades. Useful for identifying value opportunities.',
                              exchangeCount: 'Total number of exchanges where token is listed. Higher count typically means better liquidity, wider adoption, and easier trading access.',
                              exchanges: 'Complete list of all exchanges where token is available. Shows trading options and helps assess liquidity distribution across platforms.',
                              newExchanges: 'Exchanges where token was newly listed in last scraper run. Shows growing adoption and expanding trading opportunities.',
                              removedExchanges: 'Exchanges where token is no longer listed. Shows declining adoption or potential liquidity concerns that need monitoring.',
                              lastScraped: 'Timestamp of last successful exchange data collection. Shows data freshness and reliability for exchange information.',
                              tokenAdded: 'Date when you added this token to your dashboard. Useful for tracking your portfolio history and recent additions.',
                              notes: 'Click to add personal notes and observations about this token. Store your analysis, research findings, or trading strategies.',
                              alerts: 'Click to set up price alerts and notifications. Get notified when token reaches your target price levels or percentage changes.',
                              track: 'Click to view detailed performance tracking over time. Analyze exchange listing history and price performance trends.'
                            };
                            
                            return (
                            <label
                              key={column.key}
                              className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-700/30 transition-colors"
                              title={columnTooltips[column.key] || `Toggle visibility of ${column.label} column`}
                            >
                              <input
                                type="checkbox"
                                checked={column.visible}
                                onChange={() => toggleColumn(column.key)}
                                className="w-3 h-3 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                              />
                              <span className="text-white text-xs flex-1">{column.label}</span>
                              <span 
                                className={`text-xs px-1 py-0.5 rounded ${
                                  column.visible ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                                }`}
                                title={`Column Width: ${column.width?.toUpperCase()}. AUTO = adjusts to content automatically, SM = small fixed width for compact data like buttons, MD = medium width for standard content like prices, LG = large width for detailed data like exchange lists, XL = extra large width for extensive content.`}
                              >
                                {column.width}
                              </span>
                            </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};