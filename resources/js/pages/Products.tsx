import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Product as GlobalProduct } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Filter, ShoppingCart, Star, Check } from 'lucide-react';
import React, { useState } from 'react';
import AddToCartModal from '../components/AddToCartModal';
import AuthRequiredModal from '../components/AuthRequiredModal';
import SearchAutocomplete from '../components/SearchAutocomplete';
import Toast from '../components/Toast';
import WishlistButton from '../components/WishlistButton';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import MainLayout from '../layouts/MainLayout';

interface Product {
    id: number;
    name: string;
    price: number;
    compare_price?: number | null;
    primary_image?: string;
    image?: string;
    seller?: {
        id: number;
        name: string;
    };
    category?:
    | {
        id: number;
        name: string;
    }
    | string
    | null;
    average_rating?: number | null;
    review_count?: number;
    order_count?: number;
    monthly_sales?: number;
    stock_status?: string;
    stock_quantity?: number;
    view_count?: number;
    quantity?: number;
    location?: string | null;
    free_shipping?: boolean;
}

interface Category {
    id: number;
    name: string;
    products_count?: number;
}

interface Seller {
    id: number;
    name: string;
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
    sellers?: Seller[];
    locations?: string[];
    wishlistProductIds?: number[];
    filters?: {
        category?: string;
        search?: string;
        min_price?: number;
        max_price?: number;
        location?: string;
        seller?: string;
        free_shipping?: string;
        cod?: string;
        min_rating?: string;
        sort?: string;
        direction?: string;
    };
}

