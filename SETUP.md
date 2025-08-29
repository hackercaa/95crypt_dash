# 🚀 Complete Setup Guide - Crypto Exchange Dashboard

## 📋 **Prerequisites**

### **Required Software**
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 8+** (comes with Node.js)
- **Git** (for cloning repository)
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### **System Requirements**
- **RAM:** Minimum 4GB (8GB recommended for smooth operation)
- **Storage:** 1GB free space (includes dependencies and cache)
- **Internet:** Stable broadband connection for real-time data
- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 18+)

### **Optional but Recommended**
- **Code Editor:** VS Code with TypeScript and React extensions
- **API Tools:** Postman or similar for API testing
- **Exchange Accounts:** MEXC and/or Gate.io for enhanced data access

## ⚡ **Quick Start (2 Minutes)**

### **1. Clone & Install**
```bash
# Clone the repository
git clone <repository-url>
cd 95Crypt_Rese

# Install all dependencies (frontend + backend)
npm install
```

### **2. Start Development Servers**
```bash
# Start both frontend and backend simultaneously
npm run dev
```

This single command launches:
- **Frontend** (React + Vite) → `http://localhost:5173`
- **Backend** (Express + Socket.io) → `http://localhost:3001`

### **3. Access the Application**
Open your browser and navigate to: **`http://localhost:5173`**

You should see the dashboard with sample data immediately!

## 🔧 **Detailed Setup**

### **Individual Server Management**

**Frontend Only:**
```bash
npm run client
# Starts React development server on port 5173
# Hot reload enabled for instant updates
```

**Backend Only:**
```bash
npm run server  
# Starts Express server on port 3001
# Includes WebSocket server and all API endpoints
```

**Production Build:**
```bash
npm run build
# Creates optimized production build in dist/
# Ready for deployment to any static hosting service
```

### **Environment Configuration**

#### **Optional: Create .env file**
```bash
# Create .env file in project root (optional)
touch .env
```

```env
# Backend Configuration
PORT=3001
NODE_ENV=development

# API Configuration (optional)
MEXC_API_KEY=your_mexc_api_key_here
MEXC_SECRET_KEY=your_mexc_secret_key_here
GATEIO_API_KEY=your_gateio_api_key_here
GATEIO_SECRET_KEY=your_gateio_secret_key_here

# Scraping Configuration
SCRAPING_INTERVAL=300000     # 5 minutes in milliseconds
SCRAPING_ENABLED=true

# Caching Configuration  
PRICE_CACHE_TIMEOUT=30000    # 30 seconds
EXCHANGE_CACHE_TIMEOUT=300000 # 5 minutes
```

## 🔑 **API Keys Setup (Enhanced Data Access)**

### **Why Configure API Keys?**
- **Real Price Data:** Live prices instead of mock data
- **Historical Charts:** Actual price history and trends  
- **Trading Status:** Real trading pair status information
- **Better Accuracy:** Precise volume and market data
- **Rate Limit Benefits:** Higher request limits with authentication

### **🏛️ MEXC Exchange Setup**

