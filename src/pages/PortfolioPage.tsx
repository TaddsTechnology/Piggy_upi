import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { TrendingUp, Eye, Target, Gem } from "lucide-react";

const portfolioData = [
  { name: "Gold ETF", value: 60, amount: 7485, color: "#FFD54F" },
  { name: "Index ETFs", value: 40, amount: 4985, color: "#4CAF50" },
];

const performanceData = [
  { month: "Jan", value: 8500 },
  { month: "Feb", value: 9200 },
  { month: "Mar", value: 10100 },
  { month: "Apr", value: 11800 },
  { month: "May", value: 12485 },
];

const COLORS = ["#FFD54F", "#4CAF50"];

const PortfolioPage = () => {
  return (
    <div className="container-mobile xl:container xl:grid xl:grid-cols-12 xl:gap-8 xl:py-8">
      {/* Left Column */}
      <div className="xl:col-span-8 space-y-6">
        {/* Header */}
        <div className="text-center xl:text-left">
          <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">Your Portfolio</h1>
          <p className="text-muted-foreground xl:text-lg">Track your investment growth</p>
        </div>

        {/* Total Value Card */}
        <Card className="mb-6 bg-gradient-card">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Total Portfolio Value</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="balance-text text-primary">₹12,485</span>
              <div className="growth-indicator">
                <TrendingUp size={12} className="mr-1" />
                +12.5%
              </div>
            </div>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div>
                <p>Invested</p>
                <p className="font-medium text-foreground">₹11,200</p>
              </div>
              <div>
                <p>Returns</p>
                <p className="font-medium text-success">+₹1,285</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5-Month Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Right Column */}
      <div className="xl:col-span-4 xl:space-y-6 mt-6 xl:mt-0">
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {portfolioData.map((asset, index) => (
                <div key={asset.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <div className="flex items-center gap-1">
                      {asset.name === "Gold ETF" ? (
                        <Gem size={16} className="text-accent" />
                      ) : (
                        <TrendingUp size={16} className="text-primary" />
                      )}
                      <span className="font-medium text-sm">{asset.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{asset.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{asset.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button size="lg" className="w-full bg-gradient-growth">
            <Eye size={16} className="mr-2" />
            View Detailed Assets
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Rebalance Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;