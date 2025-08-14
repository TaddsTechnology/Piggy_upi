import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Calendar, 
  PiggyBank, 
  IndianRupee,
  Award,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

// Mock data
const portfolioPerformanceData = [
  { month: 'Jan', portfolio: 8500, market: 8200, roundups: 150 },
  { month: 'Feb', portfolio: 9200, market: 8800, roundups: 280 },
  { month: 'Mar', portfolio: 10100, market: 9600, roundups: 420 },
  { month: 'Apr', portfolio: 11800, market: 10800, roundups: 580 },
  { month: 'May', portfolio: 12485, market: 11200, roundups: 742 },
];

const roundupAnalysisData = [
  { category: 'Food & Dining', amount: 245, transactions: 42, avgRoundup: 5.8 },
  { category: 'Transportation', amount: 156, transactions: 28, avgRoundup: 5.6 },
  { category: 'Shopping', amount: 189, transactions: 15, avgRoundup: 12.6 },
  { category: 'Utilities', amount: 98, transactions: 12, avgRoundup: 8.2 },
  { category: 'Entertainment', amount: 76, transactions: 18, avgRoundup: 4.2 },
];

const investmentAllocationData = [
  { name: 'NIFTYBEES', value: 60, amount: 7485, returns: 8.5 },
  { name: 'GOLDBEES', value: 40, amount: 4985, returns: -2.1 },
];

const riskAnalysisData = [
  { subject: 'Diversification', current: 75, benchmark: 85 },
  { subject: 'Volatility Control', current: 82, benchmark: 80 },
  { subject: 'Cost Efficiency', current: 95, benchmark: 90 },
  { subject: 'Liquidity', current: 90, benchmark: 85 },
  { subject: 'Tax Efficiency', current: 78, benchmark: 80 },
  { subject: 'Goal Alignment', current: 88, benchmark: 85 },
];

const COLORS = ['#4CAF50', '#FFD54F', '#2196F3', '#FF7043', '#9C27B0'];

const InsightsPage = () => {
  const totalInvested = 11200;
  const currentValue = 12485;
  const totalGains = currentValue - totalInvested;
  const gainsPercent = (totalGains / totalInvested) * 100;
  
  const monthlyRoundups = 165;
  const yearlyProjection = monthlyRoundups * 12;
  
  return (
    <div className="container-mobile xl:container xl:py-8">
      {/* Header */}
      <div className="text-center xl:text-left mb-8">
        <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">
          Investment Insights
        </h1>
        <p className="text-muted-foreground xl:text-lg">
          Deep dive into your investment performance and patterns
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl text-xs sm:text-sm">
          <TabsTrigger value="overview" className="rounded-lg px-2">Overview</TabsTrigger>
          <TabsTrigger value="roundups" className="rounded-lg px-2">Round-ups</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg px-2">Portfolio</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-lg px-2">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-success" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-success">
                  +{gainsPercent.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Returns</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <PiggyBank className="text-primary" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-primary">
                  ₹{monthlyRoundups}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Monthly Savings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="text-accent-foreground" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-accent-foreground">
                  ₹{yearlyProjection.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Yearly Projection</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="text-secondary" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-secondary">
                  85
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Investment Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} />
                Portfolio vs Market Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value.toLocaleString()}`, 
                        name === 'portfolio' ? 'Your Portfolio' : 'Market Average'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke="#4CAF50" 
                      strokeWidth={3}
                      dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="market" 
                      stroke="#E0E0E0" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Your Portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                  <span>Market Average</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Insights */}
          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-accent-foreground" size={20} />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium">Strong Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Your portfolio is outperforming the market by 3.2% this quarter.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Info className="text-secondary flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium">Consistent Savings</p>
                    <p className="text-sm text-muted-foreground">
                      You've maintained steady round-ups averaging ₹165/month.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-warning-foreground flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium">Diversification Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Consider adding international ETFs to reduce risk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskAnalysisData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Current"
                        dataKey="current"
                        stroke="#4CAF50"
                        fill="#4CAF50"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="#E0E0E0"
                        fill="transparent"
                        strokeDasharray="3 3"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Round-ups Analysis Tab */}
        <TabsContent value="roundups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Round-up Analysis by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roundupAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'amount' ? `₹${value}` : value,
                        name === 'amount' ? 'Round-ups' : name === 'transactions' ? 'Transactions' : 'Avg Round-up'
                      ]}
                    />
                    <Bar dataKey="amount" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {roundupAnalysisData.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium text-sm">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">₹{item.amount}</p>
                      <p className="text-xs text-muted-foreground">Avg: ₹{item.avgRoundup}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Round-up Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Round-ups']} />
                    <Area
                      type="monotone"
                      dataKey="roundups"
                      stroke="#4CAF50"
                      fill="#4CAF50"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Analysis Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {investmentAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {investmentAllocationData.map((asset, index) => (
                    <div key={asset.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.value}% allocation</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{asset.amount.toLocaleString()}</p>
                        <p className={`text-xs ${asset.returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {asset.returns >= 0 ? '+' : ''}{asset.returns}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Return</span>
                    <span className="text-sm font-medium text-success">+{gainsPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(gainsPercent * 2, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <span className="text-sm font-medium">Medium (6/10)</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Diversification</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cost Ratio</span>
                    <span className="text-sm font-medium text-success">0.05%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Consider adding international exposure</li>
                    <li>• Increase equity allocation for higher growth</li>
                    <li>• Review portfolio quarterly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary" size={20} />
                Investment Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Emergency Fund</span>
                    <span className="text-sm text-muted-foreground">₹8,500 / ₹50,000</span>
                  </div>
                  <Progress value={17} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">17% complete • Target: Dec 2024</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Vacation Fund</span>
                    <span className="text-sm text-muted-foreground">₹4,000 / ₹25,000</span>
                  </div>
                  <Progress value={16} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">16% complete • Target: Jun 2024</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">New Laptop</span>
                    <span className="text-sm text-muted-foreground">₹12,485 / ₹80,000</span>
                  </div>
                  <Progress value={15.6} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">15% complete • Target: Sep 2024</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline">
                  <Target size={16} className="mr-2" />
                  Set New Goal
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal-Based Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Increase Monthly Target</p>
                    <p className="text-sm text-muted-foreground">
                      Boost your round-up goal to ₹300/month to reach emergency fund faster.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Optimize Investment Mix</p>
                    <p className="text-sm text-muted-foreground">
                      Consider 70% equity for long-term goals like laptop purchase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Set Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Enable notifications to stay on track with your investment goals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border"></div>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Jun 2024</p>
                        <p className="text-sm text-muted-foreground">Vacation Fund Target</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border"></div>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Sep 2024</p>
                        <p className="text-sm text-muted-foreground">New Laptop Target</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">Dec 2024</p>
                        <p className="text-sm text-muted-foreground">Emergency Fund Target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsPage;
