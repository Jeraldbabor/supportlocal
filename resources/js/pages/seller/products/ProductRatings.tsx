import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Reply, Send, Star, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    profile_picture?: string;
    avatar_url?: string;
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
    user: User;
}

interface Product {
    id: number;
    name: string;
    images?: string[];
    primary_image?: string;
    average_rating: number;
    review_count: number;
}

interface RatingDistribution {
    rating: number;
    count: number;
    percentage: number;
}

interface Summary {
    average_rating: number;
    total_reviews: number;
    total_ratings: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProductRatingsPageProps extends SharedData {
    product: Product;
    ratings: {
        data: Rating[];
        links: PaginationLink[];
        current_page: number;
        per_page: number;
        total: number;
    };
    distribution: RatingDistribution[];
    summary: Summary;
}

export default function ProductRatings({ product, ratings, distribution, summary }: ProductRatingsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Seller Dashboard', href: '/seller/dashboard' },
        { title: 'Products', href: '/seller/products' },
        { title: product.name, href: `/seller/products/${product.id}` },
        { title: 'Ratings', href: `/seller/products/${product.id}/ratings` },
    ];

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClasses = {
            sm: 'h-3 w-3',
            md: 'h-4 w-4',
            lg: 'h-5 w-5',
        };
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`${sizeClasses[size]} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
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
            hour: '2-digit',
            minute: '2-digit',
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

    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReplySubmit = async (ratingId: number) => {
        if (!replyText.trim()) return;

        setSubmitting(true);

        try {
            await axios.post(`/seller/products/${product.id}/ratings/${ratingId}/reply`, { seller_reply: replyText });

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

    const handleDeleteReply = async (ratingId: number) => {
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
                await axios.delete(`/seller/products/${product.id}/ratings/${ratingId}/reply`);

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
            <Head title={`${product.name} - Ratings`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link href="/seller/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                    <div className="flex items-start gap-4">
                        {(product.primary_image || (product.images && product.images.length > 0)) && (
                            <img
                                src={product.primary_image ? `/storage/${product.primary_image}` : product.images![0]}
                                alt={product.name}
                                className="h-20 w-20 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {renderStars(Math.round(product.average_rating), 'md')}
                                    <span className="text-lg font-semibold">{product.average_rating.toFixed(1)}</span>
                                </div>
                                <Badge variant="secondary">
                                    {product.review_count} {product.review_count === 1 ? 'Review' : 'Reviews'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.average_rating.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_reviews}</div>
                            <p className="text-xs text-muted-foreground">Customer feedback</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{distribution.find((d) => d.rating === 5)?.count || 0}</div>
                            <p className="text-xs text-muted-foreground">{distribution.find((d) => d.rating === 5)?.percentage || 0}% of total</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rating Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                        <CardDescription>Breakdown of customer ratings for this product</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {distribution.map((dist) => (
                                <div key={dist.rating} className="flex items-center gap-4">
                                    <div className="flex w-16 items-center gap-1">
                                        <span className="text-sm font-medium">{dist.rating}</span>
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                            <div className="h-full bg-yellow-400 transition-all" style={{ width: `${dist.percentage}%` }} />
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
                                <h3 className="mt-4 text-lg font-semibold">No reviews yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">This product has not received any reviews from customers yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {ratings.data.map((rating) => (
                                    <div key={rating.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={rating.user.avatar_url || rating.user.profile_picture} alt={rating.user.name} />
                                                <AvatarFallback>{getInitials(rating.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold">{rating.user.name}</h4>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {renderStars(rating.rating, 'sm')}
                                                            <span className="text-sm text-muted-foreground">{formatDate(rating.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {rating.review && <p className="mt-3 text-sm text-gray-700">{rating.review}</p>}

                                                {/* Seller Reply Section */}
                                                {rating.seller_reply ? (
                                                    <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
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
                                                                onClick={() => handleDeleteReply(rating.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
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
                                                                        onClick={() => handleReplySubmit(rating.id)}
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
                                                            <Button variant="outline" size="sm" onClick={() => setReplyingToId(rating.id)}>
                                                                <Reply className="mr-2 h-4 w-4" />
                                                                Reply to Customer
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
