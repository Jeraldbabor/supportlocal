import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Download, Eye, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Analytics',
        href: '/seller/analytics',
    },
];

interface AnalyticsProps {
    dateRange: string;
    overview: {
        total_revenue: number;
        revenue_growth: number;
        total_orders: number;
        orders_growth: number;
        total_customers: number;
        customers_growth: number;
        avg_order_value: number;
        avg_order_value_growth: number;
        conversion_rate: number;
    };
    revenue: {
        timeline: Array<{ period: string; revenue: number }>;
        by_status: Array<{ status: string; revenue: number; count: number }>;
    };
    orders: {
        timeline: Array<{ period: string; revenue: number; count: number }>;
        by_status: Array<{ status: string; count: number }>;
        by_payment_method: Array<{ method: string; count: number; revenue: number }>;
        avg_fulfillment_hours: number;
    };
    products: {
        total: number;
        active: number;
        added_in_period: number;
        by_status: Array<{ status: string; count: number }>;
        by_stock: Array<{ status: string; count: number }>;
        most_viewed: Array<{
            id: number;
            name: string;
            views: number;
            image: string | null;
        }>;
    };
    customers: {
        total: number;
        new: number;
        returning: number;
        retention_rate: number;
        avg_lifetime_value: number;
        top_customers: Array<{
            customer: {
                id: number;
                name: string;
                email: string;
                avatar: string;
            };
            order_count: number;
            total_spent: number;
            avg_order_value: number;
        }>;
    };
    topProducts: {
        by_revenue: Array<{
            product: {
                id: number;
                name: string;
                price: number;
                image: string | null;
            };
            quantity_sold: number;
            revenue: number;
        }>;
        by_quantity: Array<{
            product: {
                id: number;
                name: string;
                price: number;
                image: string | null;
            };
            quantity_sold: number;
            order_count: number;
        }>;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer: {
            id: number;
            name: string;
            email: string;
        };
        total_amount: number;
        status: string;
        status_label: string;
        items_count: number;
        created_at: string;
        created_at_human: string;
    }>;
}

