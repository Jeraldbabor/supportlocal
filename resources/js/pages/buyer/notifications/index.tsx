import { NotificationsProvider, useNotifications } from '@/contexts/NotificationsContext';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Bell, Check, Clock, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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

    const handleMarkAsRead = (notificationId: string) => {
        markAsRead(notificationId);
        // Optionally reload the page or update local state
        router.reload();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        router.reload();
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
                return <Bell className="h-5 w-5 text-blue-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    return (
        <BuyerLayout>
            <Head title="Notifications" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Bell className="h-6 w-6 text-blue-600" />
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                {notifications.data.length > 0 && (
                                    <button
                                        onClick={() => setShowClearAllConfirm(true)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                                        disabled={isClearing}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Clear All History
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.data.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    You're all caught up! New notifications will appear here.
                                </p>
                            </div>
                        ) : (
                            notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                        !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.data.title || 'Notification'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                        {notification.data.message || 'No message'}
                                                    </p>
                                                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {formatDate(notification.created_at)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(notification.id)}
                                                        disabled={deletingId === notification.id}
                                                        className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                                        title="Delete notification"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    {notification.read_at && (
                                                        <span className="flex items-center text-xs text-green-600">
                                                            <Check className="mr-1 h-3 w-3" />
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
                        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page {notifications.current_page} of {notifications.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {notifications.current_page > 1 && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page - 1 })}
                                            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {notifications.current_page < notifications.last_page && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page + 1 })}
                                            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
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
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clear All History</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to clear all your notification history? This will permanently delete all notifications (read
                                    and unread). This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowClearAllConfirm(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    disabled={isClearing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllHistory}
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Notification</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to delete this notification? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    disabled={deletingId !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteNotification(showDeleteConfirm)}
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
    const { props } = usePage<{ unreadNotificationsCount?: number; auth: { user: { role: string } } }>();
    const unreadNotificationsCount = props.unreadNotificationsCount || 0;
    const userRole = props.auth?.user?.role || 'buyer';

    return (
        <NotificationsProvider initialUnreadCount={unreadNotificationsCount} userRole={userRole}>
            <NotificationsContent notifications={notifications} />
        </NotificationsProvider>
    );
}
