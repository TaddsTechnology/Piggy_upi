import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw, 
  Wifi,
  WifiOff,
  AlertCircle
} from "lucide-react";
import { useMarketData, useMarketStatus } from "@/hooks/use-market-data";
import { formatCurrency } from "@/lib/yahoo-finance-api";

interface MarketStatusProps {
  symbols?: string[];
  className?: string;
  showDetailedView?: boolean;
}

export const MarketStatus = ({ 
  symbols = ['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES'],
  className = "",
  showDetailedView = false 
}: MarketStatusProps) => {
  const [marketState, marketActions] = useMarketData(symbols, {
    autoRefresh: false, // Manual refresh only
    refreshInterval: 60000, // Not used
    fallbackOnError: true
  });

  const { isOpen, marketState: status, refresh: refreshStatus } = useMarketStatus();

  const getMarketStatusBadge = () => {
    switch (status) {
      case 'REGULAR':
        return <Badge variant="default" className="bg-green-500">🟢 Market Open</Badge>;
      case 'PRE':
        return <Badge variant="secondary">🟡 Pre-Market</Badge>;
      case 'POST':
        return <Badge variant="secondary">🟡 After Hours</Badge>;
      case 'CLOSED':
        return <Badge variant="outline">🔴 Market Closed</Badge>;
      case 'FALLBACK':
        return <Badge variant="destructive">📱 Demo Data</Badge>;
      default:
        return <Badge variant="outline">❓ Unknown</Badge>;
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      marketActions.refreshData(),
      refreshStatus()
    ]);
  };

  if (showDetailedView) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Market Status Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Market Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {marketState.lastUpdated?.toLocaleTimeString() || 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getMarketStatusBadge()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={marketState.loading}
                >
                  <RefreshCw size={16} className={marketState.loading ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETF Prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {symbols.map(symbol => {
            const data = marketState.data[symbol];
            const isPositive = data ? data.changePercent >= 0 : true;
            
            return (
              <Card key={symbol}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{symbol}</h4>
                    {data ? (
                      <Wifi size={16} className="text-green-500" />
                    ) : (
                      <WifiOff size={16} className="text-red-500" />
                    )}
                  </div>
                  
                  {data ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">
                          {formatCurrency(data.price)}
                        </span>
                        {isPositive ? (
                          <TrendingUp size={16} className="text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}</span>
                        <span>({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        Vol: {(data.volume / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <AlertCircle size={16} className="mb-1" />
                      <span className="text-sm">No data</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Error/Status Messages */}
        {marketState.error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle size={16} />
                <span className="text-sm">{marketState.error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Compact view
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getMarketStatusBadge()}
      
      {marketState.data.NIFTYBEES && (
        <div className="text-sm text-muted-foreground">
          NIFTY: {formatCurrency(marketState.data.NIFTYBEES.price)}
          <span className={`ml-1 ${
            marketState.data.NIFTYBEES.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ({marketState.data.NIFTYBEES.changePercent >= 0 ? '+' : ''}{marketState.data.NIFTYBEES.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={marketState.loading}
      >
        <RefreshCw size={14} className={marketState.loading ? 'animate-spin' : ''} />
      </Button>
    </div>
  );
};

// Quick market indicator for header/navigation
export const MarketIndicator = ({ className = "" }: { className?: string }) => {
  const { isOpen, marketState } = useMarketStatus();
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      <span className="text-xs text-muted-foreground">
        {isOpen ? 'Live' : 'Closed'}
      </span>
    </div>
  );
};

// Portfolio performance summary
export const PortfolioSummary = ({ className = "" }: { className?: string }) => {
  const [marketState] = useMarketData(['NIFTYBEES', 'GOLDBEES']);
  
  if (marketState.loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  const niftyData = marketState.data.NIFTYBEES;
  const goldData = marketState.data.GOLDBEES;
  
  if (!niftyData && !goldData) {
    return <div className={className}>Market data unavailable</div>;
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {niftyData && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Nifty ETF</span>
          <div className={`text-sm font-medium ${
            niftyData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(niftyData.price)}
            <span className="ml-1">
              ({niftyData.changePercent >= 0 ? '+' : ''}{niftyData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
      
      {goldData && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Gold ETF</span>
          <div className={`text-sm font-medium ${
            goldData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(goldData.price)}
            <span className="ml-1">
              ({goldData.changePercent >= 0 ? '+' : ''}{goldData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
