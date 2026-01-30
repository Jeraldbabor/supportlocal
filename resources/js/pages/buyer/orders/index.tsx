import BuyerLayout from '@/layouts/BuyerLayout';
import { formatPeso } from '@/utils/currency';
import { Head, Link, router } from '@inertiajs/react';
import { Ban, CheckCircle, Clock, Eye, MessageSquare, Package, Trash2, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    product_image_url?: string;
    seller_name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    shipping_address: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
    seller_confirmed_at: string | null;
    cancellation_reason?: string | null;
    cancelled_by?: string | null;
    cancelled_at?: string | null;
}

interface OrdersIndexProps {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Orders({ orders }: OrdersIndexProps) {
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleClearAllHistory = () => {
        setIsDeleting(true);
        router.post(
            '/buyer/orders/clear-all',
            {},
            {
                preserveState: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setShowClearAllConfirm(false);
                },
            },
        );
    };

    const handleDeleteOrder = (orderId: number) => {
        setIsDeleting(true);
        router.delete(`/buyer/orders/${orderId}`, {
            preserveState: true,
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteConfirm(null);
            },
        });
    };

    const handleCancelOrder = (orderId: number) => {
        if (!cancellationReason.trim()) {
            return;
        }
        setIsCancelling(true);
        router.post(
            `/buyer/orders/${orderId}/cancel`,
            { cancellation_reason: cancellationReason },
            {
                preserveState: true,
                onFinish: () => {
                    setIsCancelling(false);
                    setShowCancelConfirm(null);
                    setCancellationReason('');
                },
            },
        );
    };

    const canDelete = (status: string) => {
        return ['cancelled', 'delivered', 'completed'].includes(status);
    };

    const canCancel = (status: string) => {
        return status === 'pending';
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'confirmed':
                return <CheckCircle className="h-5 w-5 text-amber-600" />;
            case 'shipped':
                return <Package className="h-5 w-5 text-orange-600" />;
            case 'delivered':
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'shipped':
                return 'Shipped';
            case 'delivered':
                return 'Delivered';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300';
            case 'shipped':
                return 'bg-orange-100 text-orange-800 border border-orange-300';
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!orders.data || orders.data.length === 0) {
        return (
            <BuyerLayout>
                <Head title="My Orders" />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="py-12 text-center sm:py-16">
                        <div className="mx-auto mb-4 h-20 w-20 text-gray-300 sm:mb-6 sm:h-24 sm:w-24">
                            <Package className="h-full w-full" />
                        </div>
                        <h2 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">No orders yet</h2>
                        <p className="mx-auto mb-6 max-w-sm text-sm text-gray-600 sm:mb-8 sm:text-base">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                        </p>
                        <Link
                            href="/buyer/products"
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-medium text-white transition-colors hover:bg-orange-700 sm:px-6"
                        >
                            <Package className="h-5 w-5" />
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </BuyerLayout>
        );
    }

    return (
        <BuyerLayout>
            <Head title="My Orders" />

            <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
                        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Track and manage your orders</p>
                    </div>

                    {orders.data.some((order) => canDelete(order.status)) && (
                        <button
                            onClick={() => setShowClearAllConfirm(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All History
                        </button>
                    )}
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {orders.data.map((order) => (
                        <div key={order.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {/* Order Header */}
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Order Info */}
                                    <div className="flex items-start justify-between sm:block">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                                                Order #<span className="break-all">{order.order_number}</span>
                                            </h3>
                                            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* Mobile cancel button */}
                                        {canCancel(order.status) && (
                                            <button
                                                onClick={() => setShowCancelConfirm(order.id)}
                                                className="ml-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition-colors hover:bg-orange-50 sm:hidden"
                                                disabled={isCancelling}
                                                title="Cancel Order"
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        )}
                                        {/* Mobile delete button */}
                                        {canDelete(order.status) && (
                                            <button
                                                onClick={() => setShowDeleteConfirm(order.id)}
                                                className="ml-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-colors hover:bg-red-50 sm:hidden"
                                                disabled={isDeleting}
                                                title="Delete Order"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Status and Price Row */}
                                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            {getStatusIcon(order.status)}
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm ${getStatusColor(order.status)}`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-base font-bold text-gray-900 sm:text-lg">{formatPeso(order.total_amount)}</div>
                                                <div className="text-xs text-gray-500 sm:text-sm">
                                                    {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                                </div>
                                            </div>

                                            {/* Desktop cancel button */}
                                            {canCancel(order.status) && (
                                                <button
                                                    onClick={() => setShowCancelConfirm(order.id)}
                                                    className="hidden h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition-colors hover:bg-orange-50 hover:text-orange-700 sm:inline-flex"
                                                    disabled={isCancelling}
                                                    title="Cancel Order"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}
                                            {/* Desktop delete button */}
                                            {canDelete(order.status) && (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(order.id)}
                                                    className="hidden h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 sm:inline-flex"
                                                    disabled={isDeleting}
                                                    title="Delete Order"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-4 py-3 sm:px-6 sm:py-4">
                                <div className="space-y-3 sm:space-y-4">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 sm:items-center sm:gap-4">
                                            <div className="flex-shrink-0">
                                                {item.product_image ? (
                                                    <img
                                                        src={item.product_image_url || item.product_image}
                                                        alt={item.product_name}
                                                        className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.onerror = null;
                                                            target.src = '/placeholder.svg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 sm:h-16 sm:w-16">
                                                        <Package className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="line-clamp-2 text-sm font-medium text-gray-900">{item.product_name}</h4>
                                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">Sold by {item.seller_name}</p>
                                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                                    Quantity: {item.quantity} × {formatPeso(item.price)}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0 text-right">
                                                <div className="text-sm font-semibold text-gray-900">{formatPeso(item.total)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                    {/* Payment Info */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <div className="text-xs text-gray-600 sm:text-sm">
                                            <span className="font-medium">Payment:</span> <span className="capitalize">{order.payment_method}</span>
                                        </div>
                                        {order.seller_confirmed_at && (
                                            <div className="text-xs text-green-600 sm:text-sm">
                                                <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                                                Confirmed by seller
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <Link
                                            href={`/buyer/orders/${order.id}`}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:flex-none"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>

                                        {canCancel(order.status) && (
                                            <button
                                                onClick={() => setShowCancelConfirm(order.id)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-2.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 sm:flex-none"
                                                disabled={isCancelling}
                                            >
                                                <Ban className="h-4 w-4" />
                                                Cancel Order
                                            </button>
                                        )}

                                        {order.status === 'completed' && order.order_items?.length > 0 && (
                                            <Link
                                                href={`/buyer/product/${order.order_items[0].product_id}`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:flex-none"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Leave Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="mt-6 flex justify-center sm:mt-8">
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                            {orders.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                        link.active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear All History Confirmation Dialog */}
                {showClearAllConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Clear All History</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to clear all your order history? This will permanently delete all cancelled, delivered, and
                                    completed orders. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowClearAllConfirm(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllHistory}
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Clearing...' : 'Clear All'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Individual Order Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Delete Order</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">Are you sure you want to delete this order? This action cannot be undone.</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(showDeleteConfirm)}
                                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Order Confirmation Dialog */}
                {showCancelConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <Ban className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Cancel Order</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="mb-3 text-sm text-gray-600">
                                    Are you sure you want to cancel this order? Please provide a reason for cancellation.
                                </p>
                                <label htmlFor="cancellation_reason" className="mb-1 block text-sm font-medium text-gray-700">
                                    Reason for cancellation <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="cancellation_reason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Please tell us why you want to cancel this order..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 focus:outline-none"
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="mt-1 text-xs text-gray-500">{cancellationReason.length}/500 characters</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelConfirm(null);
                                        setCancellationReason('');
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={isCancelling}
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => handleCancelOrder(showCancelConfirm)}
                                    className="rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                    disabled={isCancelling || !cancellationReason.trim()}
                                >
                                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}
