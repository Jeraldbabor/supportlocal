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
    FileText,
    HardDrive,
    Server,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';

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
    systemStats: SystemStats;
    recentActivity: ActivityItem[];
    growthMetrics: GrowthMetrics;
    recentUsersCount: number;
    recentActiveUsersCount: number;
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
    const { auth, userStats, sellerApplicationStats, systemStats, recentActivity, growthMetrics, recentUsersCount, recentActiveUsersCount } =
        usePage<DashboardProps>().props;

    const user = auth.user;

    const userGrowth = getGrowthPercentage(growthMetrics.users_this_month, growthMetrics.users_last_month);
    const applicationGrowth = getGrowthPercentage(growthMetrics.applications_this_week, growthMetrics.applications_last_week);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section */}
                <div className="rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:from-red-950/20 dark:to-orange-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name}!</h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Role: <span className="font-semibold text-red-600 dark:text-red-400">Administrator</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Managing {userStats.total} users • {recentActiveUsersCount} active this week
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userStats.total}</p>
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

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userStats.active}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round((userStats.active / userStats.total) * 100)}% of total
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Applications</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sellerApplicationStats.total}</p>
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

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sellerApplicationStats.pending}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Require review</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User Management - spans 1 column */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Administrators</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userStats.administrators} admin users</p>
                                </div>
                                <Badge variant="destructive">{userStats.administrators}</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Sellers</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userStats.sellers} registered sellers</p>
                                </div>
                                <Badge variant="secondary">{userStats.sellers}</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Buyers</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userStats.buyers} registered buyers</p>
                                </div>
                                <Badge>{userStats.buyers}</Badge>
                            </div>
                            <div className="pt-4">
                                <Link
                                    href="/admin/users"
                                    className="block w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
                                >
                                    Manage All Users
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity - spans 1 column */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.color)}`}
                                            >
                                                {getActivityIcon(activity.icon)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link
                                href="/admin/users"
                                className="flex w-full items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
                            >
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Manage Users</span>
                            </Link>
                            <Link
                                href="/admin/seller-applications"
                                className="flex w-full items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/80"
                            >
                                <FileText className="h-5 w-5" />
                                <div>
                                    <span className="block font-medium">Seller Applications</span>
                                    {sellerApplicationStats.pending > 0 && <span className="text-xs">{sellerApplicationStats.pending} pending</span>}
                                </div>
                            </Link>
                            <button className="flex w-full items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950/80">
                                <BarChart3 className="h-5 w-5" />
                                <span className="font-medium">View Reports</span>
                            </button>
                            <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                <Settings className="h-5 w-5" />
                                <span className="font-medium">System Settings</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Database Size</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {systemStats.database_size.size_formatted}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tables</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{systemStats.total_tables}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cache Hits</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {systemStats.cache_hits.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Uptime</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{systemStats.server_uptime}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Verified</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.verified}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {Math.round((userStats.verified / userStats.total) * 100)}% verification rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved Applications</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sellerApplicationStats.approved}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {sellerApplicationStats.total > 0
                                    ? Math.round((sellerApplicationStats.approved / sellerApplicationStats.total) * 100)
                                    : 0}
                                % approval rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">New This Month</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{recentUsersCount}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">User registrations (30 days)</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
