import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Mail, Search, Trash2 } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    admin_notes: string | null;
    read_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

interface Props {
    messages: {
        data: ContactMessage[];
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
        new: number;
        read: number;
        replied: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Contact Messages', href: '/admin/contact-messages' },
];

export default function ContactMessagesIndex() {
    const { messages, filters, stats } = usePage<SharedData & Props>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            '/admin/contact-messages',
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
        router.get('/admin/contact-messages', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
            setIsDeleting(id);
            router.delete(`/admin/contact-messages/${id}`, {
                preserveScroll: true,
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return (
                    <Badge className="bg-blue-500 text-white">
                        New
                    </Badge>
                );
            case 'read':
                return <Badge className="bg-gray-100 text-gray-800">Read</Badge>;
            case 'replied':
                return (
                    <Badge className="bg-green-500 text-white">
                        Replied
                    </Badge>
                );
            case 'archived':
                return <Badge variant="outline" className="border-gray-300 text-gray-700">Archived</Badge>;
            default:
                return <Badge variant="outline" className="border-gray-300 text-gray-700">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contact Messages" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Contact Messages</h1>
                    <p className="mt-1 text-sm text-gray-500">View and manage messages sent through the contact form</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Total Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">New Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-blue-600 sm:text-2xl">{stats.new}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Read</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.read}</div>
                        </CardContent>
                    </Card>
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-xs font-medium text-gray-500 sm:text-sm">Replied</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.replied}</div>
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
                                        placeholder="Search by name, email, subject, or message..."
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
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                        <SelectItem value="replied">Replied</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
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

                {/* Messages List */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Messages ({messages.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {messages.data.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <Mail className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                <p className="text-sm text-gray-500 sm:text-base">No contact messages found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {messages.data.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`rounded-lg border p-3 transition-all hover:shadow-sm sm:p-4 ${
                                            message.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{message.name}</h3>
                                                    {getStatusBadge(message.status)}
                                                </div>
                                                <div className="space-y-1.5 text-xs text-gray-500 sm:text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" style={{ color: '#6b7280' }} />
                                                        <span className="truncate">{message.email}</span>
                                                    </p>
                                                    <p className="font-medium text-gray-700">{message.subject}</p>
                                                    <p className="line-clamp-2 text-gray-500">{message.message}</p>
                                                    <p className="text-xs text-gray-400">Received: {new Date(message.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:ml-4 sm:flex-col sm:items-end">
                                                <Link
                                                    href={`/admin/contact-messages/${message.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50 sm:px-3 sm:text-sm"
                                                >
                                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">View</span>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(message.id)}
                                                    disabled={isDeleting === message.id}
                                                    className="h-8 w-8 shrink-0 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:h-auto sm:w-auto sm:px-2.5"
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {messages.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-4">
                                {messages.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active ? 'bg-orange-500 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
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
