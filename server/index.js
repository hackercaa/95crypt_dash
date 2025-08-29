// Services initialization
const dbService = new DatabaseService();
const cryptoService = new CryptoDataService();
const scrapingService = new ScrapingService();
const alertService = new AlertService();
const exchangeDataService = new ExchangeDataService();

// API Keys storage (in production, use proper database)
let exchangeApiKeys = {
  mexc: { apiKey: null, secretKey: null, enabled: false },
  gateio: { apiKey: null, secretKey: null, enabled: false }
};

// Store connected clients for WebSocket

app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const { reason, deletedBy } = req.body || {};
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Deletion reason is required' });
    }
  }
});

// API Key Management Routes
app.get('/api/api-keys/status', (req, res) => {
  // Return API key status without exposing actual keys
  const status = {};
  Object.keys(exchangeApiKeys).forEach(exchange => {
    status[exchange] = {
      configured: !!exchangeApiKeys[exchange].apiKey,
      enabled: exchangeApiKeys[exchange].enabled,
      keyLength: exchangeApiKeys[exchange].apiKey ? exchangeApiKeys[exchange].apiKey.length : 0
    };
  });
  res.json(status);
});

app.post('/api/api-keys/:exchange', (req, res) => {
  const { exchange } = req.params;
  const { apiKey, secretKey, enabled } = req.body;
  
  if (!['mexc', 'gateio'].includes(exchange)) {
    return res.status(400).json({ error: 'Invalid exchange' });
  }
  
  if (!apiKey || !secretKey) {
    return res.status(400).json({ error: 'API key and secret key are required' });
  }
  
  // Store API keys (in production, encrypt these)
  exchangeApiKeys[exchange] = {
    apiKey: apiKey.trim(),
    secretKey: secretKey.trim(),
    enabled: enabled || false
  };
  
  // Update crypto service with new API keys
  cryptoService.setApiKeys(exchangeApiKeys);
  
  res.json({ 
    success: true, 
    message: `${exchange.toUpperCase()} API keys updated successfully` 
  });
});

app.post('/api/api-keys/:exchange/test', async (req, res) => {
  const { exchange } = req.params;
  
  if (!exchangeApiKeys[exchange] || !exchangeApiKeys[exchange].apiKey) {
    return res.status(400).json({ error: 'API keys not configured for this exchange' });
  }
  
  try {
    // Test API connection based on exchange
    let testResult = { success: false, error: null, data: null };
    
    if (exchange === 'mexc') {
      // Test MEXC API connection
      try {
        const response = await axios.get('https://api.mexc.com/api/v3/ping', {
          headers: {
            'X-MEXC-APIKEY': exchangeApiKeys[exchange].apiKey
          },
          timeout: 10000
        });
        testResult.success = true;
        testResult.data = { ping: 'success', timestamp: Date.now() };
      } catch (error) {
        testResult.error = error.response?.data?.msg || error.message;
      }
    } else if (exchange === 'gateio') {
      // Test Gate.io API connection
      try {
        const response = await axios.get('https://api.gateio.ws/api/v4/spot/time', {
          timeout: 10000
        });
        testResult.success = true;
        testResult.data = { time: response.data.server_time };
      } catch (error) {
        testResult.error = error.response?.data?.message || error.message;
      }
    }
    
    res.json(testResult);
  } catch (error) {
    console.error(`Error testing ${exchange} API:`, error);
    res.status(500).json({ error: 'API test failed' });
  }
});

app.delete('/api/api-keys/:exchange', (req, res) => {
  const { exchange } = req.params;
  
  if (!['mexc', 'gateio'].includes(exchange)) {
    return res.status(400).json({ error: 'Invalid exchange' });
  }
  
  // Clear API keys for the exchange
  exchangeApiKeys[exchange] = {
    apiKey: null,
    secretKey: null,
    enabled: false
  };
  
  // Update crypto service
  cryptoService.setApiKeys(exchangeApiKeys);
  
  res.json({ 
    success: true, 
    message: `${exchange.toUpperCase()} API keys cleared successfully` 
  });
});

// WebSocket connection handling

// Start scraping service
scrapingService.start();

// Set initial API keys in crypto service
cryptoService.setApiKeys(exchangeApiKeys);

// Start exchange data refresh job (every 6 hours)