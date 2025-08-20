// React Hooks for Mock Data Orchestrator Integration
// Provides seamless integration between React components and mock data system

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  mockDataOrchestrator, 
  RealisticTransactionGenerator,
  UserBehaviorSimulator,
  MarketEventSimulator,
  PortfolioSimulator
} from '../lib/mockDataOrchestrator';
import { mockRealTimeData } from '../lib/mockRealTimeData';

// Main hook for initializing mock data system
export function useMockDataOrchestrator() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await mockDataOrchestrator.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
      }
    };

    initialize();

    return () => {
      mockDataOrchestrator.destroy();
    };
  }, []);

  return { isInitialized, error };
}

// Hook for creating and managing demo users
export function useDemoUser(userType: 'conservative' | 'moderate' | 'aggressive' = 'moderate') {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const userIdRef = useRef<string>('demo_user_' + Date.now());

  const createDemoUser = useCallback(async (type?: 'conservative' | 'moderate' | 'aggressive') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const demoData = await mockDataOrchestrator.createDemoUser(
        userIdRef.current, 
        type || userType
      );
      setUserData(demoData);
      return demoData;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userType]);

  const getUserProfile = useCallback(() => {
    return mockDataOrchestrator.getUserProfile(userIdRef.current);
  }, []);

  const getUserPortfolio = useCallback(() => {
    return mockDataOrchestrator.getUserPortfolio(userIdRef.current);
  }, []);

  const generateTransaction = useCallback((category?: string) => {
    return mockDataOrchestrator.simulateTransaction(userIdRef.current, category);
  }, []);

  useEffect(() => {
    // Auto-create demo user on mount
    createDemoUser();
  }, [createDemoUser]);

  return {
    userData,
    isLoading,
    error,
    createDemoUser,
    getUserProfile,
    getUserPortfolio,
    generateTransaction,
    userId: userIdRef.current
  };
}

// Hook for real-time transaction simulation
export function useTransactionSimulator(userId?: string) {
  const [latestTransaction, setLatestTransaction] = useState<any>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startSimulation = useCallback((intervalMs: number = 30000) => {
    if (intervalRef.current || !userId) return;

    setIsActive(true);
    intervalRef.current = setInterval(() => {
      // 30% chance of generating a transaction each interval
      if (Math.random() < 0.3) {
        const transaction = RealisticTransactionGenerator.generateRealisticTransaction(userId);
        setLatestTransaction(transaction);
        setTransactionHistory(prev => [transaction, ...prev.slice(0, 49)]); // Keep last 50
        
        // Log for development
        console.log('🔄 Auto-generated transaction:', {
          merchant: transaction.merchant,
          amount: `₹${transaction.amount}`,
          category: transaction.category
        });
      }
    }, intervalMs);
  }, [userId]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsActive(false);
  }, []);

  const generateManualTransaction = useCallback((category?: string) => {
    if (!userId) return null;
    
    const transaction = RealisticTransactionGenerator.generateRealisticTransaction(userId, category);
    setLatestTransaction(transaction);
    setTransactionHistory(prev => [transaction, ...prev.slice(0, 49)]);
    return transaction;
  }, [userId]);

  const generateBulkTransactions = useCallback((count: number, daysBack: number = 30) => {
    if (!userId) return [];
    
    const transactions = RealisticTransactionGenerator.generateBulkTransactions(userId, count, daysBack);
    setTransactionHistory(transactions);
    return transactions;
  }, [userId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    latestTransaction,
    transactionHistory,
    isActive,
    startSimulation,
    stopSimulation,
    generateManualTransaction,
    generateBulkTransactions
  };
}

// Hook for market data with live updates
export function useRealtimeMarketData(symbols: string[] = ['NIFTY50', 'SENSEX']) {
  const [marketData, setMarketData] = useState<Map<string, any>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Subscribe to market data updates
    const subscriptionId = mockRealTimeData.subscribe(symbols, (data) => {
      setMarketData(new Map(data.map(item => [item.symbol, item])));
      setLastUpdate(new Date());
      setIsConnected(true);
    });
    
    const unsubscribe = () => {
      if (subscriptionId) {
        mockRealTimeData.unsubscribe(subscriptionId);
      }
    };

    // Initial fetch
    symbols.forEach(symbol => {
      const price = mockRealTimeData.getCurrentPrice(symbol);
      if (price) {
        setMarketData(prev => new Map(prev.set(symbol, price)));
      }
    });

    setIsConnected(true);

    return () => {
      unsubscribe?.();
      setIsConnected(false);
    };
  }, [symbols]);

  const getCurrentPrice = useCallback((symbol: string) => {
    return marketData.get(symbol) || mockRealTimeData.getCurrentPrice(symbol);
  }, [marketData]);

  const simulateMarketEvent = useCallback((symbol: string, percentage: number) => {
    mockDataOrchestrator.simulateMarketMovement(symbol, percentage);
  }, []);

  return {
    marketData,
    isConnected,
    lastUpdate,
    getCurrentPrice,
    simulateMarketEvent
  };
}

