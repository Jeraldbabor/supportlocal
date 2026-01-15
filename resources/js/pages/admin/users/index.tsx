import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    Eye,
    Filter,
    Mail,
    MoreHorizontal,
    Search,
    Shield,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
    UserX,
    XCircle,
} from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';

interface UserData extends User {
    role_display: string;
    avatar_url: string;
    phone_number?: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    administrators: number;
    sellers: number;
    buyers: number;
}

interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: UserData[];
        links: PaginationLink[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    roles: Record<string, string>;
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

export default function UsersIndex() {
    const { users, filters, roles, stats } = usePage<SharedData & Props>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get(
            '/admin/users',
            {
                search: searchTerm,
                role: selectedRole === 'all' ? '' : selectedRole,
                status: selectedStatus === 'all' ? '' : selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get('/admin/users');
    };

    const handleToggleStatus = (userId: number) => {
        router.post(
            `/admin/users/${userId}/toggle-status`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${userId}`, {
                preserveScroll: true,
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
            <Head title="User Management" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Total Users</CardTitle>
                            <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Active</CardTitle>
                            <UserCheck className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Inactive</CardTitle>
                            <UserX className="h-3 w-3 text-red-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600 sm:text-2xl">{stats.inactive}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Administrators</CardTitle>
                            <Shield className="h-3 w-3 text-red-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.administrators}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Sellers</CardTitle>
                            <Users className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.sellers}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Buyers</CardTitle>
                            <Users className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.buyers}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage all users in the system</p>
                    </div>
                    <Link href="/admin/users/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Role</label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {Object.entries(roles).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-initial">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Email Verified
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Last Login
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Created
                                        </th>
                                        <th className="w-[70px] px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="h-8 w-8 shrink-0 rounded-full"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=7F9CF5&background=EBF4FF`;
                                                        }}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">{user.name}</div>
                                                        <div className="truncate text-sm text-muted-foreground">{user.email}</div>
                                                        {user.phone_number && (
                                                            <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <Badge className={getRoleColor(user.role || '')}>{user.role_display}</Badge>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <Badge
                                                    variant={user.is_active ? 'default' : 'secondary'}
                                                    className={
                                                        user.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                    }
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                {user.email_verified_at ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-sm">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-600">
                                                        <XCircle className="h-4 w-4" />
                                                        <span className="text-sm">Not Verified</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                {user.last_login_at ? (
                                                    <span className="text-sm">{new Date(user.last_login_at as string).toLocaleDateString()}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Never</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit User
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
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
                                                        </DropdownMenuItem>
                                                        {!user.email_verified_at && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/users/${user.id}/verify-email`} method="post">
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Verify Email
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="space-y-3 p-4 md:hidden">
                            {users.data.map((user) => (
                                <div key={user.id} className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            <img
                                                src={user.avatar_url}
                                                alt={user.name}
                                                className="h-10 w-10 shrink-0 rounded-full"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=7F9CF5&background=EBF4FF`;
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</div>
                                                {user.phone_number && <div className="mt-0.5 text-xs text-muted-foreground">{user.phone_number}</div>}
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge className={getRoleColor(user.role || '')}>{user.role_display}</Badge>
                                                    <Badge
                                                        variant={user.is_active ? 'default' : 'secondary'}
                                                        className={
                                                            user.is_active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                        }
                                                    >
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    {user.email_verified_at ? (
                                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>Verified</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-xs text-red-600">
                                                            <XCircle className="h-3 w-3" />
                                                            <span>Not Verified</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                    <div>
                                                        Last Login:{' '}
                                                        {user.last_login_at ? new Date(user.last_login_at as string).toLocaleDateString() : 'Never'}
                                                    </div>
                                                    <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 shrink-0 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit User
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
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
                                                </DropdownMenuItem>
                                                {!user.email_verified_at && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/users/${user.id}/verify-email`} method="post">
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Verify Email
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {users.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-4 py-12">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-medium">No users found</h3>
                                <p className="mt-1 text-center text-sm text-muted-foreground">
                                    {filters.search || filters.role || filters.status
                                        ? 'Try adjusting your filters'
                                        : 'Get started by creating your first user'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                        {users.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'border bg-background hover:bg-muted'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
