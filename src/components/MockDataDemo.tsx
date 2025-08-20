// Mock Data Demo Component
// Showcases the unified mock data system acting as real data

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  PieChart, 
  Bell,
  RefreshCw,
  Play,
  Pause,
  Target,
  DollarSign,
  BarChart3,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import {
  useMockDataOrchestrator,
  useDemoUser,
  useTransactionSimulator,
  useRealtimeMarketData,
  usePortfolioSimulator,
  useMarketEventSimulator,
  useDemoData,
  useMockDataAnalytics
} from '../hooks/useMockDataOrchestrator';

const MockDataDemo: React.FC = () => {
  const { isInitialized } = useMockDataOrchestrator();
  const { userData, isLoading, createDemoUser, generateTransaction, userId } = useDemoUser('moderate');
  const { 
    latestTransaction, 
    transactionHistory, 
    isActive: isTransactionActive,
    startSimulation: startTransactionSim,
    stopSimulation: stopTransactionSim,
    generateManualTransaction 
  } = useTransactionSimulator(userId);
  
  const { marketData, isConnected, lastUpdate, getCurrentPrice, simulateMarketEvent } = useRealtimeMarketData();
  const { 
    portfolio, 
    portfolioHistory,
    isGrowthActive,
    startGrowthSimulation,
    stopGrowthSimulation,
    getPortfolioMetrics 
  } = usePortfolioSimulator(userId);
  
  const { 
    recentEvents, 
    isSimulating: isEventSimulating,
    simulateCustomEvent 
  } = useMarketEventSimulator();
  
  const { demoData, refreshDemoData, refreshCount } = useDemoData();
  const { analytics } = useMockDataAnalytics(userId);

  const [selectedUserType, setSelectedUserType] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const portfolioMetrics = getPortfolioMetrics();

  const handleCreateUser = async (type: 'conservative' | 'moderate' | 'aggressive') => {
    setSelectedUserType(type);
    await createDemoUser(type);
  };

  const handleSimulateTransaction = (category?: string) => {
    generateManualTransaction(category);
  };

  const handleMarketEvent = (type: 'earnings' | 'policy' | 'global' | 'sector', impact: 'positive' | 'negative') => {
    simulateCustomEvent(type, impact);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Initializing Mock Data System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mock Data Orchestrator Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive simulation system acting as real financial data
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isInitialized ? 'default' : 'secondary'}>
            {isInitialized ? 'System Active' : 'Initializing'}
          </Badge>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Market Connected' : 'Market Disconnected'}
          </Badge>
          <Badge variant={isEventSimulating ? 'default' : 'secondary'}>
            {isEventSimulating ? 'Events Active' : 'Events Paused'}
          </Badge>
        </div>
      </div>

      {/* User Profile & Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demo User Profile
          </CardTitle>
          <CardDescription>
            Create different user types with realistic behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                {(['conservative', 'moderate', 'aggressive'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedUserType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCreateUser(type)}
                    disabled={isLoading}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              
              {userData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profile Type:</span>
                    <Badge>{userData.profile.profileType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Transaction:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(userData.profile.avgTransactionAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Frequency:</span>
                    <span className="text-sm font-medium">
                      {userData.profile.transactionFrequency} transactions
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Risk Tolerance:</span>
                    <Badge variant="outline">{userData.profile.riskTolerance}</Badge>
                  </div>
                </div>
              )}
            </div>

            {portfolio && (
              <div className="space-y-4">
                <h4 className="font-medium">Portfolio Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(portfolio.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Investment Style:</span>
                    <Badge variant="outline">{portfolio.investmentStyle}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Equity: {(portfolio.allocation.equity * 100).toFixed(0)}%</span>
                      <span>Gold: {(portfolio.allocation.gold * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={portfolio.allocation.equity * 100} className="h-2" />
                  </div>
                  {portfolioMetrics && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Today's Change:</span>
                      <span className={`text-sm font-medium flex items-center gap-1 ${
                        portfolioMetrics.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {portfolioMetrics.dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatCurrency(Math.abs(portfolioMetrics.dayChange))} 
                        ({portfolioMetrics.dayChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Data Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Live Market Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['NIFTY50', 'SENSEX'].map((symbol) => {
              const price = getCurrentPrice(symbol);
              return (
                <div key={symbol} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{symbol}</span>
                  {price && (
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {formatNumber(price.price)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        price.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {price.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {price.changePercent?.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last Update:</span>
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Simulator */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Transaction Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isTransactionActive ? 'destructive' : 'default'}
                onClick={isTransactionActive ? stopTransactionSim : () => startTransactionSim(10000)}
                className="flex-1"
              >
                {isTransactionActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {isTransactionActive ? 'Stop' : 'Start'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSimulateTransaction()}
              >
                <Zap className="h-3 w-3" />
              </Button>
            </div>

            {latestTransaction && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{latestTransaction.merchant}</div>
                    <div className="text-xs text-muted-foreground">{latestTransaction.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatCurrency(latestTransaction.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(latestTransaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              History: {transactionHistory.length} transactions
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Growth */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isGrowthActive ? 'destructive' : 'default'}
                onClick={isGrowthActive ? stopGrowthSimulation : () => startGrowthSimulation(30000)}
                className="flex-1"
              >
                {isGrowthActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {isGrowthActive ? 'Stop' : 'Start'}
              </Button>
            </div>

            {portfolio && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Current Value:</span>
                  <span className="text-xs font-bold">
                    {formatCurrency(portfolio.totalValue)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (portfolio.totalValue / 100000) * 100)} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground">
                  Snapshots: {portfolioHistory.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Market Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarketEvent('earnings', 'positive')}
                className="text-xs p-1"
              >
                📈 Earnings+
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarketEvent('earnings', 'negative')}
                className="text-xs p-1"
              >
                📉 Earnings-
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarketEvent('policy', 'positive')}
                className="text-xs p-1"
              >
                🏛️ Policy+
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarketEvent('global', 'negative')}
                className="text-xs p-1"
              >
                🌍 Global-
              </Button>
            </div>

            {recentEvents.length > 0 && (
              <div className="space-y-1">
                {recentEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="p-2 bg-muted rounded text-xs">
                    <div className="flex items-center gap-1">
                      <Badge variant={event.impact === 'positive' ? 'default' : 'destructive'} className="text-xs px-1 py-0">
                        {event.impact === 'positive' ? '📈' : '📉'}
                      </Badge>
                      <span className="capitalize">{event.type}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analytics & Insights
            </CardTitle>
            <CardDescription>
              Real-time analysis of user behavior and portfolio performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Spending Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Spending:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(analytics.spending.totalSpending)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Transaction:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(analytics.spending.avgTransactionSize)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analytics.spending.categoryBreakdown).map(([category, percent]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{category}:</span>
                          <span>{((percent as number) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(percent as number) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Portfolio Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(analytics.portfolio.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Risk Level:</span>
                    <Badge variant="outline">{analytics.portfolio.riskLevel}</Badge>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analytics.portfolio.allocation).map(([asset, percent]) => (
                      <div key={asset} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{asset}:</span>
                          <span>{((percent as number) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(percent as number) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Savings Rate</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {(analytics.insights.savingsRate * 100).toFixed(1)}% of income saved
                    </div>
                    <Progress value={analytics.insights.savingsRate * 100} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Risk Alignment:</span>
                    <Badge variant={analytics.insights.riskAlignment === 'aligned' ? 'default' : 'destructive'}>
                      {analytics.insights.riskAlignment}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spending Trend:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {analytics.insights.spendingTrend === 'increasing' ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                      {analytics.insights.spendingTrend}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{refreshCount}</div>
              <div className="text-sm text-muted-foreground">Data Refreshes</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{transactionHistory.length}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">{portfolioHistory.length}</div>
              <div className="text-sm text-muted-foreground">Portfolio Snapshots</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">{recentEvents.length}</div>
              <div className="text-sm text-muted-foreground">Market Events</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-center">
            <Button onClick={refreshDemoData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataDemo;
