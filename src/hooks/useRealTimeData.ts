import { useState, useEffect, useRef, useCallback } from 'react';
import { mockRealTimeData } from '../lib/mockRealTimeData';
import { mockDataOrchestrator } from '../lib/mockDataOrchestrator';
import { MARKET_DATA_CONFIG } from '../config/marketData';

// Hook for subscribing to real-time market data
export const useRealTimeData = (symbols, options = {}) => {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionIdRef = useRef(null);
  
  const {
    autoStart = true,
    onUpdate = null,
    onError = null
  } = options;

  // Handle incoming data updates
  const handleUpdate = useCallback((newData) => {
    setData(newData);
    setError(null);
    
    if (onUpdate) {
      onUpdate(newData);
    }
  }, [onUpdate]);

  // Handle errors
  const handleError = useCallback((err) => {
    setError(err);
    setIsConnected(false);
    
    if (onError) {
      onError(err);
    }
  }, [onError]);

  // Start subscription
  const start = useCallback(() => {
    if (!symbols || symbols.length === 0) {
      handleError(new Error('No symbols provided'));
      return;
    }

    try {
      // Cleanup existing subscription
      if (subscriptionIdRef.current) {
        mockRealTimeData.unsubscribe(subscriptionIdRef.current);
      }

      // Create new subscription
      subscriptionIdRef.current = mockRealTimeData.subscribe(symbols, handleUpdate);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      handleError(err);
    }
  }, [symbols, handleUpdate, handleError]);

  // Stop subscription
  const stop = useCallback(() => {
    if (subscriptionIdRef.current) {
      mockRealTimeData.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Restart subscription
  const restart = useCallback(() => {
    stop();
    setTimeout(start, 100); // Small delay to ensure cleanup
  }, [stop, start]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && symbols && symbols.length > 0) {
      start();
    }

    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [symbols, autoStart, start, stop]);

  return {
    data,
    isConnected,
    error,
    start,
    stop,
    restart
  };
};

// Hook for market summary data
export const useMarketSummary = (refreshInterval = 10000) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchSummary = useCallback(() => {
    try {
      const marketSummary = mockRealTimeData.getMarketSummary();
      setSummary(marketSummary);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching market summary:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSummary();

    // Set up interval for refreshing
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchSummary, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSummary, refreshInterval]);

  return {
    summary,
    isLoading,
    refresh: fetchSummary
  };
};

// Hook for single stock data
export const useStockData = (symbol, autoRefresh = true) => {
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isConnected } = useRealTimeData(
    symbol ? [symbol] : [],
    {
      autoStart: autoRefresh,
      onUpdate: (newData) => {
        if (newData && newData.length > 0) {
          setStockData(newData[0]);
          setIsLoading(false);
        }
      }
    }
  );

  // Get initial data if not auto-refreshing
  useEffect(() => {
    if (!autoRefresh && symbol) {
      const currentData = mockRealTimeData.getCurrentPrice(symbol);
      if (currentData) {
        setStockData(currentData);
        setIsLoading(false);
      }
    }
  }, [symbol, autoRefresh]);

  return {
    stockData,
    isLoading,
    isConnected: autoRefresh ? isConnected : true
  };
};

// Hook for portfolio real-time updates
export const usePortfolioData = (holdings, autoRefresh = true) => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [totalChangePercent, setTotalChangePercent] = useState(0);

  const symbols = holdings?.map(h => h.symbol) || [];

  const { data, isConnected } = useRealTimeData(symbols, {
    autoStart: autoRefresh && symbols.length > 0,
    onUpdate: (newData) => {
      // Calculate portfolio metrics
      let total = 0;
      let totalDayChange = 0;

      const portfolioItems = holdings.map(holding => {
        const stockData = newData.find(d => d.symbol === holding.symbol);
        if (!stockData) return holding;

        const currentValue = stockData.price * holding.quantity;
        const dayChange = stockData.dayChange * holding.quantity;
        
        total += currentValue;
        totalDayChange += dayChange;

        return {
          ...holding,
          currentPrice: stockData.price,
          currentValue,
          dayChange,
          dayChangePercent: stockData.dayChangePercent,
          lastUpdate: stockData.lastUpdate,
          trend: stockData.trend
        };
      });

      const portfolioChangePercent = total > 0 ? (totalDayChange / (total - totalDayChange)) * 100 : 0;

      setPortfolioData(portfolioItems);
      setTotalValue(total);
      setTotalChange(totalDayChange);
      setTotalChangePercent(portfolioChangePercent);
    }
  });

  return {
    portfolioData,
    totalValue,
    totalChange,
    totalChangePercent,
    isConnected: autoRefresh ? isConnected : true,
    isLoading: autoRefresh ? !isConnected : false
  };
};