#### **Step 1: Create MEXC Account**
1. Visit [MEXC.com](https://www.mexc.com) and sign up
2. Complete identity verification (recommended)
3. Enable 2FA for account security

#### **Step 2: Generate API Keys**
1. **Navigate to:** Account → API Management
2. **Click:** "Create API Key"
3. **Select Permissions:** 
   - ✅ **Read** (required for price data)
   - ❌ **Trade** (not needed - security best practice)
   - ❌ **Withdraw** (never enable for third-party apps)
4. **IP Restrictions:** Add your IP address for security
5. **Copy Keys:** Save API Key and Secret Key securely

#### **Step 3: Configure in Dashboard**
1. **Open Dashboard:** Navigate to Web Scraping Control → API Keys tab
2. **Enter MEXC Credentials:**
   - Paste API Key in the first field
   - Paste Secret Key in the second field
3. **Test Connection:** Click "Test Connection" button
4. **Enable API:** Toggle the "Enable API" switch
5. **Verify Status:** Green indicator shows successful connection

### **🌐 Gate.io Exchange Setup**

#### **Step 1: Create Gate.io Account**  
1. Visit [Gate.io](https://www.gate.io) and register
2. Complete KYC verification if required
3. Set up two-factor authentication

#### **Step 2: Generate API Keys**
1. **Navigate to:** Account Settings → API Keys
2. **Click:** "Create API Key" 
3. **Set Permissions:**
   - ✅ **Read Only** (sufficient for price data)
   - ❌ **Trade** (not required)
   - ❌ **Withdraw** (security risk)
4. **IP Whitelist:** Configure IP restrictions
5. **Save Credentials:** Securely store API Key and Secret

#### **Step 3: Configure in Dashboard**
1. **Access API Tab:** Web Scraping Control → API Keys
2. **Enter Gate.io Credentials:**
   - Input API Key in designated field
   - Input Secret Key in second field  
3. **Test Connection:** Verify credentials work
4. **Enable Integration:** Activate Gate.io data feed
5. **Monitor Status:** Confirm green connection indicator

### **🔒 Security Best Practices**

#### **API Key Security Checklist**
- ✅ **Read-Only Permissions:** Never grant trading or withdrawal access
- ✅ **IP Restrictions:** Whitelist only your specific IP addresses
- ✅ **Regular Rotation:** Update API keys every 3-6 months
- ✅ **Secure Storage:** Dashboard encrypts keys automatically
- ✅ **Monitor Usage:** Check exchange dashboards for unusual activity

#### **What NOT to Do**
- ❌ **Never share API keys** in public repositories or chats
- ❌ **Don't use production keys** for testing (use sandbox when available)
- ❌ **Avoid hardcoding keys** in source code files
- ❌ **Don't grant unnecessary permissions** (trading, withdrawal)

## 🎛️ **Dashboard Configuration**

### **Web Scraping Control**

#### **Tab 1: Overview**
**Global Configuration:**
- **Master Toggle:** Enable/disable all web scraping
- **Scraping Interval:** Set global interval (minimum 5 minutes recommended)
- **Status Monitoring:** View last run, next run, total scraped count
- **Data Sources:** Monitor connection status to external sources

#### **Tab 2: Token Controls**  
**Per-Token Management:**
- **Individual Toggles:** Enable/disable scraping for specific tokens
- **Priority Settings:** High/Normal/Low priority for scraping frequency
- **Search & Filter:** Find tokens by name, status, or priority
- **Bulk Actions:** Enable/disable multiple tokens at once
- **Manual Triggers:** Force immediate scraping for specific tokens

#### **Tab 3: API Keys**
**Exchange Configuration:**
- **MEXC API Setup:** Configure credentials and test connection
- **Gate.io API Setup:** Set up authentication and monitor status
- **Security Features:** Show/hide sensitive data, encryption status
- **Connection Testing:** Real-time API health checks
- **Setup Instructions:** Step-by-step guides for each exchange

### **Token Management**

#### **Adding Tokens**
**Single Token:**
1. Click "Add Token" in header or go to Management tab
2. Enter token symbol (e.g., BTC, ETH, AAVE)
3. Click "Add Token" - name and details auto-populated

**Bulk Import:**
1. Navigate to Management → Add Tokens tab
2. Choose file import (CSV/TXT) or manual entry
3. Enter multiple symbols: `BTC,ETH,SOL` or one per line
4. Click "Import Tokens" for batch addition

#### **Managing Tokens**
**Deletion Process:**
1. Navigate to Management → Manage Tokens tab
2. Click trash icon next to token
3. **Required:** Enter deletion reason (audit compliance)
4. Confirm deletion - creates audit record

**Token Organization:**
- **Search:** Find tokens by symbol or name
- **Sort:** Newest, oldest, alphabetical options
- **Filter:** By date added, exchange count, status
- **Export:** Download CSV of current token list

### **Alert Configuration**

#### **Global Alerts (Alert Panel)**
**Comprehensive Alert Types:**
- **Price Alerts:** Above/below thresholds, percentage changes
- **Volume Alerts:** Trading volume monitoring  
- **Exchange Alerts:** New listings, delistings detected
- **ATH/ATL Alerts:** Distance from historical extremes
- **Status Alerts:** Trading status changes
- **Combined Alerts:** Multiple conditions with AND/OR logic

#### **Token-Specific Alerts**
1. Click 🔔 (bell icon) next to any token in the table
2. Configure specific alert conditions for that token
3. Set custom messages and trigger conditions
4. Monitor alerts in real-time with notification system

### **Layout Customization**

#### **Smart Layout Presets**
- **📊 Essential Trading:** Core trading data only (price, status, volume)
- **📈 Price Analysis:** Focus on price movements and history
- **🏢 Exchange Tracking:** Monitor exchange listings and changes  
- **🌐 Market Overview:** Balanced view of all market data
- **⚡ Quick Monitor:** Minimal view for rapid scanning
- **🔬 Research Mode:** All historical data for deep analysis
- **📱 Mobile Friendly:** Optimized for mobile devices
- **🎛️ Full Dashboard:** Complete 23-column view

#### **Column Management**
**23 Available Columns:**
- **Basic:** Token, Info button
- **Price:** Current price, price change, open price  
- **Trading:** Status, bid/ask spread
- **Market:** 24h high/low, volume, trade count
- **Historical:** ATH, ATL, % from ATH
- **Exchange:** Count, list, new/removed exchanges, scraping data
- **System:** Date added, last updated timestamps
- **Actions:** Notes, alerts, performance tracking buttons

#### **View Customization**
- **Density Options:** Comfortable/Standard/Compact spacing
- **Display Features:** Sticky headers, zebra stripes, auto-hide on mobile
- **View Modes:** Table/Cards/Compact layouts

## 🔍 **Advanced Search & Filtering**

### **Enhanced Search Syntax**
The dashboard supports advanced search with operators and column-specific queries:

#### **Search Operators**
```
BTC | ETH                    # Find tokens containing BTC OR ETH
BTC & price:>40000          # BTC AND price above $40,000  
symbol:BTC | symbol:ETH     # Symbol is BTC OR ETH
exchange:binance & change:>5 # On Binance AND gaining 5%+
"Bitcoin"                   # Exact name match (quoted)
```

#### **Column-Specific Search**
```
symbol:BTC          # Token symbol contains BTC
name:bitcoin        # Token name contains bitcoin
price:>100          # Price greater than $100
price:<50           # Price less than $50  
price:=45.50        # Price equals $45.50
change:>5           # 24h change greater than 5%
change:<-2          # 24h change less than -2%
volume:>1000000     # 24h volume above $1M
exchange:binance    # Listed on Binance
status:trading      # Trading status is active
ath:>1000          # All-time high above $1000
```

#### **Quick Filter Pills**
Pre-configured filters for common use cases:
- **⚡ Trending:** High volume and positive changes
- **⭐ New:** Recently added tokens (last 7 days)
- **📈 Gainers:** Only positive 24h changes
- **📉 Losers:** Only negative 24h changes  
- **🏢 High Volume:** Tokens on 10+ exchanges
- **🔄 Trading Active:** Only actively trading tokens

### **Filter Categories**
- **Date Range:** All time, today, 7 days, 30 days, 3 months, custom
- **Price Change:** All, positive only, negative only, significant (±5%)
- **Trading Status:** All, active trading, halted, paused
- **New Exchanges:** All, has new listings, no new listings
- **Data Freshness:** All data, last hour, 6 hours, 24 hours

## 🛠 **Development Workflow**

### **Code Organization Standards**
```
src/components/
├── layout/          # Header, navigation, containers
├── tables/          # Data display components  
├── modals/          # Modal dialogs and overlays
├── forms/           # Input forms and controls
├── charts/          # Data visualization components
└── common/          # Reusable utility components

src/hooks/
├── useCryptoData.ts    # Data fetching and management
├── useWebSocket.ts     # Real-time communication
├── useLocalStorage.ts  # Persistent storage (future)
└── useAlerts.ts        # Alert management (future)

src/types/
├── index.ts            # Core type definitions
├── api.ts              # API request/response types
└── components.ts       # Component prop types
```

### **Development Commands**
```bash
# Development
npm run dev             # Start both servers with hot reload
npm run client          # Frontend only
npm run server          # Backend only

# Code Quality  
npm run lint            # ESLint code quality check
npm run type-check      # TypeScript validation
npm run format          # Prettier code formatting

# Build & Deploy
npm run build           # Production build
npm run preview         # Preview production build
npm run analyze         # Bundle size analysis
```

### **File Watching & Hot Reload**
- **Frontend:** Instant updates on file changes
- **Backend:** Automatic server restart via nodemon
- **TypeScript:** Real-time type checking and error display
- **CSS:** Live style updates without page refresh

## 🚨 **Comprehensive Troubleshooting**

### **🔧 Installation Issues**

#### **Node.js Version Problems**
```bash
# Check Node.js version
node --version        # Should be 18.0.0 or higher

# If version is too old:
# Download latest from https://nodejs.org
# Or use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

#### **Dependencies Won't Install**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If still failing, try:
npm install --legacy-peer-deps
```

#### **Permission Errors (macOS/Linux)**
```bash
# Fix npm permissions
sudo npm config set unsafe-perm true
npm install -g npm@latest

# Alternative: Use npm prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### **🌐 Server & Connection Issues**

#### **Port Already in Use**
```bash
# Kill processes on ports 3001 and 5173
npx kill-port 3001 5173

# Or manually find and kill processes
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Then restart
npm run dev
```

#### **WebSocket Connection Failed**
**Symptoms:** "Disconnected" status in header, no real-time updates

**Solutions:**
```bash
# 1. Verify backend is running
curl http://localhost:3001/api/health

# 2. Check firewall settings
# Windows: Allow Node.js through Windows Firewall
# macOS: System Preferences → Security → Firewall → Allow Node

# 3. Browser console check
# Open DevTools → Console → Look for WebSocket errors

# 4. Restart with clean slate
npm run dev
```

#### **CORS Errors**
**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
```javascript
// Verify CORS configuration in server/index.js
app.use(cors({
  origin: "http://localhost:5173",  // Match frontend URL
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
```

### **📊 Data & API Issues**

#### **No Price Data Loading**
**Symptoms:** "Loading..." persists, no price information displays

**Debugging Steps:**
```bash
# 1. Check API endpoints manually
curl http://localhost:3001/api/tokens/BTC/price

# 2. Verify MEXC API access
curl "https://api.mexc.com/api/v3/ticker/24hr?symbol=BTCUSDT"

# 3. Check server logs for errors
# Look for rate limiting, authentication, or network errors

# 4. Test with minimal token set
# Remove all tokens except BTC and test
```

#### **API Key Authentication Failures**
**Symptoms:** "Invalid credentials" errors, connection test failures

**Solutions:**
1. **Verify API Key Format:**
   - MEXC: Usually 32+ characters, alphanumeric
   - Gate.io: Usually 20+ characters, may include special chars

2. **Check API Permissions:**
   - Ensure "Read" permission is enabled
   - Verify IP whitelist includes your address
   - Confirm keys haven't expired

3. **Test API Keys Manually:**
```bash
# Test MEXC API directly
curl -H "X-MEXC-APIKEY: your_api_key_here" \
     "https://api.mexc.com/api/v3/account/status"

# Test Gate.io API
curl "https://api.gateio.ws/api/v4/spot/time"
```

#### **Scraping Service Issues**
**Symptoms:** "No exchange data" or "Never scraped" showing

**Solutions:**
1. **Check Web Scraping Control → Overview tab**
2. **Verify scraping is enabled** (master toggle)
3. **Check individual token toggles** in Token Controls tab
4. **Review error logs** in the Overview tab
5. **Test manual scraping** using "Scrape Now" buttons

### **🎨 Frontend Issues**

#### **Blank Page or White Screen**
**Debugging Steps:**
```bash
# 1. Check browser console for errors
# Open DevTools → Console

# 2. Verify build process
npm run build
# Should complete without errors

# 3. Clear browser cache
# Ctrl+F5 (Windows) or Cmd+Shift+R (macOS)

# 4. Try incognito/private browsing mode
```

#### **Layout or Styling Problems**
**Common Solutions:**
```bash
# 1. Verify Tailwind CSS is loading
# Check if utility classes are applying

# 2. Clear PostCSS cache
rm -rf node_modules/.cache
npm run dev

# 3. Check for CSS conflicts
# Look for custom CSS overriding Tailwind classes
```

#### **Filter or Search Not Working**
**Troubleshooting:**
1. **Test Basic Search:** Try simple terms like "BTC"
2. **Check Advanced Syntax:** Verify operator usage (`&`, `|`)  
3. **Clear All Filters:** Use "Clear All" button to reset
4. **Verify Data:** Ensure tokens have data to filter by

### **📱 Mobile & Browser Issues**

#### **Mobile Display Problems**
- **Zoom Issues:** Check viewport meta tag in index.html
- **Touch Problems:** Verify touch event handlers are working
- **Layout Breaking:** Enable "Auto-hide on Mobile" in Layout Controls
- **Performance:** Reduce visible columns on mobile devices

#### **Browser Compatibility**
**Supported Browsers:**
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+  
- ✅ Edge 90+

**Unsupported:**
- ❌ Internet Explorer (any version)
- ❌ Chrome < 90
- ❌ Mobile browsers < 2 years old

## 📈 **Performance Optimization**

### **Frontend Performance**
```bash
# Bundle Analysis
npm run analyze         # Analyze bundle size
npm run lighthouse      # Performance audit (future)

# Memory Usage
# Open DevTools → Memory tab
# Take heap snapshots to identify memory leaks
```

### **Backend Performance**
```javascript
// Monitor API Response Times
const performanceMonitor = {
  mexcAverage: '150ms',
  gateioAverage: '200ms', 
  websocketLatency: '25ms',
  cacheHitRate: '85%'
};

// Optimize Scraping Performance
const scrapingConfig = {
  concurrentRequests: 1,    # Respect rate limits
  requestDelay: 1000,       # 1 second between requests
  timeout: 10000,           # 10 second timeout
  retryAttempts: 3          # Retry failed requests
};
```

### **Memory Management**
- **Cache Cleanup:** Automatic cleanup every 60 seconds
- **WebSocket Cleanup:** Remove inactive subscriptions
- **Component Cleanup:** Proper useEffect cleanup functions
- **Event Listener Cleanup:** Remove listeners on unmount

## 🔄 **Backup & Recovery**

### **Data Backup**
```bash
# Export all tokens to CSV
# Use Management → Manage Tokens → Export button

# Backup configuration
# Copy .env file and any custom configuration

# Export alerts (manual)
# Currently stored in localStorage - copy from browser
```

### **Recovery Procedures**
```bash
# Reset to Clean State
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev

# Reset Browser Data
# Clear localStorage, cookies, and cache for localhost:5173

# Factory Reset Configuration  
# Delete .env file and restart with defaults
```

## 🚀 **Production Deployment**

### **Build Process**
```bash
# 1. Create production build
npm run build

# 2. Test production build locally  
npm run preview

# 3. Verify all features work in production mode
```

### **Environment Setup**
```bash
# Production Environment Variables
NODE_ENV=production
PORT=3001
API_TIMEOUT=15000
CACHE_TIMEOUT=60000
LOG_LEVEL=info

# Security Variables (production only)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
ALLOWED_ORIGINS=https://your-domain.com
```

### **Deployment Platforms**

#### **Static Hosting (Frontend)**
- **Vercel:** `npm run build` → drag dist/ folder
- **Netlify:** Connect GitHub → automatic deployments
- **Cloudflare Pages:** Direct upload or Git integration

#### **Server Hosting (Backend)**
- **Railway:** Direct GitHub deployment with auto-scaling
- **Heroku:** Git-based deployment with add-ons
- **DigitalOcean App Platform:** Container deployment
- **AWS/Azure/GCP:** Virtual machines or container services

### **Production Checklist**
- ✅ **Environment variables** properly configured
- ✅ **API keys** stored securely (not in code)
- ✅ **HTTPS enabled** for secure communication
- ✅ **Rate limiting** configured appropriately  
- ✅ **Error monitoring** set up for production issues
- ✅ **Database backup** strategy implemented (future)
- ✅ **Load testing** completed for expected traffic

## 📞 **Getting Help**

### **Self-Help Resources**
1. **📖 Documentation:** Check README.md, API.md, COMPONENTS.md
2. **🔍 Error Logs:** Browser console + server console
3. **⚙️ Configuration:** Verify all settings match this guide
4. **🧪 Minimal Test:** Start with basic setup to isolate issues

### **Community Support**
- **GitHub Issues:** Bug reports and feature requests
- **Discord Community:** Real-time help and discussions  
- **Documentation Wiki:** Community-maintained guides
- **Video Tutorials:** Step-by-step setup walkthroughs

### **Professional Support**
- **Technical Consulting:** Architecture and scaling guidance
- **Custom Development:** Feature development and integration
- **Training Services:** Team training for advanced usage
- **Enterprise Support:** SLA-backed support for business use

---

**🎯 Success Indicator:** After completing this setup, you should have a fully functional cryptocurrency dashboard with real-time price updates, comprehensive filtering, alert management, and either mock or real exchange data depending on your API configuration.**