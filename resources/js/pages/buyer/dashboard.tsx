import { Product as GlobalProduct } from '@/types';
import { type SharedData } from '@/types/index';
import { formatPeso } from '@/utils/currency';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    CheckCircle,
    Clock,
    CreditCard,
    MapPin,
    Package,
    Shield,
    ShoppingBag,
    Star,
    TrendingUp,
    Truck,
    User,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import AddToCartModal from '../../components/AddToCartModal';
import ImageCarousel from '../../components/ImageCarousel';
import ProductCarousel from '../../components/ProductCarousel';
import Toast from '../../components/Toast';
import { useCart } from '../../contexts/CartContext';
import BuyerLayout from '../../layouts/BuyerLayout';

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
    totalReviews: number;
    averageRating: number;
}

interface OrderItem {
    product_name: string;
    quantity: number;
    price: number;
    image: string;
}

interface RecentOrder {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    items_count: number;
    seller_name: string;
    created_at: string;
    created_at_human: string;
    items: OrderItem[];
}

interface Activity {
    type: 'order' | 'review';
    description: string;
    date: string;
    date_human: string;
    status?: string;
    amount?: number;
    product_name?: string;
    rating?: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    compare_price?: number | null;
    image: string;
    artisan: string;
    artisan_image?: string | null;
    seller_id?: number;
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

interface PageProps extends SharedData {
    stats: Stats;
    recentOrders: RecentOrder[];
    recentActivity: Activity[];
    topSales?: Product[];
    trendingProducts?: Product[];
    categories?: Category[];
}

export default function BuyerDashboard() {
    const { auth, stats, recentOrders, recentActivity, topSales = [], trendingProducts = [], categories = [] } = usePage<PageProps>().props;
    const user = auth.user;
    const { addToCart } = useCart();
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        // Open modal for quantity selection
        setModalProduct(product);
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        // Open modal for quantity selection
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
                id: modalProduct.seller_id || 0,
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
                id: modalProduct.seller_id || 0,
                name: modalProduct.artisan,
            },
        };

        try {
            addToCart(cartProduct, quantity);
            // Small delay before redirect to ensure cart is updated
            setTimeout(() => {
                router.visit('/buyer/checkout');
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
        <BuyerLayout>
            <Head title="Buyer Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Banner Carousel at Top */}
                {trendingProducts.length > 0 && (
                    <section className="border-b border-gray-100 bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
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
                        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
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
                                            href={`/buyer/products?category=${category.id}`}
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
                                    href="/buyer/products"
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
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                        <div className="flex flex-col items-center justify-center gap-2 text-white sm:flex-row sm:gap-3">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" />
                                <p className="text-center text-xs font-semibold sm:text-left sm:text-sm">
                                    🎉 Flash Sale: Up to 50% OFF - Limited Time!
                                </p>
                            </div>
                            <Link
                                href="/buyer/products?sort=trending"
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
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Trending Now</h2>
                                    <p className="mt-1 text-sm text-gray-600">Hot products everyone's talking about</p>
                                </div>
                                <Link
                                    href="/buyer/products?sort=trending"
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
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                                viewAllLink="/buyer/products?sort=trending"
                            />
                        </div>
                    </section>
                )}

                {/* Hero Section */}
                <section className="mx-2 mt-2 border-b border-gray-100 bg-white py-6 sm:mx-4 sm:mt-4 sm:py-10">
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl font-bold break-words text-gray-900 sm:text-2xl lg:text-3xl">
                                    {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                                    <span className="ml-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent sm:ml-2">
                                        {user?.name}
                                    </span>
                                </h1>
                                <p className="mt-1.5 text-sm text-gray-600 sm:mt-2 sm:text-base">
                                    Discover unique, handcrafted treasures from local artisans
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                                <Link
                                    href="/buyer/products"
                                    className="group inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
                                >
                                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110 sm:mr-2 sm:h-4 sm:w-4" />
                                    Browse
                                </Link>
                                <Link
                                    href="/seller/apply"
                                    className="group inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800 hover:shadow-xl sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
                                >
                                    <User className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110 sm:mr-2 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Become a Seller</span>
                                    <span className="sm:hidden">Become Seller</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Stats Section */}
                <section className="mx-2 rounded-xl border border-gray-100 bg-white py-6 shadow-sm sm:mx-4 sm:rounded-2xl sm:py-8">
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                        <div className="mb-6 text-center sm:mb-8 lg:mb-12">
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl lg:text-4xl">Your Shopping Journey</h2>
                            <p className="text-sm text-gray-600 sm:text-base lg:text-lg">Track your orders and shopping activity at a glance</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Orders Card */}
                            <div className="group rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-4 transition-all duration-200 hover:shadow-lg sm:rounded-xl sm:p-6">
                                <div className="mb-3 flex items-center justify-between sm:mb-4">
                                    <div className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110 sm:p-3">
                                        <ShoppingBag className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <TrendingUp className="h-3.5 w-3.5 text-amber-700 sm:h-4 sm:w-4" />
                                </div>
                                <h3 className="mb-1.5 text-base font-semibold text-gray-800 sm:mb-2 sm:text-lg">Total Orders</h3>
                                <div className="flex items-baseline space-x-1.5 sm:space-x-2">
                                    <p className="text-2xl font-bold text-amber-700 sm:text-3xl">{stats.totalOrders}</p>
                                    <span className="text-xs text-gray-600 sm:text-sm">orders placed</span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm">
                                    {stats.totalOrders > 0
                                        ? `${stats.completedOrders} completed, ${stats.pendingOrders} pending`
                                        : 'Start shopping to see your orders here'}
                                </p>
                            </div>

                            {/* Reviews Card */}
                            <div className="group rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-100 p-4 transition-all duration-200 hover:shadow-lg sm:rounded-xl sm:p-6">
                                <div className="mb-3 flex items-center justify-between sm:mb-4">
                                    <div className="rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110 sm:p-3">
                                        <Star className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <Star className="h-3.5 w-3.5 text-yellow-700 sm:h-4 sm:w-4" />
                                </div>
                                <h3 className="mb-1.5 text-base font-semibold text-gray-800 sm:mb-2 sm:text-lg">Reviews Given</h3>
                                <div className="flex items-baseline space-x-1.5 sm:space-x-2">
                                    <p className="text-2xl font-bold text-yellow-700 sm:text-3xl">{stats.totalReviews}</p>
                                    <span className="text-xs text-gray-600 sm:text-sm">reviews written</span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm">
                                    {stats.averageRating > 0 ? `Average rating: ${stats.averageRating}/5` : 'Share your experience with others'}
                                </p>
                            </div>

                            {/* Spending Card */}
                            <div className="group rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-4 transition-all duration-200 hover:shadow-lg sm:rounded-xl sm:p-6">
                                <div className="mb-3 flex items-center justify-between sm:mb-4">
                                    <div className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110 sm:p-3">
                                        <CreditCard className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <TrendingUp className="h-3.5 w-3.5 text-green-700 sm:h-4 sm:w-4" />
                                </div>
                                <h3 className="mb-1.5 text-base font-semibold text-gray-800 sm:mb-2 sm:text-lg">Total Spent</h3>
                                <div className="flex flex-wrap items-baseline space-x-1.5 sm:space-x-2">
                                    <p className="text-xl font-bold break-words text-green-700 sm:text-2xl lg:text-3xl">
                                        {formatPeso(stats.totalSpent)}
                                    </p>
                                    <span className="text-xs text-gray-600 sm:text-sm">lifetime</span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm">Supporting local artisans</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="mx-2 py-6 sm:mx-4 sm:py-8">
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
                            <div className="mb-4 flex items-center justify-between sm:mb-6">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Recent Activity</h2>
                                    <p className="text-sm text-gray-600 sm:text-base">Keep track of your latest shopping activities</p>
                                </div>
                                <Clock className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400 sm:h-6 sm:w-6" />
                            </div>

                            {recentActivity.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50 sm:gap-4 sm:p-4"
                                        >
                                            <div
                                                className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 sm:mt-1 sm:p-2 ${activity.type === 'order'
                                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                                                    : 'bg-gradient-to-r from-yellow-600 to-amber-600'
                                                    }`}
                                            >
                                                {activity.type === 'order' ? (
                                                    <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                                                ) : (
                                                    <Star className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold break-words text-gray-900 sm:text-base">
                                                            {activity.description}
                                                        </p>
                                                        {activity.type === 'order' && activity.status && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                Status:{' '}
                                                                <span
                                                                    className={`font-medium ${activity.status === 'completed'
                                                                        ? 'text-green-600'
                                                                        : activity.status === 'pending'
                                                                            ? 'text-yellow-600'
                                                                            : 'text-amber-600'
                                                                        }`}
                                                                >
                                                                    {activity.status}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {activity.type === 'review' && activity.rating && (
                                                            <div className="mt-1 flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-3 w-3 ${i < activity.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-shrink-0 text-left sm:text-right">
                                                        <p className="text-xs text-gray-500 sm:text-sm">{activity.date_human}</p>
                                                        {activity.amount && (
                                                            <p className="mt-0.5 text-sm font-semibold text-amber-700 sm:mt-1 sm:text-base">
                                                                {formatPeso(activity.amount)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4">
                                        <Clock className="mx-auto h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-gray-600">No Recent Activity</h3>
                                    <p className="mb-6 text-gray-500">Start shopping to see your activity here</p>
                                    <Link
                                        href="/buyer/products"
                                        className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-primary/90"
                                    >
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Start Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="mx-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:mx-4 sm:rounded-2xl sm:py-8">
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
                        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
                            {/* Recent Orders - Enhanced */}
                            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg sm:rounded-2xl lg:col-span-2">
                                <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Recent Orders</h3>
                                            <p className="text-xs text-amber-900/70 sm:text-sm">Track your recent purchases</p>
                                        </div>
                                        <Package className="ml-2 h-6 w-6 flex-shrink-0 text-amber-700 sm:h-8 sm:w-8" />
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {recentOrders.length > 0 ? (
                                        <div className="space-y-3 sm:space-y-4">
                                            {recentOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-3 transition-all duration-200 hover:border-amber-300 hover:shadow-md sm:p-4"
                                                >
                                                    <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-sm font-semibold break-words text-gray-900 sm:text-base">
                                                                Order #{order.order_number}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 sm:text-sm">From {order.seller_name}</p>
                                                        </div>
                                                        <div className="flex-shrink-0 text-left sm:text-right">
                                                            <span
                                                                className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${order.status === 'completed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : order.status === 'pending'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : order.status === 'processing'
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : order.status === 'shipped'
                                                                                ? 'bg-purple-100 text-purple-700'
                                                                                : 'bg-gray-100 text-gray-700'
                                                                    }`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{order.created_at_human}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-600 sm:mb-3 sm:gap-2 sm:text-sm">
                                                        <Package className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                                        <span>{order.items_count} item(s)</span>
                                                        <span className="mx-1 sm:mx-2">•</span>
                                                        <span className="font-semibold text-amber-700">{formatPeso(order.total_amount)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="rounded border border-amber-200 bg-white px-2 py-0.5 text-[10px] break-words text-gray-700 sm:px-3 sm:py-1 sm:text-xs"
                                                            >
                                                                {item.product_name} (x{item.quantity})
                                                            </div>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="rounded border border-amber-200 bg-white px-2 py-0.5 text-[10px] text-gray-500 sm:px-3 sm:py-1 sm:text-xs">
                                                                +{order.items.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <Link
                                                href="/buyer/orders"
                                                className="block pt-2 text-center text-sm font-medium text-amber-700 hover:text-amber-900"
                                            >
                                                View all orders →
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-amber-100 p-4">
                                                <Package className="mx-auto h-12 w-12 text-amber-700" />
                                            </div>
                                            <h4 className="mb-3 text-lg font-medium text-gray-600">No orders yet</h4>
                                            <p className="mx-auto mb-6 max-w-sm text-gray-500">
                                                Discover amazing handcrafted products from local artisans
                                            </p>
                                            <Link
                                                href="/buyer/products"
                                                className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl active:scale-[0.98]"
                                            >
                                                <ShoppingBag className="mr-2 h-5 w-5" />
                                                Browse Products
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Quick Actions */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                                            <p className="text-orange-900/70">Navigate faster</p>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-orange-700" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <Link
                                            href="/buyer/products"
                                            className="group flex w-full items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 text-amber-800 transition-all duration-200 hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md"
                                        >
                                            <div className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110">
                                                <ShoppingBag className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Browse Products</span>
                                                <p className="text-sm text-amber-700">Discover new items</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>

                                        <Link
                                            href="/buyer/orders"
                                            className="group flex w-full items-center gap-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 text-orange-800 transition-all duration-200 hover:border-orange-300 hover:from-orange-100 hover:to-amber-100 hover:shadow-md"
                                        >
                                            <div className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Track Orders</span>
                                                <p className="text-sm text-orange-700">Order status</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>

                                        <Link
                                            href="/buyer/sellers"
                                            className="group flex w-full items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 text-amber-900 transition-all duration-200 hover:border-amber-300 hover:from-yellow-100 hover:to-amber-100 hover:shadow-md"
                                        >
                                            <div className="rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 p-2 shadow-md transition-transform duration-200 group-hover:scale-110">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Find Artisans</span>
                                                <p className="text-sm text-amber-700">Local creators</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Sales Product Carousel */}
                {topSales.length > 0 && (
                    <section className="mx-4 border-t border-gray-200 bg-white py-8">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <ProductCarousel
                                title="Best Sellers"
                                subtitle="Most purchased products"
                                products={topSales}
                                badge="best-seller"
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                                viewAllLink="/products?sort=sales"
                            />
                        </div>
                    </section>
                )}

                {/* Enhanced Recommendations & Promotions */}
                <section className="mx-4 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Recommendations */}
                            <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                                <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                                            <p className="text-amber-900/70">Personalized picks</p>
                                        </div>
                                        <Star className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="py-8 text-center">
                                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 p-4">
                                            <Star className="mx-auto h-8 w-8 text-amber-700" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-700">Discover Your Style</h3>
                                        <p className="mb-6 text-sm text-gray-500">
                                            Shop more to get personalized recommendations based on your preferences
                                        </p>
                                        <div className="space-y-3">
                                            <Link
                                                href="/buyer/products"
                                                className="block w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-amber-700 hover:to-orange-700 hover:shadow-md"
                                            >
                                                Explore Products
                                            </Link>
                                            <Link
                                                href="/buyer/products"
                                                className="block w-full rounded-lg border-2 border-amber-300 px-4 py-3 font-semibold text-amber-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50"
                                            >
                                                Browse Categories
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications & Updates */}
                            <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
                                <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Updates & Offers</h2>
                                            <p className="text-orange-900/70">Latest news</p>
                                        </div>
                                        <div className="relative">
                                            <Bell className="h-6 w-6 text-orange-600" />
                                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs text-white"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-green-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Welcome Bonus!</p>
                                                    <p className="text-sm text-green-700">Get 10% off your first purchase from any local artisan</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-amber-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-amber-900">New Artisans Joined!</p>
                                                    <p className="text-sm text-amber-700">5 new local creators added this week</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-orange-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-orange-900">Seasonal Collection</p>
                                                    <p className="text-sm text-orange-700">Check out our spring handcraft collection</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href="/buyer/notifications"
                                            className="block pt-2 text-center text-sm font-medium text-amber-700 hover:text-amber-900"
                                        >
                                            View all notifications →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

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
                        seller: { id: modalProduct.seller_id || 0, name: modalProduct.artisan },
                    }}
                    onAddToCart={handleModalAddToCart}
                    onBuyNow={handleModalBuyNow}
                />
            )}

            {/* Toast Notification */}
            {showToast && (
                <Toast message={toastMessage} type={toastMessage.includes('✅') ? 'success' : 'error'} onClose={() => setShowToast(false)} />
            )}
        </BuyerLayout>
    );
}
