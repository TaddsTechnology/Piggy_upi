// Yahoo Finance API Service - Free real-time market data
// No API key required, supports Indian stocks and ETFs

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  currency: string;
  marketState: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED';
  displayName: string;
  shortName: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  lastUpdated: Date;
  marketState: string;
  name: string;
}

// Indian ETF symbols on Yahoo Finance
export const INDIAN_ETF_SYMBOLS = {
  // Nifty 50 ETFs
  'NIFTYBEES': 'NIFTYBEES.NS',  // Nippon India ETF Nifty BeES
  'JUNIORBEES': 'JUNIORBEES.NS', // Nippon India ETF Junior BeES
  'LIQUIDBEES': 'LIQUIDBEES.NS', // Nippon India ETF Liquid BeES
  'GOLDBEES': 'GOLDBEES.NS',    // Nippon India ETF Gold BeES
  
  // SBI ETFs
  'SETFNIF50': 'SETFNIF50.NS',  // SBI ETF Nifty 50
  'SETFNIFBK': 'SETFNIFBK.NS',  // SBI ETF Nifty Bank
  'SETFGOLD': 'SETFGOLD.NS',    // SBI ETF Gold
  
  // HDFC ETFs
  'HDFCNIF50': 'HDFCNIFETF.NS', // HDFC Nifty 50 ETF
  'HDFCNIFBK': 'HDFCNIFBANK.NS', // HDFC Nifty Bank ETF
  
  // ICICI Prudential ETFs
  'ICICIN50': 'ICICIN50.NS',    // ICICI Prudential Nifty 50 ETF
  'ICICINXT50': 'ICICINXT50.NS', // ICICI Prudential Nifty Next 50 ETF
  
  // Popular Individual Stocks (for reference)
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'INFY': 'INFY.NS',
  'ICICIBANK': 'ICICIBANK.NS'
} as const;

// Default portfolio symbols (what we use in the app)
export const DEFAULT_PORTFOLIO_SYMBOLS = [
  'NIFTYBEES.NS',  // Nifty 50 ETF
  'GOLDBEES.NS',   // Gold ETF
  'LIQUIDBEES.NS'  // Liquid ETF
];

class YahooFinanceAPI {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private quotesUrl = 'https://query2.finance.yahoo.com/v1/finance/quoteType';
  private corsProxy = 'https://api.allorigins.win/raw?url='; // CORS proxy
  
  // Persistent cache to avoid excessive API calls
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private cacheTimeout = 300000; // 5 minute cache
  private localStorageKey = 'yahoo_finance_cache';
  private localStorageTimeout = 1800000; // 30 minutes for localStorage cache
  
  /**
   * Load cached data from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const cached = localStorage.getItem(this.localStorageKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp && Date.now() - data.timestamp < this.localStorageTimeout) {
          // Convert lastUpdated strings back to Date objects
          Object.keys(data.data).forEach(symbol => {
            if (data.data[symbol]?.lastUpdated) {
              data.data[symbol].lastUpdated = new Date(data.data[symbol].lastUpdated);
            }
            this.cache.set(symbol, {
              data: data.data[symbol],
              timestamp: data.timestamp
            });
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const cacheData: Record<string, MarketData> = {};
      this.cache.forEach((value, key) => {
        cacheData[key] = value.data;
      });
      
      localStorage.setItem(this.localStorageKey, JSON.stringify({
        data: cacheData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Get cached data from localStorage or return fallback
   */
  getCachedOrFallback(): Record<string, MarketData | null> {
    // Load from localStorage first
    this.loadFromLocalStorage();
    
    const result: Record<string, MarketData | null> = {};
    const fallbackData = getFallbackQuotes();
    
    // Try to get cached data for each symbol
    DEFAULT_PORTFOLIO_SYMBOLS.forEach(symbol => {
      const cleanSymbol = symbol.replace('.NS', '');
      const cached = this.cache.get(symbol);
      
      if (cached && Date.now() - cached.timestamp < this.localStorageTimeout) {
        result[cleanSymbol] = cached.data;
      } else {
        result[cleanSymbol] = fallbackData[cleanSymbol] || null;
      }
    });
    
    return result;
  }

  /**
   * Get real-time quote for a single symbol (only when explicitly called)
   */
  async getQuote(symbol: string, forceRefresh: boolean = false): Promise<MarketData | null> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = this.cache.get(symbol);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Use CORS proxy for development
      const apiUrl = `${this.baseUrl}/${symbol}`;
      const urlToFetch = isDevelopment() ? `${this.corsProxy}${encodeURIComponent(apiUrl)}` : apiUrl;
      
      const response = await fetch(urlToFetch, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.warn(`Yahoo Finance API error for ${symbol}:`, response.status);
        return null;
      }

      const data = await response.json();
      
