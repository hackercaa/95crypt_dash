# Crypto Token Exchange Dashboard

A comprehensive real-time cryptocurrency dashboard that aggregates data from multiple sources including web scraping and exchange APIs.

## 🚀 Features

### Core Functionality
- **Real-time Price Tracking**: Live price updates via WebSocket connections
- **Multi-Exchange Integration**: MEXC, Gate.io, and CryptocurrencyAlerting.com support
- **Interactive Price Charts**: Historical data visualization with multiple timeframes
- **Price Alerts**: Configurable notifications for price movements
- **Token Management**: Add/remove tokens with exchange selection
- **Web Scraping Control**: Granular control over data collection from external sources

### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: WebSocket-based live data streaming
- **Caching System**: Efficient API call optimization
- **Error Handling**: Comprehensive error management and user feedback
- **Data Validation**: Robust input sanitization and validation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Socket.io Client** for real-time communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **CORS** for cross-origin requests
- **Custom Services** for data aggregation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Servers**
```bash
npm run dev
```

This will start both the frontend (port 5173) and backend (port 3001) simultaneously.

### Individual Server Commands

**Frontend Only:**
```bash
npm run client
```

**Backend Only:**
```bash
npm run server
```

## 🏗 Architecture Overview

### Project Structure
```
├── server/
│   ├── index.js              # Main server file
│   └── services/
│       ├── CryptoDataService.js    # API data aggregation
│       ├── ScrapingService.js      # Web scraping management
│       ├── AlertService.js         # Price alert system
│       └── DatabaseService.js      # Data storage (mock)
├── src/
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── App.tsx              # Main application
└── README.md
```

### Service Architecture

#### CryptoDataService
- Aggregates price data from multiple exchanges
- Implements caching to respect API rate limits
- Calculates average prices and changes
- Handles API failures gracefully

#### ScrapingService
- Manages scheduled web scraping operations
- Configurable intervals and source selection
- Error logging and status reporting
- Respects ethical scraping practices

#### AlertService
- Creates and manages price alerts
- Supports multiple alert conditions
- Real-time alert triggering
- Notification system integration

## 🔌 API Documentation

### REST Endpoints

#### Token Management
```http
GET    /api/tokens           # Get all tokens
POST   /api/tokens           # Add new token
DELETE /api/tokens/:id       # Remove token
```

#### Price Data
```http
GET    /api/tokens/:symbol/price    # Current price
GET    /api/tokens/:symbol/history  # Historical data
```

#### Alert System
```http
POST   /api/alerts          # Create price alert
```

#### Scraping Control
```http
GET    /api/scraping/status      # Get scraping status
POST   /api/scraping/toggle     # Enable/disable scraping
POST   /api/scraping/schedule   # Update scraping interval
```

### WebSocket Events

#### Client → Server
- `subscribe_token`: Subscribe to token price updates
- `unsubscribe_token`: Unsubscribe from token updates

#### Server → Client
- `price_update`: Real-time price data

## 🎨 UI Components

### Dashboard Layout
- **Header**: Navigation, connection status, add token button
- **Token Grid**: Card-based token display with real-time prices
- **Price Charts**: Interactive historical price visualization
- **Alert Panel**: Price alert management interface
- **Scraping Control**: Web scraping configuration and monitoring

### Design System
- **Color Palette**: Dark theme with blue/purple gradients
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: 8px grid system for consistent alignment
- **Animations**: Subtle hover effects and loading states

## ⚡ Performance Optimization

### Caching Strategy
- **Price Data**: 30-second cache for API responses
- **Historical Data**: Longer cache for chart data
- **Error Handling**: Graceful fallback for failed requests

### Rate Limit Management
- **API Calls**: Intelligent request spacing
- **WebSocket**: Efficient real-time update distribution
- **Scraping**: Configurable intervals with ethical defaults

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                    # Server port
NODE_ENV=development         # Environment mode
```

### Scraping Configuration
- **Default Interval**: 5 minutes
- **Sources**: CryptocurrencyAlerting.com, MEXC, Gate.io
- **Error Retry**: Automatic retry with exponential backoff

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Support (Future Enhancement)
```dockerfile
# Dockerfile structure for containerized deployment
FROM node:18-alpine
# ... configuration
```

### Environment-Specific Configurations
- Development: Mock data, verbose logging
- Production: Real API endpoints, optimized caching

## 🔒 Security & Ethics

### Web Scraping Ethics
- Respects robots.txt directives
- Reasonable request intervals (5+ minutes default)
- Error handling to prevent excessive requests
- User-configurable scraping controls

### Data Security
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Error message sanitization to prevent information leakage

## 🐛 Error Handling

### Frontend Error Boundaries
- Component-level error catching
- User-friendly error messages
- Graceful degradation for failed features

### Backend Error Management
- Comprehensive API error responses
- Logging system for debugging
- Rate limit protection

## 📈 Monitoring & Analytics

### Real-time Status
- Connection status indicators
- Scraping operation monitoring
- API health checks
- Error rate tracking

### Performance Metrics
- Response time monitoring
- Cache hit rates
- WebSocket connection stability

## 🔮 Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL/MongoDB for data persistence
- **User Authentication**: Multi-user support with personal dashboards
- **Advanced Analytics**: Portfolio tracking and performance metrics
- **Mobile App**: React Native companion application
- **AI Predictions**: Machine learning price forecasting
- **Social Features**: Community alerts and token discussions

### Technical Improvements
- **Microservices**: Service separation for scalability
- **Kubernetes**: Container orchestration for production
- **Redis**: Advanced caching and session management
- **GraphQL**: More efficient data fetching
- **PWA**: Offline capability and push notifications

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes with proper testing
4. Submit pull request with detailed description

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent file organization
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **CryptocurrencyAlerting.com** for token data
- **MEXC Exchange** for trading data
- **Gate.io Exchange** for market information
- **React Community** for excellent tooling
- **Open Source Contributors** for foundational libraries

---

**Built with ❤️ for the crypto community**