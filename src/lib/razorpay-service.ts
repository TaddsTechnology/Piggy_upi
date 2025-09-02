import { toast } from '@/hooks/use-toast';
import UserService from './user-service';
import TransactionService from './transaction-service';
import KYCService from './kyc-service';

// Types
export interface RazorpayTransaction {
  id: string;
  originalAmount: number;
  roundedAmount: number;
  roundOffAmount: number;
  paymentId?: string;
  orderId: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  userId: string;
  timestamp: Date;
  portfolioId?: string;
  description: string;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

export interface AutopaySetup {
  tokenId: string;
  customerId: string;
  maxAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  nextPaymentDate: Date;
}

export interface RoundOffSettings {
  enabled: boolean;
  roundUpThreshold: number; // e.g., 0.5 means amounts ending .50 and above round up
  maxRoundOff: number; // Maximum amount to round off (e.g., ₹10)
  investRoundOff: boolean; // Whether to invest the round-off amount
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private transactions: RazorpayTransaction[] = [];
  private roundOffSettings: RoundOffSettings = {
    enabled: true,
    roundUpThreshold: 0.5,
    maxRoundOff: 10,
    investRoundOff: true
  };

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    this.keySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || '';
    
    if (!this.keyId) {
      console.warn('Razorpay Key ID not found in environment variables');
    }

    // Load saved transactions and settings
    this.loadTransactions();
    this.loadRoundOffSettings();
  }

  // Round-off calculation
  calculateRoundOff(amount: number): { originalAmount: number; roundedAmount: number; roundOffAmount: number } {
    const originalAmount = amount;
    
    if (!this.roundOffSettings.enabled) {
      return {
        originalAmount,
        roundedAmount: originalAmount,
        roundOffAmount: 0
      };
    }

    const decimalPart = amount - Math.floor(amount);
    let roundOffAmount = 0;
    let roundedAmount = originalAmount;

    if (decimalPart >= this.roundOffSettings.roundUpThreshold) {
      roundOffAmount = Math.ceil(originalAmount) - originalAmount;
      roundedAmount = Math.ceil(originalAmount);
    } else if (decimalPart > 0) {
      // Round down and collect the spare change
      roundOffAmount = decimalPart;
      roundedAmount = Math.floor(originalAmount);
    }

    // Cap the round-off amount
    if (roundOffAmount > this.roundOffSettings.maxRoundOff) {
      roundOffAmount = this.roundOffSettings.maxRoundOff;
      roundedAmount = originalAmount + roundOffAmount;
    }

    return {
      originalAmount,
      roundedAmount: Math.round(roundedAmount * 100) / 100,
      roundOffAmount: Math.round(roundOffAmount * 100) / 100
    };
  }

