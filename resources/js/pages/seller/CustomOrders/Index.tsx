import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, Eye, Inbox, Package, PenTool, Search, Sparkles } from 'lucide-react';
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
    buyer: {
        id: number;
        name: string;
        avatar_url: string | null;
        email: string;
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
        router.get('/seller/custom-orders', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/seller/custom-orders', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Custom Order Requests', href: '/seller/custom-orders' }]}>
            <Head title="Custom Order Requests" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                            <PenTool className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Custom Order Requests</h1>
                            <p className="text-gray-600">Manage custom order requests from buyers</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'All Requests', count: statusCounts.all, status: 'all', color: 'bg-gray-100 text-gray-800', icon: Inbox },
                        { label: 'Pending', count: statusCounts.pending, status: 'pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
                        { label: 'Quoted', count: statusCounts.quoted, status: 'quoted', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
                        { label: 'Accepted', count: statusCounts.accepted, status: 'accepted', color: 'bg-green-100 text-green-800', icon: Sparkles },
                        {
                            label: 'In Progress',
                            count: statusCounts.in_progress,
                            status: 'in_progress',
                            color: 'bg-purple-100 text-purple-800',
                            icon: Package,
                        },
                        {
                            label: 'Completed',
                            count: statusCounts.completed,
                            status: 'completed',
                            color: 'bg-emerald-100 text-emerald-800',
                            icon: Sparkles,
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <button
                                key={stat.status}
                                onClick={() => handleFilterChange('status', stat.status)}
                                className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                                    filters.status === stat.status || (!filters.status && stat.status === 'all')
                                        ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                                    <Icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
                                </div>
                                <p className={`text-sm font-medium ${stat.color.split(' ')[1]}`}>{stat.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Pending Requests Alert */}
                {statusCounts.pending > 0 && (
                    <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-900">
                                    {statusCounts.pending} pending request{statusCounts.pending > 1 ? 's' : ''} awaiting your response
                                </h3>
                                <p className="text-sm text-yellow-800">Respond quickly to increase your chances of winning custom orders!</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                                onClick={() => handleFilterChange('status', 'pending')}
                            >
                                View Pending
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by title, request number, or buyer name..."
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
                            <Card
                                key={request.id}
                                className={`overflow-hidden transition-all hover:shadow-lg ${
                                    request.status === 'pending' ? 'border-l-4 border-l-yellow-400' : ''
                                }`}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Left Section - Request Info */}
                                        <div className="flex-1 p-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Badge className={`${statusColors[request.status]} border`}>{request.status_label}</Badge>
                                                        <span className="text-sm text-gray-500">#{request.request_number}</span>
                                                        {request.status === 'pending' && (
                                                            <Badge className="bg-yellow-500 text-white">Action Needed</Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                                                </div>
                                            </div>

                                            <p className="mb-4 line-clamp-2 text-gray-600">{request.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {request.formatted_budget && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span>Budget: {request.formatted_budget}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span>Qty: {request.quantity}</span>
                                                </div>
                                                {request.preferred_deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-orange-600" />
                                                        <span>Need by {new Date(request.preferred_deadline).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Your Quote Info */}
                                            {request.quoted_price && (
                                                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                                                    <p className="text-sm font-medium text-green-800">
                                                        Your Quote: ₱{Number(request.quoted_price).toLocaleString()}
                                                        {request.estimated_days && ` · ${request.estimated_days} days delivery`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Buyer Info & Actions */}
                                        <div className="flex flex-col items-center justify-between border-t bg-gray-50 p-6 lg:w-64 lg:border-t-0 lg:border-l">
                                            <div className="mb-4 flex flex-col items-center text-center">
                                                <Avatar className="mb-2 h-12 w-12">
                                                    <AvatarImage src={request.buyer.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                                        {request.buyer.name?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium text-gray-900">{request.buyer.name}</p>
                                                <p className="text-sm text-gray-500">Customer</p>
                                            </div>

                                            <Link href={`/seller/custom-orders/${request.id}`} className="w-full">
                                                <Button
                                                    className={`w-full ${
                                                        request.status === 'pending'
                                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                                                            : ''
                                                    }`}
                                                    variant={request.status === 'pending' ? 'default' : 'outline'}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    {request.status === 'pending' ? 'Review & Quote' : 'View Details'}
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
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Inbox className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Custom Order Requests</h3>
                            <p className="text-gray-600">When buyers send you custom order requests, they'll appear here.</p>
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
                                onClick={() => router.get('/seller/custom-orders', { ...filters, page: requests.current_page - 1 })}
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
                                onClick={() => router.get('/seller/custom-orders', { ...filters, page: requests.current_page + 1 })}
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
