import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Phone, ShoppingBag, Truck, User } from 'lucide-react';
import React, { useState } from 'react';
import LocationPicker from '../../components/LocationPicker';
import Toast from '../../components/Toast';
import { useCart } from '../../contexts/CartContext';
import BuyerLayout from '../../layouts/BuyerLayout';
import { formatPeso } from '../../utils/currency';

interface CheckoutProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        phone_number?: string;
        address?: string;
        delivery_address?: string;
        delivery_phone?: string;
        delivery_notes?: string;
        delivery_province?: string;
        delivery_city?: string;
        delivery_barangay?: string;
        delivery_street?: string;
        delivery_building_details?: string;
        delivery_latitude?: number;
        delivery_longitude?: number;
        gcash_number?: string;
        gcash_name?: string;
    };
    buyNowItem?: {
        id: number;
        product_id: number;
        name: string;
        price: number;
        quantity: number;
        primary_image: string;
        seller: {
            id: number;
            name: string;
        };
        max_quantity: number;
        stock_quantity: number;
    } | null;
}

export default function Checkout({ user, buyNowItem }: CheckoutProps) {
    const { cart, getCartTotal, clearCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Use buyNowItem if available, otherwise use cart
    const checkoutItems = buyNowItem ? [buyNowItem] : cart;
    const checkoutTotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : getCartTotal();

    const { data, setData, processing, errors } = useForm({
        delivery_address: user.delivery_address || user.address || '',
        delivery_phone: user.delivery_phone || user.phone_number || '',
        delivery_notes: user.delivery_notes || '',
        delivery_province: user.delivery_province || '',
        delivery_city: user.delivery_city || '',
        delivery_barangay: user.delivery_barangay || '',
        delivery_street: user.delivery_street || '',
        delivery_building_details: user.delivery_building_details || '',
        delivery_latitude: user.delivery_latitude || null,
        delivery_longitude: user.delivery_longitude || null,
        payment_method: 'cod',
        gcash_reference: user.gcash_number || '',
        items: [] as Array<{ product_id: number; quantity: number }>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (checkoutItems.length === 0) {
            setToastMessage('Your cart is empty!');
            setToastType('error');
            setShowToast(true);
            return;
        }

        // Prepare the order data with items and delivery location
        const orderData = {
            delivery_address: data.delivery_address,
            delivery_phone: data.delivery_phone,
            delivery_notes: data.delivery_notes,
            delivery_province: data.delivery_province,
            delivery_city: data.delivery_city,
            delivery_barangay: data.delivery_barangay,
            delivery_street: data.delivery_street,
            delivery_building_details: data.delivery_building_details,
            delivery_latitude: data.delivery_latitude,
            delivery_longitude: data.delivery_longitude,
            payment_method: data.payment_method,
            gcash_reference: data.gcash_reference,
            items: checkoutItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
            })),
        };

        // Submit using Inertia router instead of form post
        router.post('/buyer/orders', orderData, {
            onSuccess: () => {
                // Only clear cart if not using buy now (buy now doesn't add to cart)
                if (!buyNowItem) {
                    clearCart();
                }
                setToastMessage('Order placed successfully!');
                setToastType('success');
                setShowToast(true);
                // Redirect to orders page after a delay
                setTimeout(() => {
                    router.visit('/buyer/orders');
                }, 2000);
            },
            onError: (errors: Record<string, string>) => {
                // Show specific validation errors if available
                if (typeof errors === 'object' && errors !== null) {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 ? `Error: ${errorMessages.join(', ')}` : 'Failed to place order. Please try again.';

                    setToastMessage(errorMessage);
                } else {
                    setToastMessage('Failed to place order. Please check your information and try again.');
                }
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    const handleBackToCart = () => {
        router.visit('/buyer/cart');
    };

    if (checkoutItems.length === 0) {
        return (
            <BuyerLayout title="Checkout">
                <Head title="Checkout" />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 h-24 w-24 text-gray-400">
                            <ShoppingBag className="h-full w-full" />
                        </div>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                        <p className="mb-8 text-gray-600">Add items to your cart before checking out.</p>
                        <button
                            onClick={() => router.visit('/buyer/products')}
                            className="hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </BuyerLayout>
        );
    }

    return (
        <BuyerLayout title="Checkout">
            <Head title="Checkout" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <button onClick={handleBackToCart} className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="mt-2 text-gray-600">{buyNowItem ? 'Complete your order for the selected item' : 'Complete your order'}</p>
                    {buyNowItem && (
                        <div className="mt-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Buy Now - Express Checkout
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Checkout Form */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Shipping Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Truck className="mr-3 h-6 w-6 text-primary" />
                                        <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                                    </div>
                                    {user.delivery_province && user.delivery_city && user.delivery_barangay && (
                                        <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Profile Saved
                                        </div>
                                    )}
                                </div>

                                {/* Editable Delivery Location */}
                                <div className="space-y-6">
                                    {/* Province, City, Barangay */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label htmlFor="delivery_province" className="mb-2 block text-sm font-medium text-gray-700">
                                                Province *
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_province"
                                                value={data.delivery_province}
                                                onChange={(e) => setData('delivery_province', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="Enter province"
                                                required
                                            />
                                            {errors.delivery_province && <p className="mt-1 text-sm text-red-600">{errors.delivery_province}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="delivery_city" className="mb-2 block text-sm font-medium text-gray-700">
                                                City / Municipality *
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_city"
                                                value={data.delivery_city}
                                                onChange={(e) => setData('delivery_city', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="Enter city"
                                                required
                                            />
                                            {errors.delivery_city && <p className="mt-1 text-sm text-red-600">{errors.delivery_city}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="delivery_barangay" className="mb-2 block text-sm font-medium text-gray-700">
                                                Barangay *
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_barangay"
                                                value={data.delivery_barangay}
                                                onChange={(e) => setData('delivery_barangay', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="Enter barangay"
                                                required
                                            />
                                            {errors.delivery_barangay && <p className="mt-1 text-sm text-red-600">{errors.delivery_barangay}</p>}
                                        </div>
                                    </div>

                                    {/* Street and Building Details */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label htmlFor="delivery_street" className="mb-2 block text-sm font-medium text-gray-700">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_street"
                                                value={data.delivery_street}
                                                onChange={(e) => setData('delivery_street', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="e.g., 123 Main Street"
                                            />
                                            {errors.delivery_street && <p className="mt-1 text-sm text-red-600">{errors.delivery_street}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="delivery_building_details" className="mb-2 block text-sm font-medium text-gray-700">
                                                Building / Unit Details
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_building_details"
                                                value={data.delivery_building_details}
                                                onChange={(e) => setData('delivery_building_details', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="e.g., Bldg 5, Unit 201"
                                            />
                                            {errors.delivery_building_details && <p className="mt-1 text-sm text-red-600">{errors.delivery_building_details}</p>}
                                        </div>
                                    </div>

                                    {/* Interactive Map - Editable */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Pin Your Exact Location on Map
                                        </label>
                                        <LocationPicker
                                            latitude={data.delivery_latitude || undefined}
                                            longitude={data.delivery_longitude || undefined}
                                            address={
                                                data.delivery_barangay && data.delivery_city && data.delivery_province
                                                    ? `${data.delivery_barangay}, ${data.delivery_city}, ${data.delivery_province}, Philippines`
                                                    : ''
                                            }
                                            onLocationChange={(lat, lng) => {
                                                setData('delivery_latitude', lat);
                                                setData('delivery_longitude', lng);
                                            }}
                                            centerOnAddress={true}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            💡 Click on the map or drag the marker to set your exact delivery location. This helps ensure accurate delivery!
                                        </p>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label htmlFor="shipping_name" className="mb-2 block text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="shipping_name"
                                                value={user.name || ''}
                                                readOnly
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="shipping_email" className="mb-2 block text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="shipping_email"
                                                value={user.email}
                                                readOnly
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="shipping_phone" className="mb-2 block text-sm font-medium text-gray-700">
                                                Contact Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                id="shipping_phone"
                                                value={data.delivery_phone}
                                                onChange={(e) => setData('delivery_phone', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                                placeholder="e.g., 09123456789"
                                                required
                                            />
                                            {errors.delivery_phone && <p className="mt-1 text-sm text-red-600">{errors.delivery_phone}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center">
                                    <CreditCard className="mr-3 h-6 w-6 text-primary" />
                                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Payment Method</label>
                                        <div className="space-y-2">
                                            <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-3 hover:bg-gray-50">
                                                <input
                                                    type="radio"
                                                    value="cod"
                                                    checked={data.payment_method === 'cod'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-green-600">
                                                        <Truck className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Cash on Delivery (COD)</div>
                                                        <div className="text-sm text-gray-500">Pay with cash when your order arrives</div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-3 hover:bg-gray-50">
                                                <input
                                                    type="radio"
                                                    value="gcash"
                                                    checked={data.payment_method === 'gcash'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-gradient-to-r from-amber-600 to-orange-600 shadow-sm">
                                                        <span className="text-xs font-bold text-white">G</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">GCash</div>
                                                        <div className="text-sm text-gray-500">Pay with GCash mobile wallet</div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {data.payment_method === 'cod' && (
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <div className="mb-3 flex items-center">
                                                <User className="mr-2 h-5 w-5 text-green-600" />
                                                <h4 className="font-medium text-green-800">Buyer Information for COD</h4>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Name:</span>
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium text-gray-900">{user.email}</span>
                                                </div>
                                                {user.phone && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Phone:</span>
                                                        <span className="font-medium text-gray-900">{user.phone}</span>
                                                    </div>
                                                )}
                                                {data.delivery_address && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Address:</span>
                                                        <span className="max-w-xs text-right font-medium text-gray-900">{data.delivery_address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-3 text-xs text-green-700">
                                                💡 Please ensure your contact information is correct. Our delivery team will use this information to
                                                reach you.
                                            </p>
                                            <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-3">
                                                <p className="text-xs text-yellow-800">
                                                    <strong>Note:</strong> Payment will be collected upon delivery. Please have the exact amount ready
                                                    ({formatPeso(checkoutTotal)}).
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {data.payment_method === 'gcash' && (
                                        <div>
                                            <label htmlFor="gcash_number" className="mb-2 block text-sm font-medium text-gray-700">
                                                GCash Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    id="gcash_number"
                                                    value={data.gcash_reference}
                                                    onChange={(e) => setData('gcash_reference', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 focus:border-primary focus:ring-primary"
                                                    placeholder="09XX XXX XXXX"
                                                    required
                                                />
                                            </div>
                                            {errors.gcash_reference && <p className="mt-1 text-sm text-red-600">{errors.gcash_reference}</p>}
                                            <p className="mt-2 text-sm text-gray-500">
                                                This should be the GCash number linked to your account for payment verification.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Special Instructions (Optional)</h3>
                                <textarea
                                    value={data.delivery_notes}
                                    onChange={(e) => setData('delivery_notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                    placeholder="Any special delivery instructions or notes for the seller..."
                                />
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

                                <div className="mb-6 space-y-4">
                                    {checkoutItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {item.primary_image ? (
                                                    <img
                                                        src={`/storage/${item.primary_image}`}
                                                        alt={item.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × {formatPeso(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{formatPeso(item.price * item.quantity)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatPeso(checkoutTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Processing</span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatPeso(checkoutTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`mt-6 w-full rounded-lg px-6 py-3 font-medium text-white transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${
                                        processing ? 'cursor-not-allowed bg-gray-400' : 'hover:bg-primary-dark bg-primary'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Place Order - {formatPeso(checkoutTotal)}
                                        </div>
                                    )}
                                </button>

                                <p className="mt-4 text-center text-xs text-gray-500">
                                    By placing this order, you agree to our terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </BuyerLayout>
    );
}
