import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, DollarSign, Info, Package, Save, Tag, Truck, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
    {
        title: 'Create Product',
        href: '/seller/products/create',
    },
];

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    parent_id?: number;
}

interface CreateProductProps extends SharedData {
    categories: ProductCategory[];
    statuses: Record<string, string>;
    conditions: Record<string, string>;
    stockStatuses: Record<string, string>;
}

export default function CreateProduct({ categories, conditions }: CreateProductProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        short_description: '',
        price: '',
        compare_price: '',
        cost_price: '',
        category_id: '',
        quantity: '0',
        low_stock_threshold: '5',
        track_quantity: true,
        allow_backorders: false,
        weight: '',
        weight_unit: 'kg',
        dimensions: {
            length: '',
            width: '',
            height: '',
        },
        condition: 'new',
        status: 'draft',
        is_featured: false,
        is_digital: false,
        requires_shipping: true,
        shipping_cost: '',
        free_shipping: false,
        meta_title: '',
        meta_description: '',
        tags: [] as string[],
        images: [] as File[],
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files);
        const newPreviews: string[] = [];

        newImages.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    if (newPreviews.length === newImages.length) {
                        setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });

        setSelectedImages((prev) => [...prev, ...newImages]);
        setData('images', [...selectedImages, ...newImages]);
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviewUrls.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviews);
        setData('images', newImages);
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !data.tags.includes(tag.trim())) {
            setData('tags', [...data.tags, tag.trim()]);
        }
    };

    const removeTag = (index: number) => {
        setData(
            'tags',
            data.tags.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowError(false);
        setShowSuccess(false);

        post('/seller/products', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Product created successfully!',
                    icon: 'success',
                    confirmButtonColor: '#16a34a',
                    confirmButtonText: 'View Products',
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.visit('/seller/products');
                    }
                });
            },
            onError: (errors) => {
                console.error('Product creation failed:', errors);
                console.log('Detailed errors:', JSON.stringify(errors, null, 2));

                // Extract meaningful error message
                const errorMessages = Object.values(errors).flat();
                const detailedMessage =
                    errorMessages.length > 0 ? errorMessages.join(', ') : 'Failed to create product. Please check your input and try again.';

                setErrorMessage(detailedMessage);
                setShowError(true);
            },
        });
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'inventory', label: 'Inventory', icon: Tag },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'seo', label: 'SEO & Meta', icon: Info },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product - Seller Dashboard" />

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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Product</h1>
                            <p className="text-gray-600 dark:text-gray-300">Add a new handcrafted product to your store</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setData('status', 'draft')}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('status', 'active')}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Save className="mr-2 inline h-4 w-4" />
                            Save & Publish
                        </button>
                    </div>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="mb-6 border-green-500 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Product created successfully! Redirecting to products list...</AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {showError && (
                    <Alert className="mb-6 border-red-500 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                        <X className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-lg border bg-white p-4 dark:bg-gray-900">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="Enter product name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                                        <input
                                            type="text"
                                            value={data.short_description}
                                            onChange={(e) => setData('short_description', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="Brief description for listings"
                                            maxLength={500}
                                        />
                                        {errors.short_description && <p className="mt-1 text-sm text-red-600">{errors.short_description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={6}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="Detailed description of your handcrafted product..."
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition *</label>
                                            <select
                                                value={data.condition}
                                                onChange={(e) => setData('condition', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            >
                                                {Object.entries(conditions).map(([key, label]) => (
                                                    <option key={key} value={key}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                                        </div>
                                    </div>

                                    {/* Product Images */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Product Images</label>

                                        {/* Image Grid */}
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                            {imagePreviewUrls.map((url, index) => (
                                                <div key={index} className="group relative">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-24 w-full rounded-lg border object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-1 left-1 rounded bg-blue-500 px-1 py-0.5 text-xs text-white">
                                                            Featured
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Upload Button */}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                                <Upload className="h-6 w-6 text-gray-400" />
                                            </button>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />

                                        <p className="mt-2 text-sm text-gray-500">
                                            Upload up to 10 images. First image will be used as featured image.
                                        </p>
                                        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                                        <div className="mt-1">
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {data.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(index)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Add tags (press Enter)"
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag(e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">Press Enter to add tags. Example: handmade, ceramic, artisan</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 'pricing' && (
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Pricing</h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price * (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="0.00"
                                        />
                                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compare Price (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.compare_price}
                                            onChange={(e) => setData('compare_price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="0.00"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Original price for discount display</p>
                                        {errors.compare_price && <p className="mt-1 text-sm text-red-600">{errors.compare_price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.cost_price}
                                            onChange={(e) => setData('cost_price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="0.00"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Your cost for profit calculation</p>
                                        {errors.cost_price && <p className="mt-1 text-sm text-red-600">{errors.cost_price}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Inventory Tab */}
                        {activeTab === 'inventory' && (
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Inventory</h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                placeholder="0"
                                            />
                                            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Low Stock Threshold *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.low_stock_threshold}
                                                onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                placeholder="5"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Alert when stock falls below this number</p>
                                            {errors.low_stock_threshold && <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="track_quantity"
                                                checked={data.track_quantity}
                                                onChange={(e) => setData('track_quantity', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="track_quantity" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                Track quantity for this product
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="allow_backorders"
                                                checked={data.allow_backorders}
                                                onChange={(e) => setData('allow_backorders', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="allow_backorders" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                Allow customers to purchase when out of stock
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Tab */}
                        {activeTab === 'shipping' && (
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Shipping</h2>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="requires_shipping"
                                                checked={data.requires_shipping}
                                                onChange={(e) => setData('requires_shipping', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="requires_shipping" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                This product requires shipping
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_digital"
                                                checked={data.is_digital}
                                                onChange={(e) => setData('is_digital', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_digital" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                This is a digital product
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="free_shipping"
                                                checked={data.free_shipping}
                                                onChange={(e) => setData('free_shipping', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="free_shipping" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                Free shipping
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                                            <div className="mt-1 flex">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                    className="block w-full rounded-l-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                    placeholder="0.00"
                                                />
                                                <select
                                                    value={data.weight_unit}
                                                    onChange={(e) => setData('weight_unit', e.target.value)}
                                                    className="rounded-r-lg border border-l-0 border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="lb">lb</option>
                                                    <option value="oz">oz</option>
                                                </select>
                                            </div>
                                            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Cost (₱)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.shipping_cost}
                                                onChange={(e) => setData('shipping_cost', e.target.value)}
                                                disabled={data.free_shipping}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                                                placeholder="0.00"
                                            />
                                            {errors.shipping_cost && <p className="mt-1 text-sm text-red-600">{errors.shipping_cost}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Dimensions (cm)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.dimensions.length}
                                                    onChange={(e) => setData('dimensions', { ...data.dimensions, length: e.target.value })}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                    placeholder="Length"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.dimensions.width}
                                                    onChange={(e) => setData('dimensions', { ...data.dimensions, width: e.target.value })}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                    placeholder="Width"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.dimensions.height}
                                                    onChange={(e) => setData('dimensions', { ...data.dimensions, height: e.target.value })}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                                    placeholder="Height"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO Tab */}
                        {activeTab === 'seo' && (
                            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">SEO & Meta</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                                        <input
                                            type="text"
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="SEO title for search engines"
                                            maxLength={255}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{data.meta_title.length}/255 characters</p>
                                        {errors.meta_title && <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                                        <textarea
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                            placeholder="SEO description for search engines"
                                            maxLength={500}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{data.meta_description.length}/500 characters</p>
                                        {errors.meta_description && <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                checked={data.is_featured}
                                                onChange={(e) => setData('is_featured', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                Feature this product
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href="/seller/products"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
