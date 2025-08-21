// Rewards Notification Component
// Shows dynamic notifications for achievements, points, and level ups

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Star, Zap, TrendingUp, Trophy, Gift } from 'lucide-react';

interface NotificationProps {
  id: string;
  type: 'achievement' | 'points' | 'level_up' | 'streak';
  message: string;
  data?: any;
  timestamp: Date;
  onDismiss: (id: string) => void;
}

interface RewardsNotificationProps {
  notifications: NotificationProps[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ 
  id, 
  type, 
  message, 
  data, 
  timestamp, 
  onDismiss 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'points':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'streak':
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <Gift className="w-5 h-5 text-purple-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 'points':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
      case 'level_up':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'streak':
        return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
      default:
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <Card className={`${getBgColor()} shadow-md hover:shadow-lg transition-all duration-300 animate-in slide-in-from-right`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 mb-1">
                {message}
              </p>
              {data && (
                <div className="flex items-center gap-2 mb-2">
                  {data.points && (
                    <Badge variant="secondary" className="text-xs">
                      +{data.points} points
                    </Badge>
                  )}
                  {data.level && (
                    <Badge variant="outline" className="text-xs">
                      Level {data.level}
                    </Badge>
                  )}
                  {data.achievementName && (
                    <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      {data.achievementName}
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                {formatTime(timestamp)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200/50"
            onClick={() => onDismiss(id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const RewardsNotification: React.FC<RewardsNotificationProps> = ({
  notifications,
  onDismiss,
  onClearAll
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {notifications.length > 1 && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-xs bg-white/90 backdrop-blur-sm"
          >
            Clear all ({notifications.length})
          </Button>
        </div>
      )}
      
      {notifications.slice(0, 3).map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onDismiss={onDismiss}
        />
      ))}
      
      {notifications.length > 3 && (
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-600">
              +{notifications.length - 3} more notifications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Achievement Unlock Modal
interface AchievementModalProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    rewards: {
      points: number;
      badge?: string;
    };
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  achievement,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'from-purple-400 to-pink-500';
      case 'epic':
        return 'from-yellow-400 to-orange-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-green-400 to-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-md w-full bg-white shadow-2xl animate-in zoom-in-95">
        <CardContent className="p-6 text-center">
          {/* Achievement Icon */}
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRarityColor()} flex items-center justify-center shadow-lg animate-pulse`}>
            <span className="text-4xl">{achievement.icon}</span>
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          </div>
          
          {/* Achievement Details */}
          <Badge className={`mb-3 bg-gradient-to-r ${getRarityColor()} text-white`}>
            {achievement.rarity.toUpperCase()}
          </Badge>
          
          <h3 className="text-2xl font-bold mb-2">🎉 Achievement Unlocked!</h3>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {achievement.name}
          </h4>
          <p className="text-gray-600 mb-4">{achievement.description}</p>
          
          {/* Rewards */}
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-green-800 mb-2">Rewards Earned:</h5>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{achievement.rewards.points}
                </div>
                <div className="text-xs text-green-700">Points</div>
              </div>
              {achievement.rewards.badge && (
                <div className="text-center">
                  <div className="text-xl">🏆</div>
                  <div className="text-xs text-green-700">Badge</div>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Awesome! 🚀
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsNotification;
