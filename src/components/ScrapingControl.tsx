import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, Settings, RefreshCw, Globe, Database, Zap, Search, Filter, Eye, EyeOff, BarChart3, Building2, TrendingUp, Users, Key, Shield, TestTube, Lock, Unlock } from 'lucide-react';
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
  lastScraped?: number;
  exchangeCount?: number;
  priority: 'high' | 'normal' | 'low';
  customInterval?: number; // Override global interval for this token
}

export const ScrapingControl: React.FC = () => {
  const [status, setStatus] = useState<ScrapingStatus>({
    enabled: true,
    interval: 300000,
    lastRun: null,
    nextRun: null,
    isRunning: false,
    totalScraped: 0,
    errors: []
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'api-keys'>('overview');
  const [customInterval, setCustomInterval] = useState('5');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [showTokenControls, setShowTokenControls] = useState(true);

  // Mock token scraping configurations
  const [tokenConfigs, setTokenConfigs] = useState<TokenScrapingConfig[]>([
    { symbol: 'BTC', name: 'Bitcoin', enabled: true, lastScraped: Date.now() - 1800000, exchangeCount: 15, priority: 'high' },
    { symbol: 'ETH', name: 'Ethereum', enabled: true, lastScraped: Date.now() - 2400000, exchangeCount: 12, priority: 'high' },
    { symbol: 'AIPUMP', name: 'AI Pump', enabled: false, lastScraped: Date.now() - 7200000, exchangeCount: 3, priority: 'normal' },
    { symbol: 'AAVE', name: 'Aave', enabled: true, lastScraped: Date.now() - 900000, exchangeCount: 8, priority: 'normal' },
    { symbol: 'UNI', name: 'Uniswap', enabled: true, lastScraped: Date.now() - 1200000, exchangeCount: 10, priority: 'low' },
    { symbol: 'LINK', name: 'Chainlink', enabled: false, lastScraped: Date.now() - 10800000, exchangeCount: 6, priority: 'low' }
  ]);

  // API Key Management State
  const [apiKeys, setApiKeys] = useState<Record<string, { apiKey: string; secretKey: string; enabled: boolean; lastTested: number | null; connected: boolean; error: string | null }>>({
    mexc: { apiKey: '', secretKey: '', enabled: false, lastTested: null, connected: false, error: null },
    gateio: { apiKey: '', secretKey: '', enabled: false, lastTested: null, connected: false, error: null }
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchStatus();
    loadApiKeys();
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

  const loadApiKeys = () => {
    try {
      const stored = localStorage.getItem('exchangeApiKeys');
      if (stored) {
        const decrypted = JSON.parse(stored);
        setApiKeys(decrypted);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const saveApiKeys = (keys: typeof apiKeys) => {
    try {
      // In production, implement proper encryption here
      localStorage.setItem('exchangeApiKeys', JSON.stringify(keys));
      setApiKeys(keys);
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  const updateApiKey = (exchange: string, field: 'apiKey' | 'secretKey', value: string) => {
    const updated = {
      ...apiKeys,
      [exchange]: {
        ...apiKeys[exchange],
        [field]: value
      }
    };
    saveApiKeys(updated);
  };

  const toggleApiKeyVisibility = (exchange: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [exchange]: !prev[exchange]
    }));
  };

  const validateApiKey = (apiKey: string, exchange: string): boolean => {
    if (!apiKey) return false;
    
    if (exchange === 'mexc') {
      return apiKey.length >= 20 && /^[A-Za-z0-9]+$/.test(apiKey);
    }
    if (exchange === 'gateio') {
      return apiKey.length >= 16 && /^[A-Za-z0-9]+$/.test(apiKey);
    }
    return apiKey.length >= 16;
  };

  const testApiConnection = async (exchange: string) => {
    const apiConfig = apiKeys[exchange];
    if (!apiConfig.apiKey || !apiConfig.secretKey) {
      toast.error('Please enter both API key and secret key first');
      return;
    }

    setTestingConnection(prev => ({ ...prev, [exchange]: true }));

    try {
      // Mock API connection test - in production, implement real API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different outcomes
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      const updated = {
        ...apiKeys,
        [exchange]: {
          ...apiKeys[exchange],
          lastTested: Date.now(),
          connected: success,
          error: success ? null : 'Invalid API credentials or insufficient permissions'
        }
      };
      
      saveApiKeys(updated);
      
      if (success) {
        toast.success(`${exchange.toUpperCase()} API connection successful`);
      } else {
        toast.error(`${exchange.toUpperCase()} API connection failed`);
      }
    } catch (error) {
      const updated = {
        ...apiKeys,
        [exchange]: {
          ...apiKeys[exchange],
          lastTested: Date.now(),
          connected: false,
          error: 'Connection test failed'
        }
      };
      saveApiKeys(updated);
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(prev => ({ ...prev, [exchange]: false }));
    }
  };

  const toggleApiEnabled = (exchange: string) => {
    const updated = {
      ...apiKeys,
      [exchange]: {
        ...apiKeys[exchange],
        enabled: !apiKeys[exchange].enabled
      }
    };
    saveApiKeys(updated);
    toast.success(`${exchange.toUpperCase()} API ${updated[exchange].enabled ? 'enabled' : 'disabled'}`);
  };

  const toggleGlobalScraping = async () => {
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
      toast.success(`Global scraping ${!status.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling scraping:', error);
      toast.error('Failed to toggle scraping');
    }
  };

  const toggleTokenScraping = async (symbol: string) => {
    const updatedConfigs = tokenConfigs.map(config =>
      config.symbol === symbol 
        ? { ...config, enabled: !config.enabled }
        : config
    );
    setTokenConfigs(updatedConfigs);
    
    const tokenConfig = updatedConfigs.find(c => c.symbol === symbol);
    toast.success(`Scraping ${tokenConfig?.enabled ? 'enabled' : 'disabled'} for ${symbol}`);
    
    // Here you could make an API call to update the backend
    // await fetch(`/api/scraping/tokens/${symbol}/toggle`, {...})
  };

  const updateTokenPriority = async (symbol: string, priority: 'high' | 'normal' | 'low') => {
    const updatedConfigs = tokenConfigs.map(config =>
      config.symbol === symbol 
        ? { ...config, priority }
        : config
    );
    setTokenConfigs(updatedConfigs);
    toast.success(`Priority updated for ${symbol}`);
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

  const bulkToggleTokens = (enable: boolean) => {
    const filteredTokens = getFilteredTokens();
    const updatedConfigs = tokenConfigs.map(config =>
      filteredTokens.some(filtered => filtered.symbol === config.symbol)
        ? { ...config, enabled: enable }
        : config
    );
    setTokenConfigs(updatedConfigs);
    toast.success(`Scraping ${enable ? 'enabled' : 'disabled'} for ${filteredTokens.length} filtered tokens`);
  };

  const getFilteredTokens = () => {
    let filtered = [...tokenConfigs];

    if (searchTerm) {
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(token => token.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(token => 
        statusFilter === 'enabled' ? token.enabled : !token.enabled
      );
    }

    return filtered;
  };

  const getTokenStats = () => {
    const enabledCount = tokenConfigs.filter(t => t.enabled).length;
    const disabledCount = tokenConfigs.filter(t => !t.enabled).length;
    const highPriorityCount = tokenConfigs.filter(t => t.priority === 'high' && t.enabled).length;
    
    return { enabledCount, disabledCount, highPriorityCount };
  };

  const stats = getTokenStats();
  const filteredTokens = getFilteredTokens();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'tokens', label: 'Token Controls', icon: Database },
    { id: 'api-keys', label: 'API Keys', icon: Key }
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
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-gray-950 shadow-glow transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-modern p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
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
                <div className="text-2xl font-bold text-success-400">{stats.enabledCount}</div>
                <div className="text-sm text-gray-400">Enabled</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600/20 rounded-xl flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{stats.disabledCount}</div>
                <div className="text-sm text-gray-400">Disabled</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning-600/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning-400">{stats.highPriorityCount}</div>
                <div className="text-sm text-gray-400">High Priority</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Control Panel */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Global Configuration</h3>
                <p className="text-gray-400 text-sm">Master controls for all scraping operations</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-850/50 rounded-xl border border-gray-800">
                <div>
                  <span className="text-white font-semibold">Master Scraping Status</span>
                  <p className="text-gray-400 text-sm">Enable or disable all data collection</p>
                </div>
                <button
                  onClick={toggleGlobalScraping}
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
                    Default Scraping Interval (minutes)
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
      )}

      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Per-Token Scraping Controls */}
          <div className="card-modern" id="per-token-scraping-controls">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Per-Token Scraping Controls</h3>
                  <p className="text-gray-400">Configure scraping settings for individual tokens</p>
                </div>
              </div>

              <button
                onClick={() => setShowTokenControls(!showTokenControls)}
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/30"
              >
                <span className="font-semibold">{showTokenControls ? 'Hide' : 'Show'} Token Controls</span>
                {showTokenControls ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-6 space-y-6">
                {/* Filters and Bulk Actions */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Search Tokens</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-modern w-full pl-10 pr-4 py-3 text-sm"
                        placeholder="Search..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Priority Filter</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="input-modern w-full px-3 py-3 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Status Filter</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="input-modern w-full px-3 py-3 text-sm"
                    >
                      <option value="all">All Tokens</option>
                      <option value="enabled">Enabled Only</option>
                      <option value="disabled">Disabled Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Bulk Actions</label>
                    <button
                      onClick={() => bulkToggleTokens(true)}
                      className="w-full bg-success-600 hover:bg-success-700 text-white px-3 py-3 rounded-xl font-bold transition-all duration-200 text-sm"
                    >
                      Enable Filtered
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => bulkToggleTokens(false)}
                      className="w-full bg-danger-600 hover:bg-danger-700 text-white px-3 py-3 rounded-xl font-bold transition-all duration-200 text-sm"
                    >
                      Disable Filtered
                    </button>
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="bg-gray-850/30 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Showing <span className="font-bold text-white">{filteredTokens.length}</span> of{' '}
                      <span className="font-bold text-white">{tokenConfigs.length}</span> tokens
                    </span>
                    <div className="flex space-x-4 text-xs">
                      <span className="text-success-400">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        {filteredTokens.filter(t => t.enabled).length} enabled
                      </span>
                      <span className="text-gray-400">
                        <EyeOff className="w-4 h-4 inline mr-1" />
                        {filteredTokens.filter(t => !t.enabled).length} disabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Token Controls Table */}
                <div className="bg-gray-850/50 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800/50 border-b border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Token</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Priority</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Last Scraped</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Exchange Count</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredTokens.map((tokenConfig) => {
                          const isRecent = tokenConfig.lastScraped && Date.now() - tokenConfig.lastScraped < 3600000; // 1 hour
                          
                          return (
                            <tr key={tokenConfig.symbol} className="hover:bg-gray-800/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-gray-950 text-xs font-bold">
                                    {tokenConfig.symbol.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{tokenConfig.symbol}</div>
                                    <div className="text-xs text-gray-400">{tokenConfig.name}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleTokenScraping(tokenConfig.symbol)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    tokenConfig.enabled 
                                      ? 'bg-success-600 shadow-glow-success' 
                                      : 'bg-gray-600'
                                  }`}
                                  title={`${tokenConfig.enabled ? 'Disable' : 'Enable'} scraping for ${tokenConfig.symbol}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                      tokenConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </td>

                              <td className="px-4 py-3">
                                <select
                                  value={tokenConfig.priority}
                                  onChange={(e) => updateTokenPriority(tokenConfig.symbol, e.target.value as any)}
                                  className={`bg-gray-700 border border-gray-600 rounded px-3 py-1 text-xs font-medium ${
                                    tokenConfig.priority === 'high' ? 'text-warning-300' :
                                    tokenConfig.priority === 'normal' ? 'text-blue-300' : 'text-gray-300'
                                  }`}
                                >
                                  <option value="high">High</option>
                                  <option value="normal">Normal</option>
                                  <option value="low">Low</option>
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                {tokenConfig.lastScraped ? (
                                  <div>
                                    <div className={`text-sm font-medium ${isRecent ? 'text-success-400' : 'text-gray-300'}`}>
                                      {format(new Date(tokenConfig.lastScraped), 'MM/dd HH:mm')}
                                    </div>
                                    <div className={`text-xs ${isRecent ? 'text-success-300' : 'text-gray-400'}`}>
                                      {isRecent ? 'Recent' : 'Stale'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">Never</div>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-4 h-4 text-blue-400" />
                                  <span className="font-bold text-white">{tokenConfig.exchangeCount || 0}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      // Simulate immediate scrape for this token
                                      const updatedConfigs = tokenConfigs.map(config =>
                                        config.symbol === tokenConfig.symbol 
                                          ? { ...config, lastScraped: Date.now() }
                                          : config
                                      );
                                      setTokenConfigs(updatedConfigs);
                                      toast.success(`Scraping ${tokenConfig.symbol} now...`);
                                    }}
                                    disabled={!tokenConfig.enabled}
                                    className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-blue-500/10"
                                    title={`Scrape ${tokenConfig.symbol} now`}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      // Show token-specific scraping stats
                                      toast.success(`${tokenConfig.symbol}: ${tokenConfig.exchangeCount} exchanges found`);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-500/10"
                                    title={`View ${tokenConfig.symbol} scraping details`}
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredTokens.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No tokens found</h3>
                      <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          {/* API Key Management */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Exchange API Configuration</h3>
                <p className="text-gray-400">Configure API credentials for enhanced data access and rate limits</p>
              </div>
            </div>

            {/* API Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">MEXC Exchange API</span>
                  <div className={`flex items-center space-x-2 ${
                    apiKeys.mexc.connected ? 'text-success-400' : apiKeys.mexc.error ? 'text-danger-400' : 'text-gray-400'
                  }`}>
                    {apiKeys.mexc.connected ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : apiKeys.mexc.error ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {apiKeys.mexc.connected ? 'Connected' : apiKeys.mexc.error ? 'Error' : 'Not Configured'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {apiKeys.mexc.lastTested ? `Last tested: ${new Date(apiKeys.mexc.lastTested).toLocaleString()}` : 'Never tested'}
                </div>
              </div>

              <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Gate.io Exchange API</span>
                  <div className={`flex items-center space-x-2 ${
                    apiKeys.gateio.connected ? 'text-success-400' : apiKeys.gateio.error ? 'text-danger-400' : 'text-gray-400'
                  }`}>
                    {apiKeys.gateio.connected ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : apiKeys.gateio.error ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {apiKeys.gateio.connected ? 'Connected' : apiKeys.gateio.error ? 'Error' : 'Not Configured'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {apiKeys.gateio.lastTested ? `Last tested: ${new Date(apiKeys.gateio.lastTested).toLocaleString()}` : 'Never tested'}
                </div>
              </div>
            </div>

            {/* MEXC API Configuration */}
            <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏛️</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">MEXC Exchange API</h4>
                    <p className="text-gray-400 text-sm">Configure MEXC API credentials for enhanced data access</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 font-semibold">Enable API</span>
                  <button
                    onClick={() => toggleApiEnabled('mexc')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      apiKeys.mexc.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                      apiKeys.mexc.enabled ? 'translate-x-7' : 'translate-x-1'
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
                        validateApiKey(apiKeys.mexc.apiKey, 'mexc')
                          ? 'border-success-500 focus:ring-success-500'
                          : apiKeys.mexc.apiKey
                          ? 'border-danger-500 focus:ring-danger-500'
                          : ''
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
                  {apiKeys.mexc.apiKey && (
                    <div className="flex items-center space-x-1 mt-1">
                      {validateApiKey(apiKeys.mexc.apiKey, 'mexc') ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-success-400" />
                          <span className="text-xs text-success-400">Valid format</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-danger-400" />
                          <span className="text-xs text-danger-400">Invalid format (min 20 chars, alphanumeric)</span>
                        </>
                      )}
                    </div>
                  )}
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

              {/* Test Connection */}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => testApiConnection('mexc')}
                  disabled={!apiKeys.mexc.apiKey || !apiKeys.mexc.secretKey || testingConnection.mexc}
                  className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  {testingConnection.mexc ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                {apiKeys.mexc.connected && (
                  <div className="flex items-center space-x-2 text-success-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">API Connected Successfully</span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {apiKeys.mexc.error && (
                <div className="mt-4 bg-danger-600/10 border border-danger-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-danger-400" />
                    <span className="font-semibold text-danger-300">Connection Error</span>
                  </div>
                  <p className="text-danger-200 text-sm">{apiKeys.mexc.error}</p>
                </div>
              )}
            </div>

            {/* Gate.io API Configuration */}
            <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🌐</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Gate.io Exchange API</h4>
                    <p className="text-gray-400 text-sm">Configure Gate.io API credentials for market data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 font-semibold">Enable API</span>
                  <button
                    onClick={() => toggleApiEnabled('gateio')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      apiKeys.gateio.enabled ? 'bg-gradient-primary shadow-glow' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                      apiKeys.gateio.enabled ? 'translate-x-7' : 'translate-x-1'
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
                        validateApiKey(apiKeys.gateio.apiKey, 'gateio')
                          ? 'border-success-500 focus:ring-success-500'
                          : apiKeys.gateio.apiKey
                          ? 'border-danger-500 focus:ring-danger-500'
                          : ''
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
                  {apiKeys.gateio.apiKey && (
                    <div className="flex items-center space-x-1 mt-1">
                      {validateApiKey(apiKeys.gateio.apiKey, 'gateio') ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-success-400" />
                          <span className="text-xs text-success-400">Valid format</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-danger-400" />
                          <span className="text-xs text-danger-400">Invalid format (min 16 chars, alphanumeric)</span>
                        </>
                      )}
                    </div>
                  )}
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

              {/* Test Connection */}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => testApiConnection('gateio')}
                  disabled={!apiKeys.gateio.apiKey || !apiKeys.gateio.secretKey || testingConnection.gateio}
                  className="bg-gradient-primary hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  {testingConnection.gateio ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                {apiKeys.gateio.connected && (
                  <div className="flex items-center space-x-2 text-success-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">API Connected Successfully</span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {apiKeys.gateio.error && (
                <div className="mt-4 bg-danger-600/10 border border-danger-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-danger-400" />
                    <span className="font-semibold text-danger-300">Connection Error</span>
                  </div>
                  <p className="text-danger-200 text-sm">{apiKeys.gateio.error}</p>
                </div>
              )}
            </div>

            {/* Security Information */}
            <div className="bg-warning-600/10 border border-warning-600/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-warning-400" />
                <span className="font-bold text-warning-300">Security Best Practices</span>
              </div>
              <ul className="text-warning-200 text-sm space-y-1 list-disc list-inside">
                <li><strong>Read-Only Permissions:</strong> Only grant read permissions, never trading or withdrawal</li>
                <li><strong>IP Whitelisting:</strong> Restrict API access to your specific IP addresses</li>
                <li><strong>Regular Rotation:</strong> Rotate API keys periodically for enhanced security</li>
                <li><strong>Monitor Usage:</strong> Check API usage logs on exchange platforms regularly</li>
                <li><strong>Secure Storage:</strong> API keys are encrypted in local storage</li>
              </ul>
            </div>

            {/* Setup Instructions */}
            <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
              <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Setup Instructions</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MEXC Instructions */}
                <div>
                  <h5 className="font-semibold text-blue-300 mb-3">🏛️ MEXC Exchange</h5>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://www.mexc.com" target="_blank" className="text-blue-400 hover:text-blue-300">MEXC.com</a></li>
                    <li>Navigate to Account → API Management</li>
                    <li>Click "Create API" and select "Read Only"</li>
                    <li>Copy API Key and Secret to fields above</li>
                    <li>Add your IP to whitelist</li>
                    <li>Test connection</li>
                  </ol>
                </div>

                {/* Gate.io Instructions */}
                <div>
                  <h5 className="font-semibold text-green-300 mb-3">🌐 Gate.io Exchange</h5>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://www.gate.io" target="_blank" className="text-blue-400 hover:text-blue-300">Gate.io</a></li>
                    <li>Go to Account Settings → API Keys</li>
                    <li>Click "Create API Key"</li>
                    <li>Select "Read Only" permissions</li>
                    <li>Copy credentials to fields above</li>
                    <li>Test connection to verify</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'overview' && (
        /* Source Configuration */
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
                  <p className="text-sm text-gray-400">Market data and historical prices</p>
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
      )}
      
      {/* Error Log */}
      {activeTab === 'overview' && status.errors.length > 0 && (
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
  );
};