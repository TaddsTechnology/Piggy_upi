import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Target, 
  PiggyBank,
  Wallet,
  BarChart3,
  Zap,
  Award,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Settings,
  Bell,
  RefreshCw,
  Sparkles,
  Brain,
  Shield,
  Activity,
  Clock,
  Globe,
  Star,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
  DollarSign,
  Lightbulb
} from 'lucide-react';
import { usePiggyCore } from '@/hooks/use-piggy-core';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/algorithms';

const UltraModernDashboard = () => {
  const navigate = useNavigate();
  const { user, demoMode } = useAuth();
  const [piggyState, piggyActions] = usePiggyCore();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Investor';

  // Mock data for advanced analytics
  const portfolioData = [
    { month: 'Jan', invested: 2000, value: 2150, roundups: 180 },
    { month: 'Feb', invested: 4200, value: 4580, roundups: 350 },
    { month: 'Mar', invested: 6800, value: 7420, roundups: 540 },
    { month: 'Apr', invested: 9500, value: 10450, roundups: 720 },
    { month: 'May', invested: 12200, value: 13485, roundups: 890 },
  ];

  const assetAllocation = [
    { name: 'NIFTYBEES', value: 60, amount: 8091, color: '#3B82F6' },
    { name: 'GOLDBEES', value: 30, amount: 4045, color: '#F59E0B' },
    { name: 'LIQUIDBEES', value: 10, amount: 1349, color: '#10B981' },
  ];

  const riskAnalysis = [
    { metric: 'Diversification', current: 85, benchmark: 80 },
    { metric: 'Volatility', current: 65, benchmark: 70 },
    { metric: 'Liquidity', current: 90, benchmark: 85 },
    { metric: 'Tax Efficiency', current: 78, benchmark: 75 },
    { metric: 'Cost Ratio', current: 95, benchmark: 90 },
    { metric: 'Goal Alignment', current: 88, benchmark: 85 },
  ];

  const aiInsights = [
    {
      type: 'positive',
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Portfolio Outperforming',
      description: 'Your portfolio is beating the market by 3.2% this quarter.',
      action: 'See details',
      color: 'text-green-600 bg-green-100'
    },
    {
      type: 'suggestion',
      icon: <Lightbulb className="h-5 w-5" />,
      title: 'Rebalancing Opportunity',
      description: 'Consider increasing equity allocation by 5% for better growth.',
      action: 'Auto-rebalance',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      type: 'alert',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: 'Goal Behind Schedule',
      description: 'Emergency fund is 2 months behind target. Increase contributions?',
      action: 'Adjust goal',
      color: 'text-orange-600 bg-orange-100'
    },
  ];

  const goals = [
    {
      name: 'Emergency Fund',
      target: 100000,
      current: 45000,
      progress: 45,
      timeLeft: '8 months',
      color: 'from-red-500 to-pink-500',
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: 'Vacation Fund',
      target: 50000,
      current: 28000,
      progress: 56,
      timeLeft: '4 months',
      color: 'from-blue-500 to-cyan-500',
      icon: <Globe className="h-5 w-5" />
    },
    {
      name: 'New Laptop',
      target: 80000,
      current: 12485,
      progress: 16,
      timeLeft: '12 months',
      color: 'from-purple-500 to-indigo-500',
      icon: <Target className="h-5 w-5" />
    },
  ];

  const recentActivity = [
    {
      type: 'roundup',
      amount: 7,
      description: 'Round-up from Zomato',
      time: '2 hours ago',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      type: 'investment',
      amount: 500,
      description: 'Auto-invested in Balanced Portfolio',
      time: '1 day ago',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      type: 'achievement',
      amount: 0,
      description: 'Goal milestone reached: 50% Emergency Fund',
      time: '2 days ago',
      icon: <Award className="h-4 w-4" />,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      type: 'roundup',
      amount: 3,
      description: 'Round-up from Metro Card',
      time: '3 days ago',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-100'
    },
  ];

  const { exitDemoMode } = useAuth(); // Add this line
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await piggyActions.refreshPrices();
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  const handleExitDemo = () => {
    exitDemoMode();
    window.location.reload(); // Refresh to load real data
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 transition-all duration-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 animate-fade-in">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-300 hover:scale-105">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-200">
                  {greeting}, {userName}! 👋
                </h1>
                <p className="text-gray-600 text-sm">
                  {demoMode ? 'Demo Mode • Explore freely' : 'Your wealth is growing beautifully'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 animate-fade-in-delay">
              {demoMode && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    Demo Mode
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExitDemo}
                    className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    Exit Demo
                  </Button>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 hover:rotate-12"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* Portfolio Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Portfolio Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-slide-up">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 animate-fade-in">
                    <BarChart3 className="h-5 w-5 text-blue-200 animate-pulse" />
                    <span className="text-blue-200 text-sm font-medium">Total Portfolio Value</span>
                  </div>
                  <div className="flex items-center gap-4 animate-slide-in-left">
                    <div className="flex items-center group">
                      <IndianRupee className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-4xl md:text-5xl font-bold transition-all duration-500 hover:text-yellow-200">
                        {showBalance ? (
                          <span className="animate-counter">
                            {piggyState.portfolioValue.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="animate-pulse">••••••</span>
                        )}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 hover:rotate-12"
                    >
                      {showBalance ? 
                        <EyeOff className="h-4 w-4 transition-transform duration-200" /> : 
                        <Eye className="h-4 w-4 transition-transform duration-200" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="text-right space-y-2 animate-slide-in-right">
                  <div className="flex items-center gap-1 text-green-300 animate-bounce-subtle">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                    <span className="font-semibold">{formatCurrency(piggyState.totalGains)}</span>
                    <span className="text-sm">({formatPercentage(piggyState.gainsPercent)})</span>
                  </div>
                  <p className="text-blue-200 text-sm">Today's change</p>
                  <div className="mt-2">
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Live updates</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 animate-fade-in-up">
                <div className="group hover:scale-105 transition-transform duration-200 p-2 rounded-lg hover:bg-white/10">
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">Invested</p>
                  <p className="text-xl font-semibold group-hover:text-yellow-200 transition-colors duration-200">
                    {formatCurrency(piggyState.totalInvested)}
                  </p>
                </div>
                <div className="group hover:scale-105 transition-transform duration-200 p-2 rounded-lg hover:bg-white/10">
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">Returns</p>
                  <p className="text-xl font-semibold text-green-300 group-hover:text-green-200 transition-colors duration-200">
                    {formatCurrency(piggyState.totalGains)}
                  </p>
                </div>
                <div className="group hover:scale-105 transition-transform duration-200 p-2 rounded-lg hover:bg-white/10">
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">XIRR</p>
                  <p className="text-xl font-semibold group-hover:text-purple-200 transition-colors duration-200">
                    {formatPercentage(14.2)}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-300" />
                    <span className="text-xs text-green-300">Outperforming</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white/30 transition-colors duration-200">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Market: Open
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-200">
                    <Clock className="h-3 w-3" />
                    <span>Updated 2 min ago</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 transition-all duration-200"
                  onClick={() => navigate('/markets')}
                >
                  View Markets
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Goals */}
          <div className="space-y-6">
            {/* Piggy Balance */}
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

            {/* Next Goal Progress */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    {goals[0].icon}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{goals[0].name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {formatCurrency(goals[0].current)} / {formatCurrency(goals[0].target)}
                </p>
                <Progress value={goals[0].progress} className="mb-2" />
                <p className="text-xs text-gray-500">
                  {goals[0].progress >= 100 ? '🎉 Goal achieved!' : `${goals[0].timeLeft} remaining`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg text-white">
                <Brain className="h-5 w-5" />
              </div>
              AI-Powered Insights
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">New</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${insight.color}`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                      <Button size="sm" variant="outline">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl">
            <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-lg">Goals</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg">Activity</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Portfolio Growth Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Portfolio Growth</CardTitle>
                    <div className="flex items-center space-x-2">
                      {['1W', '1M', '3M', '1Y'].map((period) => (
                        <Button
                          key={period}
                          variant={selectedTimeframe === period ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframe(period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={portfolioData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          fill="url(#portfolioGradient)"
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="invested"
                          stroke="#94A3B8"
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-6">
                    {assetAllocation.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: asset.color }}
                          />
                          <span className="font-medium">{asset.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(asset.amount)}</div>
                          <div className="text-sm text-gray-500">{asset.value}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: '7 Days', value: 850, percent: 3.2, positive: true },
                { label: '30 Days', value: 2100, percent: 8.7, positive: true },
                { label: '90 Days', value: 4200, percent: 18.5, positive: true },
                { label: 'All Time', value: piggyState.totalGains, percent: piggyState.gainsPercent, positive: piggyState.totalGains >= 0 }
              ].map((period, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">{period.label}</p>
                    <div className={`flex items-center gap-2 ${period.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {period.positive ? (
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
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6">
              {goals.map((goal, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`bg-gradient-to-r ${goal.color} p-3 rounded-xl text-white`}>
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{goal.name}</h3>
                          <p className="text-gray-600">
                            {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(goal.progress)}%
                        </div>
                        <p className="text-sm text-gray-500">{goal.timeLeft} left</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-3" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{goal.current.toLocaleString()}</span>
                        <span>₹{(goal.target - goal.current).toLocaleString()} to go</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Money
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Goal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={riskAnalysis}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" className="text-xs" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Your Portfolio"
                          dataKey="current"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Benchmark"
                          dataKey="benchmark"
                          stroke="#94A3B8"
                          fill="transparent"
                          strokeDasharray="3 3"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Round-up Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Round-up Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">₹165</div>
                      <div className="text-sm text-gray-600">Avg. Monthly</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹6.50</div>
                      <div className="text-sm text-gray-600">Avg. Round-up</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { category: 'Food & Dining', amount: 245, transactions: 42 },
                      { category: 'Transportation', amount: 156, transactions: 28 },
                      { category: 'Shopping', amount: 189, transactions: 15 },
                      { category: 'Utilities', amount: 98, transactions: 12 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-gray-500">{item.transactions} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{item.amount}</div>
                          <div className="text-sm text-gray-500">
                            ₹{(item.amount / item.transactions).toFixed(1)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
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
                      <div className={`p-2 rounded-full ${activity.color}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      {activity.amount > 0 && (
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +{formatCurrency(activity.amount)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to invest more?</h3>
                <p className="text-blue-100">Your portfolio is performing well. Consider adding more funds.</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  onClick={() => navigate('/invest')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invest More
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => navigate('/goals')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UltraModernDashboard;
