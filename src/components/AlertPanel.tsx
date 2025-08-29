import React, { useState, useEffect } from 'react';
import { Plus, Bell, Trash2, AlertTriangle, Settings, Zap, TrendingUp, TrendingDown, Edit2, Save, Calendar, User, Target, Activity, BarChart3, Building2, Clock, Globe, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  alertType: 'price_above' | 'price_below' | 'price_change' | 'volume_above' | 'volume_below' | 'exchange_count' | 'new_exchange' | 'removed_exchange' | 'ath_distance' | 'percent_from_ath' | 'trading_status' | 'combined';
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

export const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tokenSymbol: '',
    tokenName: '',
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

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('comprehensiveAlerts');
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  const saveAlertsToStorage = (updatedAlerts: Alert[]) => {
    localStorage.setItem('comprehensiveAlerts', JSON.stringify(updatedAlerts));
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

  const handleCreateAlert = () => {
    if (!formData.tokenSymbol.trim()) {
      toast.error('Token symbol is required');
      return;
    }

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
      tokenSymbol: formData.tokenSymbol.toUpperCase(),
      tokenName: formData.tokenName || formData.tokenSymbol.toUpperCase(),
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
    resetFormData();
    setShowCreateForm(false);
    toast.success('Alert created successfully');
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlertId(alert.id);
    setFormData({
      tokenSymbol: alert.tokenSymbol,
      tokenName: alert.tokenName,
      alertType: alert.alertType,
      priceAbove: alert.conditions.priceAbove?.toString() || '',
      priceBelow: alert.conditions.priceBelow?.toString() || '',
      priceChangePercent: alert.conditions.priceChangePercent?.toString() || '',
      priceChangeDirection: alert.conditions.priceChangeDirection || 'positive',
      volumeAbove: alert.conditions.volumeAbove?.toString() || '',
      volumeBelow: alert.conditions.volumeBelow?.toString() || '',
      exchangeCountAbove: alert.conditions.exchangeCountAbove?.toString() || '',
      exchangeCountBelow: alert.conditions.exchangeCountBelow?.toString() || '',
      newExchangeAlert: alert.conditions.newExchangeAlert || false,
      removedExchangeAlert: alert.conditions.removedExchangeAlert || false,
      athDistancePercent: alert.conditions.athDistancePercent?.toString() || '',
      athDistanceDirection: alert.conditions.athDistanceDirection || 'closer',
      percentFromAthThreshold: alert.conditions.percentFromAthThreshold?.toString() || '',
      percentFromAthDirection: alert.conditions.percentFromAthDirection || 'below',
      tradingStatus: alert.conditions.tradingStatus || '',
      message: alert.message,
      combinedConditions: alert.conditions.combinedConditions || []
    });
    setShowCreateForm(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlertId) return;

    if (!formData.tokenSymbol.trim()) {
      toast.error('Token symbol is required');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Alert message is required');
      return;
    }

    const updatedAlert: Alert = {
      id: editingAlertId,
      tokenSymbol: formData.tokenSymbol.toUpperCase(),
      tokenName: formData.tokenName || formData.tokenSymbol.toUpperCase(),
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
      createdAt: alerts.find(a => a.id === editingAlertId)?.createdAt || Date.now(),
      updatedAt: Date.now(),
      triggerCount: alerts.find(a => a.id === editingAlertId)?.triggerCount || 0,
      lastTriggered: alerts.find(a => a.id === editingAlertId)?.lastTriggered,
      author: 'current_user'
    };

    const updatedAlerts = alerts.map(alert =>
      alert.id === editingAlertId ? updatedAlert : alert
    );

    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);
    
    setEditingAlertId(null);
    resetFormData();
    setShowCreateForm(false);
    toast.success('Alert updated successfully');
  };

  const resetFormData = () => {
    setFormData({
      tokenSymbol: '',
      tokenName: '',
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

  const getAlertStatusColor = (alert: Alert) => {
    if (!alert.isActive) return 'text-gray-400';
    if (alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000) return 'text-success-400';
    return 'text-blue-400';
  };

  const getAlertStatusText = (alert: Alert) => {
    if (!alert.isActive) return 'Disabled';
    if (alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000) return 'Recently Triggered';
    return 'Active';
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingAlertId(null);
    resetFormData();
  };

  const sortedAlerts = [...alerts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-glow">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Price Alerts</h1>
            <p className="text-gray-400 mt-1">Set up comprehensive notifications for price movements and market changes</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-modern p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <div className="text-sm text-gray-400">Total Alerts</div>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-600/20 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-success-400">{alerts.filter(a => a.isActive).length}</div>
              <div className="text-sm text-gray-400">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-600/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-400">
                {alerts.reduce((sum, alert) => sum + alert.triggerCount, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Triggers</div>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {new Set(alerts.map(a => a.tokenSymbol)).size}
              </div>
              <div className="text-sm text-gray-400">Unique Tokens</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create/Edit Alert Form */}
      {showCreateForm && (
        <div className="card-modern p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                {editingAlertId ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingAlertId ? 'Edit Alert' : 'Create New Alert'}
                </h3>
                <p className="text-gray-400">
                  {editingAlertId ? 'Modify your existing alert configuration' : 'Set up comprehensive price and market alerts'}
                </p>
              </div>
            </div>
            <button
              onClick={cancelForm}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Token Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                  className="input-modern w-full px-4 py-3"
                  placeholder="e.g., BTC"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Token Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                  className="input-modern w-full px-4 py-3"
                  placeholder="e.g., Bitcoin"
                />
              </div>
            </div>

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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.priceAbove}
                    onChange={(e) => setFormData({ ...formData, priceAbove: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target price"
                  />
                </div>
              )}

              {/* Price Below */}
              {formData.alertType === 'price_below' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.priceBelow}
                    onChange={(e) => setFormData({ ...formData, priceBelow: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target price"
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
                <div className="md:col-span-2">
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
                    placeholder="Enter volume threshold"
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
                      placeholder="Minimum exchanges"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Max Exchange Count</label>
                    <input
                      type="number"
                      value={formData.exchangeCountBelow}
                      onChange={(e) => setFormData({ ...formData, exchangeCountBelow: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Maximum exchanges (optional)"
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
                  </div>
                </>
              )}

              {/* Trading Status */}
              {formData.alertType === 'trading_status' && (
                <div className="md:col-span-2">
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
                    type="button"
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
                        type="button"
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

            {/* Create/Update Button */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={editingAlertId ? handleUpdateAlert : handleCreateAlert}
                className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                {editingAlertId ? (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Alert</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Alert</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelForm}
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
          <div className="card-modern p-16 text-center">
            <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No alerts configured</h3>
            <p className="text-gray-400 text-lg mb-6">Create your first comprehensive price alert to get notified</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Alert</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Active Alerts ({alerts.filter(a => a.isActive).length}/{alerts.length})
              </h3>
              <div className="text-sm text-gray-400">
                Sorted by newest first
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`card-modern p-6 transition-all duration-200 ${
                    alert.isActive 
                      ? alert.lastTriggered && Date.now() - alert.lastTriggered < 3600000
                        ? 'border-success-500 bg-success-500/5'
                        : 'border-blue-500 bg-blue-500/5'
                      : 'opacity-60'
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
                          {alert.tokenSymbol} • {getAlertTypeDescription(alert.alertType)}
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
                        onClick={() => handleEditAlert(alert)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-500/10"
                        title="Edit this alert"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
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
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
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
          </div>
        )}
      </div>
    </div>
  );
};