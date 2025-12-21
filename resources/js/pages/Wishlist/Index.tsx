import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart, ShoppingCart, X, Package, Star, User, Info } from 'lucide-react';
import BuyerLayout from '../../layouts/BuyerLayout';
import MainLayout from '../../layouts/MainLayout';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import Toast from '../../components/Toast';
import AddToCartModal from '../../components/AddToCartModal';
import AuthRequiredModal from '../../components/AuthRequiredModal';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    description: string;
    short_description?: string;
    image: string | null;
    primary_image?: string;
    stock_status: string;
    stock_quantity: number;
    average_rating?: number | null;
    review_count?: number;
    category: {
        id: number;
        name: string;
    } | null;
    seller: {
        id: number;
        name: string;
        avatar?: string | null;
    };
}

interface WishlistItem {
    id: number;
    product: Product;
    added_at: string;
}

interface Props {
    wishlistItems: WishlistItem[];
    totalItems: number;
}

export default function WishlistIndex({ wishlistItems, totalItems }: Props) {
    const { props } = usePage<{ auth?: { user?: unknown } }>();
    const { addToCart } = useCart();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Use appropriate layout based on authentication status
    const Layout = props.auth?.user ? BuyerLayout : MainLayout;

    const handleRemove = (productId: number) => {
        router.delete('/wishlist/remove', {
            data: { product_id: productId },
            preserveScroll: true,
        });
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear your wishlist?')) {
            router.delete('/wishlist/clear', {
                preserveScroll: true,
            });
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        
        if (!props.auth?.user) {
            setShowAuthModal(true);
            return;
        }

        setSelectedProduct(product);
        setShowCartModal(true);
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/product/${productId}`);
    };

    const getStockStatus = (product: Product) => {
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) {
            return 'out_of_stock';
        } else if (product.stock_quantity < 10) {
            return 'low_stock';
        }
        return 'in_stock';
    };

    const isOutOfStock = (product: Product) => {
        return product.stock_status === 'out_of_stock' || product.stock_quantity === 0;
    };

    if (wishlistItems.length === 0) {
        return (
            <Layout>
                <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <Heart className="mx-auto mb-6 h-24 w-24 text-gray-300" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
                    <p className="mb-8 text-gray-600">
                        Start adding products you love to keep track of them!
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Browse Products
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="mt-2 text-gray-600">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                    {totalItems > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-red-600 hover:text-red-700 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Wishlist Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistItems.map((item) => {
                        const product = item.product;

                        return (
                            <div
                                key={item.id}
                                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-xl"
                            >
                                {/* Product Image with Remove Button */}
                                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                                    {product.primary_image || product.image ? (
                                        <img
                                            src={product.primary_image ? `/storage/${product.primary_image}` : (product.image || '')}
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

                                    {/* Remove Button */}
                                    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleRemove(product.id)}
                                            className="rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-red-50 hover:text-red-600 backdrop-blur-sm"
                                            aria-label="Remove from wishlist"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
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

                                    {/* Seller */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            {product.seller.avatar ? (
                                                <img
                                                    src={product.seller.avatar}
                                                    alt={product.seller.name}
                                                    className="mr-1.5 h-5 w-5 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {product.seller.name}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    {product.category && (
                                        <div className="flex items-center">
                                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                {product.category.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Rating */}
                                    <div className="flex items-center space-x-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${
                                                        i < Math.floor(Number(product.average_rating) || 0)
                                                            ? 'fill-current text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        {product.average_rating && Number(product.average_rating) > 0 ? (
                                            <span className="ml-1 text-xs text-gray-600">
                                                {Number(product.average_rating).toFixed(1)} ({product.review_count || 0} {product.review_count === 1 ? 'review' : 'reviews'})
                                            </span>
                                        ) : (
                                            <span className="ml-1 text-xs text-gray-400">(No ratings yet)</span>
                                        )}
                                    </div>

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

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={isOutOfStock(product) || isLoading}
                                            className={`flex w-full transform items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                isOutOfStock(product) || isLoading
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg focus:ring-2 focus:ring-amber-200 active:transform-none'
                                            }`}
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            {isOutOfStock(product) ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue Shopping */}
                <div className="mt-8 text-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center text-primary hover:text-primary/80"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Modals */}
            {showAuthModal && (
                <AuthRequiredModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    action="cart"
                />
            )}
            {showCartModal && selectedProduct && (
                <AddToCartModal
                    isOpen={showCartModal}
                    product={selectedProduct as any}
                    onClose={() => {
                        setShowCartModal(false);
                        setSelectedProduct(null);
                    }}
                    onAddToCart={(quantity) => {
                        addToCart(selectedProduct as any, quantity);
                        setShowCartModal(false);
                        setSelectedProduct(null);
                        setToast({ message: 'Product added to cart!', type: 'success' });
                    }}
                />
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </Layout>
    );
}
