import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Filter, MessageSquare, Package, Reply, Search, Send, Star, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seller Dashboard', href: '/seller/dashboard' },
    { title: 'Product Ratings', href: '/seller/ratings' },
];

interface User {
    id: number;
    name: string;
    profile_picture?: string;
    avatar_url?: string;
}

interface Product {
    id: number;
    name: string;
    images?: string[];
}

interface Rating {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    review?: string;
    seller_reply?: string;
    seller_replied_at?: string;
    created_at: string;
    updated_at: string;
    product: Product;
    user: User;
}

interface SellerProduct {
    id: number;
    name: string;
}

interface RatingDistribution {
    rating: number;
    count: number;
    percentage: number;
}

interface Statistics {
    total_reviews: number;
    average_rating: number;
    distribution: RatingDistribution[];
    recent_reviews_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface RatingsPageProps {
    ratings: {
        data: Rating[];
        links: PaginationLink[];
        current_page: number;
        per_page: number;
        total: number;
    };
    sellerProducts: SellerProduct[];
    statistics: Statistics;
    filters: {
        product_id?: number;
        rating?: number;
        search?: string;
    };
}

export default function Ratings({ ratings, sellerProducts, statistics, filters }: RatingsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProduct, setSelectedProduct] = useState(filters.product_id?.toString() || 'all');
    const [selectedRating, setSelectedRating] = useState(filters.rating?.toString() || 'all');
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(
            '/seller/ratings',
            {
                search: searchTerm || undefined,
                product_id: selectedProduct !== 'all' ? selectedProduct : undefined,
                rating: selectedRating !== 'all' ? selectedRating : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedProduct('all');
        setSelectedRating('all');
        router.get('/seller/ratings', {}, { preserveState: true });
    };

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClasses = {
            sm: 'h-3 w-3',
            md: 'h-4 w-4',
            lg: 'h-5 w-5',
        };
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={sizeClasses[size]}
                        style={{ 
                            color: star <= rating ? '#facc15' : '#d1d5db',
                            fill: star <= rating ? '#facc15' : '#e5e7eb'
                        }}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleReplySubmit = async (ratingId: number, productId: number) => {
        if (!replyText.trim()) return;

        setSubmitting(true);

        try {
            await axios.post(`/seller/products/${productId}/ratings/${ratingId}/reply`, { seller_reply: replyText });

            setReplyText('');
            setReplyingToId(null);
            await Swal.fire({
                title: 'Success!',
                text: 'Reply posted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            router.reload();
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'Failed to post reply',
                icon: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (ratingId: number, productId: number) => {
        const result = await Swal.fire({
            title: 'Delete Reply?',
            text: 'Are you sure you want to delete your reply?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/seller/products/${productId}/ratings/${ratingId}/reply`);

                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Reply has been deleted',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                router.reload();
            } catch {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to delete reply',
                    icon: 'error',
                });
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Ratings" />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Product Ratings</h1>
                    <p className="text-sm text-gray-600">View and analyze customer reviews for your products</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Reviews</p>
                            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{statistics.total_reviews}</p>
                        <p className="text-xs text-gray-500">{statistics.recent_reviews_count} in last 30 days</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Average Rating</p>
                            <Star className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#facc15', fill: '#facc15' }} />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <p className="text-xl font-bold text-gray-900 sm:text-2xl">{statistics.average_rating.toFixed(1)}</p>
                            {renderStars(Math.round(statistics.average_rating), 'sm')}
                        </div>
                        <p className="text-xs text-gray-500">Out of 5 stars</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">5-Star Reviews</p>
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#22c55e' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-green-600 sm:text-2xl">
                            {statistics.distribution.find((d) => d.rating === 5)?.count || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                            {statistics.distribution.find((d) => d.rating === 5)?.percentage || 0}% of total
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">Products Reviewed</p>
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                        </div>
                        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{sellerProducts.length}</p>
                        <p className="text-xs text-gray-500">Total products with reviews</p>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Rating Distribution</h2>
                    <p className="text-xs text-gray-500 sm:text-sm">Overview of customer ratings across all products</p>
                    <div className="mt-4 space-y-3">
                        {statistics.distribution.map((dist) => (
                            <div key={dist.rating} className="flex items-center gap-3 sm:gap-4">
                                <div className="flex w-12 items-center gap-1 sm:w-16">
                                    <span className="text-sm font-medium text-gray-900">{dist.rating}</span>
                                    <Star className="h-3 w-3" style={{ color: '#facc15', fill: '#facc15' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                        <div 
                                            className="h-full rounded-full bg-yellow-400 transition-all" 
                                            style={{ width: `${dist.percentage}%` }} 
                                        />
                                    </div>
                                </div>
                                <div className="flex w-16 items-center justify-between text-xs sm:w-24 sm:text-sm">
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
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Filter Reviews</h2>
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
                                    placeholder="Search reviews, customers, products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                />
                            </div>

                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="all">All Products</option>
                                {sellerProducts.map((product) => (
                                    <option key={product.id} value={product.id.toString()}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
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

                {/* Reviews List */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Customer Reviews</h2>
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Showing {ratings.data.length} of {ratings.total} reviews
                    </p>
                    
                    <div className="mt-4">
                        {ratings.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto h-12 w-12" style={{ color: '#9ca3af' }} />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No reviews found</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {filters.search || filters.product_id || filters.rating
                                        ? 'Try adjusting your filters'
                                        : 'Your products have not received any reviews yet'}
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
                                                    {renderStars(rating.rating, 'sm')}
                                                </div>
                                                <p className="text-xs text-gray-500 sm:text-sm">{formatDate(rating.created_at)}</p>
                                                <Link
                                                    href={`/seller/products/${rating.product.id}`}
                                                    className="mt-1 inline-flex items-center text-sm text-orange-600 hover:text-orange-700 hover:underline"
                                                >
                                                    {rating.product.name}
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        {rating.review && (
                                            <p className="mt-3 text-sm text-gray-700 sm:ml-14">{rating.review}</p>
                                        )}

                                        {/* Seller Reply Section */}
                                        <div className="mt-4 sm:ml-14">
                                            {rating.seller_reply ? (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Reply className="h-4 w-4 flex-shrink-0" style={{ color: '#2563eb' }} />
                                                                <span className="text-sm font-semibold text-blue-700">Your Reply</span>
                                                                {rating.seller_replied_at && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatDate(rating.seller_replied_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-sm text-blue-900">{rating.seller_reply}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteReply(rating.id, rating.product_id)}
                                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-100"
                                                        >
                                                            <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {replyingToId === rating.id ? (
                                                        <div className="space-y-3">
                                                            <textarea
                                                                placeholder="Write your reply to the customer..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                rows={3}
                                                                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                                            />
                                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                                <button
                                                                    onClick={() => handleReplySubmit(rating.id, rating.product_id)}
                                                                    disabled={!replyText.trim() || submitting}
                                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                                                                >
                                                                    <Send className="h-4 w-4" style={{ color: '#ffffff' }} />
                                                                    {submitting ? 'Posting...' : 'Post Reply'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingToId(null);
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
                                                            onClick={() => setReplyingToId(rating.id)}
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
                    </div>
                </div>

                {/* Pagination */}
                {ratings.total > ratings.per_page && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {ratings.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
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
        </AppLayout>
    );
}
