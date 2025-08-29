# 🧩 Component Guide - Crypto Exchange Dashboard

## Component Architecture

### Design Principles
- **Single Responsibility:** Each component has one clear purpose
- **Composition over Inheritance:** Components are composed together
- **Props Down, Events Up:** Data flows down, events bubble up
- **Reusability:** Components are designed for multiple use cases

## 📁 Component Organization

### Core Layout Components
Located in `src/components/`

#### `Header.tsx`
**Purpose:** Main navigation and connection status
**Props:**
- `onAddToken: () => void` - Callback for add token button
- `connectionStatus: boolean` - WebSocket connection status
- `activeTab: string` - Currently active tab
- `onTabChange: (tab) => void` - Tab change handler

**Features:**
- Real-time connection indicator
- Tab navigation (Overview, Management, Growth, Alerts, Scraping)
- Responsive design with mobile-friendly navigation

#### `App.tsx`
**Purpose:** Main application container and state management
**Key Features:**
- Global state management with custom hooks
- Tab routing and active tab state
- Error boundaries and loading states
- WebSocket connection management

### 📊 Data Display Components

#### `TokenTable.tsx`
**Purpose:** Main data table with comprehensive token information
**Props:**
- `tokens: Token[]` - Array of token data
- `priceData: Record<string, PriceData>` - Price data by symbol
- `layoutConfig?: any` - Layout configuration from controls
- `onTrackPerformance?: (token) => void` - Performance tracking callback

**Features:**
- **23 configurable columns** with show/hide functionality
- **Real-time price updates** via WebSocket
- **Interactive info buttons** for each column
- **Modal integrations** (Notes, Alerts, Token Info)
- **Responsive design** with column width management

**Column Types:**
- **Basic:** Token symbol, name, info button
- **Price:** Current price, price change, open price
- **Trading:** Status, bid/ask spread
- **Market:** 24h high/low, volume, trade count
- **Historical:** ATH, ATL, % from ATH
- **Exchange:** Count, list, new/removed exchanges, scraping data
- **System:** Date added, last updated
- **Actions:** Notes, alerts, performance tracking

#### `TokenCard.tsx`
**Purpose:** Card view alternative to table display
**Features:**
- Compact token information display
- Price change indicators with color coding
- Trading status badges
- ATH/ATL information
- Exchange listings

#### `TokenGrid.tsx`
**Purpose:** Grid layout container for token cards
**Features:**
- Responsive grid layout
- Loading and error states
- Empty state handling

### 🎛️ Control Components

#### `LayoutControls.tsx`
**Purpose:** Comprehensive layout customization interface
**Features:**
- **View Mode Selection:** Table, Cards, Compact
- **Density Options:** Comfortable, Standard, Compact
- **Column Visibility:** 23 individual column toggles
- **Smart Presets:** Pre-configured layouts for different use cases
- **Display Options:** Sticky headers, zebra stripes, auto-hide

**Smart Presets:**
- **Essential Trading:** Core trading data only
- **Price Analysis:** Focus on price movements and history
- **Exchange Tracking:** Monitor exchange listings and changes
- **Market Overview:** Balanced comprehensive view
- **Quick Monitor:** Minimal view for rapid scanning
- **Research Mode:** All historical data for analysis
- **Mobile Friendly:** Optimized for small screens
- **Full Dashboard:** Complete 23-column view

#### `CompactTokenFilters.tsx`
**Purpose:** Advanced filtering system with multiple criteria
**Features:**
- **Enhanced Search:** Supports & (AND) and | (OR) operators
- **Column-Specific Search:** `symbol:BTC`, `price:>40000`, `exchange:binance`
- **Quick Filter Pills:** Pre-configured filter combinations
- **Date Range Filtering:** Custom date ranges and presets
- **Price/Volume Ranges:** Numeric range filtering
- **Exchange Selection:** Multi-select with CEX/DEX categories
- **Active Filter Display:** Visual badges for applied filters

**Search Examples:**
```
BTC | ETH                    # Find BTC OR ETH
BTC & price:>40000          # BTC AND price above $40,000
"Bitcoin"                   # Exact name match
symbol:BTC & change:>5      # BTC AND gaining 5%+
exchange:binance | exchange:coinbase  # On Binance OR Coinbase
```

### 🔧 Management Components

#### `AddTokenModal.tsx`
**Purpose:** Comprehensive token management interface
**Features:**
- **Add Tokens Tab:** Single and bulk token addition
- **Manage Tokens Tab:** Token list with search, sort, filters
- **Deleted History Tab:** Audit trail for deleted tokens
- **API Documentation Tab:** Integration examples and documentation

#### `TokenManagement.tsx`
**Purpose:** Advanced token portfolio management
**Features:**
- Modern tabbed interface
- Import/export functionality (CSV, TXT)
- Advanced filtering and sorting
- Deletion workflow with audit trail
- API endpoint documentation

#### `DeleteTokenModal.tsx`
**Purpose:** Secure token deletion with audit trail
**Features:**
- **Two-step deletion process**
- **Required reason field** for audit compliance
- **Predefined reason options**
- **Confirmation workflow**
- **Audit record creation**

### 📈 Analytics Components

#### `TokenGrowthAnalysis.tsx`
**Purpose:** Exchange listing growth and decline tracking
**Features:**
- Growth/decline categorization
- Expandable token details
- Performance tracking over time
- New/removed exchange highlighting
- 30-day performance charts

