import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  IndianRupee,
  PieChart,
  BarChart3,
  Minus,
  Plus,
  RefreshCw,
  AlertCircle,
  Activity,
  Calendar,
  Target
} from "lucide-react";

import { 
  MockInvestmentAPI, 
  PortfolioHolding, 
  Investment,
  formatCurrency, 
  formatPercentage,
  getRiskColor 
} from "@/lib/mock-investment-api";

interface PortfolioHoldingsProps {
  userId: string;
  onInvestMore: () => void;
}

const PortfolioHoldings = ({ userId, onInvestMore }: PortfolioHoldingsProps) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [holdingsData, investmentHistory] = await Promise.all([
        MockInvestmentAPI.getUserHoldings(userId),
        MockInvestmentAPI.getInvestmentHistory(userId)
      ]);
      
      setHoldings(holdingsData);
      setInvestments(investmentHistory);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <PieChart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">No investments yet</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
          Start your investment journey by adding funds to your first portfolio.
        </p>
        <Button onClick={onInvestMore} className="gap-2">
          <Plus className="h-4 w-4" />
          Make Your First Investment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Portfolio Value</h3>
              <div className="flex items-center gap-2">
                {showValues ? (
                  <span className="text-3xl font-bold">
                    {formatCurrency(totalCurrentValue)}
                  </span>
                ) : (
                  <span className="text-3xl font-bold">₹****</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValues(!showValues)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-white/80 text-sm">Invested</div>
              <div className="font-semibold">
                {showValues ? formatCurrency(totalInvested) : '₹****'}
              </div>
            </div>
            <div>
              <div className="text-white/80 text-sm">Returns</div>
              <div className={`font-semibold flex items-center gap-1 ${
                totalReturns >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {totalReturns >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {showValues ? formatCurrency(totalReturns) : '₹****'}
              </div>
            </div>
            <div>
              <div className="text-white/80 text-sm">Return %</div>
              <div className={`font-semibold ${
                totalReturnsPercent >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {formatPercentage(totalReturnsPercent)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Holdings */}
      <div className="space-y-4">
        {holdings.map((holding) => (
          <Card key={holding.portfolioId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{holding.portfolioName}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    Last updated: {holding.lastUpdated.toLocaleString()}
                  </div>
                  
                  {/* Current Value */}
                  <div className="mb-3">
                    <div className="text-2xl font-bold">
                      {showValues ? formatCurrency(holding.currentValue) : '₹****'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {holding.totalUnits.toFixed(4)} units
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Invested</div>
                      <div className="font-medium">
                        {showValues ? formatCurrency(holding.totalInvested) : '₹****'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Returns</div>
                      <div className={`font-medium flex items-center gap-1 ${
                        holding.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.totalReturns >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {showValues ? formatCurrency(holding.totalReturns) : '₹****'}
                        <span className="text-xs">
                          ({formatPercentage(holding.totalReturnsPercent)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Day Change */}
                  {Math.abs(holding.dayChange) > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-3 w-3" />
                      <span>Today:</span>
                      <span className={`font-medium ${
                        holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(holding.dayChange)} ({formatPercentage(holding.dayChangePercent)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onInvestMore}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                  >
                    <Minus className="h-3 w-3" />
                    Sell
                  </Button>
                </div>
              </div>

              {/* Progress Bar - Portfolio Weight */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Portfolio weight</span>
                  <span>{((holding.currentValue / totalCurrentValue) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(holding.currentValue / totalCurrentValue) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Investment History */}
      {investments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.slice(0, 5).map((investment) => (
                <div key={investment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">
                      {formatCurrency(investment.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {investment.timestamp.toLocaleDateString()} • {investment.units.toFixed(4)} units
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`text-xs ${
                        investment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : investment.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {investment.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      NAV: ₹{investment.nav}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={onInvestMore} className="h-12 gap-2">
          <Plus className="h-4 w-4" />
          Invest More
        </Button>
        <Button variant="outline" className="h-12 gap-2">
          <Target className="h-4 w-4" />
          Set SIP
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. 
            Past performance is not indicative of future results. Please read all scheme related documents carefully.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHoldings;
