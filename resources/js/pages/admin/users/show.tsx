import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowLeft, 
    Edit, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Shield, 
    User as UserIcon,
    CheckCircle,
    XCircle,
    UserCheck,
    UserX,
    Trash2,
    CreditCard,
    Truck,
} from 'lucide-react';

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
    seller_application?: any;
}

interface Props {
    user: UserData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
    { title: 'User Details', href: '#' },
];

export default function ShowUser() {
    const { user } = usePage<SharedData & Props>().props;

    const handleToggleStatus = () => {
        router.post(`/admin/users/${user.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleVerifyEmail = () => {
        router.post(`/admin/users/${user.id}/verify-email`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${user.id}`, {
                onSuccess: () => router.visit('/admin/users'),
            });
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'administrator':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'seller':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'buyer':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Details - ${user.name}`} />
            
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                            <p className="text-muted-foreground">
                                View and manage user information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                        </Link>
                        <Button 
                            variant={user.is_active ? "destructive" : "default"}
                            onClick={handleToggleStatus}
                        >
                            {user.is_active ? (
                                <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                />
                            </div>
                            <CardTitle className="text-xl">{user.name}</CardTitle>
                            <div className="flex justify-center">
                                <Badge className={getRoleColor(user.role || '')}>
                                    {user.role_display}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                                {user.email_verified_at ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            
                            {user.phone_number && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.phone_number}</span>
                                </div>
                            )}
                            
                            {user.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span className="text-sm">{user.address}</span>
                                </div>
                            )}
                            
                            {user.date_of_birth && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {new Date(user.date_of_birth).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge
                                        variant={user.is_active ? 'default' : 'secondary'}
                                        className={user.is_active 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                        }
                                    >
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-muted-foreground">Email Verified:</span>
                                    {user.email_verified_at ? (
                                        <span className="text-green-600 font-medium">Yes</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-medium">No</span>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={handleVerifyEmail}
                                                className="h-6 px-2 text-xs"
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-muted-foreground">Last Login:</span>
                                    <span>
                                        {user.last_login_at ? (
                                            new Date(user.last_login_at as string).toLocaleDateString()
                                        ) : (
                                            'Never'
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-muted-foreground">Member Since:</span>
                                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                        <p className="font-mono text-sm">{user.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <p className="text-sm">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                                        <div className="mt-1">
                                            <Badge className={getRoleColor(user.role || '')}>
                                                {user.role_display}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        {(user.delivery_address || user.delivery_phone || user.delivery_notes) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Delivery Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {user.delivery_address && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                                                <p className="text-sm">{user.delivery_address}</p>
                                            </div>
                                        )}
                                        {user.delivery_phone && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Delivery Phone</label>
                                                <p className="text-sm">{user.delivery_phone}</p>
                                            </div>
                                        )}
                                        {user.delivery_notes && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Delivery Notes</label>
                                                <p className="text-sm">{user.delivery_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Information */}
                        {(user.gcash_number || user.gcash_name) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {user.gcash_number && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">GCash Number</label>
                                                <p className="text-sm font-mono">{user.gcash_number}</p>
                                            </div>
                                        )}
                                        {user.gcash_name && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">GCash Account Name</label>
                                                <p className="text-sm">{user.gcash_name}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seller Application */}
                        {user.seller_application && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Seller Application
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                            <Badge 
                                                variant={user.seller_application.status === 'approved' ? 'default' : 'secondary'}
                                            >
                                                {user.seller_application.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                                            <p className="text-sm">{user.seller_application.business_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                                            <p className="text-sm">{user.seller_application.business_type}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                                            <p className="text-sm">
                                                {new Date(user.seller_application.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Danger Zone */}
                        <Card className="border-red-200 dark:border-red-800">
                            <CardHeader>
                                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Delete User</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Permanently delete this user and all associated data. This action cannot be undone.
                                        </p>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleDelete}
                                        className="ml-4"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}