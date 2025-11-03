import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    CheckCircle,
    DollarSign,
    Eye,
    Package,
    RefreshCw,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Star,
    Target,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seller Dashboard',
        href: '/seller/dashboard',
    },
];

interface ProfileSummary {
    profile_completeness: number;
    missing_fields: string[];
    has_avatar: boolean;
    email_verified: boolean;
    business_setup: boolean;
}

interface SettingsSummary {
    notifications_enabled: boolean;
    two_factor_enabled: boolean;
    privacy_settings_configured: boolean;
    marketing_preferences_set: boolean;
}

interface DashboardStats {
    profile_completeness: number;
    account_health_score: number;
    days_as_seller: number;
}

interface ProductStats {
    total: number;
    active: number;
    draft: number;
    low_stock: number;
    out_of_stock: number;
    total_views: number;
    total_orders: number;
    average_rating: number;
    created_this_month: number;
    created_this_week: number;
    trending: Record<string, string>;
    best_sellers: Record<string, string>;
}

interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    this_month: number;
    this_week: number;
    today: number;
    average_items_per_order: number;
}

interface RevenueStats {
    total: number;
    this_month: number;
    this_week: number;
    today: number;
    last_month: number;
    pending_amount: number;
    average_order_value: number;
    month_growth_percentage: number;
}

interface CustomerStats {
    total_unique: number;
    returning: number;
    new_this_month: number;
    retention_rate: number;
}

