import { Link, usePage } from '@inertiajs/react';
import { Flame, ShoppingCart, Star, TrendingUp, Trophy } from 'lucide-react';
import WishlistButton from './WishlistButton';

interface Product {
    id: number;
    name: string;
    price: number;
    compare_price?: number | null;
    image: string;
    artisan: string;
    artisan_image?: string | null;
    rating: number;
    review_count?: number;
    category?: string;
    order_count?: number;
    view_count?: number;
}

interface ProductCardProps {
    product: Product;
    isInWishlist?: boolean;
    onAddToCart?: (e: React.MouseEvent, product: Product) => void;
    onBuyNow?: (e: React.MouseEvent, product: Product) => void;
    badge?: 'top-rated' | 'best-seller' | 'trending' | null;
    rank?: number;
}

export default function ProductCard({ product, isInWishlist = false, onAddToCart, onBuyNow, badge = null, rank }: ProductCardProps) {
    const { props } = usePage<{ auth?: { user?: { role?: string } } }>();
    const isAuthenticated = !!props?.auth?.user;
    const userRole = props?.auth?.user?.role;

    // Determine the correct product route based on user authentication and role
    const getProductUrl = (productId: number) => {
        if (isAuthenticated && userRole === 'buyer') {
            return `/buyer/product/${productId}`;
        }
        return `/product/${productId}`;
    };

    const discountPercentage =
        product.compare_price && product.compare_price > product.price
            ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
            : null;

    const getBadgeConfig = () => {
        switch (badge) {
            case 'top-rated':
                return {
                    icon: Trophy,
                    label: 'Top Rated',
                    bgClass: 'bg-gradient-to-r from-amber-500 to-yellow-500',
                    textClass: 'text-white',
                };
            case 'best-seller':
                return {
                    icon: TrendingUp,
                    label: 'Best Seller',
                    bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
                    textClass: 'text-white',
                };
            case 'trending':
                return {
                    icon: Flame,
                    label: 'Trending',
                    bgClass: 'bg-gradient-to-r from-orange-500 to-red-500',
                    textClass: 'text-white',
                };
            default:
                return null;
        }
    };

    const badgeConfig = getBadgeConfig();

    return (
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            {/* Badge */}
            {badgeConfig && (
                <div
                    className={`absolute top-2 left-2 z-20 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-lg sm:top-3 sm:left-3 sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs ${badgeConfig.bgClass} ${badgeConfig.textClass}`}
                >
                    <badgeConfig.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">{badgeConfig.label}</span>
                </div>
            )}

            {/* Rank Badge */}
            {rank && rank <= 3 && (
                <div
                    className={`absolute top-2 sm:top-3 ${badgeConfig ? 'left-20 sm:left-28' : 'left-2 sm:left-3'} z-20 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-lg sm:h-7 sm:w-7 sm:text-sm ${
                        rank === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                            : rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                              : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                    }`}
                >
                    #{rank}
                </div>
            )}

            {/* Discount Badge */}
            {discountPercentage && (
                <div className="absolute top-2 right-10 z-20 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg sm:top-3 sm:right-12 sm:px-2 sm:py-1 sm:text-xs">
                    -{discountPercentage}%
                </div>
            )}

            {/* Wishlist Button */}
            <div className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">
                <WishlistButton productId={product.id} initialInWishlist={isInWishlist} variant="icon-filled" size="md" />
            </div>

            {/* Product Image */}
            <Link href={getProductUrl(product.id)} className="relative block flex-shrink-0 overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 sm:h-56">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-5">
                <Link href={getProductUrl(product.id)}>
                    <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-bold text-gray-900 transition-colors hover:text-amber-700 sm:mb-2 sm:min-h-[3rem] sm:text-base">
                        {product.name}
                    </h3>
                </Link>

                {/* Artisan Info */}
                <div className="mb-1.5 flex min-h-[1.25rem] items-center gap-1.5 sm:mb-2 sm:min-h-[1.5rem] sm:gap-2">
                    {product.artisan_image && (
                        <img
                            src={product.artisan_image}
                            alt={product.artisan}
                            className="h-4 w-4 flex-shrink-0 rounded-full object-cover ring-1 ring-amber-200 sm:h-5 sm:w-5"
                        />
                    )}
                    <p className="truncate text-xs text-gray-600 sm:text-sm">
                        by <span className="font-medium text-amber-700">{product.artisan}</span>
                    </p>
                </div>

                {/* Rating */}
                <div className="mb-2 flex min-h-[1.25rem] flex-wrap items-center gap-1 sm:mb-3 sm:min-h-[1.5rem]">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const rating = Number(product.rating) || 0;
                            return (
                                <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                        i < Math.floor(rating)
                                            ? 'fill-current text-amber-400'
                                            : i < rating
                                              ? 'fill-current text-amber-400 opacity-50'
                                              : 'text-gray-300'
                                    }`}
                                />
                            );
                        })}
                    </div>
                    {Number(product.rating) > 0 ? (
                        <span className="text-xs text-gray-600 sm:text-sm">
                            ({Number(product.rating).toFixed(1)})
                            {product.review_count !== undefined && product.review_count > 0 && (
                                <span className="hidden text-gray-400 sm:inline"> · {product.review_count} reviews</span>
                            )}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400 sm:text-sm">No ratings yet</span>
                    )}
                </div>

                {/* Sales Count - fixed height slot so cards stay aligned whether shown or not */}
                <div className="mb-1.5 min-h-[1rem] text-[10px] text-gray-500 sm:mb-2 sm:min-h-[1.125rem] sm:text-xs">
                    {product.order_count !== undefined && product.order_count > 0 && (
                        <span>
                            <span className="font-medium text-emerald-600">{product.order_count.toLocaleString()}</span> sold
                        </span>
                    )}
                </div>

                {/* Price - pushed to bottom */}
                <div className="mt-auto mb-3 flex flex-wrap items-baseline gap-1.5 sm:mb-4 sm:gap-2">
                    <span className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
                        ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                        <span className="text-xs text-gray-400 line-through sm:text-sm">
                            ₱{product.compare_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-2 sm:gap-2.5">
                    <button
                        onClick={(e) => onAddToCart?.(e, product)}
                        className="group/btn flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl active:scale-95 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                        title="Add to Cart"
                    >
                        <ShoppingCart className="h-4 w-4 flex-shrink-0 transition-transform group-hover/btn:scale-110 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        onClick={(e) => onBuyNow?.(e, product)}
                        className="flex-1 rounded-lg border-2 border-amber-500 bg-white px-3 py-2 text-xs font-semibold whitespace-nowrap text-amber-700 shadow-sm transition-all duration-200 hover:scale-105 hover:border-amber-600 hover:bg-amber-50 hover:shadow-md active:scale-95 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                    >
                        Buy
                    </button>
                </div>
            </div>
        </div>
    );
}
