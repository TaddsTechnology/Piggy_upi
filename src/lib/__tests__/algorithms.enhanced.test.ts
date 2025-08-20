import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RoundupCalculator,
  InvestmentSweeper, 
  PortfolioValuator,
  PriceFeedSimulator,
  generateMockTransactions,
  formatCurrency,
  formatPercentage,
  isAutoSweepDay,
  PORTFOLIO_PRESETS,
  type Transaction,
  type RoundupRule,
  type PiggyLedgerEntry,
  type Holding,
  type AllocationRule
} from '../algorithms';

describe('RoundupCalculator', () => {
  let calculator: RoundupCalculator;
  let defaultRule: RoundupRule;

  beforeEach(() => {
    defaultRule = {
      roundToNearest: 10,
      minRoundup: 1,
      maxRoundup: 50
    };
    calculator = new RoundupCalculator(defaultRule);
  });

  describe('calculateRoundup', () => {
    it('should calculate correct roundup for various amounts', () => {
      expect(calculator.calculateRoundup(127)).toBe(3); // 127 -> 130
      expect(calculator.calculateRoundup(134)).toBe(6); // 134 -> 140
      expect(calculator.calculateRoundup(150)).toBe(0); // 150 -> 150 (no roundup)
      expect(calculator.calculateRoundup(99.50)).toBe(0); // 99.50 rounds to 100, already a multiple of 10
    });

    it('should respect min and max roundup bounds', () => {
      const rule: RoundupRule = { roundToNearest: 100, minRoundup: 5, maxRoundup: 50 };
      const calc = new RoundupCalculator(rule);
      
      expect(calc.calculateRoundup(299)).toBe(0); // Would be 1, but min is 5, so 0
      expect(calc.calculateRoundup(151)).toBe(49); // 151 -> 200, roundup = 49
      expect(calc.calculateRoundup(100)).toBe(0); // Already rounded
    });

    it('should handle edge cases', () => {
      expect(calculator.calculateRoundup(0)).toBe(0);
      expect(calculator.calculateRoundup(10)).toBe(0);
      expect(calculator.calculateRoundup(10.01)).toBe(9.99);
    });

    it('should handle different rounding values', () => {
      const rule20: RoundupRule = { roundToNearest: 20, minRoundup: 1, maxRoundup: 50 };
      const calc20 = new RoundupCalculator(rule20);
      
      expect(calc20.calculateRoundup(127)).toBe(13); // 127 -> 140
      expect(calc20.calculateRoundup(140)).toBe(0); // Already rounded
      
      const rule50: RoundupRule = { roundToNearest: 50, minRoundup: 1, maxRoundup: 50 };
      const calc50 = new RoundupCalculator(rule50);
      
      expect(calc50.calculateRoundup(127)).toBe(23); // 127 -> 150
      expect(calc50.calculateRoundup(175)).toBe(25); // 175 -> 200
    });
  });

  describe('processTransactions', () => {
    it('should process multiple transactions correctly', () => {
      const transactions: Transaction[] = [
        {
          id: 'txn1',
          amount: 127,
          direction: 'debit',
          timestamp: new Date(),
          merchant: 'Test Merchant'
        },
        {
          id: 'txn2', 
          amount: 250,
          direction: 'debit',
          timestamp: new Date(),
          merchant: 'Another Merchant'
        },
        {
          id: 'txn3',
          amount: 100,
          direction: 'credit', // Should be ignored
          timestamp: new Date()
        }
      ];

      const roundups = calculator.processTransactions(transactions);
      
      expect(roundups).toHaveLength(1); // Only transactions with non-zero roundups
      expect(roundups[0].amount).toBe(3); // 127 -> 130
      expect(roundups[0].type).toBe('roundup_credit');
      expect(roundups[0].reference).toBe('txn1');
    });

    it('should handle empty transaction list', () => {
      const roundups = calculator.processTransactions([]);
      expect(roundups).toHaveLength(0);
    });
  });
});

