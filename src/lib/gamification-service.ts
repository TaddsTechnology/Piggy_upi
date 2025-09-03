// Real User Gamification Service
// Fetches real user data from database instead of dummy data

import { supabase } from '@/lib/supabase';

export interface UserGamificationData {
  userId: string;
  totalInvested: number;
  monthsActive: number;
  consecutiveWeeks: number;
  maxWeeklyInvestment: number;
  currentPortfolioValue: number;
  totalReturns: number;
  weeklyAmount: number;
  age?: number;
  currentLevel: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  achievements: UserAchievement[];
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: Date;
  reward: string;
  progress?: number;
}

export interface UserLevelInfo {
  level: number;
  title: string;
  nextLevelTarget: number;
  progress: number;
}

class GamificationService {
  private static instance: GamificationService;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  /**
   * Fetch complete user gamification data
   */
  async getUserGamificationData(userId: string): Promise<UserGamificationData | null> {
    try {
      // Get user dashboard data (includes portfolio and level info)
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (dashboardError) {
        console.error('Error fetching dashboard data:', dashboardError);
        // If user doesn't exist in dashboard, initialize with defaults
        if (dashboardError.code === 'PGRST116') {
          return this.getDefaultGamificationData(userId);
        }
        throw dashboardError;
      }

      // Get user achievements
      const achievements = await this.getUserAchievements(userId);

      // Calculate returns percentage
      const totalReturns = dashboardData.unrealized_pnl || 0;
      const totalInvested = dashboardData.total_invested || 0;

      // Get weekly SIP amount from recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('amount')
        .eq('user_id', userId)
        .eq('order_type', 'sip')
        .order('created_at', { ascending: false })
        .limit(4);

      const avgWeeklyAmount = recentOrders && recentOrders.length > 0
        ? recentOrders.reduce((sum, order) => sum + order.amount, 0) / recentOrders.length
        : dashboardData.weekly_sip_amount || 0;

      return {
        userId,
        totalInvested,
        monthsActive: dashboardData.months_active || 0,
        consecutiveWeeks: dashboardData.consecutive_weeks || 0,
        maxWeeklyInvestment: avgWeeklyAmount * 1.5, // Estimate max as 1.5x average
        currentPortfolioValue: dashboardData.portfolio_value || 0,
        totalReturns,
        weeklyAmount: avgWeeklyAmount,
        currentLevel: dashboardData.current_level || 1,
        levelTitle: dashboardData.level_title || 'Investment Rookie',
        currentStreak: dashboardData.current_streak || 0,
        longestStreak: dashboardData.longest_streak || 0,
        achievements
      };
    } catch (error) {
      console.error('Error fetching user gamification data:', error);
      return this.getDefaultGamificationData(userId);
    }
  }

