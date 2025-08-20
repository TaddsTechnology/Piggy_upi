import React, { useState } from 'react';
import { usePortfolioData } from '../hooks/useRealTimeData';
import { formatCurrency, formatPercentage } from '../lib/mockRealTimeData';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock holdings data - replace with actual user portfolio
const mockHoldings = [
  { symbol: 'RELIANCE', quantity: 5, averagePrice: 2800, invested: 14000 },
  { symbol: 'TCS', quantity: 2, averagePrice: 4000, invested: 8000 },
  { symbol: 'HDFCBANK', quantity: 10, averagePrice: 1650, invested: 16500 },
  { symbol: 'INFY', quantity: 3, averagePrice: 1800, invested: 5400 },
  { symbol: 'ICICIBANK', quantity: 8, averagePrice: 1200, invested: 9600 }
];

const LivePortfolio = () => {
  const [showValues, setShowValues] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const {
    portfolioData,
    totalValue,
    totalChange,
    totalChangePercent,
    isConnected,
    isLoading
  } = usePortfolioData(mockHoldings, autoRefresh);

  const totalInvested = mockHoldings.reduce((sum, holding) => sum + holding.invested, 0);
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatValue = (value) => {
    return showValues ? formatCurrency(value) : '••••••';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Portfolio...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500">Fetching real-time data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Portfolio
              {isConnected && (
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
              >
                {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'text-green-600' : ''}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Value */}
            <div className="text-center">
              <div className="text-2xl font-bold">{formatValue(totalValue)}</div>
              <div className="text-sm text-gray-600">Current Value</div>
            </div>
            
            {/* Day Change */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrendColor(totalChange)}`}>
                {showValues ? formatPercentage(totalChangePercent) : '••••'}
              </div>
              <div className="text-sm text-gray-600">Today's Change</div>
              {showValues && (
                <div className={`text-sm ${getTrendColor(totalChange)}`}>
                  {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
                </div>
              )}
            </div>
            
            {/* Total Return */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrendColor(totalReturn)}`}>
                {showValues ? formatPercentage(totalReturnPercent) : '••••'}
              </div>
              <div className="text-sm text-gray-600">Total Return</div>
              {showValues && (
                <div className={`text-sm ${getTrendColor(totalReturn)}`}>
                  {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings List */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioData.map((holding, index) => (
              <div key={holding.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{holding.symbol}</h3>
                    {holding.trend && getTrendIcon(holding.trend)}
                    <span className="text-xs text-gray-500">
                      {holding.lastUpdate && new Date(holding.lastUpdate).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {holding.quantity} shares @ {formatCurrency(holding.averagePrice)} avg
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    {formatValue(holding.currentPrice || holding.averagePrice)}
                  </div>
                  {holding.dayChangePercent !== undefined && (
                    <div className={`text-sm ${getTrendColor(holding.dayChangePercent)}`}>
                      {formatPercentage(holding.dayChangePercent)}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="font-semibold">
                    {formatValue(holding.currentValue || holding.invested)}
                  </div>
                  {holding.dayChange !== undefined && showValues && (
                    <div className={`text-sm ${getTrendColor(holding.dayChange)}`}>
                      {holding.dayChange >= 0 ? '+' : ''}{formatCurrency(holding.dayChange)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Real-time data connected' : 'Connection lost'}
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePortfolio;
