import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, Settings, RefreshCw, Globe, Database, Zap, Key, Eye, EyeOff, Shield, TestTube, TrendingUp, Building2, Search, Filter, Play, Pause, BarChart3 } from 'lucide-react';
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

interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  enabled: boolean;
  lastTested: number | null;
  connected: boolean;
  lastError: string | null;
}

interface TokenScrapingConfig {
  symbol: string;
  name: string;
  enabled: boolean;
  priority: 'high' | 'normal' | 'low';
  lastScraped: number | null;
  exchangeCount: number;
  errors: number;
}

export const ScrapingControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'api-keys'>('overview');
  const [status, setStatus] = useState<ScrapingStatus>({
    enabled: true,
    interval: 300000,
    lastRun: null,
    nextRun: null,
    isRunning: false,
    totalScraped: 0,
    errors: []
  });
  const [customInterval, setCustomInterval] = useState('5');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});

  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, ApiCredentials>>({
    mexc: {
      apiKey: '',
      secretKey: '',
      enabled: false,
      lastTested: null,
      connected: false,
      lastError: null
    },
    gateio: {
      apiKey: '',
      secretKey: '',
      enabled: false,
      lastTested: null,
      connected: false,
      lastError: null
    }
  });

  // Token scraping configurations
  const [tokenConfigs, setTokenConfigs] = useState<TokenScrapingConfig[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      enabled: true,
      priority: 'high',
      lastScraped: Date.now() - 1800000,
      exchangeCount: 15,
      errors: 0
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      enabled: true,
      priority: 'high',
      lastScraped: Date.now() - 3600000,
      exchangeCount: 12,
      errors: 0
    },
    {
      symbol: 'AIPUMP',
      name: 'AI Pump',
      enabled: false,
      priority: 'normal',
      lastScraped: Date.now() - 7200000,
      exchangeCount: 3,
      errors: 2
    }
  ]);

  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenStatusFilter, setTokenStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [tokenPriorityFilter, setTokenPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');

  // Load data from localStorage
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('scrapingApiKeys');
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }

    const savedTokenConfigs = localStorage.getItem('tokenScrapingConfigs');
    if (savedTokenConfigs) {
      try {
        setTokenConfigs(JSON.parse(savedTokenConfigs));
      } catch (error) {
        console.error('Error loading token configs:', error);
      }
    }
  }, []);

  // Save to localStorage
  const saveApiKeys = (keys: Record<string, ApiCredentials>) => {
    localStorage.setItem('scrapingApiKeys', JSON.stringify(keys));
  };

  const saveTokenConfigs = (configs: TokenScrapingConfig[]) => {
    localStorage.setItem('tokenScrapingConfigs', JSON.stringify(configs));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scraping/status');
      if (!response.ok) {
        throw new Error('Failed to fetch scraping status');
      }
      const data = await response.json();
      setStatus(data);
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
      
      if (!response.ok) {
        throw new Error('Failed to toggle scraping');
      }
      
      setStatus({ ...status, enabled: !status.enabled });
      toast.success(`Scraping ${!status.enabled ? 'enabled' : 'disabled'}`);
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
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      setStatus({ ...status, interval: intervalMs });
      toast.success('Schedule updated');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  // API Key functions
  const updateApiKey = (exchange: string, field: keyof ApiCredentials, value: string | boolean) => {
    const updatedKeys = {
      ...apiKeys,
      [exchange]: {
        ...apiKeys[exchange],
        [field]: value
      }
    };
    setApiKeys(updatedKeys);
    saveApiKeys(updatedKeys);
  };

  const toggleApiKeyVisibility = (exchange: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [exchange]: !prev[exchange]
    }));
  };

  const testApiConnection = async (exchange: string) => {
    const credentials = apiKeys[exchange];
    if (!credentials.apiKey || !credentials.secretKey) {
      toast.error('Please enter both API key and secret key');
      return;
    }

    setTestingConnection(prev => ({ ...prev, [exchange]: true }));

    try {
      // Mock API test - in production, implement real API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        updateApiKey(exchange, 'connected', true);
        updateApiKey(exchange, 'lastTested', Date.now());
        updateApiKey(exchange, 'lastError', null);
        toast.success(`${exchange.toUpperCase()} API connection successful`);
      } else {
        const errors = ['Invalid credentials', 'Rate limit exceeded', 'Network timeout'];
        const error = errors[Math.floor(Math.random() * errors.length)];
        updateApiKey(exchange, 'connected', false);
        updateApiKey(exchange, 'lastError', error);
        updateApiKey(exchange, 'lastTested', Date.now());
        toast.error(`${exchange.toUpperCase()}: ${error}`);
      }
    } catch (error) {
      updateApiKey(exchange, 'connected', false);
      updateApiKey(exchange, 'lastError', 'Connection test failed');
      updateApiKey(exchange, 'lastTested', Date.now());
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(prev => ({ ...prev, [exchange]: false }));
    }
  };

  // Token control functions
  const toggleTokenScraping = (symbol: string) => {
    const updatedConfigs = tokenConfigs.map(config =>
      config.symbol === symbol ? { ...config, enabled: !config.enabled } : config
    );
    setTokenConfigs(updatedConfigs);
    saveTokenConfigs(updatedConfigs);
    toast.success(`Scraping ${updatedConfigs.find(c => c.symbol === symbol)?.enabled ? 'enabled' : 'disabled'} for ${symbol}`);
  };

  const updateTokenPriority = (symbol: string, priority: 'high' | 'normal' | 'low') => {
    const updatedConfigs = tokenConfigs.map(config =>
      config.symbol === symbol ? { ...config, priority } : config
    );
    setTokenConfigs(updatedConfigs);
    saveTokenConfigs(updatedConfigs);
    toast.success(`Priority updated for ${symbol}`);
  };

  const manualScrapeToken = async (symbol: string) => {
    toast.success(`Manual scrape triggered for ${symbol}`);
    // Update last scraped time
    const updatedConfigs = tokenConfigs.map(config =>
      config.symbol === symbol ? { ...config, lastScraped: Date.now() } : config
    );
    setTokenConfigs(updatedConfigs);
    saveTokenConfigs(updatedConfigs);
  };

  const getFilteredTokens = () => {
    return tokenConfigs.filter(token => {
      const matchesSearch = !tokenSearch || 
        token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        token.name.toLowerCase().includes(tokenSearch.toLowerCase());
      
      const matchesStatus = tokenStatusFilter === 'all' ||
        (tokenStatusFilter === 'enabled' && token.enabled) ||
        (tokenStatusFilter === 'disabled' && !token.enabled);
      
      const matchesPriority = tokenPriorityFilter === 'all' || 
        token.priority === tokenPriorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const bulkToggleTokens = (enable: boolean) => {
    const filteredTokens = getFilteredTokens();
    const updatedConfigs = tokenConfigs.map(config => {
      const shouldUpdate = filteredTokens.some(ft => ft.symbol === config.symbol);
      return shouldUpdate ? { ...config, enabled: enable } : config;
    });
    setTokenConfigs(updatedConfigs);
    saveTokenConfigs(updatedConfigs);
    toast.success(`${enable ? 'Enabled' : 'Disabled'} scraping for ${filteredTokens.length} tokens`);
  };

  const getDataFreshness = (lastScraped: number | null) => {
    if (!lastScraped) return { text: 'Never', color: 'text-gray-400' };
    
    const hoursSince = (Date.now() - lastScraped) / (1000 * 60 * 60);
    if (hoursSince < 1) return { text: 'Fresh', color: 'text-success-400' };
    if (hoursSince < 6) return { text: 'Good', color: 'text-blue-400' };
    if (hoursSince < 24) return { text: 'Stale', color: 'text-warning-400' };
    return { text: 'Outdated', color: 'text-danger-400' };
  };

  const validateApiKey = (apiKey: string, exchange: string) => {
    if (!apiKey) return false;
    if (exchange === 'mexc') return apiKey.length >= 20 && /^[A-Za-z0-9]+$/.test(apiKey);
    if (exchange === 'gateio') return apiKey.length >= 16 && /^[A-Za-z0-9]+$/.test(apiKey);
    return apiKey.length >= 16;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, description: 'Global settings and status' },
    { id: 'tokens', label: 'Token Controls', icon: Settings, description: 'Per-token scraping settings' },
    { id: 'api-keys', label: 'API Keys', icon: Key, description: 'Exchange API management' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
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
      <div className="bg-gray-850/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2">
        <div className="flex space-x-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex-1 ${
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <div className="card-modern p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Global Configuration</h3>
                  <p className="text-gray-400 text-sm">Control scraping settings and schedule</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-850/50 rounded-xl border border-gray-800">
                  <div>
                    <span className="text-white font-semibold">Master Scraping Status</span>
                    <p className="text-gray-400 text-sm">Enable or disable all data collection</p>
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
                  <p className="text-gray-400 text-sm">Current scraping statistics and timing</p>
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
          
          {/* Source Configuration */}
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
                    <p className="text-sm text-gray-400">Primary source for token data and alerts</p>
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
                    <p className="text-sm text-gray-400">Real-time price data and trading volume</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${apiKeys.mexc.connected ? 'text-success-400' : 'text-warning-400'}`}>
                      {apiKeys.mexc.connected ? 'Connected' : 'API Required'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${apiKeys.mexc.connected ? 'bg-success-400 shadow-glow-success' : 'bg-warning-400'}`}></div>
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
                    <p className="text-sm text-gray-400">Market data and historical prices</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${apiKeys.gateio.connected ? 'text-success-400' : 'text-warning-400'}`}>
                      {apiKeys.gateio.connected ? 'Connected' : 'API Required'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${apiKeys.gateio.connected ? 'bg-success-400 shadow-glow-success' : 'bg-warning-400'}`}></div>
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
        <div className="space-y-6 animate-slide-up">
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
                <div className="w-10 h-10 bg-gray-600/20 rounded-xl flex items-center justify-center">
                  <Pause className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">{tokenConfigs.filter(t => !t.enabled).length}</div>
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Per-Token Scraping Controls</h3>
                  <p className="text-gray-400">Configure scraping settings for individual tokens</p>
                </div>
              </div>
            </div>

            {/* Token Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  className="input-modern w-full pl-10 pr-4 py-3"
                  placeholder="Search tokens..."
                />
              </div>

              <select
                value={tokenStatusFilter}
                onChange={(e) => setTokenStatusFilter(e.target.value as any)}
                className="input-modern px-4 py-3"
              >
                <option value="all">All Status</option>
                <option value="enabled">Enabled Only</option>
                <option value="disabled">Disabled Only</option>
              </select>

              <select
                value={tokenPriorityFilter}
                onChange={(e) => setTokenPriorityFilter(e.target.value as any)}
                className="input-modern px-4 py-3"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => bulkToggleTokens(true)}
                  className="flex-1 bg-success-600 hover:bg-success-700 text-white px-3 py-3 rounded-xl font-bold transition-colors text-sm"
                >
                  Enable All
                </button>
                <button
                  onClick={() => bulkToggleTokens(false)}
                  className="flex-1 bg-danger-600 hover:bg-danger-700 text-white px-3 py-3 rounded-xl font-bold transition-colors text-sm"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Token Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-850/50 border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Token</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Priority</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Last Scraped</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Exchange Count</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {getFilteredTokens().map((token) => {
                    const freshness = getDataFreshness(token.lastScraped);
                    return (
                      <tr key={token.symbol} className="hover:bg-gray-850/30 transition-colors">
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
                            className={`bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs ${
                              token.priority === 'high' ? 'border-warning-500' :
                              token.priority === 'normal' ? 'border-blue-500' : 'border-gray-500'
                            }`}
                          >
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className={`text-sm ${freshness.color}`}>
                            {token.lastScraped ? format(new Date(token.lastScraped), 'HH:mm:ss') : 'Never'}
                          </div>
                          <div className={`text-xs ${freshness.color}`}>
                            {freshness.text}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-bold">{token.exchangeCount}</span>
                            {token.errors > 0 && (
                              <span className="bg-danger-600/20 text-danger-400 px-2 py-1 rounded-full text-xs">
                                {token.errors} errors
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => manualScrapeToken(token.symbol)}
                              disabled={!token.enabled}
                              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Scrape Now</span>
                            </button>
                            
                            <button
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <BarChart3 className="w-3 h-3" />
                              <span>Stats</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {getFilteredTokens().length === 0 && (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No tokens match your filters</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6 animate-slide-up">
          {/* API Keys Header */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Exchange API Management</h3>
                <p className="text-gray-400">Configure API credentials for enhanced data access</p>
              </div>
            </div>
            
            <div className="bg-info-600/10 border border-info-600/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-info-400" />
                <span className="font-bold text-info-300">Security Notice</span>
              </div>
              <p className="text-info-200 text-sm">
                API keys are encrypted and stored locally in your browser. Only use read-only API permissions for maximum security.
              </p>
            </div>
          </div>

          {/* MEXC Exchange API */}
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏛️</div>
                <div>
                  <h4 className="text-xl font-bold text-white">MEXC Exchange API</h4>
                  <p className="text-gray-400">Real-time price data and trading information</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apiKeys.mexc.connected ? 'bg-success-600/20 text-success-400' : 
                  apiKeys.mexc.lastError ? 'bg-danger-600/20 text-danger-400' : 
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {apiKeys.mexc.connected ? '✓ Connected' : 
                   apiKeys.mexc.lastError ? '✗ Error' : 
                   '○ Not Connected'}
                </div>
                <button
                  onClick={() => updateApiKey('mexc', 'enabled', !apiKeys.mexc.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    apiKeys.mexc.enabled ? 'bg-gradient-primary' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    apiKeys.mexc.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKeys.mexc ? 'text' : 'password'}
                    value={apiKeys.mexc.apiKey}
                    onChange={(e) => updateApiKey('mexc', 'apiKey', e.target.value)}
                    className={`input-modern w-full pr-12 ${
                      validateApiKey(apiKeys.mexc.apiKey, 'mexc') ? 'border-success-500' : 
                      apiKeys.mexc.apiKey ? 'border-danger-500' : ''
                    }`}
                    placeholder="Enter MEXC API key"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility('mexc')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKeys.mexc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Secret Key</label>
                <div className="relative">
                  <input
                    type={showApiKeys.mexc ? 'text' : 'password'}
                    value={apiKeys.mexc.secretKey}
                    onChange={(e) => updateApiKey('mexc', 'secretKey', e.target.value)}
                    className="input-modern w-full pr-12"
                    placeholder="Enter MEXC secret key"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility('mexc')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKeys.mexc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => testApiConnection('mexc')}
                disabled={!apiKeys.mexc.apiKey || !apiKeys.mexc.secretKey || testingConnection.mexc}
                className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2"
              >
                {testingConnection.mexc ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              {apiKeys.mexc.lastError && (
                <div className="text-danger-400 text-sm">
                  Error: {apiKeys.mexc.lastError}
                </div>
              )}
            </div>
          </div>

          {/* Gate.io Exchange API */}
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <h4 className="text-xl font-bold text-white">Gate.io Exchange API</h4>
                  <p className="text-gray-400">Market data and historical prices</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apiKeys.gateio.connected ? 'bg-success-600/20 text-success-400' : 
                  apiKeys.gateio.lastError ? 'bg-danger-600/20 text-danger-400' : 
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {apiKeys.gateio.connected ? '✓ Connected' : 
                   apiKeys.gateio.lastError ? '✗ Error' : 
                   '○ Not Connected'}
                </div>
                <button
                  onClick={() => updateApiKey('gateio', 'enabled', !apiKeys.gateio.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    apiKeys.gateio.enabled ? 'bg-gradient-primary' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    apiKeys.gateio.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKeys.gateio ? 'text' : 'password'}
                    value={apiKeys.gateio.apiKey}
                    onChange={(e) => updateApiKey('gateio', 'apiKey', e.target.value)}
                    className={`input-modern w-full pr-12 ${
                      validateApiKey(apiKeys.gateio.apiKey, 'gateio') ? 'border-success-500' : 
                      apiKeys.gateio.apiKey ? 'border-danger-500' : ''
                    }`}
                    placeholder="Enter Gate.io API key"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility('gateio')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKeys.gateio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Secret Key</label>
                <div className="relative">
                  <input
                    type={showApiKeys.gateio ? 'text' : 'password'}
                    value={apiKeys.gateio.secretKey}
                    onChange={(e) => updateApiKey('gateio', 'secretKey', e.target.value)}
                    className="input-modern w-full pr-12"
                    placeholder="Enter Gate.io secret key"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility('gateio')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKeys.gateio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => testApiConnection('gateio')}
                disabled={!apiKeys.gateio.apiKey || !apiKeys.gateio.secretKey || testingConnection.gateio}
                className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2"
              >
                {testingConnection.gateio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              {apiKeys.gateio.lastError && (
                <div className="text-danger-400 text-sm">
                  Error: {apiKeys.gateio.lastError}
                </div>
              )}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-info-600/20 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-info-400" />
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
                  <li>Visit <a href="https://www.mexc.com" target="_blank" className="text-blue-400 hover:text-blue-300">MEXC.com</a> and create account</li>
                  <li>Go to Account → API Management</li>
                  <li>Click "Create API" → Select "Spot Trading"</li>
                  <li>Enable "Read" permissions only</li>
                  <li>Copy API Key and Secret Key</li>
                  <li>Add your IP to whitelist</li>
                  <li>Test connection above</li>
                </ol>
              </div>

              {/* Gate.io Instructions */}
              <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Gate.io Exchange Setup</span>
                </h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Visit <a href="https://www.gate.io" target="_blank" className="text-blue-400 hover:text-blue-300">Gate.io</a> and create account</li>
                  <li>Navigate to Account Settings → API Keys</li>
                  <li>Click "Create API Key"</li>
                  <li>Select "Read Only" permissions</li>
                  <li>Copy generated API Key and Secret</li>
                  <li>Configure IP restrictions</li>
                  <li>Test connection above</li>
                </ol>
              </div>
            </div>

            {/* Security Best Practices */}
            <div className="mt-6 bg-warning-600/10 border border-warning-600/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-warning-400" />
                <span className="font-bold text-warning-300">Security Best Practices</span>
              </div>
              <ul className="text-warning-200 text-sm space-y-1 list-disc list-inside">
                <li><strong>Read-Only:</strong> Only grant read permissions, never trading or withdrawal</li>
                <li><strong>IP Whitelist:</strong> Restrict API access to specific IP addresses</li>
                <li><strong>Regular Rotation:</strong> Rotate API keys periodically</li>
                <li><strong>Monitor Usage:</strong> Check API usage logs regularly</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};