describe('InvestmentSweeper', () => {
  let sweeper: InvestmentSweeper;
  let allocations: AllocationRule[];

  beforeEach(() => {
    allocations = [
      { symbol: 'NIFTYBEES', name: 'Nifty 50 ETF', weightPct: 70, type: 'etf' },
      { symbol: 'GOLDBEES', name: 'Gold ETF', weightPct: 30, type: 'etf' }
    ];
    sweeper = new InvestmentSweeper(allocations, 100);
  });

  describe('calculateBalance', () => {
    it('should calculate correct balance from ledger entries', () => {
      const entries: PiggyLedgerEntry[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 50,
          type: 'roundup_credit',
          timestamp: new Date()
        },
        {
          id: '2', 
          userId: 'user1',
          amount: 100,
          type: 'manual_topup',
          timestamp: new Date()
        },
        {
          id: '3',
          userId: 'user1', 
          amount: 25,
          type: 'investment_debit',
          timestamp: new Date()
        }
      ];

      const balance = sweeper.calculateBalance(entries);
      expect(balance).toBe(125); // 50 + 100 - 25
    });

    it('should handle empty ledger', () => {
      const balance = sweeper.calculateBalance([]);
      expect(balance).toBe(0);
    });
  });

  describe('shouldSweep', () => {
    it('should return true when conditions are met', () => {
      expect(sweeper.shouldSweep(150, true)).toBe(true);
      expect(sweeper.shouldSweep(100, true)).toBe(true); // Equal to min
    });

    it('should return false when conditions are not met', () => {
      expect(sweeper.shouldSweep(150, false)).toBe(false); // Not sweep day
      expect(sweeper.shouldSweep(50, true)).toBe(false); // Below minimum
      expect(sweeper.shouldSweep(50, false)).toBe(false); // Both conditions fail
    });
  });

  describe('createOrders', () => {
    it('should create orders with correct allocations', () => {
      const prices = { 'NIFTYBEES': 285.50, 'GOLDBEES': 65.25 };
      const orders = sweeper.createOrders(1000, prices);

      expect(orders).toHaveLength(2);
      
      // Check NIFTYBEES order (70% = 700, can buy 2 units = 571)
      const niftyOrder = orders.find(o => o.symbol === 'NIFTYBEES');
      expect(niftyOrder).toBeDefined();
      expect(niftyOrder!.side).toBe('buy');
      expect(niftyOrder!.quantity).toBe(2); // Math.floor(700 / 285.50)
      expect(niftyOrder!.amount).toBe(571); // 2 * 285.50
      
      // Check GOLDBEES order (30% = 300, can buy 4 units = 261)
      const goldOrder = orders.find(o => o.symbol === 'GOLDBEES');
      expect(goldOrder).toBeDefined();
      expect(goldOrder!.side).toBe('buy');
      expect(goldOrder!.quantity).toBe(4); // Math.floor(300 / 65.25)
      expect(goldOrder!.amount).toBe(261); // 4 * 65.25
    });

    it('should skip orders when insufficient funds for minimum unit', () => {
      const prices = { 'NIFTYBEES': 285.50, 'GOLDBEES': 65.25 };
      const orders = sweeper.createOrders(100, prices); // Small amount
      
      // Should skip NIFTYBEES (70% of 100 = 70, less than 285.50)
      // Should create GOLDBEES order (30% of 100 = 30, less than 65.25 but let's check)
      expect(orders.length).toBeLessThan(2);
    });

    it('should handle missing prices gracefully', () => {
      const prices = { 'NIFTYBEES': 285.50 }; // Missing GOLDBEES price
      const orders = sweeper.createOrders(1000, prices);
      
      expect(orders).toHaveLength(1);
      expect(orders[0].symbol).toBe('NIFTYBEES');
    });
  });
});

