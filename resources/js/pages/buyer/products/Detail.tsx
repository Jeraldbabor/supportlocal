import React, { useState } from 'react';
import BuyerLayout from '../../../layouts/BuyerLayout';
import { Star, Heart, Truck, Shield, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

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
    productId?: number;
}

export default function Detail({ product, productId }: ProductDetailProps) {
    // Sample products data to match productId
    const sampleProducts = [
        {
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
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.00,
            images: [
                '/api/placeholder/500/500',
                '/api/placeholder/500/500'
            ],
            artisan: 'Mike Rodriguez',
            rating: 4.9,
            reviewCount: 18,
            category: 'Woodwork',
            description: 'Durable wooden cutting board made from sustainable bamboo with natural finish. Perfect for food preparation and serving cheese, fruits, and appetizers.',
            materials: ['Bamboo', 'Natural Oil Finish', 'Food Safe'],
            dimensions: '12" x 8" x 0.75"',
            care: 'Hand wash with mild soap. Oil periodically to maintain finish.',
            inStock: true,
            stockCount: 12
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.00,
            images: [
                '/api/placeholder/500/500',
                '/api/placeholder/500/500'
            ],
            artisan: 'Emma Thompson',
            rating: 4.7,
            reviewCount: 31,
            category: 'Textiles',
            description: 'Cozy wool scarf hand-knitted with premium merino wool in beautiful patterns. Perfect for cold weather and adds a stylish touch to any outfit.',
            materials: ['Merino Wool', 'Natural Dyes', 'Hypoallergenic'],
            dimensions: '72" x 8"',
            care: 'Hand wash in cold water. Lay flat to dry.',
            inStock: true,
            stockCount: 5
        }
    ];

    // Find product by ID or use the provided product
    const displayProduct = product || sampleProducts.find(p => p.id === Number(productId)) || sampleProducts[0];
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);

    const addToCart = () => {
        if (!displayProduct.inStock) return;
        
        // Add to cart functionality would go here
        alert(`Added ${quantity} ${displayProduct.name} to cart!`);
    };

    const addToWishlist = () => {
        setIsFavorited(!isFavorited);
        const action = isFavorited ? 'removed from' : 'added to';
        alert(`${displayProduct.name} ${action} wishlist!`);
    };

    return (
        <BuyerLayout title={displayProduct.name}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/buyer/products"
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors duration-200"
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
                                className="w-full h-full object-cover rounded-lg shadow-sm"
                            />
                        </div>
                        {displayProduct.images.length > 1 && (
                            <div className="flex space-x-2">
                                {displayProduct.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                            selectedImage === index 
                                                ? 'border-primary shadow-md' 
                                                : 'border-gray-200 hover:border-gray-300'
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

                        {/* Stock Status */}
                        <div className="mb-4">
                            {displayProduct.inStock ? (
                                <div className="flex items-center text-green-600">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium">In Stock ({displayProduct.stockCount} available)</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium">Out of Stock</span>
                                </div>
                            )}
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
                                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        disabled={quantity >= displayProduct.stockCount}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                {displayProduct.stockCount <= 5 && displayProduct.inStock && (
                                    <span className="text-sm text-amber-600 font-medium">
                                        Only {displayProduct.stockCount} left!
                                    </span>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={addToCart}
                                    disabled={!displayProduct.inStock}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {displayProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button
                                    onClick={addToWishlist}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 active:scale-95 ${
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
                                    <Truck className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">Free shipping on orders over $75</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">30-day return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}