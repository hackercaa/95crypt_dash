import React from 'react';
import { X, Database, TrendingUp, Activity, Clock, Building2, DollarSign, BarChart3, Zap, Globe, AlertCircle, Bell, MessageSquare, Eye } from 'lucide-react';

interface ColumnInfo {
  title: string;
  description: string;
  source: string;
  endpoint?: string;
  updateFrequency: string;
  calculation: string;
  possibleValues?: string[];
  dataRange?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ColumnInfoModalProps {
  columnKey: string;
  onClose: () => void;
}

export const ColumnInfoModal: React.FC<ColumnInfoModalProps> = ({ columnKey, onClose }) => {
  const columnInfoMap: Record<string, ColumnInfo> = {
    token: {
      title: "Token",
      description: "The cryptocurrency token symbol and name. This is the primary identifier for each asset in your portfolio.",
      source: "Internal Database",
      updateFrequency: "Static (set once when added)",
      calculation: "User input when adding token to platform",
      icon: Database,
      color: "text-blue-400"
    },
    info: {
      title: "Info Button",
      description: "Click this button to view detailed information about data sources, calculations, and technical details for each token.",
      source: "Interactive UI Element",
      updateFrequency: "Real-time interaction",
      calculation: "Opens detailed data source modal",
      icon: Eye,
      color: "text-primary-400"
    },
    price: {
      title: "Price (USD)",
      description: "Current market price of the token in US Dollars, averaged across multiple exchanges for accuracy.",
      source: "MEXC API + Gate.io API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Every 3 seconds via WebSocket",
      calculation: "Average of all available exchange prices: (MEXC Price + Gate.io Price) / 2",
      icon: DollarSign,
      color: "text-green-400"
    },
    tradingStatus: {
      title: "Trading Status",
      description: "Current trading status of the token pair on MEXC exchange. Indicates whether the token can be actively traded.",
      source: "MEXC exchangeInfo API",
      endpoint: "/api/v3/exchangeInfo",
      updateFrequency: "Every price update (3 seconds)",
      calculation: "Direct from exchange status field",
      possibleValues: ["TRADING (Active)", "HALT (Suspended)", "BREAK (Paused)", "PRE_TRADING", "POST_TRADING", "UNKNOWN"],
      icon: Activity,
      color: "text-blue-400"
    },
    openPrice: {
      title: "Open Price",
      description: "The opening price of the token at the start of the current 24-hour trading period (00:00 UTC).",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Price at 00:00 UTC of current day",
      icon: Clock,
      color: "text-blue-400"
    },
    priceChange: {
      title: "Price Change",
      description: "Absolute price change in USD over the last 24 hours. Shows the actual dollar amount difference, not percentage.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Current Price - Open Price (in USD)",
      icon: TrendingUp,
      color: "text-purple-400"
    },
    high24h: {
      title: "24h High",
      description: "The highest price the token reached during the last 24-hour period. Useful for understanding daily volatility.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Maximum price in 24h rolling window",
      icon: TrendingUp,
      color: "text-success-400"
    },
    low24h: {
      title: "24h Low",
      description: "The lowest price the token reached during the last 24-hour period. Helps identify support levels.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Minimum price in 24h rolling window",
      icon: TrendingUp,
      color: "text-danger-400"
    },
    volume24h: {
      title: "24h Volume",
      description: "Total trading volume in the last 24 hours, shown in both USD value and token quantity. Indicates market activity.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Sum of all trade volumes in 24h period (USD) + Token count",
      icon: BarChart3,
      color: "text-purple-400"
    },
    tradeCount: {
      title: "Trade Count",
      description: "Total number of individual buy and sell transactions in the last 24 hours. Higher count indicates more market activity and liquidity.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Count of all buy/sell transactions in 24h period",
      icon: Activity,
      color: "text-orange-400"
    },
    bidAsk: {
      title: "Bid/Ask Spread",
      description: "Current highest bid price and lowest ask price with spread percentage. Shows market liquidity and trading costs.",
      source: "MEXC API",
      endpoint: "/api/v3/ticker/24hr",
      updateFrequency: "Real-time",
      calculation: "Bid: Highest buy order, Ask: Lowest sell order, Spread % = ((Ask - Bid) / Bid) * 100",
      icon: DollarSign,
      color: "text-yellow-400"
    },
    ath: {
      title: "All-Time High (ATH)",
      description: "The highest price this token has ever reached in its trading history. Calculated from up to 2 years of historical data.",
      source: "MEXC Klines API (Historical)",
      endpoint: "/api/v3/klines",
      updateFrequency: "Daily calculation",
      calculation: "Maximum price from 2+ years of daily candle data",
      dataRange: "Up to 2 years of historical data",
      icon: TrendingUp,
      color: "text-yellow-400"
    },
    atl: {
      title: "All-Time Low (ATL)",
      description: "The lowest price this token has ever reached in its trading history. Calculated from historical market data.",
      source: "MEXC Klines API (Historical)",
      endpoint: "/api/v3/klines",
      updateFrequency: "Daily calculation",
      calculation: "Minimum price from 2+ years of daily candle data",
      dataRange: "Up to 2 years of historical data",
      icon: TrendingUp,
      color: "text-blue-400"
    },
    percentFromATH: {
      title: "% from ATH",
      description: "Percentage difference between current price and all-time high. Negative values show how far below ATH the token currently trades.",
      source: "Calculated",
      updateFrequency: "Real-time",
      calculation: "((Current Price - ATH) / ATH) * 100",
      icon: BarChart3,
      color: "text-indigo-400"
    },
    exchangeCount: {
      title: "# Exchanges",
      description: "Total number of cryptocurrency exchanges where this token is currently listed and available for trading.",
      source: "Web Scraper (CryptocurrencyAlerting.com)",
      updateFrequency: "Every 5 minutes (configurable)",
      calculation: "Count of unique exchanges from scraper results",
      icon: Building2,
      color: "text-blue-400"
    },
    exchanges: {
      title: "Exchanges",
      description: "Complete list of all cryptocurrency exchanges where this token is currently available for trading.",
      source: "Web Scraper (CryptocurrencyAlerting.com)",
      updateFrequency: "Every 5 minutes (configurable)",
      calculation: "Aggregated list from scraper results",
      icon: Building2,
      color: "text-indigo-400"
    },
    newExchanges: {
      title: "New (24h)",
      description: "Exchanges where the token was newly listed since the last scraper run. Shows recent exchange additions.",
      source: "Web Scraper Comparison",
      updateFrequency: "Every scraper run",
      calculation: "Difference between current and previous scrape results (new listings)",
      icon: TrendingUp,
      color: "text-success-400"
    },
    removedExchanges: {
      title: "Removed (24h)",
      description: "Exchanges where the token is no longer listed since the last scraper run. Shows recent delistings.",
      source: "Web Scraper Comparison",
      updateFrequency: "Every scraper run",
      calculation: "Exchanges present in previous but not current scrape",
      icon: TrendingUp,
      color: "text-danger-400"
    },
    lastScraped: {
      title: "Last Scraped",
      description: "Timestamp of the last successful web scraper run for this token's exchange data.",
      source: "Internal Scraper Service",
      updateFrequency: "Every scraper run",
      calculation: "Timestamp of last successful data collection",
      icon: Clock,
      color: "text-gray-400"
    },
    tokenAdded: {
      title: "Token Added",
      description: "Date and time when this token was first added to your dashboard platform.",
      source: "Internal Database",
      updateFrequency: "Static (set once)",
      calculation: "Timestamp when token was first added to system",
      icon: Database,
      color: "text-gray-400"
    },
    notes: {
      title: "Notes",
      description: "Click to add or view personal notes and comments about this token. Useful for tracking your analysis or observations.",
      source: "User Input",
      updateFrequency: "Manual user updates",
      calculation: "User-generated content and annotations",
      icon: MessageSquare,
      color: "text-gray-400"
    },
    alerts: {
      title: "Alerts",
      description: "Click to set up price alerts and notifications for this token. Get notified when price reaches your target levels.",
      source: "Internal Alert System",
      updateFrequency: "Real-time monitoring",
      calculation: "User-defined price thresholds and conditions",
      icon: Bell,
      color: "text-warning-400"
    },
    track: {
      title: "Track Performance",
      description: "Click to view detailed performance tracking and exchange listing history over time for this token.",
      source: "Internal Analytics",
      updateFrequency: "Historical data analysis",
      calculation: "Time-series analysis of exchange listings and price performance",
      icon: BarChart3,
      color: "text-blue-400"
    }
  };

  const columnInfo = columnInfoMap[columnKey];

  if (!columnInfo) {
    return null;
  }

  const Icon = columnInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center ${columnInfo.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{columnInfo.title}</h2>
              <p className="text-gray-400 text-sm">Data source and calculation details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-primary-400" />
              <span>What This Shows</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">{columnInfo.description}</p>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Data Source</span>
              </h4>
              <p className="text-primary-300 font-medium">{columnInfo.source}</p>
              {columnInfo.endpoint && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">API Endpoint:</span>
                  <code className="block text-xs bg-gray-900 px-2 py-1 rounded text-green-400 font-mono mt-1">
                    {columnInfo.endpoint}
                  </code>
                </div>
              )}
            </div>

            <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>Update Frequency</span>
              </h4>
              <p className="text-yellow-300 font-medium">{columnInfo.updateFrequency}</p>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>How It's Calculated</span>
            </h4>
            <p className="text-gray-300">{columnInfo.calculation}</p>
          </div>

          {/* Possible Values */}
          {columnInfo.possibleValues && (
            <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-info-400" />
                <span>Possible Values</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {columnInfo.possibleValues.map((value, index) => (
                  <span key={index} className="badge-modern badge-info text-sm">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Range */}
          {columnInfo.dataRange && (
            <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Data Range</span>
              </h4>
              <p className="text-indigo-300 font-medium">{columnInfo.dataRange}</p>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-warning-600/10 border border-warning-600/30 rounded-xl p-4">
            <h4 className="font-bold text-warning-300 mb-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Important Notes</span>
            </h4>
            <ul className="text-warning-200 text-sm space-y-1 list-disc list-inside">
              <li>All timestamps are in UTC timezone</li>
              <li>Price data is averaged across multiple exchanges for accuracy</li>
              <li>Historical data may have gaps during exchange maintenance</li>
              <li>Scraper data depends on external website availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};