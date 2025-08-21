// Notification Settings Page
// Comprehensive settings for managing all types of notifications

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Shield, 
  TrendingUp,
  Target,
  Users,
  Settings,
  Clock,
  Volume2,
  VolumeX,
  TestTube,
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { notificationService, NotificationSettings } from '@/services/notificationService';

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  useEffect(() => {
    const currentSettings = notificationService.getSettings();
    setSettings(currentSettings);
  }, []);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const updateCategory = (category: keyof NotificationSettings['categories'], enabled: boolean) => {
    updateSettings({
      categories: {
        ...settings.categories,
        [category]: enabled,
      },
    });
  };

  const updateQuietHours = (updates: Partial<NotificationSettings['quietHours']>) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        ...updates,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      notificationService.updateSettings(settings);
      setHasChanges(false);
      
      // Show success notification
      await notificationService.addNotification({
        title: '✅ Settings Saved',
        message: 'Your notification preferences have been updated successfully!',
        type: 'success',
        category: 'system',
        priority: 'low',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = notificationService.getSettings();
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    if (granted) {
      updateSettings({ pushNotifications: true });
    }
  };

  const categoryIcons = {
    rewards: TrendingUp,
    investment: TrendingUp,
    goals: Target,
    social: Users,
    security: Shield,
    system: Settings,
  };

  const categoryDescriptions = {
    rewards: 'Achievements, points, level ups, and streaks',
    investment: 'Portfolio updates, market changes, and trade confirmations',
    goals: 'Goal progress, milestones, and achievements',
    social: 'Friend activities, referrals, and community updates',
    security: 'Login alerts, security warnings, and account changes',
    system: 'App updates, maintenance, and important announcements',
  };

  const notificationPermission = Notification.permission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize how and when you receive notifications from Piggy UPI
          </p>
        </div>

        {/* Permission Status */}
        {notificationPermission !== 'granted' && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Push notifications are {notificationPermission === 'denied' ? 'blocked' : 'not enabled'}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Enable push notifications to receive important updates even when the app is closed
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={requestNotificationPermission}
                  disabled={notificationPermission === 'denied'}
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <Label className="font-medium">Push Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Browser notifications when app is closed
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                  disabled={notificationPermission !== 'granted'}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <Label className="font-medium">Email Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Important updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <Label className="font-medium">SMS Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Critical alerts via text message
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })}
                />
              </div>

              {/* In-App Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <Label className="font-medium">In-App Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Toast messages and alerts within the app
                  </p>
                </div>
                <Switch
                  checked={settings.inAppNotifications}
                  onCheckedChange={(checked) => updateSettings({ inAppNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Frequency and Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Timing & Frequency</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Frequency */}
              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <Select
                  value={settings.frequency}
                  onValueChange={(value: 'immediate' | 'digest' | 'weekly') =>
                    updateSettings({ frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="digest">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  How often you receive non-urgent notifications
                </p>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <span>Quiet Hours</span>
                    </Label>
                    <p className="text-sm text-gray-500">
                      Disable non-urgent notifications during these hours
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => updateQuietHours({ start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => updateQuietHours({ end: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <p className="text-sm text-gray-500">
              Choose which types of notifications you want to receive
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(settings.categories).map(([category, enabled]) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                const description = categoryDescriptions[category as keyof typeof categoryDescriptions];
                
                return (
                  <div key={category} className="flex items-start space-x-3">
                    <div className="mt-1">
                      <IconComponent className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium capitalize">{category}</Label>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => updateCategory(category as keyof NotificationSettings['categories'], checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Test & Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>Test Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send a test notification to verify your settings are working correctly
                </p>
                <Button
                  onClick={handleTestNotification}
                  disabled={testNotificationSent}
                  className="w-full"
                >
                  {testNotificationSent ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Test Sent!
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Send Test Notification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {hasChanges 
                    ? 'You have unsaved changes to your notification settings'
                    : 'Your notification settings are up to date'
                  }
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  notificationPermission === 'granted' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <p className="text-xs font-medium">Push Notifications</p>
                <p className="text-xs text-gray-500 capitalize">{notificationPermission}</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  settings.inAppNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <p className="text-xs font-medium">In-App</p>
                <p className="text-xs text-gray-500">{settings.inAppNotifications ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <p className="text-xs font-medium">Email</p>
                <p className="text-xs text-gray-500">{settings.emailNotifications ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  settings.quietHours.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <p className="text-xs font-medium">Quiet Hours</p>
                <p className="text-xs text-gray-500">
                  {settings.quietHours.enabled 
                    ? `${settings.quietHours.start}-${settings.quietHours.end}`
                    : 'Disabled'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
