import { describe, it, expect, beforeEach } from 'vitest';
import {
  RoundupCalculator,
  InvestmentSweeper,
  PortfolioValuator,
  PriceFeedSimulator,
  formatCurrency,
  formatPercentage,
  isAutoSweepDay,
  generateMockTransactions,
  PORTFOLIO_PRESETS,
  type Transaction,
  type RoundupRule,
  type Holding
} from '../algorithms';

describe('RoundupCalculator', () => {
  let calculator: RoundupCalculator;
  const rule: RoundupRule = {
    roundToNearest: 10,
    minRoundup: 1,
    maxRoundup: 50
  };

  beforeEach(() => {
    calculator = new RoundupCalculator(rule);
  });

  describe('calculateRoundup', () => {
    it('should calculate roundup correctly for amount ending in 5', () => {
      expect(calculator.calculateRoundup(125)).toBe(5);
    });

    it('should calculate roundup correctly for amount ending in 7', () => {
      expect(calculator.calculateRoundup(127)).toBe(3);
    });

    it('should return 0 for amounts already rounded', () => {
      expect(calculator.calculateRoundup(130)).toBe(0);
    });

    it('should return 0 for roundup below minimum', () => {
      const strictRule = { roundToNearest: 10, minRoundup: 5, maxRoundup: 50 };
      const strictCalculator = new RoundupCalculator(strictRule);
      expect(strictCalculator.calculateRoundup(129)).toBe(0); // Would be 1, but min is 5
    });

    it('should return 0 for roundup above maximum', () => {
      const lowMaxRule = { roundToNearest: 100, minRoundup: 1, maxRoundup: 10 };
      const lowMaxCalculator = new RoundupCalculator(lowMaxRule);
      expect(lowMaxCalculator.calculateRoundup(101)).toBe(0); // Would be 99, but max is 10
    });
  });

  describe('processTransactions', () => {
    it('should process only debit transactions', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          amount: 125,
          direction: 'debit',
          timestamp: new Date(),
          merchant: 'Test'
        },
        {
          id: '2',
          amount: 200,
          direction: 'credit', // Should be ignored
          timestamp: new Date(),
          merchant: 'Test'
        }
      ];

      const roundups = calculator.processTransactions(transactions);
      expect(roundups).toHaveLength(1);
      expect(roundups[0].amount).toBe(5);
      expect(roundups[0].reference).toBe('1');
    });

    it('should filter out zero roundups', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          amount: 130, // No roundup
          direction: 'debit',
          timestamp: new Date(),
          merchant: 'Test'
        },
        {
          id: '2',
          amount: 125, // 5 roundup
          direction: 'debit',
          timestamp: new Date(),
          merchant: 'Test'
        }
      ];

      const roundups = calculator.processTransactions(transactions);
      expect(roundups).toHaveLength(1);
      expect(roundups[0].reference).toBe('2');
    });
  });
});

describe('InvestmentSweeper', () => {
  let sweeper: InvestmentSweeper;
  const allocations = PORTFOLIO_PRESETS.balanced.allocations;

  beforeEach(() => {
    sweeper = new InvestmentSweeper(allocations, 100);
  });

  describe('calculateBalance', () => {
    it('should calculate correct balance from ledger entries', () => {
      const ledgerEntries = [
        {
          id: '1',
          userId: 'user1',
          amount: 50,
          type: 'roundup_credit' as const,
          timestamp: new Date()
        },
        {
          id: '2',
          userId: 'user1',
          amount: 30,
          type: 'manual_topup' as const,
          timestamp: new Date()
        },
        {
          id: '3',
          userId: 'user1',
          amount: 20,
          type: 'investment_debit' as const,
          timestamp: new Date()
        }
      ];

      const balance = sweeper.calculateBalance(ledgerEntries);
      expect(balance).toBe(60); // 50 + 30 - 20
    });
  });

  describe('shouldSweep', () => {
    it('should return true when balance meets minimum and is sweep day', () => {
      expect(sweeper.shouldSweep(150, true)).toBe(true);
    });

    it('should return false when balance is below minimum', () => {
      expect(sweeper.shouldSweep(50, true)).toBe(false);
    });

    it('should return false when not sweep day', () => {
      expect(sweeper.shouldSweep(150, false)).toBe(false);
    });
  });

  describe('createOrders', () => {
    it('should create orders based on allocation percentages', () => {
      const prices = {
        'NIFTYBEES': 285.50,
        'GOLDBEES': 65.25
      };
      const balance = 1000;

      const orders = sweeper.createOrders(balance, prices);
      expect(orders).toHaveLength(2);

      // Check NIFTY allocation (70% = 700, but can only buy 2 units = 571)
      const niftyOrder = orders.find(o => o.symbol === 'NIFTYBEES');
      expect(niftyOrder).toBeDefined();
      expect(niftyOrder?.quantity).toBe(2); // Math.floor(700 / 285.50)
      expect(niftyOrder?.amount).toBe(571); // 2 * 285.50

      // Check GOLD allocation (30% = 300, can buy 4 units = 261)
      const goldOrder = orders.find(o => o.symbol === 'GOLDBEES');
      expect(goldOrder).toBeDefined();
      expect(goldOrder?.quantity).toBe(4); // Math.floor(300 / 65.25)
      expect(goldOrder?.amount).toBe(261); // 4 * 65.25
    });

    it('should skip allocations with insufficient balance', () => {
      const prices = {
        'NIFTYBEES': 1000, // Price too high (70% of 100 = 70, can't buy 1 unit)
        'GOLDBEES': 65.25  // Price too high (30% of 100 = 30, can't buy 1 unit)
      };
      const balance = 100;

      const orders = sweeper.createOrders(balance, prices);
      // Should have no orders since allocations are too small for minimum units
      expect(orders).toHaveLength(0);
    });
  });
});

