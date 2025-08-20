// Mock Real-Time Market Data Generator
// Simulates live stock prices with realistic fluctuations

class MockRealTimeDataService {
  constructor() {
    this.subscribers = new Map();
    this.intervals = new Map();
    this.baseData = this.getBaseStockData();
    this.currentPrices = new Map();
    this.isRunning = false;
    
    // Initialize current prices
    this.baseData.forEach(stock => {
      this.currentPrices.set(stock.symbol, {
        ...stock,
        lastUpdate: Date.now(),
        dayChange: 0,
        dayChangePercent: 0
      });
    });
  }

  // Base stock data with realistic Indian market stocks
  getBaseStockData() {
    return [
      {
        symbol: 'NIFTY50',
        name: 'NIFTY 50',
        price: 22150.50,
        sector: 'Index',
        volume: 125000000,
        marketCap: 0,
        pe: 22.5
      },
      {
        symbol: 'SENSEX',
        name: 'BSE SENSEX',
        price: 72950.75,
        sector: 'Index',
        volume: 98000000,
        marketCap: 0,
        pe: 23.2
      },
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        price: 2845.30,
        sector: 'Energy',
        volume: 8500000,
        marketCap: 1925000000000,
        pe: 15.8
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        price: 4125.65,
        sector: 'IT',
        volume: 1200000,
        marketCap: 1500000000000,
        pe: 28.4
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank',
        price: 1685.40,
        sector: 'Banking',
        volume: 15000000,
        marketCap: 1280000000000,
        pe: 18.9
      },
      {
        symbol: 'INFY',
        name: 'Infosys',
        price: 1850.25,
        sector: 'IT',
        volume: 8000000,
        marketCap: 775000000000,
        pe: 25.6
      },
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank',
        price: 1245.80,
        sector: 'Banking',
        volume: 12000000,
        marketCap: 875000000000,
        pe: 16.7
      },
      {
        symbol: 'HINDUNILVR',
        name: 'Hindustan Unilever',
        price: 2420.90,
        sector: 'FMCG',
        volume: 1800000,
        marketCap: 570000000000,
        pe: 45.2
      },
      {
        symbol: 'BHARTIARTL',
        name: 'Bharti Airtel',
        price: 1520.35,
        sector: 'Telecom',
        volume: 5500000,
        marketCap: 865000000000,
        pe: 22.8
      },
      {
        symbol: 'ITC',
        name: 'ITC Limited',
        price: 485.70,
        sector: 'FMCG',
        volume: 25000000,
        marketCap: 605000000000,
        pe: 28.9
      },
      {
        symbol: 'KOTAKBANK',
        name: 'Kotak Mahindra Bank',
        price: 1785.45,
        sector: 'Banking',
        volume: 3200000,
        marketCap: 355000000000,
        pe: 14.6
      },
      {
        symbol: 'LT',
        name: 'Larsen & Toubro',
        price: 3650.20,
        sector: 'Construction',
        volume: 1900000,
        marketCap: 515000000000,
        pe: 31.4
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        price: 825.60,
        sector: 'Banking',
        volume: 45000000,
        marketCap: 735000000000,
        pe: 9.8
      },
      {
        symbol: 'ASIANPAINT',
        name: 'Asian Paints',
        price: 2890.85,
        sector: 'Paints',
        volume: 850000,
        marketCap: 278000000000,
        pe: 52.3
      },
      {
        symbol: 'MARUTI',
        name: 'Maruti Suzuki',
        price: 11450.30,
        sector: 'Automobile',
        volume: 650000,
        marketCap: 346000000000,
        pe: 24.7
      }
    ];
  }

  // Generate realistic price movement
  generatePriceMovement(currentPrice, symbol) {
    // Different volatility for different asset types (reduced for realism)
    const volatilityMap = {
      'NIFTY50': 0.05,   // Very low volatility for index
      'SENSEX': 0.05,    // Very low volatility for index
      'RELIANCE': 0.15,  // Moderate volatility for large cap
      'TCS': 0.12,       // Low-moderate volatility for IT
      'HDFCBANK': 0.13,  // Moderate volatility for banking
      'INFY': 0.14,      // Moderate volatility for IT
      'ICICIBANK': 0.16, // Slightly higher for private bank
      'HINDUNILVR': 0.08, // Low volatility for FMCG
      'BHARTIARTL': 0.12, // Moderate for telecom
      'ITC': 0.10,       // Low volatility for large FMCG
      'KOTAKBANK': 0.15, // Moderate for banking
      'LT': 0.18,        // Higher for construction
      'SBIN': 0.20,      // Higher volatility for PSU bank
      'ASIANPAINT': 0.11, // Moderate for paints
      'MARUTI': 0.16     // Moderate for auto
    };

    const volatility = volatilityMap[symbol] || 0.12;
    
    // Much smaller random movements (realistic for minute-to-minute changes)
    const randomChange = (Math.random() - 0.5) * 0.4; // Reduced range
    const meanReversion = (Math.random() - 0.5) * 0.1; // Gentle mean reversion
    
    // Calculate very small percentage change (max 0.2% per update)
    const maxChange = Math.min(volatility, 0.2);
    const percentChange = (randomChange * maxChange + meanReversion * 0.02) / 100;
    
    // Apply change
    const newPrice = currentPrice * (1 + percentChange);
    
    // Ensure price doesn't move too dramatically (max 1% in single update)
    const maxSingleMove = currentPrice * 0.01;
    const priceDiff = newPrice - currentPrice;
    const clampedDiff = Math.max(-maxSingleMove, Math.min(maxSingleMove, priceDiff));
    
    return Math.max(currentPrice + clampedDiff, currentPrice * 0.99);
  }

  // Subscribe to real-time updates for specific symbols
  subscribe(symbols, callback) {
    const subscriptionId = Date.now() + Math.random();
    
    this.subscribers.set(subscriptionId, {
      symbols: Array.isArray(symbols) ? symbols : [symbols],
      callback,
      lastUpdate: Date.now()
    });

    // Start updates if not already running
    if (!this.isRunning) {
      this.startUpdates();
    }

    // Send initial data
    this.sendUpdate(subscriptionId);

    return subscriptionId;
  }

  // Unsubscribe from updates
  unsubscribe(subscriptionId) {
    this.subscribers.delete(subscriptionId);
    
    // Stop updates if no subscribers
    if (this.subscribers.size === 0) {
      this.stopUpdates();
    }
  }

  // Start the update loop
  startUpdates() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Update prices with realistic intervals (faster in development for testing)
    const scheduleNextUpdate = () => {
      let interval;
      if (process.env.NODE_ENV === 'development') {
        // Faster updates for development/testing: 5-15 seconds
        interval = 5000 + Math.random() * 10000; // 5-15 seconds
      } else {
        // Realistic intervals for production: 15-60 seconds
        interval = 15000 + Math.random() * 45000; // 15-60 seconds
      }
      
      setTimeout(() => {
        if (!this.isRunning) return;
        
        this.updatePrices();
        this.notifySubscribers();
        scheduleNextUpdate();
      }, interval);
    };

    scheduleNextUpdate();
  }

  // Stop updates
  stopUpdates() {
    this.isRunning = false;
  }

  // Update all prices
  updatePrices() {
    const now = Date.now();
    
    this.currentPrices.forEach((stockData, symbol) => {
      const oldPrice = stockData.price;
      const newPrice = this.generatePriceMovement(oldPrice, symbol);
      
      // Calculate day change (simulate from a random opening price)
      const openingPrice = stockData.openingPrice || oldPrice * (0.98 + Math.random() * 0.04);
      const dayChange = newPrice - openingPrice;
      const dayChangePercent = (dayChange / openingPrice) * 100;

      // Update volume (simulate trading activity)
      const volumeChange = 0.95 + Math.random() * 0.1; // ±5% volume change
      const newVolume = Math.floor(stockData.volume * volumeChange);

      this.currentPrices.set(symbol, {
        ...stockData,
        price: Number(newPrice.toFixed(2)),
        lastUpdate: now,
        dayChange: Number(dayChange.toFixed(2)),
        dayChangePercent: Number(dayChangePercent.toFixed(2)),
        volume: newVolume,
        openingPrice: openingPrice,
        high: Math.max(stockData.high || newPrice, newPrice),
        low: Math.min(stockData.low || newPrice, newPrice),
        trend: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'neutral'
      });
    });
  }

  // Notify all subscribers
  notifySubscribers() {
    this.subscribers.forEach((subscription, subscriptionId) => {
      this.sendUpdate(subscriptionId);
    });
  }

  // Send update to specific subscriber
  sendUpdate(subscriptionId) {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) return;

    const data = subscription.symbols.map(symbol => {
      const stockData = this.currentPrices.get(symbol);
      if (!stockData) return null;

      return {
        symbol,
        ...stockData,
        timestamp: Date.now()
      };
    }).filter(Boolean);

    subscription.callback(data);
  }

  // Get current price for a symbol
  getCurrentPrice(symbol) {
    return this.currentPrices.get(symbol);
  }

  // Get current prices for multiple symbols
  getCurrentPrices(symbols = null) {
    if (!symbols) {
      // Return all current prices
      return Array.from(this.currentPrices.values());
    }

    return symbols.map(symbol => this.currentPrices.get(symbol)).filter(Boolean);
  }

  // Get market summary
  getMarketSummary() {
    const nifty = this.currentPrices.get('NIFTY50');
    const sensex = this.currentPrices.get('SENSEX');
    
    return {
      nifty50: nifty ? {
        value: nifty.price,
        change: nifty.dayChange,
        changePercent: nifty.dayChangePercent,
        trend: nifty.trend
      } : null,
      sensex: sensex ? {
        value: sensex.price,
        change: sensex.dayChange,
        changePercent: sensex.dayChangePercent,
        trend: sensex.trend
      } : null,
      timestamp: Date.now(),
      marketStatus: this.getMarketStatus()
    };
  }

  // Simulate market status (open/closed)
  getMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Indian market: Mon-Fri, 9:15 AM - 3:30 PM IST
    if (day === 0 || day === 6) return 'closed'; // Weekend
    if (hour < 9 || hour >= 16) return 'closed'; // After hours
    if (hour === 9 && now.getMinutes() < 15) return 'pre-open';
    
    return 'open';
  }

  // Simulate news/events that might affect prices
  getMarketNews() {
    const newsItems = [
      "NIFTY 50 shows strong momentum amid positive global cues",
      "Banking stocks rally on RBI policy expectations",
      "IT sector gains on robust quarterly earnings",
      "FII inflows boost market sentiment",
      "Rupee strengthens against dollar, supporting markets",
      "Oil prices decline, benefiting OMC stocks",
      "Monsoon progress positive for FMCG sector"
    ];

    return {
      headline: newsItems[Math.floor(Math.random() * newsItems.length)],
      timestamp: Date.now() - Math.random() * 3600000, // Within last hour
      impact: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)]
    };
  }
}

// Create singleton instance
export const mockRealTimeData = new MockRealTimeDataService();

// Utility function to format currency
export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Utility function to format percentage
export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}%`;
};

export default MockRealTimeDataService;
