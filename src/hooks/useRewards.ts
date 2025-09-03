// React Hooks for Dynamic Rewards System
// Provides real-time rewards, achievements, and leaderboard functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { rewardsService, Achievement, UserRewards, LeaderboardEntry } from '../lib/rewards-service';

// Hook for user rewards data
export const useUserRewards = (userId: string) => {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      const rewards = await rewardsService.getUserRewards(userId);
      setUserRewards(rewards);
      setError(null);
    } catch (err) {
      setError('Failed to load rewards data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserRewards();
    }
  }, [userId, fetchUserRewards]);

  const updateStreak = useCallback(() => {
    try {
      const updatedRewards = rewardsService.updateUserStreak(userId);
      if (updatedRewards) {
        setUserRewards(updatedRewards);
        return updatedRewards;
      }
    } catch (err) {
      setError('Failed to update streak');
    }
    return null;
  }, [userId]);

  const addPoints = useCallback((points: number, source: string) => {
    try {
      const updatedRewards = rewardsService.addPoints(userId, points, source);
      if (updatedRewards) {
        setUserRewards(updatedRewards);
        return updatedRewards;
      }
    } catch (err) {
      setError('Failed to add points');
    }
    return null;
  }, [userId]);

  return {
    userRewards,
    isLoading,
    error,
    updateStreak,
    addPoints,
    refresh: fetchUserRewards
  };
};

// Hook for leaderboard data with real-time updates
export const useLeaderboard = (currentUserId?: string, refreshInterval: number = 30000) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const allTime = await rewardsService.getLeaderboard(currentUserId);
      const weekly = await rewardsService.getWeeklyLeaderboard(currentUserId);
      
      setLeaderboard(allTime);
      setWeeklyLeaderboard(weekly);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchLeaderboard();

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchLeaderboard, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLeaderboard, refreshInterval]);

  return {
    leaderboard,
    weeklyLeaderboard,
    isLoading,
    lastUpdated,
    refresh: fetchLeaderboard
  };
};

// Hook for achievements tracking
export const useAchievements = (userId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const allAchievements = rewardsService.getAchievements();
      const userRewards = await rewardsService.getUserRewards(userId);
      
      setAchievements(allAchievements);
      setUserAchievements(userRewards?.achievements || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId, fetchAchievements]);

  const checkNewAchievements = useCallback(async () => {
    const userRewards = await rewardsService.getUserRewards(userId);
    if (userRewards) {
      const earnedAchievements = userRewards.achievements.filter(a => a.earned);
      const previousCount = userAchievements.filter(a => a.earned).length;
      const currentCount = earnedAchievements.length;
      
      if (currentCount > previousCount) {
        const newlyEarned = earnedAchievements.slice(previousCount);
        setNewAchievements(newlyEarned);
        setUserAchievements(userRewards.achievements);
      }
    }
  }, [userId, userAchievements]);

  const dismissNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    achievements,
    userAchievements,
    newAchievements,
    isLoading,
    checkNewAchievements,
    dismissNewAchievements,
    refresh: fetchAchievements
  };
};

// Hook for simulating activities and earning rewards
export const useActivitySimulator = (userId: string) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastActivity, setLastActivity] = useState<{
    type: string;
    pointsEarned: number;
    newAchievements: Achievement[];
    newLevel?: number;
  } | null>(null);

  const simulateActivity = useCallback(async (activityType: 'investment' | 'roundup' | 'streak') => {
    setIsSimulating(true);
    
    try {
      // Add some delay to simulate real activity
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = rewardsService.simulateActivity(userId, activityType);
      setLastActivity({
        type: activityType,
        ...result
      });
      
      return result;
    } catch (err) {
      console.error('Failed to simulate activity:', err);
    } finally {
      setIsSimulating(false);
    }
    
    return null;
  }, [userId]);

  const simulateInvestment = useCallback(() => simulateActivity('investment'), [simulateActivity]);
  const simulateRoundup = useCallback(() => simulateActivity('roundup'), [simulateActivity]);
  const simulateStreakActivity = useCallback(() => simulateActivity('streak'), [simulateActivity]);

  return {
    isSimulating,
    lastActivity,
    simulateInvestment,
    simulateRoundup,
    simulateStreakActivity,
    simulateActivity
  };
};

// Hook for points breakdown and analytics
export const usePointsAnalytics = (userId: string) => {
  const [pointsBreakdown, setPointsBreakdown] = useState({
    investments: 0,
    streaks: 0,
    achievements: 0,
    roundups: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPointsBreakdown = useCallback(() => {
    try {
      const breakdown = rewardsService.getPointsBreakdown(userId);
      setPointsBreakdown(breakdown);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch points breakdown:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPointsBreakdown();
    }
  }, [userId, fetchPointsBreakdown]);

  return {
    pointsBreakdown,
    isLoading,
    refresh: fetchPointsBreakdown
  };
};

// Hook for streak management with visual feedback
export const useStreakManager = (userId: string) => {
  const [streakData, setStreakData] = useState<{
    current: number;
    longest: number;
    history: Date[];
    nextMilestone: number;
    progress: number;
  }>({
    current: 0,
    longest: 0,
    history: [],
    nextMilestone: 7,
    progress: 0
  });
  const [streakAnimation, setStreakAnimation] = useState(false);

  const updateStreakData = useCallback(() => {
    const userRewards = rewardsService.getUserRewards(userId);
    if (userRewards) {
      const current = userRewards.currentStreak;
      const nextMilestone = current < 7 ? 7 : current < 30 ? 30 : current < 100 ? 100 : current + 50;
      const progress = (current / nextMilestone) * 100;

      setStreakData({
        current,
        longest: userRewards.longestStreak,
        history: userRewards.streakHistory,
        nextMilestone,
        progress
      });
    }
  }, [userId]);

  const updateStreak = useCallback(() => {
    const oldData = { ...streakData };
    const updatedRewards = rewardsService.updateUserStreak(userId);
    
    if (updatedRewards) {
      updateStreakData();
      
      // Trigger animation if streak increased
      if (updatedRewards.currentStreak > oldData.current) {
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 2000);
      }
      
      return updatedRewards;
    }
    return null;
  }, [userId, streakData, updateStreakData]);

  useEffect(() => {
    updateStreakData();
  }, [updateStreakData]);

  return {
    streakData,
    streakAnimation,
    updateStreak,
    refresh: updateStreakData
  };
};

// Hook for real-time notifications about rewards events
export const useRewardsNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'achievement' | 'points' | 'level_up' | 'streak';
    message: string;
    data?: any;
    timestamp: Date;
  }[]>([]);

  const addNotification = useCallback((type: string, message: string, data?: any) => {
    const notification = {
      id: Date.now().toString(),
      type: type as any,
      message,
      data,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  };
};

export default {
  useUserRewards,
  useLeaderboard,
  useAchievements,
  useActivitySimulator,
  usePointsAnalytics,
  useStreakManager,
  useRewardsNotifications
};
