import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Download, FileSearch, Info, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface LogEntry {
    raw: string;
    timestamp: string | null;
    level: string;
    message: string;
    context: string | null;
    stack_trace: string | null;
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Logs Monitoring', href: '/admin/logs' },
];

export default function LogsIndex() {
    const { logs, pagination, filters, stats, level_counts } = usePage<SharedData & Props>().props;
    const [selectedFilter, setSelectedFilter] = useState(filters.filter);

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        router.get('/admin/logs', { filter: value, page: 1 }, { preserveState: true, replace: true });
    };

    const handleClearLogs = () => {
        if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
            router.post('/admin/logs/clear', {}, { preserveScroll: true });
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
                        <p className="text-sm text-gray-500">Monitor application logs and errors</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/logs/download">
                            <Button variant="outline" className="flex-1 sm:flex-initial">
                                <Download className="mr-2 h-4 w-4" />
                                Download Logs
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleClearLogs} className="flex-1 sm:flex-initial">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Logs
                        </Button>
                    </div>
                </div>

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
                                    router.reload({ only: ['logs', 'pagination', 'level_counts'] });
                                }}
                                className="w-full sm:w-auto"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
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
                                        {selectedFilter !== 'all' ? `No ${selectedFilter} level logs found` : 'Log file is empty or does not exist'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.current_page === 1}
                            onClick={() => {
                                router.get('/admin/logs', { ...filters, page: pagination.current_page - 1 });
                            }}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-500">
                            Page {pagination.current_page} of {pagination.total_pages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={pagination.current_page >= pagination.total_pages}
                            onClick={() => {
                                router.get('/admin/logs', { ...filters, page: pagination.current_page + 1 });
                            }}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
