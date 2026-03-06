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
                    bgClass: 'bg-white/90 backdrop-blur-md text-gray-800',
                    iconClass: 'text-amber-500',
                };
            case 'best-seller':
                return {
                    icon: TrendingUp,
                    label: 'Best Seller',
                    bgClass: 'bg-white/90 backdrop-blur-md text-gray-800',
                    iconClass: 'text-emerald-500',
                };
            case 'trending':
                return {
                    icon: Flame,
                    label: 'Trending',
                    bgClass: 'bg-white/90 backdrop-blur-md text-gray-800',
                    iconClass: 'text-orange-500',
                };
            default:
                return null;
        }
    };

    const badgeConfig = getBadgeConfig();

    return (
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-gray-200/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:ring-gray-300">
            {/* Image Container */}
            <Link href={getProductUrl(product.id)} className="relative block aspect-[4/5] w-full flex-shrink-0 overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay gradient for readability of overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {badgeConfig && (
                        <div
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm ${badgeConfig.bgClass}`}
                        >
                            <badgeConfig.icon className={`h-3 w-3 ${badgeConfig.iconClass}`} />
                            <span>{badgeConfig.label}</span>
                        </div>
                    )}
                    {rank && rank <= 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-md">
                            #{rank}
                        </div>
                    )}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-20">
                    <WishlistButton productId={product.id} initialInWishlist={isInWishlist} variant="icon-filled" size="sm" />
                </div>

                {/* Action Buttons (Fade in on hover - Desktop Only) */}
                <div className="absolute right-0 bottom-4 left-0 z-20 hidden translate-y-4 justify-center gap-2 px-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart?.(e, product);
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-orange-600 active:scale-95"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onBuyNow?.(e, product);
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 active:scale-95"
                    >
                        <span>Buy</span>
                    </button>
                </div>
            </Link>

            {/* Content Container */}
            <div className="flex flex-1 flex-col px-3 pt-4 pb-5 sm:px-4">
                {/* Header info: Category & Rating */}
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate pr-2 font-medium tracking-wider text-gray-400 uppercase">{product.category || 'Product'}</span>
                    <div className="flex shrink-0 items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                        <span className="font-medium text-gray-700">{Number(product.rating).toFixed(1)}</span>
                        {product.review_count !== undefined && product.review_count > 0 && (
                            <span className="text-gray-400">({product.review_count})</span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <Link href={getProductUrl(product.id)}>
                    <h3 className="mb-1.5 line-clamp-2 min-h-[3rem] text-[15px] leading-relaxed font-medium text-gray-900 transition-colors group-hover:text-amber-700">
                        {product.name}
                    </h3>
                </Link>

                {/* Artisan */}
                <div className="mt-auto mb-4 flex min-h-[1.5rem] items-center gap-2">
                    {product.artisan_image ? (
                        <img
                            src={product.artisan_image}
                            alt={product.artisan}
                            className="h-5 w-5 cursor-pointer rounded-full object-cover ring-1 ring-gray-100"
                        />
                    ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-100 ring-1 ring-gray-200" />
                    )}
                    <span className="min-w-0 truncate text-sm text-gray-500">{product.artisan}</span>
                </div>

                {/* Footer: Price & Sales */}
                <div className="flex items-end justify-between">
                    <div className="flex min-h-[3rem] flex-col justify-end">
                        <div className="mb-0.5 min-h-[1rem]">
                            {discountPercentage && (
                                <div className="flex items-center gap-2">
                                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-600">
                                        -{discountPercentage}%
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                        ₱{product.compare_price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-gray-900">
                            ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    {product.order_count !== undefined && product.order_count > 0 && (
                        <span className="mb-1 text-xs text-gray-500">{product.order_count.toLocaleString()} sold</span>
                    )}
                </div>

                {/* Mobile Action Buttons (Visible only on small screens) */}
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3 sm:hidden">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart?.(e, product);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded border border-orange-500 bg-orange-50 px-2 py-1.5 text-xs font-semibold text-orange-600 transition-colors active:bg-orange-100"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Cart</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onBuyNow?.(e, product);
                        }}
                        className="flex flex-1 items-center justify-center rounded bg-orange-500 px-2 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors active:bg-orange-600"
                    >
                        <span>Buy Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
