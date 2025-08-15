import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { usePortfolio } from '@/hooks/use-portfolio';
import { PortfolioAsset, RebalanceRecommendation } from '@/lib/portfolio';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Gem,
  BarChart3,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface DetailedAssetsDialogProps {
  children: React.ReactNode;
}

const DetailedAssetsDialog = ({ children }: DetailedAssetsDialogProps) => {
  const { 
    portfolio, 
    loading, 
    rebalancing, 
    rebalanceRecommendations,
    generateRebalanceRecommendations,
    executeRebalance 
  } = usePortfolio();
  
  const [showRebalanceRecommendations, setShowRebalanceRecommendations] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  const handleGenerateRecommendations = async () => {
    setGeneratingRecommendations(true);
    await generateRebalanceRecommendations();
    setShowRebalanceRecommendations(true);
    setGeneratingRecommendations(false);
  };

  const handleExecuteRebalance = async () => {
    const success = await executeRebalance();
    if (success) {
      setShowRebalanceRecommendations(false);
    }
  };

  const getAssetIcon = (symbol: string) => {
    switch (symbol) {
      case 'GOLDBEES':
        return <Gem size={16} className="text-yellow-500" />;
      case 'NIFTYBEES':
        return <TrendingUp size={16} className="text-blue-500" />;
      default:
        return <BarChart3 size={16} className="text-gray-500" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'buy':
        return 'default';
      case 'sell':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <ArrowUpRight size={12} />;
      case 'sell':
        return <ArrowDownRight size={12} />;
      default:
        return <CheckCircle2 size={12} />;
    }
  };

  if (loading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading portfolio details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={20} />
            Portfolio Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-semibold">₹{portfolio?.total_value.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Invested</p>
                  <p className="text-lg font-medium">₹{portfolio?.total_invested.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Returns</p>
                  <p className={`text-lg font-medium ${portfolio && portfolio.total_returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio && portfolio.total_returns >= 0 ? '+' : ''}₹{portfolio?.total_returns.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Returns %</p>
                  <p className={`text-lg font-medium ${portfolio && portfolio.total_returns_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio && portfolio.total_returns_percent >= 0 ? '+' : ''}{portfolio?.total_returns_percent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Asset Breakdown</h3>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateRecommendations}
                  disabled={generatingRecommendations}
                >
                  {generatingRecommendations && <Loader2 size={14} className="mr-2 animate-spin" />}
                  <Target size={14} className="mr-2" />
                  Analyze Balance
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {portfolio?.assets.map((asset: PortfolioAsset) => (
                <Card key={asset.symbol} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getAssetIcon(asset.symbol)}
                        <div>
                          <h4 className="font-semibold">{asset.name}</h4>
                          <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{asset.current_value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.units.toFixed(2)} units @ ₹{asset.current_price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Allocation Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">Allocation</span>
                          <span className="text-sm font-medium">
                            {asset.allocation_percent.toFixed(1)}% / {asset.target_percent}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={asset.allocation_percent} className="h-2" />
                          <div 
                            className="absolute top-0 h-2 w-1 bg-red-500 rounded"
                            style={{ left: `${asset.target_percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Current: {asset.allocation_percent.toFixed(1)}%</span>
                          <span>Target: {asset.target_percent}%</span>
                          <span className={`${Math.abs(asset.difference) > 5 ? 'text-orange-600 font-medium' : ''}`}>
                            Diff: {asset.difference > 0 ? '+' : ''}{asset.difference.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Cost</p>
                          <p className="font-medium">₹{asset.avg_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P&L</p>
                          <p className={`font-medium flex items-center gap-1 ${asset.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.unrealized_pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {asset.unrealized_pnl >= 0 ? '+' : ''}₹{asset.unrealized_pnl.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P&L %</p>
                          <p className={`font-medium ${asset.unrealized_pnl_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.unrealized_pnl_percent >= 0 ? '+' : ''}{asset.unrealized_pnl_percent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rebalancing Recommendations */}
          {showRebalanceRecommendations && rebalanceRecommendations.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertTriangle size={20} />
                  Rebalancing Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your portfolio allocation differs from your target. Here are our recommendations:
                </p>

                <div className="space-y-3">
                  {rebalanceRecommendations.map((rec: RebalanceRecommendation) => (
                    <div key={rec.symbol} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAssetIcon(rec.symbol)}
                        <div>
                          <p className="font-medium">{rec.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: ₹{rec.current_value.toLocaleString()} → Target: ₹{rec.target_value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(rec.action)} className="flex items-center gap-1">
                          {getActionIcon(rec.action)}
                          {rec.action.toUpperCase()}
                          {rec.recommended_units > 0 && ` ${rec.recommended_units} units`}
                        </Badge>
                        <p className={`text-sm font-medium ${rec.difference_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rec.difference_value > 0 ? '+' : ''}₹{Math.abs(rec.difference_value).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleExecuteRebalance}
                    disabled={rebalancing}
                    className="flex-1"
                  >
                    {rebalancing && <Loader2 size={14} className="mr-2 animate-spin" />}
                    Execute Rebalancing
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRebalanceRecommendations(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedAssetsDialog;
