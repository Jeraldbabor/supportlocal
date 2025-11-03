import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatPeso } from '@/utils/currency';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Eye, Mail, MapPin, Phone, ShoppingBag, TrendingUp } from 'lucide-react';

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
    address: string;
    avatar_url: string;
    created_at: string;
}

interface Statistics {
    total_orders: number;
    total_spent: string;
    average_order_value: string;
    first_order_date: string;
    last_order_date: string;
    order_statuses: Record<string, number>;
}

interface FavoriteProduct {
    id: number;
    name: string;
    images: string[];
    total_quantity: number;
    order_count: number;
}

interface CustomerShowProps {
    customer: Customer;
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    statistics: Statistics;
    favorite_products: FavoriteProduct[];
}

export default function CustomerShow({ customer, orders, statistics, favorite_products }: CustomerShowProps) {
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
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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
            <Head title={`Customer: ${customer.name}`} />

            <div className="space-y-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/seller/customers" className="p-2 text-gray-400 transition-colors hover:text-gray-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                            <p className="text-sm text-gray-600">View customer information and order history</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={`/seller/customers/${customer.id}/orders`}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            View All Orders
                        </Link>
                    </div>
                </div>

                {/* Customer Profile Card */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-6 py-4">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <img className="h-20 w-20 rounded-full" src={customer.avatar_url} alt={customer.name} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {customer.email}
                                    </div>
                                    {customer.phone_number && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="mr-2 h-4 w-4" />
                                            {customer.phone_number}
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {customer.address}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Customer since {formatDate(customer.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Orders</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.total_orders}</dd>
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
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Spent</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.total_spent}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Avg. Order Value</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.average_order_value}</dd>
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
                                        <dt className="truncate text-sm font-medium text-gray-500">Last Order</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {statistics.last_order_date ? formatDate(statistics.last_order_date) : 'None'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Order Status Breakdown */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Order Status Breakdown</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {Object.entries(statistics.order_statuses).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(status)}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{count} orders</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Favorite Products */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Favorite Products</h3>
                        </div>
                        <div className="p-6">
                            {favorite_products.length > 0 ? (
                                <div className="space-y-4">
                                    {favorite_products.map((product) => (
                                        <div key={product.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={getMainImage(product.images)}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {product.total_quantity} items in {product.order_count} orders
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No favorite products yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg bg-white shadow">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                        {orders.total > orders.data.length && (
                            <Link href={`/seller/customers/${customer.id}/orders`} className="text-sm text-blue-600 hover:text-blue-900">
                                View all {orders.total} orders
                            </Link>
                        )}
                    </div>

                    {orders.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
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
                                                <div className="text-sm font-medium text-gray-900">#{order.order_number || order.id}</div>
                                                <div className="text-sm text-gray-500">{order.payment_method.toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
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
                                                    View
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                            <p className="mt-1 text-sm text-gray-500">This customer hasn't placed any orders yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
