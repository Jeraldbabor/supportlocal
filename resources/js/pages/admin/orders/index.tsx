import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Filter, MoreHorizontal, Search } from 'lucide-react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Management" />
            <div className="flex flex-col gap-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total Orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.this_month}</div>
                            <p className="text-xs text-muted-foreground">This Month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">₱{stats.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                        <p className="text-muted-foreground">View and manage all orders</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by order number, buyer, or seller..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-48">
                                <label className="text-sm font-medium">Status</label>
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
                                <Button onClick={handleSearch}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={() => router.get('/admin/orders')}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Buyer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{order.order_number}</div>
                                                <div className="text-sm text-muted-foreground">{order.items_count} items</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.buyer ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{order.buyer.name}</div>
                                                        <div className="text-xs text-muted-foreground">{order.buyer.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.seller ? (
                                                    <div className="text-sm">{order.seller.name}</div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">₱{order.total_amount.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={
                                                        order.status_color === 'green'
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status_color === 'yellow'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : order.status_color === 'red'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {order.status_label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/orders/${order.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
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
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {orders.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-md px-3 py-2 text-sm ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'border bg-background hover:bg-muted'
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
