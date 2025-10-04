import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Store, 
    Clock, 
    CheckCircle, 
    AlertTriangle,
    Edit,
    Camera,
    TrendingUp,
    Target,
    Star
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
    const { user, sellerApplication: rawSellerApplication, profileStats: rawProfileStats, recentActivity: rawRecentActivity } = usePage<SellerProfileProps>().props;

    // Provide default values
    const sellerApplication = rawSellerApplication || null;
    const profileStats = rawProfileStats || {
        profile_score: 0,
        fields_completed: 0,
        total_fields: 10,
        days_as_seller: 0,
        account_verified: false,
        business_approved: false
    };
    const recentActivity = rawRecentActivity || [];

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<any> } = {
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
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Profile Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    {user.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/seller/profile/edit"
                                    className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                </Link>
                            </div>
                            
                            {/* Profile Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {user.role_display}
                                    </span>
                                    {user.email_verified_at && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Member since {user.created_at}
                                </p>
                            </div>
                        </div>
                        
                        {/* Edit Button */}
                        <Link
                            href="/seller/profile/edit"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Profile Score</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profileStats.profile_score}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed Fields</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profileStats.fields_completed}/{profileStats.total_fields}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Days as Seller</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profileStats.days_as_seller}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Business Status</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {profileStats.business_approved ? 'Approved' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        <Phone className="inline h-4 w-4 mr-2" />
                                        Phone Number
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.phone_number || 'Not provided'}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        <Calendar className="inline h-4 w-4 mr-2" />
                                        Date of Birth
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.date_of_birth || 'Not provided'}</p>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        <MapPin className="inline h-4 w-4 mr-2" />
                                        Address
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.address || 'Not provided'}</p>
                                </div>
                            </div>
                            
                            <h4 className="mt-8 mb-4 text-md font-semibold text-gray-900 dark:text-gray-100">Delivery Information</h4>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        Delivery Phone
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.delivery_phone || 'Same as primary'}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        <CreditCard className="inline h-4 w-4 mr-2" />
                                        GCash Number
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.gcash_number || 'Not provided'}</p>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                        Delivery Address
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{user.delivery_address || 'Same as primary address'}</p>
                                </div>
                                
                                {user.delivery_notes && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            Delivery Notes
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">{user.delivery_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Business Information */}
                        {sellerApplication && (
                            <div className="mt-6 rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Information</h3>
                                    <Link
                                        href="/seller/profile/business"
                                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                    >
                                        Edit Business Info
                                    </Link>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            <Store className="inline h-4 w-4 mr-2" />
                                            Business Type
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">{sellerApplication.business_type}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            Business Description
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">{sellerApplication.business_description}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Application Status</p>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                                sellerApplication.status === 'approved' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : sellerApplication.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {sellerApplication.status.charAt(0).toUpperCase() + sellerApplication.status.slice(1)}
                                            </span>
                                        </div>
                                        {sellerApplication.reviewed_at && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Reviewed on {sellerApplication.reviewed_at}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                        
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}