export default function Products({ products, categories = [], sellers = [], locations = [], wishlistProductIds = [], filters = {} }: ProductsProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const { addToCart, isLoading } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalAction, setAuthModalAction] = useState<'cart' | 'buy'>('cart');
    const [authModalProduct, setAuthModalProduct] = useState<string>('');
    const { auth } = usePage<{ auth: { user?: { id: number; role: string } } }>().props;
    const isAuthenticated = !!auth?.user;

    // Filter state
    const [showMoreLocations, setShowMoreLocations] = useState(false);
    const [showMoreSellers, setShowMoreSellers] = useState(false);
    const [minPrice, setMinPrice] = useState(filters?.min_price?.toString() || '');
    const [maxPrice, setMaxPrice] = useState(filters?.max_price?.toString() || '');
    const [selectedLocation, setSelectedLocation] = useState<string | null>(filters?.location || null);
    const [selectedSeller, setSelectedSeller] = useState<string | null>(filters?.seller || null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(filters?.category || null);
    const [freeShippingOnly, setFreeShippingOnly] = useState<boolean>(filters?.free_shipping === 'true');
    const [codOnly, setCodOnly] = useState<boolean>(filters?.cod === 'true');
    const [selectedRating, setSelectedRating] = useState<string | null>(filters?.min_rating || null);

    const productList = products?.data || [];
    const currentSort = filters?.sort || 'popular';

    // Auto-looping banner state
    const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
    const highlightBanners = React.useMemo(() => {
        if (!productList || productList.length === 0) return [];
        const isOutOfStockCheck = (p: Product) => p.stock_status === 'out_of_stock' || p.stock_quantity === 0;
        return [
            {
                title: '🔥 Trending Now',
                product: [...productList.filter(p => !isOutOfStockCheck(p))].sort((a, b) => (b.view_count || b.average_rating || 0) - (a.view_count || a.average_rating || 0))[0],
                bg: 'bg-gradient-to-br from-orange-500 to-red-500',
                border: 'border-orange-400/30'
            },
            {
                title: '👑 Most Sales',
                product: [...productList.filter(p => !isOutOfStockCheck(p))].sort((a, b) => (b.monthly_sales || b.order_count || 0) - (a.monthly_sales || a.order_count || 0))[0],
                bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
                border: 'border-blue-400/30'
            },
            {
                title: '💸 Top Discount',
                product: [...productList.filter(p => !isOutOfStockCheck(p))].sort((a, b) => {
                    const getVal = (p: any) => p.compare_price && p.compare_price > p.price ? (p.compare_price - p.price) / p.compare_price : 0;
                    return getVal(b) - getVal(a);
                })[0],
                bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
                border: 'border-emerald-400/30'
            }
        ].filter(b => b.product);
    }, [productList]);

    React.useEffect(() => {
        if (highlightBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % highlightBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [highlightBanners.length]);
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);

    // Determine if price sorting is active and which direction
    const isPriceSortActive = currentSort === 'price-low' || currentSort === 'price-high';
    const priceSortDirection = currentSort === 'price-low' ? 'low' : currentSort === 'price-high' ? 'high' : null;

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        router.get('/products', { ...filters, search: term }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | null) => {
        const newFilters = { ...filters, [key]: value };
        // Remove null/empty filters
        Object.keys(newFilters).forEach((k) => {
            if (!newFilters[k as keyof typeof newFilters]) {
                delete newFilters[k as keyof typeof newFilters];
            }
        });
        router.get('/products', newFilters, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        setShowPriceDropdown(false);
        router.get('/products', { ...filters, sort }, { preserveState: true });
    };

    const handlePriceFilter = () => {
        const newFilters: Record<string, string | number | boolean | null> = { ...filters };
        if (minPrice) newFilters.min_price = minPrice;
        if (maxPrice) newFilters.max_price = maxPrice;
        if (!minPrice) delete newFilters.min_price;
        if (!maxPrice) delete newFilters.max_price;
        router.get('/products', newFilters, { preserveState: true });
    };

    const clearFilters = () => {
        setSelectedLocation(null);
        setSelectedSeller(null);
        setSelectedCategory(null);
        setMinPrice('');
        setMaxPrice('');
        setFreeShippingOnly(false);
        setCodOnly(false);
        setSelectedRating(null);
        router.get('/products', { sort: currentSort }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/product/${productId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        if (isAuthenticated) {
            setToastMessage('⚠️ Please use the buyer cart from your dashboard.');
            setShowToast(true);
            setTimeout(() => {
                router.visit('/buyer/products');
            }, 1500);
            return;
        }

        setModalProduct(product);
        setModalMode('cart');
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        if (!isAuthenticated) {
            setAuthModalAction('buy');
            setAuthModalProduct(product.name);
            setShowAuthModal(true);
            return;
        }

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
                name: 'Unknown Seller',
            },
        };

        try {
            addToCart(cartProduct, quantity);
            setIsModalOpen(false);
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
                name: 'Unknown Seller',
            },
        };

        try {
            addToCart(cartProduct, quantity);
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

    const discountPercentage = (product: Product) => {
        if (product.compare_price && product.compare_price > product.price) {
            return Math.round(((product.compare_price - product.price) / product.compare_price) * 100);
        }
        return null;
    };

    const formatSalesCount = (count?: number) => {
        if (!count || count === 0) return null;
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K+`;
        }
        return `${count}+`;
    };

    const displayedLocations = showMoreLocations ? locations : locations.slice(0, 4);
    const displayedSellers = showMoreSellers ? sellers : sellers.slice(0, 4);

    // Render filter content (reusable for both mobile drawer and desktop sidebar)
    const renderFilterContent = () => (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-950/5">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
                {(selectedLocation ||
                    selectedSeller ||
                    selectedCategory ||
                    minPrice ||
                    maxPrice ||
                    freeShippingOnly ||
                    codOnly ||
                    selectedRating) && (
                        <button onClick={clearFilters} className="text-xs font-semibold text-orange-500 transition-colors hover:text-orange-600">
                            Clear all
                        </button>
                    )}
            </div>

            {/* Category Filter - Pills */}
            <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Category</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            handleFilter('category', null);
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${!selectedCategory ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category.id.toString();
                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    const value = isSelected ? null : category.id.toString();
                                    setSelectedCategory(value);
                                    handleFilter('category', value);
                                }}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${isSelected ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                {category.name}
                                {category.products_count !== undefined && (
                                    <span className="ml-1.5 opacity-60">{category.products_count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Shipped From - Custom Checkboxes */}
            <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Shipped From</h3>
                <div className="space-y-2.5">
                    {['domestic', 'metro_manila', 'north_luzon'].map(loc => {
                        const labels = {
                            domestic: 'Domestic',
                            metro_manila: 'Metro Manila',
                            north_luzon: 'North Luzon'
                        };
                        const isSelected = selectedLocation === loc;
                        return (
                            <label key={loc} className="group flex cursor-pointer items-center gap-3">
                                <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white group-hover:border-orange-400'}`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const value = e.target.checked ? loc : null;
                                        setSelectedLocation(value);
                                        handleFilter('location', value);
                                    }}
                                />
                                <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">{labels[loc as keyof typeof labels]}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Brand/Seller */}
            <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Brand</h3>
                <div className="space-y-2.5">
                    {displayedSellers.map((seller) => {
                        const isSelected = selectedSeller === seller.id.toString();
                        return (
                            <label key={seller.id} className="group flex cursor-pointer items-center gap-3">
                                <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white group-hover:border-orange-400'}`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const value = e.target.checked ? seller.id.toString() : null;
                                        setSelectedSeller(value);
                                        handleFilter('seller', value);
                                    }}
                                />
                                <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">{seller.name}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Shops & Promos */}
            <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Shops & Promos</h3>
                <div className="space-y-2.5">
                    {[
                        { id: 'free_shipping', label: 'Free Shipping', state: freeShippingOnly, setter: setFreeShippingOnly },
                        { id: 'cod', label: 'Cash on Delivery (COD)', state: codOnly, setter: setCodOnly }
                    ].map(promo => (
                        <label key={promo.id} className="group flex cursor-pointer items-center gap-3">
                            <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${promo.state ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white group-hover:border-orange-400'}`}>
                                {promo.state && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={promo.state}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    promo.setter(value);
                                    handleFilter(promo.id, value ? 'true' : null);
                                }}
                            />
                            <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">{promo.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Rating</h3>
                <div className="space-y-2.5">
                    {[
                        { val: '5', label: '5 Stars' },
                        { val: '4', label: '4 Stars & Up' },
                        { val: '3', label: '3 Stars & Up' }
                    ].map(rating => {
                        const isSelected = selectedRating === rating.val;
                        return (
                            <label key={rating.val} className="group flex cursor-pointer items-center gap-3">
                                <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white group-hover:border-orange-400'}`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const value = e.target.checked ? rating.val : null;
                                        setSelectedRating(value);
                                        handleFilter('min_rating', value);
                                    }}
                                />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3.5 w-3.5 ${i < parseInt(rating.val) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                    {rating.val !== '5' && <span className="ml-1 text-sm text-gray-600 transition-colors group-hover:text-gray-900">&amp; Up</span>}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Price Range</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₱</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full rounded-lg border-gray-300 pl-7 pr-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                        <div className="h-px w-3 bg-gray-300"></div>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₱</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full rounded-lg border-gray-300 pl-7 pr-3 py-2 text-sm transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handlePriceFilter}
                        className="w-full rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 active:bg-orange-200"
                    >
                        Apply Price Range
                    </button>
                </div>
            </div>
        </div>
    );

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <MainLayout>
            <Head title="Browse Products" />

            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
                {/* Highlight Banners Carousel */}
                {highlightBanners.length > 0 && (
                    <div className="mb-6 overflow-hidden rounded-2xl relative shadow-lg ring-1 ring-gray-200">
                        <div
                            className="flex w-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                        >
                            {highlightBanners.map((banner, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleProductClick(banner.product.id)}
                                    className={`relative min-w-full flex-none overflow-hidden ${banner.bg} p-4 sm:p-8 text-white cursor-pointer`}
                                >
                                    <div className="flex h-full items-center justify-between gap-3 sm:gap-8 mx-auto max-w-4xl relative z-10">
                                        <div className="flex flex-1 flex-col w-[65%] sm:w-[70%]">
                                            <span className="mb-1.5 sm:mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ring-1 ring-white/30">
                                                {banner.title}
                                            </span>
                                            <h4 className="mb-2 sm:mb-3 line-clamp-2 text-lg sm:text-3xl font-extrabold leading-tight drop-shadow-md">{banner.product.name}</h4>
                                            <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                                <span className="text-lg sm:text-2xl font-bold drop-shadow-md">₱{Number(banner.product.price).toLocaleString()}</span>
                                                {banner.product.compare_price && banner.product.compare_price > banner.product.price && (
                                                    <span className="rounded backdrop-blur-md bg-white/20 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold text-white shadow-sm ring-1 ring-white/30">
                                                        -{Math.round(((banner.product.compare_price - banner.product.price) / banner.product.compare_price) * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative h-24 w-24 sm:h-40 sm:w-40 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 shadow-xl sm:shadow-2xl ring-2 ring-white/20">
                                            <img src={banner.product.primary_image || banner.product.image || '/placeholder.svg'} alt={banner.product.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                                        </div>
                                    </div>
                                    {/* Decorative background effects */}
                                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-[50px]"></div>
                                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-[50px]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Bar with Autocomplete */}
                <div className="mb-4 sm:mb-6">
                    <SearchAutocomplete
                        type="products"
                        placeholder="Search products, categories, or sellers..."
                        initialValue={searchTerm}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Mobile Filter Button */}
                <div className="mb-2 flex items-center justify-between sm:mb-3 md:mb-4 lg:hidden">
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Filters
                                {(selectedLocation ||
                                    selectedSeller ||
                                    selectedCategory ||
                                    minPrice ||
                                    maxPrice ||
                                    freeShippingOnly ||
                                    codOnly) && (
                                        <span className="ml-1 rounded-full bg-orange-500 px-1 py-0.5 text-[10px] font-semibold text-white sm:px-1.5 sm:text-xs">
                                            {
                                                [
                                                    selectedLocation,
                                                    selectedSeller,
                                                    selectedCategory,
                                                    minPrice,
                                                    maxPrice,
                                                    freeShippingOnly,
                                                    codOnly,
                                                    selectedRating,
                                                ].filter(Boolean).length
                                            }
                                        </span>
                                    )}
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="text-lg font-bold text-gray-900">SEARCH FILTER</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Filter products by category, location, seller, rating, price, and more
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-4">{renderFilterContent()}</div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex gap-3 sm:gap-4 md:gap-6">
                    {/* Left Sidebar - Filters (Desktop) */}
                    <div className="hidden w-64 flex-shrink-0 lg:block">{renderFilterContent()}</div>

                    {/* Right Content Area */}
                    <div className="min-w-0 flex-1">
                        {/* Banners Moved to Top Carousel */}

                        {/* Sorting Bar */}
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-500">Sort by</span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => handleSort('popular')}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${currentSort === 'popular' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        Popular
                                    </button>
                                    <button
                                        onClick={() => handleSort('latest')}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${currentSort === 'latest' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        Latest
                                    </button>
                                    <button
                                        onClick={() => handleSort('top_sales')}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${currentSort === 'top_sales' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        Top Sales
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${isPriceSortActive ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                        >
                                            Price
                                            {isPriceSortActive && (
                                                <span className="ml-0.5">
                                                    {priceSortDirection === 'low' ? (
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    )}
                                                </span>
                                            )}
                                            {!isPriceSortActive && <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                                        </button>

                                        {/* Price Dropdown */}
                                        {showPriceDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowPriceDropdown(false)} />
                                                <div className="absolute top-full left-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5">
                                                    <button
                                                        onClick={() => {
                                                            handleSort('price-low');
                                                            setShowPriceDropdown(false);
                                                        }}
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${currentSort === 'price-low'
                                                            ? 'bg-orange-50/50 font-medium text-orange-600'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span>Low to High</span>
                                                        {currentSort === 'price-low' && <Check className="h-4 w-4 text-orange-500" />}
                                                    </button>
                                                    <div className="h-px w-full bg-gray-50" />
                                                    <button
                                                        onClick={() => {
                                                            handleSort('price-high');
                                                            setShowPriceDropdown(false);
                                                        }}
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${currentSort === 'price-high'
                                                            ? 'bg-orange-50/50 font-medium text-orange-600'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span>High to Low</span>
                                                        {currentSort === 'price-high' && <Check className="h-4 w-4 text-orange-500" />}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Pagination Info */}
                            {products && products.last_page > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        {products.current_page}/{products.last_page}
                                    </span>
                                    <div className="flex gap-1">
                                        <Link
                                            href={products.links.find((l) => l.label === '&laquo; Previous')?.url || '#'}
                                            className={`rounded px-2 py-1 text-sm ${products.current_page === 1
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={products.links.find((l) => l.label === 'Next &raquo;')?.url || '#'}
                                            className={`rounded px-2 py-1 text-sm ${products.current_page === products.last_page
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Grid */}
                        {productList.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {productList.map((product, index) => {
                                        // Format product for ProductCard
                                        const cardProduct = {
                                            id: product.id,
                                            name: product.name,
                                            price: Number(product.price),
                                            compare_price: product.compare_price ? Number(product.compare_price) : null,
                                            image: product.primary_image || product.image || '/placeholder.svg',
                                            artisan: product.seller?.name || 'Unknown',
                                            rating: Number(product.average_rating) || 0,
                                            review_count: product.review_count,
                                            category: typeof product.category === 'object' ? product.category?.name : product.category,
                                            order_count: product.monthly_sales ?? product.order_count,
                                        };

                                        return (
                                            <div
                                                key={product.id}
                                                className="h-full opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <ProductCard
                                                    product={cardProduct}
                                                    isInWishlist={wishlistProductIds.includes(product.id)}
                                                    onAddToCart={(e) => handleAddToCart(e, product)}
                                                    onBuyNow={(e) => handleBuyNow(e, product)}
                                                    badge={product.free_shipping ? 'trending' : null}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Pagination */}
                                {products && products.last_page > 1 && (
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex gap-2">
                                            {products.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-md px-3 py-2 text-sm ${link.active ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
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
                                <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
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
