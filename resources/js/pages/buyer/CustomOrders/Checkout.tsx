import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Banknote, CheckCircle2, CreditCard, Package, Phone, ShoppingBag, Truck } from 'lucide-react';
import React, { useState } from 'react';

interface CustomOrderRequest {
    id: number;
    request_number: string;
    title: string;
    description: string;
    quantity: number;
    quoted_price: number;
    estimated_days: number | null;
    seller_notes: string | null;
    reference_image_urls: string[];
    seller: {
        id: number;
        name: string;
        avatar_url: string | null;
        email: string;
        phone_number: string | null;
        address: string | null;
        gcash_number: string | null;
        gcash_name: string | null;
    };
}

interface UserInfo {
    name: string;
    email: string;
    phone_number: string | null;
    delivery_address: string | null;
    delivery_phone: string | null;
    delivery_notes: string | null;
    delivery_province: string | null;
    delivery_city: string | null;
    delivery_barangay: string | null;
    delivery_street: string | null;
    delivery_building_details: string | null;
}

interface Props {
    request: CustomOrderRequest;
    user: UserInfo;
}

export default function Checkout({ request, user }: Props) {
    const [_paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash'>('cod');

    // Build default address from user fields
    const buildDefaultAddress = () => {
        const parts = [
            user.delivery_street,
            user.delivery_building_details,
            user.delivery_barangay,
            user.delivery_city,
            user.delivery_province,
        ].filter(Boolean);
        return parts.join(', ') || user.delivery_address || '';
    };

    const { data, setData, post, processing, errors } = useForm({
        delivery_address: buildDefaultAddress(),
        delivery_phone: user.delivery_phone || user.phone_number || '',
        delivery_notes: user.delivery_notes || '',
        payment_method: 'cod' as 'cod' | 'gcash',
        gcash_reference: '',
    });

    const shippingFee = 50;
    const totalAmount = parseFloat(String(request.quoted_price)) + shippingFee;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/buyer/custom-orders/${request.id}/place-order`);
    };

    return (
        <BuyerLayout>
            <Head title={`Checkout - ${request.request_number}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/buyer/custom-orders/${request.id}`}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Order Details
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout Custom Order</h1>
                    <p className="mt-1 text-gray-500">Complete your purchase for {request.request_number}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-amber-600" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        {request.reference_image_urls[0] ? (
                                            <img
                                                src={request.reference_image_urls[0]}
                                                alt={request.title}
                                                className="h-24 w-24 rounded-lg border object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-amber-50">
                                                <Package className="h-10 w-10 text-amber-300" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{request.title}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{request.description}</p>
                                            <div className="mt-2 flex items-center gap-4 text-sm">
                                                <span className="text-gray-500">Qty: {request.quantity}</span>
                                                <span className="font-semibold text-amber-600">
                                                    ₱{parseFloat(String(request.quoted_price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={request.seller.avatar_url || undefined} />
                                            <AvatarFallback className="bg-amber-100 text-amber-700">
                                                {request.seller.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{request.seller.name}</p>
                                            <p className="text-xs text-gray-500">Artisan</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-amber-600" />
                                        Delivery Information
                                    </CardTitle>
                                    <CardDescription>Where should we deliver your custom order?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="delivery_address">Delivery Address *</Label>
                                        <Textarea
                                            id="delivery_address"
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            placeholder="Enter your complete delivery address"
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.delivery_address && <p className="mt-1 text-sm text-red-500">{errors.delivery_address}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="delivery_phone">Contact Number *</Label>
                                        <div className="relative mt-1">
                                            <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="delivery_phone"
                                                type="tel"
                                                value={data.delivery_phone}
                                                onChange={(e) => setData('delivery_phone', e.target.value)}
                                                placeholder="09XX XXX XXXX"
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.delivery_phone && <p className="mt-1 text-sm text-red-500">{errors.delivery_phone}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="delivery_notes">Delivery Notes (Optional)</Label>
                                        <Textarea
                                            id="delivery_notes"
                                            value={data.delivery_notes}
                                            onChange={(e) => setData('delivery_notes', e.target.value)}
                                            placeholder="Any special instructions for delivery..."
                                            rows={2}
                                            className="mt-1"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-amber-600" />
                                        Payment Method
                                    </CardTitle>
                                    <CardDescription>Choose how you want to pay</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* COD Option */}
                                    <label
                                        className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                                            data.payment_method === 'cod' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cod"
                                            checked={data.payment_method === 'cod'}
                                            onChange={() => {
                                                setPaymentMethod('cod');
                                                setData('payment_method', 'cod');
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Pay when you receive your order. Please prepare the exact amount.
                                            </p>
                                        </div>
                                    </label>

                                    {/* GCash Option */}
                                    <label
                                        className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                                            data.payment_method === 'gcash' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="gcash"
                                            checked={data.payment_method === 'gcash'}
                                            onChange={() => {
                                                setPaymentMethod('gcash');
                                                setData('payment_method', 'gcash');
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                                                    G
                                                </div>
                                                <span className="font-medium text-gray-900">GCash</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Pay via GCash e-wallet. You'll need to upload proof of payment.
                                            </p>
                                        </div>
                                    </label>

                                    {/* GCash Details */}
                                    {data.payment_method === 'gcash' && (
                                        <div className="ml-8 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-900">Send payment to:</p>
                                                    {request.seller.gcash_number ? (
                                                        <>
                                                            <p className="text-lg font-bold text-blue-800">{request.seller.gcash_number}</p>
                                                            {request.seller.gcash_name && (
                                                                <p className="text-sm text-blue-700">{request.seller.gcash_name}</p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-blue-700">Contact the seller for their GCash details.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="gcash_reference">GCash Reference Number *</Label>
                                                <Input
                                                    id="gcash_reference"
                                                    value={data.gcash_reference}
                                                    onChange={(e) => setData('gcash_reference', e.target.value)}
                                                    placeholder="Enter reference number from GCash"
                                                    className="mt-1"
                                                />
                                                {errors.gcash_reference && <p className="mt-1 text-sm text-red-500">{errors.gcash_reference}</p>}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Total Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-amber-600" />
                                        Order Total
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-medium">
                                                ₱{parseFloat(String(request.quoted_price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Shipping Fee</span>
                                            <span className="font-medium">₱{shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="text-xl font-bold text-amber-600">
                                                ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {request.estimated_days && (
                                        <div className="rounded-lg bg-green-50 p-3">
                                            <p className="text-sm text-green-700">
                                                <CheckCircle2 className="mr-1 inline h-4 w-4" />
                                                Custom order is ready! Estimated delivery in {request.estimated_days} days.
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                        size="lg"
                                    >
                                        {processing ? 'Placing Order...' : 'Place Order'}
                                    </Button>

                                    <p className="text-center text-xs text-gray-500">
                                        By placing this order, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </BuyerLayout>
    );
}
