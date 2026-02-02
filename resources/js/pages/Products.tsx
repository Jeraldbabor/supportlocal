import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Product as GlobalProduct } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Filter, ShoppingCart, Star } from 'lucide-react';
import React, { useState } from 'react';
import AddToCartModal from '../components/AddToCartModal';
import AuthRequiredModal from '../components/AuthRequiredModal';
import SearchAutocomplete from '../components/SearchAutocomplete';
import Toast from '../components/Toast';
import WishlistButton from '../components/WishlistButton';
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
    const [showMoreRatings, setShowMoreRatings] = useState(false);

    const productList = products?.data || [];
    const currentSort = filters?.sort || 'popular';
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
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
                    <button onClick={clearFilters} className="text-xs text-orange-500 hover:text-orange-600">
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
                        onClick={handlePriceFilter}
                        className="w-full rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        Apply
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
                                    codOnly ||
                                    selectedRating) && (
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
                        {/* Sorting Bar */}
                        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2 py-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                            <div className="scrollbar-hide -mx-2 flex items-center gap-1.5 overflow-x-auto px-2 sm:mx-0 sm:gap-2 sm:px-0">
                                <span className="flex-shrink-0 text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">Sort by:</span>
                                <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => handleSort('popular')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'popular' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Popular
                                    </button>
                                    <button
                                        onClick={() => handleSort('latest')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'latest' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Latest
                                    </button>
                                    <button
                                        onClick={() => handleSort('top_sales')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'top_sales' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Top Sales
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                                            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                                isPriceSortActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Price
                                            {isPriceSortActive && (
                                                <span className="ml-1">
                                                    {priceSortDirection === 'low' ? (
                                                        <ArrowUp className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDown className="h-3 w-3" />
                                                    )}
                                                </span>
                                            )}
                                            {!isPriceSortActive && <ChevronDown className="h-3 w-3" />}
                                        </button>

                                        {/* Price Dropdown */}
                                        {showPriceDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowPriceDropdown(false)} />
                                                <div className="absolute top-full left-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                                                    <button
                                                        onClick={() => {
                                                            handleSort('price-low');
                                                            setShowPriceDropdown(false);
                                                        }}
                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg ${
                                                            currentSort === 'price-low'
                                                                ? 'bg-orange-50 font-medium text-orange-600'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>Price: Low to High</span>
                                                        {currentSort === 'price-low' && <ArrowUp className="h-4 w-4 text-orange-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleSort('price-high');
                                                            setShowPriceDropdown(false);
                                                        }}
                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors last:rounded-b-lg ${
                                                            currentSort === 'price-high'
                                                                ? 'bg-orange-50 font-medium text-orange-600'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>Price: High to Low</span>
                                                        {currentSort === 'price-high' && <ArrowDown className="h-4 w-4 text-orange-600" />}
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
                                            className={`rounded px-2 py-1 text-sm ${
                                                products.current_page === 1
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={products.links.find((l) => l.label === 'Next &raquo;')?.url || '#'}
                                            className={`rounded px-2 py-1 text-sm ${
                                                products.current_page === products.last_page
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
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                                    {productList.map((product) => {
                                        const discount = discountPercentage(product);
                                        // Use monthly_sales if available, otherwise fall back to order_count
                                        const salesCount = formatSalesCount(product.monthly_sales ?? product.order_count);
                                        const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

                                        return (
                                            <div
                                                key={product.id}
                                                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-orange-300 hover:shadow-lg"
                                                onClick={() => handleProductClick(product.id)}
                                            >
                                                {/* Product Image */}
                                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                    {product.primary_image || product.image ? (
                                                        <img
                                                            src={product.primary_image || product.image}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = '/placeholder.svg';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                            <span className="text-gray-400">No Image</span>
                                                        </div>
                                                    )}

                                                    {/* Product Badges */}
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                        {discount && (
                                                            <div className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-md">
                                                                -{discount}%
                                                            </div>
                                                        )}
                                                        {product.free_shipping && (
                                                            <div className="rounded bg-blue-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-md">
                                                                FREE SHIPPING
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Wishlist Button */}
                                                    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                        <WishlistButton
                                                            productId={product.id}
                                                            initialInWishlist={wishlistProductIds.includes(product.id)}
                                                            variant="icon-filled"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex flex-1 flex-col p-3">
                                                    {/* Store Name */}
                                                    {product.seller && <div className="mb-1 text-xs text-gray-500">{product.seller.name}</div>}

                                                    {/* Product Title */}
                                                    <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900 group-hover:text-orange-600">
                                                        {product.name}
                                                    </h3>

                                                    {/* Price */}
                                                    <div className="mb-2">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-lg font-bold text-orange-500">
                                                                ₱{Number(product.price).toLocaleString()}
                                                            </span>
                                                            {product.compare_price && product.compare_price > product.price && (
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ₱{Number(product.compare_price).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Rating and Sales */}
                                                    <div className="mb-2 flex items-center gap-2 text-xs">
                                                        {product.average_rating && Number(product.average_rating) > 0 ? (
                                                            <>
                                                                <div className="flex items-center">
                                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                    <span className="ml-0.5 font-medium">
                                                                        {Number(product.average_rating).toFixed(1)}
                                                                    </span>
                                                                </div>
                                                                {salesCount && <span className="text-gray-500">{salesCount} Sold/Month</span>}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">No ratings yet</span>
                                                        )}
                                                    </div>

                                                    {/* Category Badge */}
                                                    {categoryName && (
                                                        <div className="mb-2">
                                                            <span className="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                                                                {categoryName}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Location */}
                                                    {product.location && <div className="text-xs text-gray-500">{product.location}</div>}

                                                    {/* Action Buttons */}
                                                    <div className="mt-auto flex gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                            disabled={isOutOfStock(product) || isLoading}
                                                            className={`flex items-center justify-center rounded px-3 py-2 text-xs font-medium transition-colors ${
                                                                isOutOfStock(product) || isLoading
                                                                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                                            }`}
                                                            style={{ colorScheme: 'light' }}
                                                            title="Add to Cart"
                                                        >
                                                            <ShoppingCart
                                                                className="h-4 w-4"
                                                                style={{ color: isOutOfStock(product) || isLoading ? '#6b7280' : '#ffffff' }}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleBuyNow(e, product)}
                                                            disabled={isOutOfStock(product) || isLoading}
                                                            className={`flex-1 rounded border px-3 py-2 text-xs font-medium transition-colors ${
                                                                isOutOfStock(product) || isLoading
                                                                    ? 'cursor-not-allowed border-gray-300 text-gray-400'
                                                                    : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                                                            }`}
                                                        >
                                                            Buy
                                                        </button>
                                                    </div>
                                                </div>
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
                                                    className={`rounded-md px-3 py-2 text-sm ${
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
