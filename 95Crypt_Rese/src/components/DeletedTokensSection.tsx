import React, { useState } from 'react';
import { Trash2, Calendar, Building2, MessageSquare, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

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

interface DeletedTokensSectionProps {
  deletedTokens: DeletedToken[];
  onRestore?: (tokenId: string) => void;
}

export const DeletedTokensSection: React.FC<DeletedTokensSectionProps> = ({
  deletedTokens,
  onRestore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const sortedTokens = [...deletedTokens].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.dateDeleted - a.dateDeleted;
      case 'oldest':
        return a.dateDeleted - b.dateDeleted;
      case 'name':
        return a.symbol.localeCompare(b.symbol);
      default:
        return 0;
    }
  });

  if (deletedTokens.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-700/20 border-b border-gray-700/50">
        {/* Workflow Demonstration Banner */}
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
            <span className="text-blue-300 font-semibold">Deletion Workflow Complete</span>
          </div>
          <p className="text-sm text-blue-200 ml-8">
            These tokens were deleted following the two-step process: reason collection → deletion with audit trail.
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Deleted Tokens</h3>
              <p className="text-sm text-gray-400">
                {deletedTokens.length} token{deletedTokens.length !== 1 ? 's' : ''} deleted
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Showing {sortedTokens.length} deleted token{sortedTokens.length !== 1 ? 's' : ''}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">Newest Deleted</option>
              <option value="oldest">Oldest Deleted</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Deleted Tokens List */}
          <div className="space-y-3">
            {sortedTokens.map((token) => (
              <div
                key={token.id}
                className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 relative"
              >
                {/* Deleted Badge */}
                <div className="absolute top-2 right-2">
                  <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-full text-xs font-medium border border-red-600/30">
                    DELETED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Token Info */}
                  <div>
                    {/* Audit Trail Header */}
                    <div className="bg-gray-600/20 rounded-lg p-2 mb-3 border border-gray-600/30">
                      <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                        🔍 Audit Trail Record
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center text-gray-400 font-bold opacity-60">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-300 line-through">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-gray-400 line-through">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    {/* Exchanges */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Exchanges:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {token.exchanges.map(exchange => (
                          <span
                            key={exchange}
                            className="px-2 py-1 bg-gray-600/30 text-gray-400 text-xs rounded-full border border-gray-600/50"
                          >
                            {exchange.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Deletion Details */}
                  <div>
                    {/* Dates */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Added:</span>
                        <span className="text-sm text-gray-300">
                          {format(new Date(token.dateAdded), 'MM/dd/yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-400">Deleted:</span>
                        <span className="text-sm text-red-300">
                          {format(new Date(token.dateDeleted), 'MM/dd/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Deletion Reason */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Deletion Reason (Required):</span>
                      </div>
                      <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                        <div className="text-xs text-yellow-300 font-medium mb-1">USER PROVIDED REASON:</div>
                        <p className="text-sm text-gray-300 italic">
                          "{token.deletionReason}"
                        </p>
                        {token.deletedBy && (
                          <p className="text-xs text-yellow-400 mt-2 font-medium">
                            → Deleted by: {token.deletedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Restore Button (if restore function provided) */}
                    {onRestore && (
                      <div className="border-t border-gray-600/30 pt-3">
                        <div className="text-xs text-gray-400 mb-2">
                          💡 Tokens can be restored if deleted by mistake
                        </div>
                      <button
                        onClick={() => onRestore(token.id)}
                          className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-blue-600/30 transform hover:scale-105"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore Token</span>
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};