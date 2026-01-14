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
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-600" />;
            case 'debug':
                return <FileSearch className="h-4 w-4 text-gray-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
            case 'critical':
            case 'alert':
            case 'emergency':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'info':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'debug':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Logs Monitoring</h1>
                        <p className="text-muted-foreground">Monitor application logs and errors</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/logs/download">
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download Logs
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleClearLogs}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Logs
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">File Size</CardTitle>
                            <FileSearch className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.file_size}</div>
                            <p className="text-xs text-muted-foreground">{stats.file_exists ? 'File exists' : 'File not found'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_lines.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Errors</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{level_counts.error}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{level_counts.warning}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Info</CardTitle>
                            <Info className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{level_counts.info}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-4">
                            <div className="w-48">
                                <label className="text-sm font-medium">Filter by Level</label>
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
                        <CardTitle>Application Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto">
                            {logs.length > 0 ? (
                                <div className="divide-y">
                                    {logs.map((log, index) => (
                                        <div key={index} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">{getLevelIcon(log.level)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Badge className={getLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                                                        {log.timestamp && (
                                                            <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                                                        )}
                                                    </div>
                                                    <div className="font-mono text-sm break-words whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                                        {log.message}
                                                    </div>
                                                    {log.stack_trace && (
                                                        <details className="mt-2">
                                                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                                                Show Stack Trace
                                                            </summary>
                                                            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-900">
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
                                    <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">No logs found</h3>
                                    <p className="text-muted-foreground">
                                        {selectedFilter !== 'all' ? `No ${selectedFilter} level logs found` : 'Log file is empty or does not exist'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.current_page === 1}
                            onClick={() => {
                                router.get('/admin/logs', { ...filters, page: pagination.current_page - 1 });
                            }}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
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
