import { Head, Link, router } from '@inertiajs/react';
import { Search, User, MapPin, Star, Eye, Filter } from 'lucide-react';
import React, { useState } from 'react';
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
    total_sales: number;
    created_at: string;
    is_verified: boolean;
}

interface SellersIndexProps {
    sellers: {
        data: Seller[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string | null;
        location: string | null;
        sort: string;
        direction: string;
        verified: boolean | null;
    };
}

export default function Index({ sellers, filters }: SellersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/buyer/sellers', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | boolean | null) => {
        router.get('/buyer/sellers', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleSellerClick = (sellerId: number) => {
        router.visit(`/buyer/seller/${sellerId}`);
    };

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'name': return 'Name';
            case 'products_count': return 'Most Products';
            case 'average_rating': return 'Highest Rated';
            case 'total_sales': return 'Best Selling';
            case 'created_at': return 'Newest';
            default: return 'Name';
        }
    };

    return (
        <BuyerLayout title="Browse Sellers">
            <Head title="Browse Sellers" />
            
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Browse Sellers & Artisans</h1>
                    <p className="text-gray-600">Discover talented local artisans and their unique products</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <form onSubmit={handleSearch} className="col-span-1 md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search sellers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </form>

                        <select
                            onChange={(e) => handleFilter('sort', e.target.value)}
                            value={filters.sort}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="products_count">Most Products</option>
                            <option value="average_rating">Highest Rated</option>
                            <option value="total_sales">Best Selling</option>
                            <option value="created_at">Newest</option>
                        </select>

                        <select
                            onChange={(e) => handleFilter('verified', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                            value={filters.verified === null ? '' : filters.verified?.toString() || ''}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        >
                            <option value="">All Sellers</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified</option>
                        </select>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {sellers.total} seller{sellers.total !== 1 ? 's' : ''} found
                            </span>
                        </div>
                    </div>
                </div>

                {sellers.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sellers.data.map((seller) => (
                                <div
                                    key={seller.id}
                                    onClick={() => handleSellerClick(seller.id)}
                                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {seller.profile_image ? (
                                                    <img
                                                        src={`/storage/${seller.profile_image}`}
                                                        alt={seller.name}
                                                        className="h-16 w-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                                                        <User className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {seller.business_name || seller.name}
                                                    </h3>
                                                    {seller.is_verified && (
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                                Verified
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    by {seller.name}
                                                </p>

                                                {seller.location && (
                                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                                        <MapPin className="mr-1 h-4 w-4" />
                                                        {seller.location}
                                                    </div>
                                                )}

                                                {seller.business_description && (
                                                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                                        {seller.business_description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {seller.products_count}
                                                </div>
                                                <div className="text-xs text-gray-500">Products</div>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center justify-center">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {seller.average_rating ? seller.average_rating.toFixed(1) : '0.0'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                            </div>

                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {seller.total_sales || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Sales</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>
                                                    Member since {new Date(seller.created_at).getFullYear()}
                                                </span>
                                                <div className="flex items-center">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {sellers.last_page > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    {sellers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <Filter className="h-full w-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                        <button
                            onClick={() => router.get('/buyer/sellers')}
                            className="mt-4 text-primary hover:text-primary-dark font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}