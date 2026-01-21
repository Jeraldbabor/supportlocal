import InputError from '@/components/input-error';
import LocationPicker from '@/components/LocationPicker';
import Toast from '@/components/Toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getBarangaysByCity, getCitiesByProvince, getProvinces } from '@/data/philippineLocations';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CreditCard,
    Download,
    Info,
    Key,
    MapPin,
    Phone,
    Save,
    Shield,
    Trash2,
    Truck,
    Upload,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper function to format date for HTML date input (yyyy-MM-dd)
const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    // If already in correct format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // Parse ISO timestamp and extract date portion
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
    profile_picture?: string;
    avatar?: string;
    delivery_address?: string;
    delivery_phone?: string;
    delivery_notes?: string;
    delivery_province?: string;
    delivery_city?: string;
    delivery_barangay?: string;
    delivery_street?: string;
    delivery_building_details?: string;
    delivery_latitude?: number;
    delivery_longitude?: number;
    gcash_number?: string;
    gcash_name?: string;
}

interface BuyerProfileProps {
    user: User;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function BuyerProfile({ user }: BuyerProfileProps) {
    const { flash } = usePage<BuyerProfileProps>().props;
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);

    // Location dropdown states
    const [provinces] = useState<string[]>(getProvinces());
    const [cities, setCities] = useState<string[]>([]);
    const [barangays, setBarangays] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        current_password: '',
        password: '',
        password_confirmation: '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: formatDateForInput(user.date_of_birth),
        delivery_address: user.delivery_address || '',
        delivery_phone: user.delivery_phone || '',
        delivery_notes: user.delivery_notes || '',
        delivery_province: user.delivery_province || '',
        delivery_city: user.delivery_city || '',
        delivery_barangay: user.delivery_barangay || '',
        delivery_street: user.delivery_street || '',
        delivery_building_details: user.delivery_building_details || '',
        delivery_latitude: user.delivery_latitude || null,
        delivery_longitude: user.delivery_longitude || null,
        gcash_number: user.gcash_number || '',
        gcash_name: user.gcash_name || '',
        profile_picture: null as File | null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
        confirmation_phrase: '',
    });

    // Update cities when province changes
    useEffect(() => {
        if (data.delivery_province) {
            const availableCities = getCitiesByProvince(data.delivery_province);
            setCities(availableCities);

            // Reset city and barangay if the selected city is not in the new province
            if (data.delivery_city && !availableCities.includes(data.delivery_city)) {
                setData('delivery_city', '');
                setData('delivery_barangay', '');
            }
        } else {
            setCities([]);
            setData('delivery_city', '');
            setData('delivery_barangay', '');
        }
    }, [data.delivery_province, data.delivery_city, setData]);

    // Update barangays when city changes
    useEffect(() => {
        if (data.delivery_province && data.delivery_city) {
            const availableBarangays = getBarangaysByCity(data.delivery_province, data.delivery_city);
            setBarangays(availableBarangays);

            // Reset barangay if the selected barangay is not in the new city
            if (data.delivery_barangay && !availableBarangays.includes(data.delivery_barangay)) {
                setData('delivery_barangay', '');
            }
        } else {
            setBarangays([]);
            setData('delivery_barangay', '');
        }
    }, [data.delivery_city, data.delivery_province, data.delivery_barangay, setData]);

    // Initialize cities and barangays on mount
    useEffect(() => {
        if (user.delivery_province) {
            const availableCities = getCitiesByProvince(user.delivery_province);
            setCities(availableCities);
        }
        if (user.delivery_province && user.delivery_city) {
            const availableBarangays = getBarangaysByCity(user.delivery_province, user.delivery_city);
            setBarangays(availableBarangays);
        }
    }, [user.delivery_province, user.delivery_city]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('profile_picture', file);

        // Create preview URL
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/buyer/profile', {
            forceFormData: true,
            onSuccess: () => {
                setPreviewUrl(null);
                setToastMessage('Profile updated successfully!');
                setToastType('success');
                setShowToast(true);
            },
            onError: () => {
                setToastMessage('Failed to update profile. Please check your inputs.');
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    const handleDeleteProfilePicture = () => {
        post('/buyer/profile/delete-picture', {
            onSuccess: () => {
                setPreviewUrl(null);
                setToastMessage('Profile picture deleted successfully!');
                setToastType('success');
                setShowToast(true);
            },
            onError: () => {
                setToastMessage('Failed to delete profile picture.');
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Password change form submitted');
        console.log('Form data:', passwordForm.data);

        passwordForm.post('/buyer/profile/change-password', {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Password change successful');
                passwordForm.reset();
                passwordForm.clearErrors();
                setShowPasswordForm(false);
                setToastMessage('Password changed successfully!');
                setToastType('success');
                setShowToast(true);
            },
            onError: (errors) => {
                console.log('Password change error:', errors);
                // Show specific error message if available
                const errorMessage = errors.current_password || errors.password || 'Failed to change password. Please check your inputs.';
                setToastMessage(typeof errorMessage === 'string' ? errorMessage : 'Failed to change password. Please check your inputs.');
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
        setDeleteStep(1);
    };

    const handleDeleteConfirmation = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate confirmation phrase
        if (deleteForm.data.confirmation_phrase !== 'DELETE MY ACCOUNT') {
            deleteForm.setError('confirmation_phrase', 'Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }

        deleteForm.post('/buyer/profile/delete-account', {
            onSuccess: () => {
                window.location.href = '/';
            },
            onError: () => {
                setToastMessage('Failed to delete account. Please check your password and try again.');
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    const resetDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteStep(1);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const getProfilePictureUrl = () => {
        if (previewUrl) return previewUrl;
        // Use avatar_url if available (returns full R2 URL)
        if (user?.avatar_url) return user.avatar_url;
        return null;
    };

    const getUserInitials = () => {
        return user.name
            ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
            : 'U';
    };

    return (
        <BuyerLayout>
            <Head title="My Profile" />

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

            <div className="mx-auto max-w-7xl space-y-6 p-4 pb-8 sm:space-y-8 sm:p-6 sm:pb-12">
                {/* Header with gradient background */}
                <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:rounded-2xl sm:p-6 lg:p-8">
                    <div className="relative z-10">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm sm:h-16 sm:w-16 sm:rounded-2xl">
                                <User className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
                                    My Profile
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base lg:text-lg">
                                    Manage your personal information and preferences
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                        {/* Profile Picture Section */}
                        <div className="lg:col-span-1">
                            <Card className="border-2 border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-primary/5 to-transparent p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                                            <Camera className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                                        </div>
                                        Profile Picture
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs sm:mt-2 sm:text-sm">
                                        Upload a profile picture to personalize your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4 pt-4 sm:space-y-6 sm:p-6 sm:pt-6">
                                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                                        <div className="group relative">
                                            <Avatar className="h-32 w-32 ring-2 ring-primary/10 ring-offset-2 transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/20 sm:h-40 sm:w-40 sm:ring-4 sm:ring-offset-4">
                                                <AvatarImage src={getProfilePictureUrl() || ''} alt={user.name} className="object-cover" />
                                                <AvatarFallback className="border-2 border-white bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary shadow-lg sm:border-4 sm:text-3xl">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5">
                                                <Camera className="h-5 w-5 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-6 sm:w-6" />
                                            </div>
                                        </div>

                                        <div className="flex w-full flex-col gap-2 sm:gap-3">
                                            <input
                                                id="profile_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePictureChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="profile_picture"
                                                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] sm:rounded-xl sm:px-6 sm:py-3 sm:text-base"
                                            >
                                                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">
                                                    {user.profile_picture || user.avatar ? 'Change Picture' : 'Upload Picture'}
                                                </span>
                                                <span className="sm:hidden">{user.profile_picture || user.avatar ? 'Change' : 'Upload'}</span>
                                            </label>

                                            {(user.profile_picture || user.avatar || previewUrl) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleDeleteProfilePicture}
                                                    className="flex items-center justify-center gap-2 border-red-200 py-2.5 text-sm text-red-600 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:py-3 sm:text-base"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Remove Picture</span>
                                                    <span className="sm:hidden">Remove</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="w-full rounded-lg border border-blue-100 bg-blue-50 p-2.5 sm:p-3">
                                            <p className="text-center text-xs leading-relaxed font-medium text-blue-700">
                                                💡 Recommended: Square image, at least 200x200px, max 5MB
                                            </p>
                                        </div>
                                    </div>
                                    <InputError message={errors.profile_picture} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6 sm:space-y-8 lg:col-span-2">
                            {/* Personal Information */}
                            <Card className="border-2 border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-blue-50/50 to-transparent p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                                            <User className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                        </div>
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm sm:text-base">Your basic personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4 pt-4 sm:space-y-5 sm:p-6 sm:pt-6">
                                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="phone_number"
                                                className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm"
                                            >
                                                <Phone className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                placeholder="e.g., 09123456789"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                className="h-10 border-gray-300 text-sm transition-all focus:border-primary focus:ring-primary/20 sm:h-11 sm:text-base"
                                            />
                                            <InputError message={errors.phone_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="date_of_birth"
                                                className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm"
                                            >
                                                <Calendar className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className="h-10 border-gray-300 text-sm transition-all focus:border-primary focus:ring-primary/20 sm:h-11 sm:text-base"
                                            />
                                            <InputError message={errors.date_of_birth} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm">
                                            <MapPin className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Your complete address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={3}
                                            className="resize-none border-gray-300 text-sm transition-all focus:border-primary focus:ring-primary/20 sm:text-base"
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            <Card className="border-2 border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-green-50/50 to-transparent p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10">
                                            <Truck className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                        </div>
                                        Delivery Information
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm sm:text-base">
                                        Select your delivery location using dropdowns and map pin
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4 pt-4 sm:space-y-6 sm:p-6 sm:pt-6">
                                    {/* Province, City, Barangay Dropdowns */}
                                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="delivery_province"
                                                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                                            >
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                Province *
                                            </Label>
                                            <Select value={data.delivery_province} onValueChange={(value) => setData('delivery_province', value)}>
                                                <SelectTrigger
                                                    id="delivery_province"
                                                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                                                >
                                                    <SelectValue placeholder="Select province" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100] max-h-[200px]">
                                                    {provinces.map((province) => (
                                                        <SelectItem key={province} value={province}>
                                                            {province}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.delivery_province} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_city" className="text-sm font-semibold text-gray-700">
                                                City / Municipality *
                                            </Label>
                                            <Select
                                                value={data.delivery_city}
                                                onValueChange={(value) => setData('delivery_city', value)}
                                                disabled={!data.delivery_province || cities.length === 0}
                                            >
                                                <SelectTrigger
                                                    id="delivery_city"
                                                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                                                >
                                                    <SelectValue placeholder="Select city" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100] max-h-[200px]">
                                                    {cities.map((city) => (
                                                        <SelectItem key={city} value={city}>
                                                            {city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.delivery_city} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_barangay" className="text-sm font-semibold text-gray-700">
                                                Barangay *
                                            </Label>
                                            <Select
                                                value={data.delivery_barangay}
                                                onValueChange={(value) => setData('delivery_barangay', value)}
                                                disabled={!data.delivery_city || barangays.length === 0}
                                            >
                                                <SelectTrigger
                                                    id="delivery_barangay"
                                                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                                                >
                                                    <SelectValue placeholder="Select barangay" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100] max-h-[200px]">
                                                    {barangays.map((barangay) => (
                                                        <SelectItem key={barangay} value={barangay}>
                                                            {barangay}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.delivery_barangay} />
                                        </div>
                                    </div>

                                    {/* Street Address and Building Details */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_street" className="text-sm font-semibold text-gray-700">
                                                Street Address
                                            </Label>
                                            <Input
                                                id="delivery_street"
                                                type="text"
                                                placeholder="e.g., 123 Main Street"
                                                value={data.delivery_street}
                                                onChange={(e) => setData('delivery_street', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.delivery_street} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_building_details" className="text-sm font-semibold text-gray-700">
                                                Building / Unit Details
                                            </Label>
                                            <Input
                                                id="delivery_building_details"
                                                type="text"
                                                placeholder="e.g., Bldg 5, Unit 201"
                                                value={data.delivery_building_details}
                                                onChange={(e) => setData('delivery_building_details', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.delivery_building_details} />
                                        </div>
                                    </div>

                                    {/* Map Location Picker - with auto-centering */}
                                    <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                                        <Label className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm">
                                            <MapPin className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
                                            Pin Your Exact Location on Map
                                        </Label>
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 sm:p-4">
                                            <p className="flex items-start gap-2 text-xs leading-relaxed text-blue-700 sm:text-sm">
                                                <span className="flex-shrink-0 text-base sm:text-lg">💡</span>
                                                <span>
                                                    The map will automatically center when you select Province, City, and Barangay above. You can then
                                                    click or drag the marker to fine-tune your exact location.
                                                </span>
                                            </p>
                                        </div>
                                        <div
                                            className="relative overflow-hidden rounded-lg border-2 border-gray-200 shadow-md sm:rounded-xl"
                                            style={{ height: '300px', minHeight: '250px' }}
                                        >
                                            <LocationPicker
                                                latitude={data.delivery_latitude || undefined}
                                                longitude={data.delivery_longitude || undefined}
                                                address={
                                                    data.delivery_barangay && data.delivery_city && data.delivery_province
                                                        ? `${data.delivery_barangay}, ${data.delivery_city}, ${data.delivery_province}, Philippines`
                                                        : data.delivery_city && data.delivery_province
                                                          ? `${data.delivery_city}, ${data.delivery_province}, Philippines`
                                                          : data.delivery_province
                                                            ? `${data.delivery_province}, Philippines`
                                                            : ''
                                                }
                                                centerOnAddress={true}
                                                onLocationChange={(lat, lng) => {
                                                    setData('delivery_latitude', lat);
                                                    setData('delivery_longitude', lng);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact and Notes */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                Delivery Contact Number
                                            </Label>
                                            <Input
                                                id="delivery_phone"
                                                type="tel"
                                                placeholder="e.g., 09123456789"
                                                value={data.delivery_phone}
                                                onChange={(e) => setData('delivery_phone', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.delivery_phone} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_notes" className="text-sm font-semibold text-gray-700">
                                                Delivery Notes
                                            </Label>
                                            <Input
                                                id="delivery_notes"
                                                type="text"
                                                placeholder="Landmarks, special instructions, etc."
                                                value={data.delivery_notes}
                                                onChange={(e) => setData('delivery_notes', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.delivery_notes} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card className="border-2 border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-purple-50/50 to-transparent">
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                            <CreditCard className="h-5 w-5 text-purple-600" />
                                        </div>
                                        Payment Information
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-base">Your GCash details for easy payments</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="gcash_number" className="text-sm font-semibold text-gray-700">
                                                GCash Mobile Number
                                            </Label>
                                            <Input
                                                id="gcash_number"
                                                type="tel"
                                                placeholder="e.g., 09123456789"
                                                value={data.gcash_number}
                                                onChange={(e) => setData('gcash_number', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.gcash_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="gcash_name" className="text-sm font-semibold text-gray-700">
                                                GCash Account Name
                                            </Label>
                                            <Input
                                                id="gcash_name"
                                                type="text"
                                                placeholder="Name registered to your GCash"
                                                value={data.gcash_name}
                                                onChange={(e) => setData('gcash_name', e.target.value)}
                                                className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                            />
                                            <InputError message={errors.gcash_name} />
                                        </div>
                                    </div>

                                    <Alert className="border-blue-200 bg-blue-50/50">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            <strong className="font-semibold">Secure Storage:</strong> Your GCash information is securely stored and
                                            will only be used for payment processing.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2 sm:pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center gap-2 bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:w-auto sm:px-10 sm:py-6 sm:text-base"
                            size="lg"
                        >
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5"></div>
                                    <span className="hidden sm:inline">Saving Changes...</span>
                                    <span className="sm:hidden">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Save Profile Changes</span>
                                    <span className="sm:hidden">Save Changes</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Account Security Section */}
                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
                    {/* Password Change */}
                    <Card className="border-2 border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                        <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-amber-50/50 to-transparent p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 sm:h-10 sm:w-10">
                                    <Key className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
                                </div>
                                Change Password
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm sm:text-base">Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
                            {!showPasswordForm ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(true)}
                                    className="h-11 w-full border-2 border-gray-300 text-sm font-medium transition-all duration-300 hover:border-primary hover:bg-primary/5 sm:h-12 sm:text-base"
                                >
                                    <Shield className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Change Password
                                </Button>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">
                                            Current Password
                                        </Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            required
                                            className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                        />
                                        <InputError message={passwordForm.errors.current_password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700">
                                            New Password
                                        </Label>
                                        <Input
                                            id="new_password"
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            required
                                            className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                        />
                                        <InputError message={passwordForm.errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            required
                                            className="h-11 border-gray-300 transition-all focus:border-primary focus:ring-primary/20"
                                        />
                                        <InputError message={passwordForm.errors.password_confirmation} />
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
                                        <Button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            size="default"
                                            className="flex-1 bg-gradient-to-r from-primary to-primary/90 py-2.5 text-sm shadow-md transition-all duration-300 hover:shadow-lg sm:py-3 sm:text-base"
                                        >
                                            {passwordForm.processing ? (
                                                <>
                                                    <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4"></div>
                                                    <span className="hidden sm:inline">Updating...</span>
                                                    <span className="sm:hidden">Updating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hidden sm:inline">Update Password</span>
                                                    <span className="sm:hidden">Update</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="default"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                passwordForm.reset();
                                                passwordForm.clearErrors();
                                            }}
                                            className="flex-1 border-2 border-gray-300 py-2.5 text-sm transition-all duration-300 hover:border-gray-400 sm:py-3 sm:text-base"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Export Section */}
                    <Card className="border-2 border-blue-200 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                        <CardHeader className="border-b border-blue-200 bg-gradient-to-br from-blue-50/50 to-transparent p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg text-blue-600 sm:gap-3 sm:text-xl">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                                    <Download className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                </div>
                                Export Your Data
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm sm:text-base">
                                Download a copy of all your personal data (GDPR compliant)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
                            <Alert className="mb-4 border-2 border-blue-200 bg-blue-50/80 shadow-sm sm:mb-6">
                                <Info className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                                <AlertDescription className="text-xs leading-relaxed font-medium text-blue-800 sm:text-sm">
                                    You have the right to access your personal data. This export includes all your account information, orders,
                                    ratings, conversations, and more.
                                </AlertDescription>
                            </Alert>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => (window.location.href = '/data-export')}
                                className="h-11 w-full text-sm font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] sm:h-12 sm:text-base"
                            >
                                <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Download My Data (JSON)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Account Deletion */}
                    <Card className="border-2 border-red-200 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                        <CardHeader className="border-b border-red-200 bg-gradient-to-br from-red-50/50 to-transparent p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg text-red-600 sm:gap-3 sm:text-xl">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 sm:h-10 sm:w-10">
                                    <AlertTriangle className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                                </div>
                                Delete Account
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm sm:text-base">
                                Permanently delete your account and all associated data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
                            <Alert className="mb-4 border-2 border-red-200 bg-red-50/80 shadow-sm sm:mb-6">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
                                <AlertDescription className="text-xs leading-relaxed font-medium text-red-800 sm:text-sm">
                                    <strong className="font-bold">Warning:</strong> This action cannot be undone. All your data including profile
                                    information, orders, and account history will be permanently deleted.
                                </AlertDescription>
                            </Alert>

                            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        className="h-11 w-full text-sm font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] sm:h-12 sm:text-base"
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Delete My Account
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="mx-4 sm:mx-auto sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-red-600">
                                            <AlertTriangle className="h-5 w-5" />
                                            Delete Account
                                        </DialogTitle>
                                        <DialogDescription>
                                            {deleteStep === 1
                                                ? 'This will permanently delete your account and all associated data.'
                                                : 'Please confirm your password and type the confirmation phrase to proceed.'}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {deleteStep === 1 ? (
                                        // Step 1: Warning and consequences
                                        <div className="space-y-4">
                                            <Alert className="border-red-200 bg-red-50">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <AlertDescription className="text-red-800">
                                                    <strong>This action cannot be undone.</strong> Once deleted, you will permanently lose:
                                                </AlertDescription>
                                            </Alert>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    <span>All profile information and personal data</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    <span>Order history and purchase records</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    <span>Saved addresses and payment information</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    <span>Account settings and configurations</span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>Consider:</strong> You can change your password or update your profile information instead
                                                    of deleting your account.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Step 2: Confirmation form
                                        <form onSubmit={handleDeleteConfirmation} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="delete_password">Confirm Your Password</Label>
                                                <Input
                                                    id="delete_password"
                                                    type="password"
                                                    placeholder="Enter your current password"
                                                    value={deleteForm.data.password}
                                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                                    required
                                                />
                                                <InputError message={deleteForm.errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmation_phrase">
                                                    Type <span className="font-mono font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
                                                </Label>
                                                <Input
                                                    id="confirmation_phrase"
                                                    type="text"
                                                    placeholder="DELETE MY ACCOUNT"
                                                    value={deleteForm.data.confirmation_phrase}
                                                    onChange={(e) => deleteForm.setData('confirmation_phrase', e.target.value)}
                                                    required
                                                />
                                                <InputError message={deleteForm.errors.confirmation_phrase} />
                                            </div>

                                            <Alert className="border-red-200 bg-red-50">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <AlertDescription className="text-red-800">
                                                    Once you click "Delete Account", this action cannot be reversed.
                                                </AlertDescription>
                                            </Alert>
                                        </form>
                                    )}

                                    <DialogFooter>
                                        {deleteStep === 1 ? (
                                            <div className="flex w-full gap-2">
                                                <Button type="button" variant="outline" onClick={resetDeleteModal} className="flex-1">
                                                    Cancel
                                                </Button>
                                                <Button type="button" variant="destructive" onClick={() => setDeleteStep(2)} className="flex-1">
                                                    Continue
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex w-full gap-2">
                                                <Button type="button" variant="outline" onClick={() => setDeleteStep(1)} className="flex-1">
                                                    Back
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleDeleteConfirmation}
                                                    disabled={deleteForm.processing}
                                                    className="flex-1"
                                                >
                                                    {deleteForm.processing ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Account
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BuyerLayout>
    );
}
