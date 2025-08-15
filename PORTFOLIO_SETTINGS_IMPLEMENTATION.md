# Portfolio & Settings Implementation

This document outlines the implementation of the portfolio management and settings functionality for the UPI Piggy application.

## Features Implemented

### 1. Settings Management
- **Database Integration**: User settings are stored in the `user_settings` table with full CRUD operations
- **Real-time Updates**: Settings are saved to the database immediately when changed
- **Demo Mode Support**: Settings work in both demo and authenticated modes
- **Validation**: Form validation with proper error handling
- **Settings Available**:
  - Round-up rules (round to nearest ₹10, ₹20, ₹50, ₹100)
  - Min/Max round-up amounts
  - Weekly investment target
  - Portfolio preset (Safe, Balanced, Growth)
  - Auto-invest toggle

**Files Created/Modified**:
- `src/lib/settings.ts` - Settings service with database operations
- `src/hooks/use-settings.ts` - React hook for settings management
- `src/pages/SettingsPage.tsx` - Updated with working form controls

### 2. Portfolio Management
- **Real Portfolio Data**: Fetches actual holdings from database
- **Market Price Integration**: Updates portfolio values with current market prices
- **Asset Allocation Visualization**: Dynamic pie charts showing current vs target allocation
- **Performance Tracking**: Portfolio summary with P&L calculations

**Files Created**:
- `src/lib/portfolio.ts` - Portfolio service with database operations
- `src/hooks/use-portfolio.ts` - React hook for portfolio management
- `src/components/portfolio/DetailedAssetsDialog.tsx` - Detailed portfolio view modal
- Updated `src/pages/PortfolioPage.tsx` with real data integration

### 3. Portfolio Rebalancing
- **Smart Analysis**: Compares current allocation vs target allocation based on user's portfolio preset
- **Automatic Recommendations**: Generates buy/sell recommendations when allocation drifts >5%
- **One-Click Execution**: Execute rebalancing with a single button click
- **Visual Feedback**: Clear indicators showing allocation differences and recommended actions

**Key Features**:
- **Target Allocation by Preset**:
  - Safe: 70% Gold ETF, 30% Nifty ETF
  - Balanced: 50% Gold ETF, 50% Nifty ETF  
  - Growth: 30% Gold ETF, 70% Nifty ETF
- **Tolerance Based**: Only recommends rebalancing when allocation differs by >5%
- **Order Generation**: Creates pending orders in the database for execution

### 4. Database Schema
The following tables are used for portfolio and settings functionality:

```sql
-- User settings
user_settings (
  id, user_id, round_to_nearest, min_roundup, max_roundup,
  portfolio_preset, auto_invest_enabled, weekly_target
)

-- Portfolio holdings
holdings (
  id, user_id, symbol, units, avg_cost, current_price, current_value
)

-- Market prices
prices (
  id, symbol, price, change, change_percent, volume
)

-- Orders for rebalancing
orders (
  id, user_id, side, symbol, quantity, amount, price, status
)
```

## Usage

### Settings Page
Navigate to `/settings` to:
- Configure round-up rules and limits
- Set weekly investment targets
- Choose portfolio allocation strategy
- Toggle auto-invest functionality

### Portfolio Page
Navigate to `/portfolio` to:
- View total portfolio value and performance
- See asset allocation with visual charts
- Access detailed asset breakdown
- Execute portfolio rebalancing

### Detailed Assets Dialog
Click "View Detailed Assets" to see:
- Complete asset breakdown with P&L
- Current vs target allocation comparison
- Rebalancing recommendations
- One-click rebalancing execution

## Technical Implementation

### Settings Service (`src/lib/settings.ts`)
- `getUserSettings()` - Fetch user settings from database
- `upsertUserSettings()` - Create/update user settings
- `validateSettings()` - Validate settings before saving
- `getDefaultSettings()` - Get default settings for new users

### Portfolio Service (`src/lib/portfolio.ts`)
- `getUserHoldings()` - Fetch user's portfolio holdings
- `calculatePortfolioSummary()` - Calculate portfolio metrics and P&L
- `generateRebalanceRecommendations()` - Analyze and recommend rebalancing
- `executeRebalance()` - Execute rebalancing by creating orders
- `getCurrentPrices()` - Fetch current market prices

### React Hooks
- `useSettings()` - Manage settings state and operations
- `usePortfolio()` - Manage portfolio state and operations

Both hooks handle:
- Loading states
- Error handling  
- Demo mode fallbacks
- Automatic data refresh
- Toast notifications

## Demo Mode Support
All functionality works in demo mode with:
- Mock data that resembles real portfolio
- Simulated API delays
- Toast notifications indicating demo mode
- Local state updates without database persistence

## Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Loading states for all async operations
- Validation feedback for form inputs

## Next Steps
1. Add historical performance tracking
2. Implement more sophisticated rebalancing algorithms
3. Add portfolio performance analytics
4. Create investment goal tracking
5. Add notifications for rebalancing suggestions
