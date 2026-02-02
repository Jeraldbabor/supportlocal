import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Filter, Search, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuditLog {
    id: number;
    user: User | null;
    action: string;
    action_label: string;
    model_type: string | null;
    model_id: number | null;
    description: string;
    ip_address: string;
    route: string | null;
    method: string | null;
    created_at: string;
    created_at_relative: string;
}

interface PaginatedData {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    logs: PaginatedData;
    actions: string[];
    filters: {
        action?: string;
        from_date?: string;
        to_date?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Security', href: '/admin/security' },
    { title: 'Audit Logs', href: '/admin/security/audit-logs' },
];

const getActionColor = (action: string) => {
    switch (action) {
        case 'login':
            return 'bg-green-100 text-green-800';
        case 'logout':
            return 'bg-gray-100 text-gray-800';
        case 'create':
            return 'bg-blue-100 text-blue-800';
        case 'update':
            return 'bg-yellow-100 text-yellow-800';
        case 'delete':
            return 'bg-red-100 text-red-800';
        case 'password_change':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function AuditLogs({ logs, actions, filters }: Props) {
    const flash = (usePage().props as any).flash;
    const [localFilters, setLocalFilters] = useState(filters);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages
    useEffect(() => {
        if (flash?.status) {
            setToastMessage(flash.status);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    const handleFilter = () => {
        router.get('/admin/security/audit-logs', localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(
            '/admin/security/audit-logs',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearLogs = () => {
        if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
            router.post('/admin/security/audit-logs/clear', {});
        }
    };

    const handleExport = () => {
        // Build export URL with current filters
        const params = new URLSearchParams();
        if (localFilters.action) params.append('action', localFilters.action);
        if (localFilters.from_date) params.append('from_date', localFilters.from_date);
        if (localFilters.to_date) params.append('to_date', localFilters.to_date);
        
        const exportUrl = `/admin/security/audit-logs/export${params.toString() ? '?' + params.toString() : ''}`;
        
        // Show toast before download
        setToastMessage('Exporting audit logs to Excel...');
        setToastType('success');
        setShowToast(true);
        
        window.location.href = exportUrl;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/security">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Audit Logs</h1>
                            <p className="text-muted-foreground mt-1">Track all administrative actions in the system.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="destructive" onClick={handleClearLogs}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Logs
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                    value={localFilters.action || ''}
                                    onValueChange={(value) =>
                                        setLocalFilters({ ...localFilters, action: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        {actions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.from_date || ''}
                                    onChange={(e) =>
                                        setLocalFilters({ ...localFilters, from_date: e.target.value || undefined })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.to_date || ''}
                                    onChange={(e) =>
                                        setLocalFilters({ ...localFilters, to_date: e.target.value || undefined })
                                    }
                                />
                            </div>

                            <div className="flex gap-2 pt-7">
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Audit Logs ({logs.total} records)
                        </CardTitle>
                        <CardDescription>Complete history of all administrative actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.data.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No audit logs found.</p>
                            ) : (
                                logs.data.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getActionColor(log.action)}>
                                                        {log.action_label}
                                                    </Badge>
                                                    {log.user && (
                                                        <span className="text-sm">
                                                            by <span className="font-medium">{log.user.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.ip_address}
                                                    {log.route && ` • ${log.method} ${log.route}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{log.created_at_relative}</p>
                                            <p className="text-xs text-muted-foreground">{log.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                {logs.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </AppLayout>
    );
}
