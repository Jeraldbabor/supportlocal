import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Filter, MoreHorizontal, Package, Search, ShoppingCart } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    payment_method: string;
    buyer: { id: number; name: string; email: string } | null;
    seller: { id: number; name: string } | null;
    items_count: number;
    created_at: string;
}

interface Props {
    orders: {
        data: Order[];
        links: Array<{ url?: string; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        status?: string;
        seller_id?: string;
        buyer_id?: string;
        date_from?: string;
        date_to?: string;
    };
    statuses: Record<string, string>;
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        completed: number;
        cancelled: number;
        today: number;
        this_week: number;
        this_month: number;
        total_revenue: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
];

export default function OrdersIndex() {
    const { orders, filters, statuses, stats } = usePage<SharedData & Props>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get(
            '/admin/orders',
            {
                search: searchTerm,
                status: selectedStatus === 'all' ? '' : selectedStatus,
            },
            { preserveState: true, replace: true },
        );
    };

    const getStatusBadgeColor = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-100 text-green-800';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800';
            case 'red':
                return 'bg-red-100 text-red-800';
            case 'blue':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Management" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Total Orders</CardTitle>
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.completed}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.this_month}</div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2 transition-all duration-200 hover:shadow-md md:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">₱{stats.total_revenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order Management</h1>
                        <p className="mt-1 text-sm text-gray-500 sm:text-base">View and manage all orders</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                    <Input
                                        placeholder="Search by order number, buyer, or seller..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={() => router.get('/admin/orders')} className="flex-1 sm:flex-initial">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Order
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Buyer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Seller
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="transition-colors hover:bg-gray-50">
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="font-medium text-gray-900">{order.order_number}</div>
                                                <div className="text-sm text-gray-500">{order.items_count} items</div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                {order.buyer ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{order.buyer.name}</div>
                                                        <div className="text-xs text-gray-500">{order.buyer.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                {order.seller ? (
                                                    <div className="text-sm text-gray-900">{order.seller.name}</div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="font-medium text-gray-900">₱{order.total_amount.toLocaleString()}</div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <Badge className={getStatusBadgeColor(order.status_color)}>{order.status_label}</Badge>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <span className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" style={{ color: '#374151' }} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/orders/${order.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" style={{ color: '#374151' }} />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="space-y-3 p-4 md:hidden">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{order.order_number}</span>
                                                <Badge className={getStatusBadgeColor(order.status_color)}>{order.status_label}</Badge>
                                            </div>
                                            <div className="mt-2 space-y-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                    <span>{order.items_count} items</span>
                                                </div>
                                                {order.buyer && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Buyer:</span> {order.buyer.name}
                                                    </div>
                                                )}
                                                {order.seller && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Seller:</span> {order.seller.name}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-medium text-gray-700">Date:</span>{' '}
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-lg font-bold text-green-600">₱{order.total_amount.toLocaleString()}</div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 shrink-0 p-0">
                                                    <MoreHorizontal className="h-4 w-4" style={{ color: '#374151' }} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" style={{ color: '#374151' }} />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {orders.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-4 py-12">
                                <ShoppingCart className="mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                                <p className="mt-1 text-center text-sm text-gray-500">Try adjusting your filters</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                        {orders.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active
                                                ? 'bg-orange-500 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
