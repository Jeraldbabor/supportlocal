import Toast from '@/components/Toast';
import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, Eye, Package, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string;
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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

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
            const response = await fetch(`/seller/orders/${orderId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
                    <p className="mt-2 text-gray-600">Review and manage your customer orders</p>
                </div>

                {orders.data.length === 0 ? (
                    <div className="py-12 text-center">
                        <Package className="mx-auto h-16 w-16 text-gray-300" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">No orders found</h2>
                        <p className="mt-2 text-gray-600">You haven't received any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.data.map((order) => (
                            <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                {/* Order Header */}
                                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                                            <p className="text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(order.status)}
                                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900">{formatPeso(order.total_amount)}</p>
                                        <p className="text-sm text-gray-600">{order.payment_method.toUpperCase()}</p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mt-4 border-b border-gray-200 pb-4">
                                    <h4 className="mb-2 flex items-center font-medium text-gray-900">
                                        <User className="mr-2 h-4 w-4" />
                                        Customer Information
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                        <div>
                                            <p>
                                                <span className="font-medium">Name:</span> {order.buyer.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span> {order.buyer.email}
                                            </p>
                                            <p>
                                                <span className="font-medium">Phone:</span> {order.delivery_phone}
                                            </p>
                                        </div>
                                        <div>
                                            <p>
                                                <span className="font-medium">Delivery Address:</span>
                                            </p>
                                            <p className="text-gray-600">{order.delivery_address}</p>
                                            {order.delivery_notes && (
                                                <p className="mt-1">
                                                    <span className="font-medium">Notes:</span> {order.delivery_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mt-4">
                                    <h4 className="mb-3 font-medium text-gray-900">Items Ordered</h4>
                                    <div className="space-y-3">
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-4">
                                                {item.product_image ? (
                                                    <img
                                                        src={`/storage/${item.product_image}`}
                                                        alt={item.product_name}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{formatPeso(item.total)}</p>
                                                    <p className="text-sm text-gray-500">{formatPeso(item.price)} each</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="mt-6 flex justify-between border-t border-gray-200 pt-4">
                                    <div className="flex space-x-3">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmOrder(order.id)}
                                                    className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Confirm Order
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOrder(order.id)}
                                                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Cancel Order
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'confirmed' && (
                                            <>
                                                <button
                                                    onClick={() => handleCompleteOrder(order.id)}
                                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                >
                                                    <Package className="mr-2 h-4 w-4" />
                                                    Mark as Delivered
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOrder(order.id)}
                                                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Cancel Order
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => router.visit(`/seller/orders/${order.id}`)}
                                        className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center">
                                <div className="flex space-x-1">
                                    {orders.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`rounded-md px-3 py-2 text-sm font-medium ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
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
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                            </div>

                            <p className="mb-4 text-gray-600">
                                Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified.
                            </p>

                            <div className="mb-4">
                                <label htmlFor="cancelReason" className="mb-2 block text-sm font-medium text-gray-700">
                                    Reason for cancellation (optional)
                                </label>
                                <textarea
                                    id="cancelReason"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Please provide a reason for cancelling this order..."
                                    rows={3}
                                    disabled={isCancelling}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCancelModal(null);
                                        setCancelReason('');
                                    }}
                                    className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
                                    disabled={isCancelling}
                                >
                                    Keep Order
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    disabled={isCancelling}
                                >
                                    {isCancelling && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
