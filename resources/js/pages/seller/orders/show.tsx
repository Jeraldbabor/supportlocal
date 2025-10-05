import Toast from '@/components/Toast';
import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, MapPin, Package, User, XCircle } from 'lucide-react';
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
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
    buyer: {
        id: number;
        name: string;
        email: string;
    };
}

interface OrderShowProps {
    order: Order;
}

export default function OrderShow({ order }: OrderShowProps) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-6 w-6 text-yellow-500" />;
            case 'confirmed':
                return <CheckCircle className="h-6 w-6 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-6 w-6 text-red-500" />;
            default:
                return <Package className="h-6 w-6 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleConfirmOrder = async () => {
        try {
            const response = await fetch(`/seller/orders/${order.id}/confirm`, {
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

    const handleRejectOrder = async () => {
        const reason = prompt('Please provide a reason for rejection (optional):');

        try {
            const response = await fetch(`/seller/orders/${order.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ rejection_reason: reason }),
            });

            const data = await response.json();

            if (data.success) {
                setToastMessage('Order cancelled successfully! Customer has been notified.');
                setToastType('success');
                setShowToast(true);
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
        }
    };

    const handleCompleteOrder = async () => {
        if (confirm('Mark this order as completed and delivered?')) {
            try {
                const response = await fetch(`/seller/orders/${order.id}/complete`, {
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
            <Head title={`Order #${order.id}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.visit('/seller/orders')}
                        className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </button>
                </div>

                {/* Order Header */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                                <p className="text-sm text-gray-600">
                                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                                {order.updated_at !== order.created_at && (
                                    <p className="text-sm text-gray-600">
                                        Last updated: {new Date(order.updated_at).toLocaleDateString()} at{' '}
                                        {new Date(order.updated_at).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <div className={`rounded-lg border px-4 py-2 ${getStatusColor(order.status)}`}>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(order.status)}
                                    <span className="text-lg font-semibold">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{formatPeso(order.total_amount)}</p>
                            <p className="text-sm text-gray-600">
                                {order.payment_method.toUpperCase()} • {order.payment_status}
                            </p>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {order.status === 'cancelled' && order.rejection_reason && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                            <h4 className="mb-2 font-medium text-red-800">Cancellation Reason:</h4>
                            <p className="text-red-700">{order.rejection_reason}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Customer Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                            <User className="mr-2 h-5 w-5" />
                            Customer Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Name</p>
                                <p className="text-gray-900">{order.buyer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email</p>
                                <p className="text-gray-900">{order.buyer.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Phone</p>
                                <p className="text-gray-900">{order.delivery_phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                            <MapPin className="mr-2 h-5 w-5" />
                            Delivery Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Address</p>
                                <p className="text-gray-900">{order.delivery_address}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Contact Number</p>
                                <p className="text-gray-900">{order.delivery_phone}</p>
                            </div>
                            {order.delivery_notes && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                                    <p className="text-gray-900">{order.delivery_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                        <Package className="mr-2 h-5 w-5" />
                        Order Items ({order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'})
                    </h2>
                    <div className="space-y-4">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-6 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                <img
                                    src={item.product_image ? `/storage/${item.product_image}` : '/placeholder.jpg'}
                                    alt={item.product_name}
                                    className="h-20 w-20 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="text-sm text-gray-600">Unit Price: {formatPeso(item.price)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">{formatPeso(item.total)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">Total: {formatPeso(order.total_amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Actions */}
                <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Actions</h2>
                    <div className="flex space-x-3">
                        {order.status === 'pending' && (
                            <>
                                <button
                                    onClick={handleConfirmOrder}
                                    className="inline-flex items-center rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Order
                                </button>
                                <button
                                    onClick={handleRejectOrder}
                                    className="inline-flex items-center rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </button>
                            </>
                        )}

                        {order.status === 'confirmed' && (
                            <>
                                <button
                                    onClick={handleCompleteOrder}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Mark as Delivered
                                </button>
                                <button
                                    onClick={handleRejectOrder}
                                    className="inline-flex items-center rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </button>
                            </>
                        )}

                        {order.status === 'completed' && (
                            <div className="flex items-center text-green-600">
                                <CheckCircle className="mr-2 h-5 w-5" />
                                <span className="font-medium">Order Completed Successfully</span>
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <div className="flex items-center text-red-600">
                                <XCircle className="mr-2 h-5 w-5" />
                                <span className="font-medium">Order Cancelled</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toast Notification */}
                {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
            </div>
        </AppLayout>
    );
}
