import Toast from '@/components/Toast';
import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                setToastMessage('Security token not found. Please refresh the page.');
                setToastType('error');
                setShowToast(true);
                return;
            }

            const response = await fetch(`/seller/orders/${order.id}/confirm`, {
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

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.visit('/seller/orders')}
                            className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md hover:ring-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            Back to Orders
                        </button>
                    </div>

                    {/* Order Header */}
                    <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 shadow-gray-100 ring-gray-100">
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-start gap-5">
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                                            order.status === 'pending'
                                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                                                : order.status === 'confirmed'
                                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                  : order.status === 'completed'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                                        }`}
                                    >
                                        {order.status === 'pending' && <Clock className="h-8 w-8 text-white" />}
                                        {order.status === 'confirmed' && <Truck className="h-8 w-8 text-white" />}
                                        {order.status === 'completed' && <CheckCircle className="h-8 w-8 text-white" />}
                                        {order.status === 'cancelled' && <XCircle className="h-8 w-8 text-white" />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
                                                Order #{order.id}
                                            </h1>
                                            <span
                                                className={`rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase shadow-sm ${getStatusColor(order.status)}`}
                                            >
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {order.updated_at !== order.created_at && (
                                                <span className="flex items-center gap-1.5 text-gray-400">
                                                    Updated:{' '}
                                                    {new Date(order.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{formatPeso(order.total_amount)}</p>
                                        <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                                            {order.payment_method} •{' '}
                                            <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                                                {order.payment_status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {order.status === 'cancelled' && order.rejection_reason && (
                            <div className="border-t border-red-100 bg-gradient-to-r from-red-50 to-rose-50 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-800">Cancellation Reason</h4>
                                        <p className="mt-1 text-red-700">{order.rejection_reason}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Customer Information */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-gray-100 ring-gray-100">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    Customer Information
                                </h2>
                            </div>
                            <div className="space-y-4 p-6">
                                <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Full Name</p>
                                        <p className="mt-0.5 font-semibold text-gray-900">{order.buyer.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Email Address</p>
                                        <p className="mt-0.5 truncate font-semibold text-gray-900">{order.buyer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Phone Number</p>
                                        <p className="mt-0.5 font-semibold text-gray-900">{order.delivery_phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-gray-100 ring-gray-100">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                                        <Truck className="h-5 w-5 text-white" />
                                    </div>
                                    Delivery Information
                                </h2>
                            </div>
                            <div className="space-y-4 p-6">
                                <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Delivery Address</p>
                                        <p className="mt-0.5 font-semibold text-gray-900">{order.delivery_address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <Phone className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Contact Number</p>
                                        <p className="mt-0.5 font-semibold text-gray-900">{order.delivery_phone}</p>
                                    </div>
                                </div>
                                {order.delivery_notes && (
                                    <div className="flex items-start gap-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                            <FileText className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium tracking-wide text-amber-700 uppercase">Special Instructions</p>
                                            <p className="mt-0.5 font-semibold text-amber-900">{order.delivery_notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-gray-100 ring-gray-100">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    Order Items
                                </h2>
                                <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200">
                                    {order.order_items.length} {order.order_items.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4 p-6">
                            {order.order_items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-5 rounded-xl bg-gradient-to-r from-gray-50 to-white p-5 ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-purple-200"
                                >
                                    {item.product_image ? (
                                        <img
                                            src={`/storage/${item.product_image}`}
                                            alt={item.product_name}
                                            className="h-24 w-24 rounded-xl object-cover shadow-md ring-2 ring-white"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md">
                                            <Package className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-lg font-bold text-gray-900">{item.product_name}</h3>
                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                                Qty: {item.quantity}
                                            </span>
                                            <span className="text-sm text-gray-500">× {formatPeso(item.price)} each</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">{formatPeso(item.total)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Total */}
                        <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-600">Order Total</span>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
                                    {formatPeso(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-gray-100 ring-gray-100">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">Order Actions</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-4">
                                {order.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={handleConfirmOrder}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:shadow-green-300"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                            Confirm Order
                                        </button>
                                        <button
                                            onClick={handleRejectOrder}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-300"
                                        >
                                            <XCircle className="h-5 w-5" />
                                            Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <>
                                        <button
                                            onClick={handleCompleteOrder}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300"
                                        >
                                            <Package className="h-5 w-5" />
                                            Mark as Delivered
                                        </button>
                                        <button
                                            onClick={handleRejectOrder}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-300"
                                        >
                                            <XCircle className="h-5 w-5" />
                                            Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'completed' && (
                                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 ring-1 ring-emerald-200">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-bold text-emerald-700">Order Completed Successfully</span>
                                    </div>
                                )}

                                {order.status === 'cancelled' && (
                                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 ring-1 ring-red-200">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-bold text-red-700">Order Cancelled</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Toast Notification */}
                    {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
                </div>
            </div>
        </AppLayout>
    );
}
