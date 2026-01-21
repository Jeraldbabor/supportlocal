import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, MapPin, MessageSquare, Search, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import StartChatButton from '../../../components/StartChatButton';
import BuyerLayout from '../../../layouts/BuyerLayout';

interface Seller {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
    business_name: string | null;
    business_description: string | null;
    location: string | null;
    phone: string | null;
    products_count: number;
    average_rating: number;
    review_count: number;
    total_sales: number;
    created_at: string;
    is_verified: boolean;
}

interface SellersIndexProps {
    sellers: {
        data: Seller[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    locations?: string[];
    filters: {
        search?: string | null;
        location?: string | null;
        min_rating?: string | null;
        min_products?: string | null;
        verified?: boolean | null;
        sort?: string;
    };
}

export default function Index({ sellers, locations = [], filters }: SellersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { auth } = usePage<{ auth: { user?: { id: number; role: string } } }>().props;

    // Filter state
    const [showMoreLocations, setShowMoreLocations] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(filters?.location || null);
    const [selectedRating, setSelectedRating] = useState<string | null>(filters?.min_rating || null);
    const [minProducts, setMinProducts] = useState<string>(filters?.min_products?.toString() || '');
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(filters?.verified === true);
    const [showMoreRatings, setShowMoreRatings] = useState(false);

    const sellerList = sellers?.data || [];
    const currentSort = filters?.sort || 'popular';
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/buyer/sellers', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | boolean | null) => {
        const newFilters = { ...filters, [key]: value };
        Object.keys(newFilters).forEach((k) => {
            if (!newFilters[k as keyof typeof newFilters] && newFilters[k as keyof typeof newFilters] !== false) {
                delete newFilters[k as keyof typeof newFilters];
            }
        });
        router.get('/buyer/sellers', newFilters, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        router.get('/buyer/sellers', { ...filters, sort }, { preserveState: true });
    };

    const handleProductsFilter = () => {
        const newFilters: Record<string, string | boolean | null> = { ...filters };
        if (minProducts) {
            newFilters.min_products = minProducts;
        } else {
            delete newFilters.min_products;
        }
        router.get('/buyer/sellers', newFilters, { preserveState: true });
    };

    const clearFilters = () => {
        setSelectedLocation(null);
        setSelectedRating(null);
        setMinProducts('');
        setVerifiedOnly(false);
        router.get('/buyer/sellers', { sort: currentSort }, { preserveState: true });
    };

    const handleSellerClick = (sellerId: number) => {
        router.visit(`/buyer/seller/${sellerId}`);
    };

    const displayedLocations = showMoreLocations ? locations : locations.slice(0, 4);

    // Render filter content (used in both desktop sidebar and mobile sheet)
    const renderFilterContent = () => (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">SEARCH FILTER</h2>
                {(selectedLocation || selectedRating || minProducts || verifiedOnly) && (
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

            {/* Location Filter */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Location</h3>
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

                    {/* More ratings (1 Star & Up) */}
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

            {/* Products Count Filter */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Products</h3>
                <div className="space-y-2">
                    <input
                        type="number"
                        placeholder="Min products"
                        value={minProducts}
                        onChange={(e) => setMinProducts(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                    />
                    <button
                        onClick={() => {
                            handleProductsFilter();
                            setIsFilterOpen(false);
                        }}
                        className="w-full rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Verified Filter */}
            <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Status</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={verifiedOnly}
                            onChange={(e) => {
                                const value = e.target.checked;
                                setVerifiedOnly(value);
                                handleFilter('verified', value ? true : null);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Verified Only</span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <BuyerLayout>
            <Head title="Browse Sellers" />

            <div className="mx-auto max-w-7xl px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-6 lg:px-8">
                {/* Search Bar */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                    <form onSubmit={handleSearch} className="flex gap-1.5 sm:gap-2 md:gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            <input
                                type="text"
                                placeholder="Search sellers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-1.5 pr-2 pl-7 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none sm:py-2 sm:pr-3 sm:pl-8 sm:text-sm md:py-3 md:pr-4 md:pl-10"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-orange-600 active:bg-orange-700 sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Mobile Filter Button */}
                <div className="mb-2 flex items-center justify-between sm:mb-3 md:mb-4 lg:hidden">
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Filters
                                {(selectedLocation || selectedRating || minProducts || verifiedOnly) && (
                                    <span className="ml-1 rounded-full bg-orange-500 px-1 py-0.5 text-[10px] font-semibold text-white sm:px-1.5 sm:text-xs">
                                        {[selectedLocation, selectedRating, minProducts, verifiedOnly].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="text-lg font-bold text-gray-900">SEARCH FILTER</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Filter sellers by location, rating, product count, and verification status
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
                        <div className="mb-2 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2 py-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-3 sm:py-2.5 md:mb-4 md:px-4 md:py-3">
                            <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 sm:gap-1.5 sm:pb-0 md:gap-2">
                                <span className="text-[10px] font-medium whitespace-nowrap text-gray-700 sm:text-xs md:text-sm">Sort by:</span>
                                <button
                                    onClick={() => handleSort('popular')}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors active:scale-95 sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1.5 md:text-sm ${
                                        currentSort === 'popular'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                    }`}
                                >
                                    Popular
                                </button>
                                <button
                                    onClick={() => handleSort('rating')}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors active:scale-95 sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1.5 md:text-sm ${
                                        currentSort === 'rating'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                    }`}
                                >
                                    Highest Rated
                                </button>
                                <button
                                    onClick={() => handleSort('products_count')}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors active:scale-95 sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1.5 md:text-sm ${
                                        currentSort === 'products_count'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                    }`}
                                >
                                    Most Products
                                </button>
                                <button
                                    onClick={() => handleSort('total_sales')}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors active:scale-95 sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1.5 md:text-sm ${
                                        currentSort === 'total_sales'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                    }`}
                                >
                                    Best Selling
                                </button>
                                <button
                                    onClick={() => handleSort('latest')}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors active:scale-95 sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1.5 md:text-sm ${
                                        currentSort === 'latest'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                    }`}
                                >
                                    Latest
                                </button>
                            </div>

                            {/* Pagination Info */}
                            {sellers.last_page > 1 && (
                                <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs whitespace-nowrap text-gray-600 sm:text-sm">
                                        {sellers.current_page}/{sellers.last_page}
                                    </span>
                                    <div className="flex gap-0.5 sm:gap-1">
                                        <Link
                                            href={sellers.links.find((l) => l.label === '&laquo; Previous')?.url || '#'}
                                            className={`rounded px-1.5 py-1 text-xs sm:px-2 sm:text-sm ${
                                                sellers.current_page === 1
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </Link>
                                        <Link
                                            href={sellers.links.find((l) => l.label === 'Next &raquo;')?.url || '#'}
                                            className={`rounded px-1.5 py-1 text-xs sm:px-2 sm:text-sm ${
                                                sellers.current_page === sellers.last_page
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

                        {/* Sellers Grid */}
                        {sellerList.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-3">
                                    {sellerList.map((seller) => {
                                        const rating = seller.average_rating || 0;
                                        const reviewCount = seller.review_count || 0;

                                        return (
                                            <div
                                                key={seller.id}
                                                onClick={() => handleSellerClick(seller.id)}
                                                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-orange-300 hover:shadow-lg"
                                            >
                                                <div className="p-3 sm:p-4">
                                                    {/* Seller Header */}
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        {/* Avatar */}
                                                        <div className="flex-shrink-0">
                                                            {seller.profile_image ? (
                                                                <img
                                                                    src={seller.profile_image}
                                                                    alt={seller.name}
                                                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 transition-all group-hover:ring-orange-200 sm:h-14 sm:w-14 md:h-16 md:w-16"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.onerror = null;
                                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&color=EA580C&background=FED7AA`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 ring-2 ring-gray-100 transition-all group-hover:ring-orange-200 sm:h-14 sm:w-14 md:h-16 md:w-16">
                                                                    <User className="h-6 w-6 text-orange-600 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Name and Info */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-orange-600 sm:text-base">
                                                                    {seller.business_name || seller.name}
                                                                </h3>
                                                                {seller.is_verified && (
                                                                    <span className="flex-shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 sm:px-2 sm:text-xs">
                                                                        Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {seller.business_name && (
                                                                <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500 sm:text-xs">
                                                                    by {seller.name}
                                                                </p>
                                                            )}

                                                            {/* Location */}
                                                            {seller.location && (
                                                                <div className="mt-1 flex items-center text-[10px] text-gray-500 sm:text-xs">
                                                                    <MapPin className="mr-0.5 h-2.5 w-2.5 flex-shrink-0 sm:mr-1 sm:h-3 sm:w-3" />
                                                                    <span className="truncate">{seller.location}</span>
                                                                </div>
                                                            )}

                                                            {/* Rating */}
                                                            {rating > 0 && (
                                                                <div className="mt-1 flex flex-wrap items-center gap-0.5 sm:mt-1.5 sm:gap-1">
                                                                    <div className="flex items-center">
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-3.5 sm:w-3.5" />
                                                                        <span className="ml-0.5 text-[10px] font-medium text-gray-700 sm:text-xs">
                                                                            {Number(rating).toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                    {reviewCount > 0 && (
                                                                        <span className="text-[10px] text-gray-500 sm:text-xs">
                                                                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Business Description - Hidden on mobile to save space */}
                                                    {seller.business_description && (
                                                        <p className="mt-2 line-clamp-2 hidden text-xs text-gray-600 sm:mt-3 sm:block sm:text-sm">
                                                            {seller.business_description}
                                                        </p>
                                                    )}

                                                    {/* Stats */}
                                                    <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-gray-100 pt-2 sm:mt-3 sm:gap-2 sm:pt-2.5 md:mt-4 md:gap-3 md:pt-3">
                                                        <div className="text-center">
                                                            <div className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
                                                                {seller.products_count}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Products</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
                                                                {seller.total_sales || 0}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Sales</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
                                                                {seller.created_at ? new Date(seller.created_at).getFullYear() : 'N/A'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Since</div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="mt-2 sm:mt-3 md:mt-4" onClick={(e) => e.stopPropagation()}>
                                                        {auth?.user && auth.user.id !== seller.id ? (
                                                            <StartChatButton
                                                                userId={seller.id}
                                                                variant="outline"
                                                                className="w-full py-1.5 text-xs sm:py-2 sm:text-sm"
                                                            >
                                                                <MessageSquare className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
                                                                <span className="hidden sm:inline">Message Seller</span>
                                                                <span className="sm:hidden">Message</span>
                                                            </StartChatButton>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSellerClick(seller.id)}
                                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100 sm:px-4 sm:py-2 sm:text-sm"
                                                            >
                                                                View Profile
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Pagination */}
                                {sellers.last_page > 1 && (
                                    <div className="mt-4 flex justify-center sm:mt-6">
                                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                            {sellers.links.map((link, index) => (
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
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No sellers found</h3>
                                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
