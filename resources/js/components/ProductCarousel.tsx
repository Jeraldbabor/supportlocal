import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';

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

interface ProductCarouselProps {
    title: string;
    subtitle?: string;
    products: Product[];
    badge?: 'top-rated' | 'best-seller' | 'trending' | null;
    wishlistProductIds?: number[];
    onAddToCart?: (e: React.MouseEvent, product: Product) => void;
    onBuyNow?: (e: React.MouseEvent, product: Product) => void;
    viewAllLink?: string;
}

export default function ProductCarousel({
    title,
    subtitle,
    products,
    badge = null,
    wishlistProductIds = [],
    onAddToCart,
    onBuyNow,
    viewAllLink,
}: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        // Add CSS to hide scrollbar for webkit browsers
        const style = document.createElement('style');
        style.textContent = `
            .product-carousel-scroll::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);

        // Initial check after a short delay to ensure DOM is ready
        const timer = setTimeout(() => {
            checkScrollability();
        }, 100);

        // Also check on window resize
        window.addEventListener('resize', checkScrollability);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScrollability);
            document.head.removeChild(style);
        };
    }, [products]);

    if (products.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;

        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        const scrollTo = direction === 'left' ? -scrollAmount : scrollAmount;

        scrollContainerRef.current.scrollBy({
            left: scrollTo,
            behavior: 'smooth',
        });
    };

    return (
        <section className="relative overflow-hidden py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
                        {subtitle && <p className="mt-1.5 text-sm text-gray-600 sm:text-base">{subtitle}</p>}
                    </div>
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="group hidden items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md sm:flex"
                        >
                            View All
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Enhanced Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:shadow-xl sm:p-2.5"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-800 sm:h-6 sm:w-6" />
                        </button>
                    )}

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScrollability}
                        className="product-carousel-scroll flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {products.map((product, index) => (
                            <div key={product.id} className="flex h-full min-w-[240px] sm:min-w-[280px] lg:min-w-[300px] flex-shrink-0">
                                <ProductCard
                                    product={product}
                                    isInWishlist={wishlistProductIds.includes(product.id)}
                                    onAddToCart={onAddToCart}
                                    onBuyNow={onBuyNow}
                                    badge={badge}
                                    rank={index + 1}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:shadow-xl sm:p-2.5"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-800 sm:h-6 sm:w-6" />
                        </button>
                    )}
                </div>

                {/* View All Link for Mobile */}
                {viewAllLink && (
                    <div className="mt-6 text-center sm:hidden">
                        <Link
                            href={viewAllLink}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
                        >
                            View All {title}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