describe('PortfolioValuator', () => {
  let valuator: PortfolioValuator;

  beforeEach(() => {
    valuator = new PortfolioValuator();
  });

  describe('calculateReturns', () => {
    it('should calculate correct returns for profitable portfolio', () => {
      const holdings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 10,
          avgCost: 280,
          currentPrice: 290,
          currentValue: 2900
        },
        {
          symbol: 'GOLDBEES',
          units: 20,
          avgCost: 60,
          currentPrice: 65,
          currentValue: 1300
        }
      ];

      const returns = valuator.calculateReturns(holdings);
      expect(returns.invested).toBe(4000); // 10*280 + 20*60
      expect(returns.current).toBe(4200); // 2900 + 1300
      expect(returns.gains).toBe(200);
      expect(returns.gainsPercent).toBe(5); // 200/4000 * 100
    });

    it('should calculate correct returns for losing portfolio', () => {
      const holdings: Holding[] = [
        {
          symbol: 'NIFTYBEES',
          units: 10,
          avgCost: 300,
          currentPrice: 280,
          currentValue: 2800
        }
      ];

      const returns = valuator.calculateReturns(holdings);
      expect(returns.invested).toBe(3000);
      expect(returns.current).toBe(2800);
      expect(returns.gains).toBe(-200);
      expect(returns.gainsPercent).toBeCloseTo(-6.67, 2);
    });
  });

  describe('updateHolding', () => {
    it('should create new holding when none exists', () => {
      const holding = valuator.updateHolding(null, 10, 285);
      expect(holding.units).toBe(10);
      expect(holding.avgCost).toBe(285);
      expect(holding.currentPrice).toBe(285);
    });

    it('should update existing holding with correct average cost', () => {
      const existing: Holding = {
        symbol: 'NIFTYBEES',
        units: 10,
        avgCost: 280,
        currentPrice: 285,
        currentValue: 2850
      };

      const updated = valuator.updateHolding(existing, 5, 300);
      expect(updated.units).toBe(15);
      expect(updated.avgCost).toBeCloseTo(286.67, 2); // (10*280 + 5*300) / 15
    });
  });
});

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format Indian currency correctly', () => {
      expect(formatCurrency(1234)).toBe('₹1,234');
      expect(formatCurrency(123456)).toBe('₹1,23,456');
      expect(formatCurrency(0)).toBe('₹0');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentage with plus sign', () => {
      expect(formatPercentage(5.67)).toBe('+5.67%');
    });

    it('should format negative percentage with minus sign', () => {
      expect(formatPercentage(-3.45)).toBe('-3.45%');
    });

    it('should format zero percentage', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });
  });

  describe('isAutoSweepDay', () => {
    it('should return true for Sunday (day 0)', () => {
      const sunday = new Date('2023-07-02'); // A Sunday
      expect(isAutoSweepDay(sunday)).toBe(true);
    });

    it('should return false for non-Sunday', () => {
      const monday = new Date('2023-07-03'); // A Monday
      expect(isAutoSweepDay(monday)).toBe(false);
    });
  });

  describe('generateMockTransactions', () => {
    it('should generate specified number of transactions', () => {
      const transactions = generateMockTransactions(5);
      expect(transactions).toHaveLength(5);
    });

    it('should generate transactions with valid data', () => {
      const transactions = generateMockTransactions(1);
      const txn = transactions[0];
      
      expect(txn.id).toMatch(/^txn_\d+$/);
      expect(txn.direction).toBe('debit');
      expect(txn.amount).toBeGreaterThan(50);
      expect(txn.amount).toBeLessThan(2050);
      expect(txn.merchant).toBeTruthy();
      expect(txn.category).toBeTruthy();
      expect(txn.upiRef).toMatch(/^UPI[A-Z0-9]{9}$/);
    });
  });
});

describe('PriceFeedSimulator', () => {
  describe('getCurrentPrice', () => {
    it('should return price within reasonable variation', () => {
      const basePrice = 285.50;
      const price = PriceFeedSimulator.getCurrentPrice('NIFTYBEES');
      
      // Price should be within 2% variation
      expect(price).toBeGreaterThan(basePrice * 0.98);
      expect(price).toBeLessThan(basePrice * 1.02);
    });

    it('should return default price for unknown symbols', () => {
      const price = PriceFeedSimulator.getCurrentPrice('UNKNOWN');
      expect(price).toBeGreaterThan(98);
      expect(price).toBeLessThan(102);
    });
  });

  describe('getAllPrices', () => {
    it('should return prices for all known symbols', () => {
      const prices = PriceFeedSimulator.getAllPrices();
      expect(prices).toHaveProperty('NIFTYBEES');
      expect(prices).toHaveProperty('GOLDBEES');
      expect(prices).toHaveProperty('LIQUIDBEES');
    });
  });
});

describe('Portfolio Presets', () => {
  it('should have valid portfolio presets', () => {
    expect(PORTFOLIO_PRESETS.safe).toBeDefined();
    expect(PORTFOLIO_PRESETS.balanced).toBeDefined();
    expect(PORTFOLIO_PRESETS.growth).toBeDefined();
  });

  it('should have allocations that sum to 100%', () => {
    Object.values(PORTFOLIO_PRESETS).forEach(preset => {
      const totalWeight = preset.allocations.reduce((sum, alloc) => sum + alloc.weightPct, 0);
      expect(totalWeight).toBe(100);
    });
  });

  it('should have valid minimum sweep amounts', () => {
    Object.values(PORTFOLIO_PRESETS).forEach(preset => {
      expect(preset.minSweepAmount).toBeGreaterThan(0);
      expect(preset.minSweepAmount).toBeLessThan(1000);
    });
  });
});
