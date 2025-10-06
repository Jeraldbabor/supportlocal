import Toast from '@/components/Toast';
import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    Mail, 
    Phone, 
    ShoppingBag, 
    User, 
    MapPin,
    Award,
    TrendingUp,
    Package,
    Eye,
    Star
} from 'lucide-react';
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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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
            day: 'numeric'
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
            return Array.isArray(parsedImages) && parsedImages.length > 0 
                ? `/storage/${parsedImages[0]}` 
                : '/images/placeholder-product.png';
        } catch {
            return '/images/placeholder-product.png';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${customer.name}`} />
            
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/seller/customers"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
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
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            View All Orders
                        </Link>
                    </div>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <img
                                    className="h-20 w-20 rounded-full"
                                    src={customer.avatar_url}
                                    alt={customer.name}
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {customer.email}
                                    </div>
                                    {customer.phone_number && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {customer.phone_number}
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {customer.address}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Customer since {formatDate(customer.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.total_orders}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.total_spent}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Avg. Order Value</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.average_order_value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Last Order</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {statistics.last_order_date ? formatDate(statistics.last_order_date) : 'None'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Status Breakdown */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Order Status Breakdown</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {Object.entries(statistics.order_statuses).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
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
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
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
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
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
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                        {orders.total > orders.data.length && (
                            <Link
                                href={`/seller/customers/${customer.id}/orders`}
                                className="text-sm text-blue-600 hover:text-blue-900"
                            >
                                View all {orders.total} orders
                            </Link>
                        )}
                    </div>
                    
                    {orders.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{order.order_number || order.id}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.payment_method.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(order.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPeso(order.total_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/seller/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors"
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
                        <div className="text-center py-12">
                            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                This customer hasn't placed any orders yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}