interface Recommendation {
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

interface SellerDashboardProps extends SharedData {
    profileSummary?: ProfileSummary;
    settingsSummary?: SettingsSummary;
    dashboardStats?: DashboardStats;
    productStats?: ProductStats;
    orderStats?: OrderStats;
    revenueStats?: RevenueStats;
    customerStats?: CustomerStats;
    recommendations?: Recommendation[];
    recentActivity?: Array<{
        type: string;
        title: string;
        description: string;
        date: string;
        icon: string;
    }>;
}

export default function SellerDashboard() {
    const {
        auth,
        profileSummary = {},
        settingsSummary = {},
        dashboardStats = {},
        productStats = {},
        orderStats = {},
        revenueStats = {},
        customerStats = {},
        recommendations = [],
        recentActivity = [],
    } = usePage<SellerDashboardProps>().props;
    const user = auth.user;

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Provide default values
    const profile = {
        profile_completeness: 0,
        missing_fields: [],
        has_avatar: false,
        email_verified: false,
        business_setup: false,
        ...profileSummary,
    };

    const settings = {
        notifications_enabled: false,
        two_factor_enabled: false,
        privacy_settings_configured: false,
        marketing_preferences_set: false,
        ...settingsSummary,
    };

    const stats = {
        profile_completeness: 0,
        account_health_score: 0,
        days_as_seller: 0,
        ...dashboardStats,
    };

    // Enhanced stats with default values
    const products = useMemo(
        () => ({
            total: 0,
            active: 0,
            draft: 0,
            low_stock: 0,
            out_of_stock: 0,
            total_views: 0,
            total_orders: 0,
            average_rating: 0,
            created_this_month: 0,
            created_this_week: 0,
            trending: {},
            best_sellers: {},
            ...productStats,
        }),
        [productStats],
    );

    const orders = useMemo(
        () => ({
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            this_month: 0,
            this_week: 0,
            today: 0,
            average_items_per_order: 0,
            ...orderStats,
        }),
        [orderStats],
    );

    const revenue = useMemo(
        () => ({
            total: 0,
            this_month: 0,
            this_week: 0,
            today: 0,
            last_month: 0,
            pending_amount: 0,
            average_order_value: 0,
            month_growth_percentage: 0,
            ...revenueStats,
        }),
        [revenueStats],
    );

    const customers = {
        total_unique: 0,
        returning: 0,
        new_this_month: 0,
        retention_rate: 0,
        ...customerStats,
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getHealthScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900';
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
        return 'bg-red-100 dark:bg-red-900';
    };

    // Memoized utility functions
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    }, []);

    const formatPercentage = useCallback((value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }, []);

    const getGrowthColor = useCallback((percentage: number) => {
        if (percentage > 0) return 'text-green-600 dark:text-green-400';
        if (percentage < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    }, []);

    const getGrowthIcon = useCallback((percentage: number) => {
        if (percentage > 0) return ArrowUpRight;
        if (percentage < 0) return ArrowDownRight;
        return Activity;
    }, []);

    // Memoized performance calculations
    const performanceMetrics = useMemo(
        () => ({
            conversionRate: products.total_views > 0 ? ((products.total_orders / products.total_views) * 100).toFixed(1) : 'N/A',
            successRate: orders.total > 0 ? ((orders.completed / orders.total) * 100).toFixed(1) : 'N/A',
            averageRating: products.average_rating > 0 ? products.average_rating.toFixed(1) : 'N/A',
            averageItemsPerOrder: orders.average_items_per_order.toFixed(1),
        }),
        [products, orders],
    );

    // Memoized refresh handler
    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        // In a real app, you might want to refetch data instead of reloading
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + R for refresh
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
                handleRefresh();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRefresh]);

    // Auto-refresh indicator
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        setLastUpdated(new Date());
    }, []);

    // Format last updated time
    const formatLastUpdated = useCallback((date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }, []);

    // Chart data calculations
    const orderStatusData = useMemo(() => {
        const total = orders.total;
        if (total === 0) return [];

        return [
            { name: 'Completed', value: orders.completed, percentage: (orders.completed / total) * 100, color: 'bg-green-500' },
            { name: 'Pending', value: orders.pending, percentage: (orders.pending / total) * 100, color: 'bg-yellow-500' },
            { name: 'Confirmed', value: orders.confirmed, percentage: (orders.confirmed / total) * 100, color: 'bg-blue-500' },
            { name: 'Cancelled', value: orders.cancelled, percentage: (orders.cancelled / total) * 100, color: 'bg-red-500' },
        ].filter((item) => item.value > 0);
    }, [orders]);

    const revenueData = useMemo(
        () => [
            { period: 'Today', amount: revenue.today, color: 'bg-blue-500' },
            { period: 'This Week', amount: revenue.this_week, color: 'bg-indigo-500' },
            { period: 'This Month', amount: revenue.this_month, color: 'bg-purple-500' },
            { period: 'Total', amount: revenue.total, color: 'bg-green-500' },
        ],
        [revenue],
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300';
            case 'low':
                return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300';
        }
    };

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
            user: User,
            settings: Settings,
            'check-circle': CheckCircle,
            'alert-triangle': AlertTriangle,
            'bar-chart-3': BarChart3,
            target: Target,
            calendar: Calendar,
            star: Star,
        };
        return iconMap[iconName] || Package;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section with Account Health */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name}!</h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Role: <span className="font-semibold text-blue-600 dark:text-blue-400">Seller/Artisan</span>
                                    {stats.days_as_seller > 0 && <span className="ml-2 text-sm">• {stats.days_as_seller} days as seller</span>}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your products, orders, and customer relationships</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Last Updated */}
                            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                <p>Last updated</p>
                                <p className="font-medium">{formatLastUpdated(lastUpdated)}</p>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                                title="Refresh dashboard (Ctrl+R)"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>

                            {/* Account Health Score */}
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Account Health</span>
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full ${getHealthScoreBg(stats.account_health_score)}`}
                                    >
                                        <span className={`text-sm font-bold ${getHealthScoreColor(stats.account_health_score)}`}>
                                            {stats.account_health_score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1 h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                            stats.account_health_score >= 80
                                                ? 'bg-green-500'
                                                : stats.account_health_score >= 60
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        }`}
                                        style={{ width: `${stats.account_health_score}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile & Settings Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Completeness Widget */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <User className="h-5 w-5" />
                                Profile Completeness
                            </h3>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.profile_completeness}%</span>
                        </div>

                        <div className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${profile.profile_completeness}%` }}
                            ></div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                {profile.has_avatar ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                )}
                                <span className="text-gray-600 dark:text-gray-300">Profile Picture</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {profile.email_verified ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                )}
                                <span className="text-gray-600 dark:text-gray-300">Email Verified</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {profile.business_setup ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                )}
                                <span className="text-gray-600 dark:text-gray-300">Business Setup</span>
                            </div>
                        </div>

                        {profile.missing_fields && profile.missing_fields.length > 0 && (
                            <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Missing: {profile.missing_fields.join(', ')}</p>
                            </div>
                        )}
                    </div>

                    {/* Account Settings Widget */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <Settings className="h-5 w-5" />
                                Account Settings
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Notifications</span>
                                {settings.notifications_enabled ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Two-Factor Auth</span>
                                {settings.two_factor_enabled ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Privacy Settings</span>
                                {settings.privacy_settings_configured ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Marketing Preferences</span>
                                {settings.marketing_preferences_set ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Products Card */}
                    <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.total}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Products</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400" title="Active products visible to customers">
                                {products.active} Active
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400" title="Draft products not yet published">
                                {products.draft} Draft
                            </span>
                        </div>
                        {products.created_this_week > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">+{products.created_this_week} this week</div>
                        )}
                    </div>

                    {/* Orders Card */}
                    <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                <ShoppingBag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{orders.total}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Orders</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-blue-600 dark:text-blue-400" title="Orders awaiting confirmation">
                                {orders.pending} Pending
                            </span>
                            <span className="text-green-600 dark:text-green-400" title="Successfully completed orders">
                                {orders.completed} Completed
                            </span>
                        </div>
                        {orders.today > 0 && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">+{orders.today} today</div>}
                    </div>

                    {/* Revenue Card */}
                    <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-right">
                                <p
                                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                                    title={`Total revenue: ${formatCurrency(revenue.total)}`}
                                >
                                    {formatCurrency(revenue.total)}
                                </p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-blue-600 dark:text-blue-400" title="Revenue this month">
                                {formatCurrency(revenue.this_month)} MTD
                            </span>
                            {revenue.month_growth_percentage !== 0 && (
                                <div
                                    className={`flex items-center gap-1 ${getGrowthColor(revenue.month_growth_percentage)}`}
                                    title="Month-over-month growth"
                                >
                                    {(() => {
                                        const GrowthIcon = getGrowthIcon(revenue.month_growth_percentage);
                                        return <GrowthIcon className="h-4 w-4" />;
                                    })()}
                                    <span className="text-xs font-medium">{formatPercentage(revenue.month_growth_percentage)}</span>
                                </div>
                            )}
                        </div>
                        {revenue.pending_amount > 0 && (
                            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400" title="Revenue from pending orders">
                                {formatCurrency(revenue.pending_amount)} pending
                            </div>
                        )}
                    </div>

                    {/* Customers Card */}
                    <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customers.total_unique}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Customers</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400" title="Customers who made multiple purchases">
                                {customers.returning} Returning
                            </span>
                            <span className="text-blue-600 dark:text-blue-400" title="Customer retention rate">
                                {customers.retention_rate}% Retention
                            </span>
                        </div>
                        {customers.new_this_month > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">+{customers.new_this_month} this month</div>
                        )}
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Product Performance */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <BarChart3 className="h-5 w-5" />
                            Product Performance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Total Views</span>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{products.total_views.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Average Rating</span>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{performanceMetrics.averageRating}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Conversion Rate</span>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {performanceMetrics.conversionRate !== 'N/A' ? performanceMetrics.conversionRate + '%' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Overview */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <ShoppingCart className="h-5 w-5" />
                            Order Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">This Week</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{orders.this_week}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Items/Order</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{performanceMetrics.averageItemsPerOrder}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Success Rate</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    {performanceMetrics.successRate !== 'N/A' ? performanceMetrics.successRate + '%' : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Insights */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <DollarSign className="h-5 w-5" />
                            Revenue Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Order Value</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(revenue.average_order_value)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">This Week</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(revenue.this_week)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Growth (MTD)</span>
                                <div className={`flex items-center gap-1 ${getGrowthColor(revenue.month_growth_percentage)}`}>
                                    {(() => {
                                        const GrowthIcon = getGrowthIcon(revenue.month_growth_percentage);
                                        return <GrowthIcon className="h-4 w-4" />;
                                    })()}
                                    <span className="font-semibold">{formatPercentage(revenue.month_growth_percentage)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Order Status Chart */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <BarChart3 className="h-5 w-5" />
                            Order Status Distribution
                        </h3>
                        {orderStatusData.length > 0 ? (
                            <div className="space-y-4">
                                {orderStatusData.map((item) => (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.value} ({item.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Start selling to see order distribution</p>
                            </div>
                        )}
                    </div>

                    {/* Revenue Chart */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <TrendingUp className="h-5 w-5" />
                            Revenue Overview
                        </h3>
                        <div className="space-y-4">
                            {revenueData.map((item) => {
                                const maxAmount = Math.max(...revenueData.map((d) => d.amount));
                                const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                                return (
                                    <div key={item.period} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.period}</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile & Settings Overview */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 grid gap-4 md:grid-cols-2">
                            {/* Quick Profile Access */}
                            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                        <User className="h-4 w-4" />
                                        Profile Management
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/profile"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → View Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/edit"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → Edit Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/business"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → Business Info
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Settings Access */}
                            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                        <Settings className="h-4 w-4" />
                                        Account Settings
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/settings"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → Settings Overview
                                    </Link>
                                    <Link
                                        href="/seller/settings/security"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → Security Settings
                                    </Link>
                                    <Link
                                        href="/seller/settings/notifications"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                    >
                                        → Notifications
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <Target className="h-5 w-5" />
                                Recommendations for You
                            </h3>
                            {recommendations && recommendations.length > 0 ? (
                                <div className="space-y-3">
                                    {recommendations.map((rec, index) => {
                                        const IconComponent = getIconComponent(rec.icon);
                                        return (
                                            <div key={index} className={`rounded-lg border p-4 ${getPriorityColor(rec.priority)}`}>
                                                <div className="flex items-start gap-3">
                                                    <IconComponent className="mt-0.5 h-5 w-5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{rec.title}</h4>
                                                        <p className="mt-1 text-sm opacity-80">{rec.description}</p>
                                                        {rec.action && (
                                                            <button className="mt-2 text-xs font-medium underline hover:no-underline">
                                                                {rec.action}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${
                                                            rec.priority === 'high'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                                                : rec.priority === 'medium'
                                                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                        }`}
                                                    >
                                                        {rec.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400">All caught up!</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">You're doing great managing your seller account</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <Calendar className="h-5 w-5" />
                                Recent Activity
                            </h3>
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => {
                                        const IconComponent = getIconComponent(activity.icon);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                    <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
                                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{activity.date}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                                </div>
                            )}
                        </div>

                        {/* Inventory Alerts */}
                        {(products.low_stock > 0 || products.out_of_stock > 0) && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-950/20">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-800 dark:text-red-300">
                                    <AlertTriangle className="h-5 w-5" />
                                    Inventory Alerts
                                </h3>
                                <div className="space-y-2">
                                    {products.out_of_stock > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                                            <span className="text-sm font-medium text-red-800 dark:text-red-300">Out of Stock Products</span>
                                            <span className="rounded-full bg-red-200 px-2 py-1 text-xs font-bold text-red-800 dark:bg-red-800 dark:text-red-200">
                                                {products.out_of_stock}
                                            </span>
                                        </div>
                                    )}
                                    {products.low_stock > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Low Stock Products</span>
                                            <span className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-bold text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                                                {products.low_stock}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                    <Package className="h-4 w-4" />
                                    Manage Inventory
                                </Link>
                            </div>
                        )}

                        {/* Trending Products */}
                        {Object.keys(products.trending).length > 0 && (
                            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    <TrendingUp className="h-5 w-5" />
                                    Trending Products
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(products.trending).map(([id, name]) => (
                                        <div key={id} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(name)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/seller/products/create"
                                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5" />
                                        <span className="font-medium">Add New Product</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/profile"
                                    className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-left text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-950/80"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">View Profile</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/profile/edit"
                                    className="w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950/80"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">Edit Profile</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/settings"
                                    className="w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/80"
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings className="h-5 w-5" />
                                        <span className="font-medium">Account Settings</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
