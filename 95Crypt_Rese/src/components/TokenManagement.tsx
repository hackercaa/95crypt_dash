import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search, Filter, Trash2, Calendar, FileText, AlertCircle, CheckCircle, X, Settings, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Token } from '../types';
import { DeleteTokenModal } from './DeleteTokenModal';
import { DeletedTokensSection } from './DeletedTokensSection';

export interface DeletedToken {
  id: string;
  symbol: string;
  name: string;
  exchanges: string[];
  dateAdded: number;
  dateDeleted: number;
  deletionReason: string;
  deletedBy?: string;
}

interface TokenManagementProps {
  tokens: Token[];
  onAddToken: (tokenData: Omit<Token, 'id'>) => Promise<void>;
  onRemoveToken: (id: string) => Promise<void>;
}

export const TokenManagement: React.FC<TokenManagementProps> = ({
  tokens,
  onAddToken,
  onRemoveToken
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'deleted' | 'api'>('add');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [bulkTokens, setBulkTokens] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | '3months' | '1year' | 'custom'>('all');
  const [customDays, setCustomDays] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedTokens, setDeletedTokens] = useState<DeletedToken[]>([]);
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);

  const handleAddSingleToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenSymbol.trim()) return;

    setLoading(true);
    try {
      await onAddToken({
        symbol: newTokenSymbol.toUpperCase(),
        name: newTokenSymbol.toUpperCase(),
        exchanges: ['mexc', 'gateio'],
        added: Date.now()
      });
      setNewTokenSymbol('');
      toast.success(`${newTokenSymbol.toUpperCase()} added successfully`);
    } catch (error) {
      toast.error('Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    const tokenList = bulkTokens
      .split(/[,\n]/)
      .map(token => token.trim().toUpperCase())
      .filter(token => token.length > 0);

    if (tokenList.length === 0) {
      toast.error('Please enter at least one token symbol');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const symbol of tokenList) {
      try {
        await onAddToken({
          symbol,
          name: symbol,
          exchanges: ['mexc', 'gateio'],
          added: Date.now()
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setBulkTokens('');
    toast.success(`Added ${successCount} tokens successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    setLoading(false);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkTokens(content);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const csvContent = [
      'Symbol,Name,Date Added',
      ...tokens.map(token => `${token.symbol},${token.name},${format(new Date(token.added), 'yyyy-MM-dd')}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokens-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tokens exported successfully');
  };

  const getFilteredTokens = () => {
    let filtered = [...tokens];

    if (searchTerm) {
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = Date.now();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(token => now - token.added < 86400000);
        break;
      case '7days':
        filtered = filtered.filter(token => now - token.added < 7 * 86400000);
        break;
      case '30days':
        filtered = filtered.filter(token => now - token.added < 30 * 86400000);
        break;
      case '3months':
        filtered = filtered.filter(token => now - token.added < 90 * 86400000);
        break;
      case '1year':
        filtered = filtered.filter(token => now - token.added < 365 * 86400000);
        break;
      case 'custom':
        if (customDays) {
          const customMs = parseInt(customDays) * 86400000;
          filtered = filtered.filter(token => now - token.added < customMs);
        }
        break;
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.added - a.added);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.added - b.added);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.symbol.localeCompare(a.symbol));
        break;
    }

    return filtered;
  };

  const handleDeleteToken = async (reason: string) => {
    if (!tokenToDelete) return;

    try {
      const deletedToken: DeletedToken = {
        id: tokenToDelete.id,
        symbol: tokenToDelete.symbol,
        name: tokenToDelete.name,
        exchanges: tokenToDelete.exchanges,
        dateAdded: tokenToDelete.added,
        dateDeleted: Date.now(),
        deletionReason: reason,
        deletedBy: 'current_user'
      };

      setDeletedTokens(prev => [deletedToken, ...prev]);
      
      // Call the API directly with the reason
      const response = await fetch(`http://localhost:3001/api/tokens/${tokenToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason,
          deletedBy: 'current_user'
        })
      });
      
      if (!response.ok) throw new Error('Failed to remove token');
      
      // Update local state
      const updatedTokens = tokens.filter(token => token.id !== tokenToDelete.id);
      // We need to trigger a refresh of the tokens list
      window.location.reload(); // Simple solution to refresh the token list
      
      toast.success(`${tokenToDelete.symbol} deleted successfully`);
      setTokenToDelete(null);
    } catch (error) {
      console.error('Error deleting token:', error);
      toast.error('Failed to delete token');
    }
  };

  const handleRestoreToken = async (tokenId: string) => {
    const deletedToken = deletedTokens.find(t => t.id === tokenId);
    if (!deletedToken) return;

    try {
      await onAddToken({
        symbol: deletedToken.symbol,
        name: deletedToken.name,
        exchanges: deletedToken.exchanges,
        added: Date.now()
      });

      setDeletedTokens(prev => prev.filter(t => t.id !== tokenId));
      toast.success(`${deletedToken.symbol} restored successfully`);
    } catch (error) {
      console.error('Error restoring token:', error);
      toast.error('Failed to restore token');
    }
  };

  const tabs = [
    { id: 'add', label: 'Add Tokens', icon: Plus },
    { id: 'manage', label: 'Manage Tokens', icon: Settings },
    { id: 'deleted', label: 'Deleted History', icon: Trash2 },
    { id: 'api', label: 'API Documentation', icon: FileText }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Settings className="w-6 h-6 text-gray-950" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Token Management</h1>
            <p className="text-gray-400 mt-1">Manage your cryptocurrency token portfolio</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gray-850 rounded-xl px-4 py-2 border border-gray-800">
            <div className="text-sm text-gray-400">Active Tokens</div>
            <div className="text-2xl font-bold text-white">{tokens.length}</div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
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

      {/* Add Tokens Tab */}
      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Single Token Addition */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Single Token</h3>
                <p className="text-gray-400 text-sm">Add individual tokens to your portfolio</p>
              </div>
            </div>
            
            <form onSubmit={handleAddSingleToken} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={newTokenSymbol}
                  onChange={(e) => setNewTokenSymbol(e.target.value)}
                  className="input-modern w-full px-4 py-3 text-base"
                  placeholder="e.g., BTC, ETH, SOL"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Only token symbol is required. Name and other details will be fetched automatically.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:shadow-glow disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    <span>Adding Token...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Token</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bulk Import */}
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Bulk Import</h3>
                <p className="text-gray-400 text-sm">Import multiple tokens at once</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Import from File
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileImport}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-gray-950 file:font-semibold hover:file:bg-primary-500 transition-colors"
                />
                <p className="text-xs text-gray-400 mt-2">
                  CSV or TXT format, one token per line
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Or Enter Manually
                </label>
                <textarea
                  value={bulkTokens}
                  onChange={(e) => setBulkTokens(e.target.value)}
                  className="input-modern w-full px-4 py-3 h-24 resize-none"
                  placeholder="BTC,ETH,SOL or one per line:&#10;BTC&#10;ETH&#10;SOL"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkImport}
                  disabled={loading || !bulkTokens.trim()}
                  className="flex-1 bg-gradient-success hover:shadow-glow-success disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Import Tokens</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Tokens Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6 animate-slide-up">
          {/* Modern Filters */}
          <div className="card-modern p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern w-full pl-12 pr-4 py-3"
                    placeholder="Search tokens..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-modern w-full px-4 py-3"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Date Filter</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="input-modern w-full px-4 py-3"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="3months">Last 3 months</option>
                  <option value="1year">Last year</option>
                  <option value="custom">Custom Days</option>
                </select>
              </div>

              {dateFilter === 'custom' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Custom Days</label>
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="input-modern w-full px-4 py-3"
                    placeholder="Enter days"
                    min="1"
                  />
                </div>
              ) : (
                <div className="flex items-end">
                  <button
                    onClick={handleExport}
                    className="w-full bg-gradient-success hover:shadow-glow-success text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modern Tokens Table */}
          <div className="card-modern overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-850/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Token</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Exchanges</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Date Added</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {getFilteredTokens().map((token) => (
                    <tr key={token.id} className="hover:bg-gray-850/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-gray-950 font-bold shadow-md">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">{token.symbol}</div>
                            <div className="text-sm text-gray-400">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {token.exchanges.map(exchange => (
                            <span
                              key={exchange}
                              className="badge-modern badge-info"
                            >
                              {exchange.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300 font-medium">
                          {format(new Date(token.added), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setTokenToDelete(token)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {getFilteredTokens().length === 0 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-xl font-semibold">No tokens found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or add some tokens</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deleted History Tab */}
      {activeTab === 'deleted' && (
        <div className="space-y-6 animate-slide-up">
          <DeletedTokensSection 
            deletedTokens={deletedTokens}
            onRestore={handleRestoreToken}
          />
          
          {deletedTokens.length === 0 && (
            <div className="card-modern p-12 text-center">
              <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No deleted tokens</h3>
              <p className="text-gray-400">Deleted tokens will appear here for audit purposes</p>
            </div>
          )}
        </div>
      )}

      {/* API Documentation Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-slide-up">
          <div className="card-modern p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">API Documentation</h3>
                <p className="text-gray-400">Use these endpoints to programmatically manage your tokens</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Single Token Addition */}
              <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-white mb-4 text-lg">Single Token Addition (POST)</h4>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 mb-4 border border-gray-800">
                  POST /api/add-token<br />
                  Content-Type: application/json
                </div>
                <div className="text-gray-300 font-semibold mb-2">Request Body:</div>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-blue-400 border border-gray-800">
                  {`{"symbol": "BTC", "name": "Bitcoin", "exchanges": ["mexc", "gateio"]}`}
                </div>
              </div>

              {/* Multiple Token Addition */}
              <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-white mb-4 text-lg">Multiple Token Addition (JSON POST)</h4>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 mb-4 border border-gray-800">
                  POST /api/add-tokens<br />
                  Content-Type: application/json
                </div>
                <div className="text-gray-300 font-semibold mb-2">Request Body:</div>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-blue-400 border border-gray-800">
                  {`{"tokens": ["BTC", "ETH", "ADA"]}`}
                </div>
              </div>

              {/* API Response Format */}
              <div className="bg-gray-850/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-white mb-4 text-lg">API Response Format</h4>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-yellow-400 border border-gray-800">
                  {`{
  "success": true,
  "added": 2,
  "failed": 1,
  "results": [
    {"token": "BTC", "status": "added", "message": "Successfully added"},
    {"token": "ETH", "status": "added", "message": "Successfully added"},
    {"token": "INVALID", "status": "failed", "message": "Token not found"}
  ]
}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tokenToDelete && (
        <DeleteTokenModal
          token={tokenToDelete}
          onClose={() => setTokenToDelete(null)}
          onConfirm={handleDeleteToken}
        />
      )}
    </div>
  );
};