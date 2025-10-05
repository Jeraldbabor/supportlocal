import { Head, router } from '@inertiajs/react';
import { Package, Clock, CheckCircle, XCircle, Eye, User, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import Toast from '@/components/Toast';

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
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Orders({ orders }: OrdersProps) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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
        } catch (error) {
            setToastMessage('An error occurred while confirming the order.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRejectOrder = async (orderId: number) => {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        try {
            const response = await fetch(`/seller/orders/${orderId}/reject`, {
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
                // Refresh the page to update order status
                router.reload();
            } else {
                setToastMessage(data.message || 'Failed to cancel order.');
                setToastType('error');
                setShowToast(true);
            }
        } catch (error) {
            setToastMessage('An error occurred while cancelling the order.');
            setToastType('error');
            setShowToast(true);
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
            } catch (error) {
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
                    <div className="text-center py-12">
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
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(order.status)}
                                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatPeso(order.total_amount)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.payment_method.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mt-4 border-b border-gray-200 pb-4">
                                    <h4 className="mb-2 font-medium text-gray-900 flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Customer Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><span className="font-medium">Name:</span> {order.buyer.name}</p>
                                            <p><span className="font-medium">Email:</span> {order.buyer.email}</p>
                                            <p><span className="font-medium">Phone:</span> {order.delivery_phone}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-medium">Delivery Address:</span></p>
                                            <p className="text-gray-600">{order.delivery_address}</p>
                                            {order.delivery_notes && (
                                                <p className="mt-1"><span className="font-medium">Notes:</span> {order.delivery_notes}</p>
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
                                                <img
                                                    src={item.product_image ? `/storage/${item.product_image}` : '/placeholder.jpg'}
                                                    alt={item.product_name}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
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
                                            onClick={() => router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
}