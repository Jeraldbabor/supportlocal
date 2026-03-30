import Echo from '@/lib/echo';
import { router } from '@inertiajs/react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface NotificationsContextType {
    unreadCount: number;
    refreshUnreadCount: () => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearBadge: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({
    children,
    initialUnreadCount = 0,
    userRole = 'buyer',
    userId,
}: {
    children: React.ReactNode;
    initialUnreadCount?: number;
    userRole?: string;
    userId?: number;
}) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    // Track navigation to force re-subscription of Echo channels
    const [navigationCount, setNavigationCount] = useState(0);

    // Update unread count when initialUnreadCount prop changes
    useEffect(() => {
        setUnreadCount(initialUnreadCount);
    }, [initialUnreadCount]);

    const refreshUnreadCount = useCallback(() => {
        // Reload the current page to get fresh data but preserve local UI state
        router.reload({ only: ['unreadNotificationsCount'] });
    }, []);

    const postNotificationAction = useCallback(async (url: string) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error(`Notification request failed: ${response.status}`);
        }

        return response.json();
    }, []);

    const clearBadge = () => {
        setUnreadCount(0);
    };

    const markAsRead = (notificationId: string) => {
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';

        // Optimistic update for immediate badge feedback
        setUnreadCount((prev) => Math.max(0, prev - 1));

        postNotificationAction(`/${baseRoute}/notifications/${notificationId}/read`)
            .then((data) => {
                if (typeof data?.unread_count === 'number') {
                    setUnreadCount(data.unread_count);
                }
            })
            .catch((error) => {
                console.error('Error marking notification as read:', error);
                refreshUnreadCount();
            });
    };

    const markAllAsRead = () => {
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';

        // Optimistic update for immediate badge feedback
        setUnreadCount(0);

        postNotificationAction(`/${baseRoute}/notifications/read-all`)
            .then((data) => {
                if (typeof data?.unread_count === 'number') {
                    setUnreadCount(data.unread_count);
                }
            })
            .catch((error) => {
                console.error('Error marking all notifications as read:', error);
                refreshUnreadCount();
            });
    };

    // Listen for Inertia navigation to trigger re-subscription
    useEffect(() => {
        const handleNavigate = () => {
            setNavigationCount((prev) => prev + 1);
        };

        const removeListener = router.on('navigate', handleNavigate);
        return () => {
            removeListener();
        };
    }, []);

    // Listen for real-time notifications via Echo/WebSocket
    // Re-subscribe after navigation to ensure fresh CSRF token authentication
    useEffect(() => {
        if (!userId || !Echo) return;

        // Subscribe to user's private notification channel
        const channel = Echo.private(`App.Models.User.${userId}`);

        // Listen for database notifications (Laravel's broadcast notification)
        channel.notification(() => {
            // Increment unread count when new notification arrives
            setUnreadCount((prev) => prev + 1);

            // Optionally refresh to get the full notification data
            // This ensures the notification list is updated if user is on the notifications page
            refreshUnreadCount();
        });

        // Also listen for custom notification events that might be broadcast
        channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', () => {
            setUnreadCount((prev) => prev + 1);
            refreshUnreadCount();
        });

        return () => {
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            Echo?.leave(`private-App.Models.User.${userId}`);
        };
    }, [userId, refreshUnreadCount, navigationCount]);

    return (
        <NotificationsContext.Provider
            value={{
                unreadCount,
                refreshUnreadCount,
                markAsRead,
                markAllAsRead,
                clearBadge,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
