// Enhanced Notification Service
// Handles push notifications, toast messages, email notifications, and real-time updates

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement' | 'points' | 'level_up' | 'streak';
  category: 'system' | 'rewards' | 'investment' | 'goal' | 'social' | 'security';
  data?: any;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  expiresAt?: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    rewards: boolean;
    investment: boolean;
    goals: boolean;
    social: boolean;
    security: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'digest' | 'weekly';
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];
  private settings: NotificationSettings;
  private serviceWorker: ServiceWorker | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.initializeServiceWorker();
    this.initializePushNotifications();
  }

  // Initialize service worker for background notifications
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration.active;
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Initialize push notifications
  private async initializePushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Push notifications not supported');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      await this.requestNotificationPermission();
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Load settings from localStorage
  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      pushNotifications: false,
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      categories: {
        rewards: true,
        investment: true,
        goals: true,
        social: true,
        security: true,
        system: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'immediate',
    };
  }

  // Save settings to localStorage
  private saveSettings() {
    localStorage.setItem('notification-settings', JSON.stringify(this.settings));
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Check if notifications are allowed during quiet hours
  private isQuietHoursActive(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(this.settings.quietHours.start);
    const endTime = this.parseTime(this.settings.quietHours.end);

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Add a new notification
  async addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: NotificationData = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    // Check if category is enabled
    if (!this.settings.categories[notification.category]) {
      return;
    }

    // Add to notifications array
    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Notify listeners
    this.notifyListeners();

    // Show push notification if enabled and permission granted
    if (this.settings.pushNotifications && !this.isQuietHoursActive()) {
      await this.showPushNotification(newNotification);
    }

    // Send email notification if enabled
    if (this.settings.emailNotifications && notification.priority === 'urgent') {
      await this.sendEmailNotification(newNotification);
    }

    // Save to localStorage
    this.saveNotifications();
  }

  // Show push notification
  private async showPushNotification(notification: NotificationData) {
    if (Notification.permission !== 'granted') return;

    try {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/piggy.png',
        badge: '/piggy.png',
        tag: notification.id,
        data: notification.data,
        requireInteraction: notification.priority === 'urgent',
        actions: notification.actions?.map(action => ({
          action: action.id,
          title: action.label,
        })),
      };

      if (this.serviceWorker) {
        // Use service worker for persistent notifications
        this.serviceWorker.postMessage({
          type: 'SHOW_NOTIFICATION',
          notification: {
            title: notification.title,
            options,
          },
        });
      } else {
        // Fallback to regular notification
        const pushNotification = new Notification(notification.title, options);
        
        pushNotification.onclick = () => {
          window.focus();
          this.markAsRead(notification.id);
          pushNotification.close();
        };

        // Auto-close after 5 seconds unless urgent
        if (notification.priority !== 'urgent') {
          setTimeout(() => pushNotification.close(), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  }

  // Send email notification (placeholder - implement with your backend)
  private async sendEmailNotification(notification: NotificationData) {
    try {
      // This would typically call your backend API
      console.log('Sending email notification:', notification);
      
      // Example API call:
      // await fetch('/api/notifications/email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: notification.title,
      //     message: notification.message,
      //     category: notification.category,
      //     priority: notification.priority,
      //   }),
      // });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all notifications
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): NotificationData[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get notifications by category
  getNotificationsByCategory(category: string): NotificationData[] {
    return this.notifications.filter(n => n.category === category);
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
    this.saveNotifications();
  }

  // Remove notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
    this.saveNotifications();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
    this.saveNotifications();
  }

  // Clear expired notifications
  clearExpired(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
    this.notifyListeners();
    this.saveNotifications();
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      localStorage.setItem('piggy-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load notifications from localStorage
  loadNotifications(): void {
    try {
      const saved = localStorage.getItem('piggy-notifications');
      if (saved) {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
        this.clearExpired();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  // Predefined notification templates
  async notifyAchievement(achievement: string, points: number, data?: any) {
    await this.addNotification({
      title: '🎉 Achievement Unlocked!',
      message: `You've earned the "${achievement}" achievement and gained ${points} points!`,
      type: 'achievement',
      category: 'rewards',
      priority: 'medium',
      data: { achievement, points, ...data },
    });
  }

  async notifyLevelUp(newLevel: number, rewards: any) {
    await this.addNotification({
      title: '⬆️ Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      type: 'level_up',
      category: 'rewards',
      priority: 'high',
      data: { level: newLevel, rewards },
    });
  }

  async notifyGoalReached(goalName: string, amount: number) {
    await this.addNotification({
      title: '🎯 Goal Achieved!',
      message: `Congratulations! You've reached your "${goalName}" goal of ₹${amount.toLocaleString()}!`,
      type: 'success',
      category: 'goal',
      priority: 'high',
      data: { goalName, amount },
    });
  }

  async notifyInvestmentUpdate(type: 'gain' | 'loss', amount: number, percentage: number) {
    await this.addNotification({
      title: type === 'gain' ? '📈 Investment Gain' : '📉 Market Update',
      message: `Your portfolio has ${type === 'gain' ? 'gained' : 'decreased by'} ₹${amount.toLocaleString()} (${percentage.toFixed(2)}%)`,
      type: type === 'gain' ? 'success' : 'warning',
      category: 'investment',
      priority: Math.abs(percentage) > 5 ? 'high' : 'medium',
      data: { type, amount, percentage },
    });
  }

  async notifySecurityAlert(message: string, data?: any) {
    await this.addNotification({
      title: '🔐 Security Alert',
      message,
      type: 'warning',
      category: 'security',
      priority: 'urgent',
      data,
    });
  }

  // Test notification function
  async sendTestNotification() {
    await this.addNotification({
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify your settings are working correctly!',
      type: 'info',
      category: 'system',
      priority: 'low',
    });
  }
}

export const notificationService = new NotificationService();

// Initialize and load existing notifications
notificationService.loadNotifications();

export default notificationService;
