import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { CryptoDataService } from './services/CryptoDataService.js';
import { ScrapingService } from './services/ScrapingService.js';
import { AlertService } from './services/AlertService.js';
import { DatabaseService } from './services/DatabaseService.js';
import { ExchangeDataService } from './services/ExchangeDataService.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Services initialization
const dbService = new DatabaseService();
const cryptoService = new CryptoDataService();
const scrapingService = new ScrapingService();
const alertService = new AlertService();
const exchangeDataService = new ExchangeDataService();

// Store connected clients for WebSocket
const connectedClients = new Set();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Crypto Exchange Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      tokens: '/api/tokens',
      alerts: '/api/alerts',
      scraping: '/api/scraping'
    }
  });
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/exchange-data/summary', async (req, res) => {
  try {
    const tokens = await dbService.getTokensWithExchangeData();
    const summary = exchangeDataService.getExchangeDataSummary(tokens);
    res.json(summary);
  } catch (error) {
    console.error('Error getting exchange data summary:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await dbService.getAllTokens();
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens', async (req, res) => {
  try {
    if (!req.body.symbol) {
      return res.status(400).json({ error: 'Token symbol is required' });
    }
    
    const { symbol, name, exchanges } = req.body;
    const token = await dbService.addToken({ symbol, name, exchanges });
    
    // Calculate ATH/ATL for newly added token (async, don't wait)
    cryptoService.calculateAndStoreAllTimeHighLow(symbol, dbService)
      .catch(error => console.error(`Failed to calculate ATH/ATL for new token ${symbol}:`, error.message));
    
    res.json(token);
  } catch (error) {
    console.error('Error adding token:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const { reason, deletedBy } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Deletion reason is required' });
    }
    
    // In a real implementation, you would:
    // 1. Get the token details before deletion
    // 2. Store the deletion record in a separate audit table
    // 3. Then delete the token
    
    const deleted = await dbService.deleteToken(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    // Create audit record (in real app, this would be stored in database)
    const auditRecord = {
      tokenId: req.params.id,
      reason: reason.trim(),
      deletedBy: deletedBy || 'unknown',
      deletedAt: Date.now()
    };
    
    res.json({ 
      success: true, 
      message: 'Token deleted successfully',
      auditRecord 
    });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/:symbol/price', async (req, res) => {
  try {
    if (!req.params.symbol) {
      return res.status(400).json({ error: 'Token symbol is required' });
    }
    
    const priceData = await cryptoService.getTokenPrice(req.params.symbol);
    res.json(priceData);
  } catch (error) {
    console.error('Error fetching price data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/:symbol/history', async (req, res) => {
  try {
    if (!req.params.symbol) {
      return res.status(400).json({ error: 'Token symbol is required' });
    }
    
    const { period = '24h' } = req.query;
    const history = await cryptoService.getPriceHistory(req.params.symbol, period);
    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    if (!req.body.symbol || !req.body.condition) {
      return res.status(400).json({ error: 'Symbol and condition are required' });
    }
    
    const alert = await alertService.createAlert(req.body);
    res.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tokens/:symbol/exchange-data', async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchangeData = await exchangeDataService.processExchangeData(symbol, dbService);
    res.json(exchangeData);
  } catch (error) {
    console.error('Error fetching exchange data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/:symbol/refresh-exchange-data', async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchangeData = await exchangeDataService.processExchangeData(symbol, dbService);
    res.json({ success: true, data: exchangeData });
  } catch (error) {
    console.error('Error refreshing exchange data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/batch-refresh-exchange-data', async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const results = await exchangeDataService.batchProcessTokens(symbols, dbService);
    res.json(results);
  } catch (error) {
    console.error('Error batch refreshing exchange data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Token Growth Analysis endpoints
app.get('/api/growth-analysis', async (req, res) => {
  try {
    // Mock growth analysis data
    const growthData = [
      {
        id: '1',
        symbol: 'AAVE',
        name: 'Aave',
        currentExchangeCount: 41,
        previousExchangeCount: 0,
        exchangeChange: 41,
        percentageChange: 100,
        currentPrice: 95.42,
        exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'Gate.io', 'KuCoin', 'Huobi', 'OKX'],
        newExchanges: ['Binance', 'Coinbase', 'Kraken'],
        removedExchanges: [],
        dataPoints: 2,
        lastUpdated: Date.now() - 3600000,
        dateAdded: Date.now() - 86400000 * 7
      },
      {
        id: '2',
        symbol: 'UNI',
        name: 'Uniswap',
        currentExchangeCount: 35,
        previousExchangeCount: 28,
        exchangeChange: 7,
        percentageChange: 25,
        currentPrice: 8.75,
        exchanges: ['Binance', 'Coinbase', 'MEXC', 'Gate.io', 'KuCoin'],
        newExchanges: ['MEXC', 'Gate.io'],
        removedExchanges: [],
        dataPoints: 5,
        lastUpdated: Date.now() - 1800000,
        dateAdded: Date.now() - 86400000 * 14
      },
      {
        id: '3',
        symbol: 'BTC',
        name: 'Bitcoin',
        currentExchangeCount: 2,
        previousExchangeCount: 25,
        exchangeChange: -23,
        percentageChange: -92,
        currentPrice: 45000,
        exchanges: ['MEXC', 'Gate.io'],
        newExchanges: [],
        removedExchanges: ['Binance', 'Coinbase', 'Kraken', 'KuCoin'],
        dataPoints: 9,
        lastUpdated: Date.now() - 900000,
        dateAdded: Date.now() - 86400000 * 30
      }
    ];
    
    res.json(growthData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced filtering endpoints
app.get('/api/tokens/filter', async (req, res) => {
  try {
    const {
      exchanges,
      exchangeType,
      recentlyListed,
      listingTrend,
      minExchanges,
      maxExchanges,
      popularityTrend,
      popularityTimeframe,
      minPopularityScore,
      search,
      sortBy,
      sortOrder,
      exchangeGrowth
    } = req.query;

    // Mock filtered token data with analytics
    const filteredTokens = [
      {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: 45000,
        exchangeCount: 25,
        exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'Gate.io'],
        popularityScore: 95,
        popularityTrend: 'stable',
        volumeChange24h: 2.5,
        socialMentions: 15420,
        searchInterest: 88,
        dateAdded: Date.now() - 86400000 * 365,
        lastUpdated: Date.now() - 300000,
        newExchanges: [],
        removedExchanges: [],
        exchangeGrowth: 'stable',
        listingHistory: [
          { exchange: 'Binance', action: 'listed', date: Date.now() - 86400000 * 300 },
          { exchange: 'Coinbase', action: 'listed', date: Date.now() - 86400000 * 250 }
        ]
      },
      {
        id: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        currentPrice: 3200,
        exchangeCount: 22,
        exchanges: ['Binance', 'Coinbase', 'Kraken', 'MEXC'],
        popularityScore: 92,
        popularityTrend: 'gaining',
        volumeChange24h: -1.2,
        socialMentions: 12850,
        searchInterest: 85,
        dateAdded: Date.now() - 86400000 * 300,
        lastUpdated: Date.now() - 180000,
        newExchanges: ['Gate.io', 'KuCoin'],
        removedExchanges: [],
        exchangeGrowth: 'gaining',
        listingHistory: [
          { exchange: 'Binance', action: 'listed', date: Date.now() - 86400000 * 280 },
          { exchange: 'Coinbase', action: 'listed', date: Date.now() - 86400000 * 200 }
        ]
      },
      {
        id: '3',
        symbol: 'AAVE',
        name: 'Aave',
        currentPrice: 95.42,
        exchangeCount: 15,
        exchanges: ['Binance', 'MEXC', 'Gate.io'],
        popularityScore: 78,
        popularityTrend: 'gaining',
        volumeChange24h: 8.5,
        socialMentions: 3420,
        searchInterest: 65,
        dateAdded: Date.now() - 86400000 * 7,
        lastUpdated: Date.now() - 120000,
        newExchanges: ['Binance', 'MEXC'],
        removedExchanges: [],
        exchangeGrowth: 'gaining',
        listingHistory: [
          { exchange: 'Binance', action: 'listed', date: Date.now() - 86400000 * 5 },
          { exchange: 'MEXC', action: 'listed', date: Date.now() - 86400000 * 3 }
        ]
      },
      {
        id: '4',
        symbol: 'LINK',
        name: 'Chainlink',
        currentPrice: 14.25,
        exchangeCount: 15,
        exchanges: ['Binance', 'Coinbase', 'MEXC'],
        popularityScore: 72,
        popularityTrend: 'losing',
        volumeChange24h: -3.2,
        socialMentions: 2850,
        searchInterest: 58,
        dateAdded: Date.now() - 86400000 * 21,
        lastUpdated: Date.now() - 240000,
        newExchanges: [],
        removedExchanges: ['Huobi', 'OKX'],
        exchangeGrowth: 'losing',
        listingHistory: [
          { exchange: 'Huobi', action: 'delisted', date: Date.now() - 86400000 * 2 },
          { exchange: 'OKX', action: 'delisted', date: Date.now() - 86400000 * 1 }
        ]
      }
    ];

    res.json({
      tokens: filteredTokens,
      totalCount: filteredTokens.length,
      filters: req.query
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange listings endpoint
app.get('/api/exchanges', (req, res) => {
  const exchanges = {
    cex: [
      'Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Huobi', 'OKX', 'Gate.io', 'MEXC',
      'Bybit', 'Bitfinex', 'Crypto.com', 'FTX', 'Gemini', 'Bitstamp'
    ],
    dex: [
      'Uniswap', 'SushiSwap', 'PancakeSwap', 'Curve', 'Balancer', '1inch',
      'dYdX', 'Compound', 'Aave', 'MakerDAO', 'Yearn Finance'
    ]
  };
  
  res.json(exchanges);
});

// Popularity trends endpoint
app.get('/api/tokens/popularity-trends', (req, res) => {
  const { timeframe = '7d' } = req.query;
  
  const trends = [
    { symbol: 'BTC', trend: 'stable', score: 95, change: 0.2 },
    { symbol: 'ETH', trend: 'gaining', score: 92, change: 5.8 },
    { symbol: 'AAVE', trend: 'gaining', score: 78, change: 12.5 },
    { symbol: 'UNI', trend: 'losing', score: 65, change: -3.2 },
    { symbol: 'LINK', trend: 'stable', score: 72, change: 0.8 }
  ];
  
  res.json({ timeframe, trends });
});

app.get('/api/scraping/status', (req, res) => {
  res.json(scrapingService.getStatus());
});

app.post('/api/scraping/toggle', (req, res) => {
  const { enabled } = req.body;
  scrapingService.setEnabled(enabled);
  res.json({ success: true, enabled });
});

app.post('/api/scraping/schedule', (req, res) => {
  const { interval } = req.body;
  scrapingService.setSchedule(interval);
  res.json({ success: true, interval });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket);

  socket.on('subscribe_token', (symbol) => {
    if (!symbol || typeof symbol !== 'string') {
      socket.emit('error', { message: 'Invalid token symbol' });
      return;
    }
    socket.join(`token_${symbol}`);
    console.log(`Client ${socket.id} subscribed to ${symbol}`);
  });

  socket.on('unsubscribe_token', (symbol) => {
    if (!symbol || typeof symbol !== 'string') {
      socket.emit('error', { message: 'Invalid token symbol' });
      return;
    }
    socket.leave(`token_${symbol}`);
    console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Real-time price updates
setInterval(async () => {
  try {
    if (connectedClients.size === 0) {
      return; // Skip if no clients connected
    }
    
    const tokens = await dbService.getAllTokens();
    for (const token of tokens) {
      try {
        const priceData = await cryptoService.getTokenPrice(token.symbol);
        io.to(`token_${token.symbol}`).emit('price_update', {
          symbol: token.symbol,
          ...priceData
        });
      } catch (tokenError) {
        console.error(`Error updating price for ${token.symbol}:`, tokenError);
      }
    }
  } catch (error) {
    console.error('Error broadcasting price updates:', error);
  }
}, 5000); // Update every 5 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start scraping service
scrapingService.start();

// Start exchange data refresh job (every 6 hours)
setInterval(async () => {
  try {
    console.log('Starting scheduled exchange data refresh...');
    const tokens = await dbService.getAllTokens();
    const symbols = tokens.map(token => token.symbol);
    
    if (symbols.length > 0) {
      const results = await exchangeDataService.batchProcessTokens(symbols, dbService);
      console.log(`Exchange data refresh completed: ${results.successful.length} successful, ${results.failed.length} failed`);
    }
  } catch (error) {
    console.error('Scheduled exchange data refresh failed:', error);
  }
}, 6 * 60 * 60 * 1000); // 6 hours

// Start ATH/ATL refresh job (every 24 hours)
setInterval(async () => {
  try {
    console.log('Starting scheduled ATH/ATL refresh...');
    const tokens = await dbService.getAllTokens();
    
    for (const token of tokens) {
      try {
        await cryptoService.calculateAndStoreAllTimeHighLow(token.symbol, dbService);
        // Add delay between tokens to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to refresh ATH/ATL for ${token.symbol}:`, error.message);
      }
    }
    
    console.log('ATH/ATL refresh completed');
  } catch (error) {
    console.error('Scheduled ATH/ATL refresh failed:', error);
  }
}, 24 * 60 * 60 * 1000); // 24 hours

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});