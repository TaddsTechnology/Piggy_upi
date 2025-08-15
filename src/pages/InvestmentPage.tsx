import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  IndianRupee, 
  CheckCircle, 
  AlertTriangle,
  PieChart,
  Zap,
  Shield,
  Clock,
  Star,
  Sparkles
} from "lucide-react";
import { usePiggyCore } from "@/hooks/use-piggy-core";
import { formatCurrency, formatPercentage, PORTFOLIO_PRESETS } from "@/lib/algorithms";
import { useMarketData } from "@/hooks/use-market-data";

const InvestmentPage = () => {
  const navigate = useNavigate();
  const [piggyState, piggyActions] = usePiggyCore();
  const [marketState] = useMarketData(['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES']);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investmentComplete, setInvestmentComplete] = useState(false);
  const [investmentOrders, setInvestmentOrders] = useState<any[]>([]);

  const investmentAmount = piggyState.piggyBalance;
  const currentPreset = PORTFOLIO_PRESETS[piggyState.portfolioPreset];

  // Calculate planned allocations
  const plannedAllocations = currentPreset.allocations.map((allocation) => {
    const allocatedAmount = (investmentAmount * allocation.weightPct) / 100;
    const currentPrice = marketState.data[allocation.symbol]?.price || 0;
    const estimatedUnits = currentPrice > 0 ? allocatedAmount / currentPrice : 0;

    return {
      symbol: allocation.symbol,
      name: allocation.name,
      percentage: allocation.weightPct,
      amount: allocatedAmount,
      currentPrice,
      estimatedUnits,
      marketData: marketState.data[allocation.symbol]
    };
  });


  const handleInvest = async () => {
    setIsInvesting(true);
    
    // Simulate investment process
    try {
      // Call the investment function
      piggyActions.manualInvest(investmentAmount);
      
      // Simulate getting order details (in real app, this would come from the manualInvest response)
      const mockOrders = plannedAllocations.map(allocation => ({
        symbol: allocation.symbol,
        name: allocation.name,
        quantity: allocation.estimatedUnits,
        price: allocation.currentPrice,
        amount: allocation.amount,
        status: 'completed'
      }));
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInvestmentOrders(mockOrders);
      setInvestmentComplete(true);
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  if (investmentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Animation */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <CheckCircle size={40} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles size={16} className="text-yellow-800" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Investment Successful! 🚀
            </h1>
            <p className="text-xl text-muted-foreground">
              {formatCurrency(investmentAmount)} is now working for your future
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full mx-auto w-fit">
              <Zap size={16} />
              <span>Your portfolio is instantly diversified</span>
            </div>
          </div>

          {/* Investment Breakdown */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-lg font-heading">
                <Target className="text-primary" size={20} />
                Investment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {investmentOrders.map((order, index) => {
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-amber-500 to-amber-600',
                  'from-emerald-500 to-emerald-600'
                ];
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary/5 hover:to-secondary/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{order.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.quantity.toFixed(4)} units @ {formatCurrency(order.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.amount)}</p>
                      <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                        ✓ Completed
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/portfolio')} 
                className="h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-heading font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                <PieChart size={18} className="mr-2" />
                View Portfolio
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="h-12 rounded-xl border-2 hover:bg-muted/50 font-semibold"
              >
                <Target size={18} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-6">
              Your investment is now live and will be visible in your portfolio within minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container-mobile xl:container xl:max-w-4xl xl:mx-auto py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full hover:bg-primary/10">
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                <h1 className="text-xl xl:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Confirm Investment
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">Your spare change is ready to grow</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile xl:container xl:max-w-4xl xl:mx-auto pb-8 pt-6 space-y-6">
        {/* Hero Investment Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-yellow-300" size={20} />
                  <p className="text-white/90 text-sm font-medium">Ready to Invest</p>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={28} />
                  <span className="text-4xl xl:text-5xl font-heading font-bold tracking-tight">
                    {investmentAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-white/70 text-sm mt-1">Accumulated from your spare change</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                  <Star size={12} className="mr-1" />
                  {piggyState.portfolioPreset.toUpperCase()}
                </Badge>
                <p className="text-white/70 text-xs">Strategy</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Shield size={14} />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Instant</span>
              </div>
              <div className="flex items-center gap-1">
                <PieChart size={14} />
                <span>Diversified</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Breakdown */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <PieChart className="text-primary" size={20} />
                Investment Allocation
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {plannedAllocations.length} Assets
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {plannedAllocations.map((allocation, index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-amber-500 to-amber-600',
                'from-emerald-500 to-emerald-600'
              ];
              return (
                <div key={index} className="group hover:bg-muted/50 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{allocation.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {allocation.currentPrice > 0 ? `₹${allocation.currentPrice.toFixed(2)} per unit` : 'Price loading...'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(allocation.amount)}</p>
                      <Badge variant="secondary" className="text-xs">{allocation.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={allocation.percentage} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Units: ~{allocation.estimatedUnits.toFixed(4)}</span>
                    {allocation.marketData && (
                      <Badge 
                        variant={allocation.marketData.change >= 0 ? "default" : "destructive"} 
                        className="text-xs px-2 py-0"
                      >
                        {allocation.marketData.change >= 0 ? <TrendingUp size={10} className="mr-1" /> : <span className="mr-1">↓</span>}
                        {formatPercentage(allocation.marketData.changePercent)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Investment Benefits */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="text-primary" size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground mb-2">Why This Investment?</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap size={14} className="text-primary" />
                    <span>Instant diversification across top ETFs</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield size={14} className="text-primary" />
                    <span>No fees on this investment</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp size={14} className="text-primary" />
                    <span>Professionally managed portfolio</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Disclaimer */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-medium">Important Disclosures</p>
                <ul className="space-y-0.5 text-amber-700/80">
                  <li>• Investments are subject to market risk and can go up or down</li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>• All investments are executed at prevailing market prices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-4 -mx-4 xl:-mx-0 xl:relative xl:bg-transparent xl:border-0 xl:p-0">
          <div className="space-y-3">
            <Button 
              onClick={handleInvest}
              disabled={isInvesting || investmentAmount < currentPreset.minSweepAmount}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-heading font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              {isInvesting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Investment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap size={18} />
                  Invest {formatCurrency(investmentAmount)} Now
                </div>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full h-10 rounded-xl border-2 hover:bg-muted/50"
              disabled={isInvesting}
            >
              Review Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPage;
