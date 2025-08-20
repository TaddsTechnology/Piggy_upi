import React from 'react';
import MarketTicker from '../components/MarketTicker';
import LivePortfolio from '../components/LivePortfolio';
import { useMarketNews, useStockData } from '../hooks/useRealTimeData';
import { formatCurrency, formatPercentage } from '../lib/mockRealTimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Newspaper, Zap } from 'lucide-react';

const RealTimeDemo = () => {
  const { news } = useMarketNews(15000); // Refresh news every 15 seconds
  const { stockData: reliance, isConnected } = useStockData('RELIANCE');

  const getNewsImpactColor = (impact) => {
    switch (impact) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UPI Piggy - Real-Time Market Data Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience live market updates with mock data that simulates real market conditions
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Mock Real-Time Data
            </Badge>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>

        {/* Market Ticker */}
        <MarketTicker className="w-full" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Section (spans 2 columns) */}
          <div className="lg:col-span-2">
            <LivePortfolio />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Featured Stock: RELIANCE
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reliance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(reliance.price)}
                        </div>
                        <div className="text-sm text-gray-600">Current Price</div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${reliance.dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {getTrendIcon(reliance.trend)}
                          <span className="font-semibold">
                            {formatPercentage(reliance.dayChangePercent)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Today's Change</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Volume</div>
                        <div className="font-semibold">{reliance.volume?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">P/E Ratio</div>
                        <div className="font-semibold">{reliance.pe}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(reliance.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-pulse">Loading stock data...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market News */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent>
                {news ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className={getNewsImpactColor(news.impact)}>
                        {news.impact}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">
                          {news.headline}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(news.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-pulse">Loading news...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Info */}
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live price updates (2-8 seconds)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Portfolio value tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Market ticker with scrolling data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time news updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Connection status monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Easy switch to real APIs later</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Mock Data:</strong> Realistic price movements with proper volatility simulation
                  </p>
                  <p>
                    <strong>WebSocket Simulation:</strong> Subscription-based updates with automatic cleanup
                  </p>
                  <p>
                    <strong>Easy Migration:</strong> Change one config flag to switch to real APIs
                  </p>
                  <p>
                    <strong>Performance:</strong> Optimized with React hooks and proper state management
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            This demo showcases mock real-time data. In production, this will connect to actual market data APIs.
          </p>
          <p className="mt-2">
            Switch the configuration in <code>src/config/marketData.js</code> to use real data when ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDemo;
