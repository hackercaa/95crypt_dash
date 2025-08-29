import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, Settings, RefreshCw, Globe, Database, Zap, Eye, EyeOff, Key, TestTube, Shield, Building2, Search, Filter, MoreHorizontal, TrendingUp, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ScrapingStatus {
  enabled: boolean;
  interval: number;
  lastRun: number | null;
  nextRun: number | null;
  isRunning: boolean;
  totalScraped: number;
  errors: Array<{ timestamp: number; message: string }>;
}

interface TokenScrapingConfig {
  symbol: string;
  name: string;
  enabled: boolean;
  priority: 'high' | 'normal' | 'low';
  lastScraped: number | null;
  exchangeCount: number;
  status: 'success' | 'error' | 'pending' | 'never';
  errorMessage?: string;
}

interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
}

interface ExchangeApiConfig {
  id: 'mexc' | 'gateio';
  name: string;
  displayName: string;
  icon: string;
  credentials: ApiCredentials;
  enabled: boolean;
  connected: boolean;
  lastTested: number | null;
  lastError: string | null;
  rateLimit: { remaining: number; resetTime: number | null };
}

export const ScrapingControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'apikeys'>('overview');
  
  // Overview tab state
  const [status, setStatus] = useState<ScrapingStatus>({
    enabled: true,
    interval: 300000,
    lastRun: Date.now() - 3600000,
    nextRun: Date.now() + 300000,
    isRunning: false,
    totalScraped: 157,
    errors: [
      { timestamp: Date.now() - 1800000, message: 'Rate limit exceeded for CryptocurrencyAlerting.com' },
      { timestamp: Date.now() - 3600000, message: 'Network timeout while fetching data' }
    ]
  });
  
  const [customInterval, setCustomInterval] = useState('5');

  // Token controls state
  const [tokenConfigs, setTokenConfigs] = useState<TokenScrapingConfig[]>([
    { symbol: 'BTC', name: 'Bitcoin', enabled: true, priority: 'high', lastScraped: Date.now() - 1800000, exchangeCount: 15, status: 'success' },
    { symbol: 'ETH', name: 'Ethereum', enabled: true, priority: 'high', lastScraped: Date.now() - 1200000, exchangeCount: 12, status: 'success' },
    { symbol: 'AIPUMP', name: 'AI Pump', enabled: true, priority: 'normal', lastScraped: Date.now() - 900000, exchangeCount: 3, status: 'success' },
    { symbol: 'AAVE', name: 'Aave', enabled: false, priority: 'low', lastScraped: null, exchangeCount: 8, status: 'never' },
    { symbol: 'UNI', name: 'Uniswap', enabled: true, priority: 'normal', lastScraped: Date.now() - 2400000, exchangeCount: 7, status: 'error', errorMessage: 'Token not found on exchange' }
  ]);
  
  const [tokenSearchTerm, setTokenSearchTerm] = useState('');
  const [tokenPriorityFilter, setTokenPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');
  const [tokenStatusFilter, setTokenStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // API Keys state
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  
  const [exchangeConfigs, setExchangeConfigs] = useState<ExchangeApiConfig[]>([
    {
      id: 'mexc',
      name: 'MEXC',
      displayName: 'MEXC Exchange',
      icon: '🏛️',
      credentials: { apiKey: '', secretKey: '', sandbox: false },
      enabled: false,
      connected: false,
      lastTested: null,
      lastError: null,
      rateLimit: { remaining: 1200, resetTime: null }
    },
    {
      id: 'gateio', 
      name: 'Gate.io',
      displayName: 'Gate.io Exchange',
      icon: '🌐',
      credentials: { apiKey: '', secretKey: '', sandbox: false },
      enabled: false,
      connected: false,
      lastTested: null,
      lastError: null,
      rateLimit: { remaining: 900, resetTime: null }
    }
  ]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scraping/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch scraping status:', error);
    }
  };

  const toggleScraping = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scraping/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !status.enabled })
      });
      
      if (response.ok) {
        setStatus({ ...status, enabled: !status.enabled });
        toast.success(`Scraping ${!status.enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling scraping:', error);
      toast.error('Failed to toggle scraping');
    }
  };

  const updateSchedule = async () => {
    if (!customInterval || parseInt(customInterval) < 1) {
      toast.error('Please enter a valid interval (minimum 1 minute)');
      return;
    }
    
    const intervalMs = parseInt(customInterval) * 60 * 1000;
    try {
      const response = await fetch('http://localhost:3001/api/scraping/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: intervalMs })
      });
      
      if (response.ok) {
        setStatus({ ...status, interval: intervalMs });
        toast.success('Schedule updated successfully');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  // Token control functions
  const toggleTokenScraping = (symbol: string) => {
    setTokenConfigs(prev => prev.map(config =>
      config.symbol === symbol ? { ...config, enabled: !config.enabled } : config
    ));
    toast.success(`${symbol} scraping ${tokenConfigs.find(c => c.symbol === symbol)?.enabled ? 'disabled' : 'enabled'}`);
  };

  const updateTokenPriority = (symbol: string, priority: 'high' | 'normal' | 'low') => {
    setTokenConfigs(prev => prev.map(config =>
      config.symbol === symbol ? { ...config, priority } : config
    ));
    toast.success(`${symbol} priority set to ${priority}`);
  };

  const manualScrapeToken = async (symbol: string) => {
    setTokenConfigs(prev => prev.map(config =>
      config.symbol === symbol ? { ...config, status: 'pending' } : config
    ));
    
    // Simulate API call
    setTimeout(() => {
      setTokenConfigs(prev => prev.map(config =>
        config.symbol === symbol ? { 
          ...config, 
          status: 'success', 
          lastScraped: Date.now(),
          exchangeCount: config.exchangeCount + Math.floor(Math.random() * 3)
        } : config
      ));
      toast.success(`${symbol} scraped successfully`);
    }, 2000);
  };

  const getFilteredTokens = () => {
    return tokenConfigs.filter(token => {
      if (tokenSearchTerm && !token.symbol.toLowerCase().includes(tokenSearchTerm.toLowerCase()) && !token.name.toLowerCase().includes(tokenSearchTerm.toLowerCase())) {
        return false;
      }
      if (tokenPriorityFilter !== 'all' && token.priority !== tokenPriorityFilter) {
        return false;
      }
      if (tokenStatusFilter === 'enabled' && !token.enabled) return false;
      if (tokenStatusFilter === 'disabled' && token.enabled) return false;
      return true;
    });
  };

  // API key functions
  const toggleApiKeyVisibility = (exchangeId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [exchangeId]: !prev[exchangeId]
    }));
  };

  const updateExchangeCredentials = (exchangeId: string, field: keyof ApiCredentials, value: string | boolean) => {
    setExchangeConfigs(prev => prev.map(exchange =>
      exchange.id === exchangeId
        ? { 
            ...exchange, 
            credentials: { ...exchange.credentials, [field]: value }
          }
        : exchange
    ));
  };

  const testConnection = async (exchangeId: string) => {
    const exchange = exchangeConfigs.find(e => e.id === exchangeId);
    if (!exchange?.credentials.apiKey) {
      toast.error('Please enter API credentials first');
      return;
    }

    setTestingConnection(prev => ({ ...prev, [exchangeId]: true }));

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3;
      
      setExchangeConfigs(prev => prev.map(ex =>
        ex.id === exchangeId
          ? {
              ...ex,
              connected: success,
              lastTested: Date.now(),
              lastError: success ? null : 'Invalid API credentials'
            }
          : ex
      ));

      if (success) {
        toast.success(`${exchange.displayName} connection successful`);
      } else {
        toast.error(`${exchange.displayName} connection failed`);
      }
    } finally {
      setTestingConnection(prev => ({ ...prev, [exchangeId]: false }));
    }
  };

  const toggleExchangeEnabled = (exchangeId: string) => {
    setExchangeConfigs(prev => prev.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, enabled: !exchange.enabled }
        : exchange
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success-400';
      case 'error': return 'text-danger-400'; 
      case 'pending': return 'text-warning-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, description: 'Global scraping settings and status' },
    { id: 'tokens', label: 'Token Controls', icon: Settings, description: 'Per-token scraping configuration' },
    { id: 'apikeys', label: 'API Keys', icon: Key, description: 'Exchange API credential management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-glow">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Web Scraping Control</h1>
            <p className="text-gray-400 mt-1">Monitor and control data collection from external sources</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${
          status.enabled ? 'bg-success-600/20 text-success-300' : 'bg-danger-600/20 text-danger-300'
        }`}>
          {status.enabled ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{status.enabled ? 'Active' : 'Disabled'}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-modern p-2">
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-gray-950 shadow-glow transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <div className="card-modern p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Global Configuration</h3>
                    <p className="text-gray-400 text-sm">Control overall scraping behavior</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-850/50 rounded-xl border border-gray-800">
                    <div>
                      <span className="text-white font-semibold">Scraping Status</span>
                      <p className="text-gray-400 text-sm">Enable or disable data collection</p>
                    </div>
                    <button
                      onClick={toggleScraping}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        status.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                          status.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Scraping Interval (minutes)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={customInterval}
                          onChange={(e) => setCustomInterval(e.target.value)}
                          className="input-modern flex-1 px-4 py-3"
                        />
                        <button
                          onClick={updateSchedule}
                          className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
                        >
                          Update
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Current: {Math.round(status.interval / 60000)} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Information */}
              <div className="card-modern p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Status Information</h3>
                    <p className="text-gray-400 text-sm">Current scraping statistics</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                      <div className="text-sm text-gray-400 font-semibold">Total Scraped</div>
                      <div className="text-2xl font-bold text-white">{status.totalScraped}</div>
                    </div>
                    <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                      <div className="text-sm text-gray-400 font-semibold">Status</div>
                      <div className={`text-sm font-bold ${
                        status.isRunning ? 'text-warning-400' : status.enabled ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {status.isRunning ? 'Running' : status.enabled ? 'Waiting' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                      <span className="text-sm text-gray-400 font-semibold">Last Run:</span>
                      <div className="text-white font-bold">
                        {status.lastRun ? format(new Date(status.lastRun), 'MMM dd, HH:mm:ss') : 'Never'}
                      </div>
                    </div>
                    <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                      <span className="text-sm text-gray-400 font-semibold">Next Run:</span>
                      <div className="text-white font-bold">
                        {status.nextRun && status.enabled ? format(new Date(status.nextRun), 'MMM dd, HH:mm:ss') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="card-modern p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Data Sources</h3>
                  <p className="text-gray-400">External sources for token and exchange data</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">CryptocurrencyAlerting.com</h4>
                      <p className="text-sm text-gray-400">Primary source for token data</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-success-400 text-sm font-semibold">Active</span>
                      <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse shadow-glow-success"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Database className="w-4 h-4" />
                    <span>Token listings and exchange data</span>
                  </div>
                </div>
                
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">MEXC Exchange API</h4>
                      <p className="text-sm text-gray-400">Real-time price data</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-success-400 text-sm font-semibold">Connected</span>
                      <div className="w-3 h-3 bg-success-400 rounded-full shadow-glow-success"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Zap className="w-4 h-4" />
                    <span>Live price feeds and market data</span>
                  </div>
                </div>
                
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">Gate.io Exchange API</h4>
                      <p className="text-sm text-gray-400">Market data and trends</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-success-400 text-sm font-semibold">Connected</span>
                      <div className="w-3 h-3 bg-success-400 rounded-full shadow-glow-success"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Zap className="w-4 h-4" />
                    <span>Historical data and market trends</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Log */}
            {status.errors.length > 0 && (
              <div className="bg-danger-900/20 border border-danger-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-danger-600/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-danger-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-danger-300">Recent Errors</h3>
                    <p className="text-danger-200/70">Latest scraping errors and issues</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {status.errors.slice(-5).map((error, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-danger-900/30 rounded-lg border border-danger-800/50">
                      <span className="text-danger-400 font-mono text-sm font-bold">
                        {format(new Date(error.timestamp), 'HH:mm:ss')}
                      </span>
                      <span className="text-danger-200 flex-1">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Token Controls Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            {/* Token Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{tokenConfigs.length}</div>
                    <div className="text-sm text-gray-400">Total Tokens</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-600/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-400">{tokenConfigs.filter(t => t.enabled).length}</div>
                    <div className="text-sm text-gray-400">Enabled</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-danger-600/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-danger-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-danger-400">{tokenConfigs.filter(t => !t.enabled).length}</div>
                    <div className="text-sm text-gray-400">Disabled</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-600/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-400">{tokenConfigs.filter(t => t.priority === 'high').length}</div>
                    <div className="text-sm text-gray-400">High Priority</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Controls */}
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Per-Token Scraping Controls</h3>
                  <p className="text-gray-400 text-sm">Configure individual token scraping settings</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setTokenConfigs(prev => prev.map(config => ({ ...config, enabled: true })));
                      toast.success('All tokens enabled for scraping');
                    }}
                    className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => {
                      setTokenConfigs(prev => prev.map(config => ({ ...config, enabled: false })));
                      toast.success('All tokens disabled for scraping');
                    }}
                    className="bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tokenSearchTerm}
                    onChange={(e) => setTokenSearchTerm(e.target.value)}
                    className="input-modern w-full pl-10 pr-4 py-2"
                    placeholder="Search tokens..."
                  />
                </div>

                <select
                  value={tokenPriorityFilter}
                  onChange={(e) => setTokenPriorityFilter(e.target.value as any)}
                  className="input-modern px-3 py-2"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <select
                  value={tokenStatusFilter}
                  onChange={(e) => setTokenStatusFilter(e.target.value as any)}
                  className="input-modern px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="enabled">Enabled Only</option>
                  <option value="disabled">Disabled Only</option>
                </select>
              </div>

              {/* Token Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-850/50 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Token</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Enabled</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Priority</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Last Scraped</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Exchanges</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {getFilteredTokens().map((token) => (
                      <tr key={token.symbol} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-gray-950 text-xs font-bold">
                              {token.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white">{token.symbol}</div>
                              <div className="text-xs text-gray-400">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleTokenScraping(token.symbol)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              token.enabled ? 'bg-success-600' : 'bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              token.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={token.priority}
                            onChange={(e) => updateTokenPriority(token.symbol, e.target.value as any)}
                            className={`bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm ${
                              token.priority === 'high' ? 'border-warning-500' : 
                              token.priority === 'normal' ? 'border-blue-500' : 'border-gray-600'
                            }`}
                          >
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-300">
                            {token.lastScraped ? format(new Date(token.lastScraped), 'MM/dd HH:mm') : 'Never'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {token.lastScraped ? 
                              `${Math.round((Date.now() - token.lastScraped) / 60000)} min ago` : 
                              'Not scraped'
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-blue-400 font-bold">{token.exchangeCount}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center space-x-1 ${getStatusColor(token.status)}`}>
                            {getStatusIcon(token.status)}
                            <span className="text-sm font-medium capitalize">{token.status}</span>
                          </div>
                          {token.errorMessage && (
                            <div className="text-xs text-danger-300 mt-1">{token.errorMessage}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => manualScrapeToken(token.symbol)}
                            disabled={token.status === 'pending'}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            {token.status === 'pending' ? 'Scraping...' : 'Scrape Now'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'apikeys' && (
          <div className="space-y-6">
            {/* API Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{exchangeConfigs.filter(e => e.credentials.apiKey).length}</div>
                    <div className="text-sm text-gray-400">APIs Configured</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-600/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-400">{exchangeConfigs.filter(e => e.connected).length}</div>
                    <div className="text-sm text-gray-400">Connected APIs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange API Configurations */}
            <div className="space-y-6">
              {exchangeConfigs.map((exchange) => (
                <div key={exchange.id} className="card-modern overflow-hidden">
                  {/* Exchange Header */}
                  <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{exchange.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{exchange.displayName}</h3>
                          <p className="text-gray-400">Real-time price data and market information</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Connection Status */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                          exchange.connected && exchange.enabled
                            ? 'bg-success-600/20 text-success-300'
                            : exchange.lastError
                            ? 'bg-danger-600/20 text-danger-300'
                            : 'bg-gray-600/20 text-gray-300'
                        }`}>
                          {exchange.connected ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : exchange.lastError ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                          <span className="font-bold">
                            {exchange.connected ? 'Connected' : exchange.lastError ? 'Error' : 'Not Tested'}
                          </span>
                        </div>

                        {/* Enable Toggle */}
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-300 font-semibold">Enable API</span>
                          <button
                            onClick={() => toggleExchangeEnabled(exchange.id)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                              exchange.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                              exchange.enabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Configuration */}
                  <div className="p-6">
                    <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-4">
                        <Key className="w-5 h-5 text-blue-400" />
                        <h4 className="text-lg font-bold text-white">API Credentials</h4>
                        <div className="bg-blue-600/10 border border-blue-600/30 rounded-full px-3 py-1">
                          <span className="text-blue-300 text-xs font-semibold">SECURE STORAGE</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* API Key */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKeys[exchange.id] ? 'text' : 'password'}
                              value={exchange.credentials.apiKey}
                              onChange={(e) => updateExchangeCredentials(exchange.id, 'apiKey', e.target.value)}
                              className="input-modern w-full pr-12"
                              placeholder="Enter your API key"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility(exchange.id)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showApiKeys[exchange.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Secret Key */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Secret Key
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKeys[exchange.id] ? 'text' : 'password'}
                              value={exchange.credentials.secretKey}
                              onChange={(e) => updateExchangeCredentials(exchange.id, 'secretKey', e.target.value)}
                              className="input-modern w-full pr-12"
                              placeholder="Enter your secret key"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility(exchange.id)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showApiKeys[exchange.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sandbox Toggle */}
                      <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700/30 transition-colors mb-6">
                        <input
                          type="checkbox"
                          checked={exchange.credentials.sandbox}
                          onChange={(e) => updateExchangeCredentials(exchange.id, 'sandbox', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <TestTube className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-semibold">Use Sandbox/Testnet</span>
                        </div>
                        <span className="text-xs text-gray-400">(Recommended for testing)</span>
                      </label>

                      {/* Test Connection */}
                      <button
                        onClick={() => testConnection(exchange.id)}
                        disabled={!exchange.credentials.apiKey || !exchange.credentials.secretKey || testingConnection[exchange.id]}
                        className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                      >
                        {testingConnection[exchange.id] ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Testing Connection...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span>Test Connection</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Display */}
                    {exchange.lastError && (
                      <div className="mt-4 bg-danger-600/10 border border-danger-600/30 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-danger-400" />
                          <span className="font-bold text-danger-300">Connection Error</span>
                        </div>
                        <p className="text-danger-200">{exchange.lastError}</p>
                      </div>
                    )}

                    {/* Connection Success */}
                    {exchange.connected && (
                      <div className="mt-4 bg-success-600/10 border border-success-600/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-success-400" />
                            <span className="font-bold text-success-300">Connected Successfully</span>
                          </div>
                          <div className="text-sm text-success-200">
                            Rate limit: {exchange.rateLimit.remaining} remaining
                          </div>
                        </div>
                        {exchange.lastTested && (
                          <p className="text-xs text-success-200 mt-2">
                            Last tested: {format(new Date(exchange.lastTested), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Setup Instructions */}
            <div className="card-modern p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-info-600/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-info-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Setup Instructions</h3>
                  <p className="text-gray-400">How to obtain and configure your API credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MEXC Instructions */}
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <span>🏛️</span>
                    <span>MEXC Exchange Setup</span>
                  </h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Visit <a href="https://www.mexc.com" target="_blank" className="text-blue-400 hover:text-blue-300">MEXC.com</a> and create an account</li>
                    <li>Navigate to Account → API Management</li>
                    <li>Click "Create API" and select "Spot Trading"</li>
                    <li>Enable "Read" permissions only</li>
                    <li>Copy the API Key and Secret Key</li>
                    <li>Add your IP address to the whitelist</li>
                    <li>Test the connection using the button above</li>
                  </ol>
                </div>

                {/* Gate.io Instructions */}
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <span>🌐</span>
                    <span>Gate.io Exchange Setup</span>
                  </h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Visit <a href="https://www.gate.io" target="_blank" className="text-blue-400 hover:text-blue-300">Gate.io</a> and create an account</li>
                    <li>Go to Account Settings → API Keys</li>
                    <li>Click "Create API Key"</li>
                    <li>Select "Read Only" permissions</li>
                    <li>Copy the generated API Key and Secret</li>
                    <li>Configure IP restrictions for security</li>
                    <li>Test the connection to verify setup</li>
                  </ol>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 bg-warning-600/10 border border-warning-600/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-warning-400" />
                  <span className="font-bold text-warning-300">Security Best Practices</span>
                </div>
                <ul className="text-warning-200 text-sm space-y-1 list-disc list-inside">
                  <li><strong>Read-Only Permissions:</strong> Only grant read permissions, never trading or withdrawal</li>
                  <li><strong>IP Whitelisting:</strong> Restrict API access to your specific IP addresses</li>
                  <li><strong>Regular Rotation:</strong> Rotate API keys periodically for enhanced security</li>
                  <li><strong>Sandbox First:</strong> Always test with sandbox/testnet before using live credentials</li>
                  <li><strong>Monitor Usage:</strong> Regularly check API usage logs on exchange platforms</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};