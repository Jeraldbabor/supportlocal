import { useNotifications } from '@/contexts/NotificationsContext';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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

// Component that uses the notifications context - must be inside AppLayout
function NotificationsPageContent({ notifications }: NotificationsProps) {
    const { markAsRead, markAllAsRead } = useNotifications();
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const handleMarkAsRead = (notificationId: string) => {
        markAsRead(notificationId);
        router.reload();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        router.reload();
    };

    const handleClearAllHistory = () => {
        setIsClearing(true);
        router.post(
            '/seller/notifications/clear-all',
            {},
            {
                onFinish: () => {
                    setIsClearing(false);
                    setShowClearAllConfirm(false);
                },
            },
        );
    };

    const handleDeleteNotification = (notificationId: string) => {
        setDeletingId(notificationId);
        router.delete(`/seller/notifications/${notificationId}`, {
            onFinish: () => {
                setDeletingId(null);
                setShowDeleteConfirm(null);
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
            case 'new_order':
            case 'App\\Notifications\\NewOrderReceived':
                return <Bell className="h-5 w-5 text-blue-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-6 w-6 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">{unreadCount} unread</span>
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
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
                                >
                                    <Check className="h-4 w-4" />
                                    Mark All Read
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
                                You're all caught up! New order notifications will appear here.
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {notifications.total > notifications.per_page && (
                    <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {Math.min(notifications.current_page * notifications.per_page, notifications.total)} of {notifications.total}{' '}
                                notifications
                            </p>
                            <div className="flex space-x-2">
                                {notifications.current_page > 1 && (
                                    <button
                                        onClick={() => router.get(`/seller/notifications?page=${notifications.current_page - 1}`)}
                                        className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {notifications.current_page < notifications.last_page && (
                                    <button
                                        onClick={() => router.get(`/seller/notifications?page=${notifications.current_page + 1}`)}
                                        className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear All Confirmation Modal */}
            {showClearAllConfirm && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Clear All Notifications?</h3>
                        <p className="mb-6 text-sm text-gray-500">
                            This will permanently delete all your notifications. This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowClearAllConfirm(false)}
                                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Delete Notification?</h3>
                        <p className="mb-6 text-sm text-gray-500">Are you sure you want to delete this notification? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
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
    );
}

// Main page component that wraps everything in AppLayout
function NotificationsPage({ notifications }: NotificationsProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Seller Dashboard', href: '/seller/dashboard' },
                { title: 'Notifications', href: '/seller/notifications' },
            ]}
        >
            <Head title="Notifications" />
            <NotificationsPageContent notifications={notifications} />
        </AppLayout>
    );
}

export default function NotificationsIndex({ notifications }: NotificationsProps) {
    return <NotificationsPage notifications={notifications} />;
}
