// Mock Investment API - Simulates real investment platform
// This will be replaced with actual APIs in production

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturns: {
    min: number;
    max: number;
    historical: number;
  };
  composition: Array<{
    asset: string;
    percentage: number;
    type: 'equity' | 'debt' | 'gold' | 'cash';
  }>;
  minimumInvestment: number;
  features: string[];
  expense_ratio: number;
}

export interface Investment {
  id: string;
  userId: string;
  portfolioId: string;
  amount: number;
  units: number;
  nav: number;
  timestamp: Date;
  status: 'processing' | 'confirmed' | 'failed';
  transactionId: string;
}

export interface PortfolioHolding {
  portfolioId: string;
  portfolioName: string;
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturns: number;
  totalReturnsPercent: number;
  lastUpdated: Date;
}

// Mock Portfolio Data
const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'conservative',
    name: 'Safe & Steady',
    description: 'Perfect for beginners who want steady growth with minimal risk',
    riskLevel: 'low',
    expectedReturns: {
      min: 7,
      max: 10,
      historical: 8.5
    },
    composition: [
      { asset: 'Government Bonds', percentage: 60, type: 'debt' },
      { asset: 'Corporate Bonds', percentage: 20, type: 'debt' },
      { asset: 'Gold ETF', percentage: 15, type: 'gold' },
      { asset: 'Cash Equivalent', percentage: 5, type: 'cash' }
    ],
    minimumInvestment: 10,
    features: [
      'Very Low Risk',
      'Steady Returns',
      'High Liquidity',
      'Tax Efficient'
    ],
    expense_ratio: 0.5
  },
  {
    id: 'balanced',
    name: 'Balanced Growth',
    description: 'Great mix of safety and growth for most investors',
    riskLevel: 'medium',
    expectedReturns: {
      min: 10,
      max: 14,
      historical: 12.2
    },
    composition: [
      { asset: 'Large Cap Stocks', percentage: 40, type: 'equity' },
      { asset: 'Mid Cap Stocks', percentage: 20, type: 'equity' },
      { asset: 'Government Bonds', percentage: 25, type: 'debt' },
      { asset: 'Gold ETF', percentage: 15, type: 'gold' }
    ],
    minimumInvestment: 50,
    features: [
      'Moderate Risk',
      'Balanced Returns',
      'Diversified',
      'Long-term Growth'
    ],
    expense_ratio: 0.75
  },
  {
    id: 'aggressive',
    name: 'Growth Accelerator',
    description: 'Maximum growth potential for long-term wealth creation',
    riskLevel: 'high',
    expectedReturns: {
      min: 12,
      max: 18,
      historical: 15.3
    },
    composition: [
      { asset: 'Large Cap Stocks', percentage: 50, type: 'equity' },
      { asset: 'Mid Cap Stocks', percentage: 25, type: 'equity' },
      { asset: 'Small Cap Stocks', percentage: 15, type: 'equity' },
      { asset: 'Gold ETF', percentage: 10, type: 'gold' }
    ],
    minimumInvestment: 100,
    features: [
      'High Growth Potential',
      'Long-term Focused',
      'Equity Heavy',
      'Wealth Creation'
    ],
    expense_ratio: 1.0
  }
];

// Mock current NAV prices (these would come from real market data)
const MOCK_NAVS: Record<string, number> = {
  'conservative': 12.45,
  'balanced': 18.73,
  'aggressive': 25.91
};

// Mock Investment API Class
export class MockInvestmentAPI {
  private static investments: Investment[] = [];
  private static holdings: PortfolioHolding[] = [];

  // Get available portfolios
  static async getPortfolios(): Promise<Portfolio[]> {
    // Simulate API delay
    await this.delay(500);
    return MOCK_PORTFOLIOS;
  }

