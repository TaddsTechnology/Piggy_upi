// Enhanced Authentication Service with Email Templates
import { supabase } from '@/lib/supabase';
import { welcomeEmailTemplate, emailVerificationTemplate, passwordResetTemplate } from '@/lib/email-templates';
import { emailService } from '@/lib/email-service';
import type { User, AuthResponse } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface AuthServiceResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export class AuthService {
  /**
   * Sign up a new user with custom email templates
   */
  static async signUp(data: SignUpData): Promise<AuthServiceResponse> {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName || '',
            phone: data.phone || ''
          },
          // Custom email templates
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) {
        return { 
          success: false, 
          error: this.getReadableError(authError.message) 
        };
      }

      if (!authData.user) {
        return { 
          success: false, 
          error: 'Failed to create user account' 
        };
      }

      // Send custom welcome email (if email is confirmed)
      if (authData.user.email_confirmed_at) {
        await this.sendWelcomeEmail(authData.user.email!, data.fullName || 'there');
      }

      // Create user profile in public.users table
      if (authData.user.id) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName || null,
            phone: data.phone || null,
            kyc_status: 'pending'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail the signup for profile errors, user can complete later
        }

        // Create default user settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: authData.user.id,
            round_to_nearest: 10,
            min_roundup: 1,
            max_roundup: 50,
            portfolio_preset: 'balanced',
            auto_invest_enabled: true,
            weekly_target: 200
          });

        if (settingsError) {
          console.error('Settings creation error:', settingsError);
        }
      }

      return {
        success: true,
        user: authData.user,
        message: authData.user.email_confirmed_at 
          ? 'Account created successfully! Welcome to UPI Piggy.' 
          : 'Account created! Please check your email to verify your account.'
      };

    } catch (error) {
      console.error('SignUp error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during signup' 
      };
    }
  }

  /**
   * Sign in user
   */
  static async signIn(email: string, password: string): Promise<AuthServiceResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { 
          success: false, 
          error: this.getReadableError(error.message) 
        };
      }

      // Update last login timestamp
      if (data.user?.id) {
        await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return {
        success: true,
        user: data.user,
        message: 'Welcome back to UPI Piggy!'
      };

    } catch (error) {
      console.error('SignIn error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during sign in' 
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<AuthServiceResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      return {
        success: true,
        message: 'Signed out successfully'
      };

    } catch (error) {
      console.error('SignOut error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during sign out' 
      };
    }
  }

  /**
   * Reset password with custom email template
   */
  static async resetPassword(email: string): Promise<AuthServiceResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { 
          success: false, 
          error: this.getReadableError(error.message) 
        };
      }

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerification(email: string): Promise<AuthServiceResponse> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { 
          success: false, 
          error: this.getReadableError(error.message) 
        };
      }

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Get current user with full profile
   */
  static async getCurrentUser(): Promise<{ user: User | null; profile: any | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { user: null, profile: null };
      }

      // Get user profile from public.users table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, profile };

    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, profile: null };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: {
    full_name?: string;
    phone?: string;
  }): Promise<AuthServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Send custom welcome email
   */
  private static async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const template = welcomeEmailTemplate(userName);
      
      const result = await emailService.sendTemplateEmail(email, template, {
        userName,
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent || 'Unknown'
      });
      
      if (!result.success) {
        console.error('Failed to send welcome email:', result.error);
      }
      
    } catch (error) {
      console.error('Welcome email error:', error);
      // Don't throw - email failure shouldn't break signup
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(email: string, verificationUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailVerificationTemplate(verificationUrl);
      
      const result = await emailService.sendTemplateEmail(email, template, {
        verificationUrl,
        timestamp: new Date().toISOString()
      });
      
      return result;
      
    } catch (error) {
      console.error('Verification email error:', error);
      return { 
        success: false, 
        error: 'Failed to send verification email' 
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const template = passwordResetTemplate(resetUrl);
      
      const result = await emailService.sendTemplateEmail(email, template, {
        resetUrl,
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent || 'Unknown'
      });
      
      return result;
      
    } catch (error) {
      console.error('Password reset email error:', error);
      return { 
        success: false, 
        error: 'Failed to send password reset email' 
      };
    }
  }

  /**
   * Convert Supabase errors to user-friendly messages
   */
  private static getReadableError(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Incorrect email or password. Please try again.',
      'Email not confirmed': 'Please verify your email address before signing in.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Invalid email': 'Please enter a valid email address.',
      'Signup is disabled': 'New registrations are temporarily disabled.',
      'Email rate limit exceeded': 'Too many email requests. Please try again later.',
      'Invalid refresh token': 'Your session has expired. Please sign in again.'
    };

    // Check for exact matches first
    if (errorMap[error]) {
      return errorMap[error];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return value;
      }
    }

    // Default fallback
    return error || 'An unexpected error occurred. Please try again.';
  }
}
