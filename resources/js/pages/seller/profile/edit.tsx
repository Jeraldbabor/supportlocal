import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { formatDateForInput } from '@/utils/date';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, CreditCard, Mail, MapPin, Phone, Save, Upload, User, X } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Profile', href: '/seller/profile' },
    { title: 'Edit Profile', href: '/seller/profile/edit' },
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
    profile_completeness: number;
    missing_fields: string[];
}

interface SellerProfileEditProps extends SharedData {
    user: SellerUser;
}

export default function SellerProfileEdit() {
    const { user } = usePage<SellerProfileEditProps>().props;
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: formatDateForInput(user.date_of_birth),
        delivery_address: user.delivery_address || '',
        delivery_phone: user.delivery_phone || '',
        delivery_notes: user.delivery_notes || '',
        gcash_number: user.gcash_number || '',
        gcash_name: user.gcash_name || '',
    });

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedAvatar(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleAvatarUpload = () => {
        if (selectedAvatar) {
            router.post(
                '/seller/profile/avatar',
                {
                    avatar: selectedAvatar,
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setSelectedAvatar(null);
                        setPreviewUrl(null);
                    },
                    onError: (errors) => {
                        console.error('Avatar upload error:', JSON.stringify(errors, null, 2));
                        const errorMessage = errors.avatar || Object.values(errors)[0] || 'Failed to upload avatar. Please try again.';
                        alert(errorMessage);
                        setSelectedAvatar(null);
                        setPreviewUrl(null);
                    },
                },
            );
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/seller/profile');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Edit Profile</h1>
                    <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Update your personal information and preferences</p>
                </div>

                {/* Profile Completeness */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Profile Completeness</h3>
                        <span className="text-xl font-bold text-blue-600 sm:text-2xl">{user.profile_completeness}%</span>
                    </div>

                    <div className="mb-3 h-2 w-full rounded-full bg-gray-200 sm:mb-4">
                        <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${user.profile_completeness}%` }}
                        ></div>
                    </div>

                    {user.missing_fields && user.missing_fields.length > 0 && (
                        <div className="rounded-lg bg-amber-50 p-3">
                            <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                                <AlertTriangle className="h-4 w-4" style={{ color: '#d97706' }} />
                                <p className="text-sm font-medium text-amber-700">Missing Information</p>
                            </div>
                            <p className="text-xs text-amber-600 sm:text-sm">
                                Complete these fields to improve your profile: {user.missing_fields.join(', ')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Avatar Upload */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">Profile Picture</h3>

                        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                            <div className="relative">
                                <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 sm:h-32 sm:w-32">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : user.avatar_url && !user.avatar_url.includes('ui-avatars.com') && !imageError ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                                        </div>
                                    )}
                                </div>
                                {previewUrl && (
                                    <button
                                        onClick={() => {
                                            setSelectedAvatar(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />

                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Upload className="h-4 w-4" style={{ color: '#374151' }} />
                                    Choose Photo
                                </button>

                                {selectedAvatar && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarUpload}
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        Upload
                                    </button>
                                )}
                            </div>

                            <p className="text-center text-xs text-gray-500">JPG, PNG or GIF (max 2MB)</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {/* Personal Information */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">Personal Information</h3>

                                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <User className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <Mail className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <Phone className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.phone_number && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.phone_number}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <Calendar className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.date_of_birth && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.date_of_birth}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <MapPin className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Address *
                                        </label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.address && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.address}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery & Payment Information */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">Delivery & Payment Information</h3>

                                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <Phone className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Delivery Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.delivery_phone}
                                            onChange={(e) => setData('delivery_phone', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Leave empty to use primary phone"
                                        />
                                        {errors.delivery_phone && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.delivery_phone}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <CreditCard className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            GCash Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.gcash_number}
                                            onChange={(e) => setData('gcash_number', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="09XXXXXXXXX"
                                        />
                                        {errors.gcash_number && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.gcash_number}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">GCash Account Name</label>
                                        <input
                                            type="text"
                                            value={data.gcash_name}
                                            onChange={(e) => setData('gcash_name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Name registered on GCash"
                                        />
                                        {errors.gcash_name && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.gcash_name}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 sm:mb-2">
                                            <MapPin className="h-4 w-4" style={{ color: '#6b7280' }} />
                                            Delivery Address
                                        </label>
                                        <textarea
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Leave empty to use primary address"
                                        />
                                        {errors.delivery_address && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.delivery_address}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">Delivery Notes</label>
                                        <textarea
                                            value={data.delivery_notes}
                                            onChange={(e) => setData('delivery_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Any special delivery instructions..."
                                        />
                                        {errors.delivery_notes && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.delivery_notes}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 sm:w-auto"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
