import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    data: {
        title?: string;
        message?: string;
        action_url?: string;
        url?: string; // Legacy field for backward compatibility
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsDropdownProps {
    userRole?: 'buyer' | 'seller' | 'administrator';
    buttonClassName?: string;
}

export default function NotificationsDropdown({ userRole = 'buyer', buttonClassName = '' }: NotificationsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { unreadCount, markAsRead, refreshUnreadCount } = useNotifications();

    const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/${baseRoute}/notifications/recent`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            } else {
                console.error('Failed to load notifications:', response.status);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [baseRoute]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, loadNotifications]);

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if unread
        if (!notification.read_at) {
            markAsRead(notification.id);
            // Optimistically update local state
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)));
        }

        // Navigate to action URL (check both action_url and legacy url field)
        const targetUrl = notification.data.action_url || notification.data.url;
        if (targetUrl) {
            router.visit(targetUrl);
            setIsOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = () => {
        router.post(
            `/${baseRoute}/notifications/read-all`,
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    refreshUnreadCount();
                    loadNotifications();
                },
            },
        );
    };

    const unreadNotifications = notifications.filter((n) => !n.read_at);
    const hasUnread = unreadCount > 0 || unreadNotifications.length > 0;

    return (
        <div className="relative" ref={dropdownRef} style={{ colorScheme: 'light' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={
                    buttonClassName ||
                    'group relative rounded-xl p-2 transition-all duration-300 hover:bg-orange-50 hover:shadow-sm focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none'
                }
                style={{ colorScheme: 'light' }}
                aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
            >
                <Bell className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" style={{ color: '#4b5563' }} />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-xs font-medium text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount || unreadNotifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile overlay */}
                    <div className="fixed inset-0 z-40 bg-black/20 sm:hidden" onClick={() => setIsOpen(false)} />

                    <div className="fixed top-16 right-2 left-2 z-50 mx-auto max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mx-0 sm:mt-2 sm:w-80">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {hasUnread && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-orange-600 hover:text-orange-700"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto sm:max-h-96">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Bell className="mb-2 h-8 w-8 text-gray-300" />
                                    <p className="text-sm text-gray-500">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => {
                                        const isUnread = !notification.read_at;
                                        return (
                                            <button
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full px-4 py-3 text-left transition-colors duration-200 ${
                                                    isUnread ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {isUnread && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>}
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.data.title || 'Notification'}
                                                        </p>
                                                        {notification.data.message && (
                                                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{notification.data.message}</p>
                                                        )}
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-3">
                                <Link
                                    href={`/${baseRoute}/notifications`}
                                    className="block w-full text-center text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
