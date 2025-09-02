// React hook for database operations
// Integrates with your existing usePiggyCore and useAuth hooks

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserProfile,
  createDefaultUserSettings,
  updateUserSettings,
  getCurrentPiggyBalance,
  getUserTransactions,
  getPiggyLedgerHistory,
  getUserHoldings,
  getUserDashboard,
  getRecentActivity,
  getUserActiveGoals,
  type DbUser,
  type UserSettings,
  type Transaction,
  type PiggyLedgerEntry,
  type Holding,
  type DashboardData,
  type Goal,
  DatabaseError
} from '@/lib/database-queries';
import { useSafeAsync } from './use-safe-async';

// ============================================================================
// TYPES
// ============================================================================

interface DatabaseState {
  user: DbUser | null;
  settings: UserSettings | null;
  piggyBalance: number;
  transactions: Transaction[];
  ledgerHistory: PiggyLedgerEntry[];
  holdings: Holding[];
  dashboardData: DashboardData | null;
  recentActivity: Array<{
    type: string;
    amount: number;
    description: string;
    timestamp: string;
    status: string;
  }>;
  activeGoals: Array<Goal & { progress_percentage: number }>;
  loading: boolean;
  error: DatabaseError | null;
}

interface DatabaseActions {
  refreshUserProfile: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  loadTransactions: (limit?: number, offset?: number) => Promise<void>;
  loadLedgerHistory: (limit?: number, offset?: number) => Promise<void>;
  refreshHoldings: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useDatabase = (): [DatabaseState, DatabaseActions] => {
  const { user: authUser, demoMode } = useAuth();
  const { safeAsync } = useSafeAsync();

  const [state, setState] = useState<DatabaseState>({
    user: null,
    settings: null,
    piggyBalance: 0,
    transactions: [],
    ledgerHistory: [],
    holdings: [],
    dashboardData: null,
    recentActivity: [],
    activeGoals: [],
    loading: false,
    error: null
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: DatabaseError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const updateState = useCallback((updates: Partial<DatabaseState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const refreshUserProfile = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const { user, settings } = await safeAsync(() => 
        getUserProfile(authUser.id)
      ) || { user: null, settings: null };

      if (user) {
        updateState({ user, settings });

        // Create default settings if they don't exist
        if (!settings) {
          const newSettings = await safeAsync(() => 
            createDefaultUserSettings(authUser.id)
          );
          if (newSettings) {
            updateState({ settings: newSettings });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError(new DatabaseError('Failed to load user profile'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState, setLoading, setError]);

  const refreshPiggyBalance = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    try {
      const balance = await safeAsync(() => 
        getCurrentPiggyBalance(authUser.id)
      );
      if (balance !== null) {
        updateState({ piggyBalance: balance });
      }
    } catch (error) {
      console.error('Error loading piggy balance:', error);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState]);

  const loadTransactions = useCallback(async (limit = 50, offset = 0) => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const transactions = await safeAsync(() => 
        getUserTransactions(authUser.id, limit, offset)
      );
      if (transactions) {
        updateState({ transactions });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError(new DatabaseError('Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState, setLoading, setError]);

  const loadLedgerHistory = useCallback(async (limit = 50, offset = 0) => {
    if (!authUser?.id || demoMode) return;

    try {
      const ledgerHistory = await safeAsync(() => 
        getPiggyLedgerHistory(authUser.id, limit, offset)
      );
      if (ledgerHistory) {
        updateState({ ledgerHistory });
      }
    } catch (error) {
      console.error('Error loading ledger history:', error);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState]);

  const refreshHoldings = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    try {
      const holdings = await safeAsync(() => 
        getUserHoldings(authUser.id)
      );
      if (holdings) {
        updateState({ holdings });
      }
    } catch (error) {
      console.error('Error loading holdings:', error);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState]);

  const refreshDashboard = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    try {
      const [dashboardData, recentActivity, activeGoals] = await Promise.all([
        safeAsync(() => getUserDashboard(authUser.id)),
        safeAsync(() => getRecentActivity(authUser.id)),
        safeAsync(() => getUserActiveGoals(authUser.id))
      ]);

      updateState({
        dashboardData: dashboardData || null,
        recentActivity: recentActivity || [],
        activeGoals: activeGoals || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState]);

  // ============================================================================
  // MUTATION FUNCTIONS
  // ============================================================================

  const updateSettings = useCallback(async (
    newSettings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const updatedSettings = await safeAsync(() => 
        updateUserSettings(authUser.id, newSettings)
      );
      
      if (updatedSettings) {
        updateState({ settings: updatedSettings });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(new DatabaseError('Failed to update settings'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode, safeAsync, updateState, setLoading, setError]);

  const refreshAll = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.allSettled([
        refreshUserProfile(),
        refreshPiggyBalance(),
        loadTransactions(),
        loadLedgerHistory(),
        refreshHoldings(),
        refreshDashboard()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
      setError(new DatabaseError('Failed to refresh data'));
    } finally {
      setLoading(false);
    }
  }, [
    authUser?.id, 
    demoMode, 
    refreshUserProfile, 
    refreshPiggyBalance, 
    loadTransactions, 
    loadLedgerHistory, 
    refreshHoldings, 
    refreshDashboard,
    setLoading,
    setError
  ]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load initial data when user logs in
  useEffect(() => {
    if (authUser?.id && !demoMode) {
      refreshUserProfile();
      refreshPiggyBalance();
      loadTransactions(20, 0); // Load first 20 transactions
      refreshDashboard();
    }
  }, [authUser?.id, demoMode, refreshUserProfile, refreshPiggyBalance, loadTransactions, refreshDashboard]);

  // Clear data when user logs out
  useEffect(() => {
    if (!authUser?.id) {
      setState({
        user: null,
        settings: null,
        piggyBalance: 0,
        transactions: [],
        ledgerHistory: [],
        holdings: [],
        dashboardData: null,
        recentActivity: [],
        activeGoals: [],
        loading: false,
        error: null
      });
    }
  }, [authUser?.id]);

  // ============================================================================
  // RETURN
  // ============================================================================

  const actions: DatabaseActions = {
    refreshUserProfile,
    updateSettings,
    refreshDashboard,
    loadTransactions,
    loadLedgerHistory,
    refreshHoldings,
    refreshAll
  };

  return [state, actions];
};

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for user profile and settings only
 */
export const useUserProfile = () => {
  const { user: authUser, demoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DatabaseError | null>(null);
  const [profile, setProfile] = useState<{
    user: DbUser | null;
    settings: UserSettings | null;
  }>({
    user: null,
    settings: null
  });

  const refresh = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getUserProfile(authUser.id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof DatabaseError ? err : new DatabaseError('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...profile,
    loading,
    error,
    refresh
  };
};

/**
 * Hook for dashboard data only
 */
export const useDashboard = () => {
  const { user: authUser, demoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DatabaseError | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const refresh = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getUserDashboard(authUser.id);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof DatabaseError ? err : new DatabaseError('Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dashboard,
    loading,
    error,
    refresh
  };
};

/**
 * Hook for portfolio holdings only
 */
export const usePortfolioHoldings = () => {
  const { user: authUser, demoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DatabaseError | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  const refresh = useCallback(async () => {
    if (!authUser?.id || demoMode) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getUserHoldings(authUser.id);
      setHoldings(data);
    } catch (err) {
      setError(err instanceof DatabaseError ? err : new DatabaseError('Failed to load holdings'));
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, demoMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    holdings,
    loading,
    error,
    refresh
  };
};
