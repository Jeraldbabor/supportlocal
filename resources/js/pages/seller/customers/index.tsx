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
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 text-left font-medium text-gray-700 transition-colors hover:text-orange-600"
        >
            {children}
            {sortBy === field ? (
                sortOrder === 'desc' ? (
                    <ChevronDown className="h-4 w-4" style={{ color: '#ea580c' }} />
                ) : (
                    <ChevronUp className="h-4 w-4" style={{ color: '#ea580c' }} />
                )
            ) : (
                <ArrowUpDown className="h-4 w-4" style={{ color: '#9ca3af' }} />
            )}
        </button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Customer Management</h1>
                    <p className="text-sm text-gray-600">Manage and view information about your customers and their order history.</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                <Users className="h-5 w-5" style={{ color: '#2563eb' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-gray-500">Total Customers</p>
                                <p className="text-lg font-bold text-gray-900">{statistics.total_customers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                                <DollarSign className="h-5 w-5" style={{ color: '#16a34a' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-gray-500">Total Revenue</p>
                                <p className="truncate text-lg font-bold text-gray-900">₱{statistics.total_revenue}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                                <TrendingUp className="h-5 w-5" style={{ color: '#9333ea' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-gray-500">Avg. Order Value</p>
                                <p className="truncate text-lg font-bold text-gray-900">₱{statistics.average_order_value}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <Repeat className="h-5 w-5" style={{ color: '#ea580c' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-gray-500">Repeat Customers</p>
                                <p className="text-lg font-bold text-gray-900">{statistics.repeat_customers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                                <TrendingUp className="h-5 w-5" style={{ color: '#4f46e5' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-gray-500">Repeat Rate</p>
                                <p className="text-lg font-bold text-gray-900">{statistics.repeat_rate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Search customers by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Customers Table/Cards */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Customers ({customers.total})</h3>
                    </div>

                    {customers.data.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto lg:block">
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
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {customers.data.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={customer.avatar_url}
                                                                alt={customer.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {customer.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-4 w-4" style={{ color: '#9ca3af' }} />
                                                            {customer.email}
                                                        </div>
                                                        {customer.phone_number && (
                                                            <div className="mt-1 flex items-center gap-1">
                                                                <Phone className="h-4 w-4" style={{ color: '#9ca3af' }} />
                                                                {customer.phone_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <ShoppingBag className="mr-2 h-4 w-4" style={{ color: '#9ca3af' }} />
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
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(customer.last_order_status)}`}
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
                                                        className="inline-flex items-center gap-1 text-orange-600 transition-colors hover:text-orange-700"
                                                    >
                                                        <Eye className="h-4 w-4" style={{ color: '#ea580c' }} />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="divide-y divide-gray-200 lg:hidden">
                                {customers.data.map((customer) => (
                                    <div key={customer.id} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                                    src={customer.avatar_url}
                                                    alt={customer.name}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                                    <p className="truncate text-xs text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/seller/customers/${customer.id}`}
                                                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors hover:bg-orange-200"
                                            >
                                                <Eye className="h-4 w-4" style={{ color: '#ea580c' }} />
                                            </Link>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Total Orders</p>
                                                <p className="font-medium text-gray-900">{customer.total_orders}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total Spent</p>
                                                <p className="font-medium text-gray-900">{formatPeso(customer.total_spent)}</p>
                                            </div>
                                            {customer.last_order_date && (
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500">Last Order</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-900">{formatDate(customer.last_order_date)}</span>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(customer.last_order_status)}`}
                                                        >
                                                            {customer.last_order_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <User className="mx-auto h-12 w-12" style={{ color: '#9ca3af' }} />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search criteria.' : "You don't have any customers yet."}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{(customers.current_page - 1) * 15 + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(customers.current_page * 15, customers.total)}</span> of{' '}
                                    <span className="font-medium">{customers.total}</span> results
                                </p>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {customers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded-lg px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-orange-500 text-white'
                                                    : link.url
                                                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
