// Dynamic Rewards Service
// Manages points, achievements, streaks, and leaderboard functionality

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'investment' | 'saving' | 'streak' | 'milestone' | 'social';
  criteria: {
    type: 'amount' | 'count' | 'streak' | 'percentage' | 'custom';
    target: number;
    field?: string;
  };
  rewards: {
    points: number;
    badge?: string;
    unlockFeature?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
}

export interface UserRewards {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  achievements: Achievement[];
  badges: string[];
  streakHistory: Date[];
  lastActivity: Date;
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  totalPoints: number;
  currentStreak: number;
  totalSaved: number;
  level: number;
  rank?: number;
  badges: string[];
}

class RewardsService {
  private static instance: RewardsService;
  private userRewards: Map<string, UserRewards> = new Map();
  private achievements: Achievement[] = [];

  private constructor() {
    this.initializeAchievements();
    this.loadMockData();
  }

  static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_investment',
        name: 'First Step',
        description: 'Complete your first round-up investment',
        icon: '🎯',
        category: 'investment',
        criteria: { type: 'count', target: 1, field: 'investments' },
        rewards: { points: 100, badge: 'investor_badge' },
        rarity: 'common',
        earned: false
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Save for 7 consecutive days',
        icon: '🔥',
        category: 'streak',
        criteria: { type: 'streak', target: 7 },
        rewards: { points: 250, badge: 'streak_badge' },
        rarity: 'rare',
        earned: false
      },
      {
        id: 'gold_digger',
        name: 'Gold Digger',
        description: 'Invest ₹5,000 in Gold ETF',
        icon: '👑',
        category: 'investment',
        criteria: { type: 'amount', target: 5000, field: 'goldInvestment' },
        rewards: { points: 500, badge: 'gold_badge' },
        rarity: 'epic',
        earned: false
      },
      {
        id: 'milestone_master',
        name: 'Milestone Master',
        description: 'Reach ₹15,000 total savings',
        icon: '🏆',
        category: 'milestone',
        criteria: { type: 'amount', target: 15000, field: 'totalSavings' },
        rewards: { points: 1000, badge: 'milestone_badge' },
        rarity: 'legendary',
        earned: false
      },
      {
        id: 'consistent_saver',
        name: 'Consistent Saver',
        description: 'Make 30 round-up transactions',
        icon: '💎',
        category: 'saving',
        criteria: { type: 'count', target: 30, field: 'roundUpCount' },
        rewards: { points: 750, badge: 'saver_badge' },
        rarity: 'epic',
        earned: false
      },
      {
        id: 'portfolio_builder',
        name: 'Portfolio Builder',
        description: 'Diversify across 3 asset classes',
        icon: '📊',
        category: 'investment',
        criteria: { type: 'count', target: 3, field: 'assetClasses' },
        rewards: { points: 600, badge: 'diversification_badge' },
        rarity: 'rare',
        earned: false
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Maintain a 30-day saving streak',
        icon: '⚡',
        category: 'streak',
        criteria: { type: 'streak', target: 30 },
        rewards: { points: 1500, badge: 'legend_badge', unlockFeature: 'premium_insights' },
        rarity: 'legendary',
        earned: false
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Make first investment before 10 AM',
        icon: '🌅',
        category: 'custom',
        criteria: { type: 'custom', target: 1 },
        rewards: { points: 150, badge: 'early_bird_badge' },
        rarity: 'common',
        earned: false
      }
    ];
  }

  private loadMockData(): void {
    // Create mock user data
    const mockUsers = [
      {
        userId: 'user_1',
        name: 'Priya S.',
        avatar: 'PS',
        totalSaved: 25480,
        streak: 45,
        level: 8
      },
      {
        userId: 'user_2', 
        name: 'Rahul K.',
        avatar: 'RK',
        totalSaved: 23650,
        streak: 38,
        level: 7
      },
      {
        userId: 'current_user',
        name: 'You',
        avatar: 'YU',
        totalSaved: 12485,
        streak: 22,
        level: 4
      },
      {
        userId: 'user_3',
        name: 'Anjali M.',
        avatar: 'AM',
        totalSaved: 11200,
        streak: 19,
        level: 3
      },
      {
        userId: 'user_4',
        name: 'Vikram T.',
        avatar: 'VT',
        totalSaved: 9850,
        streak: 15,
        level: 3
      }
    ];

    // Initialize user rewards data
    mockUsers.forEach(user => {
      const points = this.calculatePointsFromSavings(user.totalSaved, user.streak);
      const userReward: UserRewards = {
        userId: user.userId,
        totalPoints: points,
        currentStreak: user.streak,
        longestStreak: user.streak + Math.floor(Math.random() * 10),
        level: user.level,
        achievements: this.generateUserAchievements(user.totalSaved, user.streak),
        badges: this.generateUserBadges(user.totalSaved, user.streak),
        streakHistory: this.generateStreakHistory(user.streak),
        lastActivity: new Date(),
        weeklyPoints: Math.floor(points * 0.3),
        monthlyPoints: points
      };
      
      this.userRewards.set(user.userId, userReward);
    });
  }

  private calculatePointsFromSavings(totalSaved: number, streak: number): number {
    const basePoints = Math.floor(totalSaved / 100); // 1 point per ₹100 saved
    const streakMultiplier = 1 + (streak * 0.05); // 5% bonus per day of streak
    return Math.floor(basePoints * streakMultiplier);
  }

  private generateUserAchievements(totalSaved: number, streak: number): Achievement[] {
    return this.achievements.map(achievement => {
      let earned = false;
      let progress = 0;

      switch (achievement.criteria.type) {
        case 'amount':
          if (achievement.criteria.field === 'totalSavings') {
            progress = Math.min(100, (totalSaved / achievement.criteria.target) * 100);
            earned = totalSaved >= achievement.criteria.target;
          } else if (achievement.criteria.field === 'goldInvestment') {
            const goldAmount = Math.floor(totalSaved * 0.2); // Assume 20% in gold
            progress = Math.min(100, (goldAmount / achievement.criteria.target) * 100);
            earned = goldAmount >= achievement.criteria.target;
          }
          break;
        case 'streak':
          progress = Math.min(100, (streak / achievement.criteria.target) * 100);
          earned = streak >= achievement.criteria.target;
          break;
        case 'count':
          if (achievement.criteria.field === 'investments') {
            const investmentCount = Math.floor(totalSaved / 1000); // Mock investment count
            progress = Math.min(100, (investmentCount / achievement.criteria.target) * 100);
            earned = investmentCount >= achievement.criteria.target;
          } else if (achievement.criteria.field === 'roundUpCount') {
            const roundUpCount = Math.floor(totalSaved / 50); // Mock round-up count
            progress = Math.min(100, (roundUpCount / achievement.criteria.target) * 100);
            earned = roundUpCount >= achievement.criteria.target;
          }
          break;
        case 'custom':
          earned = Math.random() > 0.5; // Random for demo
          progress = earned ? 100 : Math.random() * 80;
          break;
      }

      return {
        ...achievement,
        earned,
        progress,
        earnedDate: earned ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined
      };
    });
  }

  private generateUserBadges(totalSaved: number, streak: number): string[] {
    const badges = [];
    if (totalSaved >= 1000) badges.push('investor_badge');
    if (streak >= 7) badges.push('streak_badge');
    if (totalSaved >= 5000) badges.push('saver_badge');
    if (totalSaved >= 15000) badges.push('milestone_badge');
    return badges;
  }

  private generateStreakHistory(currentStreak: number): Date[] {
    const history = [];
    const now = new Date();
    for (let i = 0; i < currentStreak; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      history.unshift(date);
    }
    return history;
  }

  // Public methods
  getUserRewards(userId: string): UserRewards | null {
    return this.userRewards.get(userId) || null;
  }

  updateUserStreak(userId: string): UserRewards | null {
    const userReward = this.userRewards.get(userId);
    if (!userReward) return null;

    const now = new Date();
    const lastActivity = userReward.lastActivity;
    const timeDiff = now.getTime() - lastActivity.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 1) {
      // Continue streak
      userReward.currentStreak += 1;
      userReward.streakHistory.push(now);
      userReward.longestStreak = Math.max(userReward.longestStreak, userReward.currentStreak);
    } else if (daysDiff > 1) {
      // Break streak
      userReward.currentStreak = 1;
      userReward.streakHistory = [now];
    }

    userReward.lastActivity = now;
    this.userRewards.set(userId, userReward);
    
    // Check for new achievements
    this.checkAchievements(userId);
    
    return userReward;
  }

  addPoints(userId: string, points: number, source: string): UserRewards | null {
    const userReward = this.userRewards.get(userId);
    if (!userReward) return null;

    userReward.totalPoints += points;
    userReward.weeklyPoints += points;
    userReward.monthlyPoints += points;
    userReward.level = this.calculateLevel(userReward.totalPoints);

    this.userRewards.set(userId, userReward);
    this.checkAchievements(userId);

    return userReward;
  }

  private calculateLevel(totalPoints: number): number {
    // Level up every 1000 points
    return Math.floor(totalPoints / 1000) + 1;
  }

  private checkAchievements(userId: string): Achievement[] {
    const userReward = this.userRewards.get(userId);
    if (!userReward) return [];

    const newAchievements: Achievement[] = [];

    userReward.achievements.forEach(achievement => {
      if (!achievement.earned && achievement.progress === 100) {
        achievement.earned = true;
        achievement.earnedDate = new Date();
        userReward.totalPoints += achievement.rewards.points;
        
        if (achievement.rewards.badge) {
          userReward.badges.push(achievement.rewards.badge);
        }
        
        newAchievements.push(achievement);
      }
    });

    if (newAchievements.length > 0) {
      this.userRewards.set(userId, userReward);
    }

    return newAchievements;
  }

  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    // Mock names for demo
    const mockNames = [
      { userId: 'user_1', name: 'Priya S.', avatar: 'PS' },
      { userId: 'user_2', name: 'Rahul K.', avatar: 'RK' },
      { userId: 'current_user', name: 'You', avatar: 'YU' },
      { userId: 'user_3', name: 'Anjali M.', avatar: 'AM' },
      { userId: 'user_4', name: 'Vikram T.', avatar: 'VT' }
    ];

    this.userRewards.forEach((reward, userId) => {
      const userInfo = mockNames.find(u => u.userId === userId);
      if (userInfo) {
        entries.push({
          userId,
          name: userInfo.name,
          avatar: userInfo.avatar,
          totalPoints: reward.totalPoints,
          currentStreak: reward.currentStreak,
          totalSaved: this.calculateTotalSaved(reward.totalPoints, reward.currentStreak),
          level: reward.level,
          badges: reward.badges
        });
      }
    });

    // Sort by total points and add ranks
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  private calculateTotalSaved(totalPoints: number, streak: number): number {
    // Reverse calculation from points to savings
    const streakMultiplier = 1 + (streak * 0.05);
    return Math.floor((totalPoints / streakMultiplier) * 100);
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  simulateActivity(userId: string, activityType: 'investment' | 'roundup' | 'streak'): {
    pointsEarned: number;
    newAchievements: Achievement[];
    newLevel?: number;
  } {
    const userReward = this.userRewards.get(userId);
    if (!userReward) return { pointsEarned: 0, newAchievements: [] };

    let pointsEarned = 0;
    const oldLevel = userReward.level;

    switch (activityType) {
      case 'investment':
        pointsEarned = Math.floor(Math.random() * 100) + 50; // 50-150 points
        break;
      case 'roundup':
        pointsEarned = Math.floor(Math.random() * 20) + 5; // 5-25 points
        break;
      case 'streak':
        this.updateUserStreak(userId);
        pointsEarned = userReward.currentStreak * 10; // 10 points per streak day
        break;
    }

    this.addPoints(userId, pointsEarned, activityType);
    const newAchievements = this.checkAchievements(userId);
    const newLevel = userReward.level > oldLevel ? userReward.level : undefined;

    return {
      pointsEarned,
      newAchievements,
      newLevel
    };
  }

  getWeeklyLeaderboard(): LeaderboardEntry[] {
    return this.getLeaderboard().map(entry => ({
      ...entry,
      totalPoints: Math.floor(entry.totalPoints * 0.3) // Show weekly points
    }));
  }

  getPointsBreakdown(userId: string): {
    investments: number;
    streaks: number;
    achievements: number;
    roundups: number;
  } {
    const userReward = this.userRewards.get(userId);
    if (!userReward) return { investments: 0, streaks: 0, achievements: 0, roundups: 0 };

    const achievementPoints = userReward.achievements
      .filter(a => a.earned)
      .reduce((sum, a) => sum + a.rewards.points, 0);

    return {
      investments: Math.floor(userReward.totalPoints * 0.4),
      streaks: Math.floor(userReward.totalPoints * 0.3),
      achievements: achievementPoints,
      roundups: Math.floor(userReward.totalPoints * 0.3)
    };
  }
}

export const rewardsService = RewardsService.getInstance();
export default rewardsService;
