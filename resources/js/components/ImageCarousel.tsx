import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
    const [progress, setProgress] = useState(0);
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

    useEffect(() => {
        if (!autoPlay || isPaused || products.length <= 1) {
            setProgress(0);
            return;
        }

        setProgress(0);
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + (100 / (interval / 50));
                if (newProgress >= 100) {
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
            setProgress(0);
        }, interval);

        return () => {
            clearInterval(timer);
            clearInterval(progressInterval);
        };
    }, [autoPlay, isPaused, interval, products.length, currentIndex]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setProgress(0);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
        setProgress(0);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        setProgress(0);
    };

    if (products.length === 0) {
        return null;
    }

    return (
        <section
            className="group relative h-[240px] w-full overflow-hidden rounded-3xl shadow-2xl sm:h-[280px] md:h-[320px] lg:h-[380px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* Carousel Container with Slide Animation */}
            <div className="relative h-full w-full">
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                >
                    {products.map((product, index) => (
                        <div key={product.id} className="relative h-full w-full flex-shrink-0">
                            <div
                                className="h-full w-full cursor-pointer bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-cover bg-center transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${product.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                }}
                                onClick={() => router.visit(getProductUrl(product.id))}
                            >
                                {/* Enhanced Multi-Layer Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50"></div>

                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                                </div>

                                {/* Content with Enhanced Styling */}
                                <div className="relative z-10 flex h-full items-center">
                                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                                        <div className="max-w-2xl space-y-2 sm:space-y-3 md:space-y-4">
                                            {/* Title Badge */}
                                            {title && (
                                                <div className="inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1 backdrop-blur-sm sm:px-4 sm:py-1.5">
                                                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 sm:h-3 sm:w-3" />
                                                    <p className="text-[9px] font-bold tracking-widest text-amber-300 uppercase sm:text-[10px] lg:text-xs">
                                                        {title}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Product Name with Gradient Text */}
                                            <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow-2xl sm:text-2xl md:text-3xl lg:text-4xl">
                                                <span className="bg-gradient-to-r from-white via-white to-amber-100 bg-clip-text text-transparent">
                                                    {product.name}
                                                </span>
                                            </h2>

                                            {/* Artisan Info */}
                                            {product.artisan && (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-px w-6 bg-gradient-to-r from-amber-400 to-transparent sm:w-8"></div>
                                                    <p className="text-xs font-medium text-white/90 sm:text-sm lg:text-base">
                                                        by{' '}
                                                        <span className="font-bold text-amber-300 drop-shadow-lg">
                                                            {product.artisan}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Price with Enhanced Styling */}
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                                                    ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            {/* Enhanced CTA Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(getProductUrl(product.id));
                                                }}
                                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 px-5 py-2.5 text-xs font-bold text-gray-900 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-amber-50 hover:to-orange-50 hover:shadow-amber-500/50 sm:px-6 sm:py-3 sm:text-sm lg:px-8 lg:py-3.5 lg:text-base"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    Shop Now
                                                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
                                                </span>
                                                {/* Shine effect */}
                                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Navigation Arrows with Glassmorphism */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-4 z-30 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-amber-500/30 active:scale-95 sm:left-6 sm:p-3.5 lg:left-8 lg:p-4"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-800 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-amber-500/30 active:scale-95 sm:right-6 sm:p-3.5 lg:right-8 lg:p-4"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-800 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                    </button>
                </>
            )}

            {/* Enhanced Dots Indicator with Progress */}
            {products.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-4 py-2.5 backdrop-blur-md sm:bottom-6 sm:gap-2.5 sm:px-5 sm:py-3">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group relative flex items-center"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    index === currentIndex
                                        ? 'w-8 bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50 sm:w-10'
                                        : 'w-2 bg-white/60 hover:bg-white/80 sm:w-2.5'
                                }`}
                            >
                                {/* Progress bar for active slide */}
                                {index === currentIndex && autoPlay && !isPaused && (
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-white to-amber-200 transition-all duration-75 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Slide Counter */}
            {products.length > 1 && (
                <div className="absolute top-4 right-4 z-30 rounded-full bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:top-6 sm:right-6 sm:px-5 sm:py-2.5 sm:text-sm">
                    {currentIndex + 1} / {products.length}
                </div>
            )}
        </section>
    );
}
