import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, Eye, Gavel, Loader2, Package, Plus, Search, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CustomOrderRequest {
    id: number;
    request_number: string;
    title: string;
    description: string;
    is_public: boolean;
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
    bids_count: number;
    created_at: string;
    seller: {
        id: number;
        name: string;
        avatar_url: string | null;
    } | null;
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
        type?: string;
    };
    statusCounts: {
        all: number;
        open: number;
        pending: number;
        quoted: number;
        accepted: number;
        in_progress: number;
        ready_for_checkout: number;
        completed: number;
    };
    categories?: Record<string, string>;
}

const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
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
    const [status, setStatus] = useState(filters.status || 'all');
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState<CustomOrderRequest[]>([]);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter results locally for dropdown
    const filterResults = (searchValue: string) => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const query = searchValue.toLowerCase();
        const filtered = requests.data.filter(
            (request) =>
                request.title.toLowerCase().includes(query) ||
                request.request_number.toLowerCase().includes(query) ||
                request.description.toLowerCase().includes(query),
        );
        setSearchResults(filtered.slice(0, 5)); // Show max 5 results
        setShowDropdown(true);
        setIsSearching(false);
    };

    // Handle search input change with debounce
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setIsSearching(true);

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new timeout for live search (200ms delay)
        debounceRef.current = setTimeout(() => {
            filterResults(value);
        }, 200);
    };

    // Clear search
    const clearSearch = () => {
        setSearch('');
        setSearchResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Handle status filter change
    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get(
            '/buyer/custom-orders',
            {
                status: newStatus !== 'all' ? newStatus : undefined,
                search: search || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get('/buyer/custom-orders', { ...filters, page }, { preserveState: true });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <BuyerLayout>
            <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white py-8">
                <div className="mx-auto max-w-6xl px-4">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                <Gavel className="h-7 w-7 text-amber-500" />
                                My Custom Orders
                            </h1>
                            <p className="mt-1 text-gray-600">Manage your custom order requests and bids</p>
                        </div>
                        <Link href="/buyer/custom-orders/create">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                                <Plus className="mr-2 h-4 w-4" />
                                New Request
                            </Button>
                        </Link>
                    </div>

                    {/* Status Tabs */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'All', count: statusCounts.all },
                            { key: 'open', label: 'Open for Bids', count: statusCounts.open },
                            { key: 'accepted', label: 'In Progress', count: statusCounts.accepted + statusCounts.in_progress },
                            { key: 'ready_for_checkout', label: 'Ready', count: statusCounts.ready_for_checkout },
                            { key: 'completed', label: 'Completed', count: statusCounts.completed },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleStatusChange(tab.key)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    status === tab.key ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Live Search with Dropdown */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative" ref={dropdownRef}>
                                {/* Search Icon or Loading Spinner */}
                                {isSearching ? (
                                    <Loader2 className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 animate-spin text-amber-500" />
                                ) : (
                                    <Search className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                )}
                                <Input
                                    ref={inputRef}
                                    placeholder="Search by title or request number..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => search && searchResults.length > 0 && setShowDropdown(true)}
                                    className="pr-10 pl-10"
                                />
                                {/* Clear Button */}
                                {search && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                        title="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                {/* Search Results Dropdown */}
                                {showDropdown && (
                                    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {searchResults.length > 0 ? (
                                            <>
                                                <div className="border-b border-gray-100 px-3 py-2">
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                                    </p>
                                                </div>
                                                {searchResults.map((request) => (
                                                    <Link
                                                        key={request.id}
                                                        href={`/buyer/custom-orders/${request.id}`}
                                                        className="flex items-center gap-3 border-b border-gray-50 px-3 py-3 transition-colors last:border-0 hover:bg-amber-50"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                                            <Gavel className="h-5 w-5 text-amber-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900">{request.title}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500">#{request.request_number}</span>
                                                                <Badge className={`${statusColors[request.status]} scale-75`}>
                                                                    {request.status_label}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Eye className="h-4 w-4 shrink-0 text-gray-400" />
                                                    </Link>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-3 py-6 text-center">
                                                <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                                <p className="text-sm text-gray-500">No matching orders found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requests List */}
                    {requests.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Gavel className="mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-900">No custom orders yet</h3>
                                <p className="mt-1 text-gray-500">Create your first request to get started</p>
                                <Link href="/buyer/custom-orders/create">
                                    <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Request
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {requests.data.map((request) => (
                                <Card key={request.id} className="overflow-hidden transition-shadow hover:shadow-md">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Main Info */}
                                            <div className="flex-1 p-4 md:p-6">
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <Badge className={statusColors[request.status]}>{request.status_label}</Badge>
                                                    {request.is_public && (
                                                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                                            <Gavel className="mr-1 h-3 w-3" />
                                                            Bidding
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h3 className="mb-1 text-lg font-semibold text-gray-900">{request.title}</h3>
                                                <p className="mb-3 text-sm text-gray-500">
                                                    #{request.request_number} • Created {formatDate(request.created_at)}
                                                </p>

                                                <p className="mb-4 line-clamp-2 text-sm text-gray-600">{request.description}</p>

                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {request.formatted_budget && (
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            {request.formatted_budget}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Package className="h-4 w-4 text-amber-600" />
                                                        Qty: {request.quantity}
                                                    </span>
                                                    {request.preferred_deadline && (
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <Calendar className="h-4 w-4 text-orange-600" />
                                                            {formatDate(request.preferred_deadline)}
                                                        </span>
                                                    )}
                                                    {request.is_public && request.status === 'open' && (
                                                        <span className="flex items-center gap-1 font-medium text-blue-600">
                                                            <Users className="h-4 w-4" />
                                                            {request.bids_count} bid{request.bids_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Section */}
                                            <div className="flex flex-col justify-between border-t bg-gray-50 p-4 md:w-56 md:border-t-0 md:border-l">
                                                {/* Seller/Bid Info */}
                                                {request.seller ? (
                                                    <div className="mb-4 flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={request.seller.avatar_url || undefined} />
                                                            <AvatarFallback className="bg-amber-100 text-amber-700">
                                                                {request.seller.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-gray-900">{request.seller.name}</p>
                                                            <p className="text-xs text-gray-500">Artisan</p>
                                                        </div>
                                                    </div>
                                                ) : request.is_public && request.status === 'open' ? (
                                                    <div className="mb-4 rounded-lg bg-blue-100 p-3 text-center">
                                                        <Users className="mx-auto mb-1 h-6 w-6 text-blue-600" />
                                                        <p className="text-sm font-medium text-blue-800">{request.bids_count} Bids</p>
                                                        <p className="text-xs text-blue-600">Waiting for more</p>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 rounded-lg bg-gray-100 p-3 text-center">
                                                        <Clock className="mx-auto mb-1 h-6 w-6 text-gray-400" />
                                                        <p className="text-sm text-gray-600">No artisan yet</p>
                                                    </div>
                                                )}

                                                {/* Price Info */}
                                                {request.quoted_price && (
                                                    <div className="mb-4 text-center">
                                                        <p className="text-xs text-gray-500">Agreed Price</p>
                                                        <p className="text-lg font-bold text-green-600">
                                                            ₱{Number(request.quoted_price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <Link href={`/buyer/custom-orders/${request.id}`}>
                                                    <Button className="w-full bg-amber-500 hover:bg-amber-600">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {request.is_public && request.status === 'open' ? 'View Bids' : 'View Details'}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {requests.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Page {requests.current_page} of {requests.last_page} ({requests.total} total)
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
            </div>
        </BuyerLayout>
    );
}
