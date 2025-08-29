import React, { useState } from 'react';
import { Plus, Bell, Trash2, AlertTriangle, Settings, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  targetPrice?: number;
  changePercent?: number;
  message: string;
  created: number;
  triggered: boolean;
}

export const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    condition: 'above' as const,
    targetPrice: '',
    changePercent: '',
    message: ''
  });

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol.trim()) {
      toast.error('Token symbol is required');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Alert message is required');
      return;
    }
    
    if (formData.condition !== 'change' && !formData.targetPrice) {
      toast.error('Target price is required');
      return;
    }
    
    if (formData.condition === 'change' && !formData.changePercent) {
      toast.error('Change percentage is required');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
          changePercent: formData.changePercent ? parseFloat(formData.changePercent) : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create alert');
      }
      
      const alert = await response.json();
      setAlerts([...alerts, alert]);
      setShowCreateForm(false);
      setFormData({ symbol: '', condition: 'above', targetPrice: '', changePercent: '', message: '' });
      toast.success('Alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    }
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success('Alert deleted');
  };

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
            <p className="text-gray-400 mt-1">Set up notifications for price movements and changes</p>
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
      
      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="card-modern p-6 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create New Alert</h3>
              <p className="text-gray-400">Set up a custom price alert for any token</p>
            </div>
          </div>
          
          <form onSubmit={handleCreateAlert} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="input-modern w-full px-4 py-3"
                  placeholder="e.g., BTC"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  className="input-modern w-full px-4 py-3"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                  <option value="change">Price Change %</option>
                </select>
              </div>
              
              {formData.condition !== 'change' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    className="input-modern w-full px-4 py-3"
                    placeholder="0.0000"
                    required
                  />
                </div>
              )}
              
              {formData.condition === 'change' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Change Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.changePercent}
                    onChange={(e) => setFormData({ ...formData, changePercent: e.target.value })}
                    className="input-modern w-full px-4 py-3"
                    placeholder="5.0"
                    required
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Alert Message
                </label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-modern w-full px-4 py-3"
                  placeholder="Custom alert message"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="card-modern p-16 text-center">
            <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No alerts configured</h3>
            <p className="text-gray-400 text-lg mb-6">Create your first price alert to get notified</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Alert</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`card-modern p-6 ${
                  alert.triggered ? 'border-success-500 bg-success-500/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      alert.triggered ? 'bg-success-600/20' : 'bg-blue-600/20'
                    }`}>
                      <Bell className={`w-5 h-5 ${alert.triggered ? 'text-success-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{alert.message}</div>
                      <div className="text-sm text-gray-400">
                        {alert.symbol} • {alert.condition} {alert.targetPrice ? `$${alert.targetPrice}` : `${alert.changePercent}%`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.triggered && (
                      <span className="badge-modern badge-success">
                        Triggered
                      </span>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    Created: {new Date(alert.created).toLocaleDateString()}
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    alert.condition === 'above' ? 'text-success-400' : 
                    alert.condition === 'below' ? 'text-danger-400' : 'text-warning-400'
                  }`}>
                    {alert.condition === 'above' && <TrendingUp className="w-4 h-4" />}
                    {alert.condition === 'below' && <TrendingDown className="w-4 h-4" />}
                    {alert.condition === 'change' && <Zap className="w-4 h-4" />}
                    <span className="font-semibold capitalize">{alert.condition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};