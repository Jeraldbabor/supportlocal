import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Star, Filter, Grid, List } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    rating: number;
    category: string;
    description: string;
}

interface ProductsProps {
    products: Product[];
}

export default function Products({ products = [] }: ProductsProps) {
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
            description: 'Beautiful handwoven ceramic bowl perfect for serving salads or decorative purposes.'
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.00,
            image: '/api/placeholder/300/300',
            artisan: 'Mike Rodriguez',
            rating: 4.9,
            category: 'Woodwork',
            description: 'Durable wooden cutting board made from sustainable bamboo with natural finish.'
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.00,
            image: '/api/placeholder/300/300',
            artisan: 'Emma Thompson',
            rating: 4.7,
            category: 'Textiles',
            description: 'Cozy wool scarf hand-knitted with premium merino wool in beautiful patterns.'
        },
        {
            id: 4,
            name: 'Leather Journal',
            price: 55.00,
            image: '/api/placeholder/300/300',
            artisan: 'David Kim',
            rating: 4.9,
            category: 'Leather',
            description: 'Premium leather journal with hand-stitched binding and acid-free paper.'
        },
        {
            id: 5,
            name: 'Glass Pendant Necklace',
            price: 28.00,
            image: '/api/placeholder/300/300',
            artisan: 'Lisa Park',
            rating: 4.6,
            category: 'Jewelry',
            description: 'Elegant glass pendant with unique swirl patterns, perfect for any occasion.'
        },
        {
            id: 6,
            name: 'Woven Basket',
            price: 42.00,
            image: '/api/placeholder/300/300',
            artisan: 'James Wilson',
            rating: 4.8,
            category: 'Basketry',
            description: 'Traditional woven basket made from natural reed, great for storage or decoration.'
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

    return (
        <MainLayout title="Products">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
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
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
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
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
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
                                        <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full md:w-48 h-48 object-cover"
                                    />
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
                                            </div>
                                            <div className="flex flex-col items-end gap-4 ml-6">
                                                <span className="text-2xl font-bold text-primary">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <button className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors duration-200">
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
                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('All');
                                setSortBy('name');
                            }}
                            className="mt-4 text-primary hover:text-primary/80 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}