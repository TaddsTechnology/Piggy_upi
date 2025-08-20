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

// Advanced Analytics Service
export class AnalyticsService {
  static async getPortfolioPerformance(userId: string, days = 30) {
    const holdings = await HoldingsService.getUserHoldings(userId)
    const historicalData = await Promise.all(
      holdings.map(h => PriceService.getHistoricalPrices(h.symbol, days))
    )

    return {
      currentValue: holdings.reduce((sum, h) => sum + (h.units * h.current_price), 0),
      totalInvested: holdings.reduce((sum, h) => sum + (h.units * h.avg_cost), 0),
      historicalPerformance: historicalData,
      assetAllocation: holdings.map(h => ({
        symbol: h.symbol,
        percentage: (h.units * h.current_price) / holdings.reduce((sum, holding) => sum + (holding.units * holding.current_price), 0) * 100
      }))
    }
  }

  static async getSpendingAnalytics(userId: string, months = 6) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, category, merchant, timestamp')
      .eq('user_id', userId)
      .eq('direction', 'debit')
      .gte('timestamp', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error

    const transactions = data || []
    const categorySpending = transactions.reduce((acc, txn) => {
      const category = txn.category || 'Other'
      acc[category] = (acc[category] || 0) + txn.amount
      return acc
    }, {} as Record<string, number>)

    const merchantSpending = transactions.reduce((acc, txn) => {
      const merchant = txn.merchant || 'Unknown'
      acc[merchant] = (acc[merchant] || 0) + txn.amount
      return acc
    }, {} as Record<string, number>)

    return {
      totalSpent: transactions.reduce((sum, txn) => sum + txn.amount, 0),
      categoryBreakdown: categorySpending,
      topMerchants: Object.entries(merchantSpending)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      averageTransactionAmount: transactions.length > 0 
        ? transactions.reduce((sum, txn) => sum + txn.amount, 0) / transactions.length 
        : 0,
      monthlyTrend: this.calculateMonthlyTrend(transactions)
    }
  }

  private static calculateMonthlyTrend(transactions: any[]) {
    const monthlyData = transactions.reduce((acc, txn) => {
      const month = new Date(txn.timestamp).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + txn.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }))
  }
}

// Notification Service
export class NotificationService {
  static async createNotification(userId: string, type: string, title: string, message: string, metadata?: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        read: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
  }

  // Send investment milestone notifications
  static async checkAndSendMilestoneNotifications(userId: string) {
    const holdings = await HoldingsService.getUserHoldings(userId)
    const totalValue = holdings.reduce((sum, h) => sum + (h.units * h.current_price), 0)

    const milestones = [1000, 5000, 10000, 25000, 50000, 100000]
    
    for (const milestone of milestones) {
      if (totalValue >= milestone) {
        // Check if we've already sent this notification
        const existing = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'milestone')
          .eq('metadata->milestone', milestone)
          .single()

        if (!existing.data) {
          await this.createNotification(
            userId,
            'milestone',
            `🎉 Investment Milestone Reached!`,
            `Congratulations! Your portfolio has reached ₹${milestone.toLocaleString()}`,
            { milestone, totalValue }
          )
        }
      }
    }
  }
}

