// Investment Service Abstraction Layer
// Switch between mock and real data easily

import { mockDataOrchestrator } from '../lib/mockDataOrchestrator';
import { mockRealTimeData } from '../lib/mockRealTimeData';

interface InvestmentProvider {
  getMutualFunds(): Promise<MutualFund[]>;
  getStocks(): Promise<Stock[]>;
  createSIP(data: SIPData): Promise<SIP>;
  buyMutualFund(data: BuyData): Promise<Transaction>;
  getPortfolio(userId: string): Promise<Portfolio>;
  getMarketData(symbols: string[]): Promise<MarketData[]>;
}

// Mock Implementation (Current)
class MockInvestmentProvider implements InvestmentProvider {
  async getMutualFunds(): Promise<MutualFund[]> {
    // Return mock mutual funds data
    return [
      {
        id: 'axis_bluechip',
        name: 'Axis Bluechip Fund',
        nav: 45.67,
        category: 'Large Cap',
        expense_ratio: 1.8,
        returns_1y: 12.5,
        returns_3y: 15.2,
        risk_level: 'Medium'
      },
      {
        id: 'sbi_small_cap',
        name: 'SBI Small Cap Fund',
        nav: 78.90,
        category: 'Small Cap', 
        expense_ratio: 2.1,
        returns_1y: 18.3,
        returns_3y: 22.1,
        risk_level: 'High'
      },
      {
        id: 'hdfc_liquid',
        name: 'HDFC Liquid Fund',
        nav: 4567.23,
        category: 'Liquid',
        expense_ratio: 0.25,
        returns_1y: 6.8,
        returns_3y: 7.1,
        risk_level: 'Low'
      }
    ];
  }
  
  async getStocks(): Promise<Stock[]> {
    // Get current stock data from mock real-time service
    const stocks = mockRealTimeData.getCurrentPrices();
    return stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.dayChange || 0,
      change_percent: stock.dayChangePercent || 0,
      sector: stock.sector
    }));
  }
  
  async createSIP(data: SIPData): Promise<SIP> {
    // Simulate SIP creation
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return {
      id: `sip_${Date.now()}`,
      fund_id: data.fund_id,
      amount: data.amount,
      frequency: data.frequency,
      next_payment: nextMonth.toISOString().split('T')[0],
      status: 'active'
    };
  }
  
  async buyMutualFund(data: BuyData): Promise<Transaction> {
    // Simulate mutual fund purchase
    const nav = 45.67; // Mock NAV
    const units = data.amount / nav;
    
    return {
      id: `txn_${Date.now()}`,
      type: 'buy',
      fund_id: data.fund_id,
      amount: data.amount,
      units: parseFloat(units.toFixed(4)),
      nav: nav,
      date: new Date().toISOString().split('T')[0]
    };
  }
  
  async getPortfolio(userId: string): Promise<Portfolio> {
    // Get portfolio from mock orchestrator
    const mockPortfolio = mockDataOrchestrator.getUserPortfolio(userId);
    
    if (!mockPortfolio) {
      // Return empty portfolio if none exists
      return {
        user_id: userId,
        total_value: 0,
        total_invested: 0,
        total_gains: 0,
        holdings: []
      };
    }
    
    // Convert mock portfolio to standard format
    return {
      user_id: userId,
      total_value: mockPortfolio.totalValue || 0,
      total_invested: mockPortfolio.totalInvested || 0,
      total_gains: (mockPortfolio.totalValue || 0) - (mockPortfolio.totalInvested || 0),
      holdings: mockPortfolio.holdings || []
    };
  }
  
  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    // Get market data from mock real-time service
    const data = mockRealTimeData.getCurrentPrices(symbols);
    return data.map(item => ({
      symbol: item.symbol,
      price: item.price,
      change: item.dayChange || 0,
      change_percent: item.dayChangePercent || 0,
      volume: item.volume || 0,
      timestamp: item.lastUpdate || Date.now()
    }));
  }
}

// Real Implementation (Future)
class RealInvestmentProvider implements InvestmentProvider {
  async getMutualFunds() {
    // Integrate with real APIs like:
    // - MFUtility API
    // - AMFI API
    // - Fund house APIs
    return fetch('/api/mutual-funds').then(r => r.json());
  }
  
  async getStocks() {
    // Integrate with:
    // - NSE API
    // - BSE API
    // - Yahoo Finance
    return fetch('/api/stocks').then(r => r.json());
  }
  
  async createSIP(data: SIPData) {
    // Integrate with:
    // - BSE StAR MF
    // - Registrar APIs
    return fetch('/api/sip', { method: 'POST', body: JSON.stringify(data) });
  }
  
  async buyMutualFund(data: BuyData) {
    // Real purchase through:
    // - Payment gateway
    // - Fund house integration
    return fetch('/api/purchase', { method: 'POST', body: JSON.stringify(data) });
  }
  
  async getPortfolio(userId: string) {
    // Real portfolio from:
    // - CAMS
    // - Karvy
    // - Database
    return fetch(`/api/portfolio/${userId}`).then(r => r.json());
  }
  
  async getMarketData(symbols: string[]) {
    // Real market data from:
    // - NSE/BSE feeds
    // - Bloomberg API
    // - Alpha Vantage
    return fetch(`/api/market-data?symbols=${symbols.join(',')}`).then(r => r.json());
  }
}

// Service Factory
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK === 'true';

export const investmentService: InvestmentProvider = USE_MOCK_DATA 
  ? new MockInvestmentProvider()
  : new RealInvestmentProvider();

// Export types for use in components
export interface MutualFund {
  id: string;
  name: string;
  nav: number;
  category: string;
  expense_ratio: number;
  returns_1y: number;
  returns_3y: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  sector: string;
}

export interface SIPData {
  fund_id: string;
  amount: number;
  frequency: 'monthly' | 'quarterly';
  start_date: string;
}

export interface BuyData {
  fund_id: string;
  amount: number;
  type: 'lumpsum' | 'sip';
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  fund_id: string;
  amount: number;
  units: number;
  nav: number;
  date: string;
}

export interface Portfolio {
  user_id: string;
  total_value: number;
  total_invested: number;
  total_gains: number;
  holdings: Holding[];
}

export interface Holding {
  fund_id: string;
  fund_name: string;
  units: number;
  current_nav: number;
  current_value: number;
  invested_amount: number;
  gains: number;
  gains_percent: number;
}

export interface SIP {
  id: string;
  fund_id: string;
  amount: number;
  frequency: string;
  next_payment: string;
  status: 'active' | 'paused' | 'stopped';
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: number;
}
