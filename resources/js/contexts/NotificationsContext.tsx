import { router } from '@inertiajs/react';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
}: {
    children: React.ReactNode;
    initialUnreadCount?: number;
    userRole?: string;
}) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

    // Update unread count when initialUnreadCount prop changes
    useEffect(() => {
        setUnreadCount(initialUnreadCount);
    }, [initialUnreadCount]);

    const refreshUnreadCount = () => {
        // Reload the current page to get fresh data
        router.reload({ only: ['unreadNotificationsCount'] });
    };

    const clearBadge = () => {
        setUnreadCount(0);
    };

    const markAsRead = (notificationId: string) => {
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';
        
        router.post(
            `/${baseRoute}/notifications/${notificationId}/read`,
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    // Page will reload automatically, updating the notification state
                },
                onError: (errors) => {
                    console.error('Error marking notification as read:', errors);
                },
            }
        );
    };

    const markAllAsRead = () => {
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';
        
        router.post(
            `/${baseRoute}/notifications/read-all`,
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    // Page will reload automatically, updating all notifications
                },
                onError: (errors) => {
                    console.error('Error marking all notifications as read:', errors);
                },
            }
        );
    };

    // Listen for route changes to refresh notification count
    useEffect(() => {
        const handleRouteChange = () => {
            // Count will be updated automatically through usePage props
            // No need for explicit refresh since we're using shared data
        };

        // Listen to Inertia navigation events
        const removeListener = router.on('navigate', handleRouteChange);

        return removeListener;
    }, []);

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