  // Create Razorpay order with dynamic user data
  async createOrder(
    amount: number, 
    description: string = 'Investment via UPI Piggy',
    portfolioId?: string
  ): Promise<any> {
    const { originalAmount, roundedAmount, roundOffAmount } = this.calculateRoundOff(amount);
    const userId = UserService.getCurrentUserId();
    
    // Check KYC requirements before creating order
    try {
      const kycCheck = await KYCService.isKYCRequiredForAmount(roundedAmount);
      if (kycCheck.required) {
        throw new Error(`KYC_REQUIRED: ${kycCheck.reason}`);
      }
    } catch (kycError) {
      if (kycError instanceof Error && kycError.message.startsWith('KYC_REQUIRED:')) {
        throw kycError; // Re-throw KYC errors
      }
      // Log other KYC service errors but don't block payment
      console.warn('KYC service error:', kycError);
    }
    
    try {
      // Create order via backend API (replace mockCreateOrder with real API)
      const order = await this.createRazorpayOrder(roundedAmount, description);
      
      // Create transaction record in database
      const dbTransaction = await TransactionService.createTransaction({
        userId,
        razorpayOrderId: order.id,
        originalAmount,
        roundedAmount,
        roundOffAmount,
        description: `${description} ${roundOffAmount > 0 ? `(+₹${roundOffAmount} round-off)` : ''}`,
        portfolioId
      });

      // Create local transaction object for compatibility
      const transaction: RazorpayTransaction = {
        id: dbTransaction.id,
        originalAmount,
        roundedAmount,
        roundOffAmount,
        orderId: order.id,
        status: 'created',
        userId,
        timestamp: new Date(dbTransaction.createdAt),
        portfolioId,
        description: dbTransaction.description
      };

      // Add to local cache for immediate access
      this.transactions.push(transaction);

      return {
        order,
        transaction,
        roundOffInfo: {
          originalAmount,
          roundedAmount,
          roundOffAmount,
          message: roundOffAmount > 0 
            ? `₹${roundOffAmount.toFixed(2)} added as spare change` 
            : 'No round-off applied'
        }
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Create Razorpay order via backend API
  private async createRazorpayOrder(amount: number, description: string): Promise<any> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const response = await fetch(`${baseUrl}/razorpay/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo_token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          description,
          receipt: `receipt_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order via API');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, falling back to mock order creation');
      return this.mockCreateOrder(amount, description);
    }
  }

  // Mock order creation (replace with actual API call)
  private async mockCreateOrder(amount: number, description: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `order_${Date.now()}`,
          amount: Math.round(amount * 100), // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          status: 'created',
          description
        });
      }, 500);
    });
  }

  // Process payment with Razorpay
  async processPayment(
    orderId: string, 
    amount: number, 
    onSuccess?: (paymentData: any) => void,
    onFailure?: (error: any) => void
  ): Promise<void> {
    if (!this.keyId) {
      throw new Error('Razorpay not configured. Please add VITE_RAZORPAY_KEY_ID to your environment variables.');
    }

    const transaction = this.transactions.find(t => t.orderId === orderId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Get user details for prefill
    const userProfile = this.getUserProfileForPayment();

    const options = {
      key: this.keyId,
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      order_id: orderId,
      name: 'UPI Piggy',
      description: transaction.description,
      image: '/piggy.png',
      handler: async (response: any) => {
        try {
          console.log('🎉 Payment Success Response:', response);
          
          // Update local transaction status immediately
          transaction.paymentId = response.razorpay_payment_id;
          transaction.status = 'paid';
          this.saveTransactions();

          // Update transaction in database
          await this.updateTransactionInDatabase(
            transaction.id,
            'paid',
            response.razorpay_payment_id,
            this.detectPaymentMethod(response)
          );

          // Process round-off investment
          if (transaction.roundOffAmount > 0 && this.roundOffSettings.investRoundOff) {
            await this.investRoundOff(transaction.roundOffAmount, transaction.id);
          }

          // Add to piggy ledger for round-off
          if (transaction.roundOffAmount > 0) {
            await this.addToPiggyLedger(
              transaction.userId,
              transaction.roundOffAmount,
              'roundup_credit',
              `Round-off from payment ${response.razorpay_payment_id}`,
              transaction.id,
              orderId
            );
          }

          // Show success toast with more details
          toast({
            title: "Payment Successful! 🎉",
            description: `₹${transaction.roundedAmount} paid successfully${transaction.roundOffAmount > 0 
              ? ` (₹${transaction.roundOffAmount} invested as spare change)` 
              : ''}
            \nPayment ID: ${response.razorpay_payment_id.slice(-8)}`,
            duration: 8000,
          });

          // Call success callback with enhanced data
          onSuccess?.({
            ...response,
            transaction,
            roundOffInvested: transaction.roundOffAmount > 0 && this.roundOffSettings.investRoundOff
          });
        } catch (error) {
          console.error('❌ Error processing successful payment:', error);
          
          // Even if post-processing fails, mark payment as successful
          // but notify user about potential issue
          toast({
            title: "Payment Received ✅",
            description: "Payment successful but there was an issue with investment processing. Contact support if needed.",
            variant: "destructive",
            duration: 10000,
          });
          
          onFailure?.(error);
        }
      },
      prefill: {
        name: userProfile.name || 'UPI Piggy User',
        email: userProfile.email || 'user@upipiggy.com',
        contact: userProfile.phone || '+91-9999999999'
      },
      notes: {
        transaction_id: transaction.id,
        original_amount: transaction.originalAmount,
        round_off_amount: transaction.roundOffAmount
      },
      theme: {
        color: '#3B82F6'
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true
      }
    };

    // Load Razorpay script dynamically
    await this.loadRazorpayScript();
    
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', async (response: any) => {
      console.log('❌ Payment Failed Response:', response);
      
      transaction.status = 'failed';
      this.saveTransactions();
      
      // Update transaction in database
      try {
        await this.updateTransactionInDatabase(
          transaction.id,
          'failed',
          undefined,
          undefined,
          response.error?.description
        );
      } catch (dbError) {
        console.error('Error updating failed transaction in database:', dbError);
      }
      
      // Show detailed error message
      const errorMessage = response.error?.description || 
        response.error?.reason || 
        'Your payment could not be processed. Please try again.';
      
      toast({
        title: "Payment Failed ❌",
        description: `${errorMessage}\nError Code: ${response.error?.code || 'UNKNOWN'}`,
        variant: "destructive",
        duration: 8000,
      });

      onFailure?.({
        ...response,
        transaction,
        errorMessage
      });
    });

    rzp.open();
  }

  // Setup autopay (recurring payments)
  async setupAutopay(
    customerId: string,
    maxAmount: number,
    frequency: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<AutopaySetup> {
    try {
      // In production, this would involve Razorpay's recurring payment APIs
      const tokenId = `token_${Date.now()}`;
      
      const autopaySetup: AutopaySetup = {
        tokenId,
        customerId,
        maxAmount,
        frequency,
        isActive: true,
        nextPaymentDate: this.calculateNextPaymentDate(frequency)
      };

      // Save autopay setup
      localStorage.setItem('piggy_autopay_setup', JSON.stringify(autopaySetup));

      toast({
        title: "Autopay Setup Complete! 🚀",
        description: `Automatic investments of up to ₹${maxAmount} set up for ${frequency} frequency`,
        duration: 5000,
      });

      return autopaySetup;
    } catch (error) {
      console.error('Error setting up autopay:', error);
      throw new Error('Failed to setup autopay');
    }
  }

  // Helper methods for database integration
  private getUserProfileForPayment() {
    // Get user profile from localStorage or context
    const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return {
      name: userProfile.full_name || userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone
    };
  }

  private detectPaymentMethod(response: any): string {
    // Detect payment method from Razorpay response
    if (response.razorpay_payment_id) {
      const paymentId = response.razorpay_payment_id;
      if (paymentId.startsWith('pay_')) {
        // This is a simplified detection - in real app, you'd get this from webhook
        return 'upi'; // Default to UPI for demo
      }
    }
    return 'unknown';
  }

  private async updateTransactionInDatabase(
    transactionId: string, 
    status: 'paid' | 'failed' | 'cancelled',
    paymentId?: string,
    paymentMethod?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      console.log(`📊 Updating transaction ${transactionId} in database:`, {
        status,
        paymentId,
        paymentMethod,
        errorMessage
      });

      await TransactionService.updateTransactionStatus(
        transactionId,
        status,
        paymentId,
        paymentMethod
      );

      console.log(`✅ Transaction ${transactionId} updated successfully in database`);
    } catch (error) {
      console.error(`❌ Failed to update transaction ${transactionId} in database:`, error);
      throw error;
    }
  }

  private async addToPiggyLedger(
    userId: string,
    amount: number,
    type: 'roundup_credit' | 'manual_topup' | 'investment_debit',
    reference: string,
    transactionId?: string,
    orderId?: string
  ): Promise<void> {
    try {
      console.log(`🐷 Adding to piggy ledger:`, {
        userId,
        amount,
        type,
        reference
      });

      // In a real app, you would call your Supabase API here
      // For now, we'll store it locally and log for demo purposes
      const ledgerEntry = {
        id: `ledger_${Date.now()}`,
        user_id: userId,
        amount,
        type,
        reference,
        transaction_id: transactionId,
        order_id: orderId,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Store locally for demo
      const existingLedger = JSON.parse(localStorage.getItem('piggy_ledger') || '[]');
      existingLedger.push(ledgerEntry);
      localStorage.setItem('piggy_ledger', JSON.stringify(existingLedger));

      console.log(`✅ Added to piggy ledger successfully`);
    } catch (error) {
      console.error(`❌ Failed to add to piggy ledger:`, error);
      // Don't throw error here as it's not critical for payment success
    }
  }

  // Invest round-off amount with database integration
  private async investRoundOff(amount: number, transactionId?: string): Promise<void> {
    try {
      console.log(`💰 Investing round-off amount: ₹${amount}`);
      
      const userId = UserService.getCurrentUserId();
      
      // Create round-off investment record in database
      try {
        await TransactionService.createRoundOffInvestment({
          userId,
          transactionId,
          amount,
          portfolioId: 'default_roundoff_portfolio'
        });
        
        console.log(`✅ Round-off investment created in database`);
      } catch (dbError) {
        console.warn('Database not available, storing locally:', dbError);
      }
      
      // Also store locally for immediate access
      const roundOffInvestment = {
        id: `roundoff_${Date.now()}`,
        amount: amount,
        type: 'round_off',
        timestamp: new Date(),
        portfolioId: 'default_roundoff_portfolio',
        transactionId,
        userId
      };

      const existingRoundOffs = JSON.parse(localStorage.getItem('piggy_roundoff_investments') || '[]');
      existingRoundOffs.push(roundOffInvestment);
      localStorage.setItem('piggy_roundoff_investments', JSON.stringify(existingRoundOffs));
      
      console.log(`✅ Round-off investment stored locally as backup`);

    } catch (error) {
      console.error('❌ Error investing round-off amount:', error);
      // Don't throw error as investment processing shouldn't block payment success
    }
  }

  // Load Razorpay script
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  // Helper methods
  private calculateNextPaymentDate(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private saveTransactions(): void {
    localStorage.setItem('piggy_transactions', JSON.stringify(this.transactions));
  }

  private loadTransactions(): void {
    try {
      const saved = localStorage.getItem('piggy_transactions');
      if (saved) {
        this.transactions = JSON.parse(saved).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
    }
  }

  private saveRoundOffSettings(): void {
    localStorage.setItem('piggy_roundoff_settings', JSON.stringify(this.roundOffSettings));
  }

  private loadRoundOffSettings(): void {
    try {
      const saved = localStorage.getItem('piggy_roundoff_settings');
      if (saved) {
        this.roundOffSettings = { ...this.roundOffSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading round-off settings:', error);
    }
  }

  // Public getters
  getTransactions(): RazorpayTransaction[] {
    return [...this.transactions];
  }

  getRoundOffSettings(): RoundOffSettings {
    return { ...this.roundOffSettings };
  }

  updateRoundOffSettings(settings: Partial<RoundOffSettings>): void {
    this.roundOffSettings = { ...this.roundOffSettings, ...settings };
    this.saveRoundOffSettings();
  }

  getTotalRoundOffInvested(): number {
    try {
      const roundOffs = JSON.parse(localStorage.getItem('piggy_roundoff_investments') || '[]');
      return roundOffs.reduce((total: number, investment: any) => total + investment.amount, 0);
    } catch {
      return 0;
    }
  }

  getAutopaySetup(): AutopaySetup | null {
    try {
      const saved = localStorage.getItem('piggy_autopay_setup');
      if (saved) {
        const setup = JSON.parse(saved);
        return {
          ...setup,
          nextPaymentDate: new Date(setup.nextPaymentDate)
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
export default razorpayService;
