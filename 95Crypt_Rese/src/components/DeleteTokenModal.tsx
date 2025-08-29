import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Token } from '../types';

interface DeleteTokenModalProps {
  token: Token;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const DeleteTokenModal: React.FC<DeleteTokenModalProps> = ({
  token,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (error) {
      console.error('Error deleting token:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedReasons = [
    'Low trading volume',
    'Duplicate entry',
    'Project discontinued',
    'Security concerns',
    'Regulatory issues',
    'Poor performance',
    'No longer relevant'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Delete Token</h2>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1 Indicator */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-blue-300 font-semibold">Step 1: Provide Deletion Reason</span>
            </div>
            <p className="text-sm text-blue-200 mt-1 ml-8">
              A reason is required before any token can be deleted from the system.
            </p>
          </div>

          {/* Token Info */}
          <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {token.symbol.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{token.symbol}</div>
                <div className="text-sm text-gray-400">{token.name}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              <div>Exchanges: {token.exchanges.join(', ')}</div>
              <div>Added: {new Date(token.added).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Deletion Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for deletion <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                placeholder="Please provide a reason for deleting this token..."
                required
              />
              {!reason.trim() && (
                <p className="text-xs text-red-400 mt-1">
                  Deletion reason is required
                </p>
              )}
            </div>

            {/* Quick Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick select:
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedReasons.map((predefinedReason) => (
                  <button
                    key={predefinedReason}
                    type="button"
                    onClick={() => setReason(predefinedReason)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs rounded-full transition-colors"
                  >
                    {predefinedReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4">
              {/* Step 2 Indicator */}
              {reason.trim() && (
                <div className="w-full bg-green-600/10 border border-green-600/30 rounded-lg p-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-green-300 font-medium text-sm">Ready to Process Deletion</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!reason.trim() || isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Deletion...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{reason.trim() ? 'Confirm Deletion' : 'Enter Reason First'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};