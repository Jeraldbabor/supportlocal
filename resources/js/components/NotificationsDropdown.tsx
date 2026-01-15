import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Bell, Check, FileText, Mail, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
    data: {
        sender_name?: string;
        sender_email?: string;
        subject?: string;
        applicant_name?: string;
        applicant_email?: string;
        business_type?: string;
        type?: string;
    };
}

interface NotificationsDropdownProps {
    userRole: string;
    initialUnreadCount?: number;
}

export default function NotificationsDropdown({ userRole, initialUnreadCount = 0 }: NotificationsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getNotificationRoute = () => {
        switch (userRole) {
            case 'seller':
                return '/seller/notifications';
            case 'administrator':
                return '/admin/notifications';
            case 'buyer':
                return '/buyer/notifications';
            default:
                return '/notifications';
        }
    };

    const getApiRoute = () => {
        switch (userRole) {
            case 'seller':
                return '/seller/notifications/recent';
            case 'administrator':
                return '/admin/notifications/recent';
            case 'buyer':
                return '/buyer/notifications/recent';
            default:
                return '/notifications/recent';
        }
    };

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(getApiRoute());
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } else {
                console.error('Failed to load notifications:', response.status);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userRole]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, loadNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: NotificationItem) => {
        if (notification.action_url) {
            // Mark as read if not already read
            if (!notification.read_at) {
                const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';
                router.post(`/${baseRoute}/notifications/${notification.id}/read`, {}, { preserveScroll: true });
            }
            router.visit(notification.action_url);
            setIsOpen(false);
        }
    };

    const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';
        router.post(
            `/${baseRoute}/notifications/${notificationId}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    loadNotifications();
                },
            },
        );
    };

    const handleMarkAllAsRead = () => {
        const baseRoute = userRole === 'seller' ? 'seller' : userRole === 'administrator' ? 'admin' : 'buyer';
        router.post(
            `/${baseRoute}/notifications/read-all`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    loadNotifications();
                },
            },
        );
    };

    const getNotificationIcon = (type: string) => {
        if (type.includes('NewContactMessageReceived')) {
            return <Mail className="h-4 w-4 text-blue-600" />;
        }
        if (type.includes('NewSellerApplicationSubmitted')) {
            return <FileText className="h-4 w-4 text-amber-600" />;
        }
        return <Bell className="h-4 w-4 text-gray-600" />;
    };

    const filteredNotifications = notifications.slice(0, 10); // Show latest 10

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group relative rounded-xl p-2.5 text-sidebar-foreground/60 transition-all duration-200 hover:scale-105 hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-95"
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 shadow-red-500/50 ring-background">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-[9998] bg-black/20 sm:hidden" onClick={() => setIsOpen(false)} />

                        {/* Dropdown Panel */}
                        <div className="fixed top-[4.5rem] right-2 z-[9999] w-[calc(100vw-1rem)] max-w-sm rounded-lg border border-gray-200 bg-white shadow-xl sm:absolute sm:top-auto sm:right-0 sm:z-50 sm:mt-2 sm:w-96 dark:border-gray-700 dark:bg-gray-800">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10 p-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <Badge variant="default" className="ml-2">
                                            {unreadCount} new
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
                                            <Check className="mr-1 h-3 w-3" />
                                            Mark all read
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-[500px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                        <p className="text-sm">No notifications</p>
                                        <p className="mt-1 text-xs">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`cursor-pointer p-4 transition-colors ${
                                                    !notification.read_at
                                                        ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                                                                    {notification.message}
                                                                </p>
                                                                {notification.data.sender_name && (
                                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        From: {notification.data.sender_name}
                                                                    </p>
                                                                )}
                                                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                                    {(() => {
                                                                        const date = new Date(notification.created_at);
                                                                        const now = new Date();
                                                                        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

                                                                        if (diffInSeconds < 60) return 'Just now';
                                                                        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                                                                        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                                                                        if (diffInSeconds < 604800)
                                                                            return `${Math.floor(diffInSeconds / 86400)}d ago`;
                                                                        return date.toLocaleDateString();
                                                                    })()}
                                                                </p>
                                                            </div>
                                                            {!notification.read_at && (
                                                                <button
                                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                    className="mt-1 flex-shrink-0 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                                    title="Mark as read"
                                                                >
                                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {filteredNotifications.length > 0 && (
                                <div className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setIsOpen(false);
                                            router.visit(getNotificationRoute());
                                        }}
                                    >
                                        View All Notifications
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
