import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    CheckCircle,
    Clock,
    Database,
    FileEdit,
    FileText,
    HardDrive,
    Mail,
    Package,
    PenTool,
    Percent,
    Server,
    Settings,
    Shield,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PesoIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12h.01M18 12h.01" />
    </svg>
);

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    administrators: number;
    sellers: number;
    buyers: number;
    verified: number;
    unverified: number;
}

interface SellerApplicationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
}

interface ContactMessageStats {
    total: number;
    new: number;
    read: number;
    replied: number;
    recent: number;
}

interface SystemStats {
    database_size: {
        size_mb: number;
        size_formatted: string;
    };
    total_tables: number;
    cache_hits: number;
    server_uptime: string;
}

interface GrowthMetrics {
    users_this_month: number;
    users_last_month: number;
    applications_this_week: number;
    applications_last_week: number;
    orders_this_month: number;
    orders_last_month: number;
}

interface OrderStats {
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
    today_revenue: number;
    this_month_revenue: number;
    total_commission: number;
    today_commission: number;
    this_month_commission: number;
    commission_rate: number;
}

interface ActivityItem {
    type: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    color: string;
}

interface CustomOrderStats {
    total: number;
    pending: number;
    quoted: number;
    in_progress: number;
    ready_for_checkout: number;
    completed: number;
    cancelled: number;
    this_week: number;
    this_month: number;
    total_value: number;
    avg_value: number;
}

interface RevenueChartItem {
    date: string;
    revenue: number;
    commission: number;
}

interface UserGrowthChartItem {
    month: string;
    buyers: number;
    sellers: number;
    total: number;
}

interface OrderTrendsChartItem {
    date: string;
    total: number;
    completed: number;
    cancelled: number;
}

interface TopSeller {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
}

interface DashboardProps extends SharedData {
    userStats: UserStats;
    sellerApplicationStats: SellerApplicationStats;
    contactMessageStats: ContactMessageStats;
    systemStats: SystemStats;
    recentActivity: ActivityItem[];
    growthMetrics: GrowthMetrics;
    recentUsersCount: number;
    recentActiveUsersCount: number;
    orderStats: OrderStats;
    customOrderStats: CustomOrderStats;
    revenueChartData: RevenueChartItem[];
    userGrowthChartData: UserGrowthChartItem[];
    orderTrendsChartData: OrderTrendsChartItem[];
    topSellers: TopSeller[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrator Dashboard',
        href: '/admin/dashboard',
    },
];

const getGrowthPercentage = (current: number, previous: number): { percentage: number; isPositive: boolean } => {
    if (previous === 0) return { percentage: current > 0 ? 100 : 0, isPositive: current > 0 };
    const percentage = Math.round(((current - previous) / previous) * 100);
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 };
};

const getActivityIcon = (iconName: string) => {
    switch (iconName) {
        case 'user-plus':
            return <UserPlus className="h-4 w-4" />;
        case 'file-text':
            return <FileText className="h-4 w-4" />;
        default:
            return <Activity className="h-4 w-4" />;
    }
};

