import AppLayout from '@/layouts/app-layout';
import { formatPeso } from '@/utils/currency';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronDown, 
    ChevronUp, 
    Eye, 
    Search, 
    User, 
    Users, 
    ShoppingBag, 
    DollarSign,
    TrendingUp,
    Repeat,
    Mail,
    Phone,
    ArrowUpDown
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seller Dashboard',
        href: '/seller/dashboard',
    },
    {
        title: 'Customers',
        href: '/seller/customers',
    },
];

interface Customer {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    avatar_url: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
    last_order_status: string;
}

interface Statistics {
    total_customers: number;
    total_revenue: string;
    average_order_value: string;
    repeat_customers: number;
    repeat_rate: number;
}

interface Filters {
    search: string;
    sort: string;
    order: string;
    per_page: number;
}

interface CustomersProps {
    customers: {
        data: Customer[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: Filters;
}

export default function CustomersIndex({ customers, statistics, filters }: CustomersProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'total_orders');
    const [sortOrder, setSortOrder] = useState(filters.order || 'desc');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/seller/customers', {
            search: searchTerm,
            sort: sortBy,
            order: sortOrder,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        setSortBy(field);
        setSortOrder(newOrder);
        
        router.get('/seller/customers', {
            search: searchTerm,
            sort: field,
            order: newOrder,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
            {children}
            {sortBy === field ? (
                sortOrder === 'desc' ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronUp className="h-4 w-4" />
                )
            ) : (
                <ArrowUpDown className="h-4 w-4 opacity-40" />
            )}
        </button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />
            
            <div className="py-6 space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and view information about your customers and their order history.
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.total_customers}</dd>
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
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.total_revenue}</dd>
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
                                    <Repeat className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Repeat Customers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.repeat_customers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Repeat Rate</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.repeat_rate}%</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search customers by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Customers ({customers.total})</h3>
                    </div>
                    
                    {customers.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="name">Customer</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="total_orders">Total Orders</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="total_spent">Total Spent</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <SortButton field="last_order">Last Order</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src={customer.avatar_url}
                                                            alt={customer.name}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone_number && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            {customer.phone_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {customer.total_orders}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPeso(customer.total_spent)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.last_order_date ? (
                                                    <div>
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(customer.last_order_date)}
                                                        </div>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.last_order_status)}`}>
                                                            {customer.last_order_status}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">No orders</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/seller/customers/${customer.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search criteria.' : 'You don\'t have any customers yet.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {customers.links[0].url && (
                                    <Link
                                        href={customers.links[0].url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {customers.links[customers.links.length - 1].url && (
                                    <Link
                                        href={customers.links[customers.links.length - 1].url!}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {(customers.current_page - 1) * 15 + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {Math.min(customers.current_page * 15, customers.total)}
                                        </span>{' '}
                                        of <span className="font-medium">{customers.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {customers.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : link.url
                                                        ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                } ${
                                                    index === 0 ? 'rounded-l-md' : ''
                                                } ${
                                                    index === customers.links.length - 1 ? 'rounded-r-md' : ''
                                                }`}
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