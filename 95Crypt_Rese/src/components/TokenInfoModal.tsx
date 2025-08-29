import React from 'react';
import { X, Database, TrendingUp, TrendingDown, Activity, Clock, Building2, DollarSign, BarChart3, Zap, Globe, AlertCircle } from 'lucide-react';
import { Token, PriceData } from '../types';
import { format } from 'date-fns';

interface TokenInfoModalProps {
  token: Token;
  priceData?: PriceData;
  onClose: () => void;
}

export const TokenInfoModal: React.FC<TokenInfoModalProps> = ({ token, priceData, onClose }) => {
  const dataSourceInfo = [
    {
      category: "Price Data",
      icon: DollarSign,
      color: "text-green-400",
      items: [
        {
          field: "Current Price (USD)",
          source: "MEXC API + Gate.io API",
          description: "Real-time price fetched from multiple exchanges and averaged",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Every 3 seconds via WebSocket",
          calculation: "Average of all available exchange prices"
        },
        {
          field: "24h Price Change %",
          source: "MEXC API",
          description: "Percentage change in price over the last 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "((Current Price - Open Price) / Open Price) * 100"
        }
      ]
    },
    {
      category: "Trading Information",
      icon: Activity,
      color: "text-blue-400",
      items: [
        {
          field: "Trading Status",
          source: "MEXC exchangeInfo API",
          description: "Current trading status of the token pair",
          endpoint: "/api/v3/exchangeInfo",
          updateFrequency: "Every price update",
          calculation: "Direct from exchange status field",
          possibleValues: ["TRADING (Active)", "HALT (Suspended)", "BREAK (Paused)", "UNKNOWN"]
        },
        {
          field: "Open Price",
          source: "MEXC API",
          description: "Opening price at the start of the 24-hour period",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Price at 00:00 UTC of current day"
        },
        {
          field: "Price Change (Absolute)",
          source: "MEXC API",
          description: "Absolute price change in USD over 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Current Price - Open Price"
        }
      ]
    },
    {
      category: "Market Data",
      icon: BarChart3,
      color: "text-purple-400",
      items: [
        {
          field: "24h High",
          source: "MEXC API",
          description: "Highest price reached in the last 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Maximum price in 24h rolling window"
        },
        {
          field: "24h Low",
          source: "MEXC API",
          description: "Lowest price reached in the last 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Minimum price in 24h rolling window"
        },
        {
          field: "24h Volume",
          source: "MEXC API",
          description: "Total trading volume in the last 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Sum of all trade volumes in 24h period"
        },
        {
          field: "Trade Count",
          source: "MEXC API",
          description: "Total number of individual trades in the last 24 hours",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Count of all buy/sell transactions in 24h period"
        },
        {
          field: "Bid/Ask Spread",
          source: "MEXC API",
          description: "Current highest bid and lowest ask prices with spread percentage",
          endpoint: "/api/v3/ticker/24hr",
          updateFrequency: "Real-time",
          calculation: "Spread % = ((Ask - Bid) / Bid) * 100"
        }
      ]
    },
    {
      category: "Historical Data",
      icon: Clock,
      color: "text-yellow-400",
      items: [
        {
          field: "All-Time High (ATH)",
          source: "MEXC Klines API (Historical)",
          description: "Highest price ever recorded for this token",
          endpoint: "/api/v3/klines",
          updateFrequency: "Daily calculation",
          calculation: "Maximum price from 2+ years of daily candle data",
          dataRange: "Up to 2 years of historical data"
        },
        {
          field: "All-Time Low (ATL)",
          source: "MEXC Klines API (Historical)",
          description: "Lowest price ever recorded for this token",
          endpoint: "/api/v3/klines",
          updateFrequency: "Daily calculation",
          calculation: "Minimum price from 2+ years of daily candle data",
          dataRange: "Up to 2 years of historical data"
        },
        {
          field: "% from ATH",
          source: "Calculated",
          description: "Percentage difference between current price and all-time high",
          endpoint: "Internal calculation",
          updateFrequency: "Real-time",
          calculation: "((Current Price - ATH) / ATH) * 100"
        }
      ]
    },
    {
      category: "Exchange Data",
      icon: Building2,
      color: "text-indigo-400",
      items: [
        {
          field: "Number of Exchanges",
          source: "Web Scraper (CryptocurrencyAlerting.com)",
          description: "Total number of exchanges where this token is listed",
          endpoint: "Internal scraper service",
          updateFrequency: "Every 5 minutes (configurable)",
          calculation: "Count of unique exchanges from scraper results"
        },
        {
          field: "Exchange List",
          source: "Web Scraper (CryptocurrencyAlerting.com)",
          description: "List of all exchanges where this token is available",
          endpoint: "Internal scraper service",
          updateFrequency: "Every 5 minutes (configurable)",
          calculation: "Aggregated list from scraper results"
        },
        {
          field: "New Exchanges (24h)",
          source: "Web Scraper Comparison",
          description: "Exchanges where the token was newly listed in the last scrape",
          endpoint: "Internal scraper service",
          updateFrequency: "Every scraper run",
          calculation: "Difference between current and previous scrape results"
        },
        {
          field: "Removed Exchanges (24h)",
          source: "Web Scraper Comparison",
          description: "Exchanges where the token is no longer listed",
          endpoint: "Internal scraper service",
          updateFrequency: "Every scraper run",
          calculation: "Exchanges present in previous but not current scrape"
        },
        {
          field: "Last Scraped",
          source: "Internal System",
          description: "Timestamp of the last successful scraper run for this token",
          endpoint: "Internal scraper service",
          updateFrequency: "Every scraper run",
          calculation: "Timestamp of last successful data collection"
        }
      ]
    },
    {
      category: "System Information",
      icon: Database,
      color: "text-gray-400",
      items: [
        {
          field: "Token Added",
          source: "Internal Database",
          description: "Date when this token was added to the platform",
          endpoint: "Internal database",
          updateFrequency: "Static (set once)",
          calculation: "Timestamp when token was first added to system"
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-gray-950 font-bold shadow-md">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{token.symbol} Data Information</h2>
              <p className="text-gray-400">{token.name} - Data sources and calculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Values Summary */}
        <div className="p-6 bg-gray-850/30 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-400" />
            <span>Current Values</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {priceData && (
              <>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-xl font-bold text-white">${priceData.averagePrice.toFixed(4)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="text-sm text-gray-400">24h Change</div>
                  <div className={`text-xl font-bold ${priceData.change24h >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
                  </div>
                </div>
              </>
            )}
            {token.allTimeHigh && (
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-sm text-gray-400">All-Time High</div>
                <div className="text-xl font-bold text-yellow-400">${token.allTimeHigh.toFixed(4)}</div>
              </div>
            )}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Exchanges</div>
              <div className="text-xl font-bold text-blue-400">
                {token.exchangeData?.totalExchanges || token.exchanges.length}
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Information */}
        <div className="p-6 space-y-8">
          {dataSourceInfo.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="space-y-4">
                <h3 className={`text-xl font-bold flex items-center space-x-3 ${category.color}`}>
                  <Icon className="w-6 h-6" />
                  <span>{category.category}</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-white text-lg">{item.field}</h4>
                          <div className="flex items-center space-x-1 text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                            <Globe className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-300 font-medium">Live Data</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Source:</span>
                            <span className="text-sm text-primary-300 font-medium">{item.source}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Endpoint:</span>
                            <code className="text-xs bg-gray-900 px-2 py-1 rounded text-green-400 font-mono">
                              {item.endpoint}
                            </code>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Updates:</span>
                            <span className="text-sm text-yellow-300">{item.updateFrequency}</span>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Calculation:</span>
                            <span className="text-sm text-gray-300 flex-1">{item.calculation}</span>
                          </div>
                          
                          {item.possibleValues && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Values:</span>
                              <div className="flex flex-wrap gap-1">
                                {item.possibleValues.map((value, valueIndex) => (
                                  <span key={valueIndex} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.dataRange && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Range:</span>
                              <span className="text-sm text-purple-300">{item.dataRange}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* API Rate Limits & Notes */}
        <div className="p-6 bg-gray-850/30 border-t border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-warning-400" />
            <span>Important Notes</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-warning-300">API Rate Limits:</h4>
              <ul className="text-gray-300 space-y-1 list-disc list-inside">
                <li>MEXC API: 250ms delay between requests</li>
                <li>Price updates: Every 3 seconds via WebSocket</li>
                <li>ATH/ATL calculation: Once daily per token</li>
                <li>Exchange scraping: Every 5 minutes (configurable)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-info-300">Data Accuracy:</h4>
              <ul className="text-gray-300 space-y-1 list-disc list-inside">
                <li>Prices are averaged across multiple exchanges</li>
                <li>ATH/ATL based on up to 2 years of historical data</li>
                <li>Exchange listings updated via web scraping</li>
                <li>All timestamps are in UTC</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};