// Market Data Configuration
// Switch between mock and real data sources

export const MARKET_DATA_CONFIG = {
  // Set to 'mock' for development, 'real' for production
  dataSource: 'mock', // 'mock' | 'real'
  
  // Mock data settings
  mock: {
    enabled: true,
    updateInterval: {
      min: 2000, // 2 seconds
      max: 8000  // 8 seconds
    },
    volatility: {
      low: 0.3,    // For indices
      medium: 0.7, // For blue chip stocks
      high: 1.2    // For volatile stocks
    },
    maxPriceChange: 2.0, // Max 2% change per update
    enableNews: true,
    enableMarketStatus: true
  },
  
  // Real data settings (for future implementation)
  real: {
    enabled: false,
    providers: {
      primary: 'yahoo-finance',    // yahoo-finance | alpha-vantage | polygon
      fallback: 'alpha-vantage',
      websocket: 'polygon'
    },
    apiKeys: {
      alphaVantage: process.env.VITE_ALPHA_VANTAGE_API_KEY,
      polygon: process.env.VITE_POLYGON_API_KEY,
      iex: process.env.VITE_IEX_API_KEY
    },
    updateInterval: 5000, // 5 seconds for real data
    rateLimits: {
      yahoo: 2000,        // 2000 requests per day
      alphaVantage: 5,    // 5 requests per minute
      polygon: 100        // 100 requests per minute
    }
  },
  
  // Market timing (IST)
  marketHours: {
    timezone: 'Asia/Kolkata',
    trading: {
      start: { hour: 9, minute: 15 },
      end: { hour: 15, minute: 30 }
    },
    preMarket: {
      start: { hour: 9, minute: 0 },
      end: { hour: 9, minute: 15 }
    },
    afterMarket: {
      start: { hour: 15, minute: 30 },
      end: { hour: 16, minute: 0 }
    },
    weekends: [0, 6], // Sunday = 0, Saturday = 6
    holidays: [
      '2024-01-26', // Republic Day
      '2024-03-08', // Holi
      '2024-03-29', // Good Friday
      '2024-04-11', // Eid
      '2024-08-15', // Independence Day
      '2024-10-02', // Gandhi Jayanti
      '2024-11-01', // Diwali
      '2024-12-25'  // Christmas
    ]
  },
  
  // Symbols configuration
  symbols: {
    indices: ['NIFTY50', 'SENSEX'],
    defaultStocks: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
      'HINDUNILVR', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT',
      'SBIN', 'ASIANPAINT', 'MARUTI'
    ],
    popular: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'
    ]
  },
  
  // Features toggle
  features: {
    realTimeUpdates: true,
    portfolioTracking: true,
    priceAlerts: true,
    marketNews: true,
    technicalIndicators: false, // Future feature
    optionsData: false,         // Future feature
    cryptoData: false          // Future feature
  }
};

// Helper functions
export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if weekend
  if (MARKET_DATA_CONFIG.marketHours.weekends.includes(day)) {
    return false;
  }
  
  // Check if holiday
  const today = now.toISOString().split('T')[0];
  if (MARKET_DATA_CONFIG.marketHours.holidays.includes(today)) {
    return false;
  }
  
  // Check if within trading hours
  const currentTime = hour * 60 + minute;
  const startTime = MARKET_DATA_CONFIG.marketHours.trading.start.hour * 60 + 
                   MARKET_DATA_CONFIG.marketHours.trading.start.minute;
  const endTime = MARKET_DATA_CONFIG.marketHours.trading.end.hour * 60 + 
                 MARKET_DATA_CONFIG.marketHours.trading.end.minute;
  
  return currentTime >= startTime && currentTime <= endTime;
};

export const getMarketStatus = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if weekend
  if (MARKET_DATA_CONFIG.marketHours.weekends.includes(day)) {
    return 'closed';
  }
  
  // Check if holiday
  const today = now.toISOString().split('T')[0];
  if (MARKET_DATA_CONFIG.marketHours.holidays.includes(today)) {
    return 'closed';
  }
  
  const currentTime = hour * 60 + minute;
  const preMarketStart = MARKET_DATA_CONFIG.marketHours.preMarket.start.hour * 60 + 
                        MARKET_DATA_CONFIG.marketHours.preMarket.start.minute;
  const tradingStart = MARKET_DATA_CONFIG.marketHours.trading.start.hour * 60 + 
                      MARKET_DATA_CONFIG.marketHours.trading.start.minute;
  const tradingEnd = MARKET_DATA_CONFIG.marketHours.trading.end.hour * 60 + 
                    MARKET_DATA_CONFIG.marketHours.trading.end.minute;
  const afterMarketEnd = MARKET_DATA_CONFIG.marketHours.afterMarket.end.hour * 60 + 
                        MARKET_DATA_CONFIG.marketHours.afterMarket.end.minute;
  
  if (currentTime < preMarketStart || currentTime > afterMarketEnd) {
    return 'closed';
  } else if (currentTime >= preMarketStart && currentTime < tradingStart) {
    return 'pre-open';
  } else if (currentTime >= tradingStart && currentTime <= tradingEnd) {
    return 'open';
  } else {
    return 'after-hours';
  }
};

export const shouldUseMockData = () => {
  return MARKET_DATA_CONFIG.dataSource === 'mock' || 
         !MARKET_DATA_CONFIG.real.enabled ||
         process.env.NODE_ENV === 'development';
};

export const getUpdateInterval = () => {
  if (shouldUseMockData()) {
    const { min, max } = MARKET_DATA_CONFIG.mock.updateInterval;
    return min + Math.random() * (max - min);
  }
  return MARKET_DATA_CONFIG.real.updateInterval;
};

// Configuration validation
export const validateConfig = () => {
  const errors = [];
  
  if (MARKET_DATA_CONFIG.dataSource === 'real') {
    // Check if API keys are provided
    const { apiKeys } = MARKET_DATA_CONFIG.real;
    if (!apiKeys.alphaVantage && !apiKeys.polygon && !apiKeys.iex) {
      errors.push('At least one API key must be provided for real data');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default MARKET_DATA_CONFIG;