describe('PortfolioValuator', () => {
  let valuator: PortfolioValuator;

  beforeEach(() => {
    valuator = new PortfolioValuator();
  });

  describe('calculateHoldingValue', () => {
    it('should calculate correct holding value', () => {
      const holding: Holding = {
        symbol: 'NIFTYBEES',
        units: 10,
        avgCost: 280,
        currentPrice: 285.50,
        currentValue: 0 // Will be calculated
      };

      const value = valuator.calculateHoldingValue(holding);
      expect(value).toBe(2855); // 10 * 285.50
    });
  });

  describe('calculatePortfolioValue', () => {
    it('should sum all holding values', () => {
      const holdings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 10,
          avgCost: 280,
          currentPrice: 285.50,
          currentValue: 2855
        },
        {
          symbol: 'GOLDBEES', 
          units: 20,
          avgCost: 60,
          currentPrice: 65.25,
          currentValue: 1305
        }
      ];

      const totalValue = valuator.calculatePortfolioValue(holdings);
      expect(totalValue).toBe(4160); // 2855 + 1305
    });

    it('should handle empty portfolio', () => {
      const totalValue = valuator.calculatePortfolioValue([]);
      expect(totalValue).toBe(0);
    });
  });

  describe('calculateReturns', () => {
    it('should calculate returns correctly', () => {
      const holdings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 10,
          avgCost: 280,
          currentPrice: 285.50,
          currentValue: 2855
        },
        {
          symbol: 'GOLDBEES',
          units: 20, 
          avgCost: 60,
          currentPrice: 65.25,
          currentValue: 1305
        }
      ];

      const returns = valuator.calculateReturns(holdings);
      
      expect(returns.invested).toBe(4000); // (10*280) + (20*60)
      expect(returns.current).toBe(4160); // 2855 + 1305
      expect(returns.gains).toBe(160); // 4160 - 4000
      expect(returns.gainsPercent).toBe(4); // (160/4000) * 100
    });

    it('should handle zero investment', () => {
      const returns = valuator.calculateReturns([]);
      
      expect(returns.invested).toBe(0);
      expect(returns.current).toBe(0);
      expect(returns.gains).toBe(0);
      expect(returns.gainsPercent).toBe(0);
    });

    it('should handle negative returns', () => {
      const holdings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 10,
          avgCost: 300, // Bought at higher price
          currentPrice: 285.50,
          currentValue: 2855
        }
      ];

      const returns = valuator.calculateReturns(holdings);
      
      expect(returns.invested).toBe(3000);
      expect(returns.current).toBe(2855);
      expect(returns.gains).toBe(-145);
      expect(returns.gainsPercent).toBeCloseTo(-4.83, 2);
    });
  });

  describe('updateHolding', () => {
    it('should create new holding when none exists', () => {
      const newHolding = valuator.updateHolding(null, 10, 285.50);
      
      expect(newHolding.units).toBe(10);
      expect(newHolding.avgCost).toBe(285.50);
      expect(newHolding.currentPrice).toBe(285.50);
      expect(newHolding.currentValue).toBe(2855);
    });

    it('should update existing holding correctly', () => {
      const existingHolding: Holding = {
        symbol: 'NIFTYBEES',
        units: 10,
        avgCost: 280,
        currentPrice: 285.50,
        currentValue: 2855
      };

      const updatedHolding = valuator.updateHolding(existingHolding, 5, 290);
      
      expect(updatedHolding.units).toBe(15); // 10 + 5
      expect(updatedHolding.avgCost).toBeCloseTo(283.33, 2); // (10*280 + 5*290) / 15
      expect(updatedHolding.currentPrice).toBe(285.50); // Unchanged
    });
  });
});

describe('PriceFeedSimulator', () => {
  beforeEach(() => {
    // Mock Math.random for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentPrice', () => {
    it('should return prices within expected range', () => {
      const price = PriceFeedSimulator.getCurrentPrice('NIFTYBEES');
      const basePrice = 285.50;
      
      // With Math.random() = 0.5, variation = 0, so price = basePrice
      expect(price).toBeCloseTo(basePrice, 2);
    });

    it('should handle unknown symbols', () => {
      const price = PriceFeedSimulator.getCurrentPrice('UNKNOWN');
      expect(price).toBe(100); // Default price
    });
  });

  describe('getAllPrices', () => {
    it('should return prices for all symbols', () => {
      const prices = PriceFeedSimulator.getAllPrices();
      
      expect(prices).toHaveProperty('NIFTYBEES');
      expect(prices).toHaveProperty('GOLDBEES');
      expect(prices).toHaveProperty('LIQUIDBEES');
      expect(Object.keys(prices)).toHaveLength(3);
    });
  });
});

