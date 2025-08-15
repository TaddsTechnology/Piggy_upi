import { supabase } from './supabase';
import { Database } from './supabase';

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export interface SettingsFormData {
  round_to_nearest: number;
  min_roundup: number;
  max_roundup: number;
  portfolio_preset: 'safe' | 'balanced' | 'growth';
  auto_invest_enabled: boolean;
  weekly_target: number;
}

export const settingsService = {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      throw error;
    }
  },

  // Create or update user settings
  async upsertUserSettings(userId: string, settings: Partial<SettingsFormData>): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUserSettings:', error);
      throw error;
    }
  },

  // Get default settings
  getDefaultSettings(): SettingsFormData {
    return {
      round_to_nearest: 10,
      min_roundup: 1,
      max_roundup: 50,
      portfolio_preset: 'balanced',
      auto_invest_enabled: true,
      weekly_target: 200
    };
  },

  // Validate settings before saving
  validateSettings(settings: Partial<SettingsFormData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.round_to_nearest !== undefined && settings.round_to_nearest < 1) {
      errors.push('Round to nearest must be at least ₹1');
    }

    if (settings.min_roundup !== undefined && settings.min_roundup < 0.1) {
      errors.push('Minimum round-up must be at least ₹0.10');
    }

    if (settings.max_roundup !== undefined && settings.max_roundup < 1) {
      errors.push('Maximum round-up must be at least ₹1');
    }

    if (settings.min_roundup !== undefined && settings.max_roundup !== undefined && 
        settings.min_roundup >= settings.max_roundup) {
      errors.push('Minimum round-up must be less than maximum round-up');
    }

    if (settings.weekly_target !== undefined && settings.weekly_target < 10) {
      errors.push('Weekly target must be at least ₹10');
    }

    if (settings.portfolio_preset !== undefined && 
        !['safe', 'balanced', 'growth'].includes(settings.portfolio_preset)) {
      errors.push('Invalid portfolio preset');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
