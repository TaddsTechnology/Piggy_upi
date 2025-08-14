import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  RoundupCalculator,
  InvestmentSweeper,
  PortfolioValuator,
  PriceFeedSimulator,
  generateMockTransactions,
  PORTFOLIO_PRESETS,
  formatCurrency,
  formatPercentage,
  isAutoSweepDay,
  type Transaction,
  type RoundupRule,
  type PiggyLedgerEntry,
  type Holding,
  type PortfolioPreset
} from '@/lib/algorithms';
import type { User } from '@supabase/supabase-js';

export interface PiggyState {
  // User Settings
  roundupRule: RoundupRule;
  portfolioPreset: 'safe' | 'balanced' | 'growth';
  autoInvestEnabled: boolean;
  
  // Data
  transactions: Transaction[];
  ledger: PiggyLedgerEntry[];
  holdings: Holding[];
  
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
}

export interface PiggyActions {
  updateRoundupRule: (rule: Partial<RoundupRule>) => void;
  setPortfolioPreset: (preset: 'safe' | 'balanced' | 'growth') => void;
  toggleAutoInvest: () => void;
  manualInvest: (amount: number) => void;
  refreshPrices: () => void;
  simulateTransaction: (amount: number, merchant: string) => void;
}

const DEFAULT_ROUNDUP_RULE: RoundupRule = {
  roundToNearest: 10,
  minRoundup: 1,
  maxRoundup: 50
};

const DEFAULT_WEEKLY_TARGET = 200;

