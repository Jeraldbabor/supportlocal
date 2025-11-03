import { Product as GlobalProduct } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Filter, Grid, Info, List, Package, Search, ShoppingCart, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import AddToCartModal from '../components/AddToCartModal';
import AuthRequiredModal from '../components/AuthRequiredModal';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import MainLayout from '../layouts/MainLayout';

interface Product {
    id: number;
    name: string;
    price: number;
    primary_image?: string;
    image?: string;
    seller?: {
        id: number;
        name: string;
    };
    artisan?: string;
    artisan_image?: string;
    category?: {
        id: number;
        name: string;
    };
    average_rating?: number;
    rating?: number;
    short_description?: string;
    description?: string;
    stock_status?: string;
    stock_quantity?: number;
    view_count?: number;
    quantity?: number;
}

interface Category {
    id: number;
    name: string;
    products_count?: number;
}

interface ProductsProps {
    products?: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
        meta?: Record<string, unknown>;
    };
    categories?: Category[];
    filters?: {
        category?: string;
        search?: string;
        min_price?: number;
        max_price?: number;
        sort?: string;
        direction?: string;
    };
}

export default function Products({ products, categories = [], filters = {} }: ProductsProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { addToCart, isLoading } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalAction, setAuthModalAction] = useState<'cart' | 'buy'>('cart');
    const [authModalProduct, setAuthModalProduct] = useState<string>('');
    const { props } = usePage<{ auth?: { user?: unknown } }>();
    const isAuthenticated = !!props?.auth?.user;

    const productList = products?.data || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/products', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/products', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/product/${productId}`);
    };

    const handleSellerClick = (sellerId: number) => {
        router.visit(`/seller/${sellerId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        // Redirect authenticated users to buyer products page
        if (isAuthenticated) {
            setToastMessage('⚠️ Please use the buyer cart from your dashboard.');
            setShowToast(true);
            setTimeout(() => {
                router.visit('/buyer/products');
            }, 1500);
            return;
        }

        // Open modal for quantity selection for guests
        setModalProduct(product);
        setModalMode('cart');
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        // Show auth modal for guests
        if (!isAuthenticated) {
            setAuthModalAction('buy');
            setAuthModalProduct(product.name);
            setShowAuthModal(true);
            return;
        }

        // Redirect authenticated users to buyer products page
        setToastMessage('⚠️ Please use the buyer cart from your dashboard.');
        setShowToast(true);
        setTimeout(() => {
            router.visit('/buyer/products');
        }, 1500);
    };

    const handleModalAddToCart = (quantity: number) => {
        if (!modalProduct) return;

        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity || modalProduct.stock_quantity || 0,
            primary_image: modalProduct.primary_image || modalProduct.image || '',
            seller: modalProduct.seller || {
                id: 0,
                name: modalProduct.artisan || 'Unknown Seller',
            },
        };

        try {
            addToCart(cartProduct, quantity);
            // Close modal first
            setIsModalOpen(false);
            // Then show success message
            setTimeout(() => {
                setToastMessage(`✅ ${quantity} × ${modalProduct.name} added to cart successfully!`);
                setShowToast(true);
            }, 100);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToastMessage('❌ Failed to add item to cart. Please try again.');
            setShowToast(true);
        }
    };

    const handleModalBuyNow = (quantity: number) => {
        if (!modalProduct) return;

        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity || modalProduct.stock_quantity || 0,
            primary_image: modalProduct.primary_image || modalProduct.image || '',
            seller: modalProduct.seller || {
                id: 0,
                name: modalProduct.artisan || 'Unknown Seller',
            },
        };

        try {
            addToCart(cartProduct, quantity);
            // Small delay before redirect to ensure cart is updated
            setTimeout(() => {
                router.visit('/cart');
            }, 200);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToastMessage('❌ Failed to add item to cart. Please try again.');
            setShowToast(true);
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.stock_status) {
            return product.stock_status;
        }
        if (product.stock_quantity === 0) {
            return 'out_of_stock';
        }
        if (product.stock_quantity && product.stock_quantity < 10) {
            return 'low_stock';
        }
        return 'in_stock';
    };

    const isOutOfStock = (product: Product) => {
        return getStockStatus(product) === 'out_of_stock' || product.stock_quantity === 0;
    };

    return (
        <MainLayout title="Browse Products">
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
                                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-primary focus:ring-primary"
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
                                className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {productList.length > 0 ? (
                    <>
                        <div
                            className={`mb-8 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}`}
                        >
                            {productList.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-xl"
                                >
                                    {/* Product Image with Wishlist Button */}
                                    <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                                        {product.primary_image || product.image ? (
                                            <img
                                                src={product.primary_image ? `/storage/${product.primary_image}` : product.image}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onClick={() => handleProductClick(product.id)}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer">
                                                                <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"/>
                                                                </svg>
                                                            </div>
                                                        `;
                                                        parent.addEventListener('click', () => handleProductClick(product.id));
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="flex h-full w-full cursor-pointer items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                                                onClick={() => handleProductClick(product.id)}
                                            >
                                                <Package className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Stock Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
                                                    getStockStatus(product) === 'in_stock'
                                                        ? 'bg-green-500/90 text-white'
                                                        : getStockStatus(product) === 'low_stock'
                                                          ? 'bg-yellow-500/90 text-white'
                                                          : 'bg-red-500/90 text-white'
                                                }`}
                                            >
                                                {getStockStatus(product) === 'in_stock'
                                                    ? 'Available'
                                                    : getStockStatus(product) === 'low_stock'
                                                      ? 'Low Stock'
                                                      : 'Out of Stock'}
                                            </span>
                                        </div>

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100" />
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-3 p-4">
                                        {/* Product Name */}
                                        <div onClick={() => handleProductClick(product.id)}>
                                            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary">
                                                {product.name}
                                            </h3>
                                        </div>

                                        {/* Description */}
                                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                                            {product.short_description || product.description}
                                        </p>

                                        {/* Seller and Views */}
                                        <div className="flex items-center justify-between text-sm">
                                            {product.seller ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSellerClick(product.seller!.id);
                                                    }}
                                                    className="hover:text-primary-dark flex items-center font-medium text-primary transition-colors"
                                                >
                                                    <User className="mr-1.5 h-3.5 w-3.5" />
                                                    {product.seller.name}
                                                </button>
                                            ) : (
                                                <div className="flex items-center text-gray-600">
                                                    {product.artisan_image && (
                                                        <img
                                                            src={product.artisan_image}
                                                            alt={product.artisan}
                                                            className="mr-1.5 h-5 w-5 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <User className="mr-1.5 h-3.5 w-3.5" />
                                                    {product.artisan}
                                                </div>
                                            )}

                                            {product.view_count && (
                                                <div className="flex items-center text-gray-500">
                                                    <Eye className="mr-1 h-3.5 w-3.5" />
                                                    <span className="text-xs">{product.view_count}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category */}
                                        {(product.category || typeof product.category === 'string') && (
                                            <div className="flex items-center">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                    {typeof product.category === 'string' ? product.category : product.category.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Rating */}
                                        {(product.average_rating || product.rating) && (product.average_rating || product.rating)! > 0 && (
                                            <div className="flex items-center space-x-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3.5 w-3.5 ${
                                                                i < Math.floor(product.average_rating || product.rating || 0)
                                                                    ? 'fill-current text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="ml-1 text-xs text-gray-600">
                                                    ({(product.average_rating || product.rating || 0).toFixed(1)})
                                                </span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="pt-2">
                                            <span className="text-2xl font-bold text-gray-900">₱{Number(product.price).toLocaleString()}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2 pt-3">
                                            {/* View Details Button */}
                                            <Link
                                                href={`/product/${product.id}`}
                                                className="flex w-full transform items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md"
                                            >
                                                <Info className="h-4 w-4" />
                                                View Details
                                            </Link>

                                            {/* Cart and Buy Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    disabled={isOutOfStock(product) || isLoading}
                                                    className={`flex flex-1 transform items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                        isOutOfStock(product) || isLoading
                                                            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                            : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg focus:ring-2 focus:ring-amber-200 active:transform-none'
                                                    }`}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    {isOutOfStock(product) ? 'Out of Stock' : 'Add to Cart'}
                                                </button>

                                                <button
                                                    onClick={(e) => handleBuyNow(e, product)}
                                                    disabled={isOutOfStock(product) || isLoading}
                                                    className={`flex transform items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                        isOutOfStock(product) || isLoading
                                                            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                            : 'border-2 border-amber-300 bg-white text-amber-700 shadow-sm hover:-translate-y-0.5 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-md focus:ring-2 focus:ring-amber-200 active:transform-none'
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
                        {products && products.last_page > 1 && (
                            <div className="flex justify-center">
                                <div className="flex space-x-2">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded-md px-3 py-2 text-sm ${
                                                link.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                            <Filter className="h-full w-full" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}

            {/* Add to Cart Modal */}
            <AddToCartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={modalProduct}
                onAddToCart={handleModalAddToCart}
                onBuyNow={modalMode === 'buy' ? handleModalBuyNow : undefined}
            />

            {/* Auth Required Modal */}
            <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                action={authModalAction}
                productName={authModalProduct}
            />
        </MainLayout>
    );
}
