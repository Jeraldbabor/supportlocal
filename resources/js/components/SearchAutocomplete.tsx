import { router, usePage } from '@inertiajs/react';
import { Loader2, Search, Store, Tag, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ProductSuggestion {
    id: number;
    name: string;
    price: number;
    primary_image?: string;
    seller_name?: string;
    category_name?: string;
}

interface SellerSuggestion {
    id: number;
    name: string;
    business_name?: string;
    profile_image?: string;
    products_count?: number;
    location?: string;
}

interface CategorySuggestion {
    id: number;
    name: string;
    products_count?: number;
}

interface SearchAutocompleteProps {
    type: 'products' | 'sellers';
    placeholder?: string;
    initialValue?: string;
    onSearch?: (term: string) => void;
    className?: string;
}

interface SearchSuggestions {
    products?: ProductSuggestion[];
    sellers?: SellerSuggestion[];
    categories?: CategorySuggestion[];
    keywords?: string[];
}

export default function SearchAutocomplete({ type, placeholder, initialValue = '', onSearch, className = '' }: SearchAutocompleteProps) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<SearchSuggestions>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Detect if we're on buyer routes or public routes
    const currentUrl = usePage().url;
    const isBuyerRoute = currentUrl.startsWith('/buyer/');
    const productRoutePrefix = isBuyerRoute ? '/buyer/product' : '/product';
    const sellerRoutePrefix = isBuyerRoute ? '/buyer/seller' : '/artisan';
    const productsRoute = isBuyerRoute ? '/buyer/products' : '/products';

    // Debounced fetch suggestions
    const fetchSuggestions = useCallback(
        async (term: string) => {
            if (term.length < 2) {
                setSuggestions({});
                setShowDropdown(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}&type=${type}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [type],
    );

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(-1);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowDropdown(false);
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    // Navigate to product detail
    const handleProductClick = (product: ProductSuggestion) => {
        setShowDropdown(false);
        router.visit(`${productRoutePrefix}/${product.id}`);
    };

    // Navigate to seller profile
    const handleSellerClick = (seller: SellerSuggestion) => {
        setShowDropdown(false);
        router.visit(`${sellerRoutePrefix}/${seller.id}`);
    };

    // Search by category
    const handleCategoryClick = (category: CategorySuggestion) => {
        setShowDropdown(false);
        router.get(productsRoute, { category: category.id.toString() });
    };

    // Search by keyword
    const handleKeywordClick = (keyword: string) => {
        setSearchTerm(keyword);
        setShowDropdown(false);
        if (onSearch) {
            onSearch(keyword);
        }
    };

    // Clear search
    const handleClear = () => {
        setSearchTerm('');
        setSuggestions({});
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const allItems = getAllFlatItems();

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const item = allItems[selectedIndex];
            if (item) {
                handleItemSelect(item);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    // Get all items as flat array for keyboard navigation
    const getAllFlatItems = () => {
        const items: { type: string; data: ProductSuggestion | SellerSuggestion | CategorySuggestion | string }[] = [];

        if (suggestions.keywords) {
            suggestions.keywords.forEach((keyword) => {
                items.push({ type: 'keyword', data: keyword });
            });
        }
        if (suggestions.categories) {
            suggestions.categories.forEach((category) => {
                items.push({ type: 'category', data: category });
            });
        }
        if (suggestions.products) {
            suggestions.products.forEach((product) => {
                items.push({ type: 'product', data: product });
            });
        }
        if (suggestions.sellers) {
            suggestions.sellers.forEach((seller) => {
                items.push({ type: 'seller', data: seller });
            });
        }

        return items;
    };

    // Handle item selection
    const handleItemSelect = (item: { type: string; data: ProductSuggestion | SellerSuggestion | CategorySuggestion | string }) => {
        switch (item.type) {
            case 'keyword':
                handleKeywordClick(item.data as string);
                break;
            case 'category':
                handleCategoryClick(item.data as CategorySuggestion);
                break;
            case 'product':
                handleProductClick(item.data as ProductSuggestion);
                break;
            case 'seller':
                handleSellerClick(item.data as SellerSuggestion);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const hasResults =
        (suggestions.products?.length ?? 0) > 0 ||
        (suggestions.sellers?.length ?? 0) > 0 ||
        (suggestions.categories?.length ?? 0) > 0 ||
        (suggestions.keywords?.length ?? 0) > 0;

    let currentIndex = -1;

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="flex gap-1.5 sm:gap-2 md:gap-3">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder || `Search ${type}...`}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (searchTerm.length >= 2 && hasResults) {
                                setShowDropdown(true);
                            }
                        }}
                        className="w-full rounded-lg border border-gray-300 py-1.5 pr-8 pl-7 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none sm:py-2 sm:pr-10 sm:pl-8 sm:text-sm md:py-3 md:pr-12 md:pl-10"
                        autoComplete="off"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:right-3"
                        >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                    )}
                    {isLoading && (
                        <div className="absolute top-1/2 right-8 -translate-y-1/2 sm:right-10">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500 sm:h-4 sm:w-4" />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-orange-600 active:bg-orange-700 sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3"
                >
                    Search
                </button>
            </form>

            {/* Dropdown */}
            {showDropdown && searchTerm.length >= 2 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:max-h-[500px]"
                >
                    {!hasResults && !isLoading && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">No results found for "{searchTerm}"</div>
                    )}

                    {/* Keywords Suggestions */}
                    {suggestions.keywords && suggestions.keywords.length > 0 && (
                        <div className="border-b border-gray-100 px-2 py-2">
                            <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase sm:text-xs">
                                Search Suggestions
                            </div>
                            {suggestions.keywords.map((keyword) => {
                                currentIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                return (
                                    <button
                                        key={keyword}
                                        onClick={() => handleKeywordClick(keyword)}
                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors sm:text-sm ${
                                            isSelected ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Search className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                                        <span className="truncate">{keyword}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Category Suggestions */}
                    {suggestions.categories && suggestions.categories.length > 0 && (
                        <div className="border-b border-gray-100 px-2 py-2">
                            <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase sm:text-xs">Categories</div>
                            {suggestions.categories.map((category) => {
                                currentIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category)}
                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors sm:text-sm ${
                                            isSelected ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Tag className="h-3.5 w-3.5 flex-shrink-0 text-orange-500 sm:h-4 sm:w-4" />
                                        <span className="truncate">{category.name}</span>
                                        {category.products_count !== undefined && (
                                            <span className="ml-auto text-[10px] text-gray-400 sm:text-xs">{category.products_count} products</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Product Suggestions */}
                    {suggestions.products && suggestions.products.length > 0 && (
                        <div className="border-b border-gray-100 px-2 py-2">
                            <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase sm:text-xs">Products</div>
                            {suggestions.products.map((product) => {
                                currentIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors sm:gap-3 ${
                                            isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-12 sm:w-12">
                                            {product.primary_image ? (
                                                <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">No img</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium text-gray-900 sm:text-sm">{product.name}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 sm:text-xs">
                                                <span className="font-semibold text-orange-500">₱{Number(product.price).toLocaleString()}</span>
                                                {product.seller_name && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{product.seller_name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Seller Suggestions */}
                    {suggestions.sellers && suggestions.sellers.length > 0 && (
                        <div className="px-2 py-2">
                            <div className="mb-1.5 px-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase sm:text-xs">Sellers</div>
                            {suggestions.sellers.map((seller) => {
                                currentIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                return (
                                    <button
                                        key={seller.id}
                                        onClick={() => handleSellerClick(seller)}
                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors sm:gap-3 ${
                                            isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 sm:h-12 sm:w-12">
                                            {seller.profile_image ? (
                                                <img src={seller.profile_image} alt={seller.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Store className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium text-gray-900 sm:text-sm">
                                                {seller.business_name || seller.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 sm:text-xs">
                                                {seller.products_count !== undefined && <span>{seller.products_count} products</span>}
                                                {seller.location && (
                                                    <>
                                                        {seller.products_count !== undefined && <span>•</span>}
                                                        <span className="truncate">{seller.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* View all results link */}
                    {hasResults && (
                        <div className="border-t border-gray-100 px-2 py-2">
                            <button
                                onClick={handleSubmit}
                                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:text-sm"
                            >
                                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                View all results for "{searchTerm}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
