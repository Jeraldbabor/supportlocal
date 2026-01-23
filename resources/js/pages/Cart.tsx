import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import MainLayout from '../layouts/MainLayout';

export default function Cart() {
    const { items: cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
    const { props } = usePage<{ auth?: { user?: unknown } }>();
    const isAuthenticated = !!props?.auth?.user;

    // Redirect authenticated users to buyer cart
    useEffect(() => {
        if (isAuthenticated) {
            router.visit('/buyer/cart');
        }
    }, [isAuthenticated]);

    // Calculate totals for guest cart
    const subtotal = totalAmount;
    const shipping = subtotal > 75 ? 0 : 8.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Don't render if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    if (cartItems.length === 0) {
        return (
            <MainLayout title="Shopping Cart">
                <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-gray-300" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mb-8 text-gray-600">Looks like you haven't added any items to your cart yet.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-orange-700"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" style={{ color: '#ffffff' }} />
                        Continue Shopping
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Shopping Cart">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ colorScheme: 'light' }}>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-20 w-20 overflow-hidden rounded-md bg-gray-100">
                                                {item.primary_image ? (
                                                    <img
                                                        src={item.primary_image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-600">by {item.seller.name}</p>
                                                </div>
                                                <p className="mt-1 text-lg font-semibold" style={{ color: '#ea580c' }}>₱{item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center rounded-md border border-gray-300 bg-white">
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                        className="p-2 hover:bg-gray-100"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" style={{ color: '#4b5563' }} />
                                                    </button>
                                                    <span className="min-w-[60px] px-4 py-2 text-center text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-100"
                                                        disabled={item.quantity >= item.max_quantity}
                                                    >
                                                        <Plus className="h-4 w-4" style={{ color: '#4b5563' }} />
                                                    </button>
                                                </div>
                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="p-2 hover:bg-red-50"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="h-5 w-5" style={{ color: '#dc2626' }} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-sm text-gray-600">₱{item.price.toFixed(2)} each</span>
                                            <span className="font-semibold text-gray-900">Subtotal: ₱{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <Link href="/products" className="inline-flex items-center font-medium text-orange-600 hover:text-orange-700">
                                        <ArrowLeft className="mr-2 h-4 w-4" style={{ color: '#ea580c' }} />
                                        Continue Shopping
                                    </Link>
                                    <button onClick={clearCart} className="font-medium text-red-600 hover:text-red-800">
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-base text-gray-700">Subtotal</span>
                                    <span className="font-medium text-gray-900">₱{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base text-gray-700">Shipping</span>
                                    <span className="font-medium text-gray-900">
                                        {shipping === 0 ? <span style={{ color: '#16a34a' }}>Free</span> : `₱${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base text-gray-700">Tax</span>
                                    <span className="font-medium text-gray-900">₱{tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-semibold" style={{ color: '#ea580c' }}>₱{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {shipping > 0 && (
                                <div className="mt-4 rounded-md border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                                    <p className="text-sm font-medium text-amber-900">Add ₱{(75 - subtotal).toFixed(2)} more to get free shipping!</p>
                                </div>
                            )}

                            <Link
                                href="/checkout"
                                className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-amber-700 hover:to-orange-700 hover:shadow-xl active:scale-[0.98]"
                            >
                                Proceed to Checkout
                            </Link>

                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">Secure checkout with SSL encryption</p>
                            </div>

                            {/* Payment Methods */}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <h4 className="mb-3 text-sm font-medium text-gray-900">We accept</h4>
                                <div className="flex space-x-2">
                                    <div className="rounded bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800">COD</div>
                                    <div className="rounded bg-blue-100 px-3 py-2 text-xs font-medium text-blue-800">GCash</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
