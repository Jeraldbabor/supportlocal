import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle, FileText, Save, Store } from 'lucide-react';
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
        can_edit: true,
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
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Information" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                            <Store className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#2563eb' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Business Information</h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base">Manage your business details and seller application status</p>
                        </div>
                    </div>
                </div>

                {business ? (
                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                        {/* Business Status */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">Application Status</h3>

                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Current Status</label>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm ${getStatusColor(business.status)}`}
                                        >
                                            {business.status === 'approved' && <CheckCircle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" style={{ color: '#16a34a' }} />}
                                            {business.status === 'rejected' && <AlertTriangle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" style={{ color: '#dc2626' }} />}
                                            {business.status === 'pending' && <Calendar className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" style={{ color: '#ca8a04' }} />}
                                            {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Application Date</label>
                                        <p className="text-sm text-gray-900">{business.created_at}</p>
                                    </div>

                                    {business.reviewed_at && (
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Review Date</label>
                                            <p className="text-sm text-gray-900">{business.reviewed_at}</p>
                                        </div>
                                    )}

                                    {business.admin_notes && (
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:mb-2 sm:text-sm">Admin Notes</label>
                                            <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
                                                <p className="text-xs text-gray-900 sm:text-sm">{business.admin_notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Business Details</h3>
                                    {!business.can_edit && (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 sm:text-sm">
                                            <AlertTriangle className="h-4 w-4" style={{ color: '#d97706' }} />
                                            Editing requires approved status
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <Store className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Business Type *
                                        </label>
                                        <select
                                            value={data.business_type}
                                            onChange={(e) => setData('business_type', e.target.value)}
                                            disabled={!business.can_edit}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                            required
                                        >
                                            <option value="">Select a business type</option>
                                            {Object.entries(businessTypes).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.business_type && (
                                            <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.business_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <FileText className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Business Description *
                                        </label>
                                        <textarea
                                            value={data.business_description}
                                            onChange={(e) => setData('business_description', e.target.value)}
                                            disabled={!business.can_edit}
                                            rows={6}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                            placeholder="Describe your business, products, and services in detail (minimum 50 characters)..."
                                            required
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500 sm:mt-2">
                                            {data.business_description.length}/2000 characters (minimum 50 required)
                                        </p>
                                        {errors.business_description && (
                                            <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.business_description}</p>
                                        )}
                                    </div>

                                    {business.can_edit && (
                                        <div className="flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 sm:w-auto"
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
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center sm:p-12">
                        <Store className="mx-auto mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" style={{ color: '#9ca3af' }} />
                        <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">No Business Application</h3>
                        <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
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
