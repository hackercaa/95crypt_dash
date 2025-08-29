import React from 'react';
import { Plus, Activity, BarChart3, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  onAddToken: () => void;
  connectionStatus: boolean;
  activeTab: string;
  onTabChange: (tab: 'overview' | 'management' | 'growth' | 'alerts' | 'scraping') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAddToken, 
  connectionStatus, 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'management', label: 'Management', icon: Settings },
    { id: 'growth', label: 'Growth Analysis', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'scraping', label: 'Scraping', icon: Settings }
  ];

  return (
    <header className="glass-effect border-b border-gray-800 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gradient-primary">CryptoExchange</h1>
            </div>
            
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-850 rounded-full border border-gray-800">
              <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus ? 'bg-success-500 shadow-glow-success' : 'bg-danger-500'} animate-pulse`} />
              <span className="text-xs font-medium text-gray-300">
                {connectionStatus ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-primary text-gray-950 shadow-glow'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1 transition-transform hover:scale-105">
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
          
          <button
            onClick={onAddToken}
            className="bg-gradient-primary hover:shadow-glow text-gray-950 px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Token</span>
          </button>
        </div>
      </div>
    </header>
  );
};