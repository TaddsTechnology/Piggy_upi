// Mock Data Orchestrator - Acts as Real Data System
// This comprehensive system simulates all real-world data sources and behaviors

import { mockRealTimeData } from './mockRealTimeData';
import { MARKET_DATA_CONFIG, isMarketOpen, getMarketStatus } from '../config/marketData';
import { generateMockTransactions } from './algorithms';
import { 
  TransactionService, 
  LedgerService, 
  HoldingsService, 
  PriceService,
  NotificationService,
  AnalyticsService,
  PaymentGatewayService,
  KYCService,
  MarketDataService
} from './backend-service';

// Enhanced Transaction Generator with Realistic Patterns
export class RealisticTransactionGenerator {
  private static readonly MERCHANT_CATEGORIES = {
    'Food & Dining': {
      merchants: ['Zomato', 'Swiggy', 'McDonald\'s', 'KFC', 'Domino\'s', 'Subway', 'Starbucks', 'Cafe Coffee Day'],
      avgAmount: 250,
      variability: 0.6,
      timePatterns: [12, 13, 19, 20, 21], // Lunch and dinner hours
      frequency: 0.4 // 40% of transactions
    },
    'Transportation': {
      merchants: ['Uber', 'Ola', 'Metro Card', 'IRCTC', 'Redbus', 'Rapido'],
      avgAmount: 180,
      variability: 0.8,
      timePatterns: [8, 9, 18, 19, 20],
      frequency: 0.25
    },
    'Shopping': {
      merchants: ['Amazon', 'Flipkart', 'Myntra', 'Nykaa', 'BigBasket', 'Grofers'],
      avgAmount: 850,
      variability: 1.2,
      timePatterns: [10, 11, 14, 15, 16, 21, 22],
      frequency: 0.15
    },
    'Entertainment': {
      merchants: ['Netflix', 'BookMyShow', 'Spotify', 'Prime Video', 'Hotstar', 'YouTube'],
      avgAmount: 350,
      variability: 0.4,
      timePatterns: [19, 20, 21, 22, 23],
      frequency: 0.1
    },
    'Utilities': {
      merchants: ['Electricity Board', 'Gas Agency', 'Airtel', 'Jio', 'BSNL', 'Tata Sky'],
      avgAmount: 1200,
      variability: 0.3,
      timePatterns: [10, 11, 15, 16, 17],
      frequency: 0.1
    }
  };

  static generateRealisticTransaction(userId: string, forceCategory?: string): any {
    const categories = Object.keys(this.MERCHANT_CATEGORIES);
    const hour = new Date().getHours();
    
    // Choose category based on time and probability
    let selectedCategory = forceCategory;
    if (!selectedCategory) {
      // Weight categories by time of day and frequency
      const categoryWeights = categories.map(cat => {
        const config = this.MERCHANT_CATEGORIES[cat as keyof typeof this.MERCHANT_CATEGORIES];
        const timeWeight = config.timePatterns.includes(hour) ? 2 : 1;
        return {
          category: cat,
          weight: config.frequency * timeWeight
        };
      });
      
      const totalWeight = categoryWeights.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const item of categoryWeights) {
        random -= item.weight;
        if (random <= 0) {
          selectedCategory = item.category;
          break;
        }
      }
    }
    
    const config = this.MERCHANT_CATEGORIES[selectedCategory as keyof typeof this.MERCHANT_CATEGORIES];
    if (!config) {
      selectedCategory = 'Food & Dining';
    }
    
    const categoryConfig = this.MERCHANT_CATEGORIES[selectedCategory as keyof typeof this.MERCHANT_CATEGORIES];
    const merchant = categoryConfig.merchants[Math.floor(Math.random() * categoryConfig.merchants.length)];
    
    // Generate realistic amount with some variability
    const baseAmount = categoryConfig.avgAmount;
    const variability = categoryConfig.variability;
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    const variabilityFactor = 1 + (Math.random() - 0.5) * variability;
    
    let amount = Math.round(baseAmount * randomFactor * variabilityFactor);
    
    // Add some realistic amount patterns
    if (Math.random() < 0.3) {
      // Round to nearest 10 (30% chance)
      amount = Math.round(amount / 10) * 10;
    } else if (Math.random() < 0.1) {
      // Round to nearest 100 (10% chance)
      amount = Math.round(amount / 100) * 100;
    }
    
