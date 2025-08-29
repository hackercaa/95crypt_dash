import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, Trash2, Edit2, Save, AlertTriangle, TrendingUp, TrendingDown, Zap, Clock, Target, Settings } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Token, PriceData } from '../types';

interface Alert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  alertType: 'price_above' | 'price_below' | 'price_change' | 'volume_above' | 'volume_below' | 'exchange_count' | 'new_exchange' | 'removed_exchange' | 'ath_distance' | 'trading_status' | 'combined';
  conditions: {
    priceAbove?: number;
    priceBelow?: number;
    priceChangePercent?: number;
    priceChangeDirection?: 'positive' | 'negative' | 'any';
    volumeAbove?: number;
    volumeBelow?: number;
    exchangeCountAbove?: number;
    exchangeCountBelow?: number;
    newExchangeAlert?: boolean;
    removedExchangeAlert?: boolean;
    athDistancePercent?: number;
    athDistanceDirection?: 'closer' | 'further';
    percentFromAthThreshold?: number;
    percentFromAthDirection?: 'below' | 'above';
    tradingStatus?: string;
    combinedConditions?: Array<{
      field: string;
      operator: 'above' | 'below' | 'equals' | 'contains';
      value: string | number;
      logic?: 'and' | 'or';
    }>;
  };
  message: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastTriggered?: number;
  triggerCount: number;
  author: string;
}

