import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StartChatButton from '@/components/StartChatButton';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle,
    Clock,
    DollarSign,
    Image as ImageIcon,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    Play,
    Send,
    User,
    X,
    XCircle,
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
    buyer: {
        id: number;
        name: string;
        avatar_url: string | null;
        email: string;
        phone_number: string | null;
        address: string | null;
    };
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

export default function CustomOrderShow({ request }: Props) {
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [imageModal, setImageModal] = useState<string | null>(null);

    const quoteForm = useForm({
        quoted_price: request.budget_min ? request.budget_min.toString() : '',
        estimated_days: '',
        seller_notes: '',
    });

    const rejectForm = useForm({
        reason: '',
    });

    const handleSubmitQuote = () => {
        quoteForm.post(`/seller/custom-orders/${request.id}/quote`, {
            onSuccess: () => setShowQuoteModal(false),
        });
    };

    const handleReject = () => {
        rejectForm.post(`/seller/custom-orders/${request.id}/reject`, {
            onSuccess: () => setShowRejectModal(false),
        });
    };

    const handleStartWork = () => {
        router.post(`/seller/custom-orders/${request.id}/start`);
    };

    const handleSendForCheckout = () => {
        router.post(`/seller/custom-orders/${request.id}/send-for-checkout`);
    };

    const isTerminalStatus = ['rejected', 'declined', 'cancelled'].includes(request.status);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Custom Order Requests', href: '/seller/custom-orders' },
            { title: request.request_number, href: `/seller/custom-orders/${request.id}` }
        ]}>
            <Head title={`Custom Order - ${request.request_number}`} />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/seller/custom-orders"
                        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Custom Orders
                    </Link>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                                <Badge className={`${statusColors[request.status]} border`}>{request.status_label}</Badge>
                            </div>
                            <p className="mt-1 text-gray-500">Request #{request.request_number}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {request.status === 'pending' && (
                                <>
                                    <Button
                                        onClick={() => setShowQuoteModal(true)}
                                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Send Quote
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowRejectModal(true)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Decline Request
                                    </Button>
                                </>
                            )}
                            {request.status === 'accepted' && (
                                <Button
                                    onClick={handleStartWork}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Working
                                </Button>
                            )}
                            {request.status === 'in_progress' && (
                                <Button
                                    onClick={handleSendForCheckout}
                                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Send for Checkout
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Action Banner */}
                {request.status === 'pending' && (
                    <Card className="mb-8 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-900">Action Required</h3>
                                <p className="text-sm text-yellow-800">
                                    Review this custom order request and send a quote to the customer, or decline if you're unable
                                    to fulfill it.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Terminal Status Message */}
                {isTerminalStatus && (
                    <Card className="mb-8 border-gray-200 bg-gray-50">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <XCircle className="h-6 w-6 flex-shrink-0 text-gray-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {request.status === 'rejected' && 'You Declined This Request'}
                                    {request.status === 'declined' && 'Customer Declined Your Quote'}
                                    {request.status === 'cancelled' && 'Request Cancelled by Customer'}
                                </h3>
                                {request.rejection_reason && (
                                    <p className="mt-1 text-sm text-gray-600">Reason: {request.rejection_reason}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Your Quote (if submitted) */}
                        {request.quoted_price && (
                            <Card
                                className={`border-2 ${
                                    request.status === 'quoted'
                                        ? 'border-blue-300 bg-blue-50'
                                        : request.status === 'accepted' || request.status === 'in_progress' || request.status === 'completed'
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200'
                                }`}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        Your Quote
                                        {request.status === 'accepted' && (
                                            <Badge className="ml-2 bg-green-500 text-white">Accepted</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                ₱{Number(request.quoted_price).toLocaleString()}
                                            </p>
                                        </div>
                                        {request.estimated_days && (
                                            <div>
                                                <p className="text-sm text-gray-500">Delivery Time</p>
                                                <p className="text-2xl font-bold text-gray-900">{request.estimated_days} days</p>
                                            </div>
                                        )}
                                    </div>
                                    {request.seller_notes && (
                                        <div className="mt-4 rounded-lg bg-white/50 p-4">
                                            <p className="text-sm font-medium text-gray-700">Your Note:</p>
                                            <p className="mt-1 text-gray-600">{request.seller_notes}</p>
                                        </div>
                                    )}
                                    {request.quoted_at && (
                                        <p className="mt-4 text-xs text-gray-500">
                                            Quoted on {new Date(request.quoted_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer's Request</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="mb-2 font-medium text-gray-900">Description</h4>
                                    <p className="whitespace-pre-wrap text-gray-600">{request.description}</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="flex items-center gap-2 text-sm text-gray-500">
                                            <Package className="h-4 w-4" />
                                            Quantity
                                        </p>
                                        <p className="font-medium text-gray-900">{request.quantity}</p>
                                    </div>

                                    {request.formatted_budget && (
                                        <div>
                                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                                <DollarSign className="h-4 w-4" />
                                                Customer's Budget
                                            </p>
                                            <p className="font-medium text-gray-900">{request.formatted_budget}</p>
                                        </div>
                                    )}

                                    {request.preferred_deadline && (
                                        <div>
                                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                Preferred Deadline
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(request.preferred_deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            Received
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {request.special_requirements && (
                                    <div>
                                        <h4 className="mb-2 font-medium text-gray-900">Special Requirements</h4>
                                        <p className="whitespace-pre-wrap text-gray-600">{request.special_requirements}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reference Images */}
                        {request.reference_image_urls && request.reference_image_urls.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-amber-600" />
                                        Reference Images from Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {request.reference_image_urls.map((url, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setImageModal(url)}
                                                className="aspect-square overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Reference ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Customer Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="mb-4 h-20 w-20">
                                        <AvatarImage src={request.buyer.avatar_url || undefined} />
                                        <AvatarFallback className="bg-blue-100 text-2xl text-blue-700">
                                            {request.buyer.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-semibold text-gray-900">{request.buyer.name}</h3>

                                    <div className="mt-4 w-full">
                                        <StartChatButton userId={request.buyer.id} variant="outline" className="w-full">
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Message Customer
                                        </StartChatButton>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3 border-t pt-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {request.buyer.email}
                                    </div>
                                    {request.buyer.phone_number && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {request.buyer.phone_number}
                                        </div>
                                    )}
                                    {request.buyer.address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            {request.buyer.address}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        {request.status === 'pending' && (
                            <Card className="border-amber-200 bg-amber-50">
                                <CardHeader>
                                    <CardTitle className="text-amber-900">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={() => setShowQuoteModal(true)}
                                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Quote
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => setShowRejectModal(true)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Decline Request
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Request Received</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {request.quoted_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <DollarSign className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quote Sent</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(request.quoted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {request.accepted_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quote Accepted</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(request.accepted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {request.status === 'in_progress' && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                                <Play className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Work Started</p>
                                                <p className="text-sm text-gray-500">In progress</p>
                                            </div>
                                        </div>
                                    )}

                                    {request.completed_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Completed</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(request.completed_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Quote Modal */}
            <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Send Quote</DialogTitle>
                        <DialogDescription>Provide your price and estimated delivery time for this custom order.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="quoted_price">Price (₱) *</Label>
                            <Input
                                id="quoted_price"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="e.g., 1500"
                                value={quoteForm.data.quoted_price}
                                onChange={(e) => quoteForm.setData('quoted_price', e.target.value)}
                                className={quoteForm.errors.quoted_price ? 'border-red-500' : ''}
                            />
                            {quoteForm.errors.quoted_price && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {quoteForm.errors.quoted_price}
                                </p>
                            )}
                            {request.formatted_budget && (
                                <p className="mt-1 text-xs text-gray-500">Customer's budget: {request.formatted_budget}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="estimated_days">Estimated Delivery (days) *</Label>
                            <Input
                                id="estimated_days"
                                type="number"
                                min="1"
                                max="365"
                                placeholder="e.g., 7"
                                value={quoteForm.data.estimated_days}
                                onChange={(e) => quoteForm.setData('estimated_days', e.target.value)}
                                className={quoteForm.errors.estimated_days ? 'border-red-500' : ''}
                            />
                            {quoteForm.errors.estimated_days && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {quoteForm.errors.estimated_days}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="seller_notes">Note to Customer (optional)</Label>
                            <Textarea
                                id="seller_notes"
                                placeholder="Add any details about materials, process, or conditions..."
                                rows={4}
                                value={quoteForm.data.seller_notes}
                                onChange={(e) => quoteForm.setData('seller_notes', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuoteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitQuote}
                            disabled={quoteForm.processing}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                            {quoteForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Quote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for declining this request. This helps the customer understand and find
                            another artisan.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Textarea
                            placeholder="e.g., Currently fully booked, Unable to work with requested materials, etc."
                            value={rejectForm.data.reason}
                            onChange={(e) => rejectForm.setData('reason', e.target.value)}
                            rows={4}
                            className={rejectForm.errors.reason ? 'border-red-500' : ''}
                        />
                        {rejectForm.errors.reason && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {rejectForm.errors.reason}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={rejectForm.processing}>
                            {rejectForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Decline Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Modal */}
            <Dialog open={!!imageModal} onOpenChange={() => setImageModal(null)}>
                <DialogContent className="max-w-3xl p-0">
                    <button
                        onClick={() => setImageModal(null)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {imageModal && <img src={imageModal} alt="Reference" className="h-auto w-full rounded-lg" />}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