#### `AlertPanel.tsx`
**Purpose:** Comprehensive alert management system
**Features:**
- **Multiple Alert Types:**
  - Price above/below thresholds
  - Price change percentage alerts
  - Volume above/below thresholds
  - Exchange count changes
  - New exchange listings
  - Exchange delistings
  - ATH distance alerts
  - Percent from ATH alerts
  - Trading status changes
  - Combined condition alerts

- **Advanced Condition Builder:** Multiple conditions with AND/OR logic
- **Alert Statistics Dashboard**
- **Real-time alert monitoring**

#### `ScrapingControl.tsx`
**Purpose:** Web scraping configuration and monitoring
**Features:**
- **Global Configuration:** Enable/disable, interval settings
- **Per-Token Controls:** Individual token scraping toggles
- **API Key Management:** MEXC and Gate.io credential configuration
- **Status Monitoring:** Real-time scraping status and error logs

### 📋 Modal Components

#### `TokenInfoModal.tsx`
**Purpose:** Detailed data source information
**Features:**
- **Data source documentation** for each field
- **API endpoint information**
- **Update frequency details**
- **Calculation methods**
- **Current value display**

#### `ColumnInfoModal.tsx`
**Purpose:** Column-specific information and help
**Features:**
- Detailed explanation of each data column
- Data source and calculation information
- Update frequency and reliability notes
- Usage examples and best practices

#### `NotesModal.tsx`
**Purpose:** Personal note-taking for tokens
**Features:**
- Add/edit/delete personal notes
- Timestamp tracking
- Rich text support
- Local storage persistence

#### `AlertsModal.tsx`
**Purpose:** Token-specific alert configuration
**Features:**
- Multiple alert type configuration
- Real-time alert monitoring
- Condition validation
- Alert history and statistics

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: #F0B90B (Gold)
--success: #02C076 (Green)
--danger: #F84960 (Red)
--warning: #FF8F00 (Orange)
--info: #1890FF (Blue)

/* Background Colors */
--bg-primary: #0B0E11 (Dark)
--bg-secondary: #161A1E (Darker)
--bg-card: #1E2329 (Card Background)
```

### Typography
```css
/* Font Stack */
font-family: 'Inter', system-ui, sans-serif;

/* Scale */
text-xs: 0.75rem
text-sm: 0.875rem
text-base: 1rem
text-lg: 1.125rem
text-xl: 1.25rem
```

### Component Classes

#### Cards
```css
.card-modern {
  background: var(--bg-gradient-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
}
```

#### Badges
```css
.badge-modern {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success { color: var(--success); }
.badge-danger { color: var(--danger); }
.badge-warning { color: var(--warning); }
.badge-info { color: var(--info); }
```

#### Inputs
```css
.input-modern {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  border-radius: 6px;
}
```

## 🔄 State Management

### Custom Hooks

#### `useCryptoData.ts`
**Purpose:** Centralized cryptocurrency data management
**Returns:**
```typescript
{
  tokens: Token[];
  priceData: Record<string, PriceData>;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  addToken: (tokenData) => Promise<void>;
  removeToken: (id, reason, deletedBy) => Promise<void>;
}
```

#### `useWebSocket.ts`
**Purpose:** WebSocket connection and real-time data management
**Returns:**
```typescript
{
  socket: Socket | null;
  isConnected: boolean;
  subscribeToToken: (symbol) => void;
  unsubscribeFromToken: (symbol) => void;
}
```

### Data Flow
1. **Initial Load:** `useCryptoData` fetches tokens from API
2. **Real-time Updates:** `useWebSocket` subscribes to price updates
3. **User Actions:** Components trigger API calls through hooks
4. **State Updates:** Hooks update local state and trigger re-renders

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First */
mobile: < 768px
tablet: 768px - 1024px
desktop: > 1024px
```

### Mobile Optimizations
- **Compact layouts** for small screens
- **Touch-friendly** button sizes (minimum 44px)
- **Reduced information density**
- **Horizontal scroll** for wide tables
- **Collapsible sections** to save space

### Adaptive Features
- **Auto-hide columns** on mobile devices
- **Responsive grid systems** for cards
- **Flexible navigation** that works on all screen sizes
- **Touch gestures** for enhanced mobile interaction

## 🧪 Testing Guidelines

### Component Testing
```javascript
// Example component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenCard } from '../TokenCard';

describe('TokenCard', () => {
  const mockToken = {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    exchanges: ['mexc'],
    added: Date.now()
  };

  it('displays token information correctly', () => {
    render(<TokenCard token={mockToken} />);
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });
});
```

### Integration Testing
- **API endpoint testing** with mock servers
- **WebSocket connection testing** with test clients
- **End-to-end workflow testing** for complete user journeys

## 🔧 Development Guidelines

### Adding New Components
1. **Create component file** in appropriate directory
2. **Define TypeScript interfaces** for props and state
3. **Implement component logic** with proper error handling
4. **Add responsive styling** with Tailwind classes
5. **Include JSDoc comments** for complex functions
6. **Export component** and add to index files

### Styling Standards
- **Use Tailwind CSS classes** for styling
- **Follow design system** color and spacing guidelines
- **Implement hover states** for interactive elements
- **Add loading states** for async operations
- **Include focus states** for accessibility

### Performance Best Practices
- **Use React.memo** for expensive components
- **Implement useMemo/useCallback** for computed values
- **Avoid unnecessary re-renders** with proper dependencies
- **Lazy load** heavy components when possible

This component guide provides comprehensive information for understanding, using, and extending the cryptocurrency dashboard components.