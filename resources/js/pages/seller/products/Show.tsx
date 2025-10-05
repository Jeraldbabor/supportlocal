import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { 
    ArrowLeft, 
    Edit, 
    Copy, 
    Trash2,
    Eye,
    Star,
    Package,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Archive,
    Share,
    ExternalLink
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    short_description?: string;
    sku: string;
    slug: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    formatted_price: string;
    formatted_compare_price?: string;
    discount_percentage?: number;
    profit_margin?: number;
    quantity: number;
    low_stock_threshold: number;
    stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
    status: 'draft' | 'active' | 'inactive' | 'archived';
    is_featured: boolean;
    is_digital: boolean;
    requires_shipping: boolean;
    weight?: number;
    weight_unit: string;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    condition: string;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    tags?: string[];
    images?: string[];
    featured_image?: string;
    primary_image?: string;
    shipping_cost?: number;
    free_shipping: boolean;
    meta_title?: string;
    meta_description?: string;
    view_count: number;
    order_count: number;
    average_rating?: number;
    review_count: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

interface ShowProductProps extends SharedData {
    product: Product;
}

export default function ShowProduct({ product }: ShowProductProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Seller Dashboard',
            href: '/seller/dashboard',
        },
        {
            title: 'Products',
            href: '/seller/products',
        },
        {
            title: product.name,
            href: `/seller/products/${product.id}`,
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'draft': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'inactive': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'archived': return <Archive className="h-5 w-5 text-gray-500" />;
            default: return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStockStatusColor = (stockStatus: string) => {
        switch (stockStatus) {
            case 'in_stock': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/50 dark:border-green-800';
            case 'low_stock': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/50 dark:border-yellow-800';
            case 'out_of_stock': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800';
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/50 dark:border-gray-800';
        }
    };

    const toggleStatus = () => {
        router.post(`/seller/products/${product.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const duplicateProduct = () => {
        router.post(`/seller/products/${product.id}/duplicate`);
    };

    const deleteProduct = () => {
        Swal.fire({
            title: 'Delete Product?',
            text: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/products/${product.id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Product has been deleted successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            router.visit('/seller/products');
                        });
                    }
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product.name} - Product Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/seller/products"
                            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
                                {getStatusIcon(product.status)}
                                {product.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">SKU: {product.sku}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={toggleStatus}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                                product.status === 'active'
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {product.status === 'active' ? (
                                <>
                                    <TrendingDown className="h-4 w-4" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="h-4 w-4" />
                                    Publish
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Product Images */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Product Images</h2>
                            
                            {product.images && product.images.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Featured Image */}
                                    {product.primary_image && (
                                        <div className="relative">
                                            <img
                                                src={`/storage/${product.primary_image}`}
                                                alt={product.name}
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                            <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                                Featured
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Additional Images */}
                                    {product.images.length > 1 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {product.images.slice(1).map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={`/storage/${image}`}
                                                    alt={`${product.name} ${index + 2}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <Package className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Product Information</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{product.description}</p>
                                </div>

                                {product.short_description && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Short Description</h3>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">{product.short_description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">{product.category?.name || 'Uncategorized'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</h3>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100 capitalize">{product.condition}</p>
                                    </div>
                                </div>

                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {product.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Pricing */}
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Pricing</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Selling Price</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{product.formatted_price}</span>
                                    </div>
                                    
                                    {product.formatted_compare_price && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Compare Price</span>
                                            <span className="text-sm text-gray-500 line-through">{product.formatted_compare_price}</span>
                                        </div>
                                    )}
                                    
                                    {product.cost_price && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Cost Price</span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100">₱{product.cost_price}</span>
                                        </div>
                                    )}
                                    
                                    {product.discount_percentage && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Discount</span>
                                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                                                -{product.discount_percentage}%
                                            </span>
                                        </div>
                                    )}
                                    
                                    {product.profit_margin && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</span>
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                                                {product.profit_margin}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Inventory */}
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Inventory</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Stock Quantity</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{product.quantity}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Stock Status</span>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStockStatusColor(product.stock_status)}`}>
                                            {product.stock_status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alert</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{product.low_stock_threshold}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Physical Properties */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Shipping */}
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Shipping</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Requires Shipping</span>
                                        <span className={`text-sm ${product.requires_shipping ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.requires_shipping ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Digital Product</span>
                                        <span className={`text-sm ${product.is_digital ? 'text-green-600' : 'text-gray-600'}`}>
                                            {product.is_digital ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Shipping Cost</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {product.free_shipping ? 'Free' : product.shipping_cost ? `₱${product.shipping_cost}` : 'Not set'}
                                        </span>
                                    </div>
                                    
                                    {product.weight && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                {product.weight} {product.weight_unit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Analytics */}
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Views</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{product.view_count}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Orders</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{product.order_count}</span>
                                    </div>
                                    
                                    {product.average_rating && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {product.average_rating} ({product.review_count} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={`/seller/products/${product.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Product
                            </Link>
                            
                            <button
                                onClick={duplicateProduct}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Copy className="h-4 w-4" />
                                Duplicate
                            </button>
                            
                            <a
                                href={`/product/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Public Page
                            </a>
                            
                            <button
                                onClick={deleteProduct}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}