import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package, ShoppingBag, TrendingUp, Users, User, Settings, CheckCircle, AlertTriangle, BarChart3, Target, Calendar, Star } from 'lucide-react';

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
    const { auth, profileSummary = {}, settingsSummary = {}, dashboardStats = {}, recommendations = [], recentActivity = [] } = usePage<SellerDashboardProps>().props;
    const user = auth.user;

    // Provide default values
    const profile = {
        profile_completeness: 0,
        missing_fields: [],
        has_avatar: false,
        email_verified: false,
        business_setup: false,
        ...profileSummary
    };

    const settings = {
        notifications_enabled: false,
        two_factor_enabled: false,
        privacy_settings_configured: false,
        marketing_preferences_set: false,
        ...settingsSummary
    };

    const stats = {
        profile_completeness: 0,
        account_health_score: 0,
        days_as_seller: 0,
        ...dashboardStats
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300';
            case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300';
            case 'low': return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
            default: return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300';
        }
    };

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<any> } = {
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
                                    {stats.days_as_seller > 0 && (
                                        <span className="ml-2 text-sm">• {stats.days_as_seller} days as seller</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your products, orders, and customer relationships</p>
                            </div>
                        </div>
                        
                        {/* Account Health Score */}
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Account Health</span>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getHealthScoreBg(stats.account_health_score)}`}>
                                    <span className={`text-sm font-bold ${getHealthScoreColor(stats.account_health_score)}`}>
                                        {stats.account_health_score}%
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        stats.account_health_score >= 80 ? 'bg-green-500' :
                                        stats.account_health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${stats.account_health_score}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile & Settings Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Completeness Widget */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Completeness
                            </h3>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {profile.profile_completeness}%
                            </span>
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
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                    Missing: {profile.missing_fields.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Account Settings Widget */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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

                {/* Quick Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                            <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Customers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile & Settings Overview */}
                    <div className="lg:col-span-2">
                        <div className="grid gap-4 md:grid-cols-2 mb-6">
                            {/* Quick Profile Access */}
                            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Profile Management
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/profile"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → View Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/edit"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → Edit Profile
                                    </Link>
                                    <Link
                                        href="/seller/profile/business"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → Business Info
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Settings Access */}
                            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Account Settings
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/seller/settings"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → Settings Overview
                                    </Link>
                                    <Link
                                        href="/seller/settings/security"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → Security Settings
                                    </Link>
                                    <Link
                                        href="/seller/settings/notifications"
                                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                    >
                                        → Notifications
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                                                    <IconComponent className="h-5 w-5 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{rec.title}</h4>
                                                        <p className="text-sm opacity-80 mt-1">{rec.description}</p>
                                                        {rec.action && (
                                                            <button className="mt-2 text-xs font-medium underline hover:no-underline">
                                                                {rec.action}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                    }`}>
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
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Activity
                            </h3>
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => {
                                        const IconComponent = getIconComponent(activity.icon);
                                        return (
                                            <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                    <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.date}</p>
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
