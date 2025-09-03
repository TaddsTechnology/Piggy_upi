// React hook for real user gamification data

import { useState, useEffect, useCallback } from 'react';
import { gamificationService, UserGamificationData } from '@/lib/gamification-service';
import { useAuth } from '@/contexts/AuthContext';

export const useGamification = () => {
  const { user, demoMode } = useAuth();
  const [gamificationData, setGamificationData] = useState<UserGamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await gamificationService.getUserGamificationData(user.id);
      setGamificationData(data);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError('Failed to load gamification data');
      
      // Set default data if there's an error
      if (user?.id) {
        setGamificationData({
          userId: user.id,
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
          achievements: []
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await gamificationService.updateUserProgress(user.id);
      // Refresh data after updating progress
      await fetchGamificationData();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, [user?.id, fetchGamificationData]);

  useEffect(() => {
    if (user?.id) {
      fetchGamificationData();
    }
  }, [fetchGamificationData]);

  // Convert to SmartSipDashboard format for backward compatibility
  const userStats = gamificationData ? {
    totalInvested: gamificationData.totalInvested,
    monthsActive: gamificationData.monthsActive,
    consecutiveWeeks: gamificationData.consecutiveWeeks,
    maxWeeklyInvestment: gamificationData.maxWeeklyInvestment,
    currentPortfolioValue: gamificationData.currentPortfolioValue,
    totalReturns: gamificationData.totalReturns,
    weeklyAmount: gamificationData.weeklyAmount,
    age: gamificationData.age
  } : null;

  return {
    gamificationData,
    userStats,
    isLoading,
    error,
    refresh: fetchGamificationData,
    updateProgress
  };
};

export default useGamification;
