import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
            <Star key={i} className={`${sizeClass} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
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

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_ratings}</div>
                            <p className="text-xs text-muted-foreground">{statistics.ratings_with_review} with comments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.average_rating ? Number(statistics.average_rating).toFixed(1) : '0.0'}
                            </div>
                            <div className="mt-1 flex">{renderStars(Math.round(statistics.average_rating || 0), 'sm')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Replied</CardTitle>
                            <Reply className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.replied_ratings}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.total_ratings > 0
                                    ? `${((statistics.replied_ratings / statistics.total_ratings) * 100).toFixed(0)}%`
                                    : '0%'}{' '}
                                response rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reply</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_ratings - statistics.replied_ratings}</div>
                            <p className="text-xs text-muted-foreground">Awaiting your response</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rating Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                        <CardDescription>Breakdown of ratings received</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {statistics.distribution.map((dist) => (
                                <div key={dist.rating} className="flex items-center gap-4">
                                    <div className="flex w-20 items-center gap-1">
                                        <span className="text-sm font-medium">{dist.rating}</span>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${dist.percentage}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex w-32 items-center gap-2 text-sm">
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
                        <CardTitle>Filter Ratings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by buyer name or comment..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={selectedRating} onValueChange={setSelectedRating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by rating" />
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

                                <Select value={hasReply} onValueChange={setHasReply}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by reply status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="yes">With Reply</SelectItem>
                                        <SelectItem value="no">No Reply</SelectItem>
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

                {/* Ratings List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Ratings</CardTitle>
                        <CardDescription>
                            Showing {ratings.data.length} of {ratings.total} ratings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ratings.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No ratings found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {filters.search || filters.rating || filters.has_reply
                                        ? 'Try adjusting your filters'
                                        : 'You have not received any ratings yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {ratings.data.map((rating) => (
                                    <div key={rating.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={rating.user.avatar_url || undefined} alt={rating.user.name} />
                                                    <AvatarFallback>{getInitials(rating.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{rating.user.name}</h4>
                                                        {renderStars(rating.rating, 'sm')}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{formatDate(rating.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {rating.review && <p className="mt-3 pl-14 text-sm text-gray-700">{rating.review}</p>}

                                        {/* Seller Reply Section */}
                                        {rating.seller_reply ? (
                                            <div className="mt-4 ml-14 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Reply className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-semibold text-blue-900">Your Reply</span>
                                                        {rating.seller_replied_at && (
                                                            <span className="text-xs text-blue-600">{formatDate(rating.seller_replied_at)}</span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteReply(rating.id)}
                                                        className="h-8 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-blue-900">{rating.seller_reply}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 ml-14">
                                                {replyingTo === rating.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            placeholder="Write your reply..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            rows={3}
                                                            className="resize-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReplySubmit(rating.id)}
                                                                disabled={isSubmitting || !replyText.trim()}
                                                            >
                                                                Post Reply
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyText('');
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setReplyingTo(rating.id);
                                                            setReplyText('');
                                                        }}
                                                    >
                                                        <Reply className="mr-2 h-4 w-4" />
                                                        Reply to Customer
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {ratings.total > ratings.per_page && (
                            <div className="mt-6 flex justify-center">
                                <nav className="flex gap-1">
                                    {ratings.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url || link.active}
                                            className={`rounded px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
