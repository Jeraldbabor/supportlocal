import StartChatButton from '@/components/StartChatButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle,
    DollarSign,
    ExternalLink,
    Gavel,
    Image as ImageIcon,
    Loader2,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingCart,
    Star,
    ThumbsDown,
    ThumbsUp,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Seller {
    id: number;
    name: string;
    avatar_url: string | null;
    email?: string;
    phone_number?: string | null;
    address?: string | null;
    seller_rating?: number | null;
    total_sales?: number;
}

interface Bid {
    id: number;
    seller_id: number;
    proposed_price: number;
    estimated_days: number;
    message: string;
    additional_notes: string | null;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    seller: Seller | null;
}

interface CustomOrderRequest {
    id: number;
    request_number: string;
    title: string;
    description: string;
    category: string | null;
    category_label: string | null;
    is_public: boolean;
    status: string;
    status_label: string;
    status_color: string;
    reference_images: string[] | null;
    reference_image_urls: string[];
    budget_min: number | null;
    budget_max: number | null;
    formatted_budget: string | null;
    quantity: number;
    preferred_deadline: string | null;
    special_requirements: string | null;
    quoted_price: number | null;
    estimated_days: number | null;
    seller_notes: string | null;
    quoted_at: string | null;
    accepted_at: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    completed_at: string | null;
    created_at: string;
    bids_count: number;
    seller: Seller | null;
    bids: Bid[];
    product: {
        id: number;
        name: string;
        price: number;
        primary_image: string | null;
        slug: string;
    } | null;
    order: {
        id: number;
        order_number: string;
        status: string;
        total_amount: number;
    } | null;
}

