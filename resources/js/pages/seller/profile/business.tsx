import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Store, 
    Save,
    AlertTriangle,
    CheckCircle,
    Calendar,
    FileText
} from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Profile', href: '/seller/profile' },
    { title: 'Business Info', href: '/seller/profile/business' },
];

interface BusinessInfo {
    id: number;
    description: string;
    type: string;
    status: string;
    reviewed_at?: string;
    admin_notes?: string;
    created_at: string;
    can_edit: boolean;
}

interface BusinessTypes {
    [key: string]: string;
}

interface SellerBusinessProps extends SharedData {
    business?: BusinessInfo;
    businessTypes: BusinessTypes;
}

export default function SellerBusinessProfile() {
    const { business: rawBusiness, businessTypes } = usePage<SellerBusinessProps>().props;

    // Provide default values for business
    const business = rawBusiness || {
        id: 0,
        description: '',
        type: '',
        status: 'pending',
        reviewed_at: undefined,
        admin_notes: undefined,
        created_at: '',
        can_edit: true
    };

    const { data, setData, put, processing, errors } = useForm({
        business_description: business?.description || '',
        business_type: business?.type || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/seller/profile/business');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Information" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Business Information</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage your business details and seller application status
                            </p>
                        </div>
                    </div>
                </div>

                {business ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Business Status */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Status</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            Current Status
                                        </label>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(business.status)}`}>
                                            {business.status === 'approved' && <CheckCircle className="mr-2 h-4 w-4" />}
                                            {business.status === 'rejected' && <AlertTriangle className="mr-2 h-4 w-4" />}
                                            {business.status === 'pending' && <Calendar className="mr-2 h-4 w-4" />}
                                            {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            Application Date
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{business.created_at}</p>
                                    </div>
                                    
                                    {business.reviewed_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                Review Date
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{business.reviewed_at}</p>
                                        </div>
                                    )}
                                    
                                    {business.admin_notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                Admin Notes
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <p className="text-sm text-gray-900 dark:text-gray-100">{business.admin_notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Details</h3>
                                    {!business.can_edit && (
                                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            Editing requires approved status
                                        </div>
                                    )}
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Store className="inline h-4 w-4 mr-2" />
                                            Business Type *
                                        </label>
                                        <select
                                            value={data.business_type}
                                            onChange={(e) => setData('business_type', e.target.value)}
                                            disabled={!business.can_edit}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            required
                                        >
                                            <option value="">Select a business type</option>
                                            {Object.entries(businessTypes).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                        {errors.business_type && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_type}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <FileText className="inline h-4 w-4 mr-2" />
                                            Business Description *
                                        </label>
                                        <textarea
                                            value={data.business_description}
                                            onChange={(e) => setData('business_description', e.target.value)}
                                            disabled={!business.can_edit}
                                            rows={6}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            placeholder="Describe your business, products, and services in detail (minimum 50 characters)..."
                                            required
                                        />
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            {data.business_description.length}/2000 characters (minimum 50 required)
                                        </p>
                                        {errors.business_description && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_description}</p>
                                        )}
                                    </div>
                                    
                                    {business.can_edit && (
                                        <div className="flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                <Save className="h-4 w-4" />
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border bg-white p-12 text-center dark:bg-gray-800">
                        <Store className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Business Application</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            You don't have a seller application yet. Apply to become a seller to access business features.
                        </p>
                        <a
                            href="/seller/apply"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                        >
                            <Store className="h-4 w-4" />
                            Apply to Become Seller
                        </a>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}