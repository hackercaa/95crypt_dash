import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { CompactTokenFilters } from './components/CompactTokenFilters';
import { TokenTable } from './components/TokenTable';
import { LayoutControls } from './components/LayoutControls';
import { TokenManagement } from './components/TokenManagement';
import { TokenGrowthAnalysis } from './components/TokenGrowthAnalysis';
import { AlertPanel } from './components/AlertPanel';
import { ScrapingControl } from './components/ScrapingControl';
import { AddTokenModal } from './components/AddTokenModal';
import { useCryptoData } from './hooks/useCryptoData';
import { useWebSocket } from './hooks/useWebSocket';
import { useState, useMemo } from 'react';
import { Token } from './types';

function App() {
  // Use actual data hooks instead of mock data
  const { tokens, priceData, loading, error, refreshData, addToken, removeToken } = useCryptoData();
  const { isConnected } = useWebSocket();
  
  const [selectedToken, setSelectedToken] = useState<string>('BTC');
  const [showAddToken, setShowAddToken] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'growth' | 'alerts' | 'scraping'>('overview');
  const [trackingToken, setTrackingToken] = useState<Token | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<any>(null);
  
  // Filter tokens based on active filters
  const filteredTokens = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return tokens;
    
    return tokens.filter(token => {
      // Enhanced search filter with & and | operators
      if (filters.search) {
        const searchQuery = filters.search.trim();
        if (searchQuery) {
          // Use the enhanced search evaluation function
          const evaluateSearchQuery = (token: Token, query: string): boolean => {
            if (!query.trim()) return true;
            
            // Handle & (AND) and | (OR) operators
            if (query.includes('|')) {
              // OR logic - any condition must match
              return query.split('|').some(orTerm => evaluateSearchQuery(token, orTerm.trim()));
            }
            
            if (query.includes('&')) {
              // AND logic - all conditions must match
              return query.split('&').every(andTerm => evaluateSearchQuery(token, andTerm.trim()));
            }
            
            // Single term evaluation
            const searchTerm = query.toLowerCase().trim();
            const tokenPrice = priceData[token.symbol];
            
            // Column-specific searches
            if (searchTerm.includes(':')) {
              const [column, value] = searchTerm.split(':');
              const cleanValue = value.trim();
              
              switch (column.trim()) {
                case 'symbol':
                  return token.symbol.toLowerCase().includes(cleanValue);
                case 'name':
                  return token.name.toLowerCase().includes(cleanValue);
                case 'price':
                  if (!tokenPrice?.averagePrice) return false;
                  if (cleanValue.startsWith('>')) {
                    return tokenPrice.averagePrice > parseFloat(cleanValue.substring(1));
                  } else if (cleanValue.startsWith('<')) {
                    return tokenPrice.averagePrice < parseFloat(cleanValue.substring(1));
                  } else if (cleanValue.startsWith('=')) {
                    return Math.abs(tokenPrice.averagePrice - parseFloat(cleanValue.substring(1))) < 0.01;
                  } else {
                    return tokenPrice.averagePrice.toString().includes(cleanValue);
                  }
                case 'change':
                  if (!tokenPrice?.change24h) return false;
                  if (cleanValue.startsWith('>')) {
                    return tokenPrice.change24h > parseFloat(cleanValue.substring(1));
                  } else if (cleanValue.startsWith('<')) {
                    return tokenPrice.change24h < parseFloat(cleanValue.substring(1));
                  } else {
                    return tokenPrice.change24h.toString().includes(cleanValue);
                  }
                case 'exchange':
                  const tokenExchanges = [
                    ...(token.exchangeData?.exchanges || []),
                    ...(token.exchanges || [])
                  ].map(e => e.toLowerCase());
                  return tokenExchanges.some(exchange => exchange.includes(cleanValue));
                case 'status':
                  const status = tokenPrice?.exchanges?.mexc?.status?.toLowerCase() || '';
                  return status.includes(cleanValue);
                case 'volume':
                  if (!tokenPrice?.exchanges?.mexc?.volume24h) return false;
                  if (cleanValue.startsWith('>')) {
                    return tokenPrice.exchanges.mexc.volume24h > parseFloat(cleanValue.substring(1));
                  } else if (cleanValue.startsWith('<')) {
                    return tokenPrice.exchanges.mexc.volume24h < parseFloat(cleanValue.substring(1));
                  } else {
                    return tokenPrice.exchanges.mexc.volume24h.toString().includes(cleanValue);
                  }
                case 'ath':
                  if (!token.allTimeHigh) return false;
                  if (cleanValue.startsWith('>')) {
                    return token.allTimeHigh > parseFloat(cleanValue.substring(1));
                  } else if (cleanValue.startsWith('<')) {
                    return token.allTimeHigh < parseFloat(cleanValue.substring(1));
                  } else {
                    return token.allTimeHigh.toString().includes(cleanValue);
                  }
                default:
                  // Fallback to general search
                  break;
              }
            }
            
            // General search across all fields
            const searchableText = [
              token.symbol,
              token.name,
              ...(token.exchangeData?.exchanges || []),
              ...(token.exchanges || []),
              tokenPrice?.exchanges?.mexc?.status || '',
              tokenPrice?.averagePrice?.toString() || '',
              token.allTimeHigh?.toString() || '',
              token.allTimeLow?.toString() || ''
            ].join(' ').toLowerCase();
            
            // Handle quoted exact matches
            if (searchTerm.startsWith('"') && searchTerm.endsWith('"')) {
              const exactTerm = searchTerm.slice(1, -1);
              return searchableText.includes(exactTerm);
            }
            
            // Handle multiple terms (space-separated OR logic)
            const terms = searchTerm.split(/\s+/).filter(term => term.length > 0);
            return terms.some(term => searchableText.includes(term));
          };
          
          if (!evaluateSearchQuery(token, searchQuery)) {
            return false;
          }
        }
      }
      
      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = Date.now();
        const tokenAge = now - token.added;
        
        switch (filters.dateRange) {
          case 'today':
            if (tokenAge > 86400000) return false; // 24 hours
            break;
          case '7days':
            if (tokenAge > 7 * 86400000) return false; // 7 days
            break;
          case '30days':
            if (tokenAge > 30 * 86400000) return false; // 30 days
            break;
          case '3months':
            if (tokenAge > 90 * 86400000) return false; // 90 days
            break;
          case 'custom':
            if (filters.customDateStart) {
              const startDate = new Date(filters.customDateStart).getTime();
              if (token.added < startDate) return false;
            }
            if (filters.customDateEnd) {
              const endDate = new Date(filters.customDateEnd).getTime();
              if (token.added > endDate) return false;
            }
            break;
        }
      }
      
      // Price range filter
      const tokenPrice = priceData[token.symbol];
      if (filters.priceRange?.min && tokenPrice?.averagePrice) {
        if (tokenPrice.averagePrice < parseFloat(filters.priceRange.min)) return false;
      }
      if (filters.priceRange?.max && tokenPrice?.averagePrice) {
        if (tokenPrice.averagePrice > parseFloat(filters.priceRange.max)) return false;
      }
      
      // Price change filter
      if (filters.priceChange && filters.priceChange !== 'all' && tokenPrice?.change24h !== undefined) {
        switch (filters.priceChange) {
          case 'positive':
            if (tokenPrice.change24h <= 0) return false;
            break;
          case 'negative':
            if (tokenPrice.change24h >= 0) return false;
            break;
          case 'significant':
            if (Math.abs(tokenPrice.change24h) < 5) return false;
            break;
        }
      }
      
      // Exchange count filter
      const exchangeCount = token.exchangeData?.totalExchanges || token.exchanges.length;
      if (filters.exchangeCount?.min) {
        if (exchangeCount < parseInt(filters.exchangeCount.min)) return false;
      }
      if (filters.exchangeCount?.max) {
        if (exchangeCount > parseInt(filters.exchangeCount.max)) return false;
      }
      
      // Specific exchanges filter
      if (filters.exchanges && filters.exchanges.length > 0) {
        const tokenExchanges = [
          ...(token.exchangeData?.exchanges || []),
          ...(token.exchanges || [])
        ].map(e => e.toUpperCase());
        
        const hasMatchingExchange = filters.exchanges.some((filterExchange: string) =>
          tokenExchanges.some(tokenExchange => 
            tokenExchange.includes(filterExchange.toUpperCase()) ||
            filterExchange.toUpperCase().includes(tokenExchange)
          )
        );
        
        if (!hasMatchingExchange) return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all') {
        const now = Date.now();
        const tokenAge = now - token.added;
        const hasNewExchanges = token.exchangeData?.newExchanges24h?.length > 0;
        const hasRemovedExchanges = token.exchangeData?.removedExchanges24h?.length > 0;
        
        switch (filters.status) {
          case 'new':
            if (tokenAge > 7 * 86400000) return false; // Consider new if added within 7 days
            break;
          case 'active':
            if (!hasNewExchanges && exchangeCount < 3) return false;
            break;
          case 'declining':
            if (!hasRemovedExchanges && !(tokenPrice?.change24h < -2)) return false;
            break;
        }
      }
      
      // Exchange type filter (CEX/DEX)
      if (filters.exchangeType && filters.exchangeType !== 'all') {
        const tokenExchanges = [
          ...(token.exchangeData?.exchanges || []),
          ...(token.exchanges || [])
        ];
        
        const cexExchanges = ['BINANCE', 'COINBASE', 'KRAKEN', 'MEXC', 'GATE.IO', 'KUCOIN', 'HUOBI', 'OKX', 'BYBIT'];
        const dexExchanges = ['UNISWAP', 'SUSHISWAP', 'PANCAKESWAP', 'CURVE', 'BALANCER'];
        
        if (filters.exchangeType === 'cex') {
          const hasCex = tokenExchanges.some(exchange => 
            cexExchanges.some(cex => exchange.toUpperCase().includes(cex))
          );
          if (!hasCex) return false;
        }
        
        if (filters.exchangeType === 'dex') {
          const hasDex = tokenExchanges.some(exchange => 
            dexExchanges.some(dex => exchange.toUpperCase().includes(dex))
          );
          if (!hasDex) return false;
        }
      }
      
      return true;
    });
  }, [tokens, filters, priceData]);
  
  // Handle add token with proper error handling
  const handleAddToken = async (tokenData: any) => {
    try {
      await addToken(tokenData);
      setShowAddToken(false);
    } catch (error) {
      console.error('Failed to add token:', error);
    }
  };

  const handleTrackPerformance = (token: Token) => {
    setTrackingToken(token);
    setActiveTab('growth');
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(240,185,11,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(240,185,11,0.02)_49%,rgba(240,185,11,0.02)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
      
      <div className="relative z-10">
      <Header 
        onAddToken={() => setShowAddToken(true)}
        connectionStatus={isConnected}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
        <main className="container mx-auto px-4 py-8 space-y-8">
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
            <LayoutControls 
              onLayoutChange={setLayoutConfig}
              totalColumns={23}
              visibleColumns={layoutConfig ? layoutConfig.columns.filter((col: any) => col.visible).length : 23}
            />
            
            <CompactTokenFilters 
              onFiltersChange={setFilters}
              totalResults={tokens.length}
              filteredResults={filteredTokens.length}
              isLoading={loading}
              tokens={tokens}
              priceData={priceData}
            />
            
            <TokenTable 
              tokens={filteredTokens}
              priceData={priceData}
              layoutConfig={layoutConfig}
              onTrackPerformance={handleTrackPerformance}
            />
          </div>
        )}
        
        {activeTab === 'management' && (
            <div className="animate-slide-up">
              <TokenManagement 
                tokens={tokens}
                onAddToken={handleAddToken}
                onRemoveToken={removeToken}
              />
            </div>
        )}
        
          {activeTab === 'growth' && (
            <div className="animate-slide-up">
              <TokenGrowthAnalysis selectedToken={trackingToken} />
            </div>
          )}
        
          {activeTab === 'alerts' && (
            <div className="animate-slide-up">
              <AlertPanel />
            </div>
          )}
        
          {activeTab === 'scraping' && (
            <div className="animate-slide-up">
              <ScrapingControl />
            </div>
          )}
      </main>
      </div>
      
      {showAddToken && (
        <AddTokenModal 
          onClose={() => setShowAddToken(false)}
          onAdd={handleAddToken}
          tokens={tokens}
          onRemoveToken={removeToken}
        />
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E2329',
            color: '#FAFAFA',
            border: '1px solid #2B3139',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#02C076',
              secondary: '#FAFAFA',
            },
          },
          error: {
            iconTheme: {
              primary: '#F84960',
              secondary: '#FAFAFA',
            },
          },
        }}
      />
    </div>
  );
}

export default App