import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, Settings, RefreshCw, Globe, Database, Zap, Eye, EyeOff, Key, TestTube, Shield, Plus, Search, Filter, Play, Pause, TrendingUp, Building2, User } from 'lucide-react';
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
  enabled: boolean;
  priority: 'high' | 'normal' | 'low';
  lastScraped: number | null;
  exchangeCount: number;
  errors: number;
}

interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
}

interface ExchangeApiStatus {
  connected: boolean;
  lastTested: number | null;
  lastError: string | null;
  rateLimit: number;
  enabled: boolean;
}

export const ScrapingControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'apikeys'>('overview');
  const [status, setStatus] = useState<ScrapingStatus>({
    enabled: true,
    interval: 300000,
    lastRun: Date.now() - 180000,
    nextRun: Date.now() + 120000,
    isRunning: false,
    totalScraped: 47,
    errors: [
      { timestamp: Date.now() - 900000, message: 'Rate limit exceeded for CryptocurrencyAlerting.com' },
      { timestamp: Date.now() - 1800000, message: 'Temporary network timeout' }
    ]
  });
  const [customInterval, setCustomInterval] = useState('5');
  const [tokenConfigs, setTokenConfigs] = useState<TokenScrapingConfig[]>([
    { symbol: 'BTC', enabled: true, priority: 'high', lastScraped: Date.now() - 300000, exchangeCount: 15, errors: 0 },
    { symbol: 'ETH', enabled: true, priority: 'high', lastScraped: Date.now() - 180000, exchangeCount: 12, errors: 0 },
    { symbol: 'AIPUMP', enabled: true, priority: 'normal', lastScraped: Date.now() - 600000, exchangeCount: 3, errors: 1 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  
  // API Keys state
  const [mexcCredentials, setMexcCredentials] = useState<ApiCredentials>({ apiKey: '', secretKey: '', sandbox: false });
  const [gateioCredentials, setGateioCredentials] = useState<ApiCredentials>({ apiKey: '', secretKey: '', sandbox: false });
  const [mexcStatus, setMexcStatus] = useState<ExchangeApiStatus>({ connected: false, lastTested: null, lastError: null, rateLimit: 1200, enabled: false });
  const [gateioStatus, setGateioStatus] = useState<ExchangeApiStatus>({ connected: false, lastTested: null, lastError: null, rateLimit: 900, enabled: false });
  const [showApiKeys, setShowApiKeys] = useState({ mexc: false, gateio: false });
  const [testingConnection, setTestingConnection] = useState({ mexc: false, gateio: false });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scraping/status');
      if (!response.ok) throw new Error('Failed to fetch scraping status');
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
      
      if (!response.ok) throw new Error('Failed to toggle scraping');
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
      
      if (!response.ok) throw new Error('Failed to update schedule');
      setStatus({ ...status, interval: intervalMs });
      toast.success('Schedule updated');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  // Token control functions
  const toggleTokenScraping = (symbol: string) => {
    setTokenConfigs(prev => prev.map(token =>
      token.symbol === symbol ? { ...token, enabled: !token.enabled } : token
    ));
    toast.success(`Scraping ${tokenConfigs.find(t => t.symbol === symbol)?.enabled ? 'disabled' : 'enabled'} for ${symbol}`);
  };

  const updateTokenPriority = (symbol: string, priority: 'high' | 'normal' | 'low') => {
    setTokenConfigs(prev => prev.map(token =>
      token.symbol === symbol ? { ...token, priority } : token
    ));
  };

  const manualScrapeToken = async (symbol: string) => {
    toast.success(`Manual scraping started for ${symbol}`);
    // Update last scraped time
    setTokenConfigs(prev => prev.map(token =>
      token.symbol === symbol ? { ...token, lastScraped: Date.now() } : token
    ));
  };

  const getFilteredTokens = () => {
    return tokenConfigs.filter(token => {
      if (searchTerm && !token.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (priorityFilter !== 'all' && token.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter === 'enabled' && !token.enabled) {
        return false;
      }
      if (statusFilter === 'disabled' && token.enabled) {
        return false;
      }
      return true;
    });
  };

  // API Key functions
  const testApiConnection = async (exchange: 'mexc' | 'gateio') => {
    const credentials = exchange === 'mexc' ? mexcCredentials : gateioCredentials;
    
    if (!credentials.apiKey || !credentials.secretKey) {
      toast.error('Please enter both API key and secret key');
      return;
    }

    setTestingConnection(prev => ({ ...prev, [exchange]: true }));

    try {
      const response = await fetch(`http://localhost:3001/api/api-keys/${exchange}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      
      if (result.success) {
        if (exchange === 'mexc') {
          setMexcStatus(prev => ({ 
            ...prev, 
            connected: true, 
            lastTested: Date.now(), 
            lastError: null 
          }));
        } else {
          setGateioStatus(prev => ({ 
            ...prev, 
            connected: true, 
            lastTested: Date.now(), 
            lastError: null 
          }));
        }
        toast.success(`${exchange.toUpperCase()} connection successful!`);
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error) {
      const errorMsg = error.message || 'Connection test failed';
      if (exchange === 'mexc') {
        setMexcStatus(prev => ({ 
          ...prev, 
          connected: false, 
          lastTested: Date.now(), 
          lastError: errorMsg 
        }));
      } else {
        setGateioStatus(prev => ({ 
          ...prev, 
          connected: false, 
          lastTested: Date.now(), 
          lastError: errorMsg 
        }));
      }
      toast.error(`${exchange.toUpperCase()}: ${errorMsg}`);
    } finally {
      setTestingConnection(prev => ({ ...prev, [exchange]: false }));
    }
  };

  const saveApiKeys = async (exchange: 'mexc' | 'gateio') => {
    const credentials = exchange === 'mexc' ? mexcCredentials : gateioCredentials;
    
    try {
      const response = await fetch(`http://localhost:3001/api/api-keys/${exchange}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, enabled: true })
      });

      if (!response.ok) throw new Error('Failed to save API keys');
      
      // Enable the exchange after saving keys
      if (exchange === 'mexc') {
        setMexcStatus(prev => ({ ...prev, enabled: true }));
      } else {
        setGateioStatus(prev => ({ ...prev, enabled: true }));
      }
      
      toast.success(`${exchange.toUpperCase()} API keys saved successfully`);
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  // Tab definitions with proper icons and descriptions
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Activity, 
      description: 'Global scraping settings and status'
    },
    { 
      id: 'tokens', 
      label: 'Token Controls', 
      icon: Database, 
      description: 'Per-token scraping configuration'
    },
    { 
      id: 'apikeys', 
      label: 'API Keys', 
      icon: Key, 
      description: 'Exchange API credential management'
    }
  ];

  const getScrapingStats = () => {
    const total = tokenConfigs.length;
    const enabled = tokenConfigs.filter(t => t.enabled).length;
    const disabled = total - enabled;
    const highPriority = tokenConfigs.filter(t => t.priority === 'high').length;
    return { total, enabled, disabled, highPriority };
  };

  const stats = getScrapingStats();

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

      {/* Tab Navigation - Fixed styling for better visibility */}
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl p-1 shadow-lg">
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'bg-gradient-primary text-gray-950 shadow-glow transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-bold truncate">{tab.label}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-gray-800/70' : 'text-gray-400'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content - Fixed content rendering */}
      <div className="min-h-[500px]">
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
                    <p className="text-gray-400 text-sm">Control master scraping settings</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-850/50 rounded-xl border border-gray-800">
                    <div>
                      <span className="text-white font-semibold">Master Scraping Toggle</span>
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
                      <span className={`text-sm font-semibold ${mexcStatus.connected ? 'text-success-400' : 'text-gray-400'}`}>
                        {mexcStatus.connected ? 'Connected' : 'Disconnected'}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${mexcStatus.connected ? 'bg-success-400 animate-pulse shadow-glow-success' : 'bg-gray-400'}`}></div>
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
                      <span className={`text-sm font-semibold ${gateioStatus.connected ? 'text-success-400' : 'text-gray-400'}`}>
                        {gateioStatus.connected ? 'Connected' : 'Disconnected'}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${gateioStatus.connected ? 'bg-success-400 animate-pulse shadow-glow-success' : 'bg-gray-400'}`}></div>
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
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
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
                    <div className="text-2xl font-bold text-success-400">{stats.enabled}</div>
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
                    <div className="text-2xl font-bold text-danger-400">{stats.disabled}</div>
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
                    <div className="text-2xl font-bold text-warning-400">{stats.highPriority}</div>
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
                    <h3 className="text-xl font-bold text-white">Per-Token Configuration</h3>
                    <p className="text-gray-400">Individual scraping settings for each token</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern w-full pl-10 pr-3 py-2"
                    placeholder="Search tokens..."
                  />
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="input-modern px-3 py-2"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="input-modern px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="enabled">Enabled Only</option>
                  <option value="disabled">Disabled Only</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setTokenConfigs(prev => prev.map(token => ({ ...token, enabled: true })));
                      toast.success('All tokens enabled for scraping');
                    }}
                    className="flex-1 bg-success-600 hover:bg-success-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => {
                      setTokenConfigs(prev => prev.map(token => ({ ...token, enabled: false })));
                      toast.success('All tokens disabled for scraping');
                    }}
                    className="flex-1 bg-danger-600 hover:bg-danger-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
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
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Enabled</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Priority</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Last Scraped</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Exchanges</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {getFilteredTokens().map((token) => {
                      const timeSinceLastScraped = token.lastScraped ? Date.now() - token.lastScraped : null;
                      const isStale = timeSinceLastScraped ? timeSinceLastScraped > 3600000 : true; // 1 hour
                      
                      return (
                        <tr key={token.symbol} className="hover:bg-gray-850/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-gray-950 text-xs font-bold">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{token.symbol}</div>
                                {token.errors > 0 && (
                                  <div className="text-xs text-danger-400">{token.errors} errors</div>
                                )}
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
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="high">High</option>
                              <option value="normal">Normal</option>
                              <option value="low">Low</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white text-sm">
                              {token.lastScraped ? (
                                <div>
                                  <div>{format(new Date(token.lastScraped), 'HH:mm:ss')}</div>
                                  <div className={`text-xs ${isStale ? 'text-warning-400' : 'text-success-400'}`}>
                                    {isStale ? 'Stale' : 'Fresh'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Never</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-semibold">{token.exchangeCount}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => manualScrapeToken(token.symbol)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Scrape Now</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'apikeys' && (
          <div className="space-y-6 animate-slide-up">
            {/* API Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">2</div>
                    <div className="text-sm text-gray-400">Total APIs</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-600/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-400">
                      {[mexcStatus.connected, gateioStatus.connected].filter(Boolean).length}
                    </div>
                    <div className="text-sm text-gray-400">Connected</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{mexcStatus.rateLimit + gateioStatus.rateLimit}</div>
                    <div className="text-sm text-gray-400">Rate Limit</div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-600/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-400">
                      {[mexcStatus.enabled, gateioStatus.enabled].filter(Boolean).length}
                    </div>
                    <div className="text-sm text-gray-400">Enabled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MEXC Exchange API */}
            <div className="card-modern overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🏛️</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">MEXC Exchange API</h3>
                      <p className="text-gray-400">Real-time price data and trading volume</p>
                      <a 
                        href="https://www.mexc.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center space-x-1 mt-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Visit MEXC.com</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                      mexcStatus.connected ? 'bg-success-600/20 text-success-300' : 'bg-danger-600/20 text-danger-300'
                    }`}>
                      {mexcStatus.connected ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="font-bold">{mexcStatus.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-gray-300 font-semibold">Enable API</span>
                      <button
                        onClick={() => setMexcStatus(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          mexcStatus.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                          mexcStatus.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* API Credentials */}
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-5 h-5 text-blue-400" />
                    <h4 className="text-lg font-bold text-white">API Credentials</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKeys.mexc ? 'text' : 'password'}
                          value={mexcCredentials.apiKey}
                          onChange={(e) => setMexcCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                          className="input-modern w-full pr-12"
                          placeholder="Enter MEXC API key"
                        />
                        <button
                          onClick={() => setShowApiKeys(prev => ({ ...prev, mexc: !prev.mexc }))}
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
                          value={mexcCredentials.secretKey}
                          onChange={(e) => setMexcCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                          className="input-modern w-full pr-12"
                          placeholder="Enter MEXC secret key"
                        />
                        <button
                          onClick={() => setShowApiKeys(prev => ({ ...prev, mexc: !prev.mexc }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showApiKeys.mexc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mexcCredentials.sandbox}
                          onChange={(e) => setMexcCredentials(prev => ({ ...prev, sandbox: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <TestTube className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-semibold">Use Sandbox/Testnet</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => testApiConnection('mexc')}
                      disabled={!mexcCredentials.apiKey || !mexcCredentials.secretKey || testingConnection.mexc}
                      className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2"
                    >
                      {testingConnection.mexc ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => saveApiKeys('mexc')}
                      disabled={!mexcCredentials.apiKey || !mexcCredentials.secretKey}
                      className="bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Save Keys</span>
                    </button>
                  </div>
                </div>

                {/* MEXC Status */}
                {(mexcStatus.lastTested || mexcStatus.lastError) && (
                  <div className={`rounded-xl p-4 border ${
                    mexcStatus.connected ? 'bg-success-600/10 border-success-600/30' : 'bg-danger-600/10 border-danger-600/30'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {mexcStatus.connected ? <CheckCircle className="w-5 h-5 text-success-400" /> : <AlertCircle className="w-5 h-5 text-danger-400" />}
                      <span className={`font-bold ${mexcStatus.connected ? 'text-success-300' : 'text-danger-300'}`}>
                        {mexcStatus.connected ? 'Connection Successful' : 'Connection Failed'}
                      </span>
                    </div>
                    {mexcStatus.lastError && <p className="text-danger-200 text-sm">{mexcStatus.lastError}</p>}
                    {mexcStatus.lastTested && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last tested: {new Date(mexcStatus.lastTested).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gate.io Exchange API */}
            <div className="card-modern overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🌐</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Gate.io Exchange API</h3>
                      <p className="text-gray-400">Market data and historical prices</p>
                      <a 
                        href="https://www.gate.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center space-x-1 mt-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Visit Gate.io</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                      gateioStatus.connected ? 'bg-success-600/20 text-success-300' : 'bg-danger-600/20 text-danger-300'
                    }`}>
                      {gateioStatus.connected ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="font-bold">{gateioStatus.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-gray-300 font-semibold">Enable API</span>
                      <button
                        onClick={() => setGateioStatus(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          gateioStatus.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                          gateioStatus.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* API Credentials */}
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-5 h-5 text-blue-400" />
                    <h4 className="text-lg font-bold text-white">API Credentials</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKeys.gateio ? 'text' : 'password'}
                          value={gateioCredentials.apiKey}
                          onChange={(e) => setGateioCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                          className="input-modern w-full pr-12"
                          placeholder="Enter Gate.io API key"
                        />
                        <button
                          onClick={() => setShowApiKeys(prev => ({ ...prev, gateio: !prev.gateio }))}
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
                          value={gateioCredentials.secretKey}
                          onChange={(e) => setGateioCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                          className="input-modern w-full pr-12"
                          placeholder="Enter Gate.io secret key"
                        />
                        <button
                          onClick={() => setShowApiKeys(prev => ({ ...prev, gateio: !prev.gateio }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showApiKeys.gateio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gateioCredentials.sandbox}
                          onChange={(e) => setGateioCredentials(prev => ({ ...prev, sandbox: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <TestTube className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-semibold">Use Sandbox/Testnet</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => testApiConnection('gateio')}
                      disabled={!gateioCredentials.apiKey || !gateioCredentials.secretKey || testingConnection.gateio}
                      className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2"
                    >
                      {testingConnection.gateio ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => saveApiKeys('gateio')}
                      disabled={!gateioCredentials.apiKey || !gateioCredentials.secretKey}
                      className="bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Save Keys</span>
                    </button>
                  </div>
                </div>

                {/* Gate.io Status */}
                {(gateioStatus.lastTested || gateioStatus.lastError) && (
                  <div className={`rounded-xl p-4 border ${
                    gateioStatus.connected ? 'bg-success-600/10 border-success-600/30' : 'bg-danger-600/10 border-danger-600/30'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {gateioStatus.connected ? <CheckCircle className="w-5 h-5 text-success-400" /> : <AlertCircle className="w-5 h-5 text-danger-400" />}
                      <span className={`font-bold ${gateioStatus.connected ? 'text-success-300' : 'text-danger-300'}`}>
                        {gateioStatus.connected ? 'Connection Successful' : 'Connection Failed'}
                      </span>
                    </div>
                    {gateioStatus.lastError && <p className="text-danger-200 text-sm">{gateioStatus.lastError}</p>}
                    {gateioStatus.lastTested && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last tested: {new Date(gateioStatus.lastTested).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="card-modern p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-info-600/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-info-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Setup Instructions</h3>
                  <p className="text-gray-400">How to obtain and configure your API credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <h4 className="font-bold text-white mb-4">🏛️ MEXC Exchange Setup</h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Visit <a href="https://www.mexc.com" target="_blank" className="text-blue-400 hover:text-blue-300">MEXC.com</a> and create an account</li>
                    <li>Navigate to Account → API Management</li>
                    <li>Click "Create API" and select "Spot Trading"</li>
                    <li>Enable "Read" permissions (required for price data)</li>
                    <li>Copy the API Key and Secret Key to the fields above</li>
                    <li>Test the connection using the button above</li>
                  </ol>
                </div>

                <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                  <h4 className="font-bold text-white mb-4">🌐 Gate.io Exchange Setup</h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Visit <a href="https://www.gate.io" target="_blank" className="text-blue-400 hover:text-blue-300">Gate.io</a> and create an account</li>
                    <li>Go to Account Settings → API Keys</li>
                    <li>Click "Create API Key"</li>
                    <li>Select "Read Only" permissions</li>
                    <li>Copy the generated API Key and Secret</li>
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
                  <li><strong>Read-Only:</strong> Only grant read permissions, never trading or withdrawal</li>
                  <li><strong>IP Whitelist:</strong> Restrict API access to your specific IP addresses</li>
                  <li><strong>Regular Rotation:</strong> Rotate API keys periodically for enhanced security</li>
                  <li><strong>Monitor Usage:</strong> Check API usage logs regularly on exchange platforms</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const testApiConnection = async (exchange: string) => {
  // Mock API connection test
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        resolve({ success: true });
      } else {
        reject(new Error('Invalid API credentials'));
      }
    }, 2000);
  });
};

const saveApiKeys = async (exchange: string) => {
  // Mock save operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};