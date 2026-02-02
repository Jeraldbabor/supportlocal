import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Download,
    FileSearch,
    FileText,
    Info,
    LogIn,
    LogOut,
    Monitor,
    RefreshCw,
    ShieldAlert,
    Smartphone,
    Tablet,
    Trash2,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';

interface LogEntry {
    raw: string;
    timestamp: string | null;
    level: string;
    message: string;
    context: string | null;
    stack_trace: string | null;
}

interface ActivityLogEntry {
    id: number;
    user_id: number | null;
    user_name: string;
    user_email: string | null;
    user_role: string | null;
    role_display: string;
    action: string;
    action_label: string;
    description: string | null;
    ip_address: string;
    device_type: string | null;
    browser: string | null;
    platform: string | null;
    is_successful: boolean;
    failure_reason: string | null;
    created_at: string;
    created_at_relative: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    logs: LogEntry[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
    filters: {
        filter: string;
        role_filter: string;
        action_filter: string;
        tab: string;
    };
    stats: {
        file_exists: boolean;
        file_size: string;
        total_lines: number;
        last_modified: number | null;
    };
    level_counts: {
        error: number;
        warning: number;
        info: number;
        debug: number;
        other: number;
    };
    activityLogs: PaginatedData<ActivityLogEntry>;
    activityStats: {
        total_logins: number;
        total_logouts: number;
        failed_logins: number;
        today_logins: number;
        buyers_active: number;
        sellers_active: number;
        admins_active: number;
    };
    availableActions: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Logs Monitoring', href: '/admin/logs' },
];

export default function LogsIndex() {
    const { logs, pagination, filters, stats, level_counts, activityLogs, activityStats, availableActions } = usePage<SharedData & Props>().props;
    const flash = (usePage().props as any).flash;
    const [selectedFilter, setSelectedFilter] = useState(filters.filter);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role_filter);
    const [selectedActionFilter, setSelectedActionFilter] = useState(filters.action_filter);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages
    useEffect(() => {
        if (flash?.message) {
            setToastMessage(flash.message);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        router.get('/admin/logs', { filter: value, page: 1, tab: 'application' }, { replace: true });
    };

    const handleActivityFilterChange = (roleFilter: string, actionFilter: string) => {
        setSelectedRoleFilter(roleFilter);
        setSelectedActionFilter(actionFilter);
        router.get(
            '/admin/logs',
            {
                filter: selectedFilter,
                role_filter: roleFilter,
                action_filter: actionFilter,
                activity_page: 1,
                tab: 'activity',
            },
            { replace: true },
        );
    };

    const handleTabChange = (tab: string) => {
        router.get('/admin/logs', { ...filters, tab }, { replace: true });
    };

    const getDeviceIcon = (deviceType: string | null) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login':
                return <LogIn className="h-4 w-4 text-green-600" />;
            case 'logout':
                return <LogOut className="h-4 w-4 text-gray-600" />;
            case 'login_failed':
                return <ShieldAlert className="h-4 w-4 text-red-600" />;
            case 'register':
                return <User className="h-4 w-4 text-blue-600" />;
            default:
                return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActionColor = (action: string, isSuccessful: boolean) => {
        if (!isSuccessful) return 'bg-red-100 text-red-800';
        switch (action) {
            case 'login':
                return 'bg-green-100 text-green-800';
            case 'logout':
                return 'bg-gray-100 text-gray-800';
            case 'login_failed':
                return 'bg-red-100 text-red-800';
            case 'register':
                return 'bg-blue-100 text-blue-800';
            case 'password_change':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string | null) => {
        switch (role) {
            case 'administrator':
                return 'bg-purple-100 text-purple-800';
            case 'seller':
                return 'bg-blue-100 text-blue-800';
            case 'buyer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleClearApplicationLogs = () => {
        if (confirm('Are you sure you want to clear all application logs? This action cannot be undone.')) {
            router.post('/admin/logs/clear', {});
        }
    };

    const handleClearActivityLogs = () => {
        if (confirm('Are you sure you want to clear all user activity logs? This action cannot be undone.')) {
            router.post('/admin/logs/clear-activity', {});
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
            case 'critical':
            case 'alert':
            case 'emergency':
                return <XCircle className="h-4 w-4" style={{ color: '#dc2626' }} />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" style={{ color: '#ca8a04' }} />;
            case 'info':
                return <Info className="h-4 w-4" style={{ color: '#2563eb' }} />;
            case 'debug':
                return <FileSearch className="h-4 w-4" style={{ color: '#6b7280' }} />;
            default:
                return <AlertCircle className="h-4 w-4" style={{ color: '#6b7280' }} />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
            case 'critical':
            case 'alert':
            case 'emergency':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'debug':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp: string | null) => {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleString();
        } catch {
            return timestamp;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logs Monitoring" />

            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Logs Monitoring</h1>
                        <p className="text-sm text-gray-500">Monitor application logs and user activities</p>
                    </div>
                </div>

                <Tabs value={filters.tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="activity" className="gap-2">
                            <Users className="h-4 w-4" />
                            User Activity
                        </TabsTrigger>
                        <TabsTrigger value="application" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Application Logs
                        </TabsTrigger>
                    </TabsList>

                    {/* User Activity Tab */}
                    <TabsContent value="activity" className="space-y-4">
                        {/* Activity Stats */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Today's Logins</CardTitle>
                                    <LogIn className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-green-600 sm:text-2xl">{activityStats.today_logins}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Total Logins</CardTitle>
                                    <LogIn className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-blue-600 sm:text-2xl">{activityStats.total_logins}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Failed Logins</CardTitle>
                                    <ShieldAlert className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-red-600 sm:text-2xl">{activityStats.failed_logins}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Logouts</CardTitle>
                                    <LogOut className="h-4 w-4 text-gray-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-gray-600 sm:text-2xl">{activityStats.total_logouts}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Buyers Today</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-green-600 sm:text-2xl">{activityStats.buyers_active}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Sellers Today</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-blue-600 sm:text-2xl">{activityStats.sellers_active}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500">Admins Today</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-purple-600 sm:text-2xl">{activityStats.admins_active}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Activity Filters */}
                        <Card>
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                                    <div className="w-full sm:w-48">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Filter by Role</label>
                                        <Select
                                            value={selectedRoleFilter}
                                            onValueChange={(value) => handleActivityFilterChange(value, selectedActionFilter)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="administrator">Administrators</SelectItem>
                                                <SelectItem value="seller">Sellers</SelectItem>
                                                <SelectItem value="buyer">Buyers</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-48">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Filter by Action</label>
                                        <Select
                                            value={selectedActionFilter}
                                            onValueChange={(value) => handleActivityFilterChange(selectedRoleFilter, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Actions</SelectItem>
                                                <SelectItem value="login">Login</SelectItem>
                                                <SelectItem value="logout">Logout</SelectItem>
                                                <SelectItem value="login_failed">Failed Login</SelectItem>
                                                <SelectItem value="register">Registration</SelectItem>
                                                <SelectItem value="password_change">Password Change</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.get('/admin/logs', { ...filters, tab: 'activity' }, { replace: true });
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleClearActivityLogs}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear Activity Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Logs List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-gray-900 sm:text-lg">
                                    User Activity Logs ({activityLogs.total} records)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[600px] overflow-y-auto">
                                    {activityLogs.data.length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            {activityLogs.data.map((log) => (
                                                <div key={log.id} className="p-3 transition-colors hover:bg-gray-50 sm:p-4">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="mt-1 flex-shrink-0">{getActionIcon(log.action)}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                                <Badge className={getActionColor(log.action, log.is_successful)}>
                                                                    {log.action_label}
                                                                </Badge>
                                                                {log.user_role && (
                                                                    <Badge variant="outline" className={getRoleColor(log.user_role)}>
                                                                        {log.role_display}
                                                                    </Badge>
                                                                )}
                                                                <span className="text-xs text-gray-500">{log.created_at_relative}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-700">
                                                                <span className="font-medium">{log.user_name}</span>
                                                                {log.user_email && (
                                                                    <span className="text-gray-500"> ({log.user_email})</span>
                                                                )}
                                                            </div>
                                                            {log.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                                                            )}
                                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    {getDeviceIcon(log.device_type)}
                                                                    {log.browser} on {log.platform}
                                                                </span>
                                                                <span>{log.ip_address}</span>
                                                                <span>{log.created_at}</span>
                                                            </div>
                                                            {!log.is_successful && log.failure_reason && (
                                                                <p className="mt-1 text-xs text-red-600">Reason: {log.failure_reason}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Users className="mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                            <h3 className="text-lg font-medium text-gray-900">No activity logs found</h3>
                                            <p className="text-gray-500">User activities will appear here once users start logging in.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Pagination */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                disabled={activityLogs.current_page === 1}
                                onClick={() => {
                                    router.get(
                                        '/admin/logs',
                                        {
                                            ...filters,
                                            activity_page: activityLogs.current_page - 1,
                                            tab: 'activity',
                                        },
                                        { replace: true },
                                    );
                                }}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                                Page {activityLogs.current_page} of {activityLogs.last_page || 1}
                            </span>
                            <Button
                                variant="outline"
                                disabled={activityLogs.current_page >= (activityLogs.last_page || 1)}
                                onClick={() => {
                                    router.get(
                                        '/admin/logs',
                                        {
                                            ...filters,
                                            activity_page: activityLogs.current_page + 1,
                                            tab: 'activity',
                                        },
                                        { replace: true },
                                    );
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Application Logs Tab */}
                    <TabsContent value="application" className="space-y-4">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">File Size</CardTitle>
                                    <FileSearch className="h-4 w-4" style={{ color: '#6b7280' }} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-gray-900 sm:text-2xl">{stats.file_size}</div>
                                    <p className="text-xs text-gray-500">{stats.file_exists ? 'File exists' : 'File not found'}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Total Lines</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-gray-900 sm:text-2xl">{stats.total_lines.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Errors</CardTitle>
                                    <XCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-red-600 sm:text-2xl">{level_counts.error}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Warnings</CardTitle>
                                    <AlertTriangle className="h-4 w-4" style={{ color: '#ca8a04' }} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-yellow-600 sm:text-2xl">{level_counts.warning}</div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-2 md:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Info</CardTitle>
                                    <Info className="h-4 w-4" style={{ color: '#2563eb' }} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-blue-600 sm:text-2xl">{level_counts.info}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                                    <div className="w-full sm:w-48">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Filter by Level</label>
                                        <Select value={selectedFilter} onValueChange={handleFilterChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                <SelectItem value="error">Errors</SelectItem>
                                                <SelectItem value="warning">Warnings</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="debug">Debug</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.get('/admin/logs', { ...filters, tab: 'application' }, { replace: true });
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh
                                    </Button>
                                    <Link href="/admin/logs/download">
                                        <Button variant="outline" className="w-full sm:w-auto">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        onClick={handleClearApplicationLogs}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logs List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-gray-900 sm:text-lg">Application Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[600px] overflow-y-auto">
                                    {logs.length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            {logs.map((log, index) => (
                                                <div key={index} className="p-3 transition-colors hover:bg-gray-50 sm:p-4">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="mt-1 flex-shrink-0">{getLevelIcon(log.level)}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                                <Badge className={getLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                                                                {log.timestamp && (
                                                                    <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                                                                )}
                                                            </div>
                                                            <div className="font-mono text-xs break-words whitespace-pre-wrap text-gray-700 sm:text-sm">
                                                                {log.message}
                                                            </div>
                                                            {log.stack_trace && (
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                                                        Show Stack Trace
                                                                    </summary>
                                                                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs sm:p-3">
                                                                        {log.stack_trace}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <FileSearch className="mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                            <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
                                            <p className="text-gray-500">
                                                {selectedFilter !== 'all'
                                                    ? `No ${selectedFilter} level logs found`
                                                    : 'Log file is empty or does not exist'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                disabled={pagination.current_page === 1}
                                onClick={() => {
                                    router.get(
                                        '/admin/logs',
                                        { ...filters, page: pagination.current_page - 1, tab: 'application' },
                                        { replace: true },
                                    );
                                }}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                                Page {pagination.current_page} of {pagination.total_pages || 1}
                            </span>
                            <Button
                                variant="outline"
                                disabled={pagination.current_page >= (pagination.total_pages || 1)}
                                onClick={() => {
                                    router.get(
                                        '/admin/logs',
                                        { ...filters, page: pagination.current_page + 1, tab: 'application' },
                                        { replace: true },
                                    );
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </AppLayout>
    );
}
