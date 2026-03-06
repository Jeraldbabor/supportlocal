import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Product as GlobalProduct } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Star } from 'lucide-react';
import React, { useState } from 'react';
import AddToCartModal from '../../../components/AddToCartModal';
import ProductCard from '../../../components/ProductCard';
import SearchAutocomplete from '../../../components/SearchAutocomplete';
import Toast from '../../../components/Toast';
import { useCart } from '../../../contexts/CartContext';
import BuyerLayout from '../../../layouts/BuyerLayout';

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
        avatar_url?: string;
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

interface ProductsIndexProps {
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

export default function Index({
    products,
    categories = [],
    sellers = [],
    locations = [],
    wishlistProductIds = [],
    filters = {},
}: ProductsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
    const [showMoreRatings, setShowMoreRatings] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const productList = React.useMemo(() => products?.data || [], [products?.data]);
    const currentSort = filters?.sort || 'popular';

    // Auto-looping banner state
    const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
    const highlightBanners = React.useMemo(() => {
        if (!productList || productList.length === 0) return [];
        const isOutOfStockCheck = (p: Product) => p.stock_status === 'out_of_stock' || p.stock_quantity === 0;
        return [
            {
                title: '🔥 Trending Now',
                product: [...productList.filter((p) => !isOutOfStockCheck(p))].sort(
                    (a, b) => (b.view_count || b.average_rating || 0) - (a.view_count || a.average_rating || 0),
                )[0],
                bg: 'bg-gradient-to-br from-orange-500 to-red-500',
                border: 'border-orange-400/30',
            },
            {
                title: '👑 Most Sales',
                product: [...productList.filter((p) => !isOutOfStockCheck(p))].sort(
                    (a, b) => (b.monthly_sales || b.order_count || 0) - (a.monthly_sales || a.order_count || 0),
                )[0],
                bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
                border: 'border-blue-400/30',
            },
            {
                title: '💸 Top Discount',
                product: [...productList.filter((p) => !isOutOfStockCheck(p))].sort((a, b) => {
                    const getVal = (p: Product) => (p.compare_price && p.compare_price > p.price ? (p.compare_price - p.price) / p.compare_price : 0);
                    return getVal(b) - getVal(a);
                })[0],
                bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
                border: 'border-emerald-400/30',
            },
        ].filter((b) => b.product);
    }, [productList]);

    React.useEffect(() => {
        if (highlightBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % highlightBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [highlightBanners.length]);
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);

    // Determine if price sorting is active and which direction
    const isPriceSortActive = currentSort === 'price-low' || currentSort === 'price-high';
    const priceSortDirection = currentSort === 'price-low' ? 'low' : currentSort === 'price-high' ? 'high' : null;

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        router.get('/buyer/products', { ...filters, search: term }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | null) => {
        const newFilters = { ...filters, [key]: value };
        Object.keys(newFilters).forEach((k) => {
            if (!newFilters[k as keyof typeof newFilters]) {
                delete newFilters[k as keyof typeof newFilters];
            }
        });
        router.get('/buyer/products', newFilters, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        setShowPriceDropdown(false);
        router.get('/buyer/products', { ...filters, sort }, { preserveState: true });
    };

    const handlePriceFilter = () => {
        const newFilters: Record<string, string | number | boolean | null> = { ...filters };
        if (minPrice) newFilters.min_price = minPrice;
        if (maxPrice) newFilters.max_price = maxPrice;
        if (!minPrice) delete newFilters.min_price;
        if (!maxPrice) delete newFilters.max_price;
        router.get('/buyer/products', newFilters, { preserveState: true });
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
        router.get('/buyer/products', { sort: currentSort }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/buyer/product/${productId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        setModalProduct(product);
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) return;

        router.visit(`/buyer/checkout?buy_now=true&product_id=${product.id}&quantity=1`);
    };

    const handleModalAddToCart = async (quantity: number) => {
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
            await addToCart(cartProduct, quantity);
            setIsModalOpen(false);
            setToastMessage(`✅ ${quantity} × ${modalProduct.name} added to cart successfully!`);
            setShowToast(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToastMessage('❌ Failed to add item to cart. Please try again.');
            setShowToast(true);
        }
    };

    const displayedLocations = showMoreLocations ? locations : locations.slice(0, 4);
    const displayedSellers = showMoreSellers ? sellers : sellers.slice(0, 4);

    // Render filter content (used in both desktop sidebar and mobile sheet)
    const renderFilterContent = () => (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">SEARCH FILTER</h2>
                {(selectedLocation ||
                    selectedSeller ||
                    selectedCategory ||
                    minPrice ||
                    maxPrice ||
                    freeShippingOnly ||
                    codOnly ||
                    selectedRating) && (
                    <button
                        onClick={() => {
                            clearFilters();
                            setIsFilterOpen(false);
                        }}
                        className="text-xs text-orange-500 hover:text-orange-600"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Category</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={!selectedCategory}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedCategory(null);
                                    handleFilter('category', null);
                                }
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedCategory === category.id.toString()}
                                onChange={(e) => {
                                    const value = e.target.checked ? category.id.toString() : null;
                                    setSelectedCategory(value);
                                    handleFilter('category', value);
                                }}
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">
                                {category.name}
                                {category.products_count !== undefined && (
                                    <span className="ml-1 text-xs text-gray-500">({category.products_count})</span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Shipped From */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Shipped From</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedLocation === 'domestic'}
                            onChange={(e) => {
                                const value = e.target.checked ? 'domestic' : null;
                                setSelectedLocation(value);
                                handleFilter('location', value);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Domestic</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedLocation === 'metro_manila'}
                            onChange={(e) => {
                                const value = e.target.checked ? 'metro_manila' : null;
                                setSelectedLocation(value);
                                handleFilter('location', value);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Metro Manila</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedLocation === 'north_luzon'}
                            onChange={(e) => {
                                const value = e.target.checked ? 'north_luzon' : null;
                                setSelectedLocation(value);
                                handleFilter('location', value);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">North Luzon</span>
                    </label>
                    {displayedLocations.length > 0 && (
                        <>
                            {displayedLocations.map((location) => (
                                <label key={location} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedLocation === location}
                                        onChange={(e) => {
                                            const value = e.target.checked ? location : null;
                                            setSelectedLocation(value);
                                            handleFilter('location', value);
                                        }}
                                        className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">{location}</span>
                                </label>
                            ))}
                            {locations.length > 4 && (
                                <button
                                    onClick={() => setShowMoreLocations(!showMoreLocations)}
                                    className="mt-1 flex items-center text-xs text-gray-600 hover:text-orange-500"
                                >
                                    {showMoreLocations ? 'Show Less' : 'More'} <ChevronDown className="ml-1 h-3 w-3" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Brand/Seller */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Brand</h3>
                <div className="space-y-2">
                    {displayedSellers.map((seller) => (
                        <label key={seller.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedSeller === seller.id.toString()}
                                onChange={(e) => {
                                    const value = e.target.checked ? seller.id.toString() : null;
                                    setSelectedSeller(value);
                                    handleFilter('seller', value);
                                }}
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{seller.name}</span>
                        </label>
                    ))}
                    {sellers.length > 4 && (
                        <button
                            onClick={() => setShowMoreSellers(!showMoreSellers)}
                            className="mt-1 flex items-center text-xs text-gray-600 hover:text-orange-500"
                        >
                            {showMoreSellers ? 'Show Less' : 'More'} <ChevronDown className="ml-1 h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Rating</h3>
                <div className="space-y-2">
                    {/* 5 Stars */}
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === '5'}
                            onChange={() => {
                                const value = selectedRating === '5' ? null : '5';
                                setSelectedRating(value);
                                handleFilter('min_rating', value);
                            }}
                            className="mr-2 h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                    </label>

                    {/* 4 Stars & Up */}
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === '4'}
                            onChange={() => {
                                const value = selectedRating === '4' ? null : '4';
                                setSelectedRating(value);
                                handleFilter('min_rating', value);
                            }}
                            className="mr-2 h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                            {[...Array(4)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(1)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                            <span className="ml-1 text-sm text-gray-700">& Up</span>
                        </div>
                    </label>

                    {/* 3 Stars & Up */}
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === '3'}
                            onChange={() => {
                                const value = selectedRating === '3' ? null : '3';
                                setSelectedRating(value);
                                handleFilter('min_rating', value);
                            }}
                            className="mr-2 h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(2)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                            <span className="ml-1 text-sm text-gray-700">& Up</span>
                        </div>
                    </label>

                    {/* 2 Stars & Up */}
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === '2'}
                            onChange={() => {
                                const value = selectedRating === '2' ? null : '2';
                                setSelectedRating(value);
                                handleFilter('min_rating', value);
                            }}
                            className="mr-2 h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                            {[...Array(2)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                            <span className="ml-1 text-sm text-gray-700">& Up</span>
                        </div>
                    </label>

                    {/* More ratings (1 Star & Up) - shown when expanded */}
                    {showMoreRatings && (
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="rating"
                                checked={selectedRating === '1'}
                                onChange={() => {
                                    const value = selectedRating === '1' ? null : '1';
                                    setSelectedRating(value);
                                    handleFilter('min_rating', value);
                                }}
                                className="mr-2 h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <div className="flex items-center gap-1">
                                {[...Array(1)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                {[...Array(4)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-gray-300" />
                                ))}
                                <span className="ml-1 text-sm text-gray-700">& Up</span>
                            </div>
                        </label>
                    )}

                    {/* More/Less toggle */}
                    <button
                        onClick={() => setShowMoreRatings(!showMoreRatings)}
                        className="mt-1 flex items-center text-xs text-gray-600 hover:text-orange-500"
                    >
                        {showMoreRatings ? 'Show Less' : 'More'}{' '}
                        <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showMoreRatings ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Shops & Promos */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Shops & Promos</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={freeShippingOnly}
                            onChange={(e) => {
                                const value = e.target.checked;
                                setFreeShippingOnly(value);
                                handleFilter('free_shipping', value ? 'true' : null);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Free Shipping</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={codOnly}
                            onChange={(e) => {
                                const value = e.target.checked;
                                setCodOnly(value);
                                handleFilter('cod', value ? 'true' : null);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Cash on Delivery (COD)</span>
                    </label>
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Price Range</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => {
                            handlePriceFilter();
                            setIsFilterOpen(false);
                        }}
                        className="w-full rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <BuyerLayout>
            <Head title="Browse Products" />

            <div className="mx-auto max-w-7xl px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-6 lg:px-8">
                {/* Highlight Banners Carousel */}
                {highlightBanners.length > 0 && (
                    <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200">
                        <div
                            className="flex w-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                        >
                            {highlightBanners.map((banner, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleProductClick(banner.product.id)}
                                    className={`relative min-w-full flex-none overflow-hidden ${banner.bg} cursor-pointer p-4 text-white sm:p-8`}
                                >
                                    <div className="relative z-10 mx-auto flex h-full max-w-4xl items-center justify-between gap-3 sm:gap-8">
                                        <div className="flex flex-1 flex-col truncate pr-1 sm:pr-0">
                                            <span className="mb-1 inline-flex w-fit items-center rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm ring-1 ring-white/30 backdrop-blur-md sm:mb-2 sm:px-2.5 sm:py-1 sm:text-xs">
                                                {banner.title}
                                            </span>
                                            <h4 className="mb-1.5 line-clamp-2 text-base leading-tight font-extrabold drop-shadow-md sm:mb-3 sm:text-3xl">
                                                {banner.product.name}
                                            </h4>
                                            <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                                <span className="text-base font-bold drop-shadow-md sm:text-2xl">
                                                    ₱{Number(banner.product.price).toLocaleString()}
                                                </span>
                                                {banner.product.compare_price && banner.product.compare_price > banner.product.price && (
                                                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md sm:px-2 sm:py-1 sm:text-sm">
                                                        -
                                                        {Math.round(
                                                            ((banner.product.compare_price - banner.product.price) / banner.product.compare_price) *
                                                                100,
                                                        )}
                                                        %
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-xl ring-2 ring-white/20 sm:h-40 sm:w-40 sm:rounded-2xl sm:shadow-2xl">
                                            <img
                                                src={banner.product.primary_image || banner.product.image || '/placeholder.svg'}
                                                alt={banner.product.name}
                                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                    {/* Decorative background effects */}
                                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-[50px]"></div>
                                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-[50px]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Bar with Autocomplete */}
                <div className="mb-3 sm:mb-4 md:mb-6">
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
                                {(selectedLocation || selectedSeller || selectedCategory || minPrice || maxPrice || freeShippingOnly || codOnly) && (
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

                <div className="flex gap-4 sm:gap-6">
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
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                                                            currentSort === 'price-low'
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
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                                                            currentSort === 'price-high'
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
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs text-gray-600 sm:text-sm">
                                        {products.current_page}/{products.last_page}
                                    </span>
                                    <div className="flex gap-0.5 sm:gap-1">
                                        <Link
                                            href={products.links.find((l) => l.label === '&laquo; Previous')?.url || '#'}
                                            className={`rounded px-1.5 py-1 text-xs sm:px-2 sm:text-sm ${
                                                products.current_page === 1
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </Link>
                                        <Link
                                            href={products.links.find((l) => l.label === 'Next &raquo;')?.url || '#'}
                                            className={`rounded px-1.5 py-1 text-xs sm:px-2 sm:text-sm ${
                                                products.current_page === products.last_page
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                                            artisan_image: product.seller?.avatar_url || null,
                                            rating: Number(product.average_rating) || 0,
                                            review_count: product.review_count,
                                            category: typeof product.category === 'object' ? product.category?.name : product.category,
                                            order_count: product.monthly_sales ?? product.order_count,
                                        };

                                        return (
                                            <div
                                                key={product.id}
                                                className="h-full animate-[fade-in-up_0.5s_ease-out_forwards] opacity-0"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <ProductCard
                                                    product={cardProduct}
                                                    isInWishlist={wishlistProductIds.includes(product.id)}
                                                    onAddToCart={(e: React.MouseEvent) => handleAddToCart(e, product)}
                                                    onBuyNow={(e: React.MouseEvent) => handleBuyNow(e, product)}
                                                    badge={product.free_shipping ? 'trending' : null}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Pagination */}
                                {products && products.last_page > 1 && (
                                    <div className="mt-4 flex justify-center sm:mt-6">
                                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                            {products.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-md px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${
                                                        link.active ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                product={modalProduct as any}
                onAddToCart={handleModalAddToCart}
            />
        </BuyerLayout>
    );
}
