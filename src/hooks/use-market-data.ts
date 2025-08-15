// React Hook for Yahoo Finance API integration
import { useState, useEffect, useCallback, useRef } from 'react';
import { yahooFinanceAPI, MarketData, getFallbackQuotes, isMarketHours } from '@/lib/yahoo-finance-api';

export interface MarketDataState {
  data: Record<string, MarketData | null>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  marketStatus: {
    isOpen: boolean;
    marketState: string;
  };
}

export interface MarketDataActions {
  refreshData: () => Promise<void>;
  getSymbolData: (symbol: string) => MarketData | null;
  clearCache: () => void;
  getCacheStats: () => { size: number; symbols: string[] };
}

/**
 * Hook for managing market data from Yahoo Finance API
 * Now uses cached data by default and only calls API on manual refresh
 */
export const useMarketData = (
  symbols: string[] = ['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES'],
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    fallbackOnError?: boolean;
  } = {}
): [MarketDataState, MarketDataActions] => {
  
  const {
    autoRefresh = false, // Disabled by default - no automatic API calls
    refreshInterval = 300000, // 5 minutes if auto-refresh is enabled
    fallbackOnError = true
  } = options;

  const [state, setState] = useState<MarketDataState>({
    data: {},
    loading: true,
    error: null,
    lastUpdated: null,
    marketStatus: {
      isOpen: false,
      marketState: 'UNKNOWN'
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Load cached data initially (no API call)
   */
  const loadCachedData = useCallback(() => {
    if (isUnmountedRef.current) return;

    try {
      // Get cached data from localStorage or fallback
      const cachedData = yahooFinanceAPI.getCachedOrFallback();
      const hasValidData = Object.values(cachedData).some(data => data !== null);
      
      setState({
        data: cachedData,
        loading: false,
        error: hasValidData ? null : 'Using cached data',
        lastUpdated: hasValidData ? new Date() : null,
        marketStatus: {
          isOpen: isMarketHours(),
          marketState: 'CACHED'
        }
      });
    } catch (error) {
      console.error('Error loading cached data:', error);
      const fallbackData = getFallbackQuotes();
      
      setState({
        data: fallbackData,
        loading: false,
        error: 'Using fallback data',
        lastUpdated: new Date(),
        marketStatus: {
          isOpen: isMarketHours(),
          marketState: 'FALLBACK'
        }
      });
    }
  }, []); // Remove symbols dependency to prevent infinite loops

  /**
   * Fetch fresh market data from API (only when explicitly called)
   */
  const fetchFreshData = useCallback(async (showLoading = true) => {
    if (isUnmountedRef.current) return;

    try {
      if (showLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      // Add .NS suffix for Yahoo Finance API
      const yahooSymbols = symbols.map(symbol => 
        symbol.includes('.NS') ? symbol : `${symbol}.NS`
      );

      // Fetch market data with force refresh
      const marketData = await yahooFinanceAPI.getMultipleQuotes(yahooSymbols, true);

      // Check if any data was successfully fetched
      const hasValidData = Object.values(marketData).some(data => data !== null);

      if (!hasValidData && fallbackOnError) {
        console.warn('No valid data from Yahoo Finance API, keeping cached data');
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'API unavailable - showing cached data'
        }));
        return;
      }

      if (!isUnmountedRef.current) {
        setState({
          data: marketData,
          loading: false,
          error: hasValidData ? null : 'Failed to fetch market data',
          lastUpdated: new Date(),
          marketStatus: {
            isOpen: isMarketHours(),
            marketState: hasValidData ? 'LIVE' : 'ERROR'
          }
        });
      }

    } catch (error) {
      console.error('Error fetching fresh market data:', error);
      
      if (!isUnmountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Network error - showing cached data'
        }));
      }
    }
  }, [symbols, fallbackOnError]);

  /**
   * Manual refresh function (calls API)
   */
  const refreshData = useCallback(async () => {
    await fetchFreshData(true);
  }, [fetchFreshData]);

  /**
   * Get data for a specific symbol
   */
  const getSymbolData = useCallback((symbol: string): MarketData | null => {
    const cleanSymbol = symbol.replace('.NS', '');
    return state.data[cleanSymbol] || null;
  }, [state.data]);

  /**
   * Clear API cache
   */
  const clearCache = useCallback(() => {
    yahooFinanceAPI.clearCache();
    // Reload cached data after clearing cache
    loadCachedData();
  }, [loadCachedData]);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return yahooFinanceAPI.getCacheStats();
  }, []);

  // Initial data load (cached data only)
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Auto-refresh setup (disabled by default)
  useEffect(() => {
    if (!autoRefresh) return;

    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        // Only refresh during market hours
        if (isMarketHours()) {
          fetchFreshData(false);
        }
      }, refreshInterval);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchFreshData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const actions: MarketDataActions = {
    refreshData,
    getSymbolData,
    clearCache,
    getCacheStats
  };

  return [state, actions];
};

/**
 * Hook for single symbol market data
 */
export const useSymbolData = (
  symbol: string,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
  } = {}
): [MarketData | null, boolean, string | null, () => Promise<void>] => {
  
  const [marketState, marketActions] = useMarketData([symbol], options);
  
  const symbolData = marketState.data[symbol.replace('.NS', '')] || null;
  
  return [
    symbolData,
    marketState.loading,
    marketState.error,
    marketActions.refreshData
  ];
};

/**
 * Hook for market status only
 * Now uses cached data and doesn't call API automatically
 */
export const useMarketStatus = (): {
  isOpen: boolean;
  marketState: string;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [status, setStatus] = useState({
    isOpen: false,
    marketState: 'CACHED',
    loading: false // Start with loading = false
  });

  const fetchStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const marketStatus = await yahooFinanceAPI.getMarketStatus();
      setStatus({
        ...marketStatus,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching market status:', error);
      setStatus({
        isOpen: isMarketHours(),
        marketState: 'ERROR',
        loading: false
      });
    }
  }, []);

  // Initialize with cached market status (no API call)
  useEffect(() => {
    setStatus({
      isOpen: isMarketHours(),
      marketState: 'CACHED',
      loading: false
    });
  }, []);

  return {
    ...status,
    refresh: fetchStatus
  };
};

/**
 * Hook for searching symbols
 */
export const useSymbolSearch = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await yahooFinanceAPI.searchSymbols(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    search
  };
};
