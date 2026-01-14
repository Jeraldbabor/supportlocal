import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Product {
    id: number;
    name: string;
    description: string;
    short_description: string | null;
    sku: string;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
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
    category_id: number | null;
    shipping_weight: number | null;
    shipping_cost: number | null;
    free_shipping: boolean;
}

interface Props {
    product: Product;
    statuses: Record<string, string>;
    stockStatuses: Record<string, string>;
    conditions: Record<string, string>;
    categories: Array<{ id: number; name: string; parent_id: number | null }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Products', href: '/admin/products' },
    { title: 'Edit Product', href: '#' },
];

export default function ProductEdit() {
    const { product, statuses, stockStatuses, conditions, categories } = usePage<SharedData & Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Convert boolean values
        data.track_quantity = formData.get('track_quantity') === 'on' ? '1' : '0';
        data.allow_backorders = formData.get('allow_backorders') === 'on' ? '1' : '0';
        data.is_featured = formData.get('is_featured') === 'on' ? '1' : '0';
        data.is_digital = formData.get('is_digital') === 'on' ? '1' : '0';
        data.requires_shipping = formData.get('requires_shipping') === 'on' ? '1' : '0';
        data.free_shipping = formData.get('free_shipping') === 'on' ? '1' : '0';

        // Handle category_id
        if (data.category_id === 'none' || data.category_id === '') {
            data.category_id = null;
        }

        router.put(`/admin/products/${product.id}`, data, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Product: ${product.name}`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Link href="/admin/products">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Product name, description, and SKU</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name *</Label>
                                        <Input id="name" name="name" defaultValue={product.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="short_description">Short Description</Label>
                                        <Textarea
                                            id="short_description"
                                            name="short_description"
                                            defaultValue={product.short_description || ''}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea id="description" name="description" defaultValue={product.description} rows={6} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input id="sku" name="sku" defaultValue={product.sku} readOnly className="bg-gray-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price *</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.price}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="compare_price">Compare Price</Label>
                                            <Input
                                                id="compare_price"
                                                name="compare_price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.compare_price || ''}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cost_price">Cost Price</Label>
                                            <Input
                                                id="cost_price"
                                                name="cost_price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.cost_price || ''}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventory */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantity *</Label>
                                            <Input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                defaultValue={product.quantity}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                            <Input
                                                id="low_stock_threshold"
                                                name="low_stock_threshold"
                                                type="number"
                                                defaultValue={product.low_stock_threshold}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="track_quantity"
                                            name="track_quantity"
                                            defaultChecked={product.track_quantity}
                                        />
                                        <Label htmlFor="track_quantity">Track Quantity</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="allow_backorders"
                                            name="allow_backorders"
                                            defaultChecked={product.allow_backorders}
                                        />
                                        <Label htmlFor="allow_backorders">Allow Backorders</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipping</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="requires_shipping"
                                            name="requires_shipping"
                                            defaultChecked={product.requires_shipping}
                                        />
                                        <Label htmlFor="requires_shipping">Requires Shipping</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="free_shipping" name="free_shipping" defaultChecked={product.free_shipping} />
                                        <Label htmlFor="free_shipping">Free Shipping</Label>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_weight">Shipping Weight</Label>
                                            <Input
                                                id="shipping_weight"
                                                name="shipping_weight"
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.shipping_weight || ''}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_cost">Shipping Cost</Label>
                                            <Input
                                                id="shipping_cost"
                                                name="shipping_cost"
                                                type="number"
                                                step="0.01"
                                                defaultValue={product.shipping_cost || ''}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status & Visibility */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Visibility</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select name="status" defaultValue={product.status} required>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statuses).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">Category</Label>
                                        <Select name="category_id" defaultValue={product.category_id?.toString() || 'none'}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Category</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="condition">Condition *</Label>
                                        <Select name="condition" defaultValue={product.condition} required>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(conditions).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="is_featured" name="is_featured" defaultChecked={product.is_featured} />
                                        <Label htmlFor="is_featured">Featured Product</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="is_digital" name="is_digital" defaultChecked={product.is_digital} />
                                        <Label htmlFor="is_digital">Digital Product</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_title">Meta Title</Label>
                                        <Input id="meta_title" name="meta_title" defaultValue={product.meta_title || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            name="meta_description"
                                            defaultValue={product.meta_description || ''}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSubmitting} className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href="/admin/products">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
