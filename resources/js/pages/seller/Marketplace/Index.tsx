import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, Eye, Gavel, Package, Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Buyer {
    id: number;
    name: string;
    avatar_url: string | null;
}

interface MyBid {
    id: number;
    proposed_price: number;
    estimated_days: number;
    status: string;
    status_label: string;
}

interface CustomOrderRequest {
    id: number;
    request_number: string;
    title: string;
    description: string;
    category: string | null;
    category_label: string | null;
    budget_min: number | null;
    budget_max: number | null;
    formatted_budget: string | null;
    quantity: number;
    preferred_deadline: string | null;
    reference_image_urls: string[];
    status: string;
    status_label: string;
    status_color: string;
    bids_count: number;
    created_at: string;
    buyer: Buyer | null;
    my_bid: MyBid | null;
    can_bid: boolean;
}

interface RecentBid {
    id: number;
    proposed_price: number;
    estimated_days: number;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    request: {
        id: number;
        title: string;
        status: string;
        buyer: { name: string } | null;
    } | null;
}

interface Props {
    requests: {
        data: CustomOrderRequest[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    myBids: RecentBid[];
    stats: {
        total_bids: number;
        pending_bids: number;
        accepted_bids: number;
        open_requests: number;
    };
    categories: Record<string, string>;
    filters: {
        search: string | null;
        category: string | null;
        min_budget: string | null;
        max_budget: string | null;
        sort: string;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/seller/dashboard' },
    { title: 'Marketplace', href: '/seller/marketplace' },
];

export default function MarketplaceIndex({ requests, myBids: _myBids, stats, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [sort, setSort] = useState(filters.sort || 'newest');

    const handleFilter = () => {
        router.get(
            '/seller/marketplace',
            {
                search: search || undefined,
                category: category !== 'all' ? category : undefined,
                sort: sort !== 'newest' ? sort : undefined,
            },
            { preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get('/seller/marketplace', { ...filters, page }, { preserveState: true });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadgeClass = (color: string) => {
        const colors: Record<string, string> = {
            yellow: 'bg-yellow-100 text-yellow-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800',
            purple: 'bg-purple-100 text-purple-800',
            orange: 'bg-orange-100 text-orange-800',
        };
        return colors[color] || colors.gray;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marketplace - Browse Custom Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <Gavel className="h-7 w-7 text-amber-500" />
                            Marketplace
                        </h1>
                        <p className="mt-1 text-gray-600">Browse and bid on custom order requests from buyers</p>
                    </div>
                    <Link href="/seller/marketplace/my-bids">
                        <Button variant="outline" className="border-amber-300 hover:bg-amber-50">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            My Bids ({stats.total_bids})
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2">
                                    <Package className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Open Requests</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.open_requests}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Gavel className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">My Total Bids</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total_bids}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending Bids</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.pending_bids}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Sparkles className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Won Bids</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.accepted_bids}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by title or description..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {Object.entries(categories).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                                        <SelectItem value="budget_high">Budget (High to Low)</SelectItem>
                                        <SelectItem value="budget_low">Budget (Low to High)</SelectItem>
                                        <SelectItem value="fewest_bids">Fewest Bids</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="bg-amber-500 hover:bg-amber-600">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Request Grid */}
                {requests.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Package className="mb-4 h-16 w-16 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">No open requests found</h3>
                            <p className="mt-1 text-gray-500">Check back later for new custom order opportunities</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {requests.data.map((request) => (
                            <Card key={request.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                {/* Image Preview */}
                                {request.reference_image_urls.length > 0 && (
                                    <div className="relative h-40 overflow-hidden bg-gray-100">
                                        <img src={request.reference_image_urls[0]} alt="Reference" className="h-full w-full object-cover" />
                                        {request.reference_image_urls.length > 1 && (
                                            <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                                                +{request.reference_image_urls.length - 1} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="truncate text-base">{request.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-500">{request.request_number}</span>
                                                {request.category_label && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {request.category_label}
                                                    </Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                        {request.my_bid && (
                                            <Badge className={getStatusBadgeClass(request.my_bid.status === 'pending' ? 'yellow' : 'green')}>
                                                Bid Sent
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <p className="line-clamp-2 text-sm text-gray-600">{request.description}</p>

                                    {/* Budget & Quantity */}
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        {request.formatted_budget && (
                                            <span className="flex items-center gap-1 font-medium text-green-600">
                                                <DollarSign className="h-4 w-4" />
                                                {request.formatted_budget}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <Package className="h-4 w-4" />
                                            Qty: {request.quantity}
                                        </span>
                                    </div>

                                    {/* Deadline */}
                                    {request.preferred_deadline && (
                                        <div className="flex items-center gap-1 text-sm text-orange-600">
                                            <Calendar className="h-4 w-4" />
                                            Deadline: {formatDate(request.preferred_deadline)}
                                        </div>
                                    )}

                                    {/* Buyer & Bids */}
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={request.buyer?.avatar_url || undefined} />
                                                <AvatarFallback className="bg-amber-100 text-xs text-amber-700">
                                                    {request.buyer?.name?.charAt(0) || 'B'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-gray-600">{request.buyer?.name || 'Buyer'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Users className="h-4 w-4" />
                                            {request.bids_count} bid{request.bids_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link href={`/seller/marketplace/${request.id}`}>
                                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                                            {request.my_bid ? (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </>
                                            ) : request.can_bid ? (
                                                <>
                                                    <Gavel className="mr-2 h-4 w-4" />
                                                    Place Bid
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </>
                                            )}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {(requests.current_page - 1) * requests.per_page + 1} to{' '}
                            {Math.min(requests.current_page * requests.per_page, requests.total)} of {requests.total} requests
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(requests.current_page - 1)}
                                disabled={requests.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(requests.current_page + 1)}
                                disabled={requests.current_page === requests.last_page}
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
