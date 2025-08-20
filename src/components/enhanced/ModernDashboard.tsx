import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Target, 
  PiggyBank,
  Wallet,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Settings,
  Bell,
  Award,
  Zap,
  Clock,
  ChevronRight,
  Plus,
  Download,
  Share2,
  RefreshCw,
  DollarSign,
  Activity,
  Users,
  AlertTriangle
} from 'lucide-react';
import { usePiggyCore } from '@/hooks/use-piggy-core';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/algorithms';

const ModernDashboard = () => {
  const navigate = useNavigate();
  const { user, demoMode } = useAuth();
  const [piggyState, piggyActions] = usePiggyCore();
  const [showBalance, setShowBalance] = useState(true);
  const [timeFrame, setTimeFrame] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Investor';

  // Mock data for charts and analytics
  const portfolioMetrics = {
    totalValue: piggyState.portfolioValue,
    dayChange: 250,
    dayChangePercent: 1.8,
    weekChange: 850,
    weekChangePercent: 3.2,
    monthChange: 2100,
    monthChangePercent: 8.7,
    yearReturn: 12.5
  };

  const investmentGoals = [
    {
      title: "Emergency Fund",
      target: 100000,
      current: piggyState.totalInvested * 0.3,
      priority: "high",
      color: "from-red-400 to-red-600"
    },
    {
      title: "Vacation Fund",
      target: 50000,
      current: piggyState.totalInvested * 0.2,
      priority: "medium",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Retirement",
      target: 1000000,
      current: piggyState.totalInvested * 0.5,
      priority: "low",
      color: "from-green-400 to-green-600"
    }
  ];

  const recentActivity = [
    { type: 'roundup', amount: 7, merchant: 'Zomato', time: '2 hours ago' },
    { type: 'investment', amount: 50, fund: 'Nifty 50 Index', time: '1 day ago' },
    { type: 'roundup', amount: 3, merchant: 'Metro Card', time: '1 day ago' },
    { type: 'dividend', amount: 15, fund: 'Dividend Yield Fund', time: '2 days ago' },
    { type: 'roundup', amount: 12, merchant: 'Amazon', time: '2 days ago' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await piggyActions.refreshPrices();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-gray-600">Welcome back to your wealth dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Portfolio Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Portfolio Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-200" />
                    <span className="text-blue-200 text-sm font-medium">Total Portfolio Value</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <IndianRupee className="h-8 w-8" />
                      <span className="text-4xl md:text-5xl font-bold">
                        {showBalance ? portfolioMetrics.totalValue.toLocaleString('en-IN') : '••••••'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-white/20"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${portfolioMetrics.dayChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {portfolioMetrics.dayChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {formatCurrency(Math.abs(portfolioMetrics.dayChange))}
                    </span>
                    <span className="text-sm">
                      ({formatPercentage(portfolioMetrics.dayChangePercent)})
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm">Today's change</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide">Invested</p>
                  <p className="text-xl font-semibold">{formatCurrency(piggyState.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide">Returns</p>
                  <p className="text-xl font-semibold text-green-300">{formatCurrency(piggyState.totalGains)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide">XIRR</p>
                  <p className="text-xl font-semibold">{formatPercentage(portfolioMetrics.yearReturn)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-600 text-white p-2 rounded-lg">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">Ready</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Piggy Balance</h3>
                <p className="text-2xl font-bold text-green-600 mb-3">
                  {formatCurrency(piggyState.piggyBalance)}
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/invest')}
                  disabled={piggyState.piggyBalance < 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invest Now
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Target className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Weekly Goal</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {formatCurrency(piggyState.weeklyProgress)} / {formatCurrency(piggyState.weeklyTarget)}
                </p>
                <Progress 
                  value={(piggyState.weeklyProgress / piggyState.weeklyTarget) * 100} 
                  className="mb-2" 
                />
                <p className="text-xs text-gray-500">
                  {piggyState.weeklyProgress >= piggyState.weeklyTarget ? '🎉 Goal achieved!' : `${formatCurrency(piggyState.weeklyTarget - piggyState.weeklyProgress)} to go`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance & Activity Tabs */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '7 Days', value: portfolioMetrics.weekChange, percent: portfolioMetrics.weekChangePercent },
                { label: '1 Month', value: portfolioMetrics.monthChange, percent: portfolioMetrics.monthChangePercent },
                { label: 'YTD', value: portfolioMetrics.monthChange * 3, percent: portfolioMetrics.yearReturn },
                { label: 'All Time', value: piggyState.totalGains, percent: piggyState.gainsPercent }
              ].map((period, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">{period.label}</p>
                    <div className={`flex items-center gap-2 ${period.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {period.value >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {formatCurrency(Math.abs(period.value))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(period.percent)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Holdings Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Portfolio Holdings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {piggyState.holdings.length > 0 ? (
                    piggyState.holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{holding.name}</h4>
                          <p className="text-sm text-gray-600">{holding.units} units</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(holding.currentValue)}</p>
                          <p className={`text-sm ${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.dayChange >= 0 ? '+' : ''}{formatCurrency(holding.dayChange)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No holdings yet. Start investing to see your portfolio!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'roundup' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'investment' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'roundup' ? <Zap className="h-4 w-4" /> :
                         activity.type === 'investment' ? <TrendingUp className="h-4 w-4" /> :
                         <DollarSign className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.type === 'roundup' ? `Round-up from ${activity.merchant}` :
                           activity.type === 'investment' ? `Invested in ${activity.fund}` :
                           `Dividend from ${activity.fund}`}
                        </p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{formatCurrency(activity.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6">
              {investmentGoals.map((goal, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          goal.priority === 'high' ? 'border-red-300 text-red-700' :
                          goal.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }
                      >
                        {goal.priority} priority
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{Math.round((goal.current / goal.target) * 100)}% complete</span>
                        <span>{formatCurrency(goal.target - goal.current)} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Transactions', 
              value: piggyState.transactions.length, 
              icon: <Users className="h-5 w-5" />,
              color: 'text-blue-600 bg-blue-100'
            },
            { 
              label: 'Total Roundups', 
              value: formatCurrency(piggyState.piggyBalance + piggyState.totalInvested), 
              icon: <Zap className="h-5 w-5" />,
              color: 'text-yellow-600 bg-yellow-100'
            },
            { 
              label: 'Avg Monthly', 
              value: formatCurrency(piggyState.totalInvested / 6), 
              icon: <Calendar className="h-5 w-5" />,
              color: 'text-green-600 bg-green-100'
            },
            { 
              label: 'Success Rate', 
              value: '94%', 
              icon: <Award className="h-5 w-5" />,
              color: 'text-purple-600 bg-purple-100'
            }
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
