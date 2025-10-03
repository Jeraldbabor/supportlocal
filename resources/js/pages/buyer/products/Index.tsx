import React, { useState } from 'react';
import BuyerLayout from '../../../layouts/BuyerLayout';
import { Star, Filter, Grid, List, ShoppingCart } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    rating: number;
    category: string;
    description: string;
    inStock?: boolean;
    stockCount?: number;
}

interface ProductsIndexProps {
    products?: Product[];
}

export default function Index({ products = [] }: ProductsIndexProps) {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Sample products if none provided
    const defaultProducts: Product[] = [
        {
            id: 1,
            name: 'Handwoven Ceramic Bowl',
            price: 45.00,
            image: '/api/placeholder/300/300',
            artisan: 'Sarah Chen',
            rating: 4.8,
            category: 'Pottery',
            description: 'Beautiful handwoven ceramic bowl perfect for serving salads or decorative purposes.',
            inStock: true,
            stockCount: 8
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.00,
            image: '/api/placeholder/300/300',
            artisan: 'Mike Rodriguez',
            rating: 4.9,
            category: 'Woodwork',
            description: 'Durable wooden cutting board made from sustainable bamboo with natural finish.',
            inStock: true,
            stockCount: 12
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.00,
            image: '/api/placeholder/300/300',
            artisan: 'Emma Thompson',
            rating: 4.7,
            category: 'Textiles',
            description: 'Cozy wool scarf hand-knitted with premium merino wool in beautiful patterns.',
            inStock: true,
            stockCount: 5
        },
        {
            id: 4,
            name: 'Leather Journal',
            price: 55.00,
            image: '/api/placeholder/300/300',
            artisan: 'David Kim',
            rating: 4.9,
            category: 'Leather',
            description: 'Premium leather journal with hand-stitched binding and acid-free paper.',
            inStock: true,
            stockCount: 15
        },
        {
            id: 5,
            name: 'Glass Pendant Necklace',
            price: 28.00,
            image: '/api/placeholder/300/300',
            artisan: 'Lisa Park',
            rating: 4.6,
            category: 'Jewelry',
            description: 'Elegant glass pendant with unique swirl patterns, perfect for any occasion.',
            inStock: false,
            stockCount: 0
        },
        {
            id: 6,
            name: 'Woven Basket',
            price: 42.00,
            image: '/api/placeholder/300/300',
            artisan: 'James Wilson',
            rating: 4.8,
            category: 'Basketry',
            description: 'Traditional woven basket made from natural reed, great for storage or decoration.',
            inStock: true,
            stockCount: 7
        },
        {
            id: 7,
            name: 'Hand-painted Ceramic Mug',
            price: 22.00,
            image: '/api/placeholder/300/300',
            artisan: 'Maria Santos',
            rating: 4.5,
            category: 'Pottery',
            description: 'Beautiful hand-painted ceramic mug with unique floral designs.',
            inStock: true,
            stockCount: 20
        },
        {
            id: 8,
            name: 'Macrame Wall Hanging',
            price: 38.00,
            image: '/api/placeholder/300/300',
            artisan: 'Jessica Brown',
            rating: 4.7,
            category: 'Textiles',
            description: 'Elegant macrame wall hanging to add boho charm to your home.',
            inStock: true,
            stockCount: 6
        }
    ];

    const allProducts = products.length > 0 ? products : defaultProducts;
    const displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts;

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(allProducts.map(p => p.category)))];

    // Filter and sort logic
    React.useEffect(() => {
        let filtered = allProducts;
        
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredProducts(filtered);
    }, [selectedCategory, sortBy, allProducts]);

    const handleProductClick = (productId: number) => {
        router.visit(`/buyer/product/${productId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation(); // Prevent navigation to product detail
        if (!product.inStock) return;
        
        // Add to cart functionality would go here
        alert(`Added ${product.name} to cart!`);
    };

    return (
        <BuyerLayout title="Browse Products">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
                    <p className="text-gray-600">Discover unique handmade products from local artisans</p>
                </div>

                {/* Filters and Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors duration-200 ${
                                viewMode === 'grid' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors duration-200 ${
                                viewMode === 'list' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                        <span className="text-gray-600 ml-4">
                            {displayProducts.length} products
                        </span>
                    </div>
                </div>

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayProducts.map((product) => (
                            <div 
                                key={product.id} 
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                                onClick={() => handleProductClick(product.id)}
                            >
                                <div className="relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                                            <span className="text-white font-medium">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                            {product.category}
                                        </span>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600 ml-1">
                                                {product.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        by {product.artisan}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-primary">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={!product.inStock}
                                            className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            Add to Cart
                                        </button>
                                    </div>
                                    {product.stockCount && product.stockCount <= 5 && product.inStock && (
                                        <p className="text-xs text-amber-600 mt-2">
                                            Only {product.stockCount} left in stock
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayProducts.map((product) => (
                            <div 
                                key={product.id} 
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                                onClick={() => handleProductClick(product.id)}
                            >
                                <div className="flex flex-col md:flex-row">
                                    <div className="relative md:w-48">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-medium">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                        {product.category}
                                                    </span>
                                                    <div className="flex items-center">
                                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                        <span className="text-sm text-gray-600 ml-1">
                                                            {product.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-gray-600 mb-2">
                                                    by {product.artisan}
                                                </p>
                                                <p className="text-gray-600 mb-4">
                                                    {product.description}
                                                </p>
                                                {product.stockCount && product.stockCount <= 5 && product.inStock && (
                                                    <p className="text-sm text-amber-600 mb-2">
                                                        Only {product.stockCount} left in stock
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-4 ml-6">
                                                <span className="text-2xl font-bold text-primary">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <button 
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    disabled={!product.inStock}
                                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {displayProducts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Filter className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg mb-2">No products found</p>
                            <p className="text-gray-400 mb-4">Try adjusting your filters to see more products.</p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSortBy('name');
                                }}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}