import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatPeso } from '@/utils/currency';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Eye, Filter, Package, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    total: number;
    product: {
        id: number;
        name: string;
        images: string[];
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_method: string;
    created_at: string;
    order_items: OrderItem[];
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    avatar_url: string;
}

interface Filters {
    status: string;
    sort: string;
    order: string;
    per_page: number;
}

interface CustomerOrdersProps {
    customer: Customer;
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: Filters;
    available_statuses: string[];
}

export default function CustomerOrders({ customer, orders, filters, available_statuses }: CustomerOrdersProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.order || 'desc');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Seller Dashboard',
            href: '/seller/dashboard',
        },
        {
            title: 'Customers',
            href: '/seller/customers',
        },
        {
            title: customer.name,
            href: `/seller/customers/${customer.id}`,
        },
        {
            title: 'Order History',
            href: `/seller/customers/${customer.id}/orders`,
        },
    ];

    const handleFilterChange = () => {
        router.get(
            `/seller/customers/${customer.id}/orders`,
            {
                status: statusFilter === 'all' ? '' : statusFilter,
                sort: sortBy,
                order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
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

    const getMainImage = (images: string[]) => {
        if (!images || images.length === 0) return '/images/placeholder-product.png';
        try {
            const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
            return Array.isArray(parsedImages) && parsedImages.length > 0 ? `/storage/${parsedImages[0]}` : '/images/placeholder-product.png';
        } catch {
            return '/images/placeholder-product.png';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${customer.name} - Order History`} />
            <div className="space-y-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/seller/customers/${customer.id}`} className="p-2 text-gray-400 transition-colors hover:text-gray-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                            <p className="text-sm text-gray-600">All orders from {customer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <img className="h-8 w-8 rounded-full" src={customer.avatar_url} alt={customer.name} />
                            <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Orders</dt>
                                        <dd className="text-lg font-medium text-gray-900">{orders.total}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Value</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatPeso(orders.data.reduce((sum, order) => sum + order.total_amount, 0))}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Items</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {orders.data.reduce((sum, order) => sum + order.order_items.length, 0)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Latest Order</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {orders.data.length > 0 ? formatDate(orders.data[0].created_at) : 'None'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white shadow">
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Filter by Status
                                </label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                                >
                                    <option value="all">All Statuses</option>
                                    {available_statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                                    Sort by
                                </label>
                                <select
                                    id="sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                                >
                                    <option value="created_at">Order Date</option>
                                    <option value="total_amount">Order Total</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                                    Order
                                </label>
                                <select
                                    id="order"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                            <div className="pt-6">
                                <button
                                    onClick={handleFilterChange}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Filter className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Orders ({orders.total})</h3>
                    </div>

                    {orders.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">Order #{order.order_number || order.id}</div>
                                                <div className="text-sm text-gray-500">{order.payment_method.toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-2">
                                                    {order.order_items.slice(0, 2).map((item) => (
                                                        <div key={item.id} className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    className="h-8 w-8 rounded object-cover"
                                                                    src={getMainImage(item.product.images)}
                                                                    alt={item.product.name}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm text-gray-900">{item.product.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {item.quantity} × {formatPeso(item.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.order_items.length > 2 && (
                                                        <p className="text-xs text-gray-500">+{order.order_items.length - 2} more items</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{formatPeso(order.total_amount)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <Link
                                                    href={`/seller/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Order
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {statusFilter === 'all'
                                    ? "This customer hasn't placed any orders yet."
                                    : `No orders with status "${statusFilter}" found.`}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {orders.links[0].url && (
                                    <Link
                                        href={orders.links[0].url}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {orders.links[orders.links.length - 1].url && (
                                    <Link
                                        href={orders.links[orders.links.length - 1].url!}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(orders.current_page - 1) * 15 + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(orders.current_page * 15, orders.total)}</span> of{' '}
                                        <span className="font-medium">{orders.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        {orders.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                                        : link.url
                                                          ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                          : 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                                                } ${index === 0 ? 'rounded-l-md' : ''} ${index === orders.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
