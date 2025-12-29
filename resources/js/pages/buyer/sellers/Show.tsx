import { Product as GlobalProduct } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Calendar, Eye, Mail, MapPin, MessageSquare, Package, Phone, ShoppingCart, Star, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddToCartModal from '../../../components/AddToCartModal';
import SellerRatingModal from '../../../components/SellerRatingModal';
import StartChatButton from '../../../components/StartChatButton';
import Toast from '../../../components/Toast';
import WishlistButton from '../../../components/WishlistButton';
import { useCart } from '../../../contexts/CartContext';
import BuyerLayout from '../../../layouts/BuyerLayout';

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
    seller: {
        id: number;
        name: string;
    };
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
    review_count: number;
    total_sales: number;
    created_at: string;
    is_verified: boolean;
}

interface SellerRating {
    id: number;
    rating: number;
    review: string | null;
    seller_reply?: string | null;
    seller_replied_at?: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        profile_picture: string | null;
    };
}

interface SellerShowProps {
    seller: Seller;
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
    userRating?: SellerRating | null;
    wishlistProductIds?: number[];
}

export default function Show({ seller, products, filters, userRating: initialUserRating, wishlistProductIds = [] }: SellerShowProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart, isLoading } = useCart();
    const { auth } = usePage<{ auth: { user?: { id: number; role: string } } }>().props;
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');

    // Rating states
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [userRating, setUserRating] = useState<SellerRating | null>(initialUserRating || null);
    const [ratings, setRatings] = useState<SellerRating[]>([]);
    const [ratingsLoading, setRatingsLoading] = useState(false);
    const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
    const [showAllReviews, setShowAllReviews] = useState(false);

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

        // Open modal for quantity selection
        setModalProduct(product);
        setModalMode('cart');
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock') return;

        // Redirect directly to checkout with this product only (no cart)
        router.visit(`/buyer/checkout?buy_now=true&product_id=${product.id}&quantity=1`);
    };

    const handleModalAddToCart = async (quantity: number) => {
        if (!modalProduct) return;

        console.log('[SellerShow] Adding to cart:', { product: modalProduct.name, quantity });

        const productWithSeller: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity,
            primary_image: modalProduct.primary_image,
            seller: {
                id: seller.id,
                name: seller.name,
            },
        };

        try {
            await addToCart(productWithSeller, quantity);
            console.log('[SellerShow] Successfully added to cart');
            // Close modal first
            setIsModalOpen(false);
            // Then show success message
            setTimeout(() => {
                setToastMessage(`✅ ${quantity} × ${modalProduct.name} added to cart successfully!`);
                setShowToast(true);
                console.log('[SellerShow] Toast notification shown');
            }, 100);
        } catch (error) {
            console.error('[SellerShow] Error adding to cart:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    const handleModalBuyNow = async (quantity: number) => {
        if (!modalProduct) return;

        console.log('[SellerShow] Buy Now clicked:', { product: modalProduct.name, quantity });

        const productWithSeller: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity,
            primary_image: modalProduct.primary_image,
            seller: {
                id: seller.id,
                name: seller.name,
            },
        };

        try {
            await addToCart(productWithSeller, quantity);
            setIsModalOpen(false);
            // Redirect to checkout
            router.visit('/buyer/checkout');
        } catch (error) {
            console.error('[SellerShow] Error with Buy Now:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to process order. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    // Fetch seller ratings
    const fetchRatings = async () => {
        setRatingsLoading(true);
        try {
            const response = await axios.get(`/buyer/seller/${seller.id}/ratings`);
            setRatings(response.data.ratings.data || []);
            setRatingDistribution(response.data.distribution || {});
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setRatingsLoading(false);
        }
    };

    // Fetch user's rating
    const fetchUserRating = async () => {
        try {
            const response = await axios.get(`/buyer/seller/${seller.id}/ratings/user`);
            setUserRating(response.data.rating);
        } catch (error) {
            console.error('Error fetching user rating:', error);
        }
    };

    // Delete rating
    const handleDeleteRating = async () => {
        if (!userRating || !confirm('Are you sure you want to delete your rating?')) return;

        try {
            await axios.delete(`/buyer/seller/${seller.id}/ratings/${userRating.id}`);
            setUserRating(null);
            fetchRatings();
            setToastMessage('✅ Rating deleted successfully!');
            setShowToast(true);
            // Refresh page to update seller's average rating
            router.reload();
        } catch {
            setToastMessage('❌ Failed to delete rating. Please try again.');
            setShowToast(true);
        }
    };

    // Handle rating success
    const handleRatingSuccess = () => {
        fetchUserRating();
        fetchRatings();
        setToastMessage(userRating ? '✅ Rating updated successfully!' : '✅ Rating submitted successfully!');
        setShowToast(true);
        // Refresh page to update seller's average rating
        router.reload();
    };

    // Load ratings on mount
    useEffect(() => {
        fetchRatings();
    }, [seller.id]);

    return (
        <BuyerLayout title={seller.business_name || seller.name}>
            <Head title={seller.business_name || seller.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/buyer/sellers" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sellers
                    </Link>
                </div>

                {/* Seller Profile Header */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
                        <div className="flex-shrink-0">
                            {seller.profile_image ? (
                                <img src={`/storage/${seller.profile_image}`} alt={seller.name} className="h-24 w-24 rounded-full object-cover" />
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
                                        <h1 className="text-2xl font-bold text-gray-900">{seller.business_name || seller.name}</h1>
                                        {seller.is_verified && (
                                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-sm font-medium text-amber-900 shadow-sm">
                                                Verified Seller
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-gray-600">by {seller.name}</p>

                                    {seller.location && (
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            {seller.location}
                                        </div>
                                    )}
                                    
                                    {auth?.user && auth.user.id !== seller.id && (
                                        <div className="mt-3">
                                            <StartChatButton
                                                userId={seller.id}
                                                variant="default"
                                                className=""
                                            >
                                                <MessageSquare className="mr-1 h-4 w-4" />
                                                Contact Seller
                                            </StartChatButton>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center space-x-6 md:mt-0">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{seller.products_count}</div>
                                        <div className="text-sm text-gray-500">Products</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center">
                                            <Star className="mr-1 h-5 w-5 fill-current text-yellow-400" />
                                            <span className="text-2xl font-bold text-gray-900">
                                                {seller.average_rating ? Number(seller.average_rating).toFixed(1) : '0.0'}
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
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">About</h3>
                                    <p className="leading-relaxed text-gray-600">{seller.business_description}</p>
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

                {/* Ratings & Reviews Section */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
                        <button
                            onClick={() => setIsRatingModalOpen(true)}
                            className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-white shadow-md hover:from-amber-700 hover:to-orange-700"
                        >
                            {userRating ? 'Edit Your Rating' : 'Rate This Seller'}
                        </button>
                    </div>

                    {/* Rating Summary */}
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Average Rating */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-900">
                                    {seller.average_rating ? Number(seller.average_rating).toFixed(1) : '0.0'}
                                </div>
                                <div className="mt-2 flex justify-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${
                                                i < Math.floor(Number(seller.average_rating) || 0) ? 'fill-current text-yellow-400' : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-1 text-sm text-gray-600">{seller.review_count || 0} reviews</div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="flex-1">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingDistribution[star] || 0;
                                    const percentage = seller.review_count ? (count / seller.review_count) * 100 : 0;
                                    return (
                                        <div key={star} className="mb-2 flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-600">{star}</span>
                                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                            </div>
                                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-sm text-gray-600">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* User's Rating */}
                        {userRating && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Your Rating</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsRatingModalOpen(true)} className="text-sm text-amber-600 hover:text-amber-700">
                                            Edit
                                        </button>
                                        <button onClick={handleDeleteRating} className="text-sm text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < userRating.rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                {userRating.review && <p className="text-sm text-gray-700">{userRating.review}</p>}
                            </div>
                        )}
                    </div>

                    {/* Reviews List */}
                    {ratings.length > 0 && (
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Reviews</h3>
                            <div className="space-y-4">
                                {(showAllReviews ? ratings : ratings.slice(0, 3)).map((rating) => (
                                    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-0">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {rating.user.profile_picture ? (
                                                    <img
                                                        src={`/storage/${rating.user.profile_picture}`}
                                                        alt={rating.user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{rating.user.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < rating.rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(rating.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {rating.review && <p className="ml-13 text-sm text-gray-700">{rating.review}</p>}
                                        
                                        {/* Seller Reply */}
                                        {rating.seller_reply && (
                                            <div className="mt-3 ml-13 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-semibold text-blue-900">Seller's Reply</span>
                                                    {rating.seller_replied_at && (
                                                        <span className="ml-auto text-xs text-blue-600">
                                                            {new Date(rating.seller_replied_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-blue-900">{rating.seller_reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {ratings.length > 3 && (
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    {showAllReviews ? 'Show Less' : `Show All ${ratings.length} Reviews`}
                                </button>
                            )}
                        </div>
                    )}

                    {ratings.length === 0 && !ratingsLoading && (
                        <div className="py-8 text-center">
                            <MessageSquare className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600">No reviews yet. Be the first to rate this seller!</p>
                        </div>
                    )}
                </div>

                {/* Products Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">Products by {seller.business_name || seller.name}</h2>

                        <div className="flex flex-col gap-4 md:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Package className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
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
                            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-xl"
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
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
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
                                                        product.stock_status === 'in_stock'
                                                            ? 'bg-green-500/90 text-white'
                                                            : product.stock_status === 'low_stock'
                                                              ? 'bg-yellow-500/90 text-white'
                                                              : 'bg-red-500/90 text-white'
                                                    }`}
                                                >
                                                    {product.stock_status === 'in_stock'
                                                        ? 'Available'
                                                        : product.stock_status === 'low_stock'
                                                          ? 'Low Stock'
                                                          : 'Out of Stock'}
                                                </span>
                                            </div>

                                            {/* Wishlist Button */}
                                            <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                                                <WishlistButton
                                                    productId={product.id}
                                                    initialInWishlist={wishlistProductIds.includes(product.id)}
                                                    variant="icon-filled"
                                                />
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
                                            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{product.short_description}</p>

                                            {/* Views */}
                                            <div className="flex items-center justify-end text-sm">
                                                {product.view_count > 0 && (
                                                    <div className="flex items-center text-gray-500">
                                                        <Eye className="mr-1 h-3.5 w-3.5" />
                                                        <span className="text-xs">{product.view_count}</span>
                                                    </div>
                                                )}
                                            </div>

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
                                                {product.average_rating > 0 ? (
                                                    <span className="ml-1 text-xs text-gray-600">({Number(product.average_rating).toFixed(1)})</span>
                                                ) : (
                                                    <span className="ml-1 text-xs text-gray-400">(No ratings yet)</span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="pt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">₱{Number(product.price).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-2 pt-3">
                                                {/* View Details Button */}
                                                <Link
                                                    href={`/buyer/product/${product.id}`}
                                                    className="flex w-full transform items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Link>

                                                {/* Cart and Buy Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                        className={`flex flex-1 transform items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                            product.stock_status === 'out_of_stock' || isLoading
                                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg focus:ring-2 focus:ring-amber-200 active:transform-none'
                                                        }`}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                        {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleBuyNow(e, product)}
                                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                        className={`flex transform items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                            product.stock_status === 'out_of_stock' || isLoading
                                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                : 'border-2 border-amber-300 bg-white text-amber-700 shadow-sm hover:-translate-y-0.5 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-md focus:ring-2 focus:ring-amber-200 active:transform-none'
                                                        }`}
                                                        title="Buy Now"
                                                    >
                                                        Buy Now
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
                                <Package className="h-full w-full" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
                            <p className="text-gray-600">
                                {seller.business_name || seller.name} hasn't added any products yet or no products match your search.
                            </p>
                        </div>
                    )}
                </div>
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

            {/* Seller Rating Modal */}
            <SellerRatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                seller={seller}
                existingRating={userRating}
                onSuccess={handleRatingSuccess}
            />
        </BuyerLayout>
    );
}