// Goal Management Service
export class GoalService {
  static async createGoal(userId: string, goal: {
    name: string
    targetAmount: number
    targetDate: string
    description?: string
    category?: string
  }) {
    const { data, error } = await supabase
      .from('investment_goals')
      .insert({
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        target_date: goal.targetDate,
        description: goal.description,
        category: goal.category,
        current_amount: 0,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserGoals(userId: string) {
    const { data, error } = await supabase
      .from('investment_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('target_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async updateGoalProgress(userId: string) {
    const goals = await this.getUserGoals(userId)
    const holdings = await HoldingsService.getUserHoldings(userId)
    const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.units * h.current_price), 0)

    for (const goal of goals) {
      // Simple allocation: distribute portfolio value proportionally
      const progressAmount = totalPortfolioValue * (goal.target_amount / goals.reduce((sum, g) => sum + g.target_amount, 0))
      
      await supabase
        .from('investment_goals')
        .update({ current_amount: Math.min(progressAmount, goal.target_amount) })
        .eq('id', goal.id)

      // Check if goal is completed
      if (progressAmount >= goal.target_amount && goal.status === 'active') {
        await supabase
          .from('investment_goals')
          .update({ status: 'completed' })
          .eq('id', goal.id)

        await NotificationService.createNotification(
          userId,
          'goal_completed',
          '🎯 Goal Achieved!',
          `Congratulations! You've reached your goal: ${goal.name}`,
          { goalId: goal.id, goalName: goal.name }
        )
      }
    }
  }
}

// Payment Gateway Integration (Mock)
export class PaymentGatewayService {
  // Mock Razorpay integration
  static async createPaymentOrder(userId: string, amount: number, purpose: string) {
    // In production, this would call Razorpay API
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: orderId,
      amount: amount * 100, // Razorpay uses paisa
      currency: 'INR',
      status: 'created',
      key: process.env.VITE_RAZORPAY_KEY_ID,
      userId,
      purpose
    }
  }

  static async verifyPayment(paymentId: string, orderId: string, signature: string) {
    // In production, verify signature with Razorpay webhook
    console.log('Verifying payment:', { paymentId, orderId, signature })
    
    // Mock verification - always success for demo
    return {
      verified: true,
      paymentId,
      orderId
    }
  }
}

// KYC Service (Mock)
export class KYCService {
  static async submitKYCDocuments(userId: string, documents: {
    panCard?: File
    aadhaarCard?: File
    bankStatement?: File
    selfie?: File
  }) {
    // In production, upload to secure storage and submit to KYC provider
    const kycSubmission = {
      id: `kyc_${Date.now()}`,
      user_id: userId,
      status: 'submitted',
      documents: Object.keys(documents),
      submitted_at: new Date().toISOString()
    }

    // Update user KYC status
    await supabase
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', userId)

    // Mock verification after 5 seconds (for demo)
    setTimeout(async () => {
      await supabase
        .from('users')
        .update({ kyc_status: 'verified' })
        .eq('id', userId)

      await NotificationService.createNotification(
        userId,
        'kyc_approved',
        '✅ KYC Verification Complete',
        'Your identity has been verified successfully. You can now invest without limits!'
      )
    }, 5000)

    return kycSubmission
  }

  static async checkKYCStatus(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('kyc_status')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data.kyc_status
  }
}

// Market Data Integration (Enhanced)
export class MarketDataService {
  static async fetchLiveETFPrices() {
    // In production, integrate with NSE/BSE API or financial data provider
    const symbols = ['NIFTYBEES', 'GOLDBEES', 'LIQUIDBEES', 'BANKBEES']
    const mockPrices: Record<string, any> = {}

    for (const symbol of symbols) {
      // Simulate real market data
      const basePrice = {
        'NIFTYBEES': 285.50,
        'GOLDBEES': 65.25,
        'LIQUIDBEES': 100.05,
        'BANKBEES': 512.30
      }[symbol] || 100

      const variation = (Math.random() - 0.5) * 0.04 // ±2% variation
      const currentPrice = basePrice * (1 + variation)
      const change = currentPrice - basePrice
      const changePercent = (change / basePrice) * 100

      mockPrices[symbol] = {
        symbol,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        timestamp: new Date().toISOString()
      }

      // Update in database
      await PriceService.updatePrice(
        symbol,
        mockPrices[symbol].price,
        mockPrices[symbol].change,
        mockPrices[symbol].changePercent
      )
    }

    return mockPrices
  }

  static async getMarketStatus() {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour * 100 + minute
    
    // Indian market hours: 9:15 AM - 3:30 PM
    const isMarketOpen = currentTime >= 915 && currentTime <= 1530
    
    return {
      isOpen: isMarketOpen,
      nextOpen: isMarketOpen ? null : '9:15 AM tomorrow',
      nextClose: isMarketOpen ? '3:30 PM today' : null,
      timezone: 'IST',
      lastUpdated: now.toISOString()
    }
  }
}

// Comprehensive Demo Data Setup
export async function setupDemoUser(email: string, password: string, fullName: string) {
  try {
    // Sign up user
    const { user } = await AuthService.signUp(email, password, fullName)
    if (!user) throw new Error('User creation failed')

    // Add realistic demo transactions (last 30 days)
    const demoTransactions = [
      { merchant: 'Zomato', amount: 247, category: 'Food & Dining', days: 1 },
      { merchant: 'Uber', amount: 156, category: 'Transportation', days: 2 },
      { merchant: 'Amazon', amount: 1234, category: 'Shopping', days: 3 },
      { merchant: 'BigBasket', amount: 567, category: 'Grocery', days: 4 },
      { merchant: 'Swiggy', amount: 89, category: 'Food & Dining', days: 5 },
      { merchant: 'Netflix', amount: 199, category: 'Entertainment', days: 10 },
      { merchant: 'Flipkart', amount: 799, category: 'Shopping', days: 12 },
      { merchant: 'BookMyShow', amount: 350, category: 'Entertainment', days: 15 },
      { merchant: 'Ola', amount: 120, category: 'Transportation', days: 18 },
      { merchant: 'Starbucks', amount: 285, category: 'Food & Dining', days: 20 }
    ]

    for (const txn of demoTransactions) {
      const txnDate = new Date(Date.now() - txn.days * 24 * 60 * 60 * 1000)
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: txn.amount,
        direction: 'debit',
        merchant: txn.merchant,
        category: txn.category,
        upi_ref: `UPI${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
        status: 'completed',
        timestamp: txnDate.toISOString()
      })
    }

    // Add demo holdings with realistic performance
    await HoldingsService.updateHolding(user.id, 'NIFTYBEES', 35.42, 278.50)
    await HoldingsService.updateHolding(user.id, 'GOLDBEES', 76.89, 63.20)
    await HoldingsService.updateHolding(user.id, 'LIQUIDBEES', 12.45, 99.80)

    // Create demo investment goals
    await GoalService.createGoal(user.id, {
      name: 'Emergency Fund',
      targetAmount: 50000,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Build an emergency fund covering 6 months expenses',
      category: 'Safety'
    })

    await GoalService.createGoal(user.id, {
      name: 'Vacation Trip',
      targetAmount: 25000,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Save for a trip to Goa',
      category: 'Lifestyle'
    })

    // Send welcome notification
    await NotificationService.createNotification(
      user.id,
      'welcome',
      '🎉 Welcome to UPI Piggy!',
      'Start saving automatically with every UPI transaction. Your spare change is now working for you!'
    )

    return user
  } catch (error) {
    console.error('Demo user setup failed:', error)
    throw error
  }
}

// Real-time data sync service
export class RealtimeService {
  private static subscriptions: any[] = []

  static subscribeToUserData(userId: string, callback: (table: string, payload: any) => void) {
    const tables = ['transactions', 'piggy_ledger', 'holdings', 'orders', 'notifications']
    
    tables.forEach(table => {
      const subscription = supabase
        .channel(`${table}_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          callback(table, payload)
        })
        .subscribe()

      this.subscriptions.push(subscription)
    })
  }

  static unsubscribeAll() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.subscriptions = []
  }
}
