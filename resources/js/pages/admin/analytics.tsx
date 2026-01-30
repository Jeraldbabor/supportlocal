import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Clock,
    Download,
    Gavel,
    Package,
    PenTool,
    ShoppingCart,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Analytics',
        href: '/admin/analytics',
    },
];

interface AnalyticsProps {
    dateRange: string;
    startDate: string;
    endDate: string;
    overview: {
        total_revenue: number;
        revenue_growth: number;
        total_orders: number;
        orders_growth: number;
        completed_orders: number;
        total_commission: number;
        new_users: number;
        users_growth: number;
        new_sellers: number;
        new_buyers: number;
        new_products: number;
        avg_order_value: number;
    };
    revenueData: Array<{ date: string; revenue: number; commission: number }>;
    userGrowthData: Array<{ month: string; buyers: number; sellers: number; total: number }>;
    orderTrendsData: Array<{ date: string; total: number; completed: number; cancelled: number }>;
    topSellers: Array<{
        id: number;
        name: string;
        email: string;
        avatar_url: string | null;
        order_count: number;
        total_revenue: number;
        avg_order_value: number;
    }>;
    topProducts: Array<{
        id: number;
        name: string;
        price: number;
        quantity_sold: number;
        revenue: number;
    }>;
    customOrderStats: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        total_value: number;
        conversion_rate: number;
    };
    ordersByStatus: Array<{ status: string; count: number }>;
    revenueByCategory: Array<{ category: string; revenue: number }>;
    // Marketplace & Bidding Analytics (Unique Feature)
    marketplaceStats?: {
        public_requests: number;
        public_requests_growth: number;
        open_requests: number;
        total_bids: number;
        bids_growth: number;
        accepted_bids: number;
        rejected_bids: number;
        pending_bids: number;
        avg_bids_per_request: number;
        bid_acceptance_rate: number;
        accepted_bid_value: number;
        avg_response_time: number;
        active_bidders: number;
    };
    biddingTrends?: Array<{ date: string; bids: number; accepted: number; requests: number }>;
    topBiddingSellers?: Array<{
        id: number;
        name: string;
        avatar_url: string | null;
        total_bids: number;
        accepted_bids: number;
        win_rate: number;
        avg_bid_amount: number;
        total_won_value: number;
    }>;
    customOrdersByCategory?: Array<{ category: string; category_key: string; count: number }>;
    bidActivityByHour?: Array<{ hour: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
    Pending: '#f59e0b',
    Confirmed: '#f97316',
    Shipped: '#8b5cf6',
    Delivered: '#06b6d4',
    Completed: '#10b981',
    Cancelled: '#ef4444',
};

