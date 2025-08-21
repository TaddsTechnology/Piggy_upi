// Notification Center Component
// Displays all notifications in a dropdown with filtering and actions

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Filter, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { notificationService, NotificationData } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleRemoveNotification = (id: string) => {
    notificationService.removeNotification(id);
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const getNotificationIcon = (notification: NotificationData) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (notification.type) {
      case 'achievement':
        return <span className="text-lg">🏆</span>;
      case 'points':
        return <span className="text-lg">⭐</span>;
      case 'level_up':
        return <span className="text-lg">📈</span>;
      case 'streak':
        return <span className="text-lg">⚡</span>;
      case 'success':
        return <span className="text-lg">✅</span>;
      case 'warning':
        return <span className="text-lg">⚠️</span>;
      case 'error':
        return <span className="text-lg">❌</span>;
      case 'info':
      default:
        return <span className="text-lg">💡</span>;
    }
  };

  const getNotificationColor = (notification: NotificationData) => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'rewards':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'investment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'goal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'social':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'system':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative ${className}`}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications/settings')}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No notifications</p>
            <p className="text-sm text-gray-400">
              You're all caught up! We'll let you know when something new happens.
            </p>
          </div>
        ) : (
          <div className="max-h-96">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
              <div className="px-4 py-2 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" className="text-xs">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread ({unreadCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-80">
                <TabsContent value="all" className="m-0">
                  <div className="p-2 space-y-2">
                    {notifications.length > 0 && (
                      <div className="flex justify-end px-2 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs h-7"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark all read
                        </Button>
                      </div>
                    )}
                    
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onRemove={handleRemoveNotification}
                        getIcon={getNotificationIcon}
                        getColor={getNotificationColor}
                        formatTime={formatTime}
                        getCategoryBadgeColor={getCategoryBadgeColor}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unread" className="m-0">
                  <div className="p-2 space-y-2">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-gray-500">All caught up!</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end px-2 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs h-7"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        </div>
                        
                        {filteredNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                            onRemove={handleRemoveNotification}
                            getIcon={getNotificationIcon}
                            getColor={getNotificationColor}
                            formatTime={formatTime}
                            getCategoryBadgeColor={getCategoryBadgeColor}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Individual Notification Item Component
interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  getIcon: (notification: NotificationData) => React.ReactNode;
  getColor: (notification: NotificationData) => string;
  formatTime: (date: Date) => string;
  getCategoryBadgeColor: (category: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
  getIcon,
  getColor,
  formatTime,
  getCategoryBadgeColor,
}) => {
  return (
    <div
      className={`
        relative p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer
        ${getColor(notification)}
        ${!notification.read ? 'shadow-sm' : 'opacity-75'}
      `}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start space-x-3">
        <div className="mt-1">
          {getIcon(notification)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-4">
              {notification.title}
            </h4>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge 
                className={`text-xs ${getCategoryBadgeColor(notification.category)}`}
              >
                {notification.category}
              </Badge>
              
              {notification.priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
