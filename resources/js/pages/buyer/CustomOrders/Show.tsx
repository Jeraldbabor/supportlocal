import StartChatButton from '@/components/StartChatButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    Image as ImageIcon,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    ShoppingCart,
    ThumbsDown,
    ThumbsUp,
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
    seller: {
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

const statusSteps = [
    { key: 'pending', label: 'Request Sent', icon: Clock },
    { key: 'quoted', label: 'Quote Received', icon: DollarSign },
    { key: 'accepted', label: 'Quote Accepted', icon: Check },
    { key: 'in_progress', label: 'In Progress', icon: Package },
    { key: 'ready_for_checkout', label: 'Ready to Pay', icon: CreditCard },
    { key: 'completed', label: 'Completed', icon: Check },
];

export default function CustomOrderShow({ request }: Props) {
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [imageModal, setImageModal] = useState<string | null>(null);

    const declineForm = useForm({
        reason: '',
    });

    const handleAccept = () => {
        router.post(`/buyer/custom-orders/${request.id}/accept`);
    };

    const handleDecline = () => {
        declineForm.post(`/buyer/custom-orders/${request.id}/decline`, {
            onSuccess: () => setShowDeclineModal(false),
        });
    };

    const handleCancel = () => {
        router.post(
            `/buyer/custom-orders/${request.id}/cancel`,
            {},
            {
                onSuccess: () => setShowCancelModal(false),
            },
        );
    };

    const getCurrentStep = () => {
        const stepOrder = ['pending', 'quoted', 'accepted', 'in_progress', 'completed'];
        return stepOrder.indexOf(request.status);
    };

    const isTerminalStatus = ['rejected', 'declined', 'cancelled'].includes(request.status);

    return (
        <BuyerLayout title="Custom Order Details">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/buyer/custom-orders" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
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
                        <div className="flex gap-2">
                            {request.status === 'ready_for_checkout' && (
                                <Link href={`/buyer/custom-orders/${request.id}/checkout`}>
                                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            )}
                            {request.status === 'quoted' && (
                                <>
                                    <Button
                                        onClick={handleAccept}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    >
                                        <ThumbsUp className="mr-2 h-4 w-4" />
                                        Accept Quote
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowDeclineModal(true)}>
                                        <ThumbsDown className="mr-2 h-4 w-4" />
                                        Decline
                                    </Button>
                                </>
                            )}
                            {['pending', 'quoted'].includes(request.status) && (
                                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Steps - Only show for non-terminal statuses */}
                {!isTerminalStatus && (
                    <Card className="mb-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                {statusSteps.map((step, index) => {
                                    const currentStep = getCurrentStep();
                                    const isActive = index <= currentStep;
                                    const isCurrent = index === currentStep;
                                    const Icon = step.icon;

                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                                        isActive
                                                            ? isCurrent
                                                                ? 'border-amber-500 bg-amber-500 text-white'
                                                                : 'border-green-500 bg-green-500 text-white'
                                                            : 'border-gray-300 bg-white text-gray-400'
                                                    }`}
                                                >
                                                    {isActive && index < currentStep ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                </div>
                                                <p className={`mt-2 text-center text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                            {index < statusSteps.length - 1 && (
                                                <div className={`h-1 flex-1 rounded ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Ready for Checkout Banner */}
                {request.status === 'ready_for_checkout' && (
                    <Card className="mb-8 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
                        <CardContent className="flex items-center justify-between gap-4 pt-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-orange-900">Your Custom Order is Ready!</h3>
                                    <p className="mt-1 text-sm text-orange-800">
                                        The artisan has completed your custom order. Proceed to checkout to complete your purchase and arrange
                                        delivery.
                                    </p>
                                </div>
                            </div>
                            <Link href={`/buyer/custom-orders/${request.id}/checkout`}>
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Checkout Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Terminal Status Message */}
                {isTerminalStatus && (
                    <Card className="mb-8 border-red-200 bg-red-50">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <XCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                            <div>
                                <h3 className="font-semibold text-red-900">
                                    {request.status === 'rejected' && 'Request Rejected by Artisan'}
                                    {request.status === 'declined' && 'Quote Declined'}
                                    {request.status === 'cancelled' && 'Request Cancelled'}
                                </h3>
                                {request.rejection_reason && <p className="mt-1 text-sm text-red-800">Reason: {request.rejection_reason}</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Quote Card - Show prominently when quoted */}
                        {request.quoted_price && (
                            <Card
                                className={`border-2 ${
                                    request.status === 'quoted'
                                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50'
                                        : 'border-green-200 bg-green-50'
                                }`}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        {request.status === 'quoted' ? 'Quote Received!' : 'Accepted Quote'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Quoted Price</p>
                                            <p className="text-3xl font-bold text-gray-900">₱{Number(request.quoted_price).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">for {request.quantity} item(s)</p>
                                        </div>
                                        {request.estimated_days && (
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                                <p className="text-2xl font-bold text-gray-900">{request.estimated_days} days</p>
                                            </div>
                                        )}
                                    </div>
                                    {request.seller_notes && (
                                        <div className="mt-4 rounded-lg bg-white/50 p-4">
                                            <p className="text-sm font-medium text-gray-700">Artisan's Note:</p>
                                            <p className="mt-1 text-gray-600">{request.seller_notes}</p>
                                        </div>
                                    )}
                                    {request.quoted_at && (
                                        <p className="mt-4 text-xs text-gray-500">Quoted on {new Date(request.quoted_at).toLocaleDateString()}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Details</CardTitle>
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
                                                Your Budget
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
                                            <p className="font-medium text-gray-900">{new Date(request.preferred_deadline).toLocaleDateString()}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            Submitted
                                        </p>
                                        <p className="font-medium text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p>
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
                                        Reference Images
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
                                                <img src={url} alt={`Reference ${index + 1}`} className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Seller Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Artisan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="mb-4 h-20 w-20">
                                        <AvatarImage src={request.seller.avatar_url || undefined} />
                                        <AvatarFallback className="bg-amber-100 text-2xl text-amber-700">
                                            {request.seller.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-semibold text-gray-900">{request.seller.name}</h3>
                                    <p className="text-sm text-gray-500">Artisan</p>

                                    {request.seller.address && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            {request.seller.address}
                                        </p>
                                    )}

                                    <div className="mt-4 w-full space-y-2">
                                        <StartChatButton userId={request.seller.id} variant="outline" className="w-full">
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Message Artisan
                                        </StartChatButton>

                                        <Link href={`/artisan/${request.seller.id}`} className="block">
                                            <Button variant="ghost" className="w-full">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3 border-t pt-4">
                                    {request.seller.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {request.seller.email}
                                        </div>
                                    )}
                                    {request.seller.phone_number && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {request.seller.phone_number}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

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
                                            <p className="font-medium text-gray-900">Request Submitted</p>
                                            <p className="text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {request.quoted_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <DollarSign className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quote Received</p>
                                                <p className="text-sm text-gray-500">{new Date(request.quoted_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {request.accepted_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <ThumbsUp className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quote Accepted</p>
                                                <p className="text-sm text-gray-500">{new Date(request.accepted_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {request.completed_at && (
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Completed</p>
                                                <p className="text-sm text-gray-500">{new Date(request.completed_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Decline Modal */}
            <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Quote</DialogTitle>
                        <DialogDescription>Are you sure you want to decline this quote? You can provide a reason for the artisan.</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Textarea
                            placeholder="Reason for declining (optional)"
                            value={declineForm.data.reason}
                            onChange={(e) => declineForm.setData('reason', e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeclineModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDecline} disabled={declineForm.processing}>
                            {declineForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Decline Quote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this custom order request? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            Keep Request
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                            Cancel Request
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
        </BuyerLayout>
    );
}
