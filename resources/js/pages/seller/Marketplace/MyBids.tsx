import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, Gavel, Package, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Buyer {
    id: number;
    name: string;
    avatar_url: string | null;
}

interface Request {
    id: number;
    request_number: string;
    title: string;
    category_label: string | null;
    formatted_budget: string | null;
    status: string;
    status_label: string;
    buyer: Buyer | null;
}

interface Bid {
    id: number;
    proposed_price: number;
    estimated_days: number;
    message: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    request: Request | null;
    can_withdraw: boolean;
}

interface Props {
    bids: {
        data: Bid[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
    };
    filters: {
        status: string | null;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/seller/dashboard' },
    { title: 'Marketplace', href: '/seller/marketplace' },
    { title: 'My Bids', href: '/seller/marketplace/my-bids' },
];

export default function MyBids({ bids, stats, filters }: Props) {
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/seller/marketplace/my-bids', { status: newStatus !== 'all' ? newStatus : undefined }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get('/seller/marketplace/my-bids', { ...filters, page }, { preserveState: true });
    };

    const handleWithdraw = (bidId: number) => {
        if (confirm('Are you sure you want to withdraw this bid? This action cannot be undone.')) {
            router.delete(`/seller/marketplace/bids/${bidId}`);
        }
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getStatusBadgeClass = (color: string) => {
        const colors: Record<string, string> = {
            yellow: 'bg-yellow-100 text-yellow-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800',
        };
        return colors[color] || colors.gray;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'withdrawn':
                return <Trash2 className="h-4 w-4 text-gray-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bids" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link href="/seller/marketplace">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Marketplace
                            </Button>
                        </Link>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <Gavel className="h-7 w-7 text-amber-500" />
                            My Bids
                        </h1>
                        <p className="mt-1 text-gray-600">Track all your submitted bids and their status</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${status === 'all' ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}
                        onClick={() => handleFilter('all')}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2">
                                    <Package className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Bids</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${status === 'pending' ? 'border-yellow-400 ring-2 ring-yellow-200' : ''}`}
                        onClick={() => handleFilter('pending')}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${status === 'accepted' ? 'border-green-400 ring-2 ring-green-200' : ''}`}
                        onClick={() => handleFilter('accepted')}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Accepted</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${status === 'rejected' ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                        onClick={() => handleFilter('rejected')}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Not Selected</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bids List */}
                {bids.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Gavel className="mb-4 h-16 w-16 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">No bids found</h3>
                            <p className="mt-1 text-gray-500">
                                {status !== 'all' ? `You don't have any ${status} bids` : "You haven't submitted any bids yet"}
                            </p>
                            <Link href="/seller/marketplace">
                                <Button className="mt-4 bg-amber-500 hover:bg-amber-600">Browse Marketplace</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bids.data.map((bid) => (
                            <Card key={bid.id} className="overflow-hidden transition-shadow hover:shadow-md">
                                <div className="flex flex-col md:flex-row">
                                    {/* Request Info */}
                                    <div className="flex-1 border-b p-4 md:border-r md:border-b-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <Badge className={getStatusBadgeClass(bid.status_color)}>
                                                        {getStatusIcon(bid.status)}
                                                        <span className="ml-1">{bid.status_label}</span>
                                                    </Badge>
                                                    {bid.request?.category_label && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {bid.request.category_label}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900">{bid.request?.title || 'Request Deleted'}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {bid.request?.request_number} • Bid submitted {formatDateTime(bid.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {bid.request?.buyer && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={bid.request.buyer.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-amber-100 text-xs text-amber-700">
                                                        {bid.request.buyer.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-gray-600">{bid.request.buyer.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bid Details */}
                                    <div className="flex flex-col justify-between bg-gray-50 p-4 md:w-64">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Your Bid</span>
                                                <span className="font-bold text-green-600">₱{Number(bid.proposed_price).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Delivery</span>
                                                <span className="font-medium text-gray-900">{bid.estimated_days} days</span>
                                            </div>
                                            {bid.request?.formatted_budget && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Budget</span>
                                                    <span className="text-sm text-gray-600">{bid.request.formatted_budget}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            {bid.request && (
                                                <Link href={`/seller/marketplace/${bid.request.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Button>
                                                </Link>
                                            )}
                                            {bid.can_withdraw && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleWithdraw(bid.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {bids.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {(bids.current_page - 1) * bids.per_page + 1} to {Math.min(bids.current_page * bids.per_page, bids.total)} of{' '}
                            {bids.total} bids
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(bids.current_page - 1)}
                                disabled={bids.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(bids.current_page + 1)}
                                disabled={bids.current_page === bids.last_page}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
