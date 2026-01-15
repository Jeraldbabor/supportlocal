import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Filter, MoreHorizontal, Package, Search, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    slug: string;
    price: number;
    formatted_price: string;
    quantity: number;
    stock_status: string;
    status: string;
    is_featured: boolean;
    view_count: number;
    order_count: number;
    average_rating: number | null;
    review_count: number;
    primary_image: string | null;
    seller: {
        id: number;
        name: string;
    } | null;
    category: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    published_at: string | null;
}

interface Props {
    products: {
        data: Product[];
        links: Array<{ url?: string; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        search?: string;
        status?: string;
        stock_status?: string;
        seller_id?: string;
        category_id?: string;
    };
    statuses: Record<string, string>;
    stockStatuses: Record<string, string>;
    categories: Array<{ id: number; name: string }>;
    stats: {
        total: number;
        active: number;
        inactive: number;
        draft: number;
        archived: number;
        out_of_stock: number;
        low_stock: number;
        featured: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Products', href: '/admin/products' },
];

export default function ProductsIndex() {
    const { products, filters, statuses, stockStatuses, stats } = usePage<SharedData & Props>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || 'all');

    const handleSearch = () => {
        router.get(
            '/admin/products',
            {
                search: searchTerm,
                status: selectedStatus === 'all' ? '' : selectedStatus,
                stock_status: selectedStockStatus === 'all' ? '' : selectedStockStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleToggleStatus = (productId: number) => {
        router.post(`/admin/products/${productId}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleToggleFeatured = (productId: number) => {
        router.post(`/admin/products/${productId}/toggle-featured`, {}, { preserveScroll: true });
    };

    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            router.delete(`/admin/products/${productId}`, { preserveScroll: true });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'archived':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Management" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Total Products</CardTitle>
                            <Package className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Inactive</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-600 sm:text-2xl">{stats.inactive}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">{stats.draft}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Out of Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600 sm:text-2xl">{stats.out_of_stock}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Low Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">{stats.low_stock}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Featured</CardTitle>
                            <Star className="h-3 w-3 text-yellow-600 sm:h-4 sm:w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.featured}</div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium sm:text-sm">Archived</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600 sm:text-2xl">{stats.archived}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Product Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage all products in the system</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="mb-1.5 block text-xs font-medium sm:text-sm">Stock Status</label>
                                <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Stock Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Stock Status</SelectItem>
                                        {Object.entries(stockStatuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={() => router.get('/admin/products')} className="flex-1 sm:flex-initial">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Seller
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Rating
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="flex items-center gap-3">
                                                    {product.primary_image ? (
                                                        <img
                                                            src={product.primary_image}
                                                            alt={product.name}
                                                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                if (target.nextElementSibling) {
                                                                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    {!product.primary_image && (
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                                                        {product.is_featured && (
                                                            <Badge variant="outline" className="mt-1 text-xs">
                                                                <Star className="mr-1 h-3 w-3" />
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                {product.seller ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{product.seller.name}</div>
                                                        <div className="text-xs text-muted-foreground">{product.category?.name || 'No category'}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="font-medium">{product.formatted_price}</div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="flex flex-col gap-1">
                                                    <Badge className={getStockStatusColor(product.stock_status)}>
                                                        {stockStatuses[product.stock_status] || product.stock_status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">Qty: {product.quantity}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <Badge className={getStatusColor(product.status)}>{statuses[product.status] || product.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm">
                                                        {product.average_rating != null && typeof product.average_rating === 'number'
                                                            ? product.average_rating.toFixed(1)
                                                            : 'N/A'}{' '}
                                                        ({product.review_count})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 lg:px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/products/${product.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Product
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(product.id)}>
                                                            {product.status === 'active' ? (
                                                                <>
                                                                    <TrendingDown className="mr-2 h-4 w-4" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TrendingUp className="mr-2 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleFeatured(product.id)}>
                                                            <Star className="mr-2 h-4 w-4" />
                                                            {product.is_featured ? 'Unfeature' : 'Feature'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Product
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="space-y-3 p-4 md:hidden">
                            {products.data.map((product) => (
                                <div key={product.id} className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            {product.primary_image ? (
                                                <img
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium">{product.name}</div>
                                                <div className="mt-0.5 text-sm text-muted-foreground">SKU: {product.sku}</div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {product.is_featured && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    <Badge className={getStatusColor(product.status)}>
                                                        {statuses[product.status] || product.status}
                                                    </Badge>
                                                    <Badge className={getStockStatusColor(product.stock_status)}>
                                                        {stockStatuses[product.stock_status] || product.stock_status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                    <div>Price: {product.formatted_price}</div>
                                                    <div>Stock: {product.quantity} units</div>
                                                    {product.seller && <div>Seller: {product.seller.name}</div>}
                                                    {product.category && <div>Category: {product.category.name}</div>}
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        <span>
                                                            {product.average_rating != null && typeof product.average_rating === 'number'
                                                                ? product.average_rating.toFixed(1)
                                                                : 'N/A'}{' '}
                                                            ({product.review_count} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 shrink-0 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Product
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleStatus(product.id)}>
                                                    {product.status === 'active' ? (
                                                        <>
                                                            <TrendingDown className="mr-2 h-4 w-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleFeatured(product.id)}>
                                                    <Star className="mr-2 h-4 w-4" />
                                                    {product.is_featured ? 'Unfeature' : 'Feature'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Product
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-4 py-12">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-medium">No products found</h3>
                                <p className="mt-1 text-center text-sm text-muted-foreground">Try adjusting your filters</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                        {products.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'border bg-background hover:bg-muted'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
