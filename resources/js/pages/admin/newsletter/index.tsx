import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Mail, Search, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface Subscriber {
    id: number;
    email: string;
    is_active: boolean;
    subscribed_at: string | null;
    unsubscribed_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

interface Props {
    subscribers: {
        data: Subscriber[];
        links: PaginationLink[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        total: number;
        active: number;
        unsubscribed: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Newsletter Subscribers', href: '/admin/newsletter' },
];

export default function NewsletterIndex() {
    const { subscribers, filters, stats } = usePage<SharedData & Props>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isToggling, setIsToggling] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            '/admin/newsletter',
            {
                search: searchTerm,
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
        setSelectedStatus('all');
        router.get('/admin/newsletter', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
            setIsDeleting(id);
            router.delete(`/admin/newsletter/${id}`, {
                preserveScroll: true,
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        setIsToggling(id);
        router.post(`/admin/newsletter/${id}/toggle`, {}, {
            preserveScroll: true,
            onFinish: () => setIsToggling(null),
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (selectedStatus !== 'all') {
            params.append('status', selectedStatus);
        }
        window.location.href = `/admin/newsletter/export?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Newsletter Subscribers" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Newsletter Subscribers</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage users who subscribed to your newsletter</p>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Total Subscribers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-400" />
                                <span className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-green-500" />
                                <span className="text-xl font-bold text-green-600 sm:text-2xl">{stats.active}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Unsubscribed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="text-xl font-bold text-gray-500 sm:text-2xl">{stats.unsubscribed}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" style={{ color: '#6b7280' }} />
                                    <Input
                                        placeholder="Search by email..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subscribers</SelectItem>
                                        <SelectItem value="active">Active Only</SelectItem>
                                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                                    Search
                                </Button>
                                {(searchTerm || selectedStatus !== 'all') && (
                                    <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-initial">
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscribers List */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Subscribers ({subscribers.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscribers.data.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <Mail className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                <p className="text-sm text-gray-500 sm:text-base">No subscribers found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="pb-3 pr-4">Email</th>
                                            <th className="pb-3 pr-4">Status</th>
                                            <th className="pb-3 pr-4 hidden sm:table-cell">Subscribed</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {subscribers.data.map((subscriber) => (
                                            <tr key={subscriber.id} className="hover:bg-gray-50">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-none">
                                                            {subscriber.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    {subscriber.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600">Unsubscribed</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 hidden sm:table-cell">
                                                    <span className="text-sm text-gray-500">
                                                        {subscriber.subscribed_at 
                                                            ? new Date(subscriber.subscribed_at).toLocaleDateString()
                                                            : '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(subscriber.id)}
                                                            disabled={isToggling === subscriber.id}
                                                            className="h-8 w-8 p-0"
                                                            title={subscriber.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {subscriber.is_active ? (
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(subscriber.id)}
                                                            disabled={isDeleting === subscriber.id}
                                                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {subscribers.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-4">
                                {subscribers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active
                                                ? 'bg-orange-500 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
