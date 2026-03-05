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
    net_total: number;
    total_commission: number;
    commission_rate: number;
    this_month: number;
    net_this_month: number;
    this_week: number;
    net_this_week: number;
    today: number;
    net_today: number;
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
            net_total: 0,
            total_commission: 0,
            commission_rate: 2,
            this_month: 0,
            net_this_month: 0,
            this_week: 0,
            net_this_week: 0,
            today: 0,
            net_today: 0,
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
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getHealthScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    // Memoized utility functions
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('fil-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    }, []);

    const formatPercentage = useCallback((value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }, []);

    const getGrowthColor = useCallback((percentage: number) => {
        if (percentage > 0) return 'text-green-600';
        if (percentage < 0) return 'text-red-600';
        return 'text-gray-600';
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
            averageRating: products.average_rating > 0 ? Number(products.average_rating).toFixed(1) : 'N/A',
            averageItemsPerOrder: Number(orders.average_items_per_order).toFixed(1),
        }),
        [products, orders],
    );

    // Memoized refresh handler
    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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
                return 'border-red-200 bg-red-50 text-red-700';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50 text-yellow-700';
            case 'low':
                return 'border-blue-200 bg-blue-50 text-blue-700';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700';
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Welcome Section with Account Health */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#2563eb' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Welcome, {user?.name}!</h1>
                                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                    Role: <span className="font-semibold text-blue-600">Seller/Artisan</span>
                                    {stats.days_as_seller > 0 && (
                                        <span className="ml-1 text-xs sm:ml-2 sm:text-sm">• {stats.days_as_seller} days as seller</span>
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">Manage your products, orders, and customer relationships</p>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <Link
                                href="/seller/products"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm hover:bg-blue-700"
                            >
                                <Package className="h-4 w-4" />
                                Add Product
                            </Link>

                            {/* Last Updated & Refresh */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="text-left text-xs text-gray-500 sm:text-right">
                                    <p>Last updated</p>
                                    <p className="font-medium">{formatLastUpdated(lastUpdated)}</p>
                                </div>

                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
                                    title="Refresh dashboard (Ctrl+R)"
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                        style={{ color: '#374151' }}
                                    />
                                    <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>

                            {/* Account Health Score */}
                            <div className="w-full sm:w-auto">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <span className="text-xs font-medium whitespace-nowrap text-gray-600 sm:text-sm">Account Health</span>
                                    <div
                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${getHealthScoreBg(stats.account_health_score)}`}
                                    >
                                        <span className={`text-xs font-bold sm:text-sm ${getHealthScoreColor(stats.account_health_score)}`}>
                                            {stats.account_health_score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-24">
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

                {/* Quick Actions Overview */}
                <div className="grid gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                                Quick Actions
                            </h3>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href="/seller/products"
                                className="block rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5" />
                                    <span className="font-medium">Products</span>
                                </div>
                            </Link>
                            <Link
                                href="/seller/products/create"
                                className="block rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-left text-indigo-700 hover:bg-indigo-100"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5" />
                                    <span className="font-medium">Add New Product</span>
                                </div>
                            </Link>
                            <Link
                                href="/seller/profile/edit"
                                className="block rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100"
                            >
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">Edit Profile</span>
                                </div>
                            </Link>
                            <Link
                                href="/seller/settings"
                                className="block rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5" />
                                    <span className="font-medium">Account Settings</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Products Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#2563eb' }} />
                            </div>
                            <div className="min-w-0 text-right">
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{products.total}</p>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Products</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:mt-4 sm:text-sm">
                            <span className="truncate text-green-600" title="Active products visible to customers">
                                {products.active} Active
                            </span>
                            <span className="truncate text-yellow-600" title="Draft products not yet published">
                                {products.draft} Draft
                            </span>
                        </div>
                        {products.created_this_week > 0 && (
                            <div className="mt-2 text-[10px] text-gray-500 sm:text-xs">+{products.created_this_week} this week</div>
                        )}
                    </div>

                    {/* Orders Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:h-12 sm:w-12">
                                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#ea580c' }} />
                            </div>
                            <div className="min-w-0 text-right">
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{orders.total}</p>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Orders</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:mt-4 sm:text-sm">
                            <span className="truncate text-blue-600" title="Orders awaiting confirmation">
                                {orders.pending} Pending
                            </span>
                            <span className="truncate text-green-600" title="Successfully completed orders">
                                {orders.completed} Completed
                            </span>
                        </div>
                        {orders.today > 0 && <div className="mt-2 text-[10px] text-gray-500 sm:text-xs">+{orders.today} today</div>}
                    </div>

                    {/* Revenue Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-12 sm:w-12">
                                <PesoIcon className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 text-right">
                                <p
                                    className="truncate text-lg font-bold text-green-700 sm:text-xl lg:text-2xl"
                                    title={`Net earnings (after ${revenue.commission_rate}% commission): ${formatCurrency(revenue.net_total || revenue.total)}`}
                                >
                                    {formatCurrency(revenue.net_total || revenue.total)}
                                </p>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Net Earnings</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:mt-4 sm:text-sm">
                            <span className="truncate text-[10px] text-blue-600 sm:text-xs" title="Net earnings this month">
                                {formatCurrency(revenue.net_this_month || revenue.this_month)} MTD
                            </span>
                            {revenue.month_growth_percentage !== 0 && (
                                <div
                                    className={`flex flex-shrink-0 items-center gap-1 ${getGrowthColor(revenue.month_growth_percentage)}`}
                                    title="Month-over-month growth"
                                >
                                    {(() => {
                                        const GrowthIcon = getGrowthIcon(revenue.month_growth_percentage);
                                        return <GrowthIcon className="h-3 w-3 sm:h-4 sm:w-4" />;
                                    })()}
                                    <span className="text-[10px] font-medium sm:text-xs">{formatPercentage(revenue.month_growth_percentage)}</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] sm:text-xs">
                            <span className="truncate text-gray-500" title={`Gross sales: ${formatCurrency(revenue.total)}`}>
                                Gross: {formatCurrency(revenue.total)}
                            </span>
                            <span className="truncate text-orange-600" title={`${revenue.commission_rate}% platform fee`}>
                                -{revenue.commission_rate}% fee
                            </span>
                        </div>
                        {revenue.pending_amount > 0 && (
                            <div className="mt-2 truncate text-[10px] text-yellow-600 sm:text-xs" title="Revenue from pending orders">
                                {formatCurrency(revenue.pending_amount)} pending
                            </div>
                        )}
                    </div>

                    {/* Customers Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:h-12 sm:w-12">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#9333ea' }} />
                            </div>
                            <div className="min-w-0 text-right">
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{customers.total_unique}</p>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Customers</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:mt-4 sm:text-sm">
                            <span className="truncate text-green-600" title="Customers who made multiple purchases">
                                {customers.returning} Returning
                            </span>
                            <span className="truncate text-blue-600" title="Customer retention rate">
                                {customers.retention_rate}% Retention
                            </span>
                        </div>
                        {customers.new_this_month > 0 && (
                            <div className="mt-2 text-[10px] text-gray-500 sm:text-xs">+{customers.new_this_month} this month</div>
                        )}
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Product Performance */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <BarChart3 className="h-5 w-5" style={{ color: '#374151' }} />
                            Product Performance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Views</span>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" style={{ color: '#3b82f6' }} />
                                    <span className="font-semibold text-gray-900">{products.total_views.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Average Rating</span>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4" style={{ color: '#eab308' }} />
                                    <span className="font-semibold text-gray-900">{performanceMetrics.averageRating}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Conversion Rate</span>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" style={{ color: '#22c55e' }} />
                                    <span className="font-semibold text-gray-900">
                                        {performanceMetrics.conversionRate !== 'N/A' ? performanceMetrics.conversionRate + '%' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Overview */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <ShoppingCart className="h-5 w-5" style={{ color: '#374151' }} />
                            Order Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">This Week</span>
                                <span className="font-semibold text-blue-600">{orders.this_week}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Avg. Items/Order</span>
                                <span className="font-semibold text-gray-900">{performanceMetrics.averageItemsPerOrder}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Success Rate</span>
                                <span className="font-semibold text-green-600">
                                    {performanceMetrics.successRate !== 'N/A' ? performanceMetrics.successRate + '%' : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Insights */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <PesoIcon className="h-5 w-5 text-gray-700" />
                            Revenue Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Gross Sales</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(revenue.total)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Platform Fee ({revenue.commission_rate}%)</span>
                                <span className="font-semibold text-orange-600">-{formatCurrency(revenue.total_commission || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <span className="text-sm font-medium text-gray-700">Net Earnings</span>
                                <span className="font-bold text-green-600">{formatCurrency(revenue.net_total || revenue.total)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Avg. Order Value</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(revenue.average_order_value)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">This Week (Net)</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(revenue.net_this_week || revenue.this_week)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Growth (MTD)</span>
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

                {/* Profile Completeness Widget */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374151' }} />
                            Profile Completeness
                        </h3>
                        <span className="flex-shrink-0 text-xl font-bold text-blue-600 sm:text-2xl">{profile.profile_completeness}%</span>
                    </div>

                    <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${profile.profile_completeness}%` }}
                        ></div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {profile.has_avatar ? (
                                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: '#22c55e' }} />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-gray-300 sm:h-4 sm:w-4"></div>
                            )}
                            <span className="text-gray-600">Profile Picture</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {profile.email_verified ? (
                                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: '#22c55e' }} />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-gray-300 sm:h-4 sm:w-4"></div>
                            )}
                            <span className="text-gray-600">Email Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {profile.business_setup ? (
                                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: '#22c55e' }} />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-gray-300 sm:h-4 sm:w-4"></div>
                            )}
                            <span className="text-gray-600">Business Setup</span>
                        </div>
                    </div>

                    {profile.missing_fields && profile.missing_fields.length > 0 && (
                        <div className="mt-4 rounded-lg bg-amber-50 p-3">
                            <p className="text-sm font-medium text-amber-700">Missing: {profile.missing_fields.join(', ')}</p>
                        </div>
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Order Status Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <BarChart3 className="h-5 w-5" style={{ color: '#374151' }} />
                            Order Status Distribution
                        </h3>
                        {orderStatusData.length > 0 ? (
                            <div className="space-y-4">
                                {orderStatusData.map((item) => (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                            <span className="text-sm text-gray-600">
                                                {item.value} ({item.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
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
                                <BarChart3 className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                <p className="text-gray-500">No orders yet</p>
                                <p className="text-sm text-gray-400">Start selling to see order distribution</p>
                            </div>
                        )}
                    </div>

                    {/* Revenue Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <TrendingUp className="h-5 w-5" style={{ color: '#374151' }} />
                            Revenue Overview
                        </h3>
                        <div className="space-y-4">
                            {revenueData.map((item) => {
                                const maxAmount = Math.max(...revenueData.map((d) => d.amount));
                                const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                                return (
                                    <div key={item.period} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{item.period}</span>
                                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-200">
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
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 font-medium text-gray-900">
                                        <User className="h-4 w-4" style={{ color: '#374151' }} />
                                        Profile Management
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/profile"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → View Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/edit"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → Edit Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/business"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → Business Info
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Settings Access */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 font-medium text-gray-900">
                                        <Settings className="h-4 w-4" style={{ color: '#374151' }} />
                                        Account Settings
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/settings"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → Settings Overview
                                    </Link>
                                    <Link
                                        href="/seller/settings/security"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → Security Settings
                                    </Link>
                                    <Link
                                        href="/seller/settings/notifications"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        → Notifications
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Target className="h-5 w-5" style={{ color: '#374151' }} />
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
                                                                ? 'bg-red-100 text-red-700'
                                                                : rec.priority === 'medium'
                                                                  ? 'bg-yellow-100 text-yellow-700'
                                                                  : 'bg-blue-100 text-blue-700'
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
                                    <Target className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                    <p className="text-gray-500">All caught up!</p>
                                    <p className="text-sm text-gray-400">You're doing great managing your seller account</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5" style={{ color: '#374151' }} />
                                Recent Activity
                            </h3>
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => {
                                        const IconComponent = getIconComponent(activity.icon);
                                        return (
                                            <div key={index} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                    <p className="truncate text-xs text-gray-500">{activity.description}</p>
                                                    <p className="mt-1 text-xs text-gray-400">{activity.date}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <Calendar className="mx-auto mb-2 h-8 w-8" style={{ color: '#9ca3af' }} />
                                    <p className="text-sm text-gray-500">No recent activity</p>
                                </div>
                            )}
                        </div>

                        {/* Inventory Alerts */}
                        {(products.low_stock > 0 || products.out_of_stock > 0) && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Inventory Alerts
                                </h3>
                                <div className="space-y-2">
                                    {products.out_of_stock > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-red-100 p-3">
                                            <span className="text-sm font-medium text-red-800">Out of Stock Products</span>
                                            <span className="rounded-full bg-red-200 px-2 py-1 text-xs font-bold text-red-800">
                                                {products.out_of_stock}
                                            </span>
                                        </div>
                                    )}
                                    {products.low_stock > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-yellow-100 p-3">
                                            <span className="text-sm font-medium text-yellow-800">Low Stock Products</span>
                                            <span className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-bold text-yellow-800">
                                                {products.low_stock}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <Package className="h-4 w-4" />
                                    Manage Inventory
                                </Link>
                            </div>
                        )}

                        {/* Trending Products */}
                        {Object.keys(products.trending).length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <TrendingUp className="h-5 w-5" style={{ color: '#374151' }} />
                                    Trending Products
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(products.trending).map(([id, name]) => (
                                        <div key={id} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <TrendingUp className="h-4 w-4" style={{ color: '#16a34a' }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{String(name)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/seller/products/create"
                                    className="block w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5" />
                                        <span className="font-medium">Add New Product</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/profile"
                                    className="block w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-left text-green-700 hover:bg-green-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">View Profile</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/profile/edit"
                                    className="block w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">Edit Profile</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/seller/settings"
                                    className="block w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100"
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
