import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Shield, 
    Key, 
    Lock,
    Save,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    Smartphone,
    Mail,
    Clock,
    Trash2
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Settings', href: '/seller/settings' },
    { title: 'Security', href: '/seller/settings/security' },
];

interface SellerUser {
    name: string;
    email: string;
    avatar_url?: string;
    email_verified_at?: string;
    two_factor_enabled: boolean;
    last_password_change?: string;
}

interface SecurityInfo {
    password_strength: 'weak' | 'medium' | 'strong';
    last_login_location?: string;
    active_sessions_count: number;
    failed_login_attempts: number;
    account_locked_until?: string;
}

interface SellerSecurityProps extends SharedData {
    user: SellerUser;
    securityInfo?: SecurityInfo;
}

export default function SellerSecuritySettings() {
    const { user, securityInfo: rawSecurityInfo } = usePage<SellerSecurityProps>().props;
    
    // Provide default values for securityInfo
    const securityInfo = rawSecurityInfo || {
        password_strength: 'medium' as const,
        last_login_location: undefined,
        active_sessions_count: 1,
        failed_login_attempts: 0,
        account_locked_until: undefined
    };
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const { data: deleteData, setData: setDeleteData, post: deletePost, processing: deleteProcessing } = useForm({
        password: '',
    });

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/seller/settings/password', {
            onSuccess: () => reset(),
        });
    };

    // TODO: Implement 2FA routes in backend
    const handleEnable2FA = () => {
        // post('/seller/settings/security/2fa/enable');
        console.log('2FA enable - route not implemented yet');
    };

    const handleDisable2FA = () => {
        // post('/seller/settings/security/2fa/disable');
        console.log('2FA disable - route not implemented yet');
    };

    const handleResendVerification = () => {
        post('/seller/settings/email-verification');
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
        setDeleteError(''); // Clear any previous errors
    };

    const handleConfirmDelete: FormEventHandler = (e) => {
        e.preventDefault();
        setDeleteError(''); // Clear any previous errors
        
        deletePost('/seller/settings/deactivate', {
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteData('password', '');
                setDeleteError('');
            },
            onError: (errors) => {
                // Handle specific error messages
                if (errors.password) {
                    setDeleteError(errors.password);
                } else if (errors.message) {
                    setDeleteError(errors.message);
                } else {
                    setDeleteError('The password you entered is incorrect. Please try again.');
                }
            }
        });
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteData('password', '');
        setDeleteError(''); // Clear errors when canceling
    };

    const getPasswordStrengthColor = (strength: string) => {
        switch (strength) {
            case 'strong': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
            default: return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Settings" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage your account security and authentication
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${getPasswordStrengthColor(securityInfo.password_strength)}`}>
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {securityInfo.password_strength.charAt(0).toUpperCase() + securityInfo.password_strength.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${user.two_factor_enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                                <Smartphone className={`h-5 w-5 ${user.two_factor_enabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">2FA</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${user.email_verified_at ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                <Mail className={`h-5 w-5 ${user.email_verified_at ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {user.email_verified_at ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sessions</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {securityInfo.active_sessions_count} Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Password Settings */}
                    <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Change Password
                        </h3>
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.current_password && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_password}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Password Requirements:</h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>• At least 8 characters long</li>
                                    <li>• Include uppercase and lowercase letters</li>
                                    <li>• Include at least one number</li>
                                    <li>• Include at least one special character</li>
                                </ul>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    {/* Security Features */}
                    <div className="space-y-6">
                        {/* Two-Factor Authentication */}
                        <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                Two-Factor Authentication
                            </h3>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Status</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {user.two_factor_enabled ? 'Your account is protected with 2FA' : 'Add extra security to your account'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.two_factor_enabled ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    )}
                                    <button
                                        onClick={user.two_factor_enabled ? handleDisable2FA : handleEnable2FA}
                                        disabled={processing}
                                        className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                            user.two_factor_enabled 
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                        }`}
                                    >
                                        {user.two_factor_enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Email Verification */}
                        <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Verification
                            </h3>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Address</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.email_verified_at ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                    )}
                                    {!user.email_verified_at && (
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={processing}
                                            className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            Verify Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Activity */}
                        <div className="rounded-xl border bg-white p-6 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Account Activity
                            </h3>
                            
                            <div className="space-y-3">
                                {user.last_password_change && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Last password change</span>
                                        <span className="text-gray-900 dark:text-gray-100">{user.last_password_change}</span>
                                    </div>
                                )}
                                
                                {securityInfo.last_login_location && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Last login location</span>
                                        <span className="text-gray-900 dark:text-gray-100">{securityInfo.last_login_location}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Active sessions</span>
                                    <span className="text-gray-900 dark:text-gray-100">{securityInfo.active_sessions_count}</span>
                                </div>
                                
                                {securityInfo.failed_login_attempts > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Failed login attempts</span>
                                        <span className="text-red-600 dark:text-red-400">{securityInfo.failed_login_attempts}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-3">
                                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                    <Trash2 className="h-4 w-4" />
                                    Revoke All Sessions
                                </button>
                                
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete Account Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleConfirmDelete} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-password" className="text-sm font-medium">
                                Confirm your password to delete your account
                            </Label>
                            <div className="relative">
                                <Input
                                    id="delete-password"
                                    type={showDeletePassword ? 'text' : 'password'}
                                    value={deleteData.password}
                                    onChange={(e) => {
                                        setDeleteData('password', e.target.value);
                                        if (deleteError) setDeleteError(''); // Clear error when user types
                                    }}
                                    placeholder="Enter your current password"
                                    className={`pr-10 ${
                                        (errors.password || deleteError) 
                                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : ''
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {(errors.password || deleteError) && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {deleteError || errors.password || 'Invalid password. Please check your password and try again.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium text-red-800 dark:text-red-200">Warning:</p>
                                    <p className="text-red-700 dark:text-red-300 mt-1">
                                        Deleting your account will remove all your profile data, seller applications, and business information permanently.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="flex gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelDelete}
                                disabled={deleteProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={deleteProcessing || !deleteData.password}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteProcessing ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}