const CATEGORY_COLORS = ['#f59e0b', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#ef4444', '#6b7280'];

export default function AdminAnalytics({
    dateRange,
    overview,
    revenueData,
    userGrowthData,
    orderTrendsData,
    topSellers,
    topProducts,
    customOrderStats,
    ordersByStatus,
    revenueByCategory,
    marketplaceStats,
    biddingTrends,
    topBiddingSellers,
    customOrdersByCategory,
    bidActivityByHour,
}: AnalyticsProps) {
    const [selectedRange, setSelectedRange] = useState(dateRange);
    const [exporting, setExporting] = useState(false);

    const handleRangeChange = (value: string) => {
        setSelectedRange(value);
        router.get('/admin/analytics', { range: value }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = (type: string = 'all') => {
        setExporting(true);
        window.location.href = `/admin/analytics/export?range=${selectedRange}&type=${type}`;
        setTimeout(() => setExporting(false), 2000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="space-y-4 p-3 sm:p-4 md:space-y-6" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">Analytics Dashboard</h1>
                        <p className="text-sm text-gray-500 md:text-base">Comprehensive platform performance insights</p>
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
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
                            onClick={() => handleExport('all')}
                            disabled={exporting}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export to Excel'}
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-amber-700 sm:text-2xl">{formatCurrency(overview.total_revenue)}</div>
                            <div className="flex items-center text-xs text-gray-600">
                                {overview.revenue_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.revenue_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">vs previous</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Commission Earned</CardTitle>
                            <BarChart3 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-green-700 sm:text-2xl">{formatCurrency(overview.total_commission)}</div>
                            <div className="text-xs text-gray-600">From {overview.completed_orders} completed orders</div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-orange-700 sm:text-2xl">{overview.total_orders}</div>
                            <div className="flex items-center text-xs text-gray-600">
                                {overview.orders_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.orders_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.orders_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">vs previous</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">New Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-blue-700 sm:text-2xl">{overview.new_users}</div>
                            <div className="flex items-center text-xs text-gray-600">
                                {overview.users_growth >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={overview.users_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(overview.users_growth)}%
                                </span>
                                <span className="ml-1 hidden sm:inline">vs previous</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 sm:text-sm">Avg Order Value</div>
                            <div className="text-lg font-bold text-gray-900 sm:text-xl">{formatCurrency(overview.avg_order_value)}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 sm:text-sm">New Sellers</div>
                            <div className="text-lg font-bold text-amber-600 sm:text-xl">{overview.new_sellers}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 sm:text-sm">New Buyers</div>
                            <div className="text-lg font-bold text-blue-600 sm:text-xl">{overview.new_buyers}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 sm:text-sm">New Products</div>
                            <div className="text-lg font-bold text-green-600 sm:text-xl">{overview.new_products}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue & Commission Chart */}
                <Card className="border-2 border-amber-100">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                    Revenue & Commission
                                </CardTitle>
                                <CardDescription className="text-gray-600">Daily platform revenue and commission</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExport('revenue')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {revenueData && revenueData.length > 0 ? (
                            <div className="w-full" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} interval="preserveStartEnd" />
                                        <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(value) => `₱${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #fcd34d', borderRadius: '8px' }}
                                            formatter={(value: number, name: string) => [
                                                formatCurrency(value),
                                                name === 'revenue' ? 'Revenue' : 'Commission',
                                            ]}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#f59e0b"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="commission"
                                            name="Commission"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorCommission)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-gray-500">No revenue data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* User Growth & Order Trends */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* User Growth */}
                    <Card className="border-2 border-blue-100">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <CardTitle className="text-base text-gray-900 sm:text-lg">User Growth</CardTitle>
                                        <CardDescription className="text-gray-600">Last 12 months</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleExport('users')}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {userGrowthData && userGrowthData.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" fontSize={9} angle={-45} textAnchor="end" height={60} />
                                            <YAxis stroke="#6b7280" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                            <Legend />
                                            <Bar dataKey="buyers" name="Buyers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="sellers" name="Sellers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No user data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Trends */}
                    <Card className="border-2 border-purple-100">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-base text-gray-900 sm:text-lg">Order Trends</CardTitle>
                                        <CardDescription className="text-gray-600">Orders over time</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleExport('orders')}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {orderTrendsData && orderTrendsData.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={orderTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" stroke="#6b7280" fontSize={10} interval="preserveStartEnd" />
                                            <YAxis stroke="#6b7280" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                name="Total"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorTotal)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="completed"
                                                name="Completed"
                                                stroke="#10b981"
                                                fill="transparent"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="cancelled"
                                                name="Cancelled"
                                                stroke="#ef4444"
                                                fill="transparent"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No order data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Orders by Status & Revenue by Category */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Orders by Status */}
                    <Card className="border-2 border-amber-100">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-amber-600" />
                                <div>
                                    <CardTitle className="text-base text-gray-900 sm:text-lg">Orders by Status</CardTitle>
                                    <CardDescription className="text-gray-600">Distribution of all orders</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {ordersByStatus && ordersByStatus.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={ordersByStatus}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={50}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="count"
                                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {ordersByStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => [`${value} orders`, '']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No order data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue by Category */}
                    <Card className="border-2 border-green-100">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-base text-gray-900 sm:text-lg">Revenue by Category</CardTitle>
                                    <CardDescription className="text-gray-600">Top performing categories</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {revenueByCategory && revenueByCategory.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={revenueByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis type="number" stroke="#6b7280" fontSize={10} tickFormatter={(value) => `₱${value / 1000}k`} />
                                            <YAxis type="category" dataKey="category" stroke="#6b7280" fontSize={10} width={100} />
                                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                                            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                                {revenueByCategory.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No category data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Orders Stats */}
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PenTool className="h-5 w-5 text-amber-600" />
                                <div>
                                    <CardTitle className="text-base text-gray-900 sm:text-lg">Custom Order Analytics</CardTitle>
                                    <CardDescription className="text-gray-600">Personalized orders performance</CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExport('custom_orders')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-amber-600">{customOrderStats.total}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{customOrderStats.pending}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-purple-600">{customOrderStats.in_progress}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{customOrderStats.completed}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Cancelled</p>
                                <p className="text-2xl font-bold text-gray-600">{customOrderStats.cancelled}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-xl font-bold text-orange-600">{formatCurrency(customOrderStats.total_value)}</p>
                            </div>
                            <div className="rounded-lg bg-white/60 p-4 text-center">
                                <p className="text-sm text-gray-600">Conversion</p>
                                <p className="text-2xl font-bold text-blue-600">{customOrderStats.conversion_rate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ==================== MARKETPLACE BIDDING ANALYTICS (UNIQUE FEATURE) ==================== */}
                {marketplaceStats && (
                    <>
                        {/* Marketplace Section Header */}
                        <div className="relative mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg">
                            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                        <Gavel className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold sm:text-2xl">Marketplace Bidding Analytics</h2>
                                            <Badge className="bg-white/20 text-white hover:bg-white/30">
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Unique Feature
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-purple-100">Custom order bidding system performance</p>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full bg-white/20 text-white hover:bg-white/30 sm:w-auto"
                                    onClick={() => handleExport('marketplace')}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Marketplace Data
                                </Button>
                            </div>
                        </div>

                        {/* Marketplace Overview Stats */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 transition-all duration-200 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Public Requests</CardTitle>
                                    <PenTool className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-purple-700 sm:text-2xl">{marketplaceStats.public_requests}</div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        {marketplaceStats.public_requests_growth >= 0 ? (
                                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                        )}
                                        <span className={marketplaceStats.public_requests_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {Math.abs(marketplaceStats.public_requests_growth)}%
                                        </span>
                                        <span className="ml-1 hidden sm:inline">vs previous</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 transition-all duration-200 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Total Bids</CardTitle>
                                    <Gavel className="h-4 w-4 text-indigo-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-indigo-700 sm:text-2xl">{marketplaceStats.total_bids}</div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        {marketplaceStats.bids_growth >= 0 ? (
                                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                        )}
                                        <span className={marketplaceStats.bids_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {Math.abs(marketplaceStats.bids_growth)}%
                                        </span>
                                        <span className="ml-1 hidden sm:inline">vs previous</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-200 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Acceptance Rate</CardTitle>
                                    <Target className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-green-700 sm:text-2xl">{marketplaceStats.bid_acceptance_rate}%</div>
                                    <div className="text-xs text-gray-600">
                                        {marketplaceStats.accepted_bids} of {marketplaceStats.total_bids} bids won
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-200 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-700 sm:text-sm">Won Bid Value</CardTitle>
                                    <Trophy className="h-4 w-4 text-amber-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-amber-700 sm:text-2xl">
                                        {formatCurrency(marketplaceStats.accepted_bid_value)}
                                    </div>
                                    <div className="text-xs text-gray-600">From accepted bids</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Secondary Marketplace Stats */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <PenTool className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Open Requests</div>
                                            <div className="text-lg font-bold text-blue-600">{marketplaceStats.open_requests}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-yellow-100 p-2">
                                            <Gavel className="h-4 w-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Pending Bids</div>
                                            <div className="text-lg font-bold text-yellow-600">{marketplaceStats.pending_bids}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-purple-100 p-2">
                                            <Users className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Active Bidders</div>
                                            <div className="text-lg font-bold text-purple-600">{marketplaceStats.active_bidders}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-orange-100 p-2">
                                            <BarChart3 className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Avg Bids/Request</div>
                                            <div className="text-lg font-bold text-orange-600">{marketplaceStats.avg_bids_per_request}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-cyan-100 p-2">
                                            <Clock className="h-4 w-4 text-cyan-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Avg Response</div>
                                            <div className="text-lg font-bold text-cyan-600">{marketplaceStats.avg_response_time}h</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bidding Trends & Category Distribution */}
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            {/* Bidding Trends Chart */}
                            <Card className="border-2 border-purple-100">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                                    <div className="flex items-center gap-2">
                                        <Gavel className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <CardTitle className="text-base text-gray-900 sm:text-lg">Bidding Activity</CardTitle>
                                            <CardDescription className="text-gray-600">Requests and bids over time</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {biddingTrends && biddingTrends.length > 0 ? (
                                        <div className="w-full" style={{ height: '280px' }}>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <LineChart data={biddingTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={10} interval="preserveStartEnd" />
                                                    <YAxis stroke="#6b7280" fontSize={10} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="requests"
                                                        name="New Requests"
                                                        stroke="#8b5cf6"
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="bids"
                                                        name="Bids Submitted"
                                                        stroke="#f59e0b"
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="accepted"
                                                        name="Bids Accepted"
                                                        stroke="#10b981"
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[280px] items-center justify-center text-gray-500">No bidding data available</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Custom Orders by Category */}
                            <Card className="border-2 border-indigo-100">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <CardTitle className="text-base text-gray-900 sm:text-lg">Requests by Category</CardTitle>
                                            <CardDescription className="text-gray-600">Most popular custom order categories</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {customOrdersByCategory && customOrdersByCategory.length > 0 ? (
                                        <div className="w-full" style={{ height: '280px' }}>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <BarChart
                                                    data={customOrdersByCategory}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis type="number" stroke="#6b7280" fontSize={10} />
                                                    <YAxis type="category" dataKey="category" stroke="#6b7280" fontSize={10} width={100} />
                                                    <Tooltip />
                                                    <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                                                        {customOrdersByCategory.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[280px] items-center justify-center text-gray-500">No category data available</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bid Activity by Hour & Top Bidding Artisans */}
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            {/* Bid Activity by Hour */}
                            <Card className="border-2 border-cyan-100">
                                <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-cyan-600" />
                                        <div>
                                            <CardTitle className="text-base text-gray-900 sm:text-lg">Bid Activity by Hour</CardTitle>
                                            <CardDescription className="text-gray-600">Peak bidding times</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {bidActivityByHour && bidActivityByHour.length > 0 ? (
                                        <div className="w-full" style={{ height: '280px' }}>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <BarChart data={bidActivityByHour} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={8} interval={2} />
                                                    <YAxis stroke="#6b7280" fontSize={10} />
                                                    <Tooltip />
                                                    <Bar dataKey="count" name="Bids" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[280px] items-center justify-center text-gray-500">No activity data available</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Top Bidding Artisans */}
                            <Card className="border-2 border-amber-100">
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-amber-600" />
                                        <div>
                                            <CardTitle className="text-base text-gray-900 sm:text-lg">Top Bidding Artisans</CardTitle>
                                            <CardDescription className="text-gray-600">Most active in marketplace</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {topBiddingSellers && topBiddingSellers.length > 0 ? (
                                        <div className="space-y-3">
                                            {topBiddingSellers.slice(0, 5).map((seller, index) => (
                                                <div
                                                    key={seller.id}
                                                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                                >
                                                    <Badge variant="outline" className="bg-amber-100 text-amber-700">
                                                        #{index + 1}
                                                    </Badge>
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={seller.avatar_url || undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                                                            {seller.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">{seller.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{seller.total_bids} bids</span>
                                                            <span>•</span>
                                                            <span className="text-green-600">{seller.win_rate}% win rate</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-amber-600">
                                                            {formatCurrency(seller.total_won_value)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{seller.accepted_bids} won</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-[200px] items-center justify-center text-gray-500">No bidding artisans yet</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Top Sellers & Products */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Top Sellers */}
                    <Card className="border-2 border-amber-100">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <CardTitle className="text-base text-gray-900 sm:text-lg">Top Sellers</CardTitle>
                                        <CardDescription className="text-gray-600">Best performing sellers</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleExport('sellers')}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {topSellers && topSellers.length > 0 ? (
                                <div className="space-y-3">
                                    {topSellers.slice(0, 5).map((seller, index) => (
                                        <div
                                            key={seller.id}
                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                        >
                                            <Badge variant="outline" className="bg-amber-100 text-amber-700">
                                                #{index + 1}
                                            </Badge>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={seller.avatar_url || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                                    {seller.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{seller.name}</p>
                                                <p className="truncate text-xs text-gray-500">{seller.order_count} orders</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">{formatCurrency(seller.total_revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-gray-500">No seller data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="border-2 border-green-100">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                    <div>
                                        <CardTitle className="text-base text-gray-900 sm:text-lg">Top Products</CardTitle>
                                        <CardDescription className="text-gray-600">Best selling products</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleExport('products')}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {topProducts && topProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {topProducts.slice(0, 5).map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                        >
                                            <Badge variant="outline" className="bg-green-100 text-green-700">
                                                #{index + 1}
                                            </Badge>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.quantity_sold} sold</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-gray-500">No product data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
