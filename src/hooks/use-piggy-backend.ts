import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AuthService,
  UserService,
  TransactionService,
  LedgerService,
  OrdersService,
  HoldingsService,
  PriceService
} from '@/lib/backend-service';
import {
  PORTFOLIO_PRESETS,
  formatCurrency,
  formatPercentage,
  type Transaction,
  type RoundupRule,
  type PiggyLedgerEntry,
  type Holding
} from '@/lib/algorithms';
import type { User } from '@supabase/supabase-js';

export interface PiggyBackendState {
  // Auth State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User Settings
  roundupRule: RoundupRule;
  portfolioPreset: 'safe' | 'balanced' | 'growth';
  autoInvestEnabled: boolean;
  
  // Data from Backend
  transactions: Transaction[];
  ledger: PiggyLedgerEntry[];
  holdings: Holding[];
  prices: Record<string, number>;
  
  // Calculated Values
  piggyBalance: number;
  portfolioValue: number;
  totalInvested: number;
  totalGains: number;
  gainsPercent: number;
  
  // This Week's Progress
  weeklyTarget: number;
  weeklyProgress: number;
  weeklyRoundups: number;
  
  // Error handling
  error: string | null;
}

export interface PiggyBackendActions {
  // Auth Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Settings Actions
  updateRoundupRule: (rule: Partial<RoundupRule>) => Promise<void>;
  setPortfolioPreset: (preset: 'safe' | 'balanced' | 'growth') => Promise<void>;
  toggleAutoInvest: () => Promise<void>;
  
  // Transaction Actions
  manualInvest: (amount: number) => Promise<void>;
  simulateTransaction: (amount: number, merchant: string) => Promise<void>;
  
