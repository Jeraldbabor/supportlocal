import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag, User, LogIn, UserPlus } from 'lucide-react';
import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../contexts/CartContext';

export default function GuestCheckout() {
    const { items, totalAmount } = useCart();
    const { props } = usePage();
    const isAuthenticated = !!(props as any)?.auth?.user;

    // Redirect authenticated users to buyer checkout
    useEffect(() => {
        if (isAuthenticated) {
            router.visit('/buyer/checkout');
        }
    }, [isAuthenticated]);

    const shipping = totalAmount > 75 ? 0 : 8.99;
    const tax = totalAmount * 0.08;
    const total = totalAmount + shipping + tax;

    // Don't render if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    if (items.length === 0) {
        return (
            <MainLayout title="Checkout">
                <Head title="Checkout" />
                <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-gray-300" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mb-8 text-gray-600">Add some items to your cart before checking out.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Continue Shopping
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Checkout">
            <Head title="Checkout" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="mb-4 inline-flex items-center text-primary hover:text-primary/80"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Sign In or Continue Section */}
                        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-md border-2 border-amber-200/50">
                            <div className="p-8">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 p-3 shadow-md">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Welcome to Our Artisan Hub!</h2>
                                        <p className="text-amber-900/80">Sign in to complete your purchase</p>
                                    </div>
                                </div>

                                <p className="mb-6 text-gray-800">
                                    To complete your order and enjoy faster checkout in the future, please sign in to your account or create a new one.
                                </p>

                                <div className="space-y-4">
                                    {/* Sign In Button */}
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <LogIn className="h-5 w-5" />
                                        Sign In to Your Account
                                    </Link>

                                    {/* Register Button */}
                                    <Link
                                        href="/register"
                                        className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-amber-300 bg-white px-6 py-4 font-semibold text-amber-700 shadow-md transition-all hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <UserPlus className="h-5 w-5" />
                                        Create New Account
                                    </Link>
                                </div>

                                <div className="mt-6 rounded-lg bg-white/80 backdrop-blur-sm border border-amber-200/50 p-4 shadow-sm">
                                    <h3 className="mb-2 font-semibold text-amber-900">Why create an account?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <span className="mr-2 text-amber-600 font-bold">✓</span>
                                            Track your orders in real-time
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-amber-600 font-bold">✓</span>
                                            Save addresses for faster checkout
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-amber-600 font-bold">✓</span>
                                            View order history and reorder easily
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-amber-600 font-bold">✓</span>
                                            Get exclusive deals and updates from local artisans
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cart Items Preview */}
                        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Items</h3>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                                            {item.primary_image ? (
                                                <img
                                                    src={`/storage/${item.primary_image}`}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            ₱{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-xl bg-white p-6 shadow-md">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>

                            <div className="space-y-3 border-b border-gray-200 pb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                    <span>₱{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₱${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₱{tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">₱{total.toFixed(2)}</span>
                            </div>

                            {shipping > 0 && (
                                <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3">
                                    <p className="text-sm text-amber-900 font-medium">
                                        Add ₱{(75 - totalAmount).toFixed(2)} more for free shipping!
                                    </p>
                                </div>
                            )}

                            <div className="mt-6">
                                <p className="text-center text-xs text-gray-500">
                                    Secure checkout with SSL encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
