import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketTicker from "@/components/MarketTicker";
import MockDataDemo from "@/components/MockDataDemo";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Clock,
  BarChart3,
  Activity,
  DollarSign
} from "lucide-react";
import { MarketStatus } from "@/components/MarketStatus";
import { useMarketData, useSymbolSearch } from "@/hooks/use-market-data";
import { formatCurrency } from "@/lib/yahoo-finance-api";
import { INDIAN_ETF_SYMBOLS } from "@/lib/yahoo-finance-api";

const MarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading: searchLoading, search } = useSymbolSearch();
  
  // Popular ETFs data
  const popularSymbols = ['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES', 'JUNIORBEES'];
  const [marketState] = useMarketData(popularSymbols, {
    autoRefresh: false, // Manual refresh only
    refreshInterval: 30000, // Not used
    fallbackOnError: true
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      search(searchQuery);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const MarketOverview = () => (
    <div className="space-y-6">
      <MarketStatus showDetailedView={true} />
      
      {/* Live Market Ticker */}
      <div className="mb-6">
        <MarketTicker className="w-full" />
      </div>
      
      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Trading Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0">
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/5 rounded-full blur-md animate-bounce"></div>
          </div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">📊 Active Trading</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {Object.values(marketState.data).filter(data => data !== null).length}
              </span>
              <p className="text-xs text-white/80 mt-1">ETFs tracked</p>
            </div>
          </CardContent>
        </Card>

        {/* Gainers Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0">
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/5 rounded-full blur-md animate-bounce"></div>
          </div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">📈 Gainers</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {Object.values(marketState.data).filter(data => data && data.changePercent > 0).length}
              </span>
              <p className="text-xs text-white/80 mt-1">ETFs up today</p>
            </div>
          </CardContent>
        </Card>

        {/* Decliners Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-400 via-pink-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0">
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/5 rounded-full blur-md animate-bounce"></div>
          </div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">📉 Decliners</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {Object.values(marketState.data).filter(data => data && data.changePercent < 0).length}
              </span>
              <p className="text-xs text-white/80 mt-1">ETFs down today</p>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0">
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/5 rounded-full blur-md animate-bounce"></div>
          </div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">⏰ Last Updated</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                {marketState.lastUpdated?.toLocaleTimeString() || 'Never'}
              </span>
              <p className="text-xs text-white/80 mt-1">Real-time data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ETFList = () => (
    <Card className="shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-l-4 border-l-cyan-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-bold">
          <div className="relative">
            <BarChart3 className="text-cyan-500 animate-pulse" size={24} />
            <div className="absolute inset-0 bg-cyan-400/30 blur-md rounded-full animate-ping"></div>
          </div>
          📊 Popular ETFs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {popularSymbols.map(symbol => {
            const data = marketState.data[symbol];
            const isPositive = data ? data.changePercent >= 0 : true;
            
            return (
              <div 
                key={symbol} 
                className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-lg border-2 ${
                  data 
                    ? isPositive
                      ? "bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200/60 hover:border-green-300/80"
                      : "bg-gradient-to-r from-red-100 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-200/60 hover:border-red-300/80"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 border-gray-200/60 hover:border-gray-300/80"
                }`}
              >
                {/* Mobile-First Layout */}
                <div className="space-y-3">
                  {/* Header Row - Symbol and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status Indicator */}
                      <div className={`relative w-3 h-3 rounded-full ring-2 ring-offset-1 ${
                        data 
                          ? isPositive 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 ring-green-300 animate-pulse' 
                            : 'bg-gradient-to-r from-red-400 to-pink-500 ring-red-300 animate-pulse'
                          : 'bg-gray-400 ring-gray-300'
                      }`}>
                        {data && (
                          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                        )}
                      </div>
                      
                      {/* Symbol and Icon */}
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{symbol}</h4>
                        {symbol === 'NIFTYBEES' && <span className="text-sm">🏛️</span>}
                        {symbol === 'GOLDBEES' && <span className="text-sm">🥇</span>}
                        {symbol === 'LIQUIDBEES' && <span className="text-sm">💧</span>}
                        {symbol === 'JUNIORBEES' && <span className="text-sm">🚀</span>}
                      </div>
                    </div>
                    
                    {/* Price Badge */}
                    {data ? (
                      <Badge 
                        className={`px-3 py-1 text-sm font-bold ${
                          isPositive 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                            : "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md"
                        }`}
                      >
                        {isPositive ? '↗️ +' : '↘️ '}{data.changePercent.toFixed(2)}%
                      </Badge>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">📊 Loading</span>
                      </div>
                    )}
                  </div>
                  
                  {/* ETF Name */}
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 pl-6">
                    {data?.name || 'Indian ETF'}
                  </p>
                  
                  {/* Price and Stats Row */}
                  {data ? (
                    <div className="flex items-center justify-between pl-6">
                      <div>
                        <span className="font-bold text-xl">
                          {formatCurrency(data.price)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                            Vol: {formatVolume(data.volume)}
                          </span>
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                            {data.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-6">
                      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg inline-block">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Fetching data...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const SymbolSearch = () => (
    <Card className="shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-l-4 border-l-violet-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-bold">
          <div className="relative">
            <Search className="text-violet-500 animate-pulse" size={24} />
            <div className="absolute inset-0 bg-violet-400/30 blur-md rounded-full animate-ping"></div>
          </div>
          🔍 Symbol Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Input
            placeholder="Search ETF symbols (e.g., NIFTY, GOLD)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-white/50 dark:bg-gray-800/50 border-violet-200 focus:border-violet-400 transition-colors"
          />
          <Button 
            onClick={handleSearch} 
            disabled={searchLoading}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg"
          >
            {searchLoading ? '🔄 Searching...' : '🚀 Search'}
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2">
              🎯 Search Results:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {results.map(symbol => (
                <Badge 
                  key={symbol} 
                  className="justify-center p-3 text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200 hover:scale-105"
                >
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-violet-200 to-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-1 rounded-full font-medium text-violet-600">Available ETFs</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            📈 All ETFs ({Object.keys(INDIAN_ETF_SYMBOLS).length} available):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(INDIAN_ETF_SYMBOLS).map((symbol, index) => (
              <Badge 
                key={symbol} 
                className={`justify-center p-3 text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                  index % 4 === 0 ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200' :
                  index % 4 === 1 ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200' :
                  index % 4 === 2 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                  'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200'
                } border-2`}
              >
                {symbol}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MarketInsights = () => (
    <div className="space-y-6">
      <Card className="shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-l-4 border-l-teal-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="relative">
              <DollarSign className="text-teal-500 animate-pulse" size={24} />
              <div className="absolute inset-0 bg-teal-400/30 blur-md rounded-full animate-ping"></div>
            </div>
            📊 Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Analysis Card */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0">
              <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 bg-white/5 rounded-full blur-lg animate-bounce"></div>
            </div>
            <div className="relative">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-xl">
                  📈
                </div>
                Market Analysis
              </h4>
              <p className="text-white/90 text-base leading-relaxed">
                Real-time data powered by Yahoo Finance API. No API key required, completely free to use.
                Track your favorite ETFs with live price updates and market insights.
              </p>
            </div>
          </div>
          
          {/* Investment Tip Card */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0">
              <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 bg-white/5 rounded-full blur-lg animate-bounce"></div>
            </div>
            <div className="relative">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-xl">
                  💡
                </div>
                Investment Tip
              </h4>
              <p className="text-white/90 text-base leading-relaxed">
                ETFs provide instant diversification across multiple assets. NIFTYBEES tracks the Nifty 50 index, 
                while GOLDBEES follows gold prices. Perfect for balanced portfolios!
              </p>
            </div>
          </div>
          
          {/* Market Hours Card */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0">
              <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 bg-white/5 rounded-full blur-lg animate-bounce"></div>
            </div>
            <div className="relative">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-xl">
                  ⏰
                </div>
                Market Hours
              </h4>
              <p className="text-white/90 text-base leading-relaxed">
                Indian markets operate Monday-Friday, 9:15 AM to 3:30 PM IST. 
                Data refreshes every minute during market hours for real-time accuracy.
              </p>
            </div>
          </div>
          
          {/* Additional Pro Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200/60 rounded-xl">
              <h5 className="font-bold text-purple-800 dark:text-purple-300 mb-2">🚀 Pro Tip</h5>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Use the search feature to discover new ETFs and expand your investment horizon.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border-2 border-indigo-200/60 rounded-xl">
              <h5 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">🔄 Live Data</h5>
              <p className="text-sm text-indigo-700 dark:text-indigo-400">
                All prices update automatically during market hours for the most current information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with Piggy Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <img 
              src="/piggy.png" 
              alt="Piggy UPI" 
              className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground">
                Indian Markets 📊
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Real-time ETF prices and market data powered by Yahoo Finance
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Overview</TabsTrigger>
            <TabsTrigger value="etfs" className="text-xs sm:text-sm px-2 sm:px-4 py-2">ETFs</TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Search</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Insights</TabsTrigger>
            <TabsTrigger value="live-demo" className="text-xs sm:text-sm px-2 sm:px-4 py-2 col-span-2 sm:col-span-1">🎮 Live Demo</TabsTrigger>
          </TabsList>
        
        <TabsContent value="overview">
          <MarketOverview />
        </TabsContent>
        
        <TabsContent value="etfs">
          <ETFList />
        </TabsContent>
        
        <TabsContent value="search">
          <SymbolSearch />
        </TabsContent>
        
        <TabsContent value="insights">
          <MarketInsights />
        </TabsContent>
        
        <TabsContent value="live-demo">
          <MockDataDemo />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketsPage;
