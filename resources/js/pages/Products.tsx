import { Filter, Grid, List, Star } from 'lucide-react';
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

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
            price: 45.0,
            image: '/api/placeholder/300/300',
            artisan: 'Sarah Chen',
            rating: 4.8,
            category: 'Pottery',
            description: 'Beautiful handwoven ceramic bowl perfect for serving salads or decorative purposes.',
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.0,
            image: '/api/placeholder/300/300',
            artisan: 'Mike Rodriguez',
            rating: 4.9,
            category: 'Woodwork',
            description: 'Durable wooden cutting board made from sustainable bamboo with natural finish.',
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.0,
            image: '/api/placeholder/300/300',
            artisan: 'Emma Thompson',
            rating: 4.7,
            category: 'Textiles',
            description: 'Cozy wool scarf hand-knitted with premium merino wool in beautiful patterns.',
        },
        {
            id: 4,
            name: 'Leather Journal',
            price: 55.0,
            image: '/api/placeholder/300/300',
            artisan: 'David Kim',
            rating: 4.9,
            category: 'Leather',
            description: 'Premium leather journal with hand-stitched binding and acid-free paper.',
        },
        {
            id: 5,
            name: 'Glass Pendant Necklace',
            price: 28.0,
            image: '/api/placeholder/300/300',
            artisan: 'Lisa Park',
            rating: 4.6,
            category: 'Jewelry',
            description: 'Elegant glass pendant with unique swirl patterns, perfect for any occasion.',
        },
        {
            id: 6,
            name: 'Woven Basket',
            price: 42.0,
            image: '/api/placeholder/300/300',
            artisan: 'James Wilson',
            rating: 4.8,
            category: 'Basketry',
            description: 'Traditional woven basket made from natural reed, great for storage or decoration.',
        },
    ];

    const allProducts = products.length > 0 ? products : defaultProducts;
    const displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts;

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category)))];

    // Filter and sort logic
    React.useEffect(() => {
        let filtered = allProducts;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter((product) => product.category === selectedCategory);
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
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters and Controls */}
                <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
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
                                className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
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
                            className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                        <span className="ml-4 text-gray-600">{displayProducts.length} products</span>
                    </div>
                </div>

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayProducts.map((product) => (
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                                <div className="p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{product.category}</span>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                                            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{product.name}</h3>
                                    <p className="mb-2 text-sm text-gray-600">by {product.artisan}</p>
                                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                                        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90">
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
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <div className="flex flex-col md:flex-row">
                                    <img src={product.image} alt={product.name} className="h-48 w-full object-cover md:w-48" />
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-4">
                                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                        {product.category}
                                                    </span>
                                                    <div className="flex items-center">
                                                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                                                        <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                                                    </div>
                                                </div>
                                                <h3 className="mb-2 text-xl font-semibold text-gray-900">{product.name}</h3>
                                                <p className="mb-2 text-gray-600">by {product.artisan}</p>
                                                <p className="mb-4 text-gray-600">{product.description}</p>
                                            </div>
                                            <div className="ml-6 flex flex-col items-end gap-4">
                                                <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                                                <button className="rounded-md bg-primary px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-primary/90">
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
                    <div className="py-12 text-center">
                        <p className="text-lg text-gray-500">No products found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('All');
                                setSortBy('name');
                            }}
                            className="mt-4 font-medium text-primary hover:text-primary/80"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
