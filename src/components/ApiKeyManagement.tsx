import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Clock, RefreshCw, Shield, TestTube, Globe, Settings, Lock, Unlock, Zap, Activity, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  passphrase?: string; // For some exchanges
  sandbox?: boolean;
}

interface ApiStatus {
  connected: boolean;
  lastTested: number | null;
  lastError: string | null;
  rateLimit: {
    remaining: number;
    resetTime: number | null;
  };
  permissions: string[];
  endpoint: string;
}

interface ExchangeConfig {
  id: 'mexc' | 'gateio';
  name: string;
  displayName: string;
  icon: string;
  description: string;
  website: string;
  credentials: ApiCredentials;
  status: ApiStatus;
  enabled: boolean;
  timeout: number;
  retryAttempts: number;
  testEndpoint: string;
  requiredPermissions: string[];
}

export const ApiKeyManagement: React.FC = () => {
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>([
    {
      id: 'mexc',
      name: 'MEXC',
      displayName: 'MEXC Exchange',
      icon: '🏛️',
      description: 'Global cryptocurrency exchange with comprehensive trading pairs',
      website: 'https://www.mexc.com',
      credentials: { apiKey: '', secretKey: '', sandbox: false },
      status: {
        connected: false,
        lastTested: null,
        lastError: null,
        rateLimit: { remaining: 1200, resetTime: null },
        permissions: [],
        endpoint: 'https://api.mexc.com'
      },
      enabled: false,
      timeout: 10000,
      retryAttempts: 3,
      testEndpoint: '/api/v3/ping',
      requiredPermissions: ['spot_trading']
    },
    {
      id: 'gateio',
      name: 'gateio',
      displayName: 'Gate.io Exchange',
      icon: '🌐',
      description: 'Leading cryptocurrency exchange with advanced trading features',
      website: 'https://www.gate.io',
      credentials: { apiKey: '', secretKey: '', sandbox: false },
      status: {
        connected: false,
        lastTested: null,
        lastError: null,
        rateLimit: { remaining: 900, resetTime: null },
        permissions: [],
        endpoint: 'https://api.gateio.ws'
      },
      enabled: false,
      timeout: 10000,
      retryAttempts: 3,
      testEndpoint: '/api/v4/spot/time',
      requiredPermissions: ['read_only']
    }
  ]);

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  const [globalSettings, setGlobalSettings] = useState({
    encryptionEnabled: true,
    autoRetry: true,
    rateLimitBuffer: 10, // Percentage buffer for rate limits
    connectionTimeout: 10000,
    enableFallback: true
  });

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const loadStoredCredentials = () => {
      exchanges.forEach(exchange => {
        const stored = localStorage.getItem(`apiCredentials_${exchange.id}`);
        if (stored) {
          try {
            const decrypted = JSON.parse(stored);
            updateExchangeCredentials(exchange.id, decrypted);
          } catch (error) {
            console.error(`Error loading credentials for ${exchange.id}:`, error);
          }
        }
      });
    };

    loadStoredCredentials();
  }, []);

  const saveCredentials = (exchangeId: string, credentials: ApiCredentials) => {
    try {
      // In production, implement proper encryption here
      const encrypted = JSON.stringify(credentials);
      localStorage.setItem(`apiCredentials_${exchangeId}`, encrypted);
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save API credentials');
    }
  };

  const updateExchangeCredentials = (exchangeId: string, credentials: Partial<ApiCredentials>) => {
    setExchanges(prev => prev.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, credentials: { ...exchange.credentials, ...credentials } }
        : exchange
    ));
  };

  const updateExchangeStatus = (exchangeId: string, status: Partial<ApiStatus>) => {
    setExchanges(prev => prev.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, status: { ...exchange.status, ...status } }
        : exchange
    ));
  };

  const toggleExchangeEnabled = (exchangeId: string) => {
    setExchanges(prev => prev.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, enabled: !exchange.enabled }
        : exchange
    ));
  };

  const toggleApiKeyVisibility = (exchangeId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [exchangeId]: !prev[exchangeId]
    }));
  };

  const testConnection = async (exchangeId: string) => {
    const exchange = exchanges.find(e => e.id === exchangeId);
    if (!exchange || !exchange.credentials.apiKey) {
      toast.error('Please enter API credentials first');
      return;
    }

    setTestingConnection(prev => ({ ...prev, [exchangeId]: true }));

    try {
      // Mock API connection test - in production, implement real API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different outcomes
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        updateExchangeStatus(exchangeId, {
          connected: true,
          lastTested: Date.now(),
          lastError: null,
          permissions: exchange.requiredPermissions,
          rateLimit: {
            remaining: Math.floor(Math.random() * 1000) + 500,
            resetTime: Date.now() + 3600000
          }
        });
        toast.success(`${exchange.displayName} connection successful`);
      } else {
        const errorMessages = [
          'Invalid API credentials',
          'Insufficient permissions',
          'Rate limit exceeded',
          'Network timeout',
          'API endpoint unavailable'
        ];
        const error = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        
        updateExchangeStatus(exchangeId, {
          connected: false,
          lastTested: Date.now(),
          lastError: error
        });
        toast.error(`${exchange.displayName}: ${error}`);
      }
    } catch (error) {
      updateExchangeStatus(exchangeId, {
        connected: false,
        lastTested: Date.now(),
        lastError: 'Connection test failed'
      });
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(prev => ({ ...prev, [exchangeId]: false }));
    }
  };

  const handleCredentialChange = (exchangeId: string, field: keyof ApiCredentials, value: string | boolean) => {
    const updatedCredentials = { ...exchanges.find(e => e.id === exchangeId)!.credentials, [field]: value };
    updateExchangeCredentials(exchangeId, updatedCredentials);
    saveCredentials(exchangeId, updatedCredentials);
  };

  const validateApiKey = (apiKey: string, exchangeId: string): boolean => {
    if (!apiKey) return false;
    
    // Basic validation - in production, implement exchange-specific validation
    if (exchangeId === 'mexc') {
      return apiKey.length >= 20 && /^[A-Za-z0-9]+$/.test(apiKey);
    }
    if (exchangeId === 'gateio') {
      return apiKey.length >= 16 && /^[A-Za-z0-9]+$/.test(apiKey);
    }
    return apiKey.length >= 16;
  };

  const getConnectionStatusIcon = (status: ApiStatus) => {
    if (status.connected) return <CheckCircle className="w-5 h-5 text-success-400" />;
    if (status.lastError) return <AlertCircle className="w-5 h-5 text-danger-400" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getConnectionStatusText = (status: ApiStatus) => {
    if (status.connected) return 'Connected';
    if (status.lastError) return 'Error';
    return 'Not Tested';
  };

  const getConnectionStatusColor = (status: ApiStatus) => {
    if (status.connected) return 'text-success-400';
    if (status.lastError) return 'text-danger-400';
    return 'text-gray-400';
  };

  const getRateLimitColor = (remaining: number, total: number = 1200) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'text-success-400';
    if (percentage > 20) return 'text-warning-400';
    return 'text-danger-400';
  };

  const connectedCount = exchanges.filter(e => e.status.connected && e.enabled).length;
  const enabledCount = exchanges.filter(e => e.enabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">API Key Management</h1>
            <p className="text-gray-400 mt-1">Configure exchange API credentials for enhanced data access</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-850 rounded-xl px-4 py-2 border border-gray-800">
            <div className="text-sm text-gray-400">Connected APIs</div>
            <div className="text-2xl font-bold text-success-400">{connectedCount}/{enabledCount}</div>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="card-modern p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Global API Settings</h3>
            <p className="text-gray-400">Configure general API behavior and security settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold text-sm">Encryption</span>
              </div>
              <button
                onClick={() => setGlobalSettings(prev => ({ ...prev, encryptionEnabled: !prev.encryptionEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  globalSettings.encryptionEnabled ? 'bg-success-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalSettings.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <p className="text-xs text-gray-400">Encrypt API keys at rest</p>
          </div>

          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold text-sm">Auto Retry</span>
              </div>
              <button
                onClick={() => setGlobalSettings(prev => ({ ...prev, autoRetry: !prev.autoRetry }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  globalSettings.autoRetry ? 'bg-success-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalSettings.autoRetry ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <p className="text-xs text-gray-400">Retry failed requests automatically</p>
          </div>

          <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-semibold text-sm">Timeout</span>
            </div>
            <input
              type="number"
              value={globalSettings.connectionTimeout / 1000}
              onChange={(e) => setGlobalSettings(prev => ({ 
                ...prev, 
                connectionTimeout: parseInt(e.target.value) * 1000 
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
              min="5"
              max="60"
            />
            <p className="text-xs text-gray-400 mt-1">Connection timeout (seconds)</p>
          </div>
        </div>
      </div>

      {/* Exchange Configurations */}
      <div className="space-y-6">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="card-modern overflow-hidden">
            {/* Exchange Header */}
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-850 to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{exchange.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{exchange.displayName}</h3>
                    <p className="text-gray-400">{exchange.description}</p>
                    <a 
                      href={exchange.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center space-x-1 mt-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Visit Exchange</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status Indicator */}
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                    exchange.status.connected && exchange.enabled
                      ? 'bg-success-600/20 text-success-300'
                      : exchange.status.lastError
                      ? 'bg-danger-600/20 text-danger-300'
                      : 'bg-gray-600/20 text-gray-300'
                  }`}>
                    {getConnectionStatusIcon(exchange.status)}
                    <span className="font-bold">{getConnectionStatusText(exchange.status)}</span>
                  </div>

                  {/* Enable/Disable Toggle */}
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

            {/* Exchange Configuration */}
            <div className="p-6 space-y-6">
              {/* API Credentials */}
              <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-bold text-white">API Credentials</h4>
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-full px-3 py-1">
                    <span className="text-blue-300 text-xs font-semibold">ENCRYPTED STORAGE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys[exchange.id] ? 'text' : 'password'}
                        value={exchange.credentials.apiKey}
                        onChange={(e) => handleCredentialChange(exchange.id, 'apiKey', e.target.value)}
                        className={`input-modern w-full pr-12 ${
                          validateApiKey(exchange.credentials.apiKey, exchange.id)
                            ? 'border-success-500 focus:ring-success-500'
                            : exchange.credentials.apiKey
                            ? 'border-danger-500 focus:ring-danger-500'
                            : ''
                        }`}
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
                    {exchange.credentials.apiKey && (
                      <div className="flex items-center space-x-1 mt-1">
                        {validateApiKey(exchange.credentials.apiKey, exchange.id) ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-success-400" />
                            <span className="text-xs text-success-400">Valid format</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-danger-400" />
                            <span className="text-xs text-danger-400">Invalid format</span>
                          </>
                        )}
                      </div>
                    )}
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
                        onChange={(e) => handleCredentialChange(exchange.id, 'secretKey', e.target.value)}
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

                  {/* Sandbox Toggle */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={exchange.credentials.sandbox || false}
                        onChange={(e) => handleCredentialChange(exchange.id, 'sandbox', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <TestTube className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">Use Sandbox/Testnet</span>
                      </div>
                      <span className="text-xs text-gray-400">(Recommended for testing)</span>
                    </label>
                  </div>
                </div>

                {/* Test Connection Button */}
                <div className="mt-6 flex space-x-4">
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

                  {exchange.status.connected && (
                    <button
                      onClick={() => {
                        updateExchangeStatus(exchange.id, { connected: false, lastError: null });
                        toast.success('API connection reset');
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Unlock className="w-5 h-5" />
                      <span>Disconnect</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-gray-300">Connection Status</span>
                  </div>
                  <div className={`text-lg font-bold ${getConnectionStatusColor(exchange.status)}`}>
                    {getConnectionStatusText(exchange.status)}
                  </div>
                  {exchange.status.lastTested && (
                    <div className="text-xs text-gray-400 mt-1">
                      Last tested: {new Date(exchange.status.lastTested).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-gray-300">Rate Limit</span>
                  </div>
                  <div className={`text-lg font-bold ${getRateLimitColor(exchange.status.rateLimit.remaining)}`}>
                    {exchange.status.rateLimit.remaining}
                  </div>
                  <div className="text-xs text-gray-400">
                    {exchange.status.rateLimit.resetTime ? 
                      `Resets ${new Date(exchange.status.rateLimit.resetTime).toLocaleTimeString()}` :
                      'requests remaining'
                    }
                  </div>
                </div>

                <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-gray-300">Permissions</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {exchange.status.permissions.length}
                  </div>
                  <div className="text-xs text-gray-400">
                    {exchange.status.permissions.length > 0 ? 'permissions granted' : 'no permissions'}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {exchange.status.lastError && (
                <div className="bg-danger-600/10 border border-danger-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                    <span className="font-bold text-danger-300">Connection Error</span>
                  </div>
                  <p className="text-danger-200">{exchange.status.lastError}</p>
                  <div className="mt-3 text-xs text-danger-300">
                    Common solutions:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Verify API key and secret are correct</li>
                      <li>Check if API permissions are sufficient</li>
                      <li>Ensure IP whitelist includes your address</li>
                      <li>Try toggling sandbox mode</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Permissions Display */}
              {exchange.status.permissions.length > 0 && (
                <div className="bg-success-600/10 border border-success-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                    <span className="font-bold text-success-300">Active Permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exchange.status.permissions.map(permission => (
                      <span key={permission} className="badge-modern badge-success text-xs">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* API Configuration */}
              <div className="bg-gray-850/50 rounded-xl p-4 border border-gray-800">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>API Configuration</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Request Timeout</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={exchange.timeout / 1000}
                        onChange={(e) => {
                          const newTimeout = parseInt(e.target.value) * 1000;
                          setExchanges(prev => prev.map(ex =>
                            ex.id === exchange.id ? { ...ex, timeout: newTimeout } : ex
                          ));
                        }}
                        className="input-modern flex-1 px-3 py-2 text-sm"
                        min="5"
                        max="60"
                      />
                      <span className="text-xs text-gray-400">seconds</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Retry Attempts</label>
                    <input
                      type="number"
                      value={exchange.retryAttempts}
                      onChange={(e) => {
                        const newRetries = parseInt(e.target.value);
                        setExchanges(prev => prev.map(ex =>
                          ex.id === exchange.id ? { ...ex, retryAttempts: newRetries } : ex
                        ));
                      }}
                      className="input-modern w-full px-3 py-2 text-sm"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">API Endpoint</label>
                    <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 text-sm font-mono">
                      {exchange.status.endpoint}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="card-modern p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-info-600/20 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-info-400" />
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
              <li>Enable "Read" permissions (required for price data)</li>
              <li>Copy the API Key and Secret Key to the fields above</li>
              <li>Add your IP address to the whitelist for security</li>
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
              <li>Configure IP restrictions for enhanced security</li>
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
  );
};