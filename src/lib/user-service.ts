// Dynamic User Service - Database-backed user management

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  razorpayCustomerId: string;
  preferences: UserPreferences;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface UserPreferences {
  roundOffEnabled: boolean;
  roundUpThreshold: number;
  maxRoundOff: number;
  investRoundOff: boolean;
  portfolioPreset: 'safe' | 'balanced' | 'growth';
  weeklyTarget: number;
  autoInvestEnabled: boolean;
  hasCompletedOnboarding: boolean;
  hasSkippedAutopaySetup: boolean;
}

export interface AutopaySettings {
  id: string;
  userId: string;
  razorpayTokenId: string;
  maxAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  nextPaymentDate: Date;
}

class UserService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // GET current user with preferences
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/me`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // CREATE user with default preferences
  static async createUser(userData: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          preferences: {
            roundOffEnabled: true,
            roundUpThreshold: 0.5,
            maxRoundOff: 10,
            investRoundOff: true,
            portfolioPreset: 'balanced',
            weeklyTarget: 200,
            autoInvestEnabled: true,
            hasCompletedOnboarding: false,
            hasSkippedAutopaySetup: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // UPDATE user preferences
  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // GET user's autopay settings
  static async getAutopaySettings(userId: string): Promise<AutopaySettings | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/autopay`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No autopay setup
        }
        throw new Error('Failed to fetch autopay settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching autopay settings:', error);
      return null;
    }
  }

  // CREATE/UPDATE autopay settings
  static async updateAutopaySettings(userId: string, settings: {
    maxAmount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
  }): Promise<AutopaySettings> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/autopay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update autopay settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating autopay settings:', error);
      throw error;
    }
  }

  // CREATE Razorpay customer
  static async createRazorpayCustomer(userId: string, customerData: {
    name: string;
    email: string;
    contact: string;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/razorpay-customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay customer');
      }

      const result = await response.json();
      return result.razorpayCustomerId;
    } catch (error) {
      console.error('Error creating Razorpay customer:', error);
      throw error;
    }
  }

  // Helper method to get auth token (implement based on your auth system)
  private static getAuthToken(): string {
    // TODO: Implement based on your authentication system
    // For now, return a placeholder
    return localStorage.getItem('auth_token') || 'demo_token';
  }

  // Helper method to get current user ID from auth context
  static getCurrentUserId(): string {
    // TODO: Get from your auth context/token
    // For demo purposes, generate a consistent ID based on session
    const stored = localStorage.getItem('demo_user_id');
    if (stored) return stored;
    
    const newId = 'user_' + Date.now();
    localStorage.setItem('demo_user_id', newId);
    return newId;
  }

  // Check if the user is new (hasn't completed onboarding)
  static async isNewUser(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return true; // If no user data, consider as new
      return !user.preferences.hasCompletedOnboarding;
    } catch (error) {
      console.error('Error checking if user is new:', error);
      return false; // Default to false in case of error
    }
  }

  // Mark user as having completed onboarding
  static async completeOnboarding(hasSetupAutopay: boolean): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await this.updatePreferences(userId, {
        hasCompletedOnboarding: true,
        hasSkippedAutopaySetup: !hasSetupAutopay
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
}

export default UserService;
