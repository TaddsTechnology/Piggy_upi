import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioService, PortfolioSummary, RebalanceRecommendation } from '@/lib/portfolio';
import { useToast } from '@/hooks/use-toast';

export const usePortfolio = () => {
  const { user, demoMode } = useAuth();
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalanceRecommendations, setRebalanceRecommendations] = useState<RebalanceRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Demo portfolio data
  const getDemoPortfolio = (): PortfolioSummary => ({
    total_value: 12485,
    total_invested: 11200,
    total_returns: 1285,
    total_returns_percent: 11.47,
    assets: [
      {
        symbol: 'GOLDBEES',
        name: 'Gold ETF',
        units: 114.72,
        current_price: 65.25,
        current_value: 7485,
        avg_cost: 63.50,
        total_cost: 7284,
        unrealized_pnl: 201,
        unrealized_pnl_percent: 2.76,
        allocation_percent: 60,
        target_percent: 50,
        difference: 10
      },
      {
        symbol: 'NIFTYBEES',
        name: 'Nifty 50 ETF',
        units: 17.46,
        current_price: 285.50,
        current_value: 4985,
        avg_cost: 276.80,
        total_cost: 4834,
        unrealized_pnl: 151,
        unrealized_pnl_percent: 3.12,
        allocation_percent: 40,
        target_percent: 50,
        difference: -10
      }
    ]
  });

  // Load portfolio data
  const loadPortfolio = useCallback(async () => {
    if (demoMode) {
      setPortfolio(getDemoPortfolio());
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First update holdings with current prices
      await portfolioService.updateHoldingsWithCurrentPrices(user.id);
      
      // Then calculate portfolio summary
      const portfolioSummary = await portfolioService.calculatePortfolioSummary(user.id);
      setPortfolio(portfolioSummary);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.message || 'Failed to load portfolio');
      
      // Set fallback portfolio if error occurs
      setPortfolio({
        total_value: 0,
        total_invested: 0,
        total_returns: 0,
        total_returns_percent: 0,
        assets: []
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, demoMode]);

  // Generate rebalance recommendations
  const generateRebalanceRecommendations = useCallback(async () => {
    if (demoMode) {
      const demoRecommendations: RebalanceRecommendation[] = [
        {
          symbol: 'GOLDBEES',
          name: 'Gold ETF',
          current_value: 7485,
          target_value: 6242.5,
          difference_value: -1242.5,
          action: 'sell',
          recommended_units: 19
        },
        {
          symbol: 'NIFTYBEES',
          name: 'Nifty 50 ETF',
          current_value: 4985,
          target_value: 6242.5,
          difference_value: 1257.5,
          action: 'buy',
          recommended_units: 4
        }
      ];
      setRebalanceRecommendations(demoRecommendations);
      return demoRecommendations;
    }

    if (!user?.id) return [];

    try {
      const recommendations = await portfolioService.generateRebalanceRecommendations(user.id);
      setRebalanceRecommendations(recommendations);
      return recommendations;
    } catch (err: any) {
      console.error('Failed to generate rebalance recommendations:', err);
      toast({
        title: "Error",
        description: "Failed to generate rebalancing recommendations",
        variant: "destructive",
      });
      return [];
    }
  }, [user?.id, demoMode, toast]);

  // Execute rebalancing
  const executeRebalance = useCallback(async (recommendations?: RebalanceRecommendation[]) => {
    const recsToUse = recommendations || rebalanceRecommendations;
    
    if (demoMode) {
      setRebalancing(true);
      // Simulate rebalancing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rebalancing Complete",
        description: "Your portfolio has been rebalanced successfully (demo mode)",
      });
      
      // Refresh portfolio data
      await loadPortfolio();
      setRebalancing(false);
      return true;
    }

    if (!user?.id || recsToUse.length === 0) {
      toast({
        title: "No Action Needed",
        description: "Your portfolio is already well-balanced",
      });
      return false;
    }

    try {
      setRebalancing(true);
      
      const success = await portfolioService.executeRebalance(user.id, recsToUse);
      
      if (success) {
        toast({
          title: "Rebalancing Initiated",
          description: "Your portfolio rebalancing orders have been placed",
        });
        
        // Refresh portfolio data
        await loadPortfolio();
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Failed to execute rebalance:', err);
      toast({
        title: "Rebalancing Failed",
        description: err.message || "Failed to execute portfolio rebalancing",
        variant: "destructive",
      });
      return false;
    } finally {
      setRebalancing(false);
    }
  }, [user?.id, demoMode, rebalanceRecommendations, toast, loadPortfolio]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Load portfolio on mount
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Listen for demo mode exit events and clear state
  useEffect(() => {
    const handleDemoModeExit = () => {
      setPortfolio(null);
      setRebalanceRecommendations([]);
      setError(null);
      setLoading(true);
      // Reload real data
      if (user?.id && !demoMode) {
        loadPortfolio();
      } else {
        setLoading(false);
      }
    };

    window.addEventListener('demo-mode-exit', handleDemoModeExit);
    return () => {
      window.removeEventListener('demo-mode-exit', handleDemoModeExit);
    };
  }, [user?.id, demoMode, loadPortfolio]);

  return {
    portfolio,
    loading,
    rebalancing,
    error,
    rebalanceRecommendations,
    generateRebalanceRecommendations,
    executeRebalance,
    refreshPortfolio,
  };
};
