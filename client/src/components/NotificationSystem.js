import React, { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Vote,
  User,
  Calendar,
  Shield
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notification types
  const notificationTypes = {
    vote_cast: { icon: Vote, color: 'text-green-600', bgColor: 'bg-green-100' },
    user_registered: { icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    election_created: { icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    security_alert: { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-100' },
    system_update: { icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications
      const randomNotifications = [
        {
          id: Date.now(),
          type: 'vote_cast',
          title: 'New Vote Cast',
          message: 'A student has cast their vote in the Student Council Elections',
          timestamp: new Date(),
          read: false,
          priority: 'normal'
        },
        {
          id: Date.now() + 1,
          type: 'user_registered',
          title: 'New Registration',
          message: 'John Doe has registered and is awaiting approval',
          timestamp: new Date(),
          read: false,
          priority: 'normal'
        },
        {
          id: Date.now() + 2,
          type: 'election_created',
          title: 'Election Created',
          message: 'New election "Class Representative Elections" has been created',
          timestamp: new Date(),
          read: false,
          priority: 'high'
        },
        {
          id: Date.now() + 3,
          type: 'security_alert',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected from IP 192.168.1.100',
          timestamp: new Date(),
          read: false,
          priority: 'urgent'
        }
      ];

      // Randomly add notifications
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    const config = {
      duration: notification.priority === 'urgent' ? 8000 : 4000,
      position: 'top-right'
    };

    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.message, config);
        break;
      case 'high':
        toast.success(notification.message, config);
        break;
      default:
        toast(notification.message, config);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const config = notificationTypes[type] || notificationTypes.system_update;
    const Icon = config.icon;
    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  const getNotificationBgColor = (type) => {
    const config = notificationTypes[type] || notificationTypes.system_update;
    return config.bgColor;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const value = {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPanel 
        notifications={notifications}
        unreadCount={unreadCount}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        removeNotification={removeNotification}
        clearAllNotifications={clearAllNotifications}
        getNotificationIcon={getNotificationIcon}
        getNotificationBgColor={getNotificationBgColor}
        formatTimestamp={formatTimestamp}
      />
    </NotificationContext.Provider>
  );
};

const NotificationPanel = ({
  notifications,
  unreadCount,
  isOpen,
  setIsOpen,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  getNotificationIcon,
  getNotificationBgColor,
  formatTimestamp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.priority === 'urgent' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <button
                onClick={clearAllNotifications}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;
