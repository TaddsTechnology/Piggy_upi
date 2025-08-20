import React from "react";
import { CheckCircle, AlertTriangle, Info, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  amount?: number;
  portfolio?: string;
  onClose?: () => void;
  duration?: number;
}

const InvestmentNotification = ({ 
  type, 
  title, 
  message, 
  amount, 
  portfolio, 
  onClose,
  duration = 5000 
}: NotificationProps) => {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full`}>
      <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
            
            {/* Investment Details */}
            {amount && portfolio && type === 'success' && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Investment:</span>
                  <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Portfolio:</span>
                  <span className="font-medium">{portfolio}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Your money is now working for you!</span>
                </div>
              </div>
            )}
          </div>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast notification manager
export class InvestmentToast {
  private static notifications: NotificationProps[] = [];
  private static listeners: ((notifications: NotificationProps[]) => void)[] = [];

  static subscribe(listener: (notifications: NotificationProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notify(notification: Omit<NotificationProps, 'onClose'>) {
    const id = Date.now();
    const notificationWithClose = {
      ...notification,
      onClose: () => this.remove(id)
    };

    this.notifications.push(notificationWithClose);
    this.notifyListeners();

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration || 5000);
    }
  }

  static remove(id: number) {
    this.notifications = this.notifications.filter((_, index) => index !== id);
    this.notifyListeners();
  }

  static success(title: string, message: string, options?: { amount?: number; portfolio?: string }) {
    this.notify({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  static error(title: string, message: string) {
    this.notify({
      type: 'error',
      title,
      message
    });
  }

  static warning(title: string, message: string) {
    this.notify({
      type: 'warning',
      title,
      message
    });
  }

  static info(title: string, message: string) {
    this.notify({
      type: 'info',
      title,
      message
    });
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

// Toast container component
export const InvestmentToastContainer = () => {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>([]);

  React.useEffect(() => {
    return InvestmentToast.subscribe(setNotifications);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <InvestmentNotification key={index} {...notification} />
      ))}
    </div>
  );
};

export default InvestmentNotification;
