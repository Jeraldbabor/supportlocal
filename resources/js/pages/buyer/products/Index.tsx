import { Head, Link, router } from '@inertiajs/react';
import { Search, ShoppingCart, Star, User, Eye, Grid, List, Filter, Zap, Package, Info } from 'lucide-react';
import React, { useState } from 'react';
import BuyerLayout from '../../../layouts/BuyerLayout';
import { useCart } from '../../../contexts/CartContext';
import Toast from '../../../components/Toast';

interface Product {
    id: number;
    name: string;
    price: number;
    primary_image: string;
    seller: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
    average_rating: number;
    short_description: string;
    stock_status: string;
    view_count: number;
    quantity: number;
}

interface Category {
    id: number;
    name: string;
}

interface Seller {
    id: number;
    name: string;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: Category[];
    sellers: Seller[];
    filters: {
        search: string | null;
        category: string | null;
        seller: string | null;
        sort: string;
        direction: string;
        min_price: string | null;
        max_price: string | null;
    };
}

export default function Index({ products, categories, sellers, filters }: ProductsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { addToCart, isLoading } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/buyer/products', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/buyer/products', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/buyer/product/${productId}`);
    };

    const handleSellerClick = (sellerId: number) => {
        router.visit(`/buyer/seller/${sellerId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock') return;
        addToCart(product, 1);
        setToastMessage(`${product.name} added to cart!`);
        setShowToast(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock') return;
        addToCart(product, 1);
        router.visit('/buyer/checkout');
    };

    return (
        <BuyerLayout title="Browse Products">
            <Head title="Browse Products" />
            
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Browse Products</h1>
                    <p className="text-gray-600">Discover unique handmade products from local artisans</p>
                </div>

                <div className="mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <form onSubmit={handleSearch} className="col-span-1 md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </form>

                        <select
                            onChange={(e) => handleFilter('category', e.target.value)}
                            value={filters.category || ''}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {products.data.length > 0 ? (
                    <>
                        <div className={`mb-8 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}`}>
                            {products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
                                >
                                    {/* Product Image with Wishlist Button */}
                                    <div className="relative overflow-hidden bg-gray-100 aspect-square rounded-t-xl">
                                        {product.primary_image ? (
                                            <img
                                                src={`/storage/${product.primary_image}`}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onClick={() => handleProductClick(product.id)}
                                            />
                                        ) : (
                                            <div 
                                                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                                                onClick={() => handleProductClick(product.id)}
                                            >
                                                <Package className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                        
                                        {/* Stock Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                                                product.stock_status === 'in_stock' 
                                                    ? 'bg-green-500/90 text-white' 
                                                    : product.stock_status === 'low_stock'
                                                    ? 'bg-yellow-500/90 text-white'
                                                    : 'bg-red-500/90 text-white'
                                            }`}>
                                                {product.stock_status === 'in_stock' ? 'Available' : 
                                                 product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                            </span>
                                        </div>

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4 space-y-3">
                                        {/* Product Name */}
                                        <div onClick={() => handleProductClick(product.id)}>
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>
                                        
                                        {/* Description */}
                                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                            {product.short_description}
                                        </p>

                                        {/* Seller and Views */}
                                        <div className="flex items-center justify-between text-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSellerClick(product.seller.id);
                                                }}
                                                className="flex items-center text-primary hover:text-primary-dark font-medium transition-colors"
                                            >
                                                <User className="mr-1.5 h-3.5 w-3.5" />
                                                {product.seller.name}
                                            </button>
                                            
                                            <div className="flex items-center text-gray-500">
                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                <span className="text-xs">{product.view_count}</span>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        {product.average_rating > 0 && (
                                            <div className="flex items-center space-x-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3.5 w-3.5 ${
                                                                i < Math.floor(product.average_rating)
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-600 ml-1">
                                                    ({product.average_rating.toFixed(1)})
                                                </span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="pt-2">
                                            <span className="text-2xl font-bold text-gray-900">
                                                ₱{Number(product.price).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="space-y-2 pt-3">
                                            {/* View Details Button */}
                                            <Link
                                                href={`/buyer/product/${product.id}`}
                                                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                                            >
                                                <Info className="h-4 w-4" />
                                                View Details
                                            </Link>
                                            
                                            {/* Cart and Buy Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 transform ${product.stock_status === 'out_of_stock' || isLoading
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:transform-none focus:ring-2 focus:ring-blue-200'
                                                    }`}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                                
                                                <button
                                                    onClick={(e) => handleBuyNow(e, product)}
                                                    disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                    className={`flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 transform ${product.stock_status === 'out_of_stock' || isLoading
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:transform-none focus:ring-2 focus:ring-green-200'
                                                    }`}
                                                    title="Buy Now"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center">
                                <div className="flex space-x-2">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <Filter className="h-full w-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
            
            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}
            
        </BuyerLayout>
    );
}


