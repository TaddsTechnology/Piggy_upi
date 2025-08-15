import { supabase } from './supabase';
import { settingsService } from './settings';

export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  units: number;
  avg_cost: number;
  current_price: number;
  current_value: number;
  last_updated: string;
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  units: number;
  current_price: number;
  current_value: number;
  avg_cost: number;
  total_cost: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  allocation_percent: number;
  target_percent: number;
  difference: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_returns: number;
  total_returns_percent: number;
  assets: PortfolioAsset[];
}

export interface RebalanceRecommendation {
  symbol: string;
  name: string;
  current_value: number;
  target_value: number;
  difference_value: number;
  action: 'buy' | 'sell' | 'hold';
  recommended_units: number;
}

const ASSET_MAPPING = {
  'NIFTYBEES': 'Nifty 50 ETF',
  'GOLDBEES': 'Gold ETF',
  'LIQUIDBEES': 'Liquid ETF'
};

export const portfolioService = {
  // Get user holdings from database
  async getUserHoldings(userId: string): Promise<Holding[]> {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .order('current_value', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user holdings:', error);
      throw error;
    }
  },

  // Get current market prices
  async getCurrentPrices(): Promise<{ [symbol: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('symbol, price')
        .in('symbol', ['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES']);

      if (error) throw error;

      const prices: { [symbol: string]: number } = {};
      data?.forEach(price => {
        prices[price.symbol] = price.price;
      });

      return prices;
    } catch (error) {
      console.error('Error fetching current prices:', error);
      // Return fallback prices if API fails
      return {
        'NIFTYBEES': 285.50,
        'GOLDBEES': 65.25,
        'LIQUIDBEES': 100.05
      };
    }
  },

  // Calculate portfolio summary with current market prices
  async calculatePortfolioSummary(userId: string): Promise<PortfolioSummary> {
    try {
      const [holdings, prices, userSettings] = await Promise.all([
        this.getUserHoldings(userId),
        this.getCurrentPrices(),
        settingsService.getUserSettings(userId)
      ]);

      const portfolio_preset = userSettings?.portfolio_preset || 'balanced';

      // Get target allocation based on user's portfolio preset
      const targetAllocations = this.getTargetAllocations(portfolio_preset);

      let total_value = 0;
      let total_invested = 0;

      const assets: PortfolioAsset[] = holdings.map(holding => {
        const current_price = prices[holding.symbol] || holding.current_price;
        const current_value = holding.units * current_price;
        const total_cost = holding.units * holding.avg_cost;
        const unrealized_pnl = current_value - total_cost;
        const unrealized_pnl_percent = total_cost > 0 ? (unrealized_pnl / total_cost) * 100 : 0;

        total_value += current_value;
        total_invested += total_cost;

        return {
          symbol: holding.symbol,
          name: ASSET_MAPPING[holding.symbol as keyof typeof ASSET_MAPPING] || holding.symbol,
          units: holding.units,
          current_price,
          current_value,
          avg_cost: holding.avg_cost,
          total_cost,
          unrealized_pnl,
          unrealized_pnl_percent,
          allocation_percent: 0, // Will be calculated after total_value is known
          target_percent: targetAllocations[holding.symbol] || 0,
          difference: 0 // Will be calculated after allocation_percent is known
        };
      });

      // Calculate allocation percentages and differences
      assets.forEach(asset => {
        asset.allocation_percent = total_value > 0 ? (asset.current_value / total_value) * 100 : 0;
        asset.difference = asset.allocation_percent - asset.target_percent;
      });

      const total_returns = total_value - total_invested;
      const total_returns_percent = total_invested > 0 ? (total_returns / total_invested) * 100 : 0;

      return {
        total_value,
        total_invested,
        total_returns,
        total_returns_percent,
        assets
      };
    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      throw error;
    }
  },

  // Get target allocations based on portfolio preset
  getTargetAllocations(preset: 'safe' | 'balanced' | 'growth'): { [symbol: string]: number } {
    switch (preset) {
      case 'safe':
        return {
          'GOLDBEES': 70,
          'NIFTYBEES': 30,
          'LIQUIDBEES': 0
        };
      case 'balanced':
        return {
          'GOLDBEES': 50,
          'NIFTYBEES': 50,
          'LIQUIDBEES': 0
        };
      case 'growth':
        return {
          'GOLDBEES': 30,
          'NIFTYBEES': 70,
          'LIQUIDBEES': 0
        };
      default:
        return {
          'GOLDBEES': 50,
          'NIFTYBEES': 50,
          'LIQUIDBEES': 0
        };
    }
  },

  // Generate rebalancing recommendations
  async generateRebalanceRecommendations(userId: string): Promise<RebalanceRecommendation[]> {
    try {
      const portfolio = await this.calculatePortfolioSummary(userId);
      const recommendations: RebalanceRecommendation[] = [];

      portfolio.assets.forEach(asset => {
        const target_value = (portfolio.total_value * asset.target_percent) / 100;
        const difference_value = target_value - asset.current_value;
        const tolerance = 0.05; // 5% tolerance

        let action: 'buy' | 'sell' | 'hold' = 'hold';
        let recommended_units = 0;

        if (Math.abs(asset.difference) > tolerance * 100) {
          if (difference_value > 0) {
            action = 'buy';
            recommended_units = Math.floor(difference_value / asset.current_price);
          } else {
            action = 'sell';
            recommended_units = Math.floor(Math.abs(difference_value) / asset.current_price);
          }
        }

        recommendations.push({
          symbol: asset.symbol,
          name: asset.name,
          current_value: asset.current_value,
          target_value,
          difference_value,
          action,
          recommended_units
        });
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating rebalance recommendations:', error);
      throw error;
    }
  },

  // Execute rebalancing (create orders)
  async executeRebalance(userId: string, recommendations: RebalanceRecommendation[]): Promise<boolean> {
    try {
      const orders = recommendations
        .filter(rec => rec.action !== 'hold' && rec.recommended_units > 0)
        .map(rec => ({
          user_id: userId,
          side: rec.action,
          symbol: rec.symbol,
          quantity: rec.recommended_units,
          amount: rec.recommended_units * rec.current_value / rec.current_value, // This should use actual price
          price: rec.current_value / (rec.current_value / rec.current_value), // Placeholder for actual price calculation
          status: 'pending' as const
        }));

      if (orders.length === 0) {
        return true; // No rebalancing needed
      }

      const { error } = await supabase
        .from('orders')
        .insert(orders);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error executing rebalance:', error);
      throw error;
    }
  },

  // Update holdings with current market prices
  async updateHoldingsWithCurrentPrices(userId: string): Promise<void> {
    try {
      const [holdings, prices] = await Promise.all([
        this.getUserHoldings(userId),
        this.getCurrentPrices()
      ]);

      const updates = holdings.map(holding => {
        const current_price = prices[holding.symbol] || holding.current_price;
        const current_value = holding.units * current_price;

        return {
          id: holding.id,
          current_price,
          current_value,
          last_updated: new Date().toISOString()
        };
      });

      if (updates.length > 0) {
        const { error } = await supabase
          .from('holdings')
          .upsert(updates);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating holdings with current prices:', error);
      throw error;
    }
  }
};
