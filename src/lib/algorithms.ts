// UPI Piggy Core Algorithms
// Implements round-up calculation, weekly investment sweep, and portfolio valuation

export interface Transaction {
  id: string;
  amount: number;
  direction: 'debit' | 'credit';
  timestamp: Date;
  merchant?: string;
  category?: string;
  upiRef?: string;
}

export interface RoundupRule {
  roundToNearest: number; // 10, 20, 50, 100
  minRoundup: number; // minimum roundup amount (e.g., 1)
  maxRoundup: number; // maximum roundup amount (e.g., 50)
}

export interface PiggyLedgerEntry {
  id: string;
  userId: string;
  amount: number;
  type: 'roundup_credit' | 'manual_topup' | 'investment_debit';
  reference?: string;
  timestamp: Date;
}

export interface AllocationRule {
  symbol: string;
  name: string;
  weightPct: number;
  type: 'etf' | 'mutual_fund';
}

export interface Order {
  id: string;
  side: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'failed';
  timestamp: Date;
}

export interface Holding {
  symbol: string;
  units: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
}

export interface PortfolioPreset {
  name: 'safe' | 'balanced' | 'growth';
  allocations: AllocationRule[];
  minSweepAmount: number;
}

// A) Round-up Calculation Algorithm
export class RoundupCalculator {
  private rule: RoundupRule;

  constructor(rule: RoundupRule) {
    this.rule = rule;
  }

  calculateRoundup(amount: number): number {
    const r = this.rule.roundToNearest;
    const mod = amount % r;
    const roundup = (r - mod) % r;
    
    // Only return roundup if it's within bounds
    if (roundup >= this.rule.minRoundup && roundup <= this.rule.maxRoundup) {
      return roundup;
    }
    return 0;
  }

  processTransactions(transactions: Transaction[]): PiggyLedgerEntry[] {
    const roundups: PiggyLedgerEntry[] = [];
    
    for (const txn of transactions.filter(t => t.direction === 'debit')) {
      const roundupAmount = this.calculateRoundup(txn.amount);
      
      if (roundupAmount > 0) {
        roundups.push({
          id: `roundup_${txn.id}`,
          userId: 'current_user', // In real app, this would come from context
          amount: roundupAmount,
          type: 'roundup_credit',
          reference: txn.id,
          timestamp: new Date()
        });
      }
    }
    
    return roundups;
  }
}

// B) Weekly Investment Sweep Algorithm
export class InvestmentSweeper {
  private allocations: AllocationRule[];
  private minSweepAmount: number;

  constructor(allocations: AllocationRule[], minSweepAmount = 100) {
    this.allocations = allocations;
    this.minSweepAmount = minSweepAmount;
  }

  calculateBalance(ledgerEntries: PiggyLedgerEntry[]): number {
    const credits = ledgerEntries
      .filter(entry => ['roundup_credit', 'manual_topup'].includes(entry.type))
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const debits = ledgerEntries
      .filter(entry => entry.type === 'investment_debit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return credits - debits;
  }

  shouldSweep(balance: number, isAutoSweepDay: boolean): boolean {
    return balance >= this.minSweepAmount && isAutoSweepDay;
  }

  createOrders(balance: number, prices: Record<string, number>): Order[] {
    const orders: Order[] = [];
    
    for (const allocation of this.allocations) {
      const allocAmount = Math.floor(balance * allocation.weightPct / 100);
      const price = prices[allocation.symbol];
      
      if (!price || allocAmount < price) continue; // Skip if not enough for even 1 unit
      
      const units = Math.floor((allocAmount / price) * 1000000) / 1000000; // 6 decimal precision
      const totalAmount = units * price;
      
      orders.push({
        id: `order_${Date.now()}_${allocation.symbol}`,
        side: 'buy',
        symbol: allocation.symbol,
        quantity: units,
        amount: totalAmount,
        price: price,
        status: 'pending',
        timestamp: new Date()
      });
    }
    
    return orders;
  }
}

// C) Portfolio Valuation Algorithm
export class PortfolioValuator {
  calculateHoldingValue(holding: Holding): number {
    return holding.units * holding.currentPrice;
  }

