import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, MapPin, MessageSquare, Star, User } from 'lucide-react';
import { useState } from 'react';
import SearchAutocomplete from '../components/SearchAutocomplete';
import StartChatButton from '../components/StartChatButton';
import MainLayout from '../layouts/MainLayout';

interface Artisan {
    id: number;
    name: string;
    email?: string;
    business_name?: string;
    bio?: string;
    image: string;
    profile_image?: string | null;
    location: string;
    phone?: string | null;
    products_count: number;
    specialties: string[];
    rating: number;
    average_rating?: number;
    review_count?: number;
    total_sales?: number;
    created_at?: string;
    is_verified?: boolean;
}

interface ArtisansProps {
    artisans: {
        data: Artisan[];
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

export default function Artisans({ artisans, locations = [], filters = {} }: ArtisansProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { auth } = usePage<{ auth: { user?: { id: number; role: string } } }>().props;

    // Filter state
    const [showMoreLocations, setShowMoreLocations] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(filters?.location || null);
    const [selectedRating, setSelectedRating] = useState<string | null>(filters?.min_rating || null);
    const [minProducts, setMinProducts] = useState<string>(filters?.min_products?.toString() || '');
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(filters?.verified === true);
    const [showMoreRatings, setShowMoreRatings] = useState(false);
    const artisanList = artisans?.data || [];
    const currentSort = filters?.sort || 'popular';

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        router.get('/artisans', { ...filters, search: term }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | boolean | null) => {
        const newFilters = { ...filters, [key]: value };
        Object.keys(newFilters).forEach((k) => {
            if (!newFilters[k as keyof typeof newFilters] && newFilters[k as keyof typeof newFilters] !== false) {
                delete newFilters[k as keyof typeof newFilters];
            }
        });
        router.get('/artisans', newFilters, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        router.get('/artisans', { ...filters, sort }, { preserveState: true });
    };

    const handleProductsFilter = () => {
        const newFilters: Record<string, string | boolean | null | undefined> = { ...filters };
        if (minProducts) {
            newFilters.min_products = minProducts;
        } else {
            delete newFilters.min_products;
        }
        router.get('/artisans', newFilters, { preserveState: true });
    };

    const clearFilters = () => {
        setSelectedLocation(null);
        setSelectedRating(null);
        setMinProducts('');
        setVerifiedOnly(false);
        router.get('/artisans', { sort: currentSort }, { preserveState: true });
    };

    const handleArtisanClick = (artisanId: number) => {
        router.visit(`/artisan/${artisanId}`);
    };

    const displayedLocations = showMoreLocations ? locations : locations.slice(0, 4);

    // Render filter content (reusable for both mobile drawer and desktop sidebar)
    const renderFilterContent = () => (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">SEARCH FILTER</h2>
                {(selectedLocation || selectedRating || minProducts || verifiedOnly) && (
                    <button onClick={clearFilters} className="text-xs text-orange-500 hover:text-orange-600">
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
                        onClick={handleProductsFilter}
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

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <MainLayout>
            <Head title="Browse Artisans" />

            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
                {/* Search Bar with Autocomplete */}
                <div className="mb-4 sm:mb-6">
                    <SearchAutocomplete
                        type="sellers"
                        placeholder="Search artisans by name, location, or business..."
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
                                    Filter artisans by location, rating, product count, and verification status
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
                                        onClick={() => handleSort('rating')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'rating' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Highest Rated
                                    </button>
                                    <button
                                        onClick={() => handleSort('products_count')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'products_count'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Most Products
                                    </button>
                                    <button
                                        onClick={() => handleSort('total_sales')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'total_sales' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Best Selling
                                    </button>
                                    <button
                                        onClick={() => handleSort('latest')}
                                        className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:py-1.5 sm:text-sm ${
                                            currentSort === 'latest' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Latest
                                    </button>
                                </div>
                            </div>

                            {/* Pagination Info */}
                            {artisans.last_page > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        {artisans.current_page}/{artisans.last_page}
                                    </span>
                                    <div className="flex gap-1">
                                        <Link
                                            href={artisans.links.find((l) => l.label === '&laquo; Previous')?.url || '#'}
                                            className={`rounded px-2 py-1 text-sm ${
                                                artisans.current_page === 1
                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={artisans.links.find((l) => l.label === 'Next &raquo;')?.url || '#'}
                                            className={`rounded px-2 py-1 text-sm ${
                                                artisans.current_page === artisans.last_page
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

                        {/* Artisans Grid */}
                        {artisanList.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                    {artisanList.map((artisan) => {
                                        const rating = artisan.average_rating || artisan.rating || 0;
                                        const reviewCount = artisan.review_count || 0;

                                        return (
                                            <div
                                                key={artisan.id}
                                                onClick={() => handleArtisanClick(artisan.id)}
                                                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-orange-300 hover:shadow-lg"
                                            >
                                                <div className="p-3 sm:p-4">
                                                    {/* Artisan Header */}
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        {/* Avatar */}
                                                        <div className="flex-shrink-0">
                                                            {artisan.profile_image || artisan.image ? (
                                                                <img
                                                                    src={artisan.profile_image || artisan.image}
                                                                    alt={artisan.name}
                                                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 transition-all group-hover:ring-orange-200 sm:h-14 sm:w-14 md:h-16 md:w-16"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.onerror = null;
                                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=EA580C&background=FED7AA`;
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
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-orange-600 sm:text-base">
                                                                    {artisan.business_name || artisan.name}
                                                                </h3>
                                                                {artisan.is_verified && (
                                                                    <span className="flex-shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 sm:px-2 sm:text-xs">
                                                                        Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {artisan.business_name && (
                                                                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">by {artisan.name}</p>
                                                            )}

                                                            {/* Location */}
                                                            {artisan.location && (
                                                                <div className="mt-1 flex items-center text-[10px] text-gray-500 sm:text-xs">
                                                                    <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                                                                    <span className="truncate">{artisan.location}</span>
                                                                </div>
                                                            )}

                                                            {/* Rating */}
                                                            {rating > 0 && (
                                                                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                                                    <div className="flex items-center">
                                                                        <Star className="h-3 w-3 flex-shrink-0 fill-yellow-400 text-yellow-400 sm:h-3.5 sm:w-3.5" />
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

                                                    {/* Bio */}
                                                    {artisan.bio && (
                                                        <p className="mt-2 line-clamp-2 text-xs text-gray-600 sm:mt-3 sm:text-sm">{artisan.bio}</p>
                                                    )}

                                                    {/* Specialties */}
                                                    {artisan.specialties && artisan.specialties.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                                                            {artisan.specialties.slice(0, 3).map((specialty, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 sm:px-2 sm:text-xs"
                                                                >
                                                                    {specialty}
                                                                </span>
                                                            ))}
                                                            {artisan.specialties.length > 3 && (
                                                                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 sm:px-2 sm:text-xs">
                                                                    +{artisan.specialties.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Stats */}
                                                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-2 sm:mt-4 sm:gap-3 sm:pt-3">
                                                        <div className="text-center">
                                                            <div className="text-base font-bold text-gray-900 sm:text-lg">
                                                                {artisan.products_count}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Products</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-base font-bold text-gray-900 sm:text-lg">
                                                                {artisan.total_sales || 0}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Sales</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-base font-bold text-gray-900 sm:text-lg">
                                                                {artisan.created_at ? new Date(artisan.created_at).getFullYear() : 'N/A'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 sm:text-xs">Since</div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="mt-3 sm:mt-4" onClick={(e) => e.stopPropagation()}>
                                                        {auth?.user && auth.user.id !== artisan.id ? (
                                                            <StartChatButton
                                                                userId={artisan.id}
                                                                variant="outline"
                                                                className="w-full text-xs sm:text-sm"
                                                            >
                                                                <MessageSquare className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                Message Artisan
                                                            </StartChatButton>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleArtisanClick(artisan.id)}
                                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 sm:px-4 sm:py-2 sm:text-sm"
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
                                {artisans.last_page > 1 && (
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex gap-2">
                                            {artisans.links.map((link, index) => (
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
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No artisans found</h3>
                                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
