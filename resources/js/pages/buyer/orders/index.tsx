import BuyerLayout from '@/layouts/BuyerLayout';
import { formatPeso } from '@/utils/currency';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Clock, Eye, MessageSquare, Package, Trash2, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
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
    const [isDeleting, setIsDeleting] = useState(false);

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

    const canDelete = (status: string) => {
        return ['cancelled', 'delivered'].includes(status);
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'confirmed':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'shipped':
                return <Package className="h-5 w-5 text-purple-500" />;
            case 'delivered':
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
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!orders.data || orders.data.length === 0) {
        return (
            <BuyerLayout title="My Orders">
                <Head title="My Orders" />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 h-24 w-24 text-gray-400">
                            <Package className="h-full w-full" />
                        </div>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">No orders yet</h2>
                        <p className="mb-8 text-gray-600">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                        <Link
                            href="/buyer/products"
                            className="hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors"
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
        <BuyerLayout title="My Orders">
            <Head title="My Orders" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="mt-2 text-gray-600">Track and manage your orders</p>
                    </div>

                    {orders.data.some((order) => canDelete(order.status)) && (
                        <button
                            onClick={() => setShowClearAllConfirm(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All History
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {orders.data.map((order) => (
                        <div key={order.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            {/* Order Header */}
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_number}</h3>
                                            <p className="text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(order.status)}
                                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">{formatPeso(order.total_amount)}</div>
                                            <div className="text-sm text-gray-600">
                                                {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        {canDelete(order.status) && (
                                            <button
                                                onClick={() => setShowDeleteConfirm(order.id)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-300 bg-white text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                                disabled={isDeleting}
                                                title="Delete Order"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {item.product_image ? (
                                                    <img
                                                        src={`/storage/${item.product_image}`}
                                                        alt={item.product_name}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="line-clamp-1 text-sm font-medium text-gray-900">{item.product_name}</h4>
                                                <p className="text-sm text-gray-600">Sold by {item.seller_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item.quantity} × {formatPeso(item.price)}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">{formatPeso(item.total)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Payment:</span> {order.payment_method}
                                        </div>
                                        {order.seller_confirmed_at && <div className="text-sm text-green-600">✓ Confirmed by seller</div>}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Link
                                            href={`/buyer/orders/${order.id}`}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>

                                        {order.status === 'delivered' && (
                                            <button className="hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors">
                                                <MessageSquare className="h-4 w-4" />
                                                Leave Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {orders.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                    Are you sure you want to clear all your order history? This will permanently delete all cancelled and delivered
                                    orders. This action cannot be undone.
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
            </div>
        </BuyerLayout>
    );
}
