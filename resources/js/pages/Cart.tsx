import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    quantity: number;
}

interface CartProps {
    cartItems?: CartItem[];
}

export default function Cart({ cartItems = [] }: CartProps) {
    // Sample cart items if none provided
    const defaultCartItems: CartItem[] = [
        {
            id: 1,
            name: 'Handwoven Ceramic Bowl',
            price: 45.00,
            image: '/api/placeholder/150/150',
            artisan: 'Sarah Chen',
            quantity: 1
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.00,
            image: '/api/placeholder/150/150',
            artisan: 'Mike Rodriguez',
            quantity: 2
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.00,
            image: '/api/placeholder/150/150',
            artisan: 'Emma Thompson',
            quantity: 1
        }
    ];

    const [items, setItems] = useState<CartItem[]>(cartItems.length > 0 ? cartItems : defaultCartItems);

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(items.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 75 ? 0 : 8.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    if (items.length === 0) {
        return (
            <MainLayout title="Shopping Cart">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Continue Shopping
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Shopping Cart">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.id} className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    by {item.artisan}
                                                </p>
                                                <p className="text-lg font-semibold text-primary mt-1">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 text-gray-600 hover:text-gray-800"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 text-center min-w-[60px]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 text-gray-600 hover:text-gray-800"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-red-600 hover:text-red-800"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-sm text-gray-600">
                                                ${item.price.toFixed(2)} each
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold">Total</span>
                                        <span className="text-lg font-semibold text-primary">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {shipping > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        Add ${(75 - subtotal).toFixed(2)} more to get free shipping!
                                    </p>
                                </div>
                            )}

                            <button className="w-full mt-6 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200">
                                Proceed to Checkout
                            </button>

                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Secure checkout with SSL encryption
                                </p>
                            </div>

                            {/* Payment Methods */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    We accept
                                </h4>
                                <div className="flex space-x-2">
                                    <div className="bg-gray-100 rounded p-2 text-xs font-medium text-gray-600">
                                        VISA
                                    </div>
                                    <div className="bg-gray-100 rounded p-2 text-xs font-medium text-gray-600">
                                        MC
                                    </div>
                                    <div className="bg-gray-100 rounded p-2 text-xs font-medium text-gray-600">
                                        AMEX
                                    </div>
                                    <div className="bg-gray-100 rounded p-2 text-xs font-medium text-gray-600">
                                        PayPal
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}