describe('Portfolio Presets', () => {
  it('should have correct preset configurations', () => {
    expect(PORTFOLIO_PRESETS.safe.allocations).toHaveLength(1);
    expect(PORTFOLIO_PRESETS.safe.allocations[0].symbol).toBe('GOLDBEES');
    expect(PORTFOLIO_PRESETS.safe.allocations[0].weightPct).toBe(100);

    expect(PORTFOLIO_PRESETS.balanced.allocations).toHaveLength(2);
    const totalWeight = PORTFOLIO_PRESETS.balanced.allocations.reduce((sum, alloc) => sum + alloc.weightPct, 0);
    expect(totalWeight).toBe(100);

    expect(PORTFOLIO_PRESETS.growth.allocations).toHaveLength(2);
    const growthWeight = PORTFOLIO_PRESETS.growth.allocations.reduce((sum, alloc) => sum + alloc.weightPct, 0);
    expect(growthWeight).toBe(100);
  });
});

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(1234567)).toBe('₹12,34,567');
      expect(formatCurrency(0)).toBe('₹0');
      expect(formatCurrency(999.99)).toBe('₹1,000'); // Rounds to nearest rupee
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(5.67)).toBe('+5.67%');
      expect(formatPercentage(-2.34)).toBe('-2.34%');
      expect(formatPercentage(0)).toBe('+0.00%');
      expect(formatPercentage(100)).toBe('+100.00%');
    });
  });

  describe('isAutoSweepDay', () => {
    it('should return true for Sundays', () => {
      const sunday = new Date('2023-12-03'); // A Sunday
      expect(isAutoSweepDay(sunday)).toBe(true);
    });

    it('should return false for other days', () => {
      const monday = new Date('2023-12-04'); // A Monday
      expect(isAutoSweepDay(monday)).toBe(false);
    });
  });
});

describe('generateMockTransactions', () => {
  it('should generate correct number of transactions', () => {
    const transactions = generateMockTransactions(5);
    expect(transactions).toHaveLength(5);
  });

  it('should generate transactions with required fields', () => {
    const transactions = generateMockTransactions(3);
    
    transactions.forEach(txn => {
      expect(txn).toHaveProperty('id');
      expect(txn).toHaveProperty('amount');
      expect(txn).toHaveProperty('direction', 'debit');
      expect(txn).toHaveProperty('timestamp');
      expect(txn).toHaveProperty('merchant');
      expect(txn).toHaveProperty('category');
      expect(txn).toHaveProperty('upiRef');
      
      expect(txn.amount).toBeGreaterThanOrEqual(50);
      expect(txn.amount).toBeLessThanOrEqual(2050);
      expect(txn.timestamp).toBeInstanceOf(Date);
    });
  });

  it('should generate unique transaction IDs', () => {
    const transactions = generateMockTransactions(10);
    const ids = transactions.map(t => t.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(transactions.length);
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should process large number of transactions efficiently', () => {
    const startTime = performance.now();
    const transactions = generateMockTransactions(1000);
    const calculator = new RoundupCalculator({
      roundToNearest: 10,
      minRoundup: 1,
      maxRoundup: 50
    });
    
    const roundups = calculator.processTransactions(transactions);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    expect(roundups.length).toBeLessThanOrEqual(transactions.length);
  });

  it('should calculate portfolio returns efficiently for large portfolios', () => {
    const startTime = performance.now();
    const holdings: Holding[] = Array.from({ length: 100 }, (_, i) => ({
      symbol: `ETF${i}`,
      units: Math.random() * 100,
      avgCost: Math.random() * 500 + 100,
      currentPrice: Math.random() * 500 + 100,
      currentValue: 0
    }));

    const valuator = new PortfolioValuator();
    const returns = valuator.calculateReturns(holdings);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    expect(returns).toHaveProperty('invested');
    expect(returns).toHaveProperty('current');
    expect(returns).toHaveProperty('gains');
    expect(returns).toHaveProperty('gainsPercent');
  });
});

// Edge case tests
describe('Edge Cases', () => {
  it('should handle very small amounts', () => {
    const calculator = new RoundupCalculator({
      roundToNearest: 10,
      minRoundup: 1,
      maxRoundup: 50
    });
    
    expect(calculator.calculateRoundup(0.01)).toBe(9.99);
    expect(calculator.calculateRoundup(0.99)).toBe(9.01);
  });

  it('should handle very large amounts', () => {
    const calculator = new RoundupCalculator({
      roundToNearest: 10,
      minRoundup: 1,
      maxRoundup: 50
    });
    
    expect(calculator.calculateRoundup(999999999.99)).toBe(0); // Due to floating point precision, mod is ~9.99 not exactly 9.99, so roundup is ~0.01 which is < minRoundup of 1
  });

  it('should handle portfolio with zero units', () => {
    const valuator = new PortfolioValuator();
    const holdings: Holding[] = [
      {
        symbol: 'TEST',
        units: 0,
        avgCost: 100,
        currentPrice: 150,
        currentValue: 0
      }
    ];
    
    const returns = valuator.calculateReturns(holdings);
    expect(returns.invested).toBe(0);
    expect(returns.current).toBe(0);
    expect(returns.gains).toBe(0);
    expect(returns.gainsPercent).toBe(0);
  });
});