interface Props {
    request: CustomOrderRequest;
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

export default function CustomOrderShow({ request }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(request.reference_image_urls?.[0] || null);
    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [showRejectBidDialog, setShowRejectBidDialog] = useState(false);
    const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
    const [acceptingBidId, setAcceptingBidId] = useState<number | null>(null);

    const declineForm = useForm({ reason: '' });
    const rejectBidForm = useForm({ reason: '' });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
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

    const handleAcceptBid = (bidId: number) => {
        setAcceptingBidId(bidId);
        router.post(
            `/buyer/custom-orders/${request.id}/bids/${bidId}/accept`,
            {},
            {
                onFinish: () => setAcceptingBidId(null),
            },
        );
    };

    const handleRejectBid = (bidId: number) => {
        setSelectedBidId(bidId);
        setShowRejectBidDialog(true);
    };

    const submitRejectBid = () => {
        if (selectedBidId) {
            rejectBidForm.post(`/buyer/custom-orders/${request.id}/bids/${selectedBidId}/reject`, {
                onSuccess: () => {
                    setShowRejectBidDialog(false);
                    setSelectedBidId(null);
                    rejectBidForm.reset();
                },
            });
        }
    };

    const handleAcceptQuote = () => {
        router.post(`/buyer/custom-orders/${request.id}/accept`);
        setShowAcceptDialog(false);
    };

    const handleDeclineQuote = () => {
        declineForm.post(`/buyer/custom-orders/${request.id}/decline`, {
            onSuccess: () => {
                setShowDeclineDialog(false);
                declineForm.reset();
            },
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this request?')) {
            router.post(`/buyer/custom-orders/${request.id}/cancel`);
        }
    };

    const pendingBids = request.bids?.filter((b) => b.status === 'pending') || [];
    const acceptedBid = request.bids?.find((b) => b.status === 'accepted');
    const isOpenForBids = request.is_public && request.status === 'open';

    return (
        <BuyerLayout>
            <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white py-8">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Back Button */}
                    <Link href="/buyer/custom-orders">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Requests
                        </Button>
                    </Link>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className={statusColors[request.status]}>{request.status_label}</Badge>
                                {request.is_public && (
                                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                        <Gavel className="mr-1 h-3 w-3" />
                                        Public Bidding
                                    </Badge>
                                )}
                                {request.category_label && <Badge variant="outline">{request.category_label}</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                            <p className="mt-1 text-gray-500">
                                Request #{request.request_number} • Created {formatDateTime(request.created_at)}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {request.status === 'ready_for_checkout' && (
                                <Link href={`/buyer/custom-orders/${request.id}/checkout`}>
                                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            )}
                            {(request.status === 'open' || request.status === 'pending' || request.status === 'quoted') && (
                                <Button variant="outline" onClick={handleCancel} className="text-red-600 hover:bg-red-50">
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Ready for Checkout Banner */}
                    {request.status === 'ready_for_checkout' && (
                        <Card className="mb-6 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
                            <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <ShoppingCart className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-orange-900">Your Order is Ready!</h3>
                                        <p className="text-sm text-orange-700">
                                            The artisan has completed your custom order. Proceed to checkout to finalize.
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/buyer/custom-orders/${request.id}/checkout`}>
                                    <Button className="bg-orange-500 hover:bg-orange-600">Checkout Now</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Request Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="mb-1 font-medium text-gray-700">Description</h4>
                                        <p className="whitespace-pre-wrap text-gray-600">{request.description}</p>
                                    </div>

                                    <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Budget</p>
                                                <p className="font-semibold">{request.formatted_budget || 'Flexible'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Quantity</p>
                                                <p className="font-semibold">{request.quantity} item(s)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-orange-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Deadline</p>
                                                <p className="font-semibold">
                                                    {request.preferred_deadline ? formatDate(request.preferred_deadline) : 'Flexible'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {request.special_requirements && (
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Special Requirements</h4>
                                            <p className="rounded-lg bg-amber-50 p-3 whitespace-pre-wrap text-gray-600">
                                                {request.special_requirements}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reference Images */}
                            {request.reference_image_urls.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Reference Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedImage && (
                                            <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">
                                                <img src={selectedImage} alt="Selected reference" className="mx-auto max-h-80 object-contain" />
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {request.reference_image_urls.map((url, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(url)}
                                                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                                                        selectedImage === url
                                                            ? 'border-amber-500 ring-2 ring-amber-200'
                                                            : 'border-gray-200 hover:border-amber-300'
                                                    }`}
                                                >
                                                    <img src={url} alt={`Reference ${index + 1}`} className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Bids Section (for public requests) */}
                            {request.is_public && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Gavel className="h-5 w-5 text-amber-600" />
                                                    Bids Received
                                                </CardTitle>
                                                <CardDescription>
                                                    {isOpenForBids
                                                        ? `${pendingBids.length} artisan${pendingBids.length !== 1 ? 's' : ''} interested in your project`
                                                        : acceptedBid
                                                          ? 'You have accepted a bid for this project'
                                                          : 'This request is no longer accepting bids'}
                                                </CardDescription>
                                            </div>
                                            {isOpenForBids && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <Users className="mr-1 h-3 w-3" />
                                                    {request.bids_count} Total Bids
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {pendingBids.length === 0 && !acceptedBid ? (
                                            <div className="py-8 text-center text-gray-500">
                                                <Gavel className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                                <p>No bids yet. Artisans will start bidding soon!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Show accepted bid first if exists */}
                                                {acceptedBid && (
                                                    <Card className="border-green-300 bg-green-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                                    Accepted Bid
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-start gap-4">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage src={acceptedBid.seller?.avatar_url || undefined} />
                                                                    <AvatarFallback className="bg-amber-100 text-amber-700">
                                                                        {acceptedBid.seller?.name?.charAt(0) || 'S'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-gray-900">{acceptedBid.seller?.name}</h4>
                                                                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                                                        <span className="font-medium text-green-600">
                                                                            ₱{Number(acceptedBid.proposed_price).toLocaleString()}
                                                                        </span>
                                                                        <span className="text-gray-600">
                                                                            {acceptedBid.estimated_days} days delivery
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-gray-600">{acceptedBid.message}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Pending bids */}
                                                {isOpenForBids &&
                                                    pendingBids.map((bid) => (
                                                        <Card key={bid.id} className="overflow-hidden">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start gap-4">
                                                                    <Avatar className="h-12 w-12">
                                                                        <AvatarImage src={bid.seller?.avatar_url || undefined} />
                                                                        <AvatarFallback className="bg-amber-100 text-amber-700">
                                                                            {bid.seller?.name?.charAt(0) || 'S'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-900">{bid.seller?.name}</h4>
                                                                                {bid.seller?.seller_rating && (
                                                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                                        {bid.seller.seller_rating.toFixed(1)}
                                                                                        {bid.seller.total_sales !== undefined && (
                                                                                            <span> • {bid.seller.total_sales} sales</span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-lg font-bold text-green-600">
                                                                                    ₱{Number(bid.proposed_price).toLocaleString()}
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">{bid.estimated_days} days</p>
                                                                            </div>
                                                                        </div>

                                                                        <p className="mt-3 text-sm text-gray-600">{bid.message}</p>

                                                                        {bid.additional_notes && (
                                                                            <p className="mt-2 text-sm text-gray-500 italic">
                                                                                Note: {bid.additional_notes}
                                                                            </p>
                                                                        )}

                                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                                onClick={() => handleAcceptBid(bid.id)}
                                                                                disabled={acceptingBidId === bid.id}
                                                                            >
                                                                                {acceptingBidId === bid.id ? (
                                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    <ThumbsUp className="mr-1 h-3 w-3" />
                                                                                )}
                                                                                Accept Bid
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-red-600 hover:bg-red-50"
                                                                                onClick={() => handleRejectBid(bid.id)}
                                                                            >
                                                                                <ThumbsDown className="mr-1 h-3 w-3" />
                                                                                Reject
                                                                            </Button>
                                                        {bid.seller && (
                                                            <StartChatButton
                                                                userId={bid.seller.id}
                                                                variant="outline"
                                                            />
                                                        )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quote Section (for direct requests) */}
                            {!request.is_public && request.status === 'quoted' && (
                                <Card className="border-blue-200 bg-blue-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                            Quote Received
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-lg bg-white p-4">
                                                <p className="text-sm text-gray-500">Quoted Price</p>
                                                <p className="text-2xl font-bold text-green-600">₱{Number(request.quoted_price).toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-lg bg-white p-4">
                                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                                <p className="text-2xl font-bold text-gray-900">{request.estimated_days} days</p>
                                            </div>
                                        </div>
                                        {request.seller_notes && (
                                            <div>
                                                <p className="mb-1 text-sm font-medium text-gray-700">Seller Notes</p>
                                                <p className="text-gray-600">{request.seller_notes}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setShowAcceptDialog(true)}>
                                                <ThumbsUp className="mr-2 h-4 w-4" />
                                                Accept Quote
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600 hover:bg-red-50"
                                                onClick={() => setShowDeclineDialog(true)}
                                            >
                                                <ThumbsDown className="mr-2 h-4 w-4" />
                                                Decline
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Order Link */}
                            {request.order && (
                                <Card className="border-green-200 bg-green-50">
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <div>
                                                <p className="font-semibold text-green-900">Order Created</p>
                                                <p className="text-sm text-green-700">Order #{request.order.order_number}</p>
                                            </div>
                                        </div>
                                        <Link href={`/buyer/orders/${request.order.id}`}>
                                            <Button variant="outline" className="border-green-300">
                                                View Order
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Seller Info (if assigned) */}
                            {request.seller && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Artisan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={request.seller.avatar_url || undefined} />
                                                <AvatarFallback className="bg-amber-100 text-lg text-amber-700">
                                                    {request.seller.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{request.seller.name}</h3>
                                                {request.seller.address && (
                                                    <p className="flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        {request.seller.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {request.seller.email && (
                                                <a
                                                    href={`mailto:${request.seller.email}`}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    {request.seller.email}
                                                </a>
                                            )}
                                            {request.seller.phone_number && (
                                                <a
                                                    href={`tel:${request.seller.phone_number}`}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                    {request.seller.phone_number}
                                                </a>
                                            )}
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <Link href={`/buyer/seller/${request.seller.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">
                                                    View Profile
                                                </Button>
                                            </Link>
                                            <StartChatButton
                                                userId={request.seller.id}
                                                variant="outline"
                                                className="flex-1"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Status Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={`${statusColors[request.status]} text-sm`}>{request.status_label}</Badge>
                                    {request.quoted_at && <p className="mt-3 text-sm text-gray-500">Quoted: {formatDateTime(request.quoted_at)}</p>}
                                    {request.accepted_at && (
                                        <p className="mt-1 text-sm text-gray-500">Accepted: {formatDateTime(request.accepted_at)}</p>
                                    )}
                                    {request.completed_at && (
                                        <p className="mt-1 text-sm text-gray-500">Completed: {formatDateTime(request.completed_at)}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Price Summary (if accepted) */}
                            {request.quoted_price && request.status !== 'open' && request.status !== 'pending' && (
                                <Card className="border-green-200 bg-green-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-green-900">Agreed Price</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-green-600">₱{Number(request.quoted_price).toLocaleString()}</p>
                                        {request.estimated_days && (
                                            <p className="mt-1 text-sm text-green-700">Delivery in {request.estimated_days} days</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Accept Quote Dialog */}
            <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accept This Quote?</DialogTitle>
                        <DialogDescription>
                            By accepting, you agree to the quoted price of <strong>₱{Number(request.quoted_price).toLocaleString()}</strong> and
                            delivery in <strong>{request.estimated_days} days</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAcceptQuote}>
                            <Check className="mr-2 h-4 w-4" />
                            Accept Quote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Quote Dialog */}
            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline This Quote?</DialogTitle>
                        <DialogDescription>Please provide a reason for declining (optional). This will help the seller improve.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for declining..."
                        value={declineForm.data.reason}
                        onChange={(e) => declineForm.setData('reason', e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeclineQuote} disabled={declineForm.processing}>
                            {declineForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Decline Quote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Bid Dialog */}
            <Dialog open={showRejectBidDialog} onOpenChange={setShowRejectBidDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject This Bid?</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting (optional).</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for rejection..."
                        value={rejectBidForm.data.reason}
                        onChange={(e) => rejectBidForm.setData('reason', e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectBidDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitRejectBid} disabled={rejectBidForm.processing}>
                            {rejectBidForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Reject Bid
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BuyerLayout>
    );
}