// Hook for portfolio simulation and tracking
export function usePortfolioSimulator(userId?: string, investmentStyle: 'conservative' | 'moderate' | 'aggressive' = 'moderate') {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [isGrowthActive, setIsGrowthActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const generatePortfolio = useCallback(() => {
    if (!userId) return null;
    
    const newPortfolio = PortfolioSimulator.generateRealisticPortfolio(userId, investmentStyle);
    setPortfolio(newPortfolio);
    setPortfolioHistory([{ ...newPortfolio, timestamp: new Date() }]);
    return newPortfolio;
  }, [userId, investmentStyle]);

  const startGrowthSimulation = useCallback((intervalMs: number = 60000) => {
    if (intervalRef.current || !portfolio) return;

    setIsGrowthActive(true);
    intervalRef.current = setInterval(() => {
      const updatedPortfolio = PortfolioSimulator.simulatePortfolioGrowth({ ...portfolio });
      setPortfolio(updatedPortfolio);
      setPortfolioHistory(prev => [
        { ...updatedPortfolio, timestamp: new Date() },
        ...prev.slice(0, 99) // Keep last 100 snapshots
      ]);
    }, intervalMs);
  }, [portfolio]);

  const stopGrowthSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsGrowthActive(false);
  }, []);

  const getPortfolioMetrics = useCallback(() => {
    if (!portfolio || portfolioHistory.length < 2) return null;

    const current = portfolioHistory[0];
    const previous = portfolioHistory[1];
    
    const absoluteGain = current.totalValue - previous.totalValue;
    const percentageGain = (absoluteGain / previous.totalValue) * 100;

    return {
      currentValue: current.totalValue,
      previousValue: previous.totalValue,
      absoluteGain,
      percentageGain,
      dayChange: absoluteGain,
      dayChangePercent: percentageGain
    };
  }, [portfolio, portfolioHistory]);

  useEffect(() => {
    if (userId) {
      generatePortfolio();
    }
  }, [userId, generatePortfolio]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    portfolio,
    portfolioHistory,
    isGrowthActive,
    generatePortfolio,
    startGrowthSimulation,
    stopGrowthSimulation,
    getPortfolioMetrics
  };
}

// Hook for market events and news simulation
export function useMarketEventSimulator() {
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const startEventSimulation = useCallback(() => {
    MarketEventSimulator.startSimulation();
    setIsSimulating(true);
  }, []);

  const stopEventSimulation = useCallback(() => {
    MarketEventSimulator.stopSimulation();
    setIsSimulating(false);
  }, []);

  const simulateCustomEvent = useCallback((eventType: 'earnings' | 'policy' | 'global' | 'sector', impact: 'positive' | 'negative') => {
    const eventData = {
      type: eventType,
      impact,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setRecentEvents(prev => [eventData, ...prev.slice(0, 19)]); // Keep last 20 events

    // Trigger market impact based on event type
    switch (eventType) {
      case 'earnings':
        mockDataOrchestrator.simulateEarningsImpact('TCS', impact === 'positive');
        break;
      case 'policy':
      case 'global':
      case 'sector':
        mockDataOrchestrator.simulateNewsImpact(eventType, impact);
        break;
    }

    return eventData;
  }, []);

  useEffect(() => {
    // Auto-start if in development mode
    if (process.env.NODE_ENV === 'development') {
      startEventSimulation();
    }

    return () => {
      stopEventSimulation();
    };
  }, [startEventSimulation, stopEventSimulation]);

  return {
    recentEvents,
    isSimulating,
    startEventSimulation,
    stopEventSimulation,
    simulateCustomEvent
  };
}

// Hook for comprehensive demo data access
export function useDemoData() {
  const [demoData, setDemoData] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshDemoData = useCallback(() => {
    const newDemoData = mockDataOrchestrator.getDemoData();
    setDemoData(newDemoData);
    setRefreshCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    refreshDemoData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshDemoData, 30000);
    
    return () => clearInterval(interval);
  }, [refreshDemoData]);

  return {
    demoData,
    refreshDemoData,
    refreshCount
  };
}

// Hook for analytics and insights on mock data
export function useMockDataAnalytics(userId?: string) {
  const [analytics, setAnalytics] = useState<any>(null);

  const generateAnalytics = useCallback(() => {
    if (!userId) return null;

    const profile = mockDataOrchestrator.getUserProfile(userId);
    const portfolio = mockDataOrchestrator.getUserPortfolio(userId);

    if (!profile || !portfolio) return null;

    const spendingAnalytics = {
      totalSpending: Object.values(profile.spendingCategories as Record<string, number>)
        .reduce((sum: number, percent: number) => sum + (profile.avgTransactionAmount * profile.transactionFrequency * percent), 0),
      categoryBreakdown: profile.spendingCategories,
      avgTransactionSize: profile.avgTransactionAmount,
      monthlyTransactions: profile.transactionFrequency
    };

    const portfolioAnalytics = {
      totalValue: portfolio.totalValue,
      allocation: portfolio.allocation,
      riskLevel: profile.riskTolerance,
      investmentStyle: portfolio.investmentStyle
    };

    const insights = {
      savingsRate: Math.max(0, 1 - (spendingAnalytics.totalSpending / (portfolio.totalValue * 0.1))), // Rough calculation
      riskAlignment: profile.riskTolerance === portfolio.investmentStyle ? 'aligned' : 'misaligned',
      spendingTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing' // Mock trend
    };

    const result = {
      spending: spendingAnalytics,
      portfolio: portfolioAnalytics,
      insights,
      lastUpdated: new Date()
    };

    setAnalytics(result);
    return result;
  }, [userId]);

  useEffect(() => {
    if (userId) {
      generateAnalytics();
    }
  }, [userId, generateAnalytics]);

  return {
    analytics,
    generateAnalytics
  };
}

export default {
  useMockDataOrchestrator,
  useDemoUser,
  useTransactionSimulator,
  useRealtimeMarketData,
  usePortfolioSimulator,
  useMarketEventSimulator,
  useDemoData,
  useMockDataAnalytics
};
