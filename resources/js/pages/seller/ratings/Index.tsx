import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Filter, MessageSquare, Reply, Search, Star, Trash2, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Swal from 'sweetalert2';

interface Rating {
    id: number;
    rating: number;
    review: string | null;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        profile_picture: string | null;
        avatar_url: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Statistics {
    total_ratings: number;
    average_rating: number;
    ratings_with_review: number;
    replied_ratings: number;
    distribution: Array<{
        rating: number;
        count: number;
        percentage: number;
    }>;
}

interface SellerRatingsPageProps {
    ratings: {
        data: Rating[];
        links: PaginationLink[];
        current_page: number;
        per_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: {
        search?: string;
        rating?: string;
        has_reply?: string;
    };
}

export default function Index({ ratings, statistics, filters }: SellerRatingsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Seller Dashboard', href: '/seller/dashboard' },
        { title: 'Seller Ratings', href: '/seller/seller-ratings' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || '');
    const [hasReply, setHasReply] = useState(filters.has_reply || '');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/seller/seller-ratings', { search: searchTerm, rating: selectedRating, has_reply: hasReply }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRating('');
        setHasReply('');
        router.get('/seller/seller-ratings', {}, { preserveState: true });
    };

    const handleReplySubmit = async (ratingId: number) => {
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        try {
            await axios.post(`/seller/seller-ratings/${ratingId}/reply`, {
                reply: replyText,
            });

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Reply posted successfully',
                timer: 2000,
                showConfirmButton: false,
            });

            setReplyingTo(null);
            setReplyText('');
            router.reload();
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to post reply',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async (ratingId: number) => {
        const result = await Swal.fire({
            title: 'Delete Reply?',
            text: 'Are you sure you want to delete this reply?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/seller/seller-ratings/${ratingId}/reply`);

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Reply has been deleted',
                    timer: 2000,
                    showConfirmButton: false,
                });

                router.reload();
            } catch {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete reply',
                });
            }
        }
    };

    const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
        const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={sizeClass}
                style={{
                    color: i < rating ? '#facc15' : '#d1d5db',
                    fill: i < rating ? '#facc15' : '#e5e7eb',
                }}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Ratings" />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Page Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Seller Ratings</h1>
                    <p className="text-sm text-gray-600">View and respond to customer feedback</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Ratings</p>
                            <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{statistics.total_ratings}</p>
                        <p className="text-xs text-gray-500">{statistics.ratings_with_review} with comments</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Average Rating</p>
                            <Star className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#facc15', fill: '#facc15' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                            {statistics.average_rating ? Number(statistics.average_rating).toFixed(1) : '0.0'}
                        </p>
                        <div className="mt-1 flex">{renderStars(Math.round(statistics.average_rating || 0), 'sm')}</div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Replied</p>
                            <Reply className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{statistics.replied_ratings}</p>
                        <p className="text-xs text-gray-500">
                            {statistics.total_ratings > 0 ? `${((statistics.replied_ratings / statistics.total_ratings) * 100).toFixed(0)}%` : '0%'}{' '}
                            response rate
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Pending Reply</p>
                            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-orange-600 sm:text-2xl">{statistics.total_ratings - statistics.replied_ratings}</p>
                        <p className="text-xs text-gray-500">Awaiting your response</p>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Rating Distribution</h2>
                    <p className="text-xs text-gray-500 sm:text-sm">Breakdown of ratings received</p>
                    <div className="mt-4 space-y-3">
                        {statistics.distribution.map((dist) => (
                            <div key={dist.rating} className="flex items-center gap-3 sm:gap-4">
                                <div className="flex w-14 items-center gap-1 sm:w-20">
                                    <span className="text-sm font-medium text-gray-900">{dist.rating}</span>
                                    <Star className="h-4 w-4" style={{ color: '#facc15', fill: '#facc15' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                        <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${dist.percentage}%` }} />
                                    </div>
                                </div>
                                <div className="flex w-20 items-center gap-1 text-xs sm:w-32 sm:gap-2 sm:text-sm">
                                    <span className="text-gray-500">{dist.count}</span>
                                    <span className="font-medium text-gray-900">{dist.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Filter Ratings</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:hidden"
                        >
                            <Filter className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                            {showFilters ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className={`mt-4 space-y-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Search by buyer name or comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                />
                            </div>

                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>

                            <select
                                value={hasReply}
                                onChange={(e) => setHasReply(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Reply Status</option>
                                <option value="yes">With Reply</option>
                                <option value="no">No Reply</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                            >
                                <Filter className="h-4 w-4" style={{ color: '#ffffff' }} />
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Ratings List */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Customer Ratings</h2>
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Showing {ratings.data.length} of {ratings.total} ratings
                    </p>

                    <div className="mt-4">
                        {ratings.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto h-12 w-12" style={{ color: '#9ca3af' }} />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No ratings found</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {filters.search || filters.rating || filters.has_reply
                                        ? 'Try adjusting your filters'
                                        : 'You have not received any ratings yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {ratings.data.map((rating) => (
                                    <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100">
                                                <AvatarImage src={rating.user.avatar_url || undefined} alt={rating.user.name} />
                                                <AvatarFallback className="bg-orange-100 text-sm font-medium text-orange-700">
                                                    {getInitials(rating.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900">{rating.user.name}</h4>
                                                    <div className="flex">{renderStars(rating.rating, 'sm')}</div>
                                                </div>
                                                <p className="text-xs text-gray-500 sm:text-sm">{formatDate(rating.created_at)}</p>
                                            </div>
                                        </div>

                                        {rating.review && <p className="mt-3 text-sm text-gray-700 sm:ml-14">{rating.review}</p>}

                                        {/* Seller Reply Section */}
                                        <div className="mt-4 sm:ml-14">
                                            {rating.seller_reply ? (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Reply className="h-4 w-4" style={{ color: '#2563eb' }} />
                                                            <span className="text-sm font-semibold text-blue-900">Your Reply</span>
                                                            {rating.seller_replied_at && (
                                                                <span className="text-xs text-blue-600">{formatDate(rating.seller_replied_at)}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteReply(rating.id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-100"
                                                        >
                                                            <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-blue-900">{rating.seller_reply}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {replyingTo === rating.id ? (
                                                        <div className="space-y-3">
                                                            <textarea
                                                                placeholder="Write your reply..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                rows={3}
                                                                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                                            />
                                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                                <button
                                                                    onClick={() => handleReplySubmit(rating.id)}
                                                                    disabled={isSubmitting || !replyText.trim()}
                                                                    className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                                                                >
                                                                    Post Reply
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReplyText('');
                                                                    }}
                                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(rating.id);
                                                                setReplyText('');
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                                        >
                                                            <Reply className="h-4 w-4" style={{ color: '#6b7280' }} />
                                                            Reply to Customer
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {ratings.total > ratings.per_page && (
                            <div className="mt-6 flex flex-wrap justify-center gap-1">
                                {ratings.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            link.active
                                                ? 'bg-orange-500 text-white'
                                                : link.url
                                                  ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
