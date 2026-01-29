import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Link, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Eye,
    Package,
    PenTool,
    Plus,
    Search,
} from 'lucide-react';
import React, { useState } from 'react';

interface CustomOrderRequest {
    id: number;
    request_number: string;
    title: string;
    description: string;
    status: string;
    status_label: string;
    status_color: string;
    budget_min: number | null;
    budget_max: number | null;
    formatted_budget: string | null;
    quantity: number;
    preferred_deadline: string | null;
    quoted_price: number | null;
    estimated_days: number | null;
    created_at: string;
    seller: {
        id: number;
        name: string;
        avatar_url: string | null;
    };
}

interface Props {
    requests: {
        data: CustomOrderRequest[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
    statusCounts: {
        all: number;
        pending: number;
        quoted: number;
        accepted: number;
        in_progress: number;
        completed: number;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    quoted: 'bg-blue-100 text-blue-800 border-blue-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    declined: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    ready_for_checkout: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function CustomOrdersIndex({ requests, filters, statusCounts }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/buyer/custom-orders', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/buyer/custom-orders', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <BuyerLayout title="My Custom Orders">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Custom Orders</h1>
                        <p className="mt-1 text-gray-600">Track and manage your custom order requests</p>
                    </div>
                    <Link href="/buyer/custom-orders/create">
                        <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Custom Request
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'All Requests', count: statusCounts.all, status: 'all', color: 'bg-gray-100 text-gray-800' },
                        { label: 'Pending', count: statusCounts.pending, status: 'pending', color: 'bg-yellow-100 text-yellow-800' },
                        { label: 'Quoted', count: statusCounts.quoted, status: 'quoted', color: 'bg-blue-100 text-blue-800' },
                        { label: 'Accepted', count: statusCounts.accepted, status: 'accepted', color: 'bg-green-100 text-green-800' },
                        { label: 'In Progress', count: statusCounts.in_progress, status: 'in_progress', color: 'bg-purple-100 text-purple-800' },
                        { label: 'Completed', count: statusCounts.completed, status: 'completed', color: 'bg-emerald-100 text-emerald-800' },
                    ].map((stat) => (
                        <button
                            key={stat.status}
                            onClick={() => handleFilterChange('status', stat.status)}
                            className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                                filters.status === stat.status || (!filters.status && stat.status === 'all')
                                    ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                            <p className={`text-sm font-medium ${stat.color.split(' ')[1]}`}>{stat.label}</p>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by title or request number..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="quoted">Quoted</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="declined">Declined</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                {requests.data.length > 0 ? (
                    <div className="space-y-4">
                        {requests.data.map((request) => (
                            <Card key={request.id} className="overflow-hidden transition-all hover:shadow-lg">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Left Section - Request Info */}
                                        <div className="flex-1 p-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Badge className={`${statusColors[request.status]} border`}>
                                                            {request.status_label}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">#{request.request_number}</span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                                                </div>
                                            </div>

                                            <p className="mb-4 line-clamp-2 text-gray-600">{request.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {request.formatted_budget && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span>{request.formatted_budget}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span>Qty: {request.quantity}</span>
                                                </div>
                                                {request.preferred_deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-orange-600" />
                                                        <span>By {new Date(request.preferred_deadline).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Quote Info */}
                                            {request.quoted_price && (
                                                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Quoted: ₱{Number(request.quoted_price).toLocaleString()}
                                                        {request.estimated_days && ` · ${request.estimated_days} days delivery`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Seller Info & Actions */}
                                        <div className="flex flex-col items-center justify-between border-t bg-gray-50 p-6 lg:w-64 lg:border-t-0 lg:border-l">
                                            <div className="mb-4 flex flex-col items-center text-center">
                                                <Avatar className="mb-2 h-12 w-12">
                                                    <AvatarImage src={request.seller.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-amber-100 text-amber-700">
                                                        {request.seller.name?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium text-gray-900">
                                                    {request.seller.name}
                                                </p>
                                                <p className="text-sm text-gray-500">Artisan</p>
                                            </div>

                                            <Link href={`/buyer/custom-orders/${request.id}`} className="w-full">
                                                <Button variant="outline" className="w-full">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                                <PenTool className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Custom Orders Yet</h3>
                            <p className="mb-6 text-gray-600">
                                Start by creating a custom order request to get a personalized product from our talented artisans.
                            </p>
                            <Link href="/buyer/custom-orders/create">
                                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Request
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={requests.current_page === 1}
                                onClick={() =>
                                    router.get('/buyer/custom-orders', { ...filters, page: requests.current_page - 1 })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-4 text-sm text-gray-600">
                                Page {requests.current_page} of {requests.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={requests.current_page === requests.last_page}
                                onClick={() =>
                                    router.get('/buyer/custom-orders', { ...filters, page: requests.current_page + 1 })
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}