  // Data Actions
  refreshData: () => Promise<void>;
  refreshPrices: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

const DEFAULT_ROUNDUP_RULE: RoundupRule = {
  roundToNearest: 10,
  minRoundup: 1,
  maxRoundup: 50
};

const DEFAULT_WEEKLY_TARGET = 200;

export const usePiggyBackend = (): [PiggyBackendState, PiggyBackendActions] => {
  // Core State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [roundupRule, setRoundupRule] = useState<RoundupRule>(DEFAULT_ROUNDUP_RULE);
  const [portfolioPreset, setPortfolioPresetState] = useState<'safe' | 'balanced' | 'growth'>('balanced');
  const [autoInvestEnabled, setAutoInvestEnabledState] = useState(true);
  const [weeklyTarget, setWeeklyTarget] = useState(DEFAULT_WEEKLY_TARGET);
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledger, setLedger] = useState<PiggyLedgerEntry[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserData(currentUser.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        // Clear data on sign out
        setTransactions([]);
        setLedger([]);
        setHoldings([]);
        setPrices({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from backend
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Load user settings
      const userSettings = await UserService.getUserSettings(userId);
      if (userSettings) {
        setRoundupRule({
          roundToNearest: userSettings.round_to_nearest,
          minRoundup: userSettings.min_roundup,
          maxRoundup: userSettings.max_roundup
        });
        setPortfolioPresetState(userSettings.portfolio_preset);
        setAutoInvestEnabledState(userSettings.auto_invest_enabled);
        setWeeklyTarget(userSettings.weekly_target);
      }
      
      // Load transactions
      const userTransactions = await TransactionService.getUserTransactions(userId, 50);
      setTransactions(userTransactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        direction: t.direction,
        merchant: t.merchant,
        category: t.category,
        upiRef: t.upi_ref,
        timestamp: new Date(t.timestamp)
      })));
      
      // Load ledger
      const userLedger = await LedgerService.getUserLedger(userId, 100);
      setLedger(userLedger.map(l => ({
        id: l.id,
        userId: l.user_id,
        amount: Number(l.amount),
        type: l.type,
        reference: l.reference,
        timestamp: new Date(l.timestamp)
      })));
      
      // Load holdings
      const userHoldings = await HoldingsService.getUserHoldings(userId);
      setHoldings(userHoldings.map(h => ({
        symbol: h.symbol,
        units: Number(h.units),
        avgCost: Number(h.avg_cost),
        currentPrice: Number(h.current_price),
        currentValue: Number(h.current_value)
      })));
      
      // Load current prices
      const currentPrices = await PriceService.getCurrentPrices();
      setPrices(currentPrices);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate derived values
  const piggyBalance = useMemo(() => {
    return ledger.reduce((balance, entry) => {
      if (entry.type === 'roundup_credit' || entry.type === 'manual_topup') {
        return balance + entry.amount;
      } else if (entry.type === 'investment_debit') {
        return balance - entry.amount;
      }
      return balance;
    }, 0);
  }, [ledger]);

  const portfolioReturns = useMemo(() => {
    const updatedHoldings = holdings.map(holding => ({
      ...holding,
      currentPrice: prices[holding.symbol] || holding.currentPrice,
      currentValue: holding.units * (prices[holding.symbol] || holding.currentPrice)
    }));
    
    const invested = updatedHoldings.reduce((total, holding) => {
      return total + (holding.units * holding.avgCost);
    }, 0);
    
    const current = updatedHoldings.reduce((total, holding) => {
      return total + holding.currentValue;
    }, 0);
    
    const gains = current - invested;
    const gainsPercent = invested > 0 ? (gains / invested) * 100 : 0;
    
    return { invested, current, gains, gainsPercent };
  }, [holdings, prices]);

  const weeklyProgress = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekRoundups = ledger
      .filter(entry => 
        entry.type === 'roundup_credit' && 
        entry.timestamp >= weekStart
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      amount: thisWeekRoundups,
      percentage: (thisWeekRoundups / weeklyTarget) * 100
    };
  }, [ledger, weeklyTarget]);

  // Actions
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await AuthService.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await AuthService.signUp(email, password, fullName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await AuthService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  const updateRoundupRule = async (ruleUpdate: Partial<RoundupRule>) => {
    if (!user) return;
    
    try {
      setError(null);
      const newRule = { ...roundupRule, ...ruleUpdate };
      
      await UserService.updateUserSettings(user.id, {
        round_to_nearest: newRule.roundToNearest,
        min_roundup: newRule.minRoundup,
        max_roundup: newRule.maxRoundup
      });
      
      setRoundupRule(newRule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const setPortfolioPreset = async (preset: 'safe' | 'balanced' | 'growth') => {
    if (!user) return;
    
    try {
      setError(null);
      await UserService.updateUserSettings(user.id, { portfolio_preset: preset });
      setPortfolioPresetState(preset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio preset');
    }
  };

  const toggleAutoInvest = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const newValue = !autoInvestEnabled;
      await UserService.updateUserSettings(user.id, { auto_invest_enabled: newValue });
      setAutoInvestEnabledState(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle auto invest');
    }
  };

  const manualInvest = async (amount: number) => {
    if (!user || amount > piggyBalance) return;
    
    try {
      setError(null);
      const currentPreset = PORTFOLIO_PRESETS[portfolioPreset];
      await OrdersService.executeInvestment(user.id, amount, currentPreset.allocations);
      
      // Refresh data after investment
      await loadUserData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Investment failed');
    }
  };

  const simulateTransaction = async (amount: number, merchant: string) => {
    if (!user) return;
    
    try {
      setError(null);
      await TransactionService.simulateTransaction(user.id, amount, merchant);
      
      // Refresh transactions and ledger
      const [newTransactions, newLedger] = await Promise.all([
        TransactionService.getUserTransactions(user.id, 50),
        LedgerService.getUserLedger(user.id, 100)
      ]);
      
      setTransactions(newTransactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        direction: t.direction,
        merchant: t.merchant,
        category: t.category,
        upiRef: t.upi_ref,
        timestamp: new Date(t.timestamp)
      })));
      
      setLedger(newLedger.map(l => ({
        id: l.id,
        userId: l.user_id,
        amount: Number(l.amount),
        type: l.type,
        reference: l.reference,
        timestamp: new Date(l.timestamp)
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction simulation failed');
    }
  };

  const refreshData = async () => {
    if (!user) return;
    await loadUserData(user.id);
  };

  const refreshPrices = async () => {
    try {
      setError(null);
      const currentPrices = await PriceService.getCurrentPrices();
      setPrices(currentPrices);
      
      // Update holdings with new prices if user is logged in
      if (user) {
        await HoldingsService.updateHoldingPrices(user.id);
        const userHoldings = await HoldingsService.getUserHoldings(user.id);
        setHoldings(userHoldings.map(h => ({
          symbol: h.symbol,
          units: Number(h.units),
          avgCost: Number(h.avg_cost),
          currentPrice: Number(h.current_price),
          currentValue: Number(h.current_value)
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh prices');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const state: PiggyBackendState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    roundupRule,
    portfolioPreset,
    autoInvestEnabled,
    transactions,
    ledger,
    holdings: holdings.map(h => ({
      ...h,
      currentPrice: prices[h.symbol] || h.currentPrice,
      currentValue: h.units * (prices[h.symbol] || h.currentPrice)
    })),
    prices,
    piggyBalance,
    portfolioValue: portfolioReturns.current,
    totalInvested: portfolioReturns.invested,
    totalGains: portfolioReturns.gains,
    gainsPercent: portfolioReturns.gainsPercent,
    weeklyTarget,
    weeklyProgress: weeklyProgress.amount,
    weeklyRoundups: weeklyProgress.percentage
  };

  const actions: PiggyBackendActions = {
    signIn,
    signUp,
    signOut,
    updateRoundupRule,
    setPortfolioPreset,
    toggleAutoInvest,
    manualInvest,
    simulateTransaction,
    refreshData,
    refreshPrices,
    clearError
  };

  return [state, actions];
};
