export class DatabaseService {
  constructor() {
    // Mock in-memory database
    this.tokens = new Map([
      ['BTC', { 
        id: '1', 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        exchanges: ['mexc', 'gateio'], 
        added: Date.now(),
        allTimeHigh: 69000,
        allTimeLow: 15500,
        athLastUpdated: Date.now() - 86400000,
        exchangeData: {
          totalExchanges: 15,
          exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'Gate.io', 'KuCoin', 'Huobi', 'OKX', 'Bybit', 'Bitfinex', 'Crypto.com', 'Gemini', 'Bitstamp', 'Bittrex', 'Poloniex'],
          newExchanges24h: ['Gemini', 'Bitstamp'],
          removedExchanges24h: [],
          exchangeChange24h: 2,
          lastUpdated: Date.now() - 1800000, // 30 minutes ago
          dataSource: 'scraper'
        }
      }],
      ['ETH', { 
        id: '2', 
        symbol: 'ETH', 
        name: 'Ethereum', 
        exchanges: ['mexc', 'gateio'], 
        added: Date.now(),
        allTimeHigh: 4878,
        allTimeLow: 82,
        athLastUpdated: Date.now() - 86400000,
        exchangeData: {
          totalExchanges: 12,
          exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'Gate.io', 'KuCoin', 'Huobi', 'OKX', 'Bybit', 'Bitfinex', 'Crypto.com', 'Gemini'],
          newExchanges24h: ['Crypto.com'],
          removedExchanges24h: ['Bittrex'],
          exchangeChange24h: 0,
          lastUpdated: Date.now() - 3600000, // 1 hour ago
          dataSource: 'scraper'
        }
      }],
      ['AIPUMP', { 
        id: '3', 
        symbol: 'AIPUMP', 
        name: 'AI Pump', 
        exchanges: ['mexc'], 
        added: Date.now(),
        allTimeHigh: 0.0025,
        allTimeLow: 0.0001,
        athLastUpdated: Date.now() - 86400000,
        exchangeData: {
          totalExchanges: 3,
          exchanges: ['MEXC', 'Gate.io', 'KuCoin'],
          newExchanges24h: ['Gate.io', 'KuCoin'],
          removedExchanges24h: [],
          exchangeChange24h: 2,
          lastUpdated: Date.now() - 900000, // 15 minutes ago
          dataSource: 'scraper'
        }
      }]
    ]);
  }

  async getAllTokens() {
    return Array.from(this.tokens.values());
  }

  async addToken(tokenData) {
    const id = Date.now().toString();
    const token = {
      id,
      ...tokenData,
      added: Date.now(),
      allTimeHigh: null,
      allTimeLow: null,
      athLastUpdated: null
    };
    
    this.tokens.set(tokenData.symbol, token);
    return token;
  }

  async deleteToken(id) {
    for (const [symbol, token] of this.tokens) {
      if (token.id === id) {
        this.tokens.delete(symbol);
        return true;
      }
    }
    return false;
  }

  async getToken(symbol) {
    return this.tokens.get(symbol);
  }

  async updateTokenExchangeData(symbol, exchangeData) {
    const token = this.tokens.get(symbol);
    if (token) {
      token.exchangeData = exchangeData;
      token.lastExchangeUpdate = Date.now();
      return token;
    }
    return null;
  }

  async getTokensWithExchangeData() {
    return Array.from(this.tokens.values()).filter(token => token.exchangeData);
  }

  async updateTokenExchangeHistory(symbol, exchangeData) {
    const token = this.tokens.get(symbol);
    if (token) {
      if (!token.exchangeHistory) {
        token.exchangeHistory = [];
      }
      
      // Keep last 30 days of history
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      token.exchangeHistory = token.exchangeHistory.filter(
        entry => entry.timestamp > thirtyDaysAgo
      );
      
      // Add new entry
      token.exchangeHistory.push({
        timestamp: Date.now(),
        totalExchanges: exchangeData.totalExchanges,
        exchanges: [...exchangeData.exchanges],
        newExchanges: [...(exchangeData.newExchanges24h || [])],
        removedExchanges: [...(exchangeData.removedExchanges24h || [])]
      });
      
      return token;
    }
    return null;
  }

  async updateTokenAthAtl(symbol, ath, atl, athLastUpdated) {
    const token = this.tokens.get(symbol);
    if (token) {
      token.allTimeHigh = ath;
      token.allTimeLow = atl;
      token.athLastUpdated = athLastUpdated;
      return token;
    }
    return null;
  }
}