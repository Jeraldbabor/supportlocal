import { Head, useForm, router } from '@inertiajs/react';
import { CreditCard, MapPin, Phone, User, ShoppingBag, ArrowLeft, CheckCircle, Truck } from 'lucide-react';
import React, { useState } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { useCart } from '../../contexts/CartContext';
import { formatPeso } from '../../utils/currency';
import Toast from '../../components/Toast';

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
        gcash_number?: string;
        gcash_name?: string;
    };
}

export default function Checkout({ user }: CheckoutProps) {
    const { cart, getCartTotal, clearCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const { data, setData, post, processing, errors } = useForm({
        delivery_address: user.delivery_address || user.address || '',
        delivery_phone: user.delivery_phone || user.phone_number || '',
        delivery_notes: user.delivery_notes || '',
        payment_method: 'cod',
        gcash_reference: user.gcash_number || '',
        items: [] as Array<{ product_id: number; quantity: number; }>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            setToastMessage('Your cart is empty!');
            setToastType('error');
            setShowToast(true);
            return;
        }

        // Prepare the order data with items
        const orderData = {
            delivery_address: data.delivery_address,
            delivery_phone: data.delivery_phone,
            delivery_notes: data.delivery_notes,
            payment_method: data.payment_method,
            gcash_reference: data.gcash_reference,
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
            })),
        };

        // Submit using Inertia router instead of form post
        router.post('/buyer/orders', orderData, {
            onSuccess: () => {
                clearCart();
                setToastMessage('Order placed successfully!');
                setToastType('success');
                setShowToast(true);
                // Redirect to orders page after a delay
                setTimeout(() => {
                    router.visit('/buyer/orders');
                }, 2000);
            },
            onError: (errors: any) => {
                // Show specific validation errors if available
                if (typeof errors === 'object' && errors !== null) {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 
                        ? `Error: ${errorMessages.join(', ')}` 
                        : 'Failed to place order. Please try again.';
                    
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

    if (cart.length === 0) {
        return (
            <BuyerLayout title="Checkout">
                <Head title="Checkout" />
                
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                            <ShoppingBag className="h-full w-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add items to your cart before checking out.</p>
                        <button
                            onClick={() => router.visit('/buyer/products')}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
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
                    <button 
                        onClick={handleBackToCart}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">Complete your order</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Shipping Information */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center mb-6">
                                    <MapPin className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="shipping_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_name"
                                            value={user.name || ''}
                                            readOnly
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            required
                                        />

                                    </div>

                                    <div>
                                        <label htmlFor="shipping_email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="shipping_email"
                                            value={user.email}
                                            readOnly
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            required
                                        />

                                    </div>

                                    <div>
                                        <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="shipping_phone"
                                            value={data.delivery_phone}
                                            onChange={(e) => setData('delivery_phone', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            required
                                        />
                                        {errors.delivery_phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.delivery_phone}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Complete Address
                                        </label>
                                        <textarea
                                            id="shipping_address"
                                            rows={3}
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            placeholder="Street address, city, province, postal code"
                                            required
                                        />
                                        {errors.delivery_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.delivery_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center mb-6">
                                    <CreditCard className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="radio"
                                                    value="cod"
                                                    checked={data.payment_method === 'cod'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                                                        <Truck className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Cash on Delivery (COD)</div>
                                                        <div className="text-sm text-gray-500">Pay with cash when your order arrives</div>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="radio"
                                                    value="gcash"
                                                    checked={data.payment_method === 'gcash'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                                                        <span className="text-white text-xs font-bold">G</span>
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
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <User className="h-5 w-5 text-green-600 mr-2" />
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
                                                        <span className="font-medium text-gray-900 text-right max-w-xs">{data.delivery_address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-3 text-xs text-green-700">
                                                💡 Please ensure your contact information is correct. Our delivery team will use this information to reach you.
                                            </p>
                                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="text-xs text-yellow-800">
                                                    <strong>Note:</strong> Payment will be collected upon delivery. Please have the exact amount ready ({formatPeso(getCartTotal())}).
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {data.payment_method === 'gcash' && (
                                        <div>
                                            <label htmlFor="gcash_number" className="block text-sm font-medium text-gray-700 mb-2">
                                                GCash Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    id="gcash_number"
                                                    value={data.gcash_reference}
                                                    onChange={(e) => setData('gcash_reference', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-primary focus:ring-primary"
                                                    placeholder="09XX XXX XXXX"
                                                    required
                                                />
                                            </div>
                                            {errors.gcash_reference && (
                                                <p className="mt-1 text-sm text-red-600">{errors.gcash_reference}</p>
                                            )}
                                            <p className="mt-2 text-sm text-gray-500">
                                                This should be the GCash number linked to your account for payment verification.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions (Optional)</h3>
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
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                                
                                <div className="space-y-4 mb-6">
                                    {cart.map((item) => (
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
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × {formatPeso(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPeso(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatPeso(getCartTotal())}</span>
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

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {formatPeso(getCartTotal())}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full mt-6 rounded-lg px-6 py-3 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                        processing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary-dark'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Place Order - {formatPeso(getCartTotal())}
                                        </div>
                                    )}
                                </button>

                                <p className="mt-4 text-xs text-gray-500 text-center">
                                    By placing this order, you agree to our terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </BuyerLayout>
    );
}