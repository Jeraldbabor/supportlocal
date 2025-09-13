import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Star, Heart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface ProductDetailProps {
    product?: {
        id: number;
        name: string;
        price: number;
        images: string[];
        artisan: string;
        rating: number;
        reviewCount: number;
        category: string;
        description: string;
        materials: string[];
        dimensions: string;
        care: string;
        inStock: boolean;
        stockCount: number;
    };
}

export default function ProductDetail({ product }: ProductDetailProps) {
    // Sample product if none provided
    const defaultProduct = {
        id: 1,
        name: 'Handwoven Ceramic Bowl',
        price: 45.00,
        images: [
            '/api/placeholder/500/500',
            '/api/placeholder/500/500',
            '/api/placeholder/500/500'
        ],
        artisan: 'Sarah Chen',
        rating: 4.8,
        reviewCount: 24,
        category: 'Pottery',
        description: 'This beautiful handwoven ceramic bowl is perfect for serving salads, fruits, or as a decorative piece. Each bowl is unique, handcrafted with care using traditional pottery techniques passed down through generations. The beautiful glaze finish gives it a distinctive look that complements any table setting.',
        materials: ['Ceramic', 'Natural Glaze', 'Eco-friendly'],
        dimensions: '10" diameter x 4" height',
        care: 'Hand wash recommended. Microwave and dishwasher safe.',
        inStock: true,
        stockCount: 8
    };

    const displayProduct = product || defaultProduct;
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);

    const addToCart = () => {
        // Add to cart functionality would go here
        alert(`Added ${quantity} ${displayProduct.name} to cart!`);
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-square mb-4">
                            <img
                                src={displayProduct.images[selectedImage]}
                                alt={displayProduct.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                        {displayProduct.images.length > 1 && (
                            <div className="flex space-x-2">
                                {displayProduct.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                                            selectedImage === index ? 'border-primary' : 'border-gray-200'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${displayProduct.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {displayProduct.category}
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {displayProduct.name}
                        </h1>

                        <p className="text-gray-600 mb-4">
                            by <span className="font-medium">{displayProduct.artisan}</span>
                        </p>

                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < Math.floor(displayProduct.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                                {displayProduct.rating} ({displayProduct.reviewCount} reviews)
                            </span>
                        </div>

                        <div className="text-3xl font-bold text-primary mb-6">
                            ${displayProduct.price.toFixed(2)}
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">
                                {displayProduct.description}
                            </p>
                        </div>

                        {/* Quantity and Add to Cart */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 min-w-[60px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        disabled={quantity >= displayProduct.stockCount}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {displayProduct.stockCount} available
                                </span>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={addToCart}
                                    disabled={!displayProduct.inStock}
                                    className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {displayProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button
                                    onClick={() => setIsFavorited(!isFavorited)}
                                    className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                                        isFavorited
                                            ? 'border-red-500 text-red-500 bg-red-50'
                                            : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                                    }`}
                                >
                                    <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Materials</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayProduct.materials.map((material, index) => (
                                        <span
                                            key={index}
                                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Dimensions</h3>
                                <p className="text-gray-600">{displayProduct.dimensions}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Care Instructions</h3>
                                <p className="text-gray-600">{displayProduct.care}</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Truck className="h-5 w-5 text-primary mr-3" />
                                    <span className="text-sm text-gray-600">Free shipping on orders over $75</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-primary mr-3" />
                                    <span className="text-sm text-gray-600">30-day return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}