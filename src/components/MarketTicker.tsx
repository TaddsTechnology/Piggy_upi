import React from 'react';
import { useMarketSummary, useRealTimeData } from '../hooks/useRealTimeData';
import { formatCurrency, formatPercentage } from '../lib/mockRealTimeData';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

const MarketTicker = ({ className = "" }) => {
  const { summary, isLoading } = useMarketSummary(5000); // Refresh every 5 seconds
  
  // Subscribe to top stocks for ticker
  const topStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
  const { data: stockData, isConnected } = useRealTimeData(topStocks);

  if (isLoading) {
    return (
      <div className={`bg-slate-900 text-white p-2 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse">Loading market data...</div>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (changePercent) => {
    if (changePercent > 0) return 'text-green-400';
    if (changePercent < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-slate-900 text-white overflow-hidden ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between px-4 py-1 bg-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <><Wifi className="w-3 h-3 text-green-400" /> Live</>
          ) : (
            <><WifiOff className="w-3 h-3 text-red-400" /> Disconnected</>
          )}
        </div>
        <div className="text-slate-400">
          Market Status: {summary?.marketStatus || 'Unknown'}
        </div>
      </div>

      {/* Market Summary */}
      <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        {summary?.nifty50 && (
          <div className="flex items-center gap-2 mr-6">
            <span className="font-medium">NIFTY 50:</span>
            <span className="font-bold">{formatCurrency(summary.nifty50.value, '')}</span>
            <span className={`flex items-center gap-1 ${getTrendColor(summary.nifty50.changePercent)}`}>
              {getTrendIcon(summary.nifty50.trend)}
              {formatPercentage(summary.nifty50.changePercent)}
            </span>
          </div>
        )}
        
        {summary?.sensex && (
          <div className="flex items-center gap-2">
            <span className="font-medium">SENSEX:</span>
            <span className="font-bold">{formatCurrency(summary.sensex.value, '')}</span>
            <span className={`flex items-center gap-1 ${getTrendColor(summary.sensex.changePercent)}`}>
              {getTrendIcon(summary.sensex.trend)}
              {formatPercentage(summary.sensex.changePercent)}
            </span>
          </div>
        )}
      </div>

      {/* Scrolling Ticker */}
      <div className="relative overflow-hidden bg-slate-900">
        <div className="flex animate-scroll whitespace-nowrap py-2">
          {stockData.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center px-6 text-sm">
              <span className="font-medium mr-2">{stock.symbol}:</span>
              <span className="font-bold mr-2">{formatCurrency(stock.price, '₹')}</span>
              <span className={`flex items-center gap-1 ${getTrendColor(stock.dayChangePercent)}`}>
                {getTrendIcon(stock.trend)}
                {formatPercentage(stock.dayChangePercent)}
              </span>
            </div>
          ))}
          
          {/* Duplicate for continuous scroll */}
          {stockData.map((stock, index) => (
            <div key={`${stock.symbol}-dup-${index}`} className="flex items-center px-6 text-sm">
              <span className="font-medium mr-2">{stock.symbol}:</span>
              <span className="font-bold mr-2">{formatCurrency(stock.price, '₹')}</span>
              <span className={`flex items-center gap-1 ${getTrendColor(stock.dayChangePercent)}`}>
                {getTrendIcon(stock.trend)}
                {formatPercentage(stock.dayChangePercent)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Update Time */}
      <div className="px-4 py-1 bg-slate-800 text-xs text-slate-400 text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;
