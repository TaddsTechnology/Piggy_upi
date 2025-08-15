import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { TrendingUp, Eye, Target, Gem, Loader2, RefreshCw } from "lucide-react";
import { usePortfolio } from "@/hooks/use-portfolio";
import DetailedAssetsDialog from "@/components/portfolio/DetailedAssetsDialog";

const COLORS = ["#FFD54F", "#4CAF50", "#2196F3"];

const PortfolioPage = () => {
  const { 
    portfolio, 
    loading, 
    rebalancing, 
    executeRebalance, 
    refreshPortfolio 
  } = usePortfolio();

  // Mock performance data (in a real app, this would come from the backend)
  const performanceData = [
    { month: "Jan", value: portfolio ? portfolio.total_value * 0.68 : 8500 },
    { month: "Feb", value: portfolio ? portfolio.total_value * 0.74 : 9200 },
    { month: "Mar", value: portfolio ? portfolio.total_value * 0.81 : 10100 },
    { month: "Apr", value: portfolio ? portfolio.total_value * 0.95 : 11800 },
    { month: "May", value: portfolio ? portfolio.total_value : 12485 },
  ];

  // Transform portfolio assets to chart data
  const getPortfolioChartData = () => {
    if (!portfolio || portfolio.assets.length === 0) {
      return [
        { name: "No Assets", value: 100, amount: 0, color: "#E0E0E0" }
      ];
    }

    return portfolio.assets.map((asset, index) => ({
      name: asset.name,
      value: asset.allocation_percent,
      amount: asset.current_value,
      color: COLORS[index % COLORS.length],
      symbol: asset.symbol
    }));
  };

  const portfolioChartData = getPortfolioChartData();

  const handleRebalance = async () => {
    await executeRebalance();
  };

  if (loading) {
    return (
      <div className="container-mobile xl:container xl:py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile xl:container xl:grid xl:grid-cols-12 xl:gap-8 xl:py-8">
      {/* Left Column */}
      <div className="xl:col-span-8 space-y-6">
        {/* Header */}
        <div className="text-center xl:text-left flex justify-between items-start">
          <div>
            <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">Your Portfolio</h1>
            <p className="text-muted-foreground xl:text-lg">Track your investment growth</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPortfolio}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Total Value Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="text-yellow-300" size={24} />
                <p className="text-white/90 text-lg font-medium">Total Portfolio Value</p>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-5xl xl:text-6xl font-heading font-bold tracking-tight">
                  ₹{portfolio?.total_value.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-full text-base font-semibold">
                  <TrendingUp size={14} className="mr-1 inline" />
                  {portfolio && portfolio.total_returns_percent >= 0 ? '+' : ''}
                  {portfolio?.total_returns_percent.toFixed(2) || '0.00'}% Returns
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-white/80">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Total Invested</p>
                  <p className="font-bold text-xl">
                    ₹{portfolio?.total_invested.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Total Returns</p>
                  <p className="font-bold text-xl text-yellow-200">
                    {portfolio && portfolio.total_returns >= 0 ? '+' : ''}
                    ₹{portfolio?.total_returns.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="mb-6 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp size={20} className="text-primary" />
              5-Month Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorGradient)" 
                    radius={[6, 6, 0, 0]} 
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="xl:col-span-4 xl:space-y-6 mt-6 xl:mt-0">
        {/* Asset Allocation */}
        <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Target size={20} className="text-primary" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {portfolioChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {portfolioChartData.map((asset, index) => (
                <div 
                  key={asset.name} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 hover:from-white/60 hover:to-white/40 dark:hover:from-gray-700/60 dark:hover:to-gray-700/40 border border-white/30 dark:border-gray-700/30 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full ring-2 ring-white/50 shadow-sm"
                      style={{ backgroundColor: asset.color || COLORS[index % COLORS.length] }}
                    />
                    <div className="flex items-center gap-2">
                      {asset.symbol === "GOLDBEES" ? (
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-1 rounded-full">
                          <Gem size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-1 rounded-full">
                          <TrendingUp size={12} className="text-white" />
                        </div>
                      )}
                      <span className="font-semibold text-sm">{asset.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{asset.amount.toLocaleString()}</p>
                    <p className="text-xs font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {asset.value.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <DetailedAssetsDialog>
            <Button size="lg" className="w-full bg-gradient-growth">
              <Eye size={16} className="mr-2" />
              View Detailed Assets
            </Button>
          </DetailedAssetsDialog>
          
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 text-white hover:from-purple-600 hover:via-blue-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={handleRebalance}
            disabled={rebalancing || !portfolio || portfolio.assets.length === 0}
          >
            {rebalancing && <Loader2 size={16} className="mr-2 animate-spin" />}
            <Target size={16} className="mr-2" />
            Rebalance Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;