    return {
      user_id: userId,
      amount,
      direction: 'debit' as const,
      merchant,
      category: selectedCategory,
      upi_ref: this.generateUPIRef(),
      status: 'completed' as const,
      timestamp: new Date().toISOString()
    };
  }

  static generateBulkTransactions(userId: string, count: number, daysBack: number = 30): any[] {
    const transactions = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      // Distribute transactions over the past days with realistic patterns
      const daysAgo = Math.random() * daysBack;
      const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
      
      // Skip weekends for some transaction types
      if (timestamp.getDay() === 0 || timestamp.getDay() === 6) {
        if (Math.random() < 0.7) continue; // 70% chance to skip weekend
      }
      
      // Adjust hour to realistic patterns
      const hour = this.getRealisticHour();
      timestamp.setHours(hour, Math.random() * 60, Math.random() * 60);
      
      const transaction = this.generateRealisticTransaction(userId);
      transaction.timestamp = timestamp.toISOString();
      
      transactions.push(transaction);
    }
    
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private static generateUPIRef(): string {
    const prefix = Math.random() < 0.5 ? 'UPI' : Math.random() < 0.5 ? 'TXN' : 'PAY';
    const numbers = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${numbers}${suffix}`;
  }

  private static getRealisticHour(): number {
    // Weighted distribution of transaction hours
    const hourWeights = {
      0: 0.1, 1: 0.05, 2: 0.02, 3: 0.01, 4: 0.01, 5: 0.02,
      6: 0.05, 7: 0.1, 8: 0.15, 9: 0.12, 10: 0.08, 11: 0.08,
      12: 0.1, 13: 0.09, 14: 0.07, 15: 0.08, 16: 0.09, 17: 0.1,
      18: 0.12, 19: 0.15, 20: 0.14, 21: 0.12, 22: 0.08, 23: 0.05
    };
    
    const totalWeight = Object.values(hourWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [hour, weight] of Object.entries(hourWeights)) {
      random -= weight;
      if (random <= 0) {
        return parseInt(hour);
      }
    }
    
    return 12; // Fallback
  }
}

// Enhanced User Behavior Simulator
export class UserBehaviorSimulator {
  static generateUserProfile(userId: string): any {
    const profileTypes = ['conservative', 'moderate', 'aggressive', 'student', 'professional'];
    const profileType = profileTypes[Math.floor(Math.random() * profileTypes.length)];
    
    const profiles = {
      conservative: {
        avgTransactionAmount: 200,
        transactionFrequency: 15, // per month
        preferredMerchants: ['BigBasket', 'Electricity Board', 'Metro Card'],
        spendingCategories: { 'Food & Dining': 0.3, 'Utilities': 0.4, 'Transportation': 0.3 },
        riskTolerance: 'low',
        portfolioPreference: 'safe'
      },
      moderate: {
        avgTransactionAmount: 400,
        transactionFrequency: 25,
        preferredMerchants: ['Zomato', 'Amazon', 'Uber', 'Netflix'],
        spendingCategories: { 'Food & Dining': 0.4, 'Shopping': 0.3, 'Transportation': 0.2, 'Entertainment': 0.1 },
        riskTolerance: 'medium',
        portfolioPreference: 'balanced'
      },
      aggressive: {
        avgTransactionAmount: 800,
        transactionFrequency: 35,
        preferredMerchants: ['Amazon', 'Flipkart', 'BookMyShow', 'Swiggy'],
        spendingCategories: { 'Shopping': 0.4, 'Food & Dining': 0.3, 'Entertainment': 0.2, 'Transportation': 0.1 },
        riskTolerance: 'high',
        portfolioPreference: 'growth'
      },
      student: {
        avgTransactionAmount: 150,
        transactionFrequency: 20,
        preferredMerchants: ['Zomato', 'Metro Card', 'Netflix', 'Amazon'],
        spendingCategories: { 'Food & Dining': 0.5, 'Transportation': 0.3, 'Entertainment': 0.2 },
        riskTolerance: 'low',
        portfolioPreference: 'safe'
      },
      professional: {
        avgTransactionAmount: 600,
        transactionFrequency: 30,
        preferredMerchants: ['Uber', 'Starbucks', 'Amazon', 'BookMyShow'],
        spendingCategories: { 'Food & Dining': 0.35, 'Transportation': 0.25, 'Shopping': 0.25, 'Entertainment': 0.15 },
        riskTolerance: 'medium',
        portfolioPreference: 'balanced'
      }
    };
    
    return {
      userId,
      profileType,
      ...profiles[profileType as keyof typeof profiles],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  static simulateUserActivity(userId: string, userProfile: any): void {
    // Simulate periodic transactions based on user profile
    const generateTransaction = () => {
      const transaction = RealisticTransactionGenerator.generateRealisticTransaction(userId);
      
      // Store in backend (in real app, this would go through proper API)
      console.log('📱 Simulated UPI Transaction:', {
        merchant: transaction.merchant,
        amount: `₹${transaction.amount}`,
        category: transaction.category,
        time: new Date(transaction.timestamp).toLocaleTimeString()
      });
      
      // You could integrate this with your backend service here
      // TransactionService.createTransaction(transaction);
    };

    // Set up realistic transaction patterns
    const baseInterval = (24 * 60 * 60 * 1000) / userProfile.transactionFrequency; // Daily transactions
    const randomizedInterval = baseInterval * (0.5 + Math.random()); // Add randomness
    
    setTimeout(() => {
      if (Math.random() < 0.3) { // 30% chance of generating a transaction
        generateTransaction();
      }
      // Schedule next check
      UserBehaviorSimulator.simulateUserActivity(userId, userProfile);
    }, randomizedInterval);
  }
}

// Market Event Simulator
export class MarketEventSimulator {
  private static events: any[] = [];
  private static isRunning = false;

  static startSimulation(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.scheduleRandomEvents();
    this.simulateMarketVolatility();
    this.simulateNewsEvents();
  }

  static stopSimulation(): void {
    this.isRunning = false;
  }

  private static scheduleRandomEvents(): void {
    if (!this.isRunning) return;
    
    // Schedule next random event in 30 seconds to 5 minutes
    const delay = 30000 + Math.random() * 270000;
    
    setTimeout(() => {
      this.generateRandomMarketEvent();
      this.scheduleRandomEvents();
    }, delay);
  }

  private static generateRandomMarketEvent(): void {
    const eventTypes = [
      {
        type: 'earnings_announcement',
        impact: 'high',
        description: 'Quarterly earnings announced',
        priceImpact: 0.05 // ±5%
      },
      {
        type: 'rbi_policy',
        impact: 'medium',
        description: 'RBI policy update',
        priceImpact: 0.03
      },
      {
        type: 'global_news',
        impact: 'low',
        description: 'Global market movement',
        priceImpact: 0.02
      },
      {
        type: 'sector_news',
        impact: 'medium',
        description: 'Sector-specific development',
        priceImpact: 0.04
      }
    ];

    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const isPositive = Math.random() > 0.5;
    
    // Apply price impact to random stocks
    const affectedStocks = this.getRandomStocks(1 + Math.floor(Math.random() * 3));
    
    affectedStocks.forEach(symbol => {
      const currentPrice = mockRealTimeData.getCurrentPrice(symbol);
      if (currentPrice) {
        const impact = event.priceImpact * (isPositive ? 1 : -1);
        const newPrice = currentPrice.price * (1 + impact);
        
        // Update the mock price directly
        mockRealTimeData.currentPrices?.set(symbol, {
          ...currentPrice,
          price: newPrice,
          lastUpdate: Date.now()
        });
      }
    });

    console.log('📰 Market Event:', {
      type: event.type,
      description: event.description,
      impact: `${isPositive ? '+' : ''}${(event.priceImpact * 100).toFixed(1)}%`,
      affectedStocks
    });
  }

  private static simulateMarketVolatility(): void {
    if (!this.isRunning) return;
    
    // Increase volatility during market hours
    if (isMarketOpen()) {
      const volatilityBoost = 1.2;
      // Apply to mock data service
      // mockRealTimeData.adjustVolatility(volatilityBoost);
    }
    
    setTimeout(() => this.simulateMarketVolatility(), 60000); // Check every minute
  }

  private static simulateNewsEvents(): void {
    if (!this.isRunning) return;
    
    const newsEvents = [
      "SEBI announces new mutual fund regulations",
      "FII inflows reach record high for the month",
      "Rupee strengthens against dollar on positive sentiment",
      "IT sector shows strong growth in Q3 earnings",
      "Banking stocks rally on NPA reduction news",
      "Oil prices impact OMC stocks positively",
      "Infrastructure spending boost announced in budget"
    ];

    const scheduleNews = () => {
      if (!this.isRunning) return;
      
      const news = newsEvents[Math.floor(Math.random() * newsEvents.length)];
      console.log('📺 Market News:', news);
      
      // Schedule next news in 2-10 minutes
      setTimeout(scheduleNews, 120000 + Math.random() * 480000);
    };

    scheduleNews();
  }

  private static getRandomStocks(count: number): string[] {
    const allStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR'];
    const shuffled = allStocks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// Intelligent Portfolio Simulator
export class PortfolioSimulator {
  static generateRealisticPortfolio(userId: string, investmentStyle: 'conservative' | 'moderate' | 'aggressive'): any {
    const styles = {
      conservative: {
        cash: 0.3,
        gold: 0.4,
        bonds: 0.2,
        equity: 0.1,
        totalValue: 15000 + Math.random() * 35000
      },
      moderate: {
        cash: 0.1,
        gold: 0.2,
        bonds: 0.2,
        equity: 0.5,
        totalValue: 25000 + Math.random() * 75000
      },
      aggressive: {
        cash: 0.05,
        gold: 0.1,
        bonds: 0.05,
        equity: 0.8,
        totalValue: 40000 + Math.random() * 160000
      }
    };

    const style = styles[investmentStyle];
    const totalValue = style.totalValue;

    // Generate holdings based on allocation
    const holdings = [];

    if (style.equity > 0) {
      holdings.push({
        symbol: 'NIFTYBEES',
        units: Math.round((totalValue * style.equity * 0.7) / 285.50 * 100) / 100,
        avgCost: 280 + Math.random() * 20,
        currentPrice: 285.50
      });
    }

    if (style.gold > 0) {
      holdings.push({
        symbol: 'GOLDBEES',
        units: Math.round((totalValue * style.gold) / 65.25 * 100) / 100,
        avgCost: 63 + Math.random() * 5,
        currentPrice: 65.25
      });
    }

    if (style.bonds > 0) {
      holdings.push({
        symbol: 'LIQUIDBEES',
        units: Math.round((totalValue * style.bonds) / 100.05 * 100) / 100,
        avgCost: 99 + Math.random() * 2,
        currentPrice: 100.05
      });
    }

    return {
      userId,
      investmentStyle,
      holdings,
      totalValue,
      allocation: style,
      lastUpdated: new Date()
    };
  }

  static simulatePortfolioGrowth(portfolio: any): any {
    // Simulate realistic portfolio growth over time
    const dailyGrowthRate = {
      conservative: 0.0003, // ~11% annually
      moderate: 0.0004,     // ~15% annually  
      aggressive: 0.0005    // ~18% annually
    };

    const baseGrowth = dailyGrowthRate[portfolio.investmentStyle as keyof typeof dailyGrowthRate];
    const volatility = Math.random() * 0.002 - 0.001; // ±0.1% daily volatility
    const growthFactor = 1 + baseGrowth + volatility;

    // Apply growth to each holding
    portfolio.holdings.forEach((holding: any) => {
      holding.currentPrice *= growthFactor;
      holding.currentValue = holding.units * holding.currentPrice;
    });

    // Recalculate totals
    portfolio.totalValue = portfolio.holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);
    portfolio.lastUpdated = new Date();

    return portfolio;
  }
}

// Comprehensive Mock Data Orchestrator
export class MockDataOrchestrator {
  private static instance: MockDataOrchestrator;
  private static isInitialized = false;
  private userProfiles = new Map<string, any>();
  private userPortfolios = new Map<string, any>();

  static getInstance(): MockDataOrchestrator {
    if (!this.instance) {
      this.instance = new MockDataOrchestrator();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (MockDataOrchestrator.isInitialized) return;

    console.log('🚀 Initializing Mock Data Orchestrator...');

    // Start market simulation
    MarketEventSimulator.startSimulation();
    
    // Initialize real-time market data
    mockRealTimeData.startUpdates?.();

    MockDataOrchestrator.isInitialized = true;
    console.log('✅ Mock Data Orchestrator initialized');
  }

  async createDemoUser(userId: string, userType: 'conservative' | 'moderate' | 'aggressive' = 'moderate'): Promise<any> {
    console.log(`👤 Creating demo user profile: ${userType}`);

    // Generate user behavior profile
    const userProfile = UserBehaviorSimulator.generateUserProfile(userId);
    userProfile.profileType = userType;
    this.userProfiles.set(userId, userProfile);

    // Generate realistic portfolio
    const portfolio = PortfolioSimulator.generateRealisticPortfolio(userId, userType);
    this.userPortfolios.set(userId, portfolio);

    // Generate historical transactions
    const transactions = RealisticTransactionGenerator.generateBulkTransactions(userId, 30, 45);
    
    // Start user behavior simulation
    UserBehaviorSimulator.simulateUserActivity(userId, userProfile);

    console.log(`✅ Demo user created with ${transactions.length} transactions and portfolio worth ₹${portfolio.totalValue.toLocaleString()}`);

    return {
      profile: userProfile,
      portfolio,
      transactions: transactions.slice(0, 10), // Return recent 10
      totalTransactions: transactions.length
    };
  }

  getUserProfile(userId: string): any {
    return this.userProfiles.get(userId);
  }

  getUserPortfolio(userId: string): any {
    return this.userPortfolios.get(userId);
  }

  simulateTransaction(userId: string, category?: string): any {
    const transaction = RealisticTransactionGenerator.generateRealisticTransaction(userId, category);
    
    console.log('💳 New transaction:', {
      merchant: transaction.merchant,
      amount: `₹${transaction.amount}`,
      category: transaction.category
    });

    return transaction;
  }

  simulateMarketMovement(symbol: string, percentage: number): void {
    const currentPrice = mockRealTimeData.getCurrentPrice(symbol);
    if (currentPrice) {
      const newPrice = currentPrice.price * (1 + percentage / 100);
      console.log(`📈 ${symbol}: ${currentPrice.price.toFixed(2)} → ${newPrice.toFixed(2)} (${percentage > 0 ? '+' : ''}${percentage}%)`);
    }
  }

  getMarketSummary(): any {
    return {
      nifty50: mockRealTimeData.getCurrentPrice('NIFTY50'),
      sensex: mockRealTimeData.getCurrentPrice('SENSEX'),
      marketStatus: getMarketStatus(),
      lastUpdate: new Date(),
      news: mockRealTimeData.getMarketNews?.() || 'Markets showing positive momentum'
    };
  }

  // Simulate real-world events
  simulateEarningsImpact(symbol: string, isPositive: boolean): void {
    const impact = isPositive ? 0.05 + Math.random() * 0.1 : -0.05 - Math.random() * 0.1;
    this.simulateMarketMovement(symbol, impact * 100);
    
    console.log(`📊 Earnings Impact: ${symbol} ${isPositive ? 'beats' : 'misses'} expectations`);
  }

  simulateNewsImpact(newsType: 'policy' | 'global' | 'sector', impact: 'positive' | 'negative'): void {
    const symbols = ['NIFTY50', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK'];
    const impactSize = impact === 'positive' ? 0.02 + Math.random() * 0.03 : -0.02 - Math.random() * 0.03;
    
    symbols.forEach(symbol => {
      this.simulateMarketMovement(symbol, impactSize * 100);
    });

    console.log(`📰 ${newsType} news causing ${impact} market impact`);
  }

  // Get realistic demo data for components
  getDemoData(): any {
    return {
      marketSummary: this.getMarketSummary(),
      topGainers: [
        { symbol: 'TCS', change: 2.5, price: 4125.65 },
        { symbol: 'RELIANCE', change: 1.8, price: 2845.30 },
        { symbol: 'HDFCBANK', change: 1.2, price: 1685.40 }
      ],
      topLosers: [
        { symbol: 'ITC', change: -1.5, price: 485.70 },
        { symbol: 'SBIN', change: -0.8, price: 825.60 }
      ],
      volume: {
        nifty: 125000000,
        sensex: 98000000
      }
    };
  }

  destroy(): void {
    MarketEventSimulator.stopSimulation();
    mockRealTimeData.stopUpdates?.();
    this.userProfiles.clear();
    this.userPortfolios.clear();
    MockDataOrchestrator.isInitialized = false;
    console.log('🛑 Mock Data Orchestrator destroyed');
  }
}

// Global instance
export const mockDataOrchestrator = MockDataOrchestrator.getInstance();

// Auto-initialize if in development
if (process.env.NODE_ENV === 'development' || MARKET_DATA_CONFIG.dataSource === 'mock') {
  mockDataOrchestrator.initialize();
}

export default MockDataOrchestrator;
