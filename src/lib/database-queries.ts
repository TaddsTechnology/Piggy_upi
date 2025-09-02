// Database query functions with proper TypeScript types
// Use these functions in your React components and services

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DbUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  kyc_status: 'pending' | 'in_progress' | 'verified' | 'rejected';
  onboarding_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  round_to_nearest: number;
  min_roundup: number;
  max_roundup: number;
  portfolio_preset: 'safe' | 'balanced' | 'growth';
  auto_invest_enabled: boolean;
  weekly_target: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  direction: 'debit' | 'credit';
  merchant?: string;
  category?: string;
  upi_ref?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  created_at: string;
}

export interface PiggyLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  type: 'roundup_credit' | 'manual_topup' | 'investment_debit' | 'refund_credit' | 'fee_debit';
  reference?: string;
  transaction_id?: string;
  order_id?: string;
  goal_id?: string;
  balance_after?: number;
  timestamp: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  side: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  amount: number;
  price: number;
  fees?: number;
  tax?: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'failed' | 'cancelled';
  broker_order_id?: string;
  order_type: 'roundup' | 'manual' | 'sip' | 'goal';
  timestamp: string;
  filled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  units: number;
  avg_cost: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface MarketPrice {
  id: string;
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  timestamp: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: 'emergency' | 'vacation' | 'house' | 'car' | 'education' | 'retirement' | 'other';
  priority: number;
  auto_invest_percentage: number;
  is_active: boolean;
  achieved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  user_id: string;
  email: string;
  full_name?: string;
  kyc_status: string;
  onboarding_completed: boolean;
  portfolio_preset: string;
  round_to_nearest: number;
  weekly_target: number;
  auto_invest_enabled: boolean;
  piggy_balance: number;
  portfolio_value: number;
  total_invested: number;
  unrealized_pnl: number;
  weekly_roundups: number;
  active_goals: number;
  unread_notifications: number;
}

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export const createOrUpdateUser = async (
  authUser: User,
  fullName?: string,
  phone?: string
): Promise<DbUser> => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      email: authUser.email!,
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string): Promise<{
  user: DbUser;
  settings: UserSettings | null;
}> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_settings (*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  
  return {
    user: data,
    settings: data.user_settings?.[0] || null
  };
};

export const createDefaultUserSettings = async (userId: string): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      round_to_nearest: 10,
      min_roundup: 1,
      max_roundup: 50,
      portfolio_preset: 'balanced',
      auto_invest_enabled: true,
      weekly_target: 200
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// TRANSACTION FUNCTIONS
// ============================================================================

export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'created_at'>
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserTransactions = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

export const getTransactionsForPeriod = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

// ============================================================================
// PIGGY LEDGER FUNCTIONS
// ============================================================================

export const getCurrentPiggyBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('piggy_ledger')
    .select('balance_after')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.balance_after || 0;
};

export const addRoundupToLedger = async (
  userId: string,
  amount: number,
  reference: string,
  transactionId?: string
): Promise<PiggyLedgerEntry> => {
  const { data, error } = await supabase
    .from('piggy_ledger')
    .insert({
      user_id: userId,
      amount,
      type: 'roundup_credit',
      reference,
      transaction_id: transactionId,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPiggyLedgerHistory = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<PiggyLedgerEntry[]> => {
  const { data, error } = await supabase
    .from('piggy_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

export const getWeeklyRoundupSummary = async (userId: string): Promise<{
  roundup_count: number;
  total_roundup: number;
}> => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('piggy_ledger')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'roundup_credit')
    .gte('timestamp', weekStart.toISOString());

  if (error) throw error;

  const roundup_count = data?.length || 0;
  const total_roundup = data?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

  return { roundup_count, total_roundup };
};

// ============================================================================
// INVESTMENT & PORTFOLIO FUNCTIONS
// ============================================================================

export const createInvestmentOrder = async (
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>
): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...order,
      status: 'pending',
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  userId: string,
  status: Order['status']
): Promise<Order> => {
  const updateData: Partial<Order> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'filled') {
    updateData.filled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserHoldings = async (userId: string): Promise<Holding[]> => {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .order('current_value', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const upsertHolding = async (
  userId: string,
  symbol: string,
  units: number,
  avgCost: number,
  currentPrice: number
): Promise<Holding> => {
  const { data, error } = await supabase
    .from('holdings')
    .upsert({
      user_id: userId,
      symbol,
      units,
      avg_cost: avgCost,
      current_price: currentPrice,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,symbol'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPortfolioSummary = async (userId: string): Promise<{
  total_value: number;
  total_invested: number;
  total_pnl: number;
  pnl_percentage: number;
}> => {
  const { data, error } = await supabase
    .rpc('get_portfolio_summary', { user_uuid: userId });

  if (error) throw error;
  return data || { total_value: 0, total_invested: 0, total_pnl: 0, pnl_percentage: 0 };
};

// ============================================================================
// MARKET DATA FUNCTIONS
// ============================================================================

export const getCurrentPrices = async (symbols: string[]): Promise<MarketPrice[]> => {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .in('symbol', symbols)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateMarketPrice = async (
  symbol: string,
  price: number,
  change: number,
  changePercent: number
): Promise<MarketPrice> => {
  const { data, error } = await supabase
    .from('prices')
    .upsert({
      symbol,
      price,
      change,
      change_percent: changePercent,
      timestamp: new Date().toISOString()
    }, {
      onConflict: 'symbol,created_at'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

export const getUserDashboard = async (userId: string): Promise<DashboardData> => {
  const { data, error } = await supabase
    .from('user_dashboard')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getRecentActivity = async (userId: string): Promise<Array<{
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  status: string;
}>> => {
  const { data, error } = await supabase
    .rpc('get_recent_activity', { user_uuid: userId });

  if (error) throw error;
  return data || [];
};

// ============================================================================
// GOALS FUNCTIONS
// ============================================================================

export const createGoal = async (
  goal: Omit<Goal, 'id' | 'current_amount' | 'is_active' | 'created_at' | 'updated_at' | 'achieved_at'>
): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      ...goal,
      current_amount: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGoalProgress = async (
  goalId: string,
  userId: string,
  currentAmount: number
): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .update({
      current_amount: currentAmount,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserActiveGoals = async (userId: string): Promise<Array<Goal & { progress_percentage: number }>> => {
  const { data, error } = await supabase
    .rpc('get_user_active_goals', { user_uuid: userId });

  if (error) throw error;
  return data || [];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const calculateRoundup = async (
  amount: number,
  roundToNearest: number,
  minRoundup: number,
  maxRoundup: number
): Promise<number> => {
  const { data, error } = await supabase
    .rpc('calculate_roundup', {
      transaction_amount: amount,
      round_to_nearest: roundToNearest,
      min_roundup: minRoundup,
      max_roundup: maxRoundup
    });

  if (error) throw error;
  return data || 0;
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

export type QueryResult<T> = {
  data: T | null;
  error: DatabaseError | null;
  loading: boolean;
};

export type MutationResult<T> = {
  data: T | null;
  error: DatabaseError | null;
  loading: boolean;
  mutate: (variables: unknown) => Promise<void>;
};
