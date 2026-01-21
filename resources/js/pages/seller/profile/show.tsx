import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    Edit,
    Mail,
    MapPin,
    Phone,
    Star,
    Store,
    Target,
    TrendingUp,
    User,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Profile', href: '/seller/profile' },
];

interface SellerUser {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
    profile_picture?: string;
    avatar_url?: string;
    delivery_address?: string;
    delivery_phone?: string;
    delivery_notes?: string;
    gcash_number?: string;
    gcash_name?: string;
    role: string;
    is_active: boolean;
    email_verified_at?: string;
    last_login_at?: string;
    created_at: string;
    profile_completeness: number;
    role_display: string;
}

interface SellerApplication {
    id: number;
    business_description: string;
    business_type: string;
    status: string;
    reviewed_at?: string;
    admin_notes?: string;
    created_at: string;
}

interface ProfileStats {
    profile_score: number;
    fields_completed: number;
    total_fields: number;
    days_as_seller: number;
    account_verified: boolean;
    business_approved: boolean;
}

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    date: string;
    icon: string;
}

interface SellerProfileProps extends SharedData {
    user: SellerUser;
    sellerApplication?: SellerApplication;
    profileStats?: ProfileStats;
    recentActivity?: RecentActivity[];
}

export default function SellerProfileShow() {
    const {
        user,
        sellerApplication: rawSellerApplication,
        profileStats: rawProfileStats,
        recentActivity: rawRecentActivity,
    } = usePage<SellerProfileProps>().props;

    // Provide default values
    const sellerApplication = rawSellerApplication || null;
    const profileStats = rawProfileStats || {
        profile_score: 0,
        fields_completed: 0,
        total_fields: 10,
        days_as_seller: 0,
        account_verified: false,
        business_approved: false,
    };
    const recentActivity = rawRecentActivity || [];

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
            user: User,
            mail: Mail,
            'mail-check': CheckCircle,
            'check-circle': CheckCircle,
            'x-circle': AlertTriangle,
            clock: Clock,
        };
        return iconMap[iconName] || User;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Profile" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Profile Header */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200 sm:h-24 sm:w-24">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/seller/profile/edit"
                                    className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1.5 text-white transition-colors hover:bg-blue-600 sm:p-2"
                                >
                                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Link>
                            </div>

                            {/* Profile Info */}
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{user.name}</h1>
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 sm:px-3 sm:py-1 sm:text-sm">
                                        {user.role_display}
                                    </span>
                                    {user.email_verified_at && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 sm:px-3 sm:py-1 sm:text-sm">
                                            <CheckCircle className="mr-1 h-3 w-3" style={{ color: '#16a34a' }} />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start sm:text-base">
                                    <Mail className="h-4 w-4" style={{ color: '#6b7280' }} />
                                    <span className="truncate">{user.email}</span>
                                </p>
                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">Member since {user.created_at}</p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Link
                            href="/seller/profile/edit"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 sm:text-base"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-blue-100 p-1.5 sm:p-2">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#2563eb' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Profile Score</p>
                                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{profileStats.profile_score}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-green-100 p-1.5 sm:p-2">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#16a34a' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Completed Fields</p>
                                <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                                    {profileStats.fields_completed}/{profileStats.total_fields}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-purple-100 p-1.5 sm:p-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#9333ea' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Days as Seller</p>
                                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{profileStats.days_as_seller}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-yellow-100 p-1.5 sm:p-2">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#ca8a04' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Business Status</p>
                                <p className="text-sm font-bold text-gray-900 sm:text-base">
                                    {profileStats.business_approved ? 'Approved' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">Personal Information</h3>

                            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                        Phone Number
                                    </label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.phone_number || 'Not provided'}</p>
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                        Date of Birth
                                    </label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.date_of_birth || 'Not provided'}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                        Address
                                    </label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.address || 'Not provided'}</p>
                                </div>
                            </div>

                            <h4 className="mt-6 mb-3 text-sm font-semibold text-gray-900 sm:mt-8 sm:mb-4 sm:text-base">Delivery Information</h4>
                            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Delivery Phone</label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.delivery_phone || 'Same as primary'}</p>
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                        GCash Number
                                    </label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.gcash_number || 'Not provided'}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Delivery Address</label>
                                    <p className="text-sm text-gray-900 sm:text-base">{user.delivery_address || 'Same as primary address'}</p>
                                </div>

                                {user.delivery_notes && (
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Delivery Notes</label>
                                        <p className="text-sm text-gray-900 sm:text-base">{user.delivery_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Business Information */}
                        {sellerApplication && (
                            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:mt-6 sm:p-6">
                                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Business Information</h3>
                                    <Link href="/seller/profile/business" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Edit Business Info
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                            Business Type
                                        </label>
                                        <p className="text-sm text-gray-900 sm:text-base">{sellerApplication.business_type}</p>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">
                                            Business Description
                                        </label>
                                        <p className="text-sm text-gray-900 sm:text-base">{sellerApplication.business_description}</p>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 sm:text-sm">Application Status</p>
                                            <span
                                                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm ${
                                                    sellerApplication.status === 'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : sellerApplication.status === 'rejected'
                                                          ? 'bg-red-100 text-red-800'
                                                          : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {sellerApplication.status.charAt(0).toUpperCase() + sellerApplication.status.slice(1)}
                                            </span>
                                        </div>
                                        {sellerApplication.reviewed_at && (
                                            <p className="text-xs text-gray-500 sm:text-sm">Reviewed on {sellerApplication.reviewed_at}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                        <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">Recent Activity</h3>

                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {recentActivity.map((activity, index) => {
                                    const IconComponent = getIconComponent(activity.icon);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:gap-3 sm:pb-4"
                                        >
                                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-8 sm:w-8">
                                                <IconComponent className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-gray-900 sm:text-sm">{activity.title}</p>
                                                <p className="mt-0.5 text-xs text-gray-500">{activity.description}</p>
                                                <p className="mt-1 text-xs text-gray-400">{activity.date}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-6 text-center sm:py-8">
                                <Clock className="mx-auto mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" style={{ color: '#9ca3af' }} />
                                <p className="text-sm text-gray-500">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
