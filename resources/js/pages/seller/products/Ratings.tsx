import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Search, Star, MessageSquare, Filter, TrendingUp, Package, Reply, Send, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

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

interface RatingsPageProps extends SharedData {
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

export default function Ratings({ auth, ratings, sellerProducts, statistics, filters }: RatingsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProduct, setSelectedProduct] = useState(filters.product_id?.toString() || 'all');
    const [selectedRating, setSelectedRating] = useState(filters.rating?.toString() || 'all');
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
            }
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
                        className={`${sizeClasses[size]} ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
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
            await axios.post(
                `/seller/products/${productId}/ratings/${ratingId}/reply`,
                { seller_reply: replyText }
            );

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
        } catch (error) {
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
            } catch (error) {
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

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Ratings</h1>
                        <p className="text-muted-foreground">View and analyze customer reviews for your products</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_reviews}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.recent_reviews_count} in last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">{statistics.average_rating.toFixed(1)}</div>
                                {renderStars(Math.round(statistics.average_rating), 'sm')}
                            </div>
                            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.distribution.find((d) => d.rating === 5)?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.distribution.find((d) => d.rating === 5)?.percentage || 0}% of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products Reviewed</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sellerProducts.length}</div>
                            <p className="text-xs text-muted-foreground">Total products with reviews</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rating Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                        <CardDescription>Overview of customer ratings across all products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {statistics.distribution.map((dist) => (
                                <div key={dist.rating} className="flex items-center gap-4">
                                    <div className="flex w-16 items-center gap-1">
                                        <span className="text-sm font-medium">{dist.rating}</span>
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="h-full bg-yellow-400 transition-all"
                                                style={{ width: `${dist.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex w-24 items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{dist.count}</span>
                                        <span className="font-medium">{dist.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search reviews, customers, products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Products" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Products</SelectItem>
                                        {sellerProducts.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedRating} onValueChange={setSelectedRating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Ratings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Reviews List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                        <CardDescription>
                            Showing {ratings.data.length} of {ratings.total} reviews
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ratings.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No reviews found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {filters.search || filters.product_id || filters.rating
                                        ? 'Try adjusting your filters'
                                        : 'Your products have not received any reviews yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {ratings.data.map((rating) => (
                                    <div key={rating.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={rating.user.avatar_url || rating.user.profile_picture}
                                                        alt={rating.user.name}
                                                    />
                                                    <AvatarFallback>{getInitials(rating.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{rating.user.name}</h4>
                                                        {renderStars(rating.rating, 'sm')}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(rating.created_at)}
                                                    </p>
                                                    <Link
                                                        href={`/seller/products/${rating.product.id}`}
                                                        className="mt-1 inline-flex items-center text-sm text-primary hover:underline"
                                                    >
                                                        {rating.product.name}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        {rating.review && (
                                            <p className="mt-3 pl-14 text-sm text-gray-700">{rating.review}</p>
                                        )}
                                        
                                        {/* Seller Reply Section */}
                                        <div className="mt-3 pl-14">
                                            {rating.seller_reply ? (
                                                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Reply className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-semibold text-blue-600">Your Reply</span>
                                                                {rating.seller_replied_at && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDate(rating.seller_replied_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-700">{rating.seller_reply}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteReply(rating.id, rating.product_id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {replyingToId === rating.id ? (
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                placeholder="Write your reply to the customer..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                rows={3}
                                                                className="resize-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => handleReplySubmit(rating.id, rating.product_id)}
                                                                    disabled={!replyText.trim() || submitting}
                                                                    size="sm"
                                                                >
                                                                    <Send className="mr-2 h-4 w-4" />
                                                                    {submitting ? 'Posting...' : 'Post Reply'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setReplyingToId(null);
                                                                        setReplyText('');
                                                                    }}
                                                                    size="sm"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setReplyingToId(rating.id)}
                                                        >
                                                            <Reply className="mr-2 h-4 w-4" />
                                                            Reply to Customer
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {ratings.total > ratings.per_page && (
                    <div className="flex items-center justify-center gap-2">
                        {ratings.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