export const usePiggyCore = (): [PiggyState, PiggyActions] => {
  const { user, demoMode } = useAuth();
  // State
  const [roundupRule, setRoundupRule] = useState<RoundupRule>(DEFAULT_ROUNDUP_RULE);
  const [portfolioPreset, setPortfolioPresetState] = useState<'safe' | 'balanced' | 'growth'>('balanced');
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledger, setLedger] = useState<PiggyLedgerEntry[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Initialize data based on auth state
  useEffect(() => {
    if (demoMode) {
      // Demo user: load mock data
      const mockTransactions = generateMockTransactions(15);
      setTransactions(mockTransactions);
      
      const calculator = new RoundupCalculator(roundupRule);
      const initialRoundups = calculator.processTransactions(mockTransactions);
      setLedger(initialRoundups);
      
      const mockHoldings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 35.42,
          avgCost: 278.50,
          currentPrice: 285.50,
          currentValue: 35.42 * 285.50
        },
        {
          symbol: 'GOLDBEES',
          units: 76.89,
          avgCost: 63.20,
          currentPrice: 65.25,
          currentValue: 76.89 * 65.25
        }
      ];
      setHoldings(mockHoldings);
      
    } else if (user) {
      // Real user: load from backend (or show empty state)
      // In a real app, you would fetch data from your backend service here
      // For now, we will just show an empty state
      setTransactions([]);
      setLedger([]);
      setHoldings([]);
    }

    // Prices are always needed
    setPrices(PriceFeedSimulator.getAllPrices());

  }, [demoMode, user, roundupRule]);

  // Update roundups when rule changes
  useEffect(() => {
    const calculator = new RoundupCalculator(roundupRule);
    const roundups = calculator.processTransactions(transactions);
    
    // Keep non-roundup entries and add new roundups
    const nonRoundupEntries = ledger.filter(entry => entry.type !== 'roundup_credit');
    setLedger([...nonRoundupEntries, ...roundups]);
  }, [roundupRule, transactions]);

  // Initialize algorithms
  const roundupCalculator = useMemo(() => new RoundupCalculator(roundupRule), [roundupRule]);
  const portfolioValuator = useMemo(() => new PortfolioValuator(), []);
  
  const currentPreset = useMemo(() => PORTFOLIO_PRESETS[portfolioPreset], [portfolioPreset]);
  const investmentSweeper = useMemo(() => 
    new InvestmentSweeper(currentPreset.allocations, currentPreset.minSweepAmount),
    [currentPreset]
  );

  // Calculate derived values
  const piggyBalance = useMemo(() => 
    investmentSweeper.calculateBalance(ledger), [ledger, investmentSweeper]);
    
  const portfolioReturns = useMemo(() => {
    // Update holdings with current prices
    const updatedHoldings = holdings.map(holding => ({
      ...holding,
      currentPrice: prices[holding.symbol] || holding.currentPrice,
      currentValue: holding.units * (prices[holding.symbol] || holding.currentPrice)
    }));
    
    return portfolioValuator.calculateReturns(updatedHoldings);
  }, [holdings, prices, portfolioValuator]);

  // Weekly progress calculation
  const weeklyProgress = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekRoundups = ledger
      .filter(entry => 
        entry.type === 'roundup_credit' && 
        entry.timestamp >= weekStart
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      amount: thisWeekRoundups,
      percentage: (thisWeekRoundups / DEFAULT_WEEKLY_TARGET) * 100
    };
  }, [ledger]);

  // Actions
  const updateRoundupRule = (ruleUpdate: Partial<RoundupRule>) => {
    setRoundupRule(prev => ({ ...prev, ...ruleUpdate }));
  };

  const setPortfolioPreset = (preset: 'safe' | 'balanced' | 'growth') => {
    setPortfolioPresetState(preset);
  };

  const toggleAutoInvest = () => {
    setAutoInvestEnabled(prev => !prev);
  };

  const manualInvest = (amount: number) => {
    if (amount <= piggyBalance) {
      // Create manual investment entry
      const investmentEntry: PiggyLedgerEntry = {
        id: `manual_invest_${Date.now()}`,
        userId: 'current_user',
        amount: amount,
        type: 'investment_debit',
        timestamp: new Date()
      };
      
      setLedger(prev => [...prev, investmentEntry]);
      
      // Simulate investment orders (in real app, this would call broker API)
      const orders = investmentSweeper.createOrders(amount, prices);
      console.log('Manual investment orders:', orders);
      
      // Update holdings (simplified simulation)
      orders.forEach(order => {
        const existingHolding = holdings.find(h => h.symbol === order.symbol);
        const updatedHolding = portfolioValuator.updateHolding(
          existingHolding || null,
          order.quantity,
          order.price
        );
        
        setHoldings(prev => {
          const filtered = prev.filter(h => h.symbol !== order.symbol);
          return [...filtered, { ...updatedHolding, symbol: order.symbol }];
        });
      });
    }
  };

  const refreshPrices = () => {
    setPrices(PriceFeedSimulator.getAllPrices());
  };

  const simulateTransaction = (amount: number, merchant: string) => {
    const newTransaction: Transaction = {
      id: `sim_txn_${Date.now()}`,
      amount,
      direction: 'debit',
      timestamp: new Date(),
      merchant,
      category: 'Simulated',
      upiRef: `SIM${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Calculate and add roundup
    const roundupAmount = roundupCalculator.calculateRoundup(amount);
    if (roundupAmount > 0) {
      const roundupEntry: PiggyLedgerEntry = {
        id: `roundup_${newTransaction.id}`,
        userId: 'current_user',
        amount: roundupAmount,
        type: 'roundup_credit',
        reference: newTransaction.id,
        timestamp: new Date()
      };
      
      setLedger(prev => [...prev, roundupEntry]);
    }
  };

  // Auto-invest simulation (would be a cron job in production)
  useEffect(() => {
    if (autoInvestEnabled && isAutoSweepDay() && piggyBalance >= currentPreset.minSweepAmount) {
      console.log('Auto-investment triggered:', {
        balance: piggyBalance,
        minSweep: currentPreset.minSweepAmount
      });
      // manualInvest(piggyBalance); // Uncomment to enable auto-invest simulation
    }
  }, [autoInvestEnabled, piggyBalance, currentPreset.minSweepAmount]);

  const state: PiggyState = {
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
    piggyBalance,
    portfolioValue: portfolioReturns.current,
    totalInvested: portfolioReturns.invested,
    totalGains: portfolioReturns.gains,
    gainsPercent: portfolioReturns.gainsPercent,
    weeklyTarget: DEFAULT_WEEKLY_TARGET,
    weeklyProgress: weeklyProgress.amount,
    weeklyRoundups: weeklyProgress.percentage
  };

  const actions: PiggyActions = {
    updateRoundupRule,
    setPortfolioPreset,
    toggleAutoInvest,
    manualInvest,
    refreshPrices,
    simulateTransaction
  };

  return [state, actions];
};
