import { Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan?: string;
}

interface ImageCarouselProps {
    products: Product[];
    title?: string;
    autoPlay?: boolean;
    interval?: number;
}

export default function ImageCarousel({ products, title, autoPlay = true, interval = 5000 }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
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

    if (products.length === 0) {
        return null;
    }

    useEffect(() => {
        if (!autoPlay || isPaused || products.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, isPaused, interval, products.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    };

    return (
        <section
            className="relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[320px] md:h-[360px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* Carousel Container */}
            <div className="relative h-full w-full">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <div
                            className="h-full w-full bg-cover bg-center bg-gray-200 cursor-pointer"
                            style={{
                                backgroundImage: `url(${product.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                            onClick={() => router.visit(getProductUrl(product.id))}
                        >
                            {/* Enhanced Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>

                            {/* Content */}
                            <div className="relative z-10 flex h-full items-center">
                                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
                                    <div className="max-w-xl">
                                        {title && (
                                            <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs lg:text-sm font-semibold uppercase tracking-wider text-amber-300">
                                                {title}
                                            </p>
                                        )}
                                        <h2 className="mb-2 sm:mb-3 text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                                            {product.name}
                                        </h2>
                                        {product.artisan && (
                                            <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base text-white/90">
                                                by <span className="font-semibold text-amber-300">{product.artisan}</span>
                                            </p>
                                        )}
                                        <div className="mb-3 sm:mb-4 flex items-baseline gap-2 sm:gap-3">
                                            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                                                ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(getProductUrl(product.id));
                                            }}
                                            className="group inline-flex items-center rounded-lg bg-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
                                        >
                                            Shop Now
                                            <ChevronRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Navigation Arrows */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 sm:left-3 lg:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 p-1.5 sm:p-2 lg:p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-800" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 sm:right-3 lg:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 p-1.5 sm:p-2 lg:p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-800" />
                    </button>
                </>
            )}

            {/* Enhanced Dots Indicator */}
            {products.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-white w-6 sm:w-8 shadow-md'
                                    : 'bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
