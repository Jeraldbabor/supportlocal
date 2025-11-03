import { Link, router } from '@inertiajs/react';
import { Eye, Filter, MapPin, Search, Star, User } from 'lucide-react';
import React, { useState } from 'react';
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
    filters: {
        search?: string | null;
        sort?: string;
        direction?: string;
        verified?: boolean | null;
    };
}

export default function Artisans({ artisans, filters = {} }: ArtisansProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/artisans', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | boolean | null) => {
        router.get('/artisans', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleArtisanClick = (artisanId: number) => {
        router.visit(`/artisan/${artisanId}`);
    };

    const artisanList = artisans?.data || [];

    return (
        <MainLayout title="Local Artisans">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Browse Artisans & Craftspeople</h1>
                    <p className="text-gray-600">Discover talented local artisans and their unique handmade products</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <form onSubmit={handleSearch} className="col-span-1 md:col-span-2">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search artisans..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </form>

                        <select
                            onChange={(e) => handleFilter('sort', e.target.value)}
                            value={filters.sort || 'name'}
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
                            <option value="">All Artisans</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified</option>
                        </select>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {artisans.total} artisan{artisans.total !== 1 ? 's' : ''} found
                            </span>
                        </div>
                    </div>
                </div>

                {/* Artisans Grid */}
                {artisanList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {artisanList.map((artisan) => (
                                <div
                                    key={artisan.id}
                                    onClick={() => handleArtisanClick(artisan.id)}
                                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {artisan.profile_image || artisan.image ? (
                                                    <img
                                                        src={artisan.profile_image ? `/storage/${artisan.profile_image}` : artisan.image}
                                                        alt={artisan.name}
                                                        className="h-16 w-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                                                        <User className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="truncate text-lg font-semibold text-gray-900">
                                                        {artisan.business_name || artisan.name}
                                                    </h3>
                                                    {artisan.is_verified && (
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                                                                Verified
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-gray-600">by {artisan.name}</p>

                                                {artisan.location && (
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <MapPin className="mr-1 h-4 w-4" />
                                                        {artisan.location}
                                                    </div>
                                                )}

                                                {artisan.bio && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{artisan.bio}</p>}
                                            </div>
                                        </div>

                                        {/* Specialties */}
                                        {artisan.specialties && artisan.specialties.length > 0 && (
                                            <div className="mt-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {artisan.specialties.slice(0, 3).map((specialty, index) => (
                                                        <span key={index} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                    {artisan.specialties.length > 3 && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                            +{artisan.specialties.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">{artisan.products_count}</div>
                                                <div className="text-xs text-gray-500">Products</div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-center">
                                                    <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {artisan.average_rating || artisan.rating
                                                            ? (artisan.average_rating || artisan.rating).toFixed(1)
                                                            : '0.0'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                            </div>

                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">{artisan.total_sales || 0}</div>
                                                <div className="text-xs text-gray-500">Sales</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>Member since {artisan.created_at ? new Date(artisan.created_at).getFullYear() : 'N/A'}</span>
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
                        {artisans.last_page > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    {artisans.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded-md px-3 py-2 text-sm ${
                                                link.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                            <Filter className="h-full w-full" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No artisans found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                        <button onClick={() => router.get('/artisans')} className="hover:text-primary-dark mt-4 font-medium text-primary">
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
