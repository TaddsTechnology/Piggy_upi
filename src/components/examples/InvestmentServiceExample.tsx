// Example: How to use the Investment Service Abstraction
// This component demonstrates the seamless switch between mock and real data

import React, { useState, useEffect } from 'react';
import { 
  investmentService, 
  MutualFund, 
  Stock, 
  Portfolio, 
  SIPData,
  BuyData,
  Transaction,
  SIP
} from '../../services/investmentService';

const InvestmentServiceExample: React.FC = () => {
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const userId = 'demo_user_123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data using the same service interface
      // Works with both mock and real data!
      const [fundsData, stocksData, portfolioData] = await Promise.all([
        investmentService.getMutualFunds(),
        investmentService.getStocks(),
        investmentService.getPortfolio(userId)
      ]);

      setMutualFunds(fundsData);
      setStocks(stocksData.slice(0, 5)); // Show first 5 stocks
      setPortfolio(portfolioData);
      
      setResult('✅ Data loaded successfully!');
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleSIP = async () => {
    setLoading(true);
    try {
      const sipData: SIPData = {
        fund_id: 'axis_bluechip',
        amount: 5000,
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0]
      };

      const sip: SIP = await investmentService.createSIP(sipData);
      setResult(`✅ SIP Created! ID: ${sip.id}, Next Payment: ${sip.next_payment}`);
    } catch (error) {
      setResult(`❌ SIP Creation Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buyMutualFund = async () => {
    setLoading(true);
    try {
      const buyData: BuyData = {
        fund_id: 'hdfc_liquid',
        amount: 10000,
        type: 'lumpsum'
      };

      const transaction: Transaction = await investmentService.buyMutualFund(buyData);
      setResult(`✅ Purchase Successful! Units: ${transaction.units}, NAV: ₹${transaction.nav}`);
    } catch (error) {
      setResult(`❌ Purchase Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMarketData = async () => {
    setLoading(true);
    try {
      const symbols = ['NIFTY50', 'SENSEX', 'RELIANCE'];
      const marketData = await investmentService.getMarketData(symbols);
      
      const summary = marketData.map(item => 
        `${item.symbol}: ₹${item.price} (${item.change_percent.toFixed(2)}%)`
      ).join(', ');
      
      setResult(`📈 Market Data: ${summary}`);
    } catch (error) {
      setResult(`❌ Market Data Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Investment Service Example</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🔄 Mock ↔ Real Data Switch</h2>
        <p className="text-sm text-gray-600">
          Currently using: <strong>{process.env.NODE_ENV === 'development' ? 'Mock Data' : 'Real Data'}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          To switch: Set REACT_APP_USE_MOCK=false in .env for real data
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Reload Data'}
        </button>
        
        <button 
          onClick={createSampleSIP}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Create SIP
        </button>
        
        <button 
          onClick={buyMutualFund}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Buy Fund
        </button>
        
        <button 
          onClick={getMarketData}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Get Market Data
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mb-6 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <p className="font-mono text-sm">{result}</p>
        </div>
      )}

      {/* Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Mutual Funds */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">💰 Mutual Funds ({mutualFunds.length})</h3>
          <div className="space-y-2">
            {mutualFunds.map(fund => (
              <div key={fund.id} className="text-sm border-b pb-2">
                <div className="font-medium">{fund.name}</div>
                <div className="text-gray-600">
                  NAV: ₹{fund.nav} | {fund.category} | {fund.risk_level} Risk
                </div>
                <div className="text-green-600">
                  Returns: {fund.returns_1y}% (1Y) | {fund.returns_3y}% (3Y)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stocks */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">📈 Stocks ({stocks.length})</h3>
          <div className="space-y-2">
            {stocks.map(stock => (
              <div key={stock.symbol} className="text-sm border-b pb-2">
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-gray-600">{stock.name}</div>
                <div className={`${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stock.price} ({stock.change_percent.toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">🏦 Portfolio</h3>
          {portfolio ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium ml-2">₹{portfolio.total_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Invested:</span>
                <span className="font-medium ml-2">₹{portfolio.total_invested.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Gains:</span>
                <span className={`font-medium ml-2 ${portfolio.total_gains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{portfolio.total_gains.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t">
                <span className="text-gray-600">Holdings: {portfolio.holdings.length} funds</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No portfolio data available</p>
          )}
        </div>
      </div>

      {/* Usage Code Example */}
      <div className="mt-8 p-4 bg-gray-900 text-green-400 rounded-lg">
        <h3 className="font-semibold mb-3 text-white">💻 Usage Example</h3>
        <pre className="text-xs overflow-x-auto">
{`// Import the service and types
import { investmentService, MutualFund } from '../services/investmentService';

// Use in any component - same code works for mock AND real data!
const funds: MutualFund[] = await investmentService.getMutualFunds();
const portfolio = await investmentService.getPortfolio(userId);

// Create SIP
const sip = await investmentService.createSIP({
  fund_id: 'axis_bluechip',
  amount: 5000,
  frequency: 'monthly',
  start_date: '2024-01-01'
});

// Switch between mock/real by changing environment variable:
// REACT_APP_USE_MOCK=true  -> Mock data
// REACT_APP_USE_MOCK=false -> Real data`}
        </pre>
      </div>
    </div>
  );
};

export default InvestmentServiceExample;
