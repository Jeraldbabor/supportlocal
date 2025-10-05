import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Bell, Clock, Check, Trash2, X } from 'lucide-react';
import { useNotifications, NotificationsProvider } from '@/contexts/NotificationsContext';

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
        router.post('/buyer/notifications/clear-all', {}, {
            preserveState: false, // Reload the page to show empty state
            onFinish: () => {
                setIsClearing(false);
                setShowClearAllConfirm(false);
                refreshUnreadCount(); // Update the notification count
            }
        });
    };

    const handleDeleteNotification = (notificationId: string) => {
        setDeletingId(notificationId);
        router.delete(`/buyer/notifications/${notificationId}`, {
            preserveState: false,
            onFinish: () => {
                setDeletingId(null);
                setShowDeleteConfirm(null);
                refreshUnreadCount();
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    return (
        <BuyerLayout>
            <Head title="Notifications" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Bell className="h-6 w-6 text-blue-600" />
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h1>
                                {unreadCount > 0 && (
                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
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
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                    No notifications
                                </h3>
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
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.data.title || 'Notification'}
                                                    </p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                        {notification.data.message || 'No message'}
                                                    </p>
                                                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDate(notification.created_at)}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(notification.id)}
                                                        disabled={deletingId === notification.id}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        title="Delete notification"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    {notification.read_at && (
                                                        <span className="text-green-600 text-xs flex items-center">
                                                            <Check className="h-3 w-3 mr-1" />
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
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page {notifications.current_page} of {notifications.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {notifications.current_page > 1 && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page - 1 })}
                                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {notifications.current_page < notifications.last_page && (
                                        <button
                                            onClick={() => router.get('/buyer/notifications', { page: notifications.current_page + 1 })}
                                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clear All History</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to clear all your notification history? This will permanently delete all notifications (read and unread). This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowClearAllConfirm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                                    disabled={isClearing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllHistory}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4">
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
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                                    disabled={deletingId !== null}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteNotification(showDeleteConfirm)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
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
        <NotificationsProvider 
            initialUnreadCount={unreadNotificationsCount}
            userRole={userRole}
        >
            <NotificationsContent notifications={notifications} />
        </NotificationsProvider>
    );
}