import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'orange':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'green':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
    } = usePage<DashboardProps>().props;

    const user = auth.user;

    const userGrowth = getGrowthPercentage(growthMetrics.users_this_month, growthMetrics.users_last_month);
    const applicationGrowth = getGrowthPercentage(growthMetrics.applications_this_week, growthMetrics.applications_last_week);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4 md:p-6">
                {/* Welcome Section */}
                <div className="rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6 dark:from-red-950/20 dark:to-orange-950/20">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 shadow-sm sm:h-12 sm:w-12 dark:bg-red-900">
                            <Shield className="h-5 w-5 text-red-600 sm:h-6 sm:w-6 dark:text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Welcome, {user?.name}!</h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-300">
                                Role: <span className="font-semibold text-red-600 dark:text-red-400">Administrator</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                Managing {userStats.total} users • {recentActiveUsersCount} active this week
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid auto-rows-min gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 shadow-sm dark:bg-blue-900">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Total Users</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{userStats.total}</p>
                                <div className="mt-1 flex items-center gap-1">
                                    {userGrowth.isPositive ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
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
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm dark:bg-green-900">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Active Users</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{userStats.active}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round((userStats.active / userStats.total) * 100)}% of total
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 shadow-sm dark:bg-orange-900">
                                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Applications</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{sellerApplicationStats.total}</p>
                                <div className="mt-1 flex items-center gap-1">
                                    {applicationGrowth.isPositive ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
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
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 shadow-sm dark:bg-purple-900">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Pending</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{sellerApplicationStats.pending}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Require review</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue & Commission Stats */}
                <div className="grid auto-rows-min gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-200 hover:shadow-md dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm dark:bg-green-900">
                                <PesoIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Total Revenue</p>
                                <p className="text-xl font-bold text-green-700 sm:text-2xl dark:text-green-400">
                                    ₱{(orderStats?.total_revenue || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">From all orders</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 transition-all duration-200 hover:shadow-md dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm dark:bg-emerald-900">
                                <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Admin Commission</p>
                                <p className="text-xl font-bold text-emerald-700 sm:text-2xl dark:text-emerald-400">
                                    ₱{(orderStats?.total_commission || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{orderStats?.commission_rate || 2}% from sellers</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 shadow-sm dark:bg-teal-900">
                                <PesoIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">This Month Commission</p>
                                <p className="text-xl font-bold text-teal-700 sm:text-2xl dark:text-teal-400">
                                    ₱{(orderStats?.this_month_commission || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Your earnings this month</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 shadow-sm dark:bg-indigo-900">
                                <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Completed Orders</p>
                                <p className="text-xl font-bold text-indigo-700 sm:text-2xl dark:text-indigo-400">{orderStats?.completed || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{orderStats?.pending || 0} pending</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* User Management - spans 1 column */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3 dark:bg-gray-700 dark:hover:bg-gray-600">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-gray-100">Administrators</p>
                                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">{userStats.administrators} admin users</p>
                                </div>
                                <Badge variant="destructive" className="ml-2 shrink-0">
                                    {userStats.administrators}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3 dark:bg-gray-700 dark:hover:bg-gray-600">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-gray-100">Sellers</p>
                                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">{userStats.sellers} registered sellers</p>
                                </div>
                                <Badge variant="secondary" className="ml-2 shrink-0">
                                    {userStats.sellers}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:p-3 dark:bg-gray-700 dark:hover:bg-gray-600">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 sm:text-base dark:text-gray-100">Buyers</p>
                                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">{userStats.buyers} registered buyers</p>
                                </div>
                                <Badge className="ml-2 shrink-0">{userStats.buyers}</Badge>
                            </div>
                            <div className="pt-2 sm:pt-4">
                                <Link
                                    href="/admin/users"
                                    className="block w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:px-4 sm:py-3 sm:text-base dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
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
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                                <p className="text-xs font-medium text-gray-900 sm:text-sm dark:text-gray-100">{activity.title}</p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                                    {activity.description}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                    {new Date(activity.time).toLocaleDateString()} {new Date(activity.time).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions - spans 1 column */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                            <Link
                                href="/admin/users"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
                            >
                                <Users className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span>Manage Users</span>
                            </Link>
                            <Link
                                href="/admin/seller-applications"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-left text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/80"
                            >
                                <FileText className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <div className="min-w-0 flex-1">
                                    <span className="block">Seller Applications</span>
                                    {sellerApplicationStats.pending > 0 && <span className="text-xs">{sellerApplicationStats.pending} pending</span>}
                                </div>
                            </Link>
                            <Link
                                href="/admin/reports"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-left text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950/80"
                            >
                                <BarChart3 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span>View Reports</span>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Settings className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span>System Settings</span>
                            </Link>
                            <Link
                                href="/admin/page-content"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
                            >
                                <FileEdit className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span>Customize Pages</span>
                            </Link>
                            <Link
                                href="/admin/contact-messages"
                                className="flex w-full items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300 dark:hover:bg-teal-950/80"
                            >
                                <Mail className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
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
                            <Server className="h-4 w-4 sm:h-5 sm:w-5" />
                            System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-sm sm:h-10 sm:w-10 dark:bg-green-900">
                                    <HardDrive className="h-4 w-4 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Database Size</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                                        {systemStats.database_size.size_formatted}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 shadow-sm sm:h-10 sm:w-10 dark:bg-blue-900">
                                    <Database className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Tables</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">{systemStats.total_tables}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 shadow-sm sm:h-10 sm:w-10 dark:bg-purple-900">
                                    <BarChart3 className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5 dark:text-purple-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Cache Hits</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                                        {systemStats.cache_hits.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 shadow-sm sm:h-10 sm:w-10 dark:bg-orange-900">
                                    <Clock className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5 dark:text-orange-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Uptime</p>
                                    <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">{systemStats.server_uptime}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats Row */}
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Email Verified</p>
                                    <p className="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400">{userStats.verified}</p>
                                </div>
                                <CheckCircle className="h-7 w-7 shrink-0 text-green-600 sm:h-8 sm:w-8 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {Math.round((userStats.verified / userStats.total) * 100)}% verification rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">Approved Applications</p>
                                    <p className="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400">
                                        {sellerApplicationStats.approved}
                                    </p>
                                </div>
                                <CheckCircle className="h-7 w-7 shrink-0 text-green-600 sm:h-8 sm:w-8 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {sellerApplicationStats.total > 0
                                    ? Math.round((sellerApplicationStats.approved / sellerApplicationStats.total) * 100)
                                    : 0}
                                % approval rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">New This Month</p>
                                    <p className="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">{recentUsersCount}</p>
                                </div>
                                <UserPlus className="h-7 w-7 shrink-0 text-blue-600 sm:h-8 sm:w-8 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">User registrations (30 days)</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
