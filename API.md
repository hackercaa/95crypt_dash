# 🔌 API Documentation - Crypto Exchange Dashboard

## Overview
The Crypto Exchange Dashboard provides a comprehensive REST API for managing cryptocurrency tokens, price data, alerts, and scraping operations.

**Base URL:** `http://localhost:3001`

## 🎯 Core Endpoints

### Authentication
Most endpoints are currently open for development. Production implementation should include proper authentication.

## 📊 Token Management

### Get All Tokens
```http
GET /api/tokens
```

**Description:** Retrieve all tokens in the system with their metadata.

**Response:**
```json
[
  {
    "id": "1",
    "symbol": "BTC",
    "name": "Bitcoin",
    "exchanges": ["mexc", "gateio"],
    "added": 1640995200000,
    "allTimeHigh": 69000,
    "allTimeLow": 15500,
    "athLastUpdated": 1640995200000,
    "exchangeData": {
      "totalExchanges": 15,
      "exchanges": ["Binance", "Coinbase", "Kraken"],
      "newExchanges24h": ["Gemini"],
      "removedExchanges24h": [],
      "lastUpdated": 1640995200000
    }
  }
]
```

### Add Token
```http
POST /api/tokens
Content-Type: application/json

{
  "symbol": "ETH",
  "name": "Ethereum",
  "exchanges": ["mexc", "gateio"]
}
```

**Response:**
```json
{
  "id": "2",
  "symbol": "ETH",
  "name": "Ethereum",
  "exchanges": ["mexc", "gateio"],
  "added": 1640995200000
}
```

### Delete Token
```http
DELETE /api/tokens/:id
Content-Type: application/json

{
  "reason": "Low trading volume",
  "deletedBy": "current_user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token deleted successfully",
  "auditRecord": {
    "tokenId": "2",
    "reason": "Low trading volume",
    "deletedBy": "current_user",
    "deletedAt": 1640995200000
  }
}
```

## 💰 Price Data

### Get Token Price
```http
GET /api/tokens/:symbol/price
```

**Example:** `GET /api/tokens/BTC/price`

**Response:**
```json
{
  "symbol": "BTC",
  "timestamp": 1640995200000,
  "averagePrice": 45000.50,
  "change24h": 2.5,
  "exchanges": {
    "mexc": {
      "price": 45100.00,
      "volume": 1500000,
      "change": 2.8,
      "high24h": 46000,
      "low24h": 44000,
      "volume24h": 150000000,
      "openPrice": 44500,
      "priceChange": 600,
      "count": 15420,
      "bidPrice": 45090,
      "askPrice": 45110,
      "status": "TRADING",
      "tradingEnabled": true
    },
    "gateio": {
      "price": 44900.00,
      "volume": 1200000,
      "change": 2.2
    }
  }
}
```

### Get Price History
```http
GET /api/tokens/:symbol/history?period=24h
```

**Query Parameters:**
- `period`: `1h`, `24h`, `7d` (default: `24h`)

**Response:**
```json
[
  {
    "timestamp": 1640995200000,
    "price": 45000.50,
    "volume": 1500000
  }
]
```

## 🔔 Alert Management

### Create Price Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "symbol": "BTC",
  "condition": "above",
  "targetPrice": 50000,
  "message": "BTC reached target price!"
}
```

**Response:**
```json
{
  "id": "alert_1640995200000",
  "symbol": "BTC",
  "condition": "above",
  "targetPrice": 50000,
  "message": "BTC reached target price!",
  "created": 1640995200000,
  "triggered": false
}
```

## 🕷️ Web Scraping Control

### Get Scraping Status
```http
GET /api/scraping/status
```

**Response:**
```json
{
  "enabled": true,
  "interval": 300000,
  "lastRun": 1640995200000,
  "nextRun": 1640995500000,
  "isRunning": false,
  "totalScraped": 150,
  "errors": []
}
```

### Toggle Scraping
```http
POST /api/scraping/toggle
Content-Type: application/json

{
  "enabled": false
}
```

### Update Scraping Schedule
```http
POST /api/scraping/schedule
Content-Type: application/json

{
  "interval": 600000
}
```

## 📈 Exchange Data

### Get Exchange Data Summary
```http
GET /api/exchange-data/summary
```

**Response:**
```json
{
  "totalTokens": 5,
  "totalExchanges": 75,
  "averageExchangesPerToken": 15,
  "tokensWithGrowth": 3,
  "tokensWithDecline": 1,
  "lastUpdated": 1640995200000,
  "dataFreshness": {
    "fresh": 3,
    "stale": 1,
    "outdated": 1
  }
}
```

### Get Token Exchange Data
```http
GET /api/tokens/:symbol/exchange-data
```

**Response:**
```json
{
  "symbol": "BTC",
  "exchanges": ["Binance", "Coinbase", "Kraken"],
  "exchangeCount": 15,
  "lastUpdated": 1640995200000,
  "newExchanges": ["Gemini"],
  "removedExchanges": [],
  "exchangeGrowth": "gaining"
}
```

### Refresh Exchange Data
```http
POST /api/tokens/:symbol/refresh-exchange-data
```

### Batch Refresh Exchange Data
```http
POST /api/tokens/batch-refresh-exchange-data
Content-Type: application/json

