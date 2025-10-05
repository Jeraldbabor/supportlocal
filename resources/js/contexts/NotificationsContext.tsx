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

    const markAsRead = async (notificationId: string) => {
        try {
            const baseRoute = userRole === 'seller' ? '/seller' : '/buyer';
            const response = await fetch(`${baseRoute}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh the count after marking as read
            refreshUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const baseRoute = userRole === 'seller' ? '/seller' : '/buyer';
            const response = await fetch(`${baseRoute}/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Update local state immediately, then refresh from server
                setUnreadCount(0);
                refreshUnreadCount();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
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
