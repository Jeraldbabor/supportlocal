import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    User as UserIcon, 
    Save, 
    Shield, 
    Camera, 
    Mail, 
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { FormEvent, ChangeEvent, useRef } from 'react';

interface UserData extends User {
    role_display: string;
    avatar_url: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
    delivery_address?: string;
    delivery_phone?: string;
    delivery_notes?: string;
    gcash_number?: string;
    gcash_name?: string;
    profile_picture?: string;
}

interface Props {
    user: UserData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile', href: '/profile' },
];

export default function EditProfile() {
    const { user } = usePage<SharedData & Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, put, processing, errors } = useForm({
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

    const { data: passwordData, setData: setPasswordData, post: postPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const { data: avatarData, setData: setAvatarData, post: postAvatar, processing: avatarProcessing } = useForm({
        avatar: null as File | null,
    });
    const { post: deleteAvatar, processing: deleteAvatarProcessing } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put('/profile');
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        postPassword('/profile/password', {
            onSuccess: () => resetPassword(),
        });
    };

    const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarData('avatar', file);
            postAvatar('/profile/avatar', {
                forceFormData: true,
            });
        }
    };

    const handleDeleteAvatar = () => {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            deleteAvatar('/profile/avatar');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />
            
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Picture */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Profile Picture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                />
                                
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                    
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarProcessing}
                                    >
                                        {avatarProcessing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload New
                                            </>
                                        )}
                                    </Button>
                                    
                                    {user.profile_picture && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleDeleteAvatar}
                                            disabled={deleteAvatarProcessing}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            {deleteAvatarProcessing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Remove
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Upload a new profile picture. Max file size: 2MB
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Supported formats: JPEG, PNG, JPG, GIF
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name *</label>
                                            <Input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address *</label>
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                                placeholder="Enter your email address"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input
                                                type="tel"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                className={errors.phone_number ? 'border-red-500' : ''}
                                                placeholder="Enter your phone number"
                                            />
                                            {errors.phone_number && (
                                                <p className="text-sm text-red-600">{errors.phone_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date of Birth</label>
                                            <Input
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className={errors.date_of_birth ? 'border-red-500' : ''}
                                            />
                                            {errors.date_of_birth && (
                                                <p className="text-sm text-red-600">{errors.date_of_birth}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Address</label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.address ? 'border-red-500' : ''}`}
                                            placeholder="Enter your address"
                                            rows={3}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Optional delivery details for orders
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Delivery Phone</label>
                                        <Input
                                            type="tel"
                                            value={data.delivery_phone}
                                            onChange={(e) => setData('delivery_phone', e.target.value)}
                                            placeholder="Enter delivery phone number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Delivery Address</label>
                                    <textarea
                                        value={data.delivery_address}
                                        onChange={(e) => setData('delivery_address', e.target.value)}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter delivery address"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Delivery Notes</label>
                                    <textarea
                                        value={data.delivery_notes}
                                        onChange={(e) => setData('delivery_notes', e.target.value)}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Special delivery instructions"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    GCash details for payments
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">GCash Number</label>
                                        <Input
                                            type="tel"
                                            value={data.gcash_number}
                                            onChange={(e) => setData('gcash_number', e.target.value)}
                                            placeholder="Enter GCash number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">GCash Account Name</label>
                                        <Input
                                            type="text"
                                            value={data.gcash_name}
                                            onChange={(e) => setData('gcash_name', e.target.value)}
                                            placeholder="Enter GCash account name"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Change */}
                        <form onSubmit={handlePasswordSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Change Password
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Password</label>
                                        <Input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            className={passwordErrors.current_password ? 'border-red-500' : ''}
                                            placeholder="Enter current password"
                                        />
                                        {passwordErrors.current_password && (
                                            <p className="text-sm text-red-600">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                className={passwordErrors.password ? 'border-red-500' : ''}
                                                placeholder="Enter new password"
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-sm text-red-600">{passwordErrors.password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Confirm New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                className={passwordErrors.password_confirmation ? 'border-red-500' : ''}
                                                placeholder="Confirm new password"
                                            />
                                            {passwordErrors.password_confirmation && (
                                                <p className="text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={passwordProcessing}>
                                            {passwordProcessing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>

                        {/* Email Verification */}
                        {!user.email_verified_at && (
                            <Card className="border-yellow-200 dark:border-yellow-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                        <Mail className="h-5 w-5" />
                                        Email Verification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm">Your email address is not verified.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Please verify your email to access all features.
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Verification
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}