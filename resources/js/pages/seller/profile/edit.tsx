import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Save,
    Upload,
    X,
    AlertTriangle
} from 'lucide-react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
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
            const formData = new FormData();
            formData.append('avatar', selectedAvatar);
            
            router.post('/seller/profile/avatar', formData, {
                onSuccess: () => {
                    setSelectedAvatar(null);
                    setPreviewUrl(null);
                },
            });
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/seller/profile');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Update your personal information and preferences
                    </p>
                </div>

                {/* Profile Completeness */}
                <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Completeness</h3>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {user.profile_completeness}%
                        </span>
                    </div>
                    
                    <div className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div 
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${user.profile_completeness}%` }}
                        ></div>
                    </div>
                    
                    {user.missing_fields && user.missing_fields.length > 0 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    Missing Information
                                </p>
                            </div>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                Complete these fields to improve your profile: {user.missing_fields.join(', ')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Avatar Upload */}
                    <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Picture</h3>
                        
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : user.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-16 w-16 text-gray-400" />
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
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                className="hidden"
                            />
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    <Upload className="h-4 w-4" />
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
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                JPG, PNG or GIF (max 2MB)
                            </p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Personal Information</h3>
                                
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <User className="inline h-4 w-4 mr-2" />
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Mail className="inline h-4 w-4 mr-2" />
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Phone className="inline h-4 w-4 mr-2" />
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            required
                                        />
                                        {errors.phone_number && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone_number}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Calendar className="inline h-4 w-4 mr-2" />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                        {errors.date_of_birth && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date_of_birth}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <MapPin className="inline h-4 w-4 mr-2" />
                                            Address *
                                        </label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            required
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery & Payment Information */}
                            <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Delivery & Payment Information</h3>
                                
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Phone className="inline h-4 w-4 mr-2" />
                                            Delivery Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.delivery_phone}
                                            onChange={(e) => setData('delivery_phone', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            placeholder="Leave empty to use primary phone"
                                        />
                                        {errors.delivery_phone && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.delivery_phone}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <CreditCard className="inline h-4 w-4 mr-2" />
                                            GCash Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.gcash_number}
                                            onChange={(e) => setData('gcash_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            placeholder="09XXXXXXXXX"
                                        />
                                        {errors.gcash_number && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gcash_number}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            GCash Account Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.gcash_name}
                                            onChange={(e) => setData('gcash_name', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            placeholder="Name registered on GCash"
                                        />
                                        {errors.gcash_name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gcash_name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <MapPin className="inline h-4 w-4 mr-2" />
                                            Delivery Address
                                        </label>
                                        <textarea
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            placeholder="Leave empty to use primary address"
                                        />
                                        {errors.delivery_address && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.delivery_address}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Delivery Notes
                                        </label>
                                        <textarea
                                            value={data.delivery_notes}
                                            onChange={(e) => setData('delivery_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            placeholder="Any special delivery instructions..."
                                        />
                                        {errors.delivery_notes && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.delivery_notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
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