import Toast from '@/components/Toast';
import AppLayout from '@/layouts/app-layout';
import Echo from '@/lib/echo';
import { formatPeso } from '@/utils/currency';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    CreditCard,
    Eye,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    product_image_url?: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string;
    delivery_method?: string;
    created_at: string;
    order_items: OrderItem[];
    buyer: {
        id: number;
        name: string;
        email: string;
    };
}

interface OrdersProps {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Orders({ orders }: OrdersProps) {
    const { auth } = usePage<{ auth?: { user?: { id: number } } }>().props;
    const userId = auth?.user?.id;
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!userId || !Echo) return;

        const channel = Echo.private(`App.Models.User.${userId}`);
        let reloadTimeout: ReturnType<typeof setTimeout> | null = null;

        const refreshOrders = () => {
            if (document.hidden) return;
            if (showCancelModal !== null || isCancelling) return;

            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }
            reloadTimeout = setTimeout(() => {
                router.reload({
                    only: ['orders'],
                });
            }, 250);
        };

        channel.notification((notification: { order_id?: number }) => {
            if (notification?.order_id) {
                refreshOrders();
            }
        });

        channel.listen(
            '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
            (event: { order_id?: number; data?: { order_id?: number } }) => {
                const orderId = event?.order_id ?? event?.data?.order_id;
                if (orderId) {
                    refreshOrders();
                }
            },
        );

        return () => {
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            Echo?.leave(`private-App.Models.User.${userId}`);
        };
    }, [userId, showCancelModal, isCancelling]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'confirmed':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleConfirmOrder = async (orderId: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                setToastMessage('Security token not found. Please refresh the page.');
                setToastType('error');
                setShowToast(true);
                return;
            }

            const response = await fetch(`/seller/orders/${orderId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await response.json();

            if (data.success) {
                setToastMessage('Order confirmed successfully! Customer has been notified.');
                setToastType('success');
                setShowToast(true);
                // Refresh the page to update order status
                router.reload();
            } else {
                setToastMessage(data.message || 'Failed to confirm order.');
                setToastType('error');
                setShowToast(true);
            }
        } catch {
            setToastMessage('An error occurred while confirming the order.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRejectOrder = (orderId: number) => {
        setShowCancelModal(orderId);
        setCancelReason('');
    };

    const handleConfirmCancel = async () => {
        if (!showCancelModal) return;

        setIsCancelling(true);

        try {
            const response = await fetch(`/seller/orders/${showCancelModal}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ rejection_reason: cancelReason }),
            });

            const data = await response.json();

            if (data.success) {
                setToastMessage('Order has been cancelled. Customer has been notified.');
                setToastType('error'); // Use error type for cancellation to indicate negative action
                setShowToast(true);
                setShowCancelModal(null);
                setCancelReason('');
                // Refresh the page to update order status
                router.reload();
            } else {
                setToastMessage(data.message || 'Failed to cancel order.');
                setToastType('error');
                setShowToast(true);
            }
        } catch {
            setToastMessage('An error occurred while cancelling the order.');
            setToastType('error');
            setShowToast(true);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCompleteOrder = async (orderId: number) => {
        if (confirm('Mark this order as completed and delivered?')) {
            try {
                const response = await fetch(`/seller/orders/${orderId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    setToastMessage('Order marked as completed! Customer has been notified.');
                    setToastType('success');
                    setShowToast(true);
                    // Refresh the page to update order status
                    router.reload();
                } else {
                    setToastMessage(data.message || 'Failed to complete order.');
                    setToastType('error');
                    setShowToast(true);
                }
            } catch {
                setToastMessage('An error occurred while completing the order.');
                setToastType('error');
                setShowToast(true);
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Manage Orders" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">
                                <ShoppingBag className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Order Management
                                </h1>
                                <p className="mt-1 text-gray-500">Review and process your customer orders</p>
                            </div>
                        </div>
                        {orders.total > 0 && (
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
                                <Package className="h-4 w-4" />
                                {orders.total} {orders.total === 1 ? 'Order' : 'Orders'} Total
                            </div>
                        )}
                    </div>

                    {orders.data.length === 0 ? (
                        <div className="rounded-3xl bg-white p-16 text-center shadow-xl ring-1 shadow-gray-100 ring-gray-100">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                                <Package className="h-12 w-12 text-gray-400" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">No orders yet</h2>
                            <p className="mt-2 text-gray-500">Your customer orders will appear here once you start receiving them.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-gray-100 ring-gray-100 transition-all duration-300 hover:shadow-xl hover:ring-gray-200"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                                                        order.status === 'pending'
                                                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                                                            : order.status === 'confirmed'
                                                              ? 'bg-gradient-to-br from-blue-100 to-indigo-100'
                                                              : order.status === 'completed'
                                                                ? 'bg-gradient-to-br from-emerald-100 to-green-100'
                                                                : 'bg-gradient-to-br from-red-100 to-rose-100'
                                                    }`}
                                                >
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase shadow-sm ${getStatusColor(order.status)}`}
                                                        >
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xl font-bold text-gray-900">{formatPeso(order.total_amount)}</p>
                                                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        {order.payment_method}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatPeso(order.subtotal)} + {formatPeso(order.shipping_fee || 0)} shipping
                                                    </p>
                                                    <span
                                                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.delivery_method === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}
                                                    >
                                                        {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="border-b border-gray-100 p-6">
                                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                                            <User className="h-4 w-4" />
                                            Customer Details
                                        </h4>
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-500">Name</p>
                                                    <p className="truncate font-semibold text-gray-900">{order.buyer.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-500">Email</p>
                                                    <p className="truncate font-semibold text-gray-900">{order.buyer.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                    <Phone className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-500">Phone</p>
                                                    <p className="font-semibold text-gray-900">{order.delivery_phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 sm:col-span-2 lg:col-span-1">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                                    <MapPin className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-500">Delivery Address</p>
                                                    <p className="line-clamp-2 font-semibold text-gray-900">{order.delivery_address}</p>
                                                    {order.delivery_notes && (
                                                        <p className="mt-1 text-xs text-gray-500 italic">Note: {order.delivery_notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                                                <Package className="h-4 w-4" />
                                                Order Items
                                            </h4>
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {order.order_items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group/item flex items-center gap-4 rounded-xl bg-gradient-to-r from-gray-50 to-white p-4 ring-1 ring-gray-100 transition-all hover:shadow-sm hover:ring-blue-200"
                                                >
                                                    {item.product_image ? (
                                                        <img
                                                            src={item.product_image_url || item.product_image}
                                                            alt={item.product_name}
                                                            className="h-16 w-16 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <h5 className="truncate font-semibold text-gray-900">{item.product_name}</h5>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            <span className="text-sm text-gray-500">× {formatPeso(item.price)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">{formatPeso(item.total)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-wrap gap-3">
                                            {order.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirmOrder(order.id)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200 transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:shadow-green-300"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Confirm Order
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOrder(order.id)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-300"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Cancel Order
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'confirmed' && (
                                                <>
                                                    <button
                                                        onClick={() => handleCompleteOrder(order.id)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300"
                                                    >
                                                        <Package className="h-4 w-4" />
                                                        Mark as Delivered
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOrder(order.id)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-300"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Cancel Order
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => router.visit(`/seller/orders/${order.id}`)}
                                            className="group/btn inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md hover:ring-gray-300"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {orders.last_page > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="inline-flex items-center gap-1 rounded-2xl bg-white p-2 shadow-lg ring-1 shadow-gray-100 ring-gray-100">
                                        {orders.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.visit(link.url)}
                                                disabled={!link.url}
                                                className={`min-w-[40px] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Toast Notification */}
                    {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

                    {/* Cancel Order Modal */}
                    {showCancelModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-rose-100 shadow-sm">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                                    </div>
                                </div>

                                <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
                                    The customer will be notified immediately about this cancellation.
                                </p>

                                <div className="mb-6">
                                    <label htmlFor="cancelReason" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Reason for cancellation (optional)
                                    </label>
                                    <textarea
                                        id="cancelReason"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full rounded-xl border-2 border-gray-200 p-4 text-gray-900 placeholder-gray-400 transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                        placeholder="e.g., Out of stock, Unable to deliver to this location..."
                                        rows={3}
                                        disabled={isCancelling}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCancelModal(null);
                                            setCancelReason('');
                                        }}
                                        className="flex-1 rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200"
                                        disabled={isCancelling}
                                    >
                                        Keep Order
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmCancel}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl disabled:opacity-50"
                                        disabled={isCancelling}
                                    >
                                        {isCancelling && (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        )}
                                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
