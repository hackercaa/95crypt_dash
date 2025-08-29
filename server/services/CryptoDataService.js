@@ .. @@
 export class CryptoDataService {
   constructor() {
     this.priceCache = new Map();
     this.cacheTimeout = 30000; // 30 seconds
     this.mexcBaseUrl = 'https://api.mexc.com/api/v3';
+    this.gateioBaseUrl = 'https://api.gateio.ws/api/v4';
     this.rateLimitDelay = 250; // 250ms delay between requests to respect rate limits
+    this.apiKeys = null; // Will be set by server when available
+  }
+
+  // Method to set API keys from server
+  setApiKeys(apiKeys) {
+    this.apiKeys = apiKeys;
+  }
+
+  // Helper method to get authentication headers for MEXC
+  getMexcAuthHeaders() {
+    if (!this.apiKeys?.mexc?.apiKey) return {};
+    
+    // For MEXC, we typically only need the API key in headers for public endpoints
+    // For private endpoints, we'd need to implement request signing
+    return {
+      'X-MEXC-APIKEY': this.apiKeys.mexc.apiKey
+    };
+  }
+
+  // Helper method to get authentication headers for Gate.io
+  getGateioAuthHeaders() {
+    if (!this.apiKeys?.gateio?.apiKey) return {};
+    
+    // For Gate.io, implement proper authentication
+    return {
+      'Accept': 'application/json',
+      'Content-Type': 'application/json'
+    };
+  }
+
+  // Enhanced error handling for API responses
+  handleApiError(error, exchange, endpoint) {
+    const errorInfo = {
+      exchange,
+      endpoint,
+      timestamp: Date.now(),
+      message: error.message
+    };
+
+    if (error.response) {
+      errorInfo.status = error.response.status;
+      errorInfo.statusText = error.response.statusText;
+      
+      // Handle specific API error codes
+      switch (error.response.status) {
+        case 401:
+          errorInfo.type = 'INVALID_CREDENTIALS';
+          errorInfo.message = 'Invalid API credentials';
+          break;
+        case 403:
+          errorInfo.type = 'INSUFFICIENT_PERMISSIONS';
+          errorInfo.message = 'Insufficient API permissions';
+          break;
+        case 429:
+          errorInfo.type = 'RATE_LIMIT_EXCEEDED';
+          errorInfo.message = 'API rate limit exceeded';
+          break;
+        case 502:
+        case 503:
+        case 504:
+          errorInfo.type = 'SERVICE_UNAVAILABLE';
+          errorInfo.message = 'Exchange API temporarily unavailable';
+          break;
+        default:
+          errorInfo.type = 'API_ERROR';
+          break;
+      }
+    } else if (error.code === 'ECONNABORTED') {
+      errorInfo.type = 'TIMEOUT';
+      errorInfo.message = 'Request timeout';
+    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
+      errorInfo.type = 'NETWORK_ERROR';
+      errorInfo.message = 'Network connectivity issue';
+    }
+
+    return errorInfo;
   }

@@ .. @@
   async fetchMexcPrice(symbol) {
     try {
       // Add delay to respect rate limits
       await this.delay(this.rateLimitDelay);
       
       const mexcSymbol = this.constructMexcSymbol(symbol);
+      const authHeaders = this.getMexcAuthHeaders();
       
       // Fetch both 24hr ticker data and exchange info for trading status
       const [tickerResponse, exchangeInfoResponse] = await Promise.allSettled([
         axios.get(`${this.mexcBaseUrl}/ticker/24hr`, {
           params: { symbol: mexcSymbol },
-          timeout: 10000
+          timeout: 10000,
+          headers: authHeaders
         }),
         axios.get(`${this.mexcBaseUrl}/exchangeInfo`, {
           params: { symbol: mexcSymbol },
-          timeout: 10000
+          timeout: 10000,
+          headers: authHeaders
         })
       ]);
       
@@ .. @@
       };
     } catch (error) {
-      console.error(`MEXC API error for ${symbol}:`, error.message);
+      const errorInfo = this.handleApiError(error, 'MEXC', '/ticker/24hr');
+      console.error(`MEXC API error for ${symbol}:`, errorInfo);
       
       // Fallback to mock data if API fails
       const basePrice = this.getMockPrice(symbol);
@@ .. @@
   }

+  async fetchGateioPrice(symbol) {
+    try {
+      await this.delay(this.rateLimitDelay);
+      
+      const gateioSymbol = `${symbol.toUpperCase()}_USDT`;
+      const authHeaders = this.getGateioAuthHeaders();
+      
+      const response = await axios.get(`${this.gateioBaseUrl}/spot/tickers`, {
+        params: { currency_pair: gateioSymbol },
+        timeout: 10000,
+        headers: authHeaders
+      });
+      
+      if (response.data && response.data.length > 0) {
+        const tickerData = response.data[0];
+        return {
+          price: parseFloat(tickerData.last),
+          volume: parseFloat(tickerData.base_volume),
+          change: parseFloat(tickerData.change_percentage),
+          high24h: parseFloat(tickerData.high_24h),
+          low24h: parseFloat(tickerData.low_24h),
+          volume24h: parseFloat(tickerData.quote_volume),
+          openPrice: parseFloat(tickerData.last) - parseFloat(tickerData.change_utc0),
+          priceChange: parseFloat(tickerData.change_utc0),
+          bidPrice: parseFloat(tickerData.highest_bid),
+          askPrice: parseFloat(tickerData.lowest_ask),
+          status: 'TRADING', // Gate.io doesn't provide detailed status
+          tradingEnabled: true
+        };
+      }
+      
+      throw new Error('No ticker data received');
+    } catch (error) {
+      const errorInfo = this.handleApiError(error, 'Gate.io', '/spot/tickers');
+      console.error(`Gate.io API error for ${symbol}:`, errorInfo);
+      
+      // Enhanced mock implementation for Gate.io with more realistic data
-  async fetchGateioPrice(symbol) {
-    // Enhanced mock implementation for Gate.io with more realistic data
     return new Promise((resolve) => {
       setTimeout(() => {
         const basePrice = this.getMockPrice(symbol);
@@ .. @@
         });
       }, Math.random() * 1000);
     });
+    }
   }

@@ .. @@
   async fetchMexcKlines(symbol, startTime, endTime, interval = '1d') {
     try {
       await this.delay(this.rateLimitDelay);
       
       const mexcSymbol = this.constructMexcSymbol(symbol);
+      const authHeaders = this.getMexcAuthHeaders();
+      
       const params = {
         symbol: mexcSymbol,
         interval: interval,
         limit: 1000 // Maximum allowed by MEXC
       };

       if (startTime) params.startTime = startTime;
       if (endTime) params.endTime = endTime;

       const response = await axios.get(`${this.mexcBaseUrl}/klines`, {
         params,
-        timeout: 15000 // 15 second timeout for historical data
+        timeout: 15000, // 15 second timeout for historical data
+        headers: authHeaders
       });

       return response.data;
     } catch (error) {
-      console.error(`MEXC Klines API error for ${symbol}:`, error.message);
+      const errorInfo = this.handleApiError(error, 'MEXC', '/klines');
+      console.error(`MEXC Klines API error for ${symbol}:`, errorInfo);
       throw error;
     }
   }