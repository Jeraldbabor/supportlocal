import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, MapPin, Star, Eye, Package, Phone, Mail, Calendar, ShoppingCart, Zap } from 'lucide-react';
import React, { useState } from 'react';
import BuyerLayout from '../../../layouts/BuyerLayout';
import { useCart } from '../../../contexts/CartContext';
import Toast from '../../../components/Toast';

interface Product {
    id: number;
    name: string;
    price: number;
    primary_image: string;
    short_description: string;
    stock_status: string;
    average_rating: number;
    view_count: number;
    quantity: number;
}

interface Seller {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
    business_name: string | null;
    business_description: string | null;
    location: string | null;
    phone: string | null;
    products_count: number;
    average_rating: number;
    total_sales: number;
    created_at: string;
    is_verified: boolean;
}

interface SellerShowProps {
    seller: Seller;
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
}

export default function Show({ seller, products, filters }: SellerShowProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart, isLoading } = useCart();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/buyer/seller/${seller.id}`, { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(`/buyer/seller/${seller.id}`, { ...filters, [key]: value }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/buyer/product/${productId}`);
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
        <BuyerLayout title={seller.business_name || seller.name}>
            <Head title={seller.business_name || seller.name} />
            
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link 
                        href="/buyer/sellers" 
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sellers
                    </Link>
                </div>

                {/* Seller Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="flex-shrink-0">
                            {seller.profile_image ? (
                                <img
                                    src={`/storage/${seller.profile_image}`}
                                    alt={seller.name}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                                    <User className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {seller.business_name || seller.name}
                                        </h1>
                                        {seller.is_verified && (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                Verified Seller
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mt-1">by {seller.name}</p>
                                    
                                    {seller.location && (
                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            {seller.location}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{seller.products_count}</div>
                                        <div className="text-sm text-gray-500">Products</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center">
                                            <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                                            <span className="text-2xl font-bold text-gray-900">
                                                {seller.average_rating ? seller.average_rating.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{seller.total_sales || 0}</div>
                                        <div className="text-sm text-gray-500">Sales</div>
                                    </div>
                                </div>
                            </div>

                            {seller.business_description && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                                    <p className="text-gray-600 leading-relaxed">{seller.business_description}</p>
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                {seller.email && (
                                    <div className="flex items-center">
                                        <Mail className="mr-1 h-4 w-4" />
                                        {seller.email}
                                    </div>
                                )}
                                {seller.phone && (
                                    <div className="flex items-center">
                                        <Phone className="mr-1 h-4 w-4" />
                                        {seller.phone}
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Member since {new Date(seller.created_at).getFullYear()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Products by {seller.business_name || seller.name}</h2>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                                onChange={(e) => handleFilter('sort', e.target.value)}
                                value={filters.sort}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    {products.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductClick(product.id)}
                                        className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                                    >
                                        <div className="relative overflow-hidden bg-gray-100 aspect-square">
                                            {product.primary_image ? (
                                                <img
                                                    src={`/storage/${product.primary_image}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            
                                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                {product.short_description}
                                            </p>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="ml-1 text-sm text-gray-600">
                                                        {product.average_rating ? product.average_rating.toFixed(1) : '0.0'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <Eye className="mr-1 h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{product.view_count}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ₱{product.price}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        product.stock_status === 'in_stock' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : product.stock_status === 'low_stock'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.stock_status === 'in_stock' ? 'In Stock' : 
                                                         product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 transform ${
                                                            product.stock_status === 'out_of_stock' || isLoading
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
                                                        className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 transform ${
                                                            product.stock_status === 'out_of_stock' || isLoading
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
                                <div className="mt-8 flex justify-center">
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
                                <Package className="h-full w-full" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600">
                                {seller.business_name || seller.name} hasn't added any products yet or no products match your search.
                            </p>
                        </div>
                    )}
                </div>
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