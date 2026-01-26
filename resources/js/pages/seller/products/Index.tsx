import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    CheckCircle,
    Clock,
    Copy,
    Edit,
    Eye,
    Grid,
    List,
    Package,
    Plus,
    Search,
    Star,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seller Dashboard',
        href: '/seller/dashboard',
    },
    {
        title: 'Products',
        href: '/seller/products',
    },
];

interface Product {
    id: number;
    name: string;
    description: string;
    short_description?: string;
    sku: string;
    slug: string;
    price: number;
    compare_price?: number;
    formatted_price: string;
    formatted_compare_price?: string;
    discount_percentage?: number;
    quantity: number;
    low_stock_threshold: number;
    stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
    status: 'draft' | 'active' | 'inactive' | 'archived';
    is_featured: boolean;
    category?: string;
    images?: string[];
    featured_image?: string;
    primary_image?: string;
    view_count: number;
    order_count: number;
    average_rating?: number;
    review_count: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    parent_id?: number;
    is_active: boolean;
}

interface ProductStats {
    total: number;
    active: number;
    low_stock: number;
    out_of_stock: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProductsPageProps extends SharedData {
    products: {
        data: Product[];
        links: PaginationLink[];
        current_page: number;
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
    categories: ProductCategory[];
    stats: ProductStats;
    filters: {
        search?: string;
        category?: string;
        status?: string;
        stock_status?: string;
        sort: string;
        direction: string;
    };
    statuses: Record<string, string>;
    stockStatuses: Record<string, string>;
}

export default function ProductsIndex() {
    const { products, categories, stats, filters, statuses, stockStatuses } = usePage<ProductsPageProps>().props;
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    // Defensive check for products structure
    if (!products || !products.data) {
        return (
            <AppLayout>
                <Head title="Products" />
                <div className="p-6" style={{ colorScheme: 'light' }}>
                    <div className="text-center">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />;
            case 'draft':
                return <Clock className="h-4 w-4" style={{ color: '#eab308' }} />;
            case 'inactive':
                return <AlertTriangle className="h-4 w-4" style={{ color: '#ef4444' }} />;
            case 'archived':
                return <Archive className="h-4 w-4" style={{ color: '#6b7280' }} />;
            default:
                return <Package className="h-4 w-4" style={{ color: '#6b7280' }} />;
        }
    };

    const getStockStatusColor = (stockStatus: string) => {
        switch (stockStatus) {
            case 'in_stock':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'low_stock':
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
            case 'out_of_stock':
                return 'text-red-700 bg-red-100 border-red-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/seller/products', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/seller/products', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        const direction = filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/seller/products', { ...filters, sort, direction }, { preserveState: true });
    };

    const toggleStatus = (product: Product) => {
        router.post(
            `/seller/products/${product.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const duplicateProduct = (product: Product) => {
        router.post(`/seller/products/${product.id}/duplicate`);
    };

    const deleteProduct = (product: Product) => {
        Swal.fire({
            title: 'Delete Product?',
            text: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/products/${product.id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Product has been deleted successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products - Seller Dashboard" />

            <div
                className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl bg-white p-3 sm:gap-6 sm:p-4"
                style={{ colorScheme: 'light' }}
            >
                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Products</h1>
                        <p className="text-sm text-gray-600 sm:text-base">Manage your handcrafted products and inventory</p>
                    </div>
                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        <Plus className="h-4 w-4" style={{ color: '#ffffff' }} />
                        Add Product
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <button
                        onClick={() => handleFilter('stock_status', '')}
                        className={`rounded-lg border p-3 text-left transition-all hover:shadow-md sm:p-4 ${
                            !filters.stock_status && !filters.status
                                ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                                : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Products</p>
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</p>
                            </div>
                            <Package className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#3b82f6' }} />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('status', 'active')}
                        className={`rounded-lg border p-3 text-left transition-all hover:shadow-md sm:p-4 ${
                            filters.status === 'active' ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Active</p>
                                <p className="text-xl font-bold text-green-600 sm:text-2xl">{stats.active}</p>
                            </div>
                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#22c55e' }} />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('stock_status', 'low_stock')}
                        className={`rounded-lg border p-3 text-left transition-all hover:shadow-md sm:p-4 ${
                            filters.stock_status === 'low_stock'
                                ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200'
                                : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Low Stock</p>
                                <p className="text-xl font-bold text-yellow-600 sm:text-2xl">{stats.low_stock}</p>
                            </div>
                            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#eab308' }} />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('stock_status', 'out_of_stock')}
                        className={`rounded-lg border p-3 text-left transition-all hover:shadow-md sm:p-4 ${
                            filters.stock_status === 'out_of_stock' ? 'border-red-400 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm">Out of Stock</p>
                                <p className="text-xl font-bold text-red-600 sm:text-2xl">{stats.out_of_stock}</p>
                            </div>
                            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#ef4444' }} />
                        </div>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    {/* Search and Filter Toggle (Mobile) */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                            >
                                Search
                            </button>
                        </form>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:hidden"
                        >
                            Filters
                            <TrendingDown
                                className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                                style={{ color: '#6b7280' }}
                            />
                        </button>

                        {/* Desktop Filters */}
                        <div className="hidden gap-2 sm:flex">
                            <select
                                value={filters.category || ''}
                                onChange={(e) => handleFilter('category', e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Status</option>
                                {Object.entries(statuses).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.stock_status || ''}
                                onChange={(e) => handleFilter('stock_status', e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Stock</option>
                                {Object.entries(stockStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex rounded-lg border border-gray-300 bg-white">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Grid className="h-4 w-4" style={{ color: viewMode === 'grid' ? '#ea580c' : '#6b7280' }} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <List className="h-4 w-4" style={{ color: viewMode === 'list' ? '#ea580c' : '#6b7280' }} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters (Expandable) */}
                    {showFilters && (
                        <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 sm:hidden">
                            <select
                                value={filters.category || ''}
                                onChange={(e) => handleFilter('category', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Status</option>
                                {Object.entries(statuses).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.stock_status || ''}
                                onChange={(e) => handleFilter('stock_status', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                            >
                                <option value="">All Stock Status</option>
                                {Object.entries(stockStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex rounded-lg border border-gray-300 bg-white">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 p-2.5 text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-500'}`}
                                >
                                    <Grid className="mx-auto h-4 w-4" style={{ color: viewMode === 'grid' ? '#ea580c' : '#6b7280' }} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 p-2.5 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-500'}`}
                                >
                                    <List className="mx-auto h-4 w-4" style={{ color: viewMode === 'list' ? '#ea580c' : '#6b7280' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Grid/List */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 sm:p-12">
                        <Package className="h-12 w-12" style={{ color: '#9ca3af' }} />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-2 text-center text-sm text-gray-500">Get started by creating your first handcrafted product.</p>
                        <Link
                            href="/seller/products/create"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                            <Plus className="h-4 w-4" style={{ color: '#ffffff' }} />
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                            {product.primary_image ? (
                                                <img
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = '/placeholder.svg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Package className="h-12 w-12" style={{ color: '#9ca3af' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="mt-3 sm:mt-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
                                                <div className="flex flex-shrink-0 items-center gap-1">
                                                    {getStatusIcon(product.status)}
                                                    {product.is_featured && <Star className="h-4 w-4" style={{ color: '#eab308' }} />}
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="text-base font-bold text-gray-900 sm:text-lg">{product.formatted_price}</span>
                                                {product.formatted_compare_price && (
                                                    <span className="text-xs text-gray-500 line-through sm:text-sm">
                                                        {product.formatted_compare_price}
                                                    </span>
                                                )}
                                                {product.discount_percentage && (
                                                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                                                        -{product.discount_percentage}%
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStockStatusColor(product.stock_status)}`}
                                                >
                                                    {stockStatuses[product.stock_status]} ({product.quantity})
                                                </span>
                                                <span className="text-gray-500">{product.view_count} views</span>
                                            </div>

                                            {/* Rating Display */}
                                            {product.review_count > 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm">
                                                    <Star className="h-3 w-3" style={{ color: '#facc15', fill: '#facc15' }} />
                                                    <span className="font-medium text-gray-900">
                                                        {product.average_rating ? Number(product.average_rating).toFixed(1) : '0.0'}
                                                    </span>
                                                    <span className="text-gray-500">({product.review_count})</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2">
                                            <Link
                                                href={`/seller/products/${product.id}`}
                                                className="flex flex-1 items-center justify-center rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                            >
                                                <Eye className="h-4 w-4" style={{ color: '#374151' }} />
                                            </Link>
                                            <Link
                                                href={`/seller/products/${product.id}/edit`}
                                                className="flex flex-1 items-center justify-center rounded-lg bg-blue-100 px-2 py-2 text-xs font-medium transition-colors hover:bg-blue-200"
                                            >
                                                <Edit className="h-4 w-4" style={{ color: '#1d4ed8' }} />
                                            </Link>
                                            {product.review_count > 0 && (
                                                <Link
                                                    href={`/seller/products/${product.id}/ratings`}
                                                    className="flex flex-1 items-center justify-center rounded-lg bg-yellow-100 px-2 py-2 text-xs font-medium transition-colors hover:bg-yellow-200"
                                                    title="View Ratings"
                                                >
                                                    <Star className="h-4 w-4" style={{ color: '#a16207' }} />
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className="flex flex-1 items-center justify-center rounded-lg bg-green-100 px-2 py-2 text-xs font-medium transition-colors hover:bg-green-200"
                                                title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {product.status === 'active' ? (
                                                    <TrendingDown className="h-4 w-4" style={{ color: '#15803d' }} />
                                                ) : (
                                                    <TrendingUp className="h-4 w-4" style={{ color: '#15803d' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                    <button
                                                        onClick={() => handleSort('name')}
                                                        className="flex items-center gap-1 hover:text-gray-700"
                                                    >
                                                        Product
                                                        {filters.sort === 'name' &&
                                                            (filters.direction === 'asc' ? (
                                                                <TrendingUp className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                            ))}
                                                    </button>
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell sm:px-6">
                                                    <button
                                                        onClick={() => handleSort('price')}
                                                        className="flex items-center gap-1 hover:text-gray-700"
                                                    >
                                                        Price
                                                        {filters.sort === 'price' &&
                                                            (filters.direction === 'asc' ? (
                                                                <TrendingUp className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" style={{ color: '#6b7280' }} />
                                                            ))}
                                                    </button>
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 md:table-cell">
                                                    Stock
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {products.data.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                                                                {product.primary_image ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
                                                                        src={product.primary_image}
                                                                        alt={product.name}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.onerror = null;
                                                                            target.src = '/placeholder.svg';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 sm:h-12 sm:w-12">
                                                                        <Package className="h-5 w-5" style={{ color: '#9ca3af' }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-3 min-w-0 sm:ml-4">
                                                                <div className="truncate text-sm font-medium text-gray-900">{product.name}</div>
                                                                <div className="text-xs text-gray-500 sm:text-sm">SKU: {product.sku}</div>
                                                                {/* Mobile price */}
                                                                <div className="text-sm font-medium text-gray-900 sm:hidden">
                                                                    {product.formatted_price}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell sm:px-6 sm:py-4">
                                                        <div className="text-sm text-gray-900">{product.formatted_price}</div>
                                                        {product.formatted_compare_price && (
                                                            <div className="text-xs text-gray-500 line-through">
                                                                {product.formatted_compare_price}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="hidden px-4 py-3 whitespace-nowrap sm:px-6 sm:py-4 md:table-cell">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStockStatusColor(product.stock_status)}`}
                                                        >
                                                            {product.quantity} {stockStatuses[product.stock_status]}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-4 py-3 whitespace-nowrap sm:px-6 sm:py-4 lg:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(product.status)}
                                                            <span className="text-sm text-gray-900">{statuses[product.status]}</span>
                                                            {product.is_featured && <Star className="h-4 w-4" style={{ color: '#eab308' }} />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap sm:px-6 sm:py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/seller/products/${product.id}`}
                                                                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                                                            >
                                                                <Eye className="h-4 w-4" style={{ color: '#4b5563' }} />
                                                            </Link>
                                                            <Link
                                                                href={`/seller/products/${product.id}/edit`}
                                                                className="rounded-lg p-1.5 transition-colors hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" style={{ color: '#2563eb' }} />
                                                            </Link>
                                                            <button
                                                                onClick={() => duplicateProduct(product)}
                                                                className="rounded-lg p-1.5 transition-colors hover:bg-green-50"
                                                            >
                                                                <Copy className="h-4 w-4" style={{ color: '#16a34a' }} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product)}
                                                                className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {products?.last_page > 1 && (
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {products.from} to {products.to} of {products.total} results
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {products.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`rounded-lg px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-orange-500 text-white'
                                                    : link.url
                                                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
