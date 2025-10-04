import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Calendar, Camera, CreditCard, Key, MapPin, Phone, Save, Shield, Trash2, Truck, Upload, User } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
    profile_picture?: string;
    delivery_address?: string;
    delivery_phone?: string;
    delivery_notes?: string;
    gcash_number?: string;
    gcash_name?: string;
}

interface BuyerProfileProps {
    user: User;
}

export default function BuyerProfile({ user }: BuyerProfileProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        current_password: '',
        password: '',
        password_confirmation: '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        delivery_address: user.delivery_address || '',
        delivery_phone: user.delivery_phone || '',
        delivery_notes: user.delivery_notes || '',
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
            },
        });
    };

    const handleDeleteProfilePicture = () => {
        post('/buyer/profile/delete-picture', {
            onSuccess: () => {
                setPreviewUrl(null);
            },
        });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/buyer/profile/change-password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowPasswordForm(false);
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
                // Handle errors
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
        if (user.profile_picture) return `/storage/${user.profile_picture}`;
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
        <BuyerLayout title="My Profile">
            <Head title="My Profile" />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="mt-1 text-gray-600">Manage your personal information and preferences</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Profile Picture Section */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Profile Picture
                                    </CardTitle>
                                    <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center space-y-4">
                                        <Avatar className="h-32 w-32">
                                            <AvatarImage src={getProfilePictureUrl() || ''} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex w-full flex-col gap-2">
                                            <input
                                                id="profile_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePictureChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="profile_picture"
                                                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
                                            >
                                                <Upload className="h-4 w-4" />
                                                {user.profile_picture ? 'Change Picture' : 'Upload Picture'}
                                            </label>

                                            {(user.profile_picture || previewUrl) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleDeleteProfilePicture}
                                                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove Picture
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-center text-xs text-gray-500">Recommended: Square image, at least 200x200px, max 5MB</p>
                                    </div>
                                    <InputError message={errors.profile_picture} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Your basic personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number">
                                                <Phone className="mr-1 inline h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                placeholder="e.g., 09123456789"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                            />
                                            <InputError message={errors.phone_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth">
                                                <Calendar className="mr-1 inline h-4 w-4" />
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                            />
                                            <InputError message={errors.date_of_birth} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            <MapPin className="mr-1 inline h-4 w-4" />
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Your complete address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={2}
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Delivery Information
                                    </CardTitle>
                                    <CardDescription>Where should we deliver your orders?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery_address">Delivery Address</Label>
                                        <Textarea
                                            id="delivery_address"
                                            placeholder="Street, Barangay, City, Province (if different from your address above)"
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            rows={2}
                                        />
                                        <p className="text-xs text-gray-500">Leave blank to use your address above</p>
                                        <InputError message={errors.delivery_address} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_phone">Delivery Contact Number</Label>
                                            <Input
                                                id="delivery_phone"
                                                type="tel"
                                                placeholder="Contact number for delivery"
                                                value={data.delivery_phone}
                                                onChange={(e) => setData('delivery_phone', e.target.value)}
                                            />
                                            <InputError message={errors.delivery_phone} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_notes">Delivery Notes</Label>
                                            <Input
                                                id="delivery_notes"
                                                type="text"
                                                placeholder="Special instructions for delivery"
                                                value={data.delivery_notes}
                                                onChange={(e) => setData('delivery_notes', e.target.value)}
                                            />
                                            <InputError message={errors.delivery_notes} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Information
                                    </CardTitle>
                                    <CardDescription>Your GCash details for easy payments</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="gcash_number">GCash Mobile Number</Label>
                                            <Input
                                                id="gcash_number"
                                                type="tel"
                                                placeholder="e.g., 09123456789"
                                                value={data.gcash_number}
                                                onChange={(e) => setData('gcash_number', e.target.value)}
                                            />
                                            <InputError message={errors.gcash_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="gcash_name">GCash Account Name</Label>
                                            <Input
                                                id="gcash_name"
                                                type="text"
                                                placeholder="Name registered to your GCash"
                                                value={data.gcash_name}
                                                onChange={(e) => setData('gcash_name', e.target.value)}
                                            />
                                            <InputError message={errors.gcash_name} />
                                        </div>
                                    </div>

                                    <Alert>
                                        <CreditCard className="h-4 w-4" />
                                        <AlertDescription>
                                            Your GCash information is securely stored and will only be used for payment processing.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Account Security Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showPasswordForm ? (
                                    <Button type="button" variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                ) : (
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordForm.data.current_password}
                                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                required
                                            />
                                            <InputError message={passwordForm.errors.current_password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">New Password</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                required
                                            />
                                            <InputError message={passwordForm.errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                required
                                            />
                                            <InputError message={passwordForm.errors.password_confirmation} />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={passwordForm.processing} size="sm">
                                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    passwordForm.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Deletion */}
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Account
                                </CardTitle>
                                <CardDescription>Permanently delete your account and all associated data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert className="mb-4 border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <strong>Warning:</strong> This action cannot be undone. All your data including profile information, orders,
                                        and account history will be permanently deleted.
                                    </AlertDescription>
                                </Alert>

                                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="destructive" onClick={handleDeleteAccount} className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete My Account
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-md">
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
                                                        <span>Wishlist items and preferences</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                        <span>Account settings and configurations</span>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>Consider:</strong> You can change your password or update your profile information
                                                        instead of deleting your account.
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

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="flex items-center gap-2 px-8" size="lg">
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </BuyerLayout>
    );
}
