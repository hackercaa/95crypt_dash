import React, { useState } from 'react';
import { X, Plus, Upload, Download, Search, Filter, Trash2, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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

interface AddTokenModalProps {
  onClose: () => void;
  onAdd: (token: Omit<Token, 'id'>) => Promise<void>;
  tokens: Token[];
  onRemoveToken: (id: string) => void;
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({ onClose, onAdd, tokens, onRemoveToken }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'deleted' | 'api'>('add');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [bulkTokens, setBulkTokens] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | '3months' | '1year'>('all');
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);
  const [deletedTokens, setDeletedTokens] = useState<DeletedToken[]>([]);

  const handleAddSingleToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenSymbol.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        symbol: newTokenSymbol.toUpperCase(),
        name: newTokenSymbol.toUpperCase(),
        exchanges: ['mexc', 'gateio'],
        added: Date.now()
      });
      setNewTokenSymbol('');
      toast.success(`${newTokenSymbol.toUpperCase()} added successfully`);
    } catch (error) {
      console.error('Error adding token:', error);
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
        await onAdd({
          symbol,
          name: symbol,
          exchanges: ['mexc', 'gateio'],
          added: Date.now()
        });
        successCount++;
      } catch (error) {
        console.error(`Error adding token ${symbol}:`, error);
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
    if (!formData.symbol.trim()) {
      toast.error('Token symbol is required');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Token name is required');
      return;
    }
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
      // Create deleted token record
      const deletedToken: DeletedToken = {
        id: tokenToDelete.id,
        symbol: tokenToDelete.symbol,
        name: tokenToDelete.name,
        exchanges: tokenToDelete.exchanges,
        dateAdded: tokenToDelete.added,
        dateDeleted: Date.now(),
        deletionReason: reason,
        deletedBy: 'current_user' // In real app, get from auth context
      };

      // Add to deleted tokens list
      setDeletedTokens(prev => [deletedToken, ...prev]);

      // Remove from active tokens
      await onRemoveToken(tokenToDelete.id);
      
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
      // Restore token to active list
      await onAdd({
        symbol: deletedToken.symbol,
        name: deletedToken.name,
        exchanges: deletedToken.exchanges,
        added: Date.now() // New added date
      });

      // Remove from deleted tokens
      setDeletedTokens(prev => prev.filter(t => t.id !== tokenId));
      
      toast.success(`${deletedToken.symbol} restored successfully`);
    } catch (error) {
      console.error('Error restoring token:', error);
      toast.error('Failed to restore token');
    }
  };

  const tabs = [
    { id: 'add', label: 'Add Tokens', icon: Plus },
    { id: 'manage', label: 'Manage Tokens', icon: FileText },
    { id: 'deleted', label: 'Deleted History', icon: Trash2 },
    { id: 'api', label: 'API Documentation', icon: FileText }
  ];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 p-6 pb-0">
            <h2 className="text-2xl font-bold text-white">Token Management</h2>
            <div className="text-sm text-gray-400">
              {tokens.length} active tokens
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-6 pb-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mx-6 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          {/* Add Tokens Tab */}
          {activeTab === 'add' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Single Token Addition */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Single Token</span>
                </h3>
                
                <form onSubmit={handleAddSingleToken} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token Symbol (Required)
                    </label>
                    <input
                      type="text"
                      value={newTokenSymbol}
                      onChange={(e) => setNewTokenSymbol(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., BTC, ETH, SOL"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Only token symbol is required. Name and other details will be fetched automatically.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Token</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Bulk Import */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Bulk Import</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Import from File
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileImport}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      CSV or TXT format, one token per line
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or Enter Manually
                    </label>
                    <textarea
                      value={bulkTokens}
                      onChange={(e) => setBulkTokens(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                      placeholder="BTC,ETH,SOL or one per line:&#10;BTC&#10;ETH&#10;SOL"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBulkImport}
                      disabled={loading || !bulkTokens.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Tokens</span>
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manage Tokens Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Filters and Controls */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search tokens..."
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Filter</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="3months">Last 3 months</option>
                      <option value="1year">Last year</option>
                    </select>
                  </div>

                  {/* Export Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleExport}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tokens Table */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700/50 border-b border-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-300 font-medium">Token</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-medium">Exchanges</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-medium">Date Added</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {getFilteredTokens().map((token) => (
                        <tr key={token.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-white">{token.symbol}</div>
                                <div className="text-xs text-gray-400">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {token.exchanges.map(exchange => (
                                <span
                                  key={exchange}
                                  className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                                >
                                  {exchange.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300 text-sm">
                              {format(new Date(token.added), 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setTokenToDelete(token)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {getFilteredTokens().length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No tokens found</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deleted History Tab */}
          {activeTab === 'deleted' && (
            <div className="space-y-6">
              <DeletedTokensSection 
                deletedTokens={deletedTokens}
                onRestore={handleRestoreToken}
              />
              
              {deletedTokens.length === 0 && (
                <div className="text-center py-12">
                  <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No deleted tokens</p>
                  <p className="text-gray-500 text-sm mt-2">Deleted tokens will appear here for audit purposes</p>
                </div>
              )}
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">API Documentation</h3>
                <p className="text-gray-300 mb-6">
                  Use these endpoints to programmatically manage your tokens.
                </p>
                
                <div className="space-y-6">
                  {/* Single Token Addition */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Single Token Addition (POST)</h4>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400 mb-2">
                      POST /api/add-token<br />
                      Content-Type: application/json
                    </div>
                    <div className="text-gray-300 text-sm mb-2">Body:</div>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-blue-400">
                      {`{"symbol": "BTC", "name": "Bitcoin", "exchanges": ["mexc", "gateio"]}`}
                    </div>
                  </div>

                  {/* Multiple Token Addition */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Multiple Token Addition (JSON POST)</h4>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400 mb-2">
                      POST /api/add-tokens<br />
                      Content-Type: application/json
                    </div>
                    <div className="text-gray-300 text-sm mb-2">Body:</div>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-blue-400">
                      {`{"tokens": ["BTC", "ETH", "ADA"]}`}
                    </div>
                  </div>

                  {/* API Response Format */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">API Response Format</h4>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-yellow-400">
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
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {tokenToDelete && (
        <DeleteTokenModal
          token={tokenToDelete}
          onClose={() => setTokenToDelete(null)}
          onConfirm={handleDeleteToken}
        />
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