// Hook for market news
export const useMarketNews = (refreshInterval = 30000) => {
  const [news, setNews] = useState(null);
  const intervalRef = useRef(null);

  const fetchNews = useCallback(() => {
    const marketNews = mockRealTimeData.getMarketNews();
    setNews(marketNews);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up interval for refreshing
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchNews, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNews, refreshInterval]);

  return {
    news,
    refresh: fetchNews
  };
};

// Enhanced hook that integrates with mock data orchestrator
export const useEnhancedMarketData = (symbols = ['NIFTY50', 'SENSEX'], options = {}) => {
  const [marketData, setMarketData] = useState(new Map());
  const [summary, setSummary] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const {
    refreshInterval = 5000,
    autoStart = true,
    includeOrchestrator = true
  } = options;

  const updateData = useCallback(() => {
    try {
      // Get data from mock real-time service
      const newData = new Map();
      symbols.forEach(symbol => {
        const price = mockRealTimeData.getCurrentPrice(symbol);
        if (price) {
          newData.set(symbol, price);
        }
      });

      // Get market summary from orchestrator if enabled
      let marketSummary = null;
      if (includeOrchestrator) {
        marketSummary = mockDataOrchestrator.getMarketSummary();
      } else {
        marketSummary = mockRealTimeData.getMarketSummary();
      }

      setMarketData(newData);
      setSummary(marketSummary);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err);
      setIsConnected(false);
    }
  }, [symbols, includeOrchestrator]);

  useEffect(() => {
    if (autoStart) {
      // Initial fetch
      updateData();

      // Set up interval
      if (refreshInterval > 0) {
        intervalRef.current = setInterval(updateData, refreshInterval);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, refreshInterval, updateData]);

  const getPrice = useCallback((symbol) => {
    return marketData.get(symbol);
  }, [marketData]);

  const simulateEvent = useCallback((symbol, percentage) => {
    if (includeOrchestrator) {
      mockDataOrchestrator.simulateMarketMovement(symbol, percentage);
    }
  }, [includeOrchestrator]);

  return {
    marketData,
    summary,
    isConnected,
    error,
    getPrice,
    simulateEvent,
    refresh: updateData
  };
};

// Hook for enhanced portfolio tracking with orchestrator integration
export const useEnhancedPortfolio = (userId, investmentStyle = 'moderate') => {
  const [portfolio, setPortfolio] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get portfolio from orchestrator
      const portfolioData = mockDataOrchestrator.getUserPortfolio(userId);
      if (portfolioData) {
        setPortfolio(portfolioData);
      }

      // Get analytics if available
      const userProfile = mockDataOrchestrator.getUserProfile(userId);
      if (userProfile && portfolioData) {
        // Calculate analytics
        const totalSpending = Object.values(userProfile.spendingCategories)
          .reduce((sum, percent) => sum + (userProfile.avgTransactionAmount * userProfile.transactionFrequency * percent), 0);
        
        setAnalytics({
          totalValue: portfolioData.totalValue,
          monthlySpending: totalSpending,
          savingsRate: Math.max(0, 1 - (totalSpending / (portfolioData.totalValue * 0.1))),
          riskAlignment: userProfile.riskTolerance === portfolioData.investmentStyle ? 'aligned' : 'misaligned'
        });
      }

      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshPortfolio();
    }
  }, [userId, refreshPortfolio]);

  return {
    portfolio,
    analytics,
    isLoading,
    error,
    refresh: refreshPortfolio
  };
};

// Hook for transaction simulation and tracking
export const useTransactionSimulation = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState(null);
  const intervalRef = useRef(null);

  const generateTransaction = useCallback((category) => {
    if (!userId) return null;
    
    const transaction = mockDataOrchestrator.simulateTransaction(userId, category);
    setLatestTransaction(transaction);
    setTransactions(prev => [transaction, ...prev.slice(0, 49)]); // Keep last 50
    return transaction;
  }, [userId]);

  const startSimulation = useCallback((intervalMs = 30000) => {
    if (intervalRef.current || !userId) return;

    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        generateTransaction();
      }
    }, intervalMs);
  }, [userId, generateTransaction]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsSimulating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    transactions,
    latestTransaction,
    isSimulating,
    generateTransaction,
    startSimulation,
    stopSimulation
  };
};