{
  "symbols": ["BTC", "ETH", "AAVE"]
}
```

## 🔑 API Key Management

### Get API Key Status
```http
GET /api/api-keys/status
```

**Response:**
```json
{
  "mexc": {
    "configured": true,
    "enabled": true,
    "keyLength": 32
  },
  "gateio": {
    "configured": false,
    "enabled": false,
    "keyLength": 0
  }
}
```

### Configure API Keys
```http
POST /api/api-keys/:exchange
Content-Type: application/json

{
  "apiKey": "your_api_key_here",
  "secretKey": "your_secret_key_here",
  "enabled": true
}
```

### Test API Connection
```http
POST /api/api-keys/:exchange/test
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ping": "success",
    "timestamp": 1640995200000
  },
  "error": null
}
```

### Delete API Keys
```http
DELETE /api/api-keys/:exchange
```

## 📡 WebSocket Events

### Client → Server Events

#### Subscribe to Token Updates
```javascript
socket.emit('subscribe_token', 'BTC');
```

#### Unsubscribe from Token Updates
```javascript
socket.emit('unsubscribe_token', 'BTC');
```

### Server → Client Events

#### Price Updates
```javascript
socket.on('price_update', (data) => {
  // data contains updated price information
  console.log(data);
});
```

**Event Data Structure:**
```json
{
  "symbol": "BTC",
  "timestamp": 1640995200000,
  "averagePrice": 45000.50,
  "change24h": 2.5,
  "exchanges": {
    "mexc": { "price": 45100, "volume": 1500000 },
    "gateio": { "price": 44900, "volume": 1200000 }
  }
}
```

## 🛡️ Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": 1640995200000,
  "path": "/api/tokens/invalid"
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **404** - Not Found
- **429** - Rate Limited
- **500** - Internal Server Error

### Common Error Types

#### Validation Errors
```json
{
  "error": "Validation failed",
  "details": {
    "symbol": "Token symbol is required",
    "targetPrice": "Must be a positive number"
  }
}
```

#### Rate Limiting
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30,
  "limit": 100,
  "remaining": 0
}
```

## 📝 Request Examples

### JavaScript/Fetch
```javascript
// Get token price
const response = await fetch('http://localhost:3001/api/tokens/BTC/price');
const priceData = await response.json();

// Add new token
const response = await fetch('http://localhost:3001/api/tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'ETH',
    name: 'Ethereum',
    exchanges: ['mexc', 'gateio']
  })
});
```

### cURL Examples
```bash
# Get all tokens
curl http://localhost:3001/api/tokens

# Add new token
curl -X POST http://localhost:3001/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ETH","name":"Ethereum","exchanges":["mexc","gateio"]}'

# Get scraping status
curl http://localhost:3001/api/scraping/status
```

## 🔍 Advanced Features

### Token Filtering
```http
GET /api/tokens/filter?exchanges=Binance,Coinbase&minExchanges=5&search=BTC
```

**Query Parameters:**
- `exchanges` - Filter by specific exchanges
- `exchangeType` - Filter by exchange type (cex, dex)
- `minExchanges` - Minimum exchange count
- `maxExchanges` - Maximum exchange count
- `search` - Text search across token data
- `sortBy` - Sort field
- `sortOrder` - Sort direction (asc, desc)

### Growth Analysis
```http
GET /api/growth-analysis
```

Returns tokens with exchange listing growth/decline analysis.

### Popularity Trends
```http
GET /api/tokens/popularity-trends?timeframe=7d
```

Returns popularity trend data for specified timeframe.

## 🚀 Production Deployment

### Environment Configuration
```bash
NODE_ENV=production
PORT=3001
# Add additional production environment variables
```

### Build Process
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm run server
```

### Security Considerations
- **Enable HTTPS** for production
- **Implement authentication** for API endpoints
- **Add request validation** and sanitization
- **Enable rate limiting** with Redis
- **Use environment variables** for sensitive config
- **Implement proper logging** and monitoring

### Performance Monitoring
- **Response time tracking**
- **Error rate monitoring**
- **API usage analytics**
- **WebSocket connection stability**
- **Cache hit rates**

## 📊 Data Sources

### External APIs Used
- **MEXC Exchange API** - Real-time price data
- **Gate.io Exchange API** - Market data and historical prices
- **CryptocurrencyAlerting.com** - Exchange listing data (web scraping)

### Data Flow
1. **Price Data:** MEXC/Gate.io APIs → Backend → WebSocket → Frontend
2. **Exchange Data:** Web Scraper → Database → REST API → Frontend
3. **Historical Data:** MEXC Klines API → Backend → REST API → Frontend

### Caching Strategy
- **Price Data:** 30-second cache for real-time balance
- **Exchange Data:** 5-minute cache for scraping results
- **Historical Data:** 1-hour cache for chart data
- **Error Responses:** No caching to ensure fresh error states

This API provides comprehensive access to all cryptocurrency dashboard functionality with proper error handling, real-time updates, and extensible architecture.