  calculatePortfolioValue(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      return total + this.calculateHoldingValue(holding);
    }, 0);
  }

  calculateReturns(holdings: Holding[]): {
    invested: number;
    current: number;
    gains: number;
    gainsPercent: number;
  } {
    const invested = holdings.reduce((total, holding) => {
      return total + (holding.units * holding.avgCost);
    }, 0);
    
    const current = this.calculatePortfolioValue(holdings);
    const gains = current - invested;
    const gainsPercent = invested > 0 ? (gains / invested) * 100 : 0;
    
    return { invested, current, gains, gainsPercent };
  }

  updateHolding(
    existingHolding: Holding | null,
    newUnits: number,
    newPrice: number
  ): Holding {
    if (!existingHolding) {
      return {
        symbol: '',
        units: newUnits,
        avgCost: newPrice,
        currentPrice: newPrice,
        currentValue: newUnits * newPrice
      };
    }
    
    const totalUnits = existingHolding.units + newUnits;
    const totalCost = (existingHolding.units * existingHolding.avgCost) + (newUnits * newPrice);
    const newAvgCost = totalCost / totalUnits;
    
    return {
      ...existingHolding,
      units: totalUnits,
      avgCost: newAvgCost,
      currentValue: totalUnits * existingHolding.currentPrice
    };
  }
}

// D) Portfolio Allocation Presets
export const PORTFOLIO_PRESETS: Record<string, PortfolioPreset> = {
  safe: {
    name: 'safe',
    allocations: [
      {
        symbol: 'GOLDBEES',
        name: 'Gold ETF',
        weightPct: 100,
        type: 'etf'
      }
    ],
    minSweepAmount: 50
  },
  
  balanced: {
    name: 'balanced',
    allocations: [
      {
        symbol: 'NIFTYBEES',
        name: 'Nifty 50 ETF',
        weightPct: 70,
        type: 'etf'
      },
      {
        symbol: 'GOLDBEES',
        name: 'Gold ETF',
        weightPct: 30,
        type: 'etf'
      }
    ],
    minSweepAmount: 100
  },
  
  growth: {
    name: 'growth',
    allocations: [
      {
        symbol: 'NIFTYBEES',
        name: 'Nifty 50 ETF',
        weightPct: 80,
        type: 'etf'
      },
      {
        symbol: 'GOLDBEES',
        name: 'Gold ETF',
        weightPct: 20,
        type: 'etf'
      }
    ],
    minSweepAmount: 100
  }
};

// Price Feed Simulator (In production, this would be from broker API/NSE feed)
export class PriceFeedSimulator {
  private static mockPrices: Record<string, number> = {
    'NIFTYBEES': 285.50,
    'GOLDBEES': 65.25,
    'LIQUIDBEES': 100.05
  };
  
  private static priceVariation = 0.02; // 2% daily variation
  
  static getCurrentPrice(symbol: string): number {
    const basePrice = this.mockPrices[symbol] || 100;
    // Simulate small price movements
    const variation = (Math.random() - 0.5) * 2 * this.priceVariation;
    return Math.round((basePrice * (1 + variation)) * 100) / 100;
  }
  
  static getAllPrices(): Record<string, number> {
    const prices: Record<string, number> = {};
    for (const symbol in this.mockPrices) {
      prices[symbol] = this.getCurrentPrice(symbol);
    }
    return prices;
  }
}

// Utility Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const isAutoSweepDay = (date: Date = new Date()): boolean => {
  // Weekly sweep on Sundays (day 0)
  return date.getDay() === 0;
};

// Demo Data Generator
export const generateMockTransactions = (count = 10): Transaction[] => {
  const merchants = ['Zomato', 'Swiggy', 'Uber', 'Amazon', 'Flipkart', 'BigBasket', 'Metro Card', 'Starbucks'];
  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Grocery', 'Entertainment'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `txn_${i + 1}`,
    amount: Math.floor(Math.random() * 2000) + 50, // 50-2050 rupees
    direction: 'debit' as const,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    upiRef: `UPI${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }));
};
