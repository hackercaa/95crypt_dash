import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, Settings, RefreshCw, Globe, Database, Zap } from 'lucide-react';
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
  const [customInterval, setCustomInterval] = useState('5');

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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Configuration</h3>
              <p className="text-gray-400 text-sm">Control scraping settings and schedule</p>
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
  );
};