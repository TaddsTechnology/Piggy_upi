import { supabase, type Database } from './supabase'
import type { User } from '@supabase/supabase-js'

// Type definitions
type DbUser = Database['public']['Tables']['users']['Row']
type DbUserSettings = Database['public']['Tables']['user_settings']['Row']
type DbTransaction = Database['public']['Tables']['transactions']['Row']
type DbPiggyLedger = Database['public']['Tables']['piggy_ledger']['Row']
type DbOrder = Database['public']['Tables']['orders']['Row']
type DbHolding = Database['public']['Tables']['holdings']['Row']
type DbPrice = Database['public']['Tables']['prices']['Row']

// Auth Service
export class AuthService {
  static async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) throw error

    // Create user record in our users table
    if (data.user) {
      await UserService.createUserProfile(data.user, fullName)
    }

    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// User Service
export class UserService {
  static async createUserProfile(authUser: User, fullName: string) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: fullName,
        kyc_status: 'pending'
      })

    if (error && error.code !== '23505') { // Ignore duplicate key error
      throw error
    }

    // Create default user settings
    await this.createDefaultSettings(authUser.id)
  }

  static async createDefaultSettings(userId: string) {
    const { error } = await supabase
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

    if (error && error.code !== '23505') { // Ignore duplicate key error
      throw error
    }
  }

  static async getUserProfile(userId: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async getUserSettings(userId: string): Promise<DbUserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateUserSettings(userId: string, settings: Partial<DbUserSettings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getDashboardSummary(userId: string) {
    const { data, error } = await supabase
      .from('user_dashboard')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// Transaction Service
export class TransactionService {
  static async createTransaction(transaction: Database['public']['Tables']['transactions']['Insert']) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserTransactions(userId: string, limit = 50): Promise<DbTransaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async updateTransactionStatus(transactionId: string, status: 'pending' | 'completed' | 'failed') {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Simulate UPI transaction (for demo purposes)
  static async simulateTransaction(userId: string, amount: number, merchant: string) {
    const transaction = {
      user_id: userId,
      amount: amount,
      direction: 'debit' as const,
      merchant,
      category: 'Simulated',
      upi_ref: `SIM${Date.now()}`,
      status: 'completed' as const
    }

    return await this.createTransaction(transaction)
  }
}

// Ledger Service
export class LedgerService {
  static async getUserLedger(userId: string, limit = 100): Promise<DbPiggyLedger[]> {
    const { data, error } = await supabase
      .from('piggy_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async getPiggyBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_piggy_balance', { p_user_id: userId })

    if (error) throw error
    return data || 0
  }

  static async createLedgerEntry(entry: Database['public']['Tables']['piggy_ledger']['Insert']) {
    const { data, error } = await supabase
      .from('piggy_ledger')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getWeeklyRoundups(userId: string): Promise<number> {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('piggy_ledger')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'roundup_credit')
      .gte('timestamp', weekStart.toISOString())

    if (error) throw error
    
    return (data || []).reduce((sum, entry) => sum + entry.amount, 0)
  }
}

// Orders Service
export class OrdersService {
  static async createOrder(order: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserOrders(userId: string, limit = 50): Promise<DbOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async updateOrderStatus(orderId: string, status: 'filled' | 'failed' | 'cancelled') {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Simulate investment execution
  static async executeInvestment(userId: string, amount: number, allocations: Array<{symbol: string, weightPct: number}>) {
    const prices = await PriceService.getCurrentPrices()
    const orders: DbOrder[] = []

    for (const allocation of allocations) {
      const allocAmount = Math.floor(amount * allocation.weightPct / 100)
      const price = prices[allocation.symbol]
      
      if (!price || allocAmount < price) continue

      const units = Math.floor((allocAmount / price) * 1000000) / 1000000
      const totalAmount = units * price

      const order = await this.createOrder({
        user_id: userId,
        side: 'buy',
        symbol: allocation.symbol,
        quantity: units,
        amount: totalAmount,
        price: price,
        status: 'filled' // Simulate immediate fill
      })

      orders.push(order)

      // Update holdings
      await HoldingsService.updateHolding(userId, allocation.symbol, units, price)

      // Create ledger entry
      await LedgerService.createLedgerEntry({
        user_id: userId,
        amount: totalAmount,
        type: 'investment_debit',
        reference: `Investment in ${allocation.symbol}`,
        order_id: order.id
      })
    }

    return orders
  }
}

// Holdings Service
export class HoldingsService {
  static async getUserHoldings(userId: string): Promise<DbHolding[]> {
    const { data, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }

  static async updateHolding(userId: string, symbol: string, newUnits: number, newPrice: number) {
    // Get existing holding
    const { data: existing, error: fetchError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single()

    let updatedHolding

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new holding
      const { data, error } = await supabase
        .from('holdings')
        .insert({
          user_id: userId,
          symbol,
          units: newUnits,
          avg_cost: newPrice,
          current_price: newPrice
        })
        .select()
        .single()

      if (error) throw error
      updatedHolding = data
    } else if (existing) {
      // Update existing holding
      const totalUnits = existing.units + newUnits
      const totalCost = (existing.units * existing.avg_cost) + (newUnits * newPrice)
      const newAvgCost = totalCost / totalUnits

      const { data, error } = await supabase
        .from('holdings')
        .update({
          units: totalUnits,
          avg_cost: newAvgCost,
          current_price: newPrice,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .select()
        .single()

      if (error) throw error
      updatedHolding = data
    }

    return updatedHolding
  }

  static async updateHoldingPrices(userId: string) {
    const holdings = await this.getUserHoldings(userId)
    const prices = await PriceService.getCurrentPrices()

    for (const holding of holdings) {
      const currentPrice = prices[holding.symbol]
      if (currentPrice) {
        await supabase
          .from('holdings')
          .update({
            current_price: currentPrice,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('symbol', holding.symbol)
      }
    }
  }
}

// Price Service
export class PriceService {
  static async getCurrentPrices(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('prices')
      .select('symbol, price')
      .order('timestamp', { ascending: false })

    if (error) throw error

    const prices: Record<string, number> = {}
    data?.forEach(price => {
      if (!prices[price.symbol]) {
        prices[price.symbol] = price.price
      }
    })

    return prices
  }

  static async updatePrice(symbol: string, price: number, change = 0, changePercent = 0) {
    const { data, error } = await supabase
      .from('prices')
      .insert({
        symbol,
        price,
        change,
        change_percent: changePercent
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getHistoricalPrices(symbol: string, days = 30): Promise<DbPrice[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .eq('symbol', symbol)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// Webhook Service (for handling real UPI transactions)
export class WebhookService {
  // This would be called by your payment gateway webhook
  static async handleUPIWebhook(payload: {
    user_id: string
    amount: number
    merchant?: string
    upi_ref: string
    status: 'completed' | 'failed'
    timestamp?: string
  }) {
    try {
      // Create transaction record
      const transaction = await TransactionService.createTransaction({
        user_id: payload.user_id,
        amount: payload.amount,
        direction: 'debit',
        merchant: payload.merchant,
        upi_ref: payload.upi_ref,
        status: payload.status,
        timestamp: payload.timestamp || new Date().toISOString()
      })

      // The database trigger will automatically create roundup entries
      console.log('Transaction processed:', transaction.id)

      return { success: true, transaction_id: transaction.id }
    } catch (error) {
      console.error('Webhook processing failed:', error)
      throw error
    }
  }
}

// Helper function to create a complete user account with demo data
export async function setupDemoUser(email: string, password: string, fullName: string) {
  try {
    // Sign up user
    const { user } = await AuthService.signUp(email, password, fullName)
    if (!user) throw new Error('User creation failed')

    // Add some demo transactions
    const demoTransactions = [
      { merchant: 'Zomato', amount: 247 },
      { merchant: 'Uber', amount: 156 },
      { merchant: 'Amazon', amount: 1234 },
      { merchant: 'BigBasket', amount: 567 },
      { merchant: 'Swiggy', amount: 89 }
    ]

    for (const txn of demoTransactions) {
      await TransactionService.simulateTransaction(user.id, txn.amount, txn.merchant)
    }

    // Add some demo holdings
    await HoldingsService.updateHolding(user.id, 'NIFTYBEES', 35.42, 278.50)
    await HoldingsService.updateHolding(user.id, 'GOLDBEES', 76.89, 63.20)

    return user
  } catch (error) {
    console.error('Demo user setup failed:', error)
    throw error
  }
}
