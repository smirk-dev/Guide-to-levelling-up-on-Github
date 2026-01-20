'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelBadge } from '../ui/PixelComponents';
import { IconBell, IconCheck, IconStar, IconTrophy, IconScroll, IconBadge, IconClose } from '../icons/PixelIcons';
import { soundManager } from '@/lib/sound';

export type NotificationType = 'quest' | 'achievement' | 'badge' | 'rank' | 'xp' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoDismiss?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'quest':
      return <IconScroll size={20} color="#b8960f" />;
    case 'achievement':
      return <IconTrophy size={20} color="#ffd700" />;
    case 'badge':
      return <IconBadge size={20} color="#a371f7" />;
    case 'rank':
      return <IconStar size={20} color="#ffd700" />;
    case 'xp':
      return <IconStar size={20} color="#2ea043" />;
    default:
      return <IconBell size={20} color="#58a6ff" />;
  }
};

const getNotificationColor = (type: NotificationType): 'gold' | 'mana' | 'health' | 'purple' => {
  switch (type) {
    case 'quest':
      return 'gold';
    case 'achievement':
    case 'rank':
      return 'gold';
    case 'badge':
      return 'purple';
    case 'xp':
      return 'health';
    default:
      return 'mana';
  }
};

// Toast notification component for immediate display
const NotificationToast: React.FC<{
  notification: Notification;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (notification.autoDismiss !== false) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.autoDismiss, onDismiss]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="pointer-events-auto"
    >
      <PixelFrame variant={getNotificationColor(notification.type)} padding="sm">
        <div className="flex items-start gap-3 min-w-[280px] max-w-[360px]">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-pixel text-[10px] text-white mb-1 truncate">
              {notification.title}
            </h4>
            <p className="font-pixel text-[8px] text-[var(--gray-highlight)] line-clamp-2">
              {notification.message}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:opacity-70"
          >
            <IconClose size={12} color="var(--gray-medium)" />
          </button>
        </div>
      </PixelFrame>
    </motion.div>
  );
};

// Notification panel for viewing all notifications
export const NotificationPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--void-darkest)] border-l-4 border-[var(--gold-dark)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b-4 border-[var(--gray-dark)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBell size={24} color="#ffd700" />
              <h2 className="font-pixel text-[14px] text-[var(--gold-light)]">
                NOTIFICATIONS
              </h2>
              {unreadCount > 0 && (
                <PixelBadge variant="critical" size="sm">
                  {unreadCount}
                </PixelBadge>
              )}
            </div>
            <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-70 transition-opacity" aria-label="Close notifications">
              <IconClose size={16} color="var(--gray-medium)" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-b-2 border-[var(--gray-dark)] flex justify-between">
              <button
                onClick={markAllAsRead}
                className="font-pixel text-[8px] text-[var(--mana-light)] hover:underline"
              >
                MARK ALL READ
              </button>
              <button
                onClick={clearAll}
                className="font-pixel text-[8px] text-[var(--critical-light)] hover:underline"
              >
                CLEAR ALL
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="overflow-y-auto h-[calc(100%-120px)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <IconBell size={48} color="#484848" className="mx-auto mb-4" />
                <p className="font-pixel text-[10px] text-[var(--gray-medium)]">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`cursor-pointer ${!notification.read ? 'ring-2 ring-[var(--gold-medium)]' : ''}`}
                  >
                    <PixelFrame
                      variant={notification.read ? 'stone' : getNotificationColor(notification.type)}
                      padding="sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-pixel text-[9px] text-white truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[var(--gold-light)] flex-shrink-0" />
                            )}
                          </div>
                          <p className="font-pixel text-[7px] text-[var(--gray-highlight)] mb-2">
                            {notification.message}
                          </p>
                          <span className="font-pixel text-[6px] text-[var(--gray-medium)]">
                            {notification.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </PixelFrame>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
    setToastQueue((prev) => [...prev, newNotification]);

    // Play sound based on type
    if (notification.type === 'quest' || notification.type === 'achievement') {
      soundManager.questComplete();
    } else {
      soundManager.xpGain();
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toastQueue.slice(0, 3).map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissToast(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// Notification bell button component
export const NotificationBell: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-80 transition-opacity"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <IconBell size={24} color={unreadCount > 0 ? '#ffd700' : '#8b949e'} />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--critical-light)] border-2 border-[var(--void-darkest)]"
        >
          <span className="font-pixel text-[8px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </motion.div>
      )}
    </button>
  );
};
