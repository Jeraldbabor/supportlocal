import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Settings, 
    Shield, 
    Bell, 
    Eye, 
    Mail, 
    Smartphone,
    Lock,
    Key,
    CheckCircle,
    AlertTriangle,
    Edit,
    User,
    Clock
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Settings', href: '/seller/settings' },
];

interface SellerUser {
    name: string;
    email: string;
    avatar_url?: string;
    email_verified_at?: string;
    two_factor_enabled: boolean;
    last_password_change?: string;
}

interface SettingsSummary {
    notifications_enabled?: boolean;
    email_verified?: boolean;
    two_factor_enabled?: boolean;
    privacy_settings_configured?: boolean;
    marketing_preferences_set?: boolean;
    password_strength?: 'weak' | 'medium' | 'strong';
    last_login_location?: string;
    active_sessions_count?: number;
}

interface SettingsActivity {
    type: string;
    title: string;
    description: string;
    date: string;
    icon: string;
}

interface SellerSettingsProps extends SharedData {
    user: SellerUser;
    settingsSummary?: SettingsSummary;
    recentActivity?: SettingsActivity[];
}

export default function SellerSettings() {
    const { user, settingsSummary = {}, recentActivity = [] } = usePage<SellerSettingsProps>().props;

    // Provide default values for settingsSummary
    const settings = {
        notifications_enabled: false,
        email_verified: false,
        two_factor_enabled: false,
        privacy_settings_configured: false,
        marketing_preferences_set: false,
        password_strength: 'weak' as const,
        last_login_location: '',
        active_sessions_count: 0,
        ...settingsSummary
    };

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<any> } = {
            shield: Shield,
            bell: Bell,
            eye: Eye,
            mail: Mail,
            lock: Lock,
            key: Key,
            user: User,
            clock: Clock,
        };
        return iconMap[iconName] || Settings;
    };

    const getPasswordStrengthColor = (strength: string) => {
        switch (strength) {
            case 'strong': return 'text-green-600 dark:text-green-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            default: return 'text-red-600 dark:text-red-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Settings" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage your account security, privacy, and preferences
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${settings.email_verified ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                <Mail className={`h-5 w-5 ${settings.email_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {settings.email_verified ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${settings.two_factor_enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                                <Shield className={`h-5 w-5 ${settings.two_factor_enabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">2FA</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <Lock className={`h-5 w-5 ${getPasswordStrengthColor(settings.password_strength)}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</p>
                                <p className={`text-sm font-bold ${getPasswordStrengthColor(settings.password_strength)}`}>
                                    {settings.password_strength.charAt(0).toUpperCase() + settings.password_strength.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sessions</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {settings.active_sessions_count} Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Settings Categories */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Security Settings */}
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Settings
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Key className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Password</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Change your account password
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/seller/settings/security"
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                        >
                                            Change
                                        </Link>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Add extra security to your account
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {settings.two_factor_enabled ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                            )}
                                            <Link
                                                href="/seller/settings/security"
                                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                            >
                                                {settings.two_factor_enabled ? 'Manage' : 'Enable'}
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Verification</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Verify your email address
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {settings.email_verified ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {settings.email_verified ? 'Verified' : 'Verify Now'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Privacy Settings
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Profile Visibility</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Control who can see your profile
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/seller/settings/privacy"
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                        >
                                            Configure
                                        </Link>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Collection</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Manage data collection preferences
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/seller/settings/privacy"
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                        >
                                            Manage
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Order updates, account alerts
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {settings.notifications_enabled ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-gray-400" />
                                            )}
                                            <Link
                                                href="/seller/settings/notifications"
                                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                            >
                                                Configure
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Marketing Communications</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Newsletter, promotions, tips
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {settings.marketing_preferences_set ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-gray-400" />
                                            )}
                                            <Link
                                                href="/seller/settings/notifications"
                                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Security Activity
                        </h3>
                        
                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => {
                                    const IconComponent = getIconComponent(activity.icon);
                                    return (
                                        <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.date}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                            <Link
                                href="/seller/settings/security"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                <Shield className="h-4 w-4" />
                                View All Security Logs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}