import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, Package, Plus, Save, Upload, X } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    short_description: string;
    price: number;
    compare_at_price?: number;
    cost_per_item?: number;
    sku?: string;
    barcode?: string;
    quantity: number;
    track_quantity: boolean;
    continue_selling_when_out_of_stock: boolean;
    low_stock_threshold?: number;
    weight?: number;
    weight_unit?: string;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    category_id?: number;
    condition?: string;
    tags?: string[] | null;
    images?: string[] | null;
    status: 'active' | 'draft' | 'archived';
    requires_shipping: boolean;
    taxable: boolean;
    meta_title?: string;
    meta_description?: string;
    handle?: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number;
    children?: Category[];
}

interface EditProps {
    product: Product;
    categories: Category[];
    conditions: Record<string, string>;
}

export default function Edit({ product, categories, conditions }: EditProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(product.images ? product.images.map((img) => `/storage/${img}`) : []);
    const [newTag, setNewTag] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing, errors } = useForm({
        name: product.name,
        description: product.description,
        short_description: product.short_description || '',
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || '',
        cost_per_item: product.cost_per_item?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        quantity: product.quantity.toString(),
        track_quantity: product.track_quantity,
        continue_selling_when_out_of_stock: product.continue_selling_when_out_of_stock,
        low_stock_threshold: product.low_stock_threshold?.toString() || '',
        weight: product.weight?.toString() || '',
        weight_unit: product.weight_unit || 'kg',
        length: product.dimensions?.length?.toString() || '',
        width: product.dimensions?.width?.toString() || '',
        height: product.dimensions?.height?.toString() || '',
        category_id: product.category_id?.toString() || '',
        condition: product.condition || 'new',
        tags: product.tags || [],
        status: product.status,
        requires_shipping: product.requires_shipping,
        taxable: product.taxable,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        handle: product.handle || '',
        images: selectedImages,
        existing_images: product.images || [],
    });

    useEffect(() => {
        if (data.name && !data.handle) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('handle', slug);
        }
    }, [data.name, data.handle, setData]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedImages((prev) => [...prev, ...files]);

            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        const existingImagesLength = product.images?.length || 0;

        // Update preview URLs (remove the item at index)
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        setImagePreviewUrls(newPreviewUrls);

        if (index < existingImagesLength) {
            // Removing existing image - track by removing the specific image from existing_images
            const imageToRemove = product.images?.[index];
            if (imageToRemove) {
                const currentExistingImages = data.existing_images || [];
                const newExistingImages = currentExistingImages.filter((img) => img !== imageToRemove);
                setData('existing_images', newExistingImages);
            }
        } else {
            // Removing new image - update selectedImages state
            const newImageIndex = index - existingImagesLength;
            const newSelectedImages = selectedImages.filter((_, i) => i !== newImageIndex);
            setSelectedImages(newSelectedImages);
            setData('images', newSelectedImages);
        }
    };

    const addTag = () => {
        const currentTags = data.tags || [];
        if (newTag.trim() && !currentTags.includes(newTag.trim())) {
            setData('tags', [...currentTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = data.tags || [];
        setData(
            'tags',
            currentTags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowError(false);
        setShowSuccess(false);

        // Prepare image data for backend
        const formData = new FormData();

        // Add all form fields except images and existing_images
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'existing_images') {
                if (key === 'tags' && Array.isArray(value)) {
                    // Send tags as JSON string for more reliable parsing
                    formData.append('tags', JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        formData.append(`${key}[${index}]`, item);
                    });
                } else if (typeof value === 'object' && value !== null) {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        formData.append(`${key}[${subKey}]`, subValue as string);
                    });
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            }
        });

        // Add new images
        selectedImages.forEach((file, index) => {
            formData.append(`new_images[${index}]`, file);
        });

        // Calculate which images to remove
        const originalImages = product.images || [];
        const currentExistingImages = data.existing_images || [];
        const imagesToRemove = originalImages.filter((img) => !currentExistingImages.includes(img));

        imagesToRemove.forEach((img, index) => {
            formData.append(`remove_images[${index}]`, img);
        });

        console.log('Form submission data:');
        console.log('- Original images:', originalImages);
        console.log('- Current existing images:', currentExistingImages);
        console.log('- Images to remove:', imagesToRemove);
        console.log('- New images count:', selectedImages.length);

        // Use method spoofing for PUT request with FormData
        formData.append('_method', 'PUT');

        router.post(`/seller/products/${product.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Updated!',
                    text: 'Product updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#16a34a',
                    confirmButtonText: 'View Product',
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.visit(`/seller/products/${product.id}`);
                    }
                });
            },
            onError: (errors) => {
                console.error('Product update failed:', errors);
                console.log('Detailed errors:', JSON.stringify(errors, null, 2));

                // Extract meaningful error message
                const errorMessages = Object.values(errors).flat();
                const detailedMessage =
                    errorMessages.length > 0 ? errorMessages.join(', ') : 'Failed to update product. Please check your input and try again.';

                setErrorMessage(detailedMessage);
                setShowError(true);
            },
        });
    };

    const renderCategories = (categories: Category[], level = 0): React.ReactNode => {
        return (
            categories?.map((category) => (
                <React.Fragment key={category.id}>
                    <SelectItem value={category.id?.toString() || ''}>{'  '.repeat(level) + (category.name || 'Unnamed Category')}</SelectItem>
                    {category.children && renderCategories(category.children, level + 1)}
                </React.Fragment>
            )) || []
        );
    };

    return (
        <AppLayout>
            <Head title={`Edit Product: ${product.name}`} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/seller/products/${product.id}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Product
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="mt-2 text-gray-600">Update your product information and settings</p>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Product updated successfully! Redirecting to product details...</AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {showError && (
                    <Alert className="border-red-500 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                        <X className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>Update the basic details of your product</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter product name"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="compare_at_price">Compare at Price</Label>
                                    <Input
                                        id="compare_at_price"
                                        type="number"
                                        step="0.01"
                                        value={data.compare_at_price}
                                        onChange={(e) => setData('compare_at_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.compare_at_price && <p className="mt-1 text-sm text-red-600">{errors.compare_at_price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories && categories.length > 0 ? (
                                                renderCategories(categories)
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    No categories available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="condition">Condition *</Label>
                                    <Select value={data.condition} onValueChange={(value) => setData('condition', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(conditions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <Select value={data.status} onValueChange={(value: string) => setData('status', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="short_description">Short Description</Label>
                                    <Textarea
                                        id="short_description"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        placeholder="Brief description for product listings"
                                        rows={2}
                                    />
                                    {errors.short_description && <p className="mt-1 text-sm text-red-600">{errors.short_description}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Full Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Detailed product description"
                                        rows={6}
                                        required
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & SKU */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & SKU</CardTitle>
                            <CardDescription>Manage your product inventory and identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        placeholder="Stock Keeping Unit"
                                    />
                                    {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                    <Input
                                        id="low_stock_threshold"
                                        type="number"
                                        value={data.low_stock_threshold}
                                        onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                        placeholder="5"
                                    />
                                    {errors.low_stock_threshold && <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>}
                                </div>
                            </div>

                            {data.requires_shipping && (
                                <div>
                                    <Label>Shipping Dimensions & Weight</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                                        <div>
                                            <Label>Weight</Label>
                                            <div className="flex">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                    placeholder="0.00"
                                                    className="rounded-r-none"
                                                />
                                                <Select value={data.weight_unit} onValueChange={(value) => setData('weight_unit', value)}>
                                                    <SelectTrigger className="w-20 rounded-l-none border-l-0">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="kg">kg</SelectItem>
                                                        <SelectItem value="g">g</SelectItem>
                                                        <SelectItem value="lb">lb</SelectItem>
                                                        <SelectItem value="oz">oz</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.length}
                                                onChange={(e) => setData('length', e.target.value)}
                                                placeholder="Length (cm)"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.width}
                                                onChange={(e) => setData('width', e.target.value)}
                                                placeholder="Width (cm)"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value)}
                                                placeholder="Height (cm)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                            <CardDescription>Add tags to help customers find your product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" onClick={addTag} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.tags && data.tags.length > 0 ? (
                                        data.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                {tag}
                                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No tags added yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>Upload images to showcase your product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div
                                    className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                                </div>

                                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />

                                {imagePreviewUrls && imagePreviewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="group relative">
                                                <img src={url} alt={`Product ${index + 1}`} className="h-32 w-full rounded-lg border object-cover" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                {index === 0 && <Badge className="absolute bottom-2 left-2">Main Image</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                            <CardDescription>Optimize your product for search engines</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="handle">URL Handle</Label>
                                <Input
                                    id="handle"
                                    value={data.handle}
                                    onChange={(e) => setData('handle', e.target.value)}
                                    placeholder="product-url-handle"
                                />
                                {errors.handle && <p className="mt-1 text-sm text-red-600">{errors.handle}</p>}
                                <p className="mt-1 text-xs text-gray-500">This will be used in the product URL</p>
                            </div>

                            <div>
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder="SEO title for search engines"
                                />
                                {errors.meta_title && <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
                                    placeholder="SEO description for search engines"
                                    rows={3}
                                />
                                {errors.meta_description && <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>}
                                <p className="mt-1 text-xs text-gray-500">{data.meta_description.length}/160 characters</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between border-t pt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/seller/products/${product.id}`)}>
                            Cancel
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setData('status', 'draft');
                                    // Create a simple synthetic event
                                    const syntheticEvent = {
                                        preventDefault: () => {},
                                        currentTarget: null,
                                    } as unknown as React.FormEvent;
                                    handleSubmit(syntheticEvent);
                                }}
                                disabled={processing}
                            >
                                Save as Draft
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Update Product
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
