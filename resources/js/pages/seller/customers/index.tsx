import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatPeso } from '@/utils/currency';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Eye,
    Mail,
    Phone,
    Repeat,
    Search,
    ShoppingBag,
    TrendingUp,
    User,
    Users,
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
        router.get(
            '/seller/customers',
            {
                search: searchTerm,
                sort: sortBy,
                order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        setSortBy(field);
        setSortOrder(newOrder);

        router.get(
            '/seller/customers',
            {
                search: searchTerm,
                sort: field,
                order: newOrder,
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
            className="flex items-center gap-1 text-left font-medium text-gray-900 transition-colors hover:text-blue-600"
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

            <div className="space-y-6 py-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and view information about your customers and their order history.</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Customers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.total_customers}</dd>
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
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Revenue</dt>
                                        <dd className="text-lg font-medium text-gray-900">₱{statistics.total_revenue}</dd>
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
                                    <Repeat className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Repeat Customers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.repeat_customers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Repeat Rate</dt>
                                        <dd className="text-lg font-medium text-gray-900">{statistics.repeat_rate}%</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-lg bg-white shadow">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search customers by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Customers ({customers.total})</h3>
                    </div>

                    {customers.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            <SortButton field="name">Customer</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Contact Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            <SortButton field="total_orders">Total Orders</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            <SortButton field="total_spent">Total Spent</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            <SortButton field="last_order">Last Order</SortButton>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full" src={customer.avatar_url} alt={customer.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
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
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            {customer.phone_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <ShoppingBag className="mr-2 h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{customer.total_orders}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{formatPeso(customer.total_spent)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.last_order_date ? (
                                                    <div>
                                                        <div className="text-sm text-gray-900">{formatDate(customer.last_order_date)}</div>
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(customer.last_order_status)}`}
                                                        >
                                                            {customer.last_order_status}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">No orders</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <Link
                                                    href={`/seller/customers/${customer.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-900"
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
                        <div className="py-12 text-center">
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search criteria.' : "You don't have any customers yet."}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {customers.links[0].url && (
                                    <Link
                                        href={customers.links[0].url}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {customers.links[customers.links.length - 1].url && (
                                    <Link
                                        href={customers.links[customers.links.length - 1].url!}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(customers.current_page - 1) * 15 + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(customers.current_page * 15, customers.total)}</span> of{' '}
                                        <span className="font-medium">{customers.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        {customers.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                                        : link.url
                                                          ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                          : 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                                                } ${index === 0 ? 'rounded-l-md' : ''} ${index === customers.links.length - 1 ? 'rounded-r-md' : ''}`}
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