  /**
   * Get user achievements from database
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data: achievements, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        // Initialize achievements if they don't exist
        await this.initializeUserAchievements(userId);
        return this.getDefaultAchievements();
      }

      if (!achievements || achievements.length === 0) {
        // Initialize achievements if they don't exist
        await this.initializeUserAchievements(userId);
        return this.getDefaultAchievements();
      }

      return achievements.map(achievement => ({
        id: achievement.id,
        achievementId: achievement.achievement_id,
        title: achievement.achievement_title,
        description: achievement.achievement_description,
        achieved: achievement.achieved,
        achievedDate: achievement.achieved_date ? new Date(achievement.achieved_date) : undefined,
        reward: achievement.reward_text || '',
        progress: achievement.progress || 0
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return this.getDefaultAchievements();
    }
  }

  /**
   * Initialize achievements for a new user
   */
  async initializeUserAchievements(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('initialize_user_achievements', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error initializing achievements:', error);
      }
    } catch (error) {
      console.error('Error calling initialize_user_achievements:', error);
    }
  }

  /**
   * Update user level and achievements when investments change
   */
  async updateUserProgress(userId: string): Promise<void> {
    try {
      // This will be triggered automatically by database triggers,
      // but we can also manually trigger updates if needed
      
      // Get current user stats
      const userData = await this.getUserGamificationData(userId);
      if (!userData) return;

      // Update progress for achievements that aren't achieved yet
      const achievementUpdates = [];

      // First Step - completed first investment
      if (userData.totalInvested > 0) {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'first_sip',
          achieved: true,
          progress: 100
        });
      }

      // Consistency Champion - 4 consecutive weeks
      if (userData.consecutiveWeeks >= 4) {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'consistent_month',
          achieved: true,
          progress: 100
        });
      } else {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'consistent_month',
          progress: (userData.consecutiveWeeks / 4) * 100
        });
      }

      // Ten Thousand Club
      if (userData.totalInvested >= 10000) {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'ten_k_milestone',
          achieved: true,
          progress: 100
        });
      } else {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'ten_k_milestone',
          progress: (userData.totalInvested / 10000) * 100
        });
      }

      // Annual Investor - 12 months active
      if (userData.monthsActive >= 12) {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'year_long',
          achieved: true,
          progress: 100
        });
      } else {
        achievementUpdates.push({
          user_id: userId,
          achievement_id: 'year_long',
          progress: (userData.monthsActive / 12) * 100
        });
      }

      // Update achievements in batch
      for (const update of achievementUpdates) {
        await supabase
          .from('user_achievements')
          .update({
            achieved: update.achieved || false,
            progress: update.progress,
            achieved_date: update.achieved ? new Date().toISOString() : null
          })
          .eq('user_id', update.user_id)
          .eq('achievement_id', update.achievement_id);
      }

    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  /**
   * Get default gamification data for new users
   */
  private getDefaultGamificationData(userId: string): UserGamificationData {
    return {
      userId,
      totalInvested: 0,
      monthsActive: 0,
      consecutiveWeeks: 0,
      maxWeeklyInvestment: 0,
      currentPortfolioValue: 0,
      totalReturns: 0,
      weeklyAmount: 0,
      currentLevel: 1,
      levelTitle: 'Investment Rookie',
      currentStreak: 0,
      longestStreak: 0,
      achievements: this.getDefaultAchievements()
    };
  }

  /**
   * Get default achievements for new users
   */
  private getDefaultAchievements(): UserAchievement[] {
    return [
      {
        id: 'first_sip',
        achievementId: 'first_sip',
        title: 'First Step',
        description: 'Complete your first automatic investment',
        achieved: false,
        reward: '🎉 Welcome bonus!',
        progress: 0
      },
      {
        id: 'consistent_month',
        achievementId: 'consistent_month',
        title: 'Consistency Champion',
        description: 'Invest for 4 consecutive weeks',
        achieved: false,
        reward: '⭐ Consistency badge',
        progress: 0
      },
      {
        id: 'ten_k_milestone',
        achievementId: 'ten_k_milestone',
        title: 'Ten Thousand Club',
        description: 'Reach ₹10,000 in investments',
        achieved: false,
        reward: '💎 Diamond investor status',
        progress: 0
      },
      {
        id: 'year_long',
        achievementId: 'year_long',
        title: 'Annual Investor',
        description: 'Invest consistently for 12 months',
        achieved: false,
        reward: '🏆 Annual achievement trophy',
        progress: 0
      }
    ];
  }

  /**
   * Calculate user level from total invested amount
   */
  calculateUserLevel(totalInvested: number): UserLevelInfo {
    const levels = [
      { min: 0, title: "Investment Rookie", target: 1000 },
      { min: 1000, title: "Smart Saver", target: 5000 },
      { min: 5000, title: "Wealth Builder", target: 15000 },
      { min: 15000, title: "Portfolio Pro", target: 50000 },
      { min: 50000, title: "Investment Expert", target: 100000 },
      { min: 100000, title: "Wealth Master", target: 250000 },
    ];
    
    const currentLevelIndex = levels.findIndex(level => totalInvested < level.target);
    const levelIndex = currentLevelIndex === -1 ? levels.length - 1 : Math.max(0, currentLevelIndex - 1);
    
    const level = levels[levelIndex];
    const nextLevel = levels[Math.min(levelIndex + 1, levels.length - 1)];
    
    const progress = Math.min(100, (totalInvested / nextLevel.target) * 100);
    
    return {
      level: levelIndex + 1,
      title: level.title,
      nextLevelTarget: nextLevel.target,
      progress: Math.round(progress)
    };
  }
}

export const gamificationService = GamificationService.getInstance();
export default gamificationService;
