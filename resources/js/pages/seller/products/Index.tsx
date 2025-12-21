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

    // Defensive check for products structure
    if (!products || !products.data) {
        return (
            <AppLayout>
                <Head title="Products" />
                <div className="p-6">
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
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'draft':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'inactive':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'archived':
                return <Archive className="h-4 w-4 text-gray-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStockStatusColor = (stockStatus: string) => {
        switch (stockStatus) {
            case 'in_stock':
                return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/50 dark:border-green-800';
            case 'low_stock':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/50 dark:border-yellow-800';
            case 'out_of_stock':
                return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/50 dark:border-gray-800';
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your handcrafted products and inventory</p>
                    </div>
                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        onClick={() => handleFilter('stock_status', '')}
                        className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                            !filters.stock_status && !filters.status
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 dark:bg-blue-950/50'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('status', 'active')}
                        className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                            filters.status === 'active'
                                ? 'border-green-500 bg-green-50 ring-2 ring-green-200 dark:bg-green-950/50'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Products</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('stock_status', 'low_stock')}
                        className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                            filters.stock_status === 'low_stock'
                                ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200 dark:bg-yellow-950/50'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.low_stock}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </button>
                    <button
                        onClick={() => handleFilter('stock_status', 'out_of_stock')}
                        className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                            filters.stock_status === 'out_of_stock'
                                ? 'border-red-500 bg-red-50 ring-2 ring-red-200 dark:bg-red-950/50'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{stats.out_of_stock}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center dark:bg-gray-900">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            Search
                        </button>
                    </form>

                    <div className="flex gap-2">
                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleFilter('category', e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
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
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
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
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        >
                            <option value="">All Stock Status</option>
                            {Object.entries(stockStatuses).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : 'text-gray-500'}`}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : 'text-gray-500'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:bg-gray-900">
                        <Package className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No products found</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first handcrafted product.</p>
                        <Link
                            href="/seller/products/create"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative rounded-lg border bg-white p-4 shadow-sm hover:shadow-md dark:bg-gray-900"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                            {product.primary_image ? (
                                                <img
                                                    src={`/storage/${product.primary_image}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                    <span className="sr-only">No image available</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="mt-4">
                                            <div className="flex items-start justify-between">
                                                <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(product.status)}
                                                    {product.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{product.formatted_price}</span>
                                                {product.formatted_compare_price && (
                                                    <>
                                                        <span className="text-sm text-gray-500 line-through">{product.formatted_compare_price}</span>
                                                        {product.discount_percentage && (
                                                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                                                                -{product.discount_percentage}%
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between text-sm">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-xs font-medium ${getStockStatusColor(product.stock_status)}`}
                                                >
                                                    {stockStatuses[product.stock_status]} ({product.quantity})
                                                </span>
                                                <span className="text-gray-500">{product.view_count} views</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2">
                                            <Link
                                                href={`/seller/products/${product.id}`}
                                                className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <Eye className="mx-auto h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/seller/products/${product.id}/edit`}
                                                className="flex-1 rounded-lg bg-blue-100 px-3 py-2 text-center text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                            >
                                                <Edit className="mx-auto h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-center text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                                            >
                                                {product.status === 'active' ? (
                                                    <TrendingDown className="mx-auto h-4 w-4" />
                                                ) : (
                                                    <TrendingUp className="mx-auto h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-white dark:bg-gray-900">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    <button
                                                        onClick={() => handleSort('name')}
                                                        className="flex items-center gap-1 hover:text-gray-700"
                                                    >
                                                        Product
                                                        {filters.sort === 'name' &&
                                                            (filters.direction === 'asc' ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            ))}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    <button
                                                        onClick={() => handleSort('price')}
                                                        className="flex items-center gap-1 hover:text-gray-700"
                                                    >
                                                        Price
                                                        {filters.sort === 'price' &&
                                                            (filters.direction === 'asc' ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            ))}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Stock
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    <button
                                                        onClick={() => handleSort('created_at')}
                                                        className="flex items-center gap-1 hover:text-gray-700"
                                                    >
                                                        Created
                                                        {filters.sort === 'created_at' &&
                                                            (filters.direction === 'asc' ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            ))}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                            {products.data.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {product.primary_image ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-lg object-cover"
                                                                        src={`/storage/${product.primary_image}`}
                                                                        alt={product.name}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                                                        <Package className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">{product.formatted_price}</div>
                                                        {product.formatted_compare_price && (
                                                            <div className="text-sm text-gray-500 line-through">
                                                                {product.formatted_compare_price}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStockStatusColor(product.stock_status)}`}
                                                        >
                                                            {product.quantity} {stockStatuses[product.stock_status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(product.status)}
                                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                {statuses[product.status]}
                                                            </span>
                                                            {product.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                        {new Date(product.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/seller/products/${product.id}`}
                                                                className="p-1 text-gray-600 hover:text-gray-900"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/seller/products/${product.id}/edit`}
                                                                className="p-1 text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => duplicateProduct(product)}
                                                                className="p-1 text-green-600 hover:text-green-900"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product)}
                                                                className="p-1 text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {products.from} to {products.to} of {products.total} results
                                </div>
                                <div className="flex gap-1">
                                    {products.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`rounded-lg px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
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
