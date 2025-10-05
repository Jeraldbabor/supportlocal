import { Head, Link, router } from '@inertiajs/react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import React from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { useCart } from '../../contexts/CartContext';
import { formatPeso } from '../../utils/currency';

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        console.log('Changing quantity for product:', productId, 'to:', newQuantity);
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        router.visit('/buyer/checkout');
    };

    const handleContinueShopping = () => {
        router.visit('/buyer/products');
    };

    if (cart.length === 0) {
        return (
            <BuyerLayout title="Shopping Cart">
                <Head title="Shopping Cart" />
                
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                            <ShoppingCart className="h-full w-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Start shopping to add items to your cart.</p>
                        <button
                            onClick={handleContinueShopping}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
        <BuyerLayout title="Shopping Cart">
            <Head title="Shopping Cart" />
            
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link 
                        href="/buyer/products" 
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product_id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-start space-x-4">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <Link href={`/buyer/product/${item.product_id}`}>
                                                {item.primary_image ? (
                                                    <img
                                                        src={`/storage/${item.primary_image}`}
                                                        alt={item.name}
                                                        className="h-20 w-20 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
                                                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </Link>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Link 
                                                        href={`/buyer/product/${item.product_id}`}
                                                        className="text-lg font-semibold text-gray-900 hover:text-primary line-clamp-1"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        by {item.seller.name}
                                                    </p>

                                                    <div className="mt-2">
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {formatPeso(item.price)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => {
                                                        console.log('Removing item:', item.product_id);
                                                        removeFromCart(item.product_id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>

                            {/* Quantity Controls */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => {
                                            console.log('Decreasing quantity for:', item.product_id, 'current:', item.quantity);
                                            handleQuantityChange(item.product_id, item.quantity - 1);
                                        }}
                                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => {
                                            console.log('Increasing quantity for:', item.product_id, 'current:', item.quantity, 'max:', item.stock_quantity);
                                            handleQuantityChange(item.product_id, item.quantity + 1);
                                        }}
                                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={item.quantity >= item.stock_quantity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {formatPeso(item.price * item.quantity)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatPeso(item.price)} each
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stock Warning */}
                                            {item.quantity >= item.stock_quantity && (
                                                <div className="mt-2 text-sm text-amber-600">
                                                    Maximum quantity available: {item.stock_quantity}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Clear Cart Button */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear your cart?')) {
                                        clearCart();
                                    }
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.product_id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 line-clamp-1">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            {formatPeso(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-base font-medium text-gray-900">Subtotal</span>
                                    <span className="text-base font-medium text-gray-900">
                                        {formatPeso(getCartTotal())}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm text-gray-600">Shipping</span>
                                    <span className="text-sm text-gray-600">Calculated at checkout</span>
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
                                onClick={handleCheckout}
                                className="w-full mt-6 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={handleContinueShopping}
                                className="w-full mt-3 rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm hover:shadow-md"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}