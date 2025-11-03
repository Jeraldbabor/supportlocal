import { CheckCircle, Heart, Minus, Package, Plus, Shield, ShoppingCart, Star, Truck, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    primary_image?: string;
    image?: string;
    stock_quantity?: number;
    seller?: {
        id: number;
        name: string;
    };
    artisan?: string;
    description?: string;
    short_description?: string;
    average_rating?: number;
    rating?: number;
    category?: string | { id: number; name: string };
    sku?: string;
}

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAddToCart: (quantity: number) => void;
    onBuyNow?: (quantity: number) => void;
}

export default function AddToCartModal({ isOpen, onClose, product, onAddToCart, onBuyNow }: AddToCartModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const maxQuantity = product.stock_quantity || 999;
    const totalPrice = product.price * quantity;
    const rating = product.average_rating || product.rating || 0;
    const categoryName = typeof product.category === 'string' ? product.category : product.category?.name;

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            onAddToCart(quantity);
            setTimeout(() => {
                setIsLoading(false);
                onClose();
            }, 300); // Reduced delay, let parent handle the toast
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!onBuyNow) return;
        setIsLoading(true);
        try {
            onBuyNow(quantity);
            setTimeout(() => {
                setIsLoading(false);
                // Don't close modal here, let the redirect handle it
            }, 300);
        } catch (error) {
            console.error('Error buying now:', error);
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
            <div className="relative max-h-[90vh] w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 rounded-full bg-white p-2 text-gray-500 shadow-lg transition-all hover:bg-gray-100 hover:text-gray-700 hover:shadow-xl"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Scrollable Content */}
                <div className="max-h-[90vh] overflow-y-auto">
                    <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                        {/* Left Column - Product Image */}
                        <div className="space-y-4">
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                                {product.primary_image || product.image ? (
                                    <img
                                        src={product.primary_image ? `/storage/${product.primary_image}` : product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div class="flex h-full w-full items-center justify-center">
                                                        <svg class="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"/>
                                                        </svg>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-24 w-24 text-gray-300" />
                                    </div>
                                )}

                                {/* Stock Badge */}
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-sm ${
                                            maxQuantity < 999 && maxQuantity <= 10 ? 'bg-yellow-500/90 text-white' : 'bg-green-500/90 text-white'
                                        }`}
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        {maxQuantity < 999 ? `Only ${maxQuantity} left` : 'In Stock'}
                                    </span>
                                </div>

                                {/* Wishlist Button */}
                                <button
                                    onClick={() => setIsAddedToWishlist(!isAddedToWishlist)}
                                    className="absolute top-4 right-4 rounded-full bg-white p-2.5 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                                    aria-label="Add to wishlist"
                                >
                                    <Heart className={`h-5 w-5 ${isAddedToWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
                                    <Truck className="mb-1 h-5 w-5 text-amber-600" />
                                    <p className="text-xs font-medium text-amber-900">Free Shipping</p>
                                    <p className="text-xs text-amber-700">Orders over ₱75</p>
                                </div>
                                <div className="flex flex-col items-center rounded-lg border border-green-100 bg-green-50 p-3 text-center">
                                    <Shield className="mb-1 h-5 w-5 text-green-600" />
                                    <p className="text-xs font-medium text-green-900">Secure Payment</p>
                                    <p className="text-xs text-green-700">100% Protected</p>
                                </div>
                                <div className="flex flex-col items-center rounded-lg border border-orange-100 bg-orange-50 p-3 text-center">
                                    <CheckCircle className="mb-1 h-5 w-5 text-orange-600" />
                                    <p className="text-xs font-medium text-orange-900">Quality</p>
                                    <p className="text-xs text-orange-700">Handcrafted</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="flex flex-col">
                            {/* Category Badge */}
                            {categoryName && (
                                <div className="mb-3">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        {categoryName}
                                    </span>
                                </div>
                            )}

                            {/* Product Name */}
                            <h2 className="mb-2 text-2xl leading-tight font-bold text-gray-900">{product.name}</h2>

                            {/* Seller Info */}
                            <div className="mb-3 flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">by</span>
                                <span className="font-semibold text-primary">{product.seller?.name || product.artisan || 'Local Artisan'}</span>
                            </div>

                            {/* Rating */}
                            {rating > 0 && (
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)} / 5.0</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-4 border-y border-gray-200 py-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-sm text-gray-500">per item</span>
                                </div>
                            </div>

                            {/* Description */}
                            {(product.short_description || product.description) && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Description</h3>
                                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                        {product.short_description || product.description}
                                    </p>
                                </div>
                            )}

                            {/* SKU */}
                            {product.sku && (
                                <div className="mb-4 text-xs text-gray-500">
                                    SKU: <span className="font-mono">{product.sku}</span>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="mb-3 block text-sm font-semibold text-gray-900">Select Quantity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center rounded-xl border-2 border-gray-300 bg-white shadow-sm">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className="rounded-l-xl p-3 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                            min="1"
                                            max={maxQuantity}
                                            className="w-20 border-x-2 border-gray-300 py-3 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={quantity >= maxQuantity}
                                            className="rounded-r-xl p-3 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-1 text-xs text-gray-500">Total Price</p>
                                        <p className="text-2xl font-bold text-primary">
                                            ₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                                {maxQuantity < 999 && quantity >= maxQuantity && (
                                    <p className="mt-2 text-xs font-medium text-yellow-600">Maximum available quantity reached</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
                                </button>

                                {onBuyNow && (
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={isLoading}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-amber-300 bg-white px-6 py-4 text-base font-semibold text-amber-700 shadow-md transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-lg active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                                    >
                                        {isLoading ? 'Processing...' : 'Buy Now'}
                                    </button>
                                )}
                            </div>

                            {/* Additional Info */}
                            <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4">
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                    <span className="text-gray-700">Authentic handcrafted product from local artisans</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                                    <span className="text-gray-700">Free shipping on orders over ₱75</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                                    <span className="text-gray-700">Secure payment with buyer protection</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