interface AlertsModalProps {
  tokenSymbol: string;
  tokenName: string;
  currentPrice?: number;
  priceData?: PriceData;
  token: Token;
  onClose: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ 
  tokenSymbol, 
  tokenName, 
  currentPrice, 
  priceData,
  token,
  onClose 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    alertType: 'price_above' as Alert['alertType'],
    priceAbove: '',
    priceBelow: '',
    priceChangePercent: '',
    priceChangeDirection: 'positive' as 'positive' | 'negative' | 'any',
    volumeAbove: '',
    volumeBelow: '',
    exchangeCountAbove: '',
    exchangeCountBelow: '',
    newExchangeAlert: false,
    removedExchangeAlert: false,
    athDistancePercent: '',
    athDistanceDirection: 'closer' as 'closer' | 'further',
    percentFromAthThreshold: '',
    percentFromAthDirection: 'below' as 'below' | 'above',
    tradingStatus: '',
    message: '',
    combinedConditions: [] as Array<{
      field: string;
      operator: 'above' | 'below' | 'equals' | 'contains';
      value: string | number;
      logic?: 'and' | 'or';
    }>
  });

  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem(`alerts_${tokenSymbol}`);
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    }
  }, [tokenSymbol]);

  // Save alerts to localStorage
  const saveAlertsToStorage = (updatedAlerts: Alert[]) => {
    localStorage.setItem(`alerts_${tokenSymbol}`, JSON.stringify(updatedAlerts));
  };

  // Check alerts against current data
  useEffect(() => {
    if (!priceData || alerts.length === 0) return;

    const checkAlerts = () => {
      const updatedAlerts = alerts.map(alert => {
        if (!alert.isActive) return alert;

        const shouldTrigger = evaluateAlertConditions(alert, priceData, token);
        
        if (shouldTrigger && (!alert.lastTriggered || Date.now() - alert.lastTriggered > 300000)) { // 5 min cooldown
          toast.success(`🚨 Alert: ${alert.message}`, { duration: 8000 });
          return {
            ...alert,
            lastTriggered: Date.now(),
            triggerCount: alert.triggerCount + 1
          };
        }
        
        return alert;
      });

      if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
        setAlerts(updatedAlerts);
        saveAlertsToStorage(updatedAlerts);
      }
    };

    checkAlerts();
  }, [priceData, token, alerts]);

  const evaluateAlertConditions = (alert: Alert, priceData: PriceData, token: Token): boolean => {
    const { conditions } = alert;
    const currentPrice = priceData.averagePrice;
    const mexcData = priceData.exchanges.mexc;
    const gateioData = priceData.exchanges.gateio;

    switch (alert.alertType) {
      case 'price_above':
        return conditions.priceAbove ? currentPrice > conditions.priceAbove : false;
      
      case 'price_below':
        return conditions.priceBelow ? currentPrice < conditions.priceBelow : false;
      
      case 'price_change':
        if (!conditions.priceChangePercent) return false;
        const change = Math.abs(priceData.change24h);
        const directionMatch = conditions.priceChangeDirection === 'any' || 
          (conditions.priceChangeDirection === 'positive' && priceData.change24h > 0) ||
          (conditions.priceChangeDirection === 'negative' && priceData.change24h < 0);
        return change >= conditions.priceChangePercent && directionMatch;
      
      case 'volume_above':
        return conditions.volumeAbove && mexcData?.volume24h ? mexcData.volume24h > conditions.volumeAbove : false;
      
      case 'volume_below':
        return conditions.volumeBelow && mexcData?.volume24h ? mexcData.volume24h < conditions.volumeBelow : false;
      
      case 'exchange_count':
        const exchangeCount = token.exchangeData?.totalExchanges || token.exchanges.length;
        if (conditions.exchangeCountAbove && exchangeCount <= conditions.exchangeCountAbove) return false;
        if (conditions.exchangeCountBelow && exchangeCount >= conditions.exchangeCountBelow) return false;
        return true;
      
      case 'new_exchange':
        return conditions.newExchangeAlert && (token.exchangeData?.newExchanges24h?.length || 0) > 0;
      
      case 'removed_exchange':
        return conditions.removedExchangeAlert && (token.exchangeData?.removedExchanges24h?.length || 0) > 0;
      
      case 'ath_distance':
        if (!conditions.athDistancePercent || !token.allTimeHigh) return false;
        const athDistance = Math.abs(((currentPrice - token.allTimeHigh) / token.allTimeHigh) * 100);
        return conditions.athDistanceDirection === 'closer' ? 
          athDistance <= conditions.athDistancePercent :
          athDistance >= conditions.athDistancePercent;
      
      case 'percent_from_ath':
        if (!conditions.percentFromAthThreshold || !token.allTimeHigh) return false;
        const percentFromATH = ((currentPrice - token.allTimeHigh) / token.allTimeHigh) * 100;
        return conditions.percentFromAthDirection === 'below' ? 
          percentFromATH <= -Math.abs(conditions.percentFromAthThreshold) :
          percentFromATH >= conditions.percentFromAthThreshold;
      
      case 'trading_status':
        return conditions.tradingStatus ? mexcData?.status === conditions.tradingStatus : false;
      
      case 'combined':
        return evaluateCombinedConditions(conditions.combinedConditions || [], priceData, token);
      
      default:
        return false;
    }
  };

  const evaluateCombinedConditions = (
    conditions: Array<{field: string; operator: string; value: string | number; logic?: 'and' | 'or'}>,
    priceData: PriceData,
    token: Token
  ): boolean => {
    if (conditions.length === 0) return false;

    const results = conditions.map(condition => {
      const value = getFieldValue(condition.field, priceData, token);
      if (value === null || value === undefined) return false;

      switch (condition.operator) {
        case 'above':
          return typeof value === 'number' && value > Number(condition.value);
        case 'below':
          return typeof value === 'number' && value < Number(condition.value);
        case 'equals':
          return value.toString() === condition.value.toString();
        case 'contains':
          return value.toString().toLowerCase().includes(condition.value.toString().toLowerCase());
        default:
          return false;
      }
    });

    // Apply logic operators
    let finalResult = results[0];
    for (let i = 1; i < results.length; i++) {
      const logic = conditions[i-1].logic || 'and';
      if (logic === 'and') {
        finalResult = finalResult && results[i];
      } else {
        finalResult = finalResult || results[i];
      }
    }

    return finalResult;
  };

  const getFieldValue = (field: string, priceData: PriceData, token: Token): any => {
    switch (field) {
      case 'price': return priceData.averagePrice;
      case 'change24h': return priceData.change24h;
      case 'volume24h': return priceData.exchanges.mexc?.volume24h;
      case 'high24h': return priceData.exchanges.mexc?.high24h;
      case 'low24h': return priceData.exchanges.mexc?.low24h;
      case 'tradeCount': return priceData.exchanges.mexc?.count;
      case 'ath': return token.allTimeHigh;
      case 'atl': return token.allTimeLow;
      case 'exchangeCount': return token.exchangeData?.totalExchanges || token.exchanges.length;
      case 'tradingStatus': return priceData.exchanges.mexc?.status;
      case 'bidPrice': return priceData.exchanges.mexc?.bidPrice;
      case 'askPrice': return priceData.exchanges.mexc?.askPrice;
      default: return null;
    }
  };

  const handleCreateAlert = () => {
    if (!formData.message.trim()) {
      toast.error('Alert message is required');
      return;
    }

    // Validate based on alert type
    if (formData.alertType === 'price_above' && !formData.priceAbove) {
      toast.error('Price threshold is required');
      return;
    }
    if (formData.alertType === 'price_below' && !formData.priceBelow) {
      toast.error('Price threshold is required');
      return;
    }
    if (formData.alertType === 'price_change' && !formData.priceChangePercent) {
      toast.error('Price change percentage is required');
      return;
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      tokenSymbol,
      tokenName,
      alertType: formData.alertType,
      conditions: {
        priceAbove: formData.priceAbove ? parseFloat(formData.priceAbove) : undefined,
        priceBelow: formData.priceBelow ? parseFloat(formData.priceBelow) : undefined,
        priceChangePercent: formData.priceChangePercent ? parseFloat(formData.priceChangePercent) : undefined,
        priceChangeDirection: formData.priceChangeDirection,
        volumeAbove: formData.volumeAbove ? parseFloat(formData.volumeAbove) : undefined,
        volumeBelow: formData.volumeBelow ? parseFloat(formData.volumeBelow) : undefined,
        exchangeCountAbove: formData.exchangeCountAbove ? parseInt(formData.exchangeCountAbove) : undefined,
        exchangeCountBelow: formData.exchangeCountBelow ? parseInt(formData.exchangeCountBelow) : undefined,
        newExchangeAlert: formData.newExchangeAlert,
        removedExchangeAlert: formData.removedExchangeAlert,
        athDistancePercent: formData.athDistancePercent ? parseFloat(formData.athDistancePercent) : undefined,
        athDistanceDirection: formData.athDistanceDirection,
        percentFromAthThreshold: formData.percentFromAthThreshold ? parseFloat(formData.percentFromAthThreshold) : undefined,
        percentFromAthDirection: formData.percentFromAthDirection,
        tradingStatus: formData.tradingStatus || undefined,
        combinedConditions: formData.combinedConditions
      },
      message: formData.message.trim(),
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      triggerCount: 0,
      author: 'current_user'
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);
    
    // Reset form
    setFormData({
      alertType: 'price_above',
      priceAbove: '',
      priceBelow: '',
      priceChangePercent: '',
      priceChangeDirection: 'positive',
      volumeAbove: '',
      volumeBelow: '',
      exchangeCountAbove: '',
      exchangeCountBelow: '',
      newExchangeAlert: false,
      removedExchangeAlert: false,
      athDistancePercent: '',
      athDistanceDirection: 'closer',
      percentFromAthThreshold: '',
      percentFromAthDirection: 'below',
      tradingStatus: '',
      message: '',
      combinedConditions: []
    });
    
    setShowCreateForm(false);
    toast.success('Alert created successfully');
  };

  const handleDeleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);
    toast.success('Alert deleted successfully');
  };

  const toggleAlertActive = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: !alert.isActive, updatedAt: Date.now() } : alert
    );
    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);
    toast.success('Alert status updated');
  };

  const addCombinedCondition = () => {
    setFormData({
      ...formData,
      combinedConditions: [
        ...formData.combinedConditions,
        { field: 'price', operator: 'above', value: '', logic: 'and' }
      ]
    });
  };

  const updateCombinedCondition = (index: number, updates: any) => {
    const newConditions = [...formData.combinedConditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setFormData({ ...formData, combinedConditions: newConditions });
  };

  const removeCombinedCondition = (index: number) => {
    const newConditions = formData.combinedConditions.filter((_, i) => i !== index);
    setFormData({ ...formData, combinedConditions: newConditions });
  };

  const getAlertTypeDescription = (alertType: Alert['alertType']) => {
    const descriptions = {
      price_above: 'Trigger when price goes above target',
      price_below: 'Trigger when price goes below target',
      price_change: 'Trigger on significant price movement',
      volume_above: 'Trigger when 24h volume exceeds threshold',
      volume_below: 'Trigger when 24h volume drops below threshold',
      exchange_count: 'Trigger when exchange count changes',
      new_exchange: 'Trigger when token gets listed on new exchange',
      removed_exchange: 'Trigger when token gets delisted from exchange',
      ath_distance: 'Trigger based on distance from all-time high',
      percent_from_ath: 'Trigger when token is X% below/above its ATH',
      trading_status: 'Trigger when trading status changes',
      combined: 'Trigger when multiple conditions are met'
    };
    return descriptions[alertType];
  };

  const getAlertStatusColor = (alert: Alert) => {
    if (!alert.isActive) return 'text-gray-400';
    if (alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000) return 'text-success-400'; // Recently triggered
    return 'text-blue-400'; // Active and waiting
  };

  const getAlertStatusText = (alert: Alert) => {
    if (!alert.isActive) return 'Disabled';
    if (alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000) return 'Recently Triggered';
    return 'Active';
  };

  const sortedAlerts = [...alerts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-glow">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Price Alerts for {tokenSymbol}</h2>
              <p className="text-gray-400">{tokenName} - Configure comprehensive alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Data Summary */}
        <div className="p-6 bg-gray-850/30 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Current Data for Alert Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400">Current Price</div>
              <div className="text-lg font-bold text-white">
                ${currentPrice?.toFixed(4) || 'Loading...'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400">24h Change</div>
              <div className={`text-lg font-bold ${priceData?.change24h && priceData.change24h >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {priceData?.change24h ? `${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%` : 'Loading...'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400">24h Volume</div>
              <div className="text-lg font-bold text-purple-400">
                {priceData?.exchanges?.mexc?.volume24h ? `$${(priceData.exchanges.mexc.volume24h / 1000000).toFixed(2)}M` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400">Exchanges</div>
              <div className="text-lg font-bold text-blue-400">
                {token.exchangeData?.totalExchanges || token.exchanges.length}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Create Alert Button */}
          {!showCreateForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Alert</span>
              </button>
            </div>
          )}

          {/* Create Alert Form */}
          {showCreateForm && (
            <div className="bg-gray-850/50 border border-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create New Alert</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Alert Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Alert Type</label>
                  <select
                    value={formData.alertType}
                    onChange={(e) => setFormData({ ...formData, alertType: e.target.value as Alert['alertType'] })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="price_above">💰 Price Above Threshold</option>
                    <option value="price_below">💸 Price Below Threshold</option>
                    <option value="price_change">📈 Price Change Percentage</option>
                    <option value="volume_above">📊 Volume Above Threshold</option>
                    <option value="volume_below">📉 Volume Below Threshold</option>
                    <option value="exchange_count">🏢 Exchange Count Change</option>
                    <option value="new_exchange">⭐ New Exchange Listing</option>
                    <option value="removed_exchange">❌ Exchange Delisting</option>
                    <option value="ath_distance">🎯 Distance from ATH</option>
                    <option value="percent_from_ath">📉 % Below/Above ATH</option>
                    <option value="trading_status">🔄 Trading Status Change</option>
                    <option value="combined">⚡ Combined Conditions</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">{getAlertTypeDescription(formData.alertType)}</p>
                </div>

                {/* Dynamic Form Fields Based on Alert Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Above */}
                  {formData.alertType === 'price_above' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Target Price ($)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.priceAbove}
                        onChange={(e) => setFormData({ ...formData, priceAbove: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Current: $${currentPrice?.toFixed(4) || '0.0000'}`}
                      />
                    </div>
                  )}

                  {/* Price Below */}
                  {formData.alertType === 'price_below' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Target Price ($)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.priceBelow}
                        onChange={(e) => setFormData({ ...formData, priceBelow: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Current: $${currentPrice?.toFixed(4) || '0.0000'}`}
                      />
                    </div>
                  )}

                  {/* Price Change */}
                  {formData.alertType === 'price_change' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Change Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.priceChangePercent}
                          onChange={(e) => setFormData({ ...formData, priceChangePercent: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 5.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Direction</label>
                        <select
                          value={formData.priceChangeDirection}
                          onChange={(e) => setFormData({ ...formData, priceChangeDirection: e.target.value as any })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="positive">Positive (Gains)</option>
                          <option value="negative">Negative (Losses)</option>
                          <option value="any">Any Direction</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Volume Alerts */}
                  {(formData.alertType === 'volume_above' || formData.alertType === 'volume_below') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Volume Threshold ($)
                      </label>
                      <input
                        type="number"
                        value={formData.alertType === 'volume_above' ? formData.volumeAbove : formData.volumeBelow}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [formData.alertType === 'volume_above' ? 'volumeAbove' : 'volumeBelow']: e.target.value 
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Current: $${priceData?.exchanges?.mexc?.volume24h?.toLocaleString() || '0'}`}
                      />
                    </div>
                  )}

                  {/* Exchange Count */}
                  {formData.alertType === 'exchange_count' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Min Exchange Count</label>
                        <input
                          type="number"
                          value={formData.exchangeCountAbove}
                          onChange={(e) => setFormData({ ...formData, exchangeCountAbove: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Current: ${token.exchangeData?.totalExchanges || token.exchanges.length}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Max Exchange Count</label>
                        <input
                          type="number"
                          value={formData.exchangeCountBelow}
                          onChange={(e) => setFormData({ ...formData, exchangeCountBelow: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                    </>
                  )}

                  {/* ATH Distance */}
                  {formData.alertType === 'ath_distance' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Distance Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.athDistancePercent}
                          onChange={(e) => setFormData({ ...formData, athDistancePercent: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 10.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Direction</label>
                        <select
                          value={formData.athDistanceDirection}
                          onChange={(e) => setFormData({ ...formData, athDistanceDirection: e.target.value as any })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="closer">Getting Closer to ATH</option>
                          <option value="further">Moving Further from ATH</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Percent from ATH */}
                  {formData.alertType === 'percent_from_ath' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Percentage Threshold (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.percentFromAthThreshold}
                          onChange={(e) => setFormData({ ...formData, percentFromAthThreshold: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 80 (for 80% below ATH)"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Current: {token.allTimeHigh && currentPrice ? 
                            `${((currentPrice - token.allTimeHigh) / token.allTimeHigh * 100).toFixed(1)}% from ATH` : 
                            'ATH data loading...'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Direction</label>
                        <select
                          value={formData.percentFromAthDirection}
                          onChange={(e) => setFormData({ ...formData, percentFromAthDirection: e.target.value as any })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="below">Below ATH (e.g., -80% from peak)</option>
                          <option value="above">Above ATH (new highs)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                          {formData.percentFromAthDirection === 'below' 
                            ? 'Alert when token falls to specified % below ATH' 
                            : 'Alert when token rises to specified % above ATH'
                          }
                        </p>
                      </div>
                    </>
                  )}

                  {/* Trading Status */}
                  {formData.alertType === 'trading_status' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Target Status</label>
                      <select
                        value={formData.tradingStatus}
                        onChange={(e) => setFormData({ ...formData, tradingStatus: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="TRADING">TRADING (Active)</option>
                        <option value="HALT">HALT (Suspended)</option>
                        <option value="BREAK">BREAK (Paused)</option>
                      </select>
                    </div>
                  )}

                  {/* Exchange Listing Alerts */}
                  {(formData.alertType === 'new_exchange' || formData.alertType === 'removed_exchange') && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bell className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold text-blue-300">
                            {formData.alertType === 'new_exchange' ? 'New Exchange Listing Alert' : 'Exchange Delisting Alert'}
                          </span>
                        </div>
                        <p className="text-blue-200 text-sm">
                          {formData.alertType === 'new_exchange' 
                            ? 'This alert will trigger whenever the token gets listed on a new exchange (detected by our scraper).'
                            : 'This alert will trigger whenever the token gets delisted from an exchange (detected by our scraper).'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Combined Conditions */}
                {formData.alertType === 'combined' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-gray-300">Combined Conditions</label>
                      <button
                        onClick={addCombinedCondition}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Condition</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.combinedConditions.map((condition, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          {index > 0 && (
                            <select
                              value={condition.logic || 'and'}
                              onChange={(e) => updateCombinedCondition(index - 1, { logic: e.target.value })}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="and">AND</option>
                              <option value="or">OR</option>
                            </select>
                          )}
                          
                          <select
                            value={condition.field}
                            onChange={(e) => updateCombinedCondition(index, { field: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="price">Price</option>
                            <option value="change24h">24h Change %</option>
                            <option value="volume24h">24h Volume</option>
                            <option value="high24h">24h High</option>
                            <option value="low24h">24h Low</option>
                            <option value="tradeCount">Trade Count</option>
                            <option value="ath">All-Time High</option>
                            <option value="atl">All-Time Low</option>
                            <option value="exchangeCount">Exchange Count</option>
                            <option value="tradingStatus">Trading Status</option>
                          </select>
                          
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCombinedCondition(index, { operator: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="above">Above</option>
                            <option value="below">Below</option>
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                          </select>
                          
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateCombinedCondition(index, { value: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            placeholder="Value"
                          />
                          
                          <button
                            onClick={() => removeCombinedCondition(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alert Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Alert Message</label>
                  <input
                    type="text"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Custom alert message"
                    required
                  />
                </div>

                {/* Create Button */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCreateAlert}
                    className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
                  >
                    Create Alert
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-4">
            {sortedAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No alerts configured</h3>
                <p className="text-gray-400">Create your first alert to get notified about price movements</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Active Alerts ({alerts.filter(a => a.isActive).length}/{alerts.length})
                  </h3>
                  <div className="text-sm text-gray-400">
                    Sorted by newest first
                  </div>
                </div>

                {sortedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-gray-850/50 border rounded-xl p-4 transition-all duration-200 ${
                      alert.isActive 
                        ? alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000
                          ? 'border-success-500 bg-success-500/5'
                          : 'border-blue-500 bg-blue-500/5'
                        : 'border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          alert.isActive 
                            ? alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000
                              ? 'bg-success-600/20'
                              : 'bg-blue-600/20'
                            : 'bg-gray-600/20'
                        }`}>
                          <Bell className={`w-5 h-5 ${getAlertStatusColor(alert)}`} />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{alert.message}</div>
                          <div className="text-sm text-gray-400">
                            {getAlertTypeDescription(alert.alertType)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          alert.isActive 
                            ? alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000
                              ? 'bg-success-500/20 text-success-400'
                              : 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {getAlertStatusText(alert)}
                        </span>
                        
                        <button
                          onClick={() => toggleAlertActive(alert.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            alert.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-white'
                          }`}
                          title={alert.isActive ? 'Disable alert' : 'Enable alert'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Alert Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 font-semibold mb-1">Created</div>
                        <div className="text-white">{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 font-semibold mb-1">Trigger Count</div>
                        <div className="text-white font-bold">{alert.triggerCount}</div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 font-semibold mb-1">Last Triggered</div>
                        <div className="text-white">
                          {alert.lastTriggered ? format(new Date(alert.lastTriggered), 'MMM dd, HH:mm') : 'Never'}
                        </div>
                      </div>
                    </div>

                    {/* Condition Details */}
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-400 font-semibold mb-2">Alert Conditions:</div>
                      <div className="text-sm text-gray-300">
                        {alert.alertType === 'price_above' && `Price above $${alert.conditions.priceAbove}`}
                        {alert.alertType === 'price_below' && `Price below $${alert.conditions.priceBelow}`}
                        {alert.alertType === 'price_change' && `${alert.conditions.priceChangeDirection} change ≥ ${alert.conditions.priceChangePercent}%`}
                        {alert.alertType === 'volume_above' && `Volume above $${alert.conditions.volumeAbove?.toLocaleString()}`}
                        {alert.alertType === 'volume_below' && `Volume below $${alert.conditions.volumeBelow?.toLocaleString()}`}
                        {alert.alertType === 'exchange_count' && `Exchange count changes`}
                        {alert.alertType === 'new_exchange' && `New exchange listing detected`}
                        {alert.alertType === 'removed_exchange' && `Exchange delisting detected`}
                        {alert.alertType === 'ath_distance' && `${alert.conditions.athDistanceDirection} ${alert.conditions.athDistancePercent}% from ATH`}
                        {alert.alertType === 'percent_from_ath' && `${alert.conditions.percentFromAthThreshold}% ${alert.conditions.percentFromAthDirection} ATH`}
                        {alert.alertType === 'trading_status' && `Trading status becomes ${alert.conditions.tradingStatus}`}
                        {alert.alertType === 'combined' && `${alert.conditions.combinedConditions?.length} combined conditions`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};