      if (!data.chart?.result?.[0]) {
        console.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      if (!meta || !quote) {
        console.warn(`Invalid data structure for symbol: ${symbol}`);
        return null;
      }

      // Get the latest values
      const latestPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || latestPrice;
      const change = latestPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      const marketData: MarketData = {
        symbol: symbol.replace('.NS', ''), // Remove .NS suffix for display
        price: Number(latestPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        currency: meta.currency || 'INR',
        lastUpdated: new Date(),
        marketState: meta.marketState || 'CLOSED',
        name: meta.longName || meta.shortName || symbol
      };

      // Cache the result
      this.cache.set(symbol, { data: marketData, timestamp: Date.now() });

      return marketData;

    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get quotes for multiple symbols with force refresh option
   */
  async getMultipleQuotes(symbols: string[], forceRefresh: boolean = false): Promise<Record<string, MarketData | null>> {
    const results: Record<string, MarketData | null> = {};
    
    // Fetch all quotes in parallel
    const promises = symbols.map(async (symbol) => {
      const quote = await this.getQuote(symbol, forceRefresh);
      return { symbol, quote };
    });

    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      const symbol = symbols[index];
      if (response.status === 'fulfilled') {
        results[symbol.replace('.NS', '')] = response.value.quote;
      } else {
        console.error(`Failed to fetch quote for ${symbol}:`, response.reason);
        results[symbol.replace('.NS', '')] = null;
      }
    });

    // Save to localStorage after successful fetch
    if (forceRefresh) {
      this.saveToLocalStorage();
    }

    return results;
  }

  /**
   * Get default portfolio quotes (NIFTY, GOLD, LIQUID ETFs)
   */
  async getPortfolioQuotes(): Promise<Record<string, MarketData | null>> {
    return await this.getMultipleQuotes(DEFAULT_PORTFOLIO_SYMBOLS);
  }

  /**
   * Search for symbols (basic search)
   */
  async searchSymbols(query: string): Promise<string[]> {
    try {
      // Simple search in our known symbols
      const allSymbols = Object.entries(INDIAN_ETF_SYMBOLS);
      const matches = allSymbols
        .filter(([key, value]) => 
          key.toLowerCase().includes(query.toLowerCase()) ||
          value.toLowerCase().includes(query.toLowerCase())
        )
        .map(([key]) => key)
        .slice(0, 10); // Limit to 10 results

      return matches;
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  /**
   * Get market status
   */
  async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpenTime?: string;
    marketState: string;
  }> {
    try {
      const niftyData = await this.getQuote('NIFTYBEES.NS');
      const isOpen = niftyData?.marketState === 'REGULAR';
      
      return {
        isOpen,
        marketState: niftyData?.marketState || 'UNKNOWN',
        nextOpenTime: isOpen ? undefined : 'Next trading session'
      };
    } catch (error) {
      console.error('Error getting market status:', error);
      return {
        isOpen: false,
        marketState: 'UNKNOWN'
      };
    }
  }

  /**
   * Clear cache (useful for forcing fresh data)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { size: number; symbols: string[] } {
    return {
      size: this.cache.size,
      symbols: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const yahooFinanceAPI = new YahooFinanceAPI();

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  const color = value >= 0 ? '🟢' : '🔴';
  return `${color} ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const isMarketHours = (): boolean => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();
  const dayOfWeek = istTime.getDay();
  
  // Indian market hours: Monday-Friday 9:15 AM to 3:30 PM IST
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWithinHours = 
    (hour === 9 && minute >= 15) || 
    (hour > 9 && hour < 15) || 
    (hour === 15 && minute <= 30);
  
  return isWeekday && isWithinHours;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// Demo/fallback data for when API fails
export const getFallbackQuotes = (): Record<string, MarketData> => {
  return {
    'NIFTYBEES': {
      symbol: 'NIFTYBEES',
      price: 285.50,
      change: 2.15,
      changePercent: 0.76,
      volume: 1250000,
      currency: 'INR',
      lastUpdated: new Date(),
      marketState: 'CLOSED',
      name: 'Nippon India ETF Nifty BeES'
    },
    'GOLDBEES': {
      symbol: 'GOLDBEES',
      price: 65.25,
      change: -1.25,
      changePercent: -1.88,
      volume: 890000,
      currency: 'INR',
      lastUpdated: new Date(),
      marketState: 'CLOSED',
      name: 'Nippon India ETF Gold BeES'
    },
    'LIQUIDBEES': {
      symbol: 'LIQUIDBEES',
      price: 100.05,
      change: 0.02,
      changePercent: 0.02,
      volume: 45000,
      currency: 'INR',
      lastUpdated: new Date(),
      marketState: 'CLOSED',
      name: 'Nippon India ETF Liquid BeES'
    }
  };
};
