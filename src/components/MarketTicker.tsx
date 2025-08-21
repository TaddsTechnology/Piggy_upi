import React, { useMemo, useState, useEffect } from 'react';
import { useMarketSummary, useRealTimeData } from '../hooks/useRealTimeData';
import { formatCurrency, formatPercentage } from '../lib/mockRealTimeData';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

// Move topStocks outside component to prevent recreation
const TOP_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];

const MarketTicker = ({ className = "" }) => {
  const { summary, isLoading } = useMarketSummary(5000); // Refresh every 5 seconds
  
  // Memoize TOP_STOCKS to prevent recreation and infinite loops
  const memoizedTopStocks = useMemo(() => TOP_STOCKS, []);
  
  // Subscribe to top stocks for ticker
  const { data: stockData, isConnected } = useRealTimeData(memoizedTopStocks);
  
  // Use state for last updated time to prevent infinite re-renders
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  // Update the time only when data actually changes
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [summary, stockData, isConnected]);

  if (isLoading) {
    return (
      <div className={`bg-slate-900 text-white p-2 rounded-lg ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse">Loading market data...</div>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (changePercent) => {
    if (changePercent > 0) return 'text-green-400';
    if (changePercent < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-slate-900 text-white overflow-hidden rounded-lg shadow-xl w-full max-w-full ${className}`}>
      {/* Header with Logo and Connection Status */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-1 bg-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {/* Piggy Logo */}
          <img 
            src="/piggy.png" 
            alt="Piggy UPI" 
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain bg-transparent"
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load Piggy UPI logo from /piggy.png');
              // Replace with a fallback or hide gracefully
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzM0ODNGQSIvPgo8dGV4dCB4PSIxMCIgeT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiPjwvdGV4dD4KPC9zdmc+';
              e.target.alt = 'P';
              e.target.title = 'Piggy UPI - Logo failed to load';
            }}
            onLoad={() => {
              console.log('Piggy UPI logo loaded successfully');
            }}
          />
          <span className="hidden sm:inline font-medium text-slate-300">Piggy UPI</span>
          {isConnected ? (
            <div className="flex items-center gap-1 ml-2">
              <Wifi className="w-3 h-3 text-green-400" /> 
              <span className="text-green-400">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 ml-2">
              <WifiOff className="w-3 h-3 text-red-400" /> 
              <span className="text-red-400">Disconnected</span>
            </div>
          )}
        </div>
        <div className="text-slate-400 text-xs hidden md:block">
          Market Status: {summary?.marketStatus || 'open'}
        </div>
        <div className="text-slate-400 text-xs md:hidden">
          Last updated: {lastUpdated}
        </div>
      </div>

      {/* Market Summary - Responsive Layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center px-2 sm:px-4 py-2 bg-slate-800 border-b border-slate-700 gap-2 sm:gap-6">
        {summary?.nifty50 && (
          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            <span className="font-medium text-slate-300">NIFTY 50:</span>
            <span className="font-bold text-white">{formatCurrency(summary.nifty50.value, '')}</span>
            <span className={`flex items-center gap-1 ${getTrendColor(summary.nifty50.changePercent)}`}>
              {getTrendIcon(summary.nifty50.trend)}
              <span className="text-xs sm:text-sm">{formatPercentage(summary.nifty50.changePercent)}</span>
            </span>
          </div>
        )}
        
        {summary?.sensex && (
          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            <span className="font-medium text-slate-300">SENSEX:</span>
            <span className="font-bold text-white">{formatCurrency(summary.sensex.value, '')}</span>
            <span className={`flex items-center gap-1 ${getTrendColor(summary.sensex.changePercent)}`}>
              {getTrendIcon(summary.sensex.trend)}
              <span className="text-xs sm:text-sm">{formatPercentage(summary.sensex.changePercent)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Scrolling Ticker - Responsive */}
      <div className="relative overflow-hidden bg-slate-900 w-full">
        <div className="flex animate-scroll whitespace-nowrap py-2">
          {stockData.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center px-3 sm:px-6 text-xs sm:text-sm flex-shrink-0">
              <span className="font-medium mr-1 sm:mr-2 text-slate-300">{stock.symbol}:</span>
              <span className="font-bold mr-1 sm:mr-2 text-white">{formatCurrency(stock.price, '₹')}</span>
              <span className={`flex items-center gap-1 ${getTrendColor(stock.dayChangePercent)}`}>
                {getTrendIcon(stock.trend)}
                <span className="text-xs">{formatPercentage(stock.dayChangePercent)}</span>
              </span>
            </div>
          ))}
          
          {/* Duplicate for continuous scroll */}
          {stockData.map((stock, index) => (
            <div key={`${stock.symbol}-dup-${index}`} className="flex items-center px-3 sm:px-6 text-xs sm:text-sm flex-shrink-0">
              <span className="font-medium mr-1 sm:mr-2 text-slate-300">{stock.symbol}:</span>
              <span className="font-bold mr-1 sm:mr-2 text-white">{formatCurrency(stock.price, '₹')}</span>
              <span className={`flex items-center gap-1 ${getTrendColor(stock.dayChangePercent)}`}>
                {getTrendIcon(stock.trend)}
                <span className="text-xs">{formatPercentage(stock.dayChangePercent)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Only show on larger screens */}
      <div className="hidden md:block px-4 py-1 bg-slate-800 text-xs text-slate-400 text-right">
        Last updated: {lastUpdated}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        
        @media (max-width: 640px) {
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;
