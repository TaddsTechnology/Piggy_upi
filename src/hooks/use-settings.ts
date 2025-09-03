import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService, SettingsFormData, UserSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';

export const useSettings = () => {
  const { user, demoMode } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on component mount or when user changes
  const loadSettings = useCallback(async () => {
    if (demoMode) {
      // Use default settings for demo mode
      setSettings(settingsService.getDefaultSettings());
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userSettings = await settingsService.getUserSettings(user.id);
      
      if (userSettings) {
        setSettings({
          round_to_nearest: userSettings.round_to_nearest,
          min_roundup: userSettings.min_roundup,
          max_roundup: userSettings.max_roundup,
          portfolio_preset: userSettings.portfolio_preset,
          auto_invest_enabled: userSettings.auto_invest_enabled,
          weekly_target: userSettings.weekly_target,
        });
      } else {
        // No settings found, use defaults
        setSettings(settingsService.getDefaultSettings());
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings(settingsService.getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, [user?.id, demoMode]);

  // Save settings to database
  const saveSettings = useCallback(async (newSettings: Partial<SettingsFormData>) => {
    if (demoMode) {
      // In demo mode, just update local state
      setSettings(prev => prev ? { ...prev, ...newSettings } : settingsService.getDefaultSettings());
      toast({
        title: "Settings Updated",
        description: "Settings saved successfully (demo mode)",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please sign in to save settings",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Validate settings
      const validation = settingsService.validateSettings(newSettings);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Save to database
      const updatedSettings = await settingsService.upsertUserSettings(user.id, newSettings);
      
      // Update local state
      setSettings({
        round_to_nearest: updatedSettings.round_to_nearest,
        min_roundup: updatedSettings.min_roundup,
        max_roundup: updatedSettings.max_roundup,
        portfolio_preset: updatedSettings.portfolio_preset,
        auto_invest_enabled: updatedSettings.auto_invest_enabled,
        weekly_target: updatedSettings.weekly_target,
      });

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully",
      });

    } catch (err: any) {
      console.error('Failed to save settings:', err);
      const errorMessage = err.message || 'Failed to save settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [user?.id, demoMode, toast]);

  // Update a specific setting (immediate save)
  const updateSetting = useCallback((key: keyof SettingsFormData, value: any) => {
    saveSettings({ [key]: value });
  }, [saveSettings]);

  // Update setting locally without saving
  const updateSettingLocal = useCallback((key: keyof SettingsFormData, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  // Save all pending changes
  const saveAllSettings = useCallback(() => {
    if (settings) {
      saveSettings(settings);
    }
  }, [settings, saveSettings]);

  // Reload settings
  const refreshSettings = useCallback(() => {
    loadSettings();
  }, [loadSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Listen for demo mode exit events and clear state
  useEffect(() => {
    const handleDemoModeExit = () => {
      setSettings(null);
      setError(null);
      setLoading(true);
      // Reload real settings
      if (user?.id && !demoMode) {
        loadSettings();
      } else {
        setLoading(false);
      }
    };

    window.addEventListener('demo-mode-exit', handleDemoModeExit);
    return () => {
      window.removeEventListener('demo-mode-exit', handleDemoModeExit);
    };
  }, [user?.id, demoMode, loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    updateSetting,
    updateSettingLocal,
    saveAllSettings,
    refreshSettings,
  };
};
