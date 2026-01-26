import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationsProvider, useNotifications } from '@/contexts/NotificationsContext';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Bell, Check, Clock, Filter, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title?: string;
        message?: string;
        action_url?: string;
        order_id?: number;
        admin_notes?: string;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

interface NotificationsProps {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

function NotificationsContent({ notifications }: NotificationsProps) {
    const { markAsRead, markAllAsRead, refreshUnreadCount } = useNotifications();
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    // Check if notification is read (either from server or locally marked)
    const isRead = useCallback(
        (notification: Notification) => {
            return notification.read_at !== null || localReadIds.has(notification.id);
        },
        [localReadIds],
    );

    const handleMarkAsRead = (notificationId: string) => {
        // Immediately update local state for instant feedback
        setLocalReadIds((prev) => new Set(prev).add(notificationId));
        markAsRead(notificationId);
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read first (with immediate visual feedback)
        if (!isRead(notification)) {
            setLocalReadIds((prev) => new Set(prev).add(notification.id));
            markAsRead(notification.id);
        }

        // Navigate to the action URL if it exists
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
    };

    const handleMarkAllAsReadLocal = () => {
        // Mark all as read locally for instant feedback
        const allIds = new Set(notifications.data.map((n) => n.id));
        setLocalReadIds(allIds);
        markAllAsRead();
    };

    const handleClearAllHistory = () => {
        setIsClearing(true);
        router.post(
            '/buyer/notifications/clear-all',
            {},
            {
                preserveState: false, // Reload the page to show empty state
                onFinish: () => {
                    setIsClearing(false);
                    setShowClearAllConfirm(false);
                    refreshUnreadCount(); // Update the notification count
                },
            },
        );
    };

    const handleDeleteNotification = (notificationId: string) => {
        setDeletingId(notificationId);
        router.delete(`/buyer/notifications/${notificationId}`, {
            preserveState: false,
            onFinish: () => {
                setDeletingId(null);
                setShowDeleteConfirm(null);
                refreshUnreadCount();
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'App\\Notifications\\OrderStatusUpdated':
                return <Bell className="h-5 w-5" style={{ color: '#b45309' }} />;
            case 'App\\Notifications\\ProductRatingReplyReceived':
                return <Bell className="h-5 w-5" style={{ color: '#2563eb' }} />;
            case 'App\\Notifications\\SellerRatingReplyReceived':
                return <Bell className="h-5 w-5" style={{ color: '#ca8a04' }} />;
            default:
                return <Bell className="h-5 w-5" style={{ color: '#4b5563' }} />;
        }
    };

    // Calculate unread count considering local state
    const unreadCount = notifications.data.filter((n) => !isRead(n)).length;

    // Filter notifications based on selected filter
    const filteredNotifications = useMemo(() => {
        switch (filter) {
            case 'unread':
                return notifications.data.filter((n) => !isRead(n));
            case 'read':
                return notifications.data.filter((n) => isRead(n));
            default:
                return notifications.data;
        }
    }, [notifications.data, filter, isRead]);

    return (
        <BuyerLayout>
            <Head title="Notifications" />

            <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8" style={{ colorScheme: 'light' }}>
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
                        {/* Mobile: Stack vertically */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Bell className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#b45309' }} />
                                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">{unreadCount} unread</span>
                                )}
                            </div>

                            {/* Controls - Responsive */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {/* Filter Dropdown */}
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Filter className="h-4 w-4" style={{ color: '#6b7280' }} />
                                    <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
                                        <SelectTrigger className="h-8 w-[120px] border-gray-300 bg-white text-gray-700 sm:h-9 sm:w-[140px]">
                                            <SelectValue placeholder="Filter" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">All Notifications</SelectItem>
                                            <SelectItem value="unread">Unread Only</SelectItem>
                                            <SelectItem value="read">Read Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {notifications.data.length > 0 && (
                                    <button
                                        onClick={() => setShowClearAllConfirm(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 sm:gap-2 sm:px-3 sm:text-sm"
                                        disabled={isClearing}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#b91c1c' }} />
                                        <span className="hidden sm:inline">Clear All History</span>
                                        <span className="sm:hidden">Clear All</span>
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsReadLocal}
                                        className="text-xs font-medium text-amber-700 hover:text-amber-900 sm:text-sm"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-center sm:px-6 sm:py-12">
                                <Bell className="mx-auto h-10 w-10 sm:h-12 sm:w-12" style={{ color: '#9ca3af' }} />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {filter === 'unread'
                                        ? 'No unread notifications'
                                        : filter === 'read'
                                          ? 'No read notifications'
                                          : 'No notifications'}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    {filter === 'unread'
                                        ? "You're all caught up! No unread notifications."
                                        : filter === 'read'
                                          ? 'No read notifications yet.'
                                          : "You're all caught up! New notifications will appear here."}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-3 py-3 transition-all duration-200 sm:px-6 sm:py-4 ${
                                        !isRead(notification)
                                            ? 'border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
                                            : 'border-l-4 border-transparent hover:bg-gray-50'
                                    } ${notification.data.action_url ? 'cursor-pointer' : ''}`}
                                    onClick={() => notification.data.action_url && handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="mt-0.5 flex-shrink-0 sm:mt-1">{getNotificationIcon(notification.type)}</div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{notification.data.title || 'Notification'}</p>
                                                    <p className="mt-0.5 text-sm text-gray-700 sm:mt-1">
                                                        {notification.data.message || 'No message'}
                                                    </p>
                                                    {notification.data.admin_notes && (
                                                        <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 sm:p-3">
                                                            <p className="mb-1 text-xs font-semibold text-blue-900">Note from Admin:</p>
                                                            <p className="text-xs text-blue-800 sm:text-sm">{notification.data.admin_notes}</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-1.5 flex items-center text-xs text-gray-500 sm:mt-2">
                                                        <Clock className="mr-1 h-3 w-3" style={{ color: '#6b7280' }} />
                                                        {formatDate(notification.created_at)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 sm:flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteConfirm(notification.id);
                                                        }}
                                                        disabled={deletingId === notification.id}
                                                        className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                                        title="Delete notification"
                                                    >
                                                        <X className="h-4 w-4" style={{ color: '#ef4444' }} />
                                                    </button>
                                                    {!isRead(notification) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                            className="text-xs font-medium whitespace-nowrap text-amber-700 hover:text-amber-900"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    {isRead(notification) && (
                                                        <span className="flex items-center text-xs whitespace-nowrap text-green-600">
                                                            <Check className="mr-1 h-3 w-3" style={{ color: '#16a34a' }} />
                                                            Read
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <div className="border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-gray-700 sm:text-sm">
                                    Showing {filteredNotifications.length} of {notifications.total} (page {notifications.current_page} of{' '}
                                    {notifications.last_page})
                                </div>
                                <div className="flex gap-2">
                                    {notifications.current_page > 1 && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page - 1 })}
                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {notifications.current_page < notifications.last_page && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page + 1 })}
                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear All History Confirmation Dialog */}
                {showClearAllConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div
                            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-6"
                            style={{ colorScheme: 'light' }}
                        >
                            <div className="mb-3 flex items-center sm:mb-4">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#dc2626' }} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">Clear All History</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 sm:text-sm">
                                    Are you sure you want to clear all your notification history? This will permanently delete all notifications (read
                                    and unread). This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowClearAllConfirm(false)}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm"
                                    disabled={isClearing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllHistory}
                                    className="rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                                    disabled={isClearing}
                                >
                                    {isClearing ? 'Clearing...' : 'Clear All'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div
                            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-6"
                            style={{ colorScheme: 'light' }}
                        >
                            <div className="mb-3 flex items-center sm:mb-4">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#dc2626' }} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">Delete Notification</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 sm:text-sm">
                                    Are you sure you want to delete this notification? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm"
                                    disabled={deletingId !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteNotification(showDeleteConfirm)}
                                    className="rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                                    disabled={deletingId !== null}
                                >
                                    {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}

export default function NotificationsIndex({ notifications }: NotificationsProps) {
    const { props } = usePage<{ unreadNotificationsCount?: number; auth: { user: { id: number; role: string } } }>();
    const unreadNotificationsCount = props.unreadNotificationsCount || 0;
    const userRole = props.auth?.user?.role || 'buyer';
    const userId = props.auth?.user?.id;

    return (
        <NotificationsProvider initialUnreadCount={unreadNotificationsCount} userRole={userRole} userId={userId}>
            <NotificationsContent notifications={notifications} />
        </NotificationsProvider>
    );
}
