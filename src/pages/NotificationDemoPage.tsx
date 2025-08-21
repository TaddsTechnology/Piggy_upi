// Notification Demo Page
// Interactive demo to test and showcase notification system features

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Shield, 
  Star,
  Gift,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { notificationService, NotificationData } from '@/services/notificationService';
import { RewardsNotification } from '@/components/RewardsNotification';
import NotificationCenter from '@/components/NotificationCenter';

const NotificationDemoPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastTriggered, setLastTriggered] = useState<string>('');

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const triggerNotification = async (type: string) => {
    setLastTriggered(type);
    setTimeout(() => setLastTriggered(''), 2000);

    switch (type) {
      case 'achievement':
        await notificationService.notifyAchievement('First Investment', 100, {
          achievementName: 'Investment Pioneer',
          description: 'Made your first investment in mutual funds'
        });
        break;

      case 'levelUp':
        await notificationService.notifyLevelUp(5, {
          points: 500,
          badges: ['Investor', 'Saver'],
          perks: ['Higher cashback', 'Priority support']
        });
        break;

      case 'goalReached':
        await notificationService.notifyGoalReached('Emergency Fund', 50000);
        break;

      case 'investmentGain':
        await notificationService.notifyInvestmentUpdate('gain', 2500, 8.5);
        break;

      case 'investmentLoss':
        await notificationService.notifyInvestmentUpdate('loss', 800, -3.2);
        break;

      case 'security':
        await notificationService.notifySecurityAlert('New login detected from a different device. If this wasn\'t you, please secure your account immediately.');
        break;

      case 'success':
        await notificationService.addNotification({
          title: '✅ Transaction Successful',
          message: 'Your SIP investment of ₹5,000 in HDFC Top 100 Fund has been processed successfully.',
          type: 'success',
          category: 'investment',
          priority: 'medium',
        });
        break;

      case 'warning':
        await notificationService.addNotification({
          title: '⚠️ Low Balance Warning',
          message: 'Your account balance is below ₹1,000. Consider adding funds to continue your investments.',
          type: 'warning',
          category: 'system',
          priority: 'high',
        });
        break;

      case 'error':
        await notificationService.addNotification({
          title: '❌ Payment Failed',
          message: 'Your SIP payment could not be processed. Please check your bank account and try again.',
          type: 'error',
          category: 'investment',
          priority: 'high',
        });
        break;

      case 'info':
        await notificationService.addNotification({
          title: '💡 Market Update',
          message: 'Indian stock markets opened higher today. Your portfolio is up by 2.3% since yesterday.',
          type: 'info',
          category: 'investment',
          priority: 'low',
        });
        break;

      case 'social':
        await notificationService.addNotification({
          title: '👥 Friend Activity',
          message: 'Your friend Rahul just achieved the "Consistent Saver" badge! Send them a congratulations.',
          type: 'info',
          category: 'social',
          priority: 'low',
        });
        break;

      case 'points':
        await notificationService.addNotification({
          title: '⭐ Points Earned',
          message: 'You earned 50 points for completing your weekly investment goal! Keep it up!',
          type: 'points',
          category: 'rewards',
          priority: 'medium',
          data: { points: 50, source: 'weekly_goal' }
        });
        break;

      case 'streak':
        await notificationService.addNotification({
          title: '⚡ Streak Milestone',
          message: 'Congratulations! You\'ve maintained your 30-day investment streak. You\'re on fire!',
          type: 'streak',
          category: 'rewards',
          priority: 'medium',
          data: { streak: 30, bonus: 200 }
        });
        break;
    }
  };

  const clearAllNotifications = () => {
    notificationService.clearAll();
  };

  const requestPushPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    if (granted) {
      await notificationService.addNotification({
        title: '🔔 Push Notifications Enabled',
        message: 'You will now receive push notifications even when the app is closed.',
        type: 'success',
        category: 'system',
        priority: 'low',
      });
    }
  };

  const notificationTypes = [
    {
      id: 'achievement',
      title: 'Achievement Unlocked',
      description: 'Celebrate milestone achievements',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    },
    {
      id: 'levelUp',
      title: 'Level Up',
      description: 'User progressed to next level',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'goalReached',
      title: 'Goal Achieved',
      description: 'Investment goal completed',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'investmentGain',
      title: 'Investment Gain',
      description: 'Portfolio performance update',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      id: 'investmentLoss',
      title: 'Market Update',
      description: 'Portfolio decrease notification',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      id: 'security',
      title: 'Security Alert',
      description: 'Important security notification',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      id: 'success',
      title: 'Success Message',
      description: 'Transaction completed successfully',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'warning',
      title: 'Warning Alert',
      description: 'Important attention required',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
    {
      id: 'error',
      title: 'Error Notification',
      description: 'Action failed or error occurred',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      id: 'info',
      title: 'Information',
      description: 'General information update',
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'social',
      title: 'Social Activity',
      description: 'Friend or community updates',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'points',
      title: 'Points Earned',
      description: 'Reward points notification',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    },
    {
      id: 'streak',
      title: 'Streak Milestone',
      description: 'Consecutive activity achievement',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationPermission = Notification.permission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔔 Notification System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test and explore the comprehensive notification system with push notifications, 
            in-app alerts, categorization, and management features.
          </p>
          
          {/* Notification Center in Header */}
          <div className="flex justify-center">
            <NotificationCenter className="bg-white shadow-lg rounded-full p-2" />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <p className="text-sm text-gray-600">Total Notifications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <p className="text-sm text-gray-600">Unread</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${
                notificationPermission === 'granted' 
                  ? 'text-green-600' 
                  : notificationPermission === 'denied' 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`}>
                {notificationPermission === 'granted' ? '✓' : 
                 notificationPermission === 'denied' ? '✗' : '?'}
              </div>
              <p className="text-sm text-gray-600">Push Permission</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {lastTriggered ? '⚡' : '💤'}
              </div>
              <p className="text-sm text-gray-600">
                {lastTriggered ? 'Active' : 'Idle'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={requestPushPermission}
                disabled={notificationPermission === 'granted'}
              >
                {notificationPermission === 'granted' ? 'Push Enabled' : 'Enable Push Notifications'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.sendTestNotification()}
              >
                Send Test Notification
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.markAllAsRead()}
                disabled={unreadCount === 0}
              >
                Mark All Read ({unreadCount})
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
              >
                Clear All ({notifications.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <p className="text-sm text-gray-600">
              Click any button below to trigger that type of notification
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {notificationTypes.map((type) => {
                const IconComponent = type.icon;
                const isActive = lastTriggered === type.id;
                
                return (
                  <Button
                    key={type.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerNotification(type.id)}
                    className={`
                      h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200
                      ${type.bgColor}
                      ${isActive ? 'scale-95 shadow-inner' : 'hover:shadow-md'}
                    `}
                  >
                    <div className={`p-2 rounded-full bg-white/50 ${type.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">
                        {type.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                    {isActive && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Sent!
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications Preview */}
        {notifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <p className="text-sm text-gray-600">
                Latest {Math.min(5, notifications.length)} notifications (click bell icon above for full list)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-3 rounded-lg border-l-4 transition-all duration-200
                      ${notification.priority === 'urgent' ? 'border-l-red-500 bg-red-50' :
                        notification.priority === 'high' ? 'border-l-orange-500 bg-orange-50' :
                        notification.priority === 'medium' ? 'border-l-blue-500 bg-blue-50' :
                        'border-l-gray-500 bg-gray-50'}
                      ${!notification.read ? 'shadow-sm' : 'opacity-70'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs capitalize"
                          >
                            {notification.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs capitalize"
                          >
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Browser Support</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Push Notifications: {typeof Notification !== 'undefined' ? 'Supported' : 'Not supported'}</li>
                  <li>✓ Service Worker: {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}</li>
                  <li>✓ Local Storage: {typeof localStorage !== 'undefined' ? 'Available' : 'Not available'}</li>
                  <li>✓ Background Sync: {'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype ? 'Supported' : 'Not supported'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Current Settings</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>Push Permission: <span className="capitalize">{notificationPermission}</span></li>
                  <li>In-App Notifications: Enabled</li>
                  <li>Persistent Storage: localStorage</li>
                  <li>Auto-cleanup: Enabled (100 max)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Notifications */}
      <RewardsNotification
        notifications={notifications
          .filter(n => ['achievement', 'points', 'level_up', 'streak'].includes(n.type))
          .slice(0, 3)
          .map(n => ({
            id: n.id,
            type: n.type as any,
            message: n.message,
            data: n.data,
            timestamp: n.timestamp,
            onDismiss: (id: string) => notificationService.removeNotification(id)
          }))}
        onDismiss={(id: string) => notificationService.removeNotification(id)}
        onClearAll={() => notificationService.clearAll()}
      />
    </div>
  );
};

export default NotificationDemoPage;
