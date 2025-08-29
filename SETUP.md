# 🚀 Setup Guide - Crypto Exchange Dashboard

## Prerequisites

### Required Software
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning repository)

### System Requirements
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** 500MB free space
- **Internet:** Stable connection for real-time data
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd 95Crypt_Rese
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required dependencies for both frontend and backend.

### 3. Start Development Servers
```bash
npm run dev
```

This single command starts:
- **Frontend** (React + Vite) on port 5173
- **Backend** (Express + Socket.io) on port 3001

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory (optional):
```bash
PORT=3001
NODE_ENV=development
```

### API Keys Setup (Optional)
For enhanced data access, configure exchange API keys:

1. **Navigate to Web Scraping Control → API Keys tab**
2. **For MEXC Exchange:**
   - Visit [MEXC API Management](https://www.mexc.com/user/openapi)
   - Create API key with "Read" permissions only
   - Copy API Key and Secret Key to the interface

3. **For Gate.io Exchange:**
   - Visit [Gate.io API Management](https://www.gate.io/myaccount/apiv4keys)
   - Create API key with "Read Only" permissions
   - Copy API Key and Secret Key to the interface

4. **Test connections** using the built-in test buttons

## 🛠 Development

### Individual Server Commands

**Start Frontend Only:**
```bash
npm run client
```

**Start Backend Only:**
```bash
npm run server
```

### Project Structure
```
95Crypt_Rese/
├── server/                 # Backend services
│   ├── index.js           # Main server file
│   └── services/          # Business logic services
├── src/                   # Frontend React application
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript definitions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start both servers simultaneously
- `npm run client` - Start frontend development server
- `npm run server` - Start backend API server  
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on ports 3001 and 5173
npx kill-port 3001 5173
npm run dev
```

**Dependencies Not Installing:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**WebSocket Connection Issues:**
- Ensure backend server is running on port 3001
- Check browser console for connection errors
- Verify no firewall blocking WebSocket connections

**API Rate Limiting:**
- Default intervals respect exchange rate limits
- Increase scraping intervals if needed
- Monitor API usage in exchange dashboards

### Development Tips

**Hot Reload Issues:**
```bash
# Restart development servers
Ctrl+C (stop current process)
npm run dev
```

**Browser Cache Problems:**
- Use Ctrl+F5 for hard refresh
- Open Developer Tools → Network tab → Disable cache
- Clear browser data for localhost

**Console Errors:**
- Check browser console for JavaScript errors
- Monitor server console for backend errors
- Verify all services are properly initialized

## 🔒 Security Notes

### API Key Management
- **Never commit API keys** to version control
- **Use read-only permissions** only
- **Enable IP restrictions** on exchange platforms
- **Rotate keys regularly** for enhanced security

### Data Privacy
- **All data stored locally** in browser localStorage
- **No data transmitted** to external services without consent
- **Encryption used** for sensitive data storage
- **Respect scraping ethics** with reasonable intervals

## 📊 Performance Optimization

### Backend Performance
- **Caching implemented** for API responses (30-second cache)
- **Rate limiting respected** with 250ms delays between requests
- **Connection pooling** for database operations (when implemented)
- **Error retry logic** with exponential backoff

### Frontend Performance
- **Component memoization** for expensive renders
- **Lazy loading** for large datasets
- **WebSocket optimization** for real-time updates
- **Bundle optimization** with Vite

## 🌐 Browser Support

### Fully Supported
- **Chrome 90+**
- **Firefox 88+** 
- **Safari 14+**
- **Edge 90+**

### Feature Compatibility
- **WebSocket support** required for real-time updates
- **Local Storage** required for data persistence
- **ES2020** features used throughout
- **CSS Grid and Flexbox** for layouts

## 📱 Mobile Support

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

### Mobile Optimizations
- Touch-friendly interface elements
- Optimized table layouts for small screens
- Swipe gestures for tab navigation
- Reduced data density for better readability

## 🔄 Updates and Maintenance

### Keeping Dependencies Updated
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update major versions (use with caution)
npm install package-name@latest
```

### Monitoring Health
- **Server logs** for backend issues
- **Browser console** for frontend errors
- **Network tab** for API request monitoring
- **WebSocket status** in the header indicator

## 📞 Support

### Getting Help
1. **Check console logs** for error messages
2. **Review this setup guide** for common solutions
3. **Verify configuration** matches requirements
4. **Test with minimal setup** to isolate issues

### Documentation Resources
- **API Documentation:** See API.md for endpoint details
- **Component Guide:** See COMPONENTS.md for UI components
- **Architecture Overview:** See ARCHITECTURE.md for system design
- **Deployment Guide:** See DEPLOYMENT.md for production setup