  // Get specific portfolio
  static async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    await this.delay(200);
    return MOCK_PORTFOLIOS.find(p => p.id === portfolioId) || null;
  }

  // Get current NAV for a portfolio
  static async getCurrentNAV(portfolioId: string): Promise<number> {
    await this.delay(100);
    const baseNAV = MOCK_NAVS[portfolioId] || 10;
    
    // Add some realistic fluctuation (±2%)
    const fluctuation = (Math.random() - 0.5) * 0.04;
    return Number((baseNAV * (1 + fluctuation)).toFixed(2));
  }

  // Invest money in a portfolio
  static async investMoney(
    userId: string,
    portfolioId: string,
    amount: number
  ): Promise<{
    success: boolean;
    investment?: Investment;
    error?: string;
  }> {
    await this.delay(1000); // Simulate processing time

    const portfolio = await this.getPortfolio(portfolioId);
    if (!portfolio) {
      return { success: false, error: 'Portfolio not found' };
    }

    if (amount < portfolio.minimumInvestment) {
      return { 
        success: false, 
        error: `Minimum investment is ₹${portfolio.minimumInvestment}` 
      };
    }

    const nav = await this.getCurrentNAV(portfolioId);
    const units = Number((amount / nav).toFixed(4));

    const investment: Investment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      portfolioId,
      amount,
      units,
      nav,
      timestamp: new Date(),
      status: 'confirmed',
      transactionId: `txn_${Date.now()}`
    };

    this.investments.push(investment);
    this.updateHoldings(userId, investment);

    return { success: true, investment };
  }

  // Get user's portfolio holdings
  static async getUserHoldings(userId: string): Promise<PortfolioHolding[]> {
    await this.delay(300);
    return this.holdings.filter(h => h.portfolioId); // Simple filter for demo
  }

  // Get user's investment history
  static async getInvestmentHistory(userId: string): Promise<Investment[]> {
    await this.delay(300);
    return this.investments
      .filter(inv => inv.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Simulate SIP (Systematic Investment Plan) setup
  static async setupSIP(
    userId: string,
    portfolioId: string,
    amount: number,
    frequency: 'weekly' | 'monthly'
  ): Promise<{
    success: boolean;
    sipId?: string;
    error?: string;
  }> {
    await this.delay(800);
    
    const sipId = `sip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real app, this would be stored in database
    console.log(`SIP Setup: ₹${amount} ${frequency} in ${portfolioId}`);
    
    return { 
      success: true, 
      sipId 
    };
  }

  // Redeem/Withdraw from portfolio
  static async redeemInvestment(
    userId: string,
    portfolioId: string,
    units: number
  ): Promise<{
    success: boolean;
    amount?: number;
    error?: string;
  }> {
    await this.delay(1200);
    
    const currentNAV = await this.getCurrentNAV(portfolioId);
    const amount = Number((units * currentNAV).toFixed(2));
    
    // Simulate exit load (1% for demonstration)
    const exitLoad = amount * 0.01;
    const finalAmount = amount - exitLoad;
    
    return { 
      success: true, 
      amount: Number(finalAmount.toFixed(2))
    };
  }

  // Private helper methods
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static updateHoldings(userId: string, investment: Investment): void {
    const existingHolding = this.holdings.find(
      h => h.portfolioId === investment.portfolioId
    );

    if (existingHolding) {
      // Update existing holding
      existingHolding.totalInvested += investment.amount;
      existingHolding.totalUnits += investment.units;
      existingHolding.currentValue = existingHolding.totalUnits * investment.nav;
      existingHolding.totalReturns = existingHolding.currentValue - existingHolding.totalInvested;
      existingHolding.totalReturnsPercent = (existingHolding.totalReturns / existingHolding.totalInvested) * 100;
      existingHolding.lastUpdated = new Date();
    } else {
      // Create new holding
      const portfolio = MOCK_PORTFOLIOS.find(p => p.id === investment.portfolioId);
      this.holdings.push({
        portfolioId: investment.portfolioId,
        portfolioName: portfolio?.name || 'Unknown',
        totalInvested: investment.amount,
        currentValue: investment.amount,
        totalUnits: investment.units,
        dayChange: 0,
        dayChangePercent: 0,
        totalReturns: 0,
        totalReturnsPercent: 0,
        lastUpdated: new Date()
      });
    }
  }

  // Get market status
  static async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpenTime?: string;
    message: string;
  }> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Simulate market hours (9 AM to 3:30 PM, Monday to Friday)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 9 && hour < 15.5;
    const isOpen = isWeekday && isMarketHours;
    
    if (isOpen) {
      return {
        isOpen: true,
        message: "Markets are open! Your investments will be processed immediately."
      };
    } else {
      return {
        isOpen: false,
        nextOpenTime: "Next trading day at 9:00 AM",
        message: "Markets are closed. Your investments will be processed on the next trading day."
      };
    }
  }

  // Simulate real-time price updates
  static subscribeToRealTimeUpdates(
    portfolioId: string,
    callback: (nav: number, change: number) => void
  ): () => void {
    const interval = setInterval(async () => {
      const currentNAV = await this.getCurrentNAV(portfolioId);
      const previousNAV = MOCK_NAVS[portfolioId];
      const change = ((currentNAV - previousNAV) / previousNAV) * 100;
      
      callback(currentNAV, change);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }
}

// Export utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-blue-600 bg-blue-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
