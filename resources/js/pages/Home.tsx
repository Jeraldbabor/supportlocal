import { Product as GlobalProduct } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Gavel, HandHeart, MessageSquare, Package, Shield, Sparkles, Star, Truck, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import AddToCartModal from '../components/AddToCartModal';
import ImageCarousel from '../components/ImageCarousel';
import NewsletterSubscription from '../components/NewsletterSubscription';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import MainLayout from '../layouts/MainLayout';

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

interface Category {
    id: number;
    name: string;
    slug?: string | null;
}

interface HomeProps {
    featuredProducts: Product[];
    topProducts: Product[];
    topSales: Product[];
    trendingProducts: Product[];
    wishlistProductIds: number[];
    categories?: Category[];
}

export default function Home({
    featuredProducts = [],
    topProducts = [],
    topSales = [],
    trendingProducts = [],
    wishlistProductIds = [],
    categories = [],
}: HomeProps) {
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart } = useCart();
    const { props } = usePage<{ auth?: { user?: { role?: string } } }>();
    const isAuthenticated = !!props?.auth?.user;

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

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
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

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
        setIsModalOpen(true);
    };

    const handleModalAddToCart = (quantity: number) => {
        if (!modalProduct) return;

        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: 999, // Default quantity available
            primary_image: modalProduct.image,
            seller: {
                id: 0,
                name: modalProduct.artisan,
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
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    const handleModalBuyNow = (quantity: number) => {
        if (!modalProduct) return;

        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: 999, // Default quantity available
            primary_image: modalProduct.image,
            seller: {
                id: 0,
                name: modalProduct.artisan,
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
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    return (
        <MainLayout>
            {/* Hero Banner Carousel Section */}
            {trendingProducts.length > 0 && (
                <section className="relative overflow-hidden bg-white">
                    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
                        <ImageCarousel
                            products={trendingProducts.slice(0, 5).map((product) => ({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                artisan: product.artisan,
                            }))}
                            title="Trending Now"
                            autoPlay={true}
                            interval={5000}
                        />
                    </div>
                </section>
            )}

            {/* Trust Badges / Benefits Section */}
            <section className="border-b border-gray-100 bg-white py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:gap-4">
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 sm:gap-3 sm:p-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10">
                                <Truck className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight font-semibold text-gray-900 sm:text-xs">Free Shipping</p>
                                <p className="text-[10px] leading-tight text-gray-500 sm:text-xs">On orders ₱500+</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 sm:gap-3 sm:p-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                                <Shield className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight font-semibold text-gray-900 sm:text-xs">Secure Payment</p>
                                <p className="text-[10px] leading-tight text-gray-500 sm:text-xs">100% Protected</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 sm:gap-3 sm:p-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 sm:h-10 sm:w-10">
                                <CheckCircle className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight font-semibold text-gray-900 sm:text-xs">Quality Assured</p>
                                <p className="text-[10px] leading-tight text-gray-500 sm:text-xs">Handcrafted Items</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 sm:gap-3 sm:p-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 sm:h-10 sm:w-10">
                                <Package className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] leading-tight font-semibold text-gray-900 sm:text-xs">Easy Returns</p>
                                <p className="text-[10px] leading-tight text-gray-500 sm:text-xs">7-Day Policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Quick Links */}
            {categories.length > 0 && (
                <section className="border-b border-gray-100 bg-gray-50 py-6 sm:py-8">
                    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                        <h3 className="mb-3 px-1 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">Shop by Category</h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-10">
                            {categories.map((category) => {
                                // Map category names to emojis with comprehensive matching
                                const getCategoryIcon = (name: string): string => {
                                    const nameLower = name.toLowerCase();

                                    // Pottery & Ceramics
                                    if (
                                        nameLower.includes('pottery') ||
                                        nameLower.includes('ceramic') ||
                                        nameLower.includes('clay') ||
                                        nameLower.includes('vase')
                                    )
                                        return '🏺';

                                    // Woodworking & Carpentry
                                    if (
                                        nameLower.includes('wood') ||
                                        nameLower.includes('carpentry') ||
                                        nameLower.includes('furniture') ||
                                        nameLower.includes('carving')
                                    )
                                        return '🪵';

                                    // Textiles & Weaving
                                    if (
                                        nameLower.includes('textile') ||
                                        nameLower.includes('weaving') ||
                                        nameLower.includes('fabric') ||
                                        nameLower.includes('woven')
                                    )
                                        return '🧵';

                                    // Metalwork & Jewelry
                                    if (
                                        nameLower.includes('metal') ||
                                        nameLower.includes('jewelry') ||
                                        nameLower.includes('jewellery') ||
                                        nameLower.includes('silver') ||
                                        nameLower.includes('gold')
                                    )
                                        return '💍';

                                    // Food & Beverages
                                    if (
                                        nameLower.includes('food') ||
                                        nameLower.includes('beverage') ||
                                        nameLower.includes('drink') ||
                                        nameLower.includes('coffee') ||
                                        nameLower.includes('tea')
                                    )
                                        return '🍔';

                                    // Clothing & Fashion
                                    if (
                                        nameLower.includes('clothing') ||
                                        nameLower.includes('fashion') ||
                                        nameLower.includes('apparel') ||
                                        nameLower.includes('wear') ||
                                        nameLower.includes('garment')
                                    )
                                        return '👕';

                                    // Art & Design
                                    if (
                                        nameLower.includes('art') ||
                                        nameLower.includes('design') ||
                                        nameLower.includes('painting') ||
                                        nameLower.includes('drawing') ||
                                        nameLower.includes('canvas')
                                    )
                                        return '🎨';

                                    // Home & Garden
                                    if (
                                        nameLower.includes('home') ||
                                        nameLower.includes('garden') ||
                                        nameLower.includes('decor') ||
                                        nameLower.includes('decoration') ||
                                        nameLower.includes('interior')
                                    )
                                        return '🏠';

                                    // Electronics & Tech
                                    if (
                                        nameLower.includes('electronic') ||
                                        nameLower.includes('tech') ||
                                        nameLower.includes('gadget') ||
                                        nameLower.includes('device') ||
                                        nameLower.includes('digital')
                                    )
                                        return '📱';

                                    // Beauty & Personal Care
                                    if (
                                        nameLower.includes('beauty') ||
                                        nameLower.includes('personal') ||
                                        nameLower.includes('care') ||
                                        nameLower.includes('cosmetic') ||
                                        nameLower.includes('skincare')
                                    )
                                        return '💄';

                                    // Books & Media
                                    if (
                                        nameLower.includes('book') ||
                                        nameLower.includes('media') ||
                                        nameLower.includes('reading') ||
                                        nameLower.includes('literature')
                                    )
                                        return '📚';

                                    // Sports & Recreation
                                    if (
                                        nameLower.includes('sport') ||
                                        nameLower.includes('recreation') ||
                                        nameLower.includes('fitness') ||
                                        nameLower.includes('outdoor')
                                    )
                                        return '⚽';

                                    // Musical Instruments
                                    if (
                                        nameLower.includes('instrument') ||
                                        nameLower.includes('music') ||
                                        nameLower.includes('guitar') ||
                                        nameLower.includes('piano') ||
                                        nameLower.includes('drum')
                                    )
                                        return '🎵';

                                    // Basketry & Wicker
                                    if (nameLower.includes('basket') || nameLower.includes('wicker') || nameLower.includes('woven')) return '🧺';

                                    // Leather Goods
                                    if (
                                        nameLower.includes('leather') ||
                                        nameLower.includes('bag') ||
                                        nameLower.includes('wallet') ||
                                        nameLower.includes('belt')
                                    )
                                        return '👜';

                                    // Glass & Crystal
                                    if (nameLower.includes('glass') || nameLower.includes('crystal') || nameLower.includes('lamp')) return '💎';

                                    // Toys & Games
                                    if (nameLower.includes('toy') || nameLower.includes('game') || nameLower.includes('puzzle')) return '🧸';

                                    // Plants & Flowers
                                    if (
                                        nameLower.includes('plant') ||
                                        nameLower.includes('flower') ||
                                        nameLower.includes('herb') ||
                                        nameLower.includes('seed')
                                    )
                                        return '🌱';

                                    // Kitchen & Cooking
                                    if (
                                        nameLower.includes('kitchen') ||
                                        nameLower.includes('cooking') ||
                                        nameLower.includes('utensil') ||
                                        nameLower.includes('cutlery')
                                    )
                                        return '🍳';

                                    // Candles & Soaps
                                    if (nameLower.includes('candle') || nameLower.includes('soap') || nameLower.includes('wax')) return '🕯️';

                                    // Stationery & Office
                                    if (
                                        nameLower.includes('stationery') ||
                                        nameLower.includes('office') ||
                                        nameLower.includes('pen') ||
                                        nameLower.includes('notebook')
                                    )
                                        return '✏️';

                                    // Pet Supplies
                                    if (
                                        nameLower.includes('pet') ||
                                        nameLower.includes('dog') ||
                                        nameLower.includes('cat') ||
                                        nameLower.includes('animal')
                                    )
                                        return '🐾';

                                    // Default icon
                                    return '📦';
                                };

                                return (
                                    <Link
                                        key={category.id}
                                        href={`/products?category=${category.id}`}
                                        className="group flex flex-col items-center gap-1.5 rounded-lg bg-white p-2.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:gap-2 sm:rounded-xl sm:p-4"
                                    >
                                        <span className="text-2xl sm:text-3xl">{getCategoryIcon(category.name)}</span>
                                        <span className="line-clamp-2 text-[10px] leading-tight font-medium text-gray-700 group-hover:text-amber-600 sm:text-xs">
                                            {category.name}
                                        </span>
                                    </Link>
                                );
                            })}
                            {/* Always show "View All" link */}
                            <Link
                                href="/products"
                                className="group flex flex-col items-center gap-1.5 rounded-lg bg-white p-2.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:gap-2 sm:rounded-xl sm:p-4"
                            >
                                <span className="text-2xl sm:text-3xl">✨</span>
                                <span className="text-[10px] font-medium text-gray-700 group-hover:text-amber-600 sm:text-xs">View All</span>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Flash Deals / Special Offers Banner */}
            <section className="border-b border-gray-100 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 py-3 sm:py-4">
                <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-2 text-white sm:flex-row sm:gap-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" />
                            <p className="text-center text-xs font-semibold sm:text-left sm:text-sm">🎉 Flash Sale: Up to 50% OFF - Limited Time!</p>
                        </div>
                        <Link
                            href="/products?sort=trending"
                            className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold whitespace-nowrap text-orange-600 transition-all hover:scale-105 sm:px-4 sm:py-1 sm:text-xs"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trending Products Section */}
            {trendingProducts.length > 0 && (
                <section className="border-b border-gray-100 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Trending Now</h2>
                                <p className="mt-1 text-sm text-gray-600">Hot products everyone's talking about</p>
                            </div>
                            <Link
                                href="/products?sort=trending"
                                className="hidden items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 sm:flex"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <ProductCarousel
                            title=""
                            subtitle=""
                            products={trendingProducts}
                            badge="trending"
                            wishlistProductIds={wishlistProductIds}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            viewAllLink="/products?sort=trending"
                        />
                    </div>
                </section>
            )}

            {/* Top Rated Products Section */}
            {topProducts.length > 0 && (
                <section className="border-b border-gray-100 bg-gray-50 py-12">
                    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Top Rated</h2>
                                <p className="mt-1 text-sm text-gray-600">Highest rated by our community</p>
                            </div>
                            <Link
                                href="/products?sort=rating"
                                className="hidden items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 sm:flex"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {topProducts.slice(0, 4).map((product, index) => (
                                <div key={product.id} className="flex h-full">
                                    <ProductCard
                                        product={product}
                                        isInWishlist={wishlistProductIds.includes(product.id)}
                                        onAddToCart={handleAddToCart}
                                        onBuyNow={handleBuyNow}
                                        badge="top-rated"
                                        rank={index + 1}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center sm:hidden">
                            <Link
                                href="/products?sort=rating"
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-700"
                            >
                                View All Top Rated
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Best Sellers Section */}
            {topSales.length > 0 && (
                <section className="border-b border-gray-100 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Best Sellers</h2>
                                <p className="mt-1 text-sm text-gray-600">Most purchased products</p>
                            </div>
                            <Link
                                href="/products?sort=sales"
                                className="hidden items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 sm:flex"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <ProductCarousel
                            title=""
                            subtitle=""
                            products={topSales}
                            badge="best-seller"
                            wishlistProductIds={wishlistProductIds}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            viewAllLink="/products?sort=sales"
                        />
                    </div>
                </section>
            )}

            {/* Featured Products / New Arrivals */}
            <section className="border-b border-gray-100 bg-gray-50 py-12">
                <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">New Arrivals</h2>
                            <p className="mt-1 text-sm text-gray-600">Discover our latest handpicked artisan crafts</p>
                        </div>
                        <Link
                            href="/products"
                            className="hidden items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 sm:flex"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="flex h-full">
                                <ProductCard
                                    product={product}
                                    isInWishlist={wishlistProductIds.includes(product.id)}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center sm:hidden">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-700"
                        >
                            View All Products
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Unique Feature: Custom Order Bidding */}
            <section className="border-b border-gray-100 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* Left Content */}
                        <div className="text-white">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                                <Sparkles className="h-4 w-4" />
                                <span>Only on SupportLocal</span>
                            </div>
                            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Custom Order Bidding System</h2>
                            <p className="mt-3 text-base text-amber-100 sm:text-lg">
                                Can't find what you're looking for? Post your custom order request and let local artisans compete to craft it for you!
                            </p>
                            <ul className="mt-6 space-y-3">
                                {[
                                    { icon: Gavel, text: 'Post your request & receive multiple bids' },
                                    { icon: Users, text: 'Compare prices from verified artisans' },
                                    { icon: Star, text: 'Choose based on ratings & portfolios' },
                                    { icon: MessageSquare, text: 'Direct chat with your chosen artisan' },
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm sm:text-base">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-amber-600 shadow-lg transition-all hover:bg-amber-50 hover:shadow-xl sm:text-base"
                                >
                                    Start Your Custom Order
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/artisans"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/50 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10 sm:text-base"
                                >
                                    Browse Artisans
                                </Link>
                            </div>
                        </div>

                        {/* Right Content - Demo Card */}
                        <div className="relative">
                            <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 sm:text-sm">
                                        Open for Bids
                                    </span>
                                    <span className="text-xs text-gray-500 sm:text-sm">3 bids received</span>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Custom Leather Messenger Bag</h3>
                                <p className="mt-2 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                                    Looking for a handcrafted leather messenger bag with custom engraving for my initials...
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-4 sm:text-sm">
                                    <span>Budget: ₱2,000 - ₱3,500</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Deadline: 2 weeks</span>
                                </div>
                                <div className="mt-5 space-y-2 sm:space-y-3">
                                    {[
                                        { name: 'Jerald B.', price: '₱2,800', rating: 4.9, days: 10 },
                                        { name: 'Decery B.', price: '₱2,500', rating: 4.7, days: 12 },
                                        { name: 'Ana R.', price: '₱3,200', rating: 5.0, days: 8 },
                                    ].map((bid, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2.5 sm:p-3"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 sm:text-sm">
                                                    {bid.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900 sm:text-sm">{bid.name}</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 sm:text-xs">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        {bid.rating}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-amber-600 sm:text-base">{bid.price}</p>
                                                <p className="text-[10px] text-gray-500 sm:text-xs">{bid.days} days</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us - Features */}
            <section className="border-b border-gray-100 bg-white py-10 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Why Choose SupportLocal?</h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                            We connect you directly with talented Filipino artisans for unique, handcrafted products.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {[
                            {
                                icon: Gavel,
                                title: 'Custom Order Bidding',
                                description: 'Post requests and let artisans compete to craft your perfect item.',
                                highlight: true,
                            },
                            {
                                icon: HandHeart,
                                title: 'Support Local Hinoba-an Artisans',
                                description: 'Every purchase directly supports Filipino craftsmen and small businesses.',
                                highlight: false,
                            },
                            {
                                icon: MessageSquare,
                                title: 'Direct Communication',
                                description: 'Chat directly with artisans to customize your orders.',
                                highlight: false,
                            },
                            {
                                icon: Shield,
                                title: 'Secure Transactions',
                                description: 'Safe payments with GCash and Cash on Delivery options.',
                                highlight: false,
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`group relative rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6 ${
                                    feature.highlight
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                        : 'border border-gray-100 bg-white'
                                }`}
                            >
                                <div className={`mb-3 inline-flex rounded-lg p-2.5 ${feature.highlight ? 'bg-white/20' : 'bg-amber-100'}`}>
                                    <feature.icon className={`h-5 w-5 ${feature.highlight ? 'text-white' : 'text-amber-600'}`} />
                                </div>
                                <h3 className={`text-sm font-semibold sm:text-base ${feature.highlight ? 'text-white' : 'text-gray-900'}`}>
                                    {feature.title}
                                </h3>
                                <p className={`mt-1.5 text-xs sm:text-sm ${feature.highlight ? 'text-amber-100' : 'text-gray-600'}`}>
                                    {feature.description}
                                </p>
                                {feature.highlight && (
                                    <div className="absolute -top-2 -right-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-amber-600 shadow sm:text-xs">
                                        UNIQUE
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <NewsletterSubscription />

            {/* Add to Cart Modal */}
            {modalProduct && (
                <AddToCartModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={{
                        id: modalProduct.id,
                        name: modalProduct.name,
                        price: modalProduct.price,
                        image: modalProduct.image,
                        seller: { id: 0, name: modalProduct.artisan },
                    }}
                    onAddToCart={handleModalAddToCart}
                    onBuyNow={handleModalBuyNow}
                />
            )}

            {/* Toast Notification */}
            {showToast && (
                <Toast message={toastMessage} type={toastMessage.includes('✅') ? 'success' : 'error'} onClose={() => setShowToast(false)} />
            )}
        </MainLayout>
    );
}