const getActivityColor = (color: string) => {
    switch (color) {
        case 'blue':
            return 'bg-blue-100 text-blue-800';
        case 'orange':
            return 'bg-orange-100 text-orange-800';
        case 'green':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function AdminDashboard() {
    const {
        auth,
        userStats,
        sellerApplicationStats,
        contactMessageStats,
        systemStats,
        recentActivity,
        growthMetrics,
        recentUsersCount,
        recentActiveUsersCount,
        orderStats,
        customOrderStats,
        revenueChartData,
        userGrowthChartData,
        orderTrendsChartData,
        topSellers,
    } = usePage<DashboardProps>().props;

    const user = auth.user;

    const userGrowth = getGrowthPercentage(growthMetrics.users_this_month, growthMetrics.users_last_month);
    const applicationGrowth = getGrowthPercentage(growthMetrics.applications_this_week, growthMetrics.applications_last_week);
    const ordersGrowth = getGrowthPercentage(growthMetrics.orders_this_month, growthMetrics.orders_last_month);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Pie chart data for order status
    const orderStatusData = [
        { name: 'Pending', value: orderStats.pending, color: '#f59e0b' },
        { name: 'Confirmed', value: orderStats.confirmed, color: '#3b82f6' },
        { name: 'Shipped', value: orderStats.shipped, color: '#8b5cf6' },
        { name: 'Delivered', value: orderStats.delivered, color: '#06b6d4' },
        { name: 'Completed', value: orderStats.completed, color: '#10b981' },
        { name: 'Cancelled', value: orderStats.cancelled, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    // Custom order status data for pie chart
    const customOrderStatusData = [
        { name: 'Pending', value: customOrderStats?.pending || 0, color: '#f59e0b' },
        { name: 'Quoted', value: customOrderStats?.quoted || 0, color: '#3b82f6' },
        { name: 'In Progress', value: customOrderStats?.in_progress || 0, color: '#8b5cf6' },
        { name: 'Ready', value: customOrderStats?.ready_for_checkout || 0, color: '#f97316' },
        { name: 'Completed', value: customOrderStats?.completed || 0, color: '#10b981' },
        { name: 'Cancelled', value: customOrderStats?.cancelled || 0, color: '#6b7280' },
    ].filter((item) => item.value > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4 md:p-6" style={{ colorScheme: 'light' }}>
                {/* Welcome Section */}
                <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 shadow-sm sm:h-12 sm:w-12">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#dc2626' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome, {user?.name}!</h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                Role: <span className="font-semibold text-red-600">Administrator</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Managing {userStats.total} users • {recentActiveUsersCount} active this week
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 shadow-sm">
                                <Users className="h-5 w-5" style={{ color: '#2563eb' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Users</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{userStats.total}</p>
                                <div className="mt-1 flex items-center gap-1">
                                    {userGrowth.isPositive ? (
                                        <TrendingUp className="h-3 w-3" style={{ color: '#16a34a' }} />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" style={{ color: '#dc2626' }} />
                                    )}
                                    <span className={`text-xs ${userGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {userGrowth.percentage}% this month
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm">
                                <CheckCircle className="h-5 w-5" style={{ color: '#16a34a' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Active Users</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{userStats.active}</p>
                                <p className="text-xs text-gray-500">{Math.round((userStats.active / userStats.total) * 100)}% of total</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 shadow-sm">
                                <FileText className="h-5 w-5" style={{ color: '#ea580c' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Applications</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{sellerApplicationStats.total}</p>
                                <div className="mt-1 flex items-center gap-1">
                                    {applicationGrowth.isPositive ? (
                                        <TrendingUp className="h-3 w-3" style={{ color: '#16a34a' }} />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" style={{ color: '#dc2626' }} />
                                    )}
                                    <span className={`text-xs ${applicationGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {applicationGrowth.percentage}% this week
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 shadow-sm">
                                <Clock className="h-5 w-5" style={{ color: '#9333ea' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Pending</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{sellerApplicationStats.pending}</p>
                                <p className="text-xs text-gray-500">Require review</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue & Commission Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm">
                                <PesoIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Revenue</p>
                                <p className="text-xl font-bold text-green-700 sm:text-2xl">₱{(orderStats?.total_revenue || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">From all orders</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm">
                                <Percent className="h-5 w-5" style={{ color: '#059669' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Admin Commission</p>
                                <p className="text-xl font-bold text-emerald-700 sm:text-2xl">
                                    ₱{(orderStats?.total_commission || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">{orderStats?.commission_rate || 2}% from sellers</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 shadow-sm">
                                <PesoIcon className="h-5 w-5 text-teal-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">This Month Commission</p>
                                <p className="text-xl font-bold text-teal-700 sm:text-2xl">
                                    ₱{(orderStats?.this_month_commission || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">Your earnings this month</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 shadow-sm">
                                <ShoppingCart className="h-5 w-5" style={{ color: '#4f46e5' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Completed Orders</p>
                                <p className="text-xl font-bold text-indigo-700 sm:text-2xl">{orderStats?.completed || 0}</p>
                                <p className="text-xs text-gray-500">{orderStats?.pending || 0} pending</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue & Commission Chart */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                    <TrendingUp className="h-5 w-5" style={{ color: '#10b981' }} />
                                    Revenue & Commission (Last 30 Days)
                                </CardTitle>
                                <CardDescription className="text-gray-500">Daily revenue and admin commission earnings</CardDescription>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className="text-sm text-gray-500">Total (30 days)</div>
                                <div className="text-xl font-bold text-green-600 sm:text-2xl">
                                    {formatCurrency(revenueChartData?.reduce((sum, item) => sum + item.revenue, 0) || 0)}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {revenueChartData && revenueChartData.length > 0 ? (
                            <div className="w-full" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                        <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(value) => `₱${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Commission']}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="commission"
                                            name="Commission"
                                            stroke="#f59e0b"
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

                {/* User Growth & Order Trends Charts */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* User Growth Chart */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                <Users className="h-5 w-5" style={{ color: '#3b82f6' }} />
                                User Growth (Last 12 Months)
                            </CardTitle>
                            <CardDescription className="text-gray-500">New buyer and seller registrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {userGrowthChartData && userGrowthChartData.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={userGrowthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                                            <YAxis stroke="#6b7280" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="buyers" name="Buyers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="sellers" name="Sellers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No growth data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Trends Chart */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                <ShoppingCart className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                                Order Trends (Last 30 Days)
                            </CardTitle>
                            <CardDescription className="text-gray-500">Daily orders, completed, and cancelled</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orderTrendsChartData && orderTrendsChartData.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={orderTrendsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                            <YAxis stroke="#6b7280" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Legend />
                                            <Area type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="transparent" strokeWidth={2} />
                                            <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" fill="transparent" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[280px] items-center justify-center text-gray-500">No order data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Status & Custom Orders Pie Charts */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Order Status Pie Chart */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                <Package className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                                Orders by Status
                            </CardTitle>
                            <CardDescription className="text-gray-500">Distribution of all orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orderStatusData.length > 0 ? (
                                <div className="w-full" style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={orderStatusData}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={50}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {orderStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
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

                    {/* Custom Orders Stats */}
                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                                <PenTool className="h-5 w-5" style={{ color: '#f59e0b' }} />
                                Custom Order Requests
                            </CardTitle>
                            <CardDescription className="text-gray-600">Personalized orders from buyers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-white/60 p-3">
                                    <p className="text-xs font-medium text-gray-600">Total Requests</p>
                                    <p className="text-2xl font-bold text-amber-600">{customOrderStats?.total || 0}</p>
                                </div>
                                <div className="rounded-lg bg-white/60 p-3">
                                    <p className="text-xs font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{customOrderStats?.pending || 0}</p>
                                </div>
                                <div className="rounded-lg bg-white/60 p-3">
                                    <p className="text-xs font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-purple-600">{customOrderStats?.in_progress || 0}</p>
                                </div>
                                <div className="rounded-lg bg-white/60 p-3">
                                    <p className="text-xs font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{customOrderStats?.completed || 0}</p>
                                </div>
                                <div className="col-span-2 rounded-lg bg-white/60 p-3">
                                    <p className="text-xs font-medium text-gray-600">Total Value (Completed)</p>
                                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(customOrderStats?.total_value || 0)}</p>
                                    <p className="text-xs text-gray-500">Avg: {formatCurrency(customOrderStats?.avg_value || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Sellers */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-gray-900 sm:text-lg">
                            <TrendingUp className="h-5 w-5" style={{ color: '#f59e0b' }} />
                            Top Performing Sellers (Last 30 Days)
                        </CardTitle>
                        <CardDescription className="text-gray-500">Sellers with highest revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topSellers && topSellers.length > 0 ? (
                            <div className="space-y-3">
                                {topSellers.slice(0, 5).map((seller, index) => (
                                    <div key={seller.id || index} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                                            #{index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={seller.avatar_url || undefined} alt={seller.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                                {seller.name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{seller.name}</p>
                                            <p className="truncate text-xs text-gray-500">{seller.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-600">{formatCurrency(seller.total_revenue)}</p>
                                            <p className="text-xs text-gray-500">{seller.order_count} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[200px] items-center justify-center text-gray-500">No seller data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* User Management - spans 1 column */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base">Administrators</p>
                                    <p className="text-xs text-gray-500 sm:text-sm">{userStats.administrators} admin users</p>
                                </div>
                                <Badge variant="destructive" className="ml-2 shrink-0">
                                    {userStats.administrators}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base">Sellers</p>
                                    <p className="text-xs text-gray-500 sm:text-sm">{userStats.sellers} registered sellers</p>
                                </div>
                                <Badge variant="secondary" className="ml-2 shrink-0">
                                    {userStats.sellers}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base">Buyers</p>
                                    <p className="text-xs text-gray-500 sm:text-sm">{userStats.buyers} registered buyers</p>
                                </div>
                                <Badge className="ml-2 shrink-0">{userStats.buyers}</Badge>
                            </div>
                            <div className="pt-2 sm:pt-4">
                                <Link
                                    href="/admin/users"
                                    className="block w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:px-4 sm:py-3 sm:text-base"
                                >
                                    Manage All Users
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity - spans 1 column */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm sm:h-8 sm:w-8 ${getActivityColor(activity.color)}`}
                                            >
                                                {getActivityIcon(activity.icon)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-gray-900 sm:text-sm">{activity.title}</p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">{activity.description}</p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(activity.time).toLocaleDateString()} {new Date(activity.time).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions - spans 1 column */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                            <Link
                                href="/admin/users"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <Users className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#2563eb' }} />
                                <span>Manage Users</span>
                            </Link>
                            <Link
                                href="/admin/seller-applications"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-left text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <FileText className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#ea580c' }} />
                                <div className="min-w-0 flex-1">
                                    <span className="block">Seller Applications</span>
                                    {sellerApplicationStats.pending > 0 && <span className="text-xs">{sellerApplicationStats.pending} pending</span>}
                                </div>
                            </Link>
                            <Link
                                href="/admin/reports"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-left text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <BarChart3 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#9333ea' }} />
                                <span>View Reports</span>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <Settings className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                                <span>System Settings</span>
                            </Link>
                            <Link
                                href="/admin/page-content"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <FileEdit className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#2563eb' }} />
                                <span>Customize Pages</span>
                            </Link>
                            <Link
                                href="/admin/contact-messages"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                            >
                                <Mail className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: '#0d9488' }} />
                                <div className="min-w-0 flex-1">
                                    <span className="block">Contact Messages</span>
                                    {contactMessageStats.new > 0 && <span className="text-xs">{contactMessageStats.new} new</span>}
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* System Information */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Server className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                            System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm sm:h-10 sm:w-10">
                                    <HardDrive className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#16a34a' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Database Size</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg">{systemStats.database_size.size_formatted}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 shadow-sm sm:h-10 sm:w-10">
                                    <Database className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#2563eb' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Tables</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg">{systemStats.total_tables}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 shadow-sm sm:h-10 sm:w-10">
                                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#9333ea' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Cache Hits</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg">{systemStats.cache_hits.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 shadow-sm sm:h-10 sm:w-10">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#ea580c' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Uptime</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg">{systemStats.server_uptime}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Email Verified</p>
                                    <p className="text-xl font-bold text-green-600 sm:text-2xl">{userStats.verified}</p>
                                </div>
                                <CheckCircle className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" style={{ color: '#16a34a' }} />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {Math.round((userStats.verified / userStats.total) * 100)}% verification rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Approved Applications</p>
                                    <p className="text-xl font-bold text-green-600 sm:text-2xl">{sellerApplicationStats.approved}</p>
                                </div>
                                <CheckCircle className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" style={{ color: '#16a34a' }} />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {sellerApplicationStats.total > 0
                                    ? Math.round((sellerApplicationStats.approved / sellerApplicationStats.total) * 100)
                                    : 0}
                                % approval rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 transition-all duration-200 hover:shadow-md lg:col-span-1">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">New This Month</p>
                                    <p className="text-xl font-bold text-blue-600 sm:text-2xl">{recentUsersCount}</p>
                                </div>
                                <UserPlus className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" style={{ color: '#2563eb' }} />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">User registrations (30 days)</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
