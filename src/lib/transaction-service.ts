// Dynamic Transaction Service - Database-backed transaction management

export interface Transaction {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  originalAmount: number;
  roundedAmount: number;
  roundOffAmount: number;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  description: string;
  portfolioId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  transactionId?: string;
  portfolioId: string;
  amount: number;
  units?: number;
  navPrice?: number;
  investmentType: 'regular' | 'round_off' | 'autopay';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

export interface RoundOffInvestment {
  id: string;
  userId: string;
  transactionId?: string;
  amount: number;
  portfolioId?: string;
  status: 'pending' | 'invested' | 'failed';
  createdAt: Date;
}

class TransactionService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // CREATE new transaction (when Razorpay order is created)
  static async createTransaction(transactionData: {
    userId: string;
    razorpayOrderId: string;
    originalAmount: number;
    roundedAmount: number;
    roundOffAmount: number;
    description: string;
    portfolioId?: string;
  }): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...transactionData,
          status: 'created'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // UPDATE transaction status (when payment is completed/failed)
  static async updateTransactionStatus(
    transactionId: string,
    status: 'paid' | 'failed' | 'cancelled',
    razorpayPaymentId?: string,
    paymentMethod?: string
  ): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          razorpayPaymentId,
          paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // GET user transactions
  static async getUserTransactions(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?userId=${userId}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // GET transaction by Razorpay order ID
  static async getTransactionByOrderId(razorpayOrderId: string): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/order/${razorpayOrderId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction by order ID:', error);
      return null;
    }
  }

  // CREATE investment record
  static async createInvestment(investmentData: {
    userId: string;
    transactionId?: string;
    portfolioId: string;
    amount: number;
    units?: number;
    navPrice?: number;
    investmentType: 'regular' | 'round_off' | 'autopay';
  }): Promise<Investment> {
    try {
      const response = await fetch(`${this.baseUrl}/investments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...investmentData,
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create investment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  // CREATE round-off investment
  static async createRoundOffInvestment(roundOffData: {
    userId: string;
    transactionId?: string;
    amount: number;
    portfolioId?: string;
  }): Promise<RoundOffInvestment> {
    try {
      const response = await fetch(`${this.baseUrl}/round-off-investments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...roundOffData,
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create round-off investment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating round-off investment:', error);
      throw error;
    }
  }

  // GET user's round-off investments
  static async getUserRoundOffInvestments(userId: string): Promise<RoundOffInvestment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/round-off-investments?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch round-off investments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching round-off investments:', error);
      return [];
    }
  }

  // GET total round-off amount invested by user
  static async getTotalRoundOffInvested(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/round-off-investments/total?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch total round-off invested');
      }

      const result = await response.json();
      return result.totalAmount || 0;
    } catch (error) {
      console.error('Error fetching total round-off invested:', error);
      return 0;
    }
  }

  // GET user investments
  static async getUserInvestments(userId: string): Promise<Investment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/investments?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user investments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  // UPDATE investment status
  static async updateInvestmentStatus(
    investmentId: string, 
    status: 'confirmed' | 'failed',
    units?: number,
    navPrice?: number
  ): Promise<Investment> {
    try {
      const response = await fetch(`${this.baseUrl}/investments/${investmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          units,
          navPrice
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update investment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating investment status:', error);
      throw error;
    }
  }

  // Helper method to get auth token
  private static getAuthToken(): string {
    return localStorage.getItem('auth_token') || 'demo_token';
  }
}

export default TransactionService;