export default function Analytics({ dateRange, overview, revenue, orders, products, customers, topProducts, recentOrders }: AnalyticsProps) {
    const [selectedRange, setSelectedRange] = useState(dateRange);

    const handleRangeChange = (value: string) => {
        setSelectedRange(value);
        router.get('/seller/analytics', { range: value }, { preserveState: true, preserveScroll: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="space-y-4 p-3 sm:p-4 md:space-y-6" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">Analytics</h1>
                        <p className="text-sm text-gray-500 md:text-base">Track your sales performance and business insights</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <Select value={selectedRange} onValueChange={handleRangeChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                                <SelectItem value="mtd">Month to date</SelectItem>
                                <SelectItem value="ytd">Year to date</SelectItem>
                                <SelectItem value="365">Last 12 months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                const format = window.prompt('Export format (csv or pdf):', 'csv');
                                if (format === 'csv' || format === 'pdf') {
                                    window.location.href = `/seller/analytics/export?format=${format}&range=${selectedRange}`;
                                }
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-900 sm:text-sm">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl">{formatCurrency(overview.total_revenue)}</div>
                            <div className="flex items-center text-xs text-gray-500">
                                {overview.revenue_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.revenue_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">from previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-900 sm:text-sm">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl">{formatNumber(overview.total_orders)}</div>
                            <div className="flex items-center text-xs text-gray-500">
                                {overview.orders_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.orders_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.orders_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">from previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-900 sm:text-sm">Customers</CardTitle>
                            <Users className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl">{formatNumber(overview.total_customers)}</div>
                            <div className="flex items-center text-xs text-gray-500">
                                {overview.customers_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.customers_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.customers_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">from previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-900 sm:text-sm">Avg. Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl">{formatCurrency(overview.avg_order_value)}</div>
                            <div className="flex items-center text-xs text-gray-500">
                                {overview.avg_order_value_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.avg_order_value_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.avg_order_value_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">from previous period</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                    <TrendingUp className="h-5 w-5" style={{ color: '#6b7280' }} />
                                    Revenue Timeline
                                </CardTitle>
                                <CardDescription className="text-gray-500">Track your earnings over the selected period</CardDescription>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className="text-sm text-gray-500">Total Revenue</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    {formatCurrency(revenue.timeline.reduce((sum, item) => sum + Number(item.revenue || 0), 0))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {revenue.timeline.length > 0 ? (
                            <div className="w-full" style={{ height: '300px', minHeight: '300px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenue.timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `₱${value / 1000}k`} />

                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                                            <p className="mb-1 text-sm font-medium text-gray-900">{label}</p>
                                                            <p className="text-lg font-bold text-blue-600">
                                                                {formatCurrency(payload[0].value as number)}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[300px] flex-col items-center justify-center">
                                <TrendingUp className="mb-3 h-12 w-12" style={{ color: '#d1d5db' }} />
                                <p className="text-sm text-gray-500">No revenue data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {/* Orders by Status */}
                    <Card className="border-2 border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <ShoppingCart className="h-5 w-5" style={{ color: '#9333ea' }} />
                                </div>
                                <div>
                                    <CardTitle className="text-base text-gray-900 sm:text-lg">Orders by Status</CardTitle>
                                    <CardDescription className="text-gray-500">Order distribution breakdown</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {orders.by_status.length > 0 ? (
                                <div className="w-full" style={{ height: '280px', minHeight: '280px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <defs>
                                                <filter id="shadow" height="200%">
                                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                                                </filter>
                                            </defs>
                                            <Pie
                                                data={orders.by_status}
                                                cx="50%"
                                                cy="45%"
                                                labelLine={{
                                                    stroke: '#6b7280',
                                                    strokeWidth: 1,
                                                }}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                label={(entry: any) => {
                                                    const percent = ((entry.percent || 0) * 100).toFixed(0);
                                                    return Number(percent) > 5 ? `${entry.status}\n${percent}%` : '';
                                                }}
                                                outerRadius={90}
                                                innerRadius={40}
                                                fill="#8884d8"
                                                dataKey="count"
                                                paddingAngle={2}
                                            >
                                                {orders.by_status.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.status.toLowerCase() === 'completed'
                                                                ? '#10b981'
                                                                : entry.status.toLowerCase() === 'pending'
                                                                  ? '#f59e0b'
                                                                  : entry.status.toLowerCase() === 'confirmed'
                                                                    ? '#3b82f6'
                                                                    : '#ef4444'
                                                        }
                                                        filter="url(#shadow)"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    padding: '12px',
                                                }}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                formatter={(value: number, name: string, props: any) => [
                                                    `${value} orders (${((props.payload.percent || 0) * 100).toFixed(1)}%)`,
                                                    props.payload.status,
                                                ]}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center">
                                    <p className="text-sm text-gray-500">No orders data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card className="border-2 border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <DollarSign className="h-5 w-5" style={{ color: '#16a34a' }} />
                                </div>
                                <div>
                                    <CardTitle className="text-base text-gray-900 sm:text-lg">Payment Methods</CardTitle>
                                    <CardDescription className="text-gray-500">Revenue by payment type</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {orders.by_payment_method.length > 0 ? (
                                <div className="w-full" style={{ height: '280px', minHeight: '280px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={orders.by_payment_method} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                            <defs>
                                                <linearGradient id="colorRevBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                                                </linearGradient>
                                                <linearGradient id="colorCountBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                                            <XAxis
                                                dataKey="method"
                                                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                                                tickLine={{ stroke: '#e5e7eb' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                tickLine={{ stroke: '#e5e7eb' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickFormatter={(value) => (value >= 1000 ? `₱${(value / 1000).toFixed(0)}k` : `₱${value}`)}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    padding: '12px',
                                                }}
                                                labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
                                                formatter={(value: number, name: string) => [
                                                    name === 'revenue' ? formatCurrency(value) : `${value} orders`,
                                                    name === 'revenue' ? 'Revenue' : 'Order Count',
                                                ]}
                                                cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
                                            <Bar dataKey="revenue" fill="url(#colorRevBar)" name="Revenue" radius={[8, 8, 0, 0]} maxBarSize={80} />
                                            <Bar dataKey="count" fill="url(#colorCountBar)" name="Orders" radius={[8, 8, 0, 0]} maxBarSize={80} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center">
                                    <p className="text-sm text-gray-500">No payment data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Products Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Product Insights</CardTitle>
                        <CardDescription className="text-gray-500">Your product performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Total Products</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{products.total}</div>
                                <div className="text-xs text-gray-500">{products.active} active</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Added This Period</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{products.added_in_period}</div>
                                <div className="text-xs text-gray-500">New products listed</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Stock Status</div>
                                <div className="space-y-1">
                                    {products.by_stock.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{item.status}</span>
                                            <span className="font-medium text-gray-900">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-gray-900 sm:text-lg">Top Products by Revenue</CardTitle>
                            <CardDescription className="text-gray-500">Best performing products</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.by_revenue.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                            <div className="text-xs text-gray-500">{item.quantity_sold} sold</div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.revenue)}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-gray-900 sm:text-lg">Most Viewed Products</CardTitle>
                            <CardDescription className="text-gray-500">Products with most views</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {products.most_viewed.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Eye className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                {formatNumber(item.views)} views
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Customer Insights</CardTitle>
                        <CardDescription className="text-gray-500">Understanding your customer base</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Total Customers</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{customers.total}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">New Customers</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{customers.new}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Retention Rate</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{customers.retention_rate}%</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-500">Avg. Lifetime Value</div>
                                <div className="text-xl font-bold text-gray-900 sm:text-2xl">{formatCurrency(customers.avg_lifetime_value)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Top Customers</CardTitle>
                        <CardDescription className="text-gray-500">Your most valuable customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {customers.top_customers.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.customer.avatar} />
                                        <AvatarFallback>{item.customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{item.customer.name}</div>
                                        <div className="text-xs text-gray-500">{item.order_count} orders</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">{formatCurrency(item.total_spent)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Recent Orders</CardTitle>
                        <CardDescription className="text-gray-500">Latest orders from your customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-gray-900">{order.order_number}</span>
                                            <Badge className={getStatusColor(order.status)}>{order.status_label}</Badge>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.customer.name} • {order.items_count} items
                                        </div>
                                        <div className="text-xs text-gray-400">{order.created_at_human}</div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <div className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
