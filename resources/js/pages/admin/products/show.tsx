import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Star, Trash2, TrendingDown, TrendingUp, User } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    short_description: string | null;
    sku: string;
    slug: string;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    formatted_price: string;
    formatted_compare_price: string | null;
    quantity: number;
    low_stock_threshold: number;
    track_quantity: boolean;
    allow_backorders: boolean;
    stock_status: string;
    weight: number | null;
    weight_unit: string;
    dimensions: Record<string, unknown> | null;
    condition: string;
    meta_title: string | null;
    meta_description: string | null;
    tags: string[] | null;
    status: string;
    is_featured: boolean;
    is_digital: boolean;
    requires_shipping: boolean;
    images: string[] | null;
    featured_image: string | null;
    primary_image: string | null;
    subcategories: string[] | null;
    shipping_weight: number | null;
    shipping_cost: number | null;
    free_shipping: boolean;
    view_count: number;
    order_count: number;
    average_rating: number | null;
    review_count: number;
    published_at: string | null;
    seller: {
        id: number;
        name: string;
        email: string;
        business_name: string | null;
    } | null;
    category: {
        id: number;
        name: string;
    } | null;
    ratings: Array<{
        id: number;
        rating: number;
        review: string | null;
        seller_reply: string | null;
        user: {
            id: number;
            name: string;
            avatar_url: string;
        };
        created_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    product: Product;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Products', href: '/admin/products' },
    { title: 'Product Details', href: '#' },
];

export default function ProductShow() {
    const { product } = usePage<SharedData & Props>().props;

    const handleToggleStatus = () => {
        router.post(`/admin/products/${product.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            router.delete(`/admin/products/${product.id}`, {
                onSuccess: () => router.visit('/admin/products'),
            });
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
            <Head title={`Product: ${product.name}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/products">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleToggleStatus}>
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
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Product Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.primary_image ? (
                                    <div className="flex gap-4">
                                        <img
                                            src={product.primary_image}
                                            alt={product.name}
                                            className="h-64 w-64 rounded-lg object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder.jpg';
                                            }}
                                        />
                                        {product.images && product.images.length > 1 && (
                                            <div className="flex flex-col gap-2">
                                                {product.images.slice(0, 4).map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`${product.name} ${index + 1}`}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.jpg';
                                                        }}
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
                            </CardContent>
                        </Card>

                        {/* Product Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p>{product.description}</p>
                                    {product.short_description && (
                                        <>
                                            <Separator className="my-4" />
                                            <p className="text-sm text-muted-foreground">{product.short_description}</p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ratings & Reviews */}
                        {product.ratings && product.ratings.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ratings & Reviews</CardTitle>
                                    <CardDescription>
                                        Average rating:{' '}
                                        {product.average_rating != null && typeof product.average_rating === 'number'
                                            ? product.average_rating.toFixed(1)
                                            : 'N/A'}{' '}
                                        ({product.review_count} reviews)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {product.ratings.map((rating) => (
                                            <div key={rating.id} className="border-b pb-4 last:border-0">
                                                <div className="flex items-start gap-3">
                                                    <img
                                                        src={rating.user.avatar_url}
                                                        alt={rating.user.name}
                                                        className="h-10 w-10 rounded-full"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rating.user.name)}&color=7F9CF5&background=EBF4FF`;
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{rating.user.name}</span>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${
                                                                            i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">
                                                                {new Date(rating.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {rating.review && <p className="mt-2 text-sm">{rating.review}</p>}
                                                        {rating.seller_reply && (
                                                            <div className="mt-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                                                <p className="text-sm font-medium">Seller Reply:</p>
                                                                <p className="text-sm">{rating.seller_reply}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Product Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>SKU: {product.sku}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Stock Status</span>
                                    <Badge className={getStockStatusColor(product.stock_status)}>{product.stock_status}</Badge>
                                </div>
                                {product.is_featured && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Featured</span>
                                        <Badge>
                                            <Star className="mr-1 h-3 w-3" />
                                            Featured
                                        </Badge>
                                    </div>
                                )}
                                <Separator />
                                <div>
                                    <div className="text-2xl font-bold">{product.formatted_price}</div>
                                    {product.formatted_compare_price && (
                                        <div className="text-sm text-muted-foreground line-through">{product.formatted_compare_price}</div>
                                    )}
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Quantity</span>
                                        <span className="font-medium">{product.quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Low Stock Threshold</span>
                                        <span className="font-medium">{product.low_stock_threshold}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Views</span>
                                        <span className="font-medium">{product.view_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Orders</span>
                                        <span className="font-medium">{product.order_count}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seller Info */}
                        {product.seller && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Seller Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm font-medium">{product.seller.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.seller.email}</div>
                                        </div>
                                        <Link href={`/admin/users/${product.seller.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <User className="mr-2 h-4 w-4" />
                                                View Seller Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Category Info */}
                        {product.category && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium">{product.category.name}</div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Condition</span>
                                    <span className="capitalize">{product.condition}</span>
                                </div>
                                {product.weight && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Weight</span>
                                        <span>
                                            {product.weight} {product.weight_unit}
                                        </span>
                                    </div>
                                )}
                                {product.shipping_cost !== null && product.shipping_cost !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping Cost</span>
                                        <span>
                                            ₱
                                            {(() => {
                                                const cost =
                                                    typeof product.shipping_cost === 'number' ? product.shipping_cost : Number(product.shipping_cost);
                                                return !isNaN(cost) ? cost.toFixed(2) : 'N/A';
                                            })()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Digital Product</span>
                                    <span>{product.is_digital ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Requires Shipping</span>
                                    <span>{product.requires_shipping ? 'Yes' : 'No'}</span>
                                </div>
                                {product.published_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Published</span>
                                        <span>{new Date(product.published_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
