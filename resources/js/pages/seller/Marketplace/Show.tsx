import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Gavel,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Package,
    Send,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';

interface Buyer {
    id: number;
    name: string;
    avatar_url: string | null;
    address: string | null;
}

interface MyBid {
    id: number;
    proposed_price: number;
    estimated_days: number;
    message: string;
    additional_notes: string | null;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
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
    special_requirements: string | null;
    reference_image_urls: string[];
    status: string;
    status_label: string;
    status_color: string;
    bids_count: number;
    created_at: string;
    buyer: Buyer | null;
}

interface Props {
    request: CustomOrderRequest;
    myBid: MyBid | null;
    canBid: boolean;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/seller/dashboard' },
    { title: 'Marketplace', href: '/seller/marketplace' },
    { title: 'Request Details', href: '#' },
];

export default function MarketplaceShow({ request, myBid, canBid }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(request.reference_image_urls[0] || null);
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        proposed_price: myBid?.proposed_price?.toString() || '',
        estimated_days: myBid?.estimated_days?.toString() || '',
        message: myBid?.message || '',
        additional_notes: myBid?.additional_notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (myBid && isEditing) {
            put(`/seller/marketplace/bids/${myBid.id}`, {
                onSuccess: () => setIsEditing(false),
            });
        } else {
            post(`/seller/marketplace/${request.id}/bid`);
        }
    };

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

    const getStatusBadgeClass = (color: string) => {
        const colors: Record<string, string> = {
            yellow: 'bg-yellow-100 text-yellow-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800',
        };
        return colors[color] || colors.gray;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bid on: ${request.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Back Button */}
                <div>
                    <Link href="/seller/marketplace">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Request Details Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge className="bg-blue-100 text-blue-800">{request.status_label}</Badge>
                                            {request.category_label && <Badge variant="outline">{request.category_label}</Badge>}
                                        </div>
                                        <CardTitle className="text-xl">{request.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                            Request #{request.request_number} • Posted {formatDateTime(request.created_at)}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">{request.bids_count} bids</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="mb-2 font-semibold text-gray-900">Description</h3>
                                    <p className="whitespace-pre-wrap text-gray-700">{request.description}</p>
                                </div>

                                {/* Key Details */}
                                <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-green-100 p-2">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Budget</p>
                                            <p className="font-semibold text-gray-900">{request.formatted_budget || 'Flexible'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-100 p-2">
                                            <Package className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="font-semibold text-gray-900">{request.quantity} item(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-orange-100 p-2">
                                            <Calendar className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Deadline</p>
                                            <p className="font-semibold text-gray-900">
                                                {request.preferred_deadline ? formatDate(request.preferred_deadline) : 'Flexible'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Requirements */}
                                {request.special_requirements && (
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-900">Special Requirements</h3>
                                        <p className="rounded-lg bg-amber-50 p-4 whitespace-pre-wrap text-gray-700">{request.special_requirements}</p>
                                    </div>
                                )}

                                {/* Reference Images */}
                                {request.reference_image_urls.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                                            <ImageIcon className="h-4 w-4" />
                                            Reference Images ({request.reference_image_urls.length})
                                        </h3>
                                        {selectedImage && (
                                            <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
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
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Buyer Info */}
                        {request.buyer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Posted By</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={request.buyer.avatar_url || undefined} />
                                            <AvatarFallback className="bg-amber-100 text-amber-700">{request.buyer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-gray-900">{request.buyer.name}</p>
                                            {request.buyer.address && (
                                                <p className="flex items-center gap-1 text-sm text-gray-500">
                                                    <MapPin className="h-3 w-3" />
                                                    {request.buyer.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Bid Form / My Bid */}
                    <div className="space-y-6">
                        {myBid && !isEditing ? (
                            /* Show My Bid */
                            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Your Bid
                                        </CardTitle>
                                        <Badge className={getStatusBadgeClass(myBid.status_color)}>{myBid.status_label}</Badge>
                                    </div>
                                    <CardDescription>Submitted {formatDateTime(myBid.created_at)}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg bg-white p-3">
                                            <p className="text-xs text-gray-500">Your Price</p>
                                            <p className="text-lg font-bold text-green-600">₱{Number(myBid.proposed_price).toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-white p-3">
                                            <p className="text-xs text-gray-500">Delivery Time</p>
                                            <p className="text-lg font-bold text-gray-900">{myBid.estimated_days} days</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs text-gray-500">Your Message</p>
                                        <p className="text-sm text-gray-700">{myBid.message}</p>
                                    </div>

                                    {myBid.additional_notes && (
                                        <div>
                                            <p className="mb-1 text-xs text-gray-500">Additional Notes</p>
                                            <p className="text-sm text-gray-700">{myBid.additional_notes}</p>
                                        </div>
                                    )}

                                    {myBid.status === 'pending' && (
                                        <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Bid
                                        </Button>
                                    )}

                                    {myBid.status === 'accepted' && (
                                        <div className="rounded-lg bg-green-100 p-4 text-center">
                                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                                            <p className="font-semibold text-green-800">Congratulations!</p>
                                            <p className="text-sm text-green-700">Your bid was accepted. Check your custom orders.</p>
                                            <Link href="/seller/custom-orders">
                                                <Button className="mt-3 bg-green-600 hover:bg-green-700">View Order</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            /* Bid Form */
                            <Card className="border-amber-200">
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <Gavel className="h-5 w-5 text-amber-600" />
                                        {isEditing ? 'Update Your Bid' : 'Submit Your Bid'}
                                    </CardTitle>
                                    <CardDescription>
                                        {isEditing ? 'Update your proposal for this project' : 'Make a competitive offer to win this project'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {canBid || isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="proposed_price">
                                                        Your Price (₱) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="proposed_price"
                                                        type="number"
                                                        min="1"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={data.proposed_price}
                                                        onChange={(e) => setData('proposed_price', e.target.value)}
                                                        className={errors.proposed_price ? 'border-red-500' : ''}
                                                    />
                                                    {errors.proposed_price && <p className="mt-1 text-xs text-red-500">{errors.proposed_price}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="estimated_days">
                                                        Delivery (days) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="estimated_days"
                                                        type="number"
                                                        min="1"
                                                        max="365"
                                                        placeholder="7"
                                                        value={data.estimated_days}
                                                        onChange={(e) => setData('estimated_days', e.target.value)}
                                                        className={errors.estimated_days ? 'border-red-500' : ''}
                                                    />
                                                    {errors.estimated_days && <p className="mt-1 text-xs text-red-500">{errors.estimated_days}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="message">
                                                    Your Proposal <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Introduce yourself and explain why you're the best fit for this project. Describe your experience, approach, and what makes you stand out..."
                                                    value={data.message}
                                                    onChange={(e) => setData('message', e.target.value)}
                                                    rows={5}
                                                    className={errors.message ? 'border-red-500' : ''}
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Min 20 characters. {data.message.length}/2000</p>
                                                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
                                                <Textarea
                                                    id="additional_notes"
                                                    placeholder="Any additional information, questions, or clarifications..."
                                                    value={data.additional_notes}
                                                    onChange={(e) => setData('additional_notes', e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                {isEditing && (
                                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            {isEditing ? 'Update Bid' : 'Submit Bid'}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <Clock className="mx-auto mb-2 h-8 w-8" />
                                            <p>This request is no longer accepting bids.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Tips Card */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                                <h4 className="mb-2 font-semibold text-blue-900">Tips for Winning Bids</h4>
                                <ul className="space-y-1 text-sm text-blue-800">
                                    <li>• Be competitive but realistic with pricing</li>
                                    <li>• Highlight your relevant experience</li>
                                    <li>• Respond promptly to messages</li>
                                    <li>• Ask clarifying questions if needed</li>
                                    <li>• Provide realistic delivery estimates</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
