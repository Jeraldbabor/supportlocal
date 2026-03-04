import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, DollarSign, Eye, Info, Package, Save, Tag, Truck, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

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
    image_urls?: string[];
    status: 'active' | 'draft' | 'archived';
    requires_shipping: boolean;
    taxable: boolean;
    meta_title?: string;
    meta_description?: string;
    handle?: string;
    shipping_cost?: number;
    free_shipping?: boolean;
    is_digital?: boolean;
    is_featured?: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number;
    children?: Category[];
}

interface EditProps extends SharedData {
    product: Product;
    categories: Category[];
    conditions: Record<string, string>;
}

const steps = [
    { id: 'basic', label: 'Basic Info', icon: Package, description: 'Name, description & images' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Update prices' },
    { id: 'inventory', label: 'Inventory', icon: Tag, description: 'Stock & tracking' },
    { id: 'shipping', label: 'Shipping', icon: Truck, description: 'Weight & delivery' },
    { id: 'review', label: 'Review', icon: Eye, description: 'Review & save' },
];

export default function Edit({ product, categories, conditions }: EditProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(product.image_urls || []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Seller Dashboard', href: '/seller/dashboard' },
        { title: 'Products', href: '/seller/products' },
        { title: 'Edit Product', href: `/seller/products/${product.id}/edit` },
    ];

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
        low_stock_threshold: product.low_stock_threshold?.toString() || '5',
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
                reader.onload = (ev) => {
                    setImagePreviewUrls((prev) => [...prev, ev.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        const existingImagesLength = product.images?.length || 0;
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        setImagePreviewUrls(newPreviewUrls);

        if (index < existingImagesLength) {
            const imageToRemove = product.images?.[index];
            if (imageToRemove) {
                const currentExistingImages = data.existing_images || [];
                const newExistingImages = currentExistingImages.filter((img) => img !== imageToRemove);
                setData('existing_images', newExistingImages);
            }
        } else {
            const newImageIndex = index - existingImagesLength;
            const newSelectedImages = selectedImages.filter((_, i) => i !== newImageIndex);
            setSelectedImages(newSelectedImages);
            setData('images', newSelectedImages);
        }
    };

    const addTag = (tag: string) => {
        const currentTags = data.tags || [];
        if (tag.trim() && !currentTags.includes(tag.trim())) {
            setData('tags', [...currentTags, tag.trim()]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = data.tags || [];
        setData(
            'tags',
            currentTags.filter((tag) => tag !== tagToRemove),
        );
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (step === 0) {
            if (!data.name.trim()) newErrors.name = 'Product name is required.';
            if (!data.description.trim()) newErrors.description = 'Description is required.';
            if (data.description.trim() && data.description.trim().length < 10) {
                newErrors.description = 'Description must be at least 10 characters.';
            }
        }
        if (step === 1) {
            if (!data.price || parseFloat(data.price) <= 0) newErrors.price = 'Price is required and must be greater than 0.';
        }
        setStepErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToBack = () => {
        setStepErrors({});
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: number) => {
        if (step <= currentStep) {
            setStepErrors({});
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent, submitStatus?: string) => {
        e.preventDefault();
        setShowError(false);
        setShowSuccess(false);

        // Calculate which images to remove
        const originalImages = product.images || [];
        const currentExistingImages = data.existing_images || [];
        const imagesToRemove = originalImages.filter((img) => !currentExistingImages.includes(img));

        // Submit directly using the useForm state, mapping the special fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitData: Record<string, any> = {
            ...data,
            new_images: selectedImages,
            remove_images: imagesToRemove,
            _method: 'PUT', // Method spoofing for file uploads
        };

        if (submitStatus) {
            submitData.status = submitStatus;
        }

        // The 'images' field from useForm data is mapped to 'new_images' on backend
        delete submitData.images;

        const options = {
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
            onError: (errors: Record<string, string | string[]>) => {
                console.error('Product update failed:', errors);
                const errorMessages = typeof errors === 'object' ? Object.values(errors).flat() : ['An error occurred'];
                const detailedMessage =
                    errorMessages.length > 0 ? errorMessages.join(', ') : 'Failed to update product. Please check your input and try again.';
                setErrorMessage(detailedMessage);
                setShowError(true);
            },
        };

        router.post(`/seller/products/${product.id}`, submitData, options);
    };

    const getCategoryName = (id: string) => {
        const findCategory = (cats: Category[]): string | null => {
            for (const cat of cats) {
                if (cat.id.toString() === id) return cat.name;
                if (cat.children) {
                    const found = findCategory(cat.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findCategory(categories) || '—';
    };

    const getConditionLabel = (key: string) => {
        return conditions[key] || key;
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = { active: 'Active', draft: 'Draft', archived: 'Archived' };
        return map[status] || status;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${product.name}`} />

            <div
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-3 sm:gap-6 sm:p-6"
                style={{ colorScheme: 'light' }}
            >
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href={`/seller/products/${product.id}`} className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50">
                            <ArrowLeft className="h-4 w-4" style={{ color: '#374151' }} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">Edit Product</h1>
                            <p className="text-xs text-gray-600 sm:text-base">Update {product.name}</p>
                        </div>
                    </div>
                    {/* Status badge */}
                    <span
                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                            data.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : data.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {getStatusLabel(data.status)}
                    </span>
                </div>

                {/* Progress Stepper */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={step.id} className="flex flex-1 items-center">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        className={`group flex flex-col items-center gap-1 transition-all sm:gap-1.5 ${
                                            isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12 ${
                                                isCompleted
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : isCurrent
                                                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-md shadow-orange-100'
                                                      : 'border-gray-200 bg-gray-50 text-gray-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                            ) : (
                                                <StepIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`hidden text-center text-xs font-medium sm:block sm:text-sm ${
                                                isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                        {isCurrent && (
                                            <span className="block text-center text-[10px] font-medium text-orange-600 sm:hidden">{step.label}</span>
                                        )}
                                        <span className="hidden text-center text-xs text-gray-400 md:block">{step.description}</span>
                                    </button>

                                    {index < steps.length - 1 && (
                                        <div className="mx-1 mb-2 h-0.5 flex-1 sm:mx-3 sm:mb-8">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    index < currentStep ? 'bg-green-400' : 'bg-gray-200'
                                                }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alerts */}
                {showSuccess && (
                    <Alert className="border-green-500 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" style={{ color: '#16a34a' }} />
                        <AlertDescription>Product updated successfully!</AlertDescription>
                    </Alert>
                )}
                {showError && (
                    <Alert className="border-red-500 bg-red-50 text-red-800">
                        <X className="h-4 w-4" style={{ color: '#dc2626' }} />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={(e) => e.preventDefault()} className="mx-auto w-full max-w-3xl">
                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Basic Information</h2>
                                <p className="mt-1 text-sm text-gray-500">Update your product details</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none ${
                                            stepErrors.name || errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter product name"
                                    />
                                    {(stepErrors.name || errors.name) && (
                                        <p className="mt-1.5 text-sm text-red-600">{stepErrors.name || errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Short Description</label>
                                    <input
                                        type="text"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Brief description for listings"
                                        maxLength={500}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={5}
                                        className={`block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none ${
                                            stepErrors.description || errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Detailed description of your handcrafted product..."
                                    />
                                    {(stepErrors.description || errors.description) && (
                                        <p className="mt-1.5 text-sm text-red-600">{stepErrors.description || errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Condition <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.condition}
                                            onChange={(e) => setData('condition', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                        >
                                            {Object.entries(conditions).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Product Images */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Product Images</label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="group relative">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-24 w-full rounded-lg border object-cover sm:h-28"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-1 left-1 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50 sm:h-28"
                                        >
                                            <Upload className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6" />
                                            <span className="text-xs text-gray-500">Add Image</span>
                                        </button>
                                    </div>
                                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                                    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                                        Upload up to 10 images. First image will be used as featured image.
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
                                    {data.tags && data.tags.length > 0 && (
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            {data.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-orange-500 hover:text-orange-700"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Add tags (press Enter)"
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTag(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">Press Enter to add tags</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing */}
                    {currentStep === 1 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Pricing</h2>
                                <p className="mt-1 text-sm text-gray-500">Update your product prices</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Price (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none ${
                                            stepErrors.price || errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {(stepErrors.price || errors.price) && (
                                        <p className="mt-1.5 text-sm text-red-600">{stepErrors.price || errors.price}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Compare at Price (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.compare_at_price}
                                            onChange={(e) => setData('compare_at_price', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Original price to show discount</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Cost per Item (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.cost_per_item}
                                            onChange={(e) => setData('cost_per_item', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Your cost for profit tracking</p>
                                    </div>
                                </div>

                                {/* Status selector */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Product Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'draft' | 'archived')}
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 sm:p-4">
                                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                                    <div className="text-xs text-blue-700 sm:text-sm">
                                        <p className="font-medium">Pricing tip</p>
                                        <p className="mt-0.5">
                                            Set a &quot;Compare at Price&quot; higher than your selling price to show customers they&apos;re getting a
                                            deal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Inventory */}
                    {currentStep === 2 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Inventory</h2>
                                <p className="mt-1 text-sm text-gray-500">Manage your stock levels</p>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="Stock Keeping Unit"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Barcode</label>
                                        <input
                                            type="text"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="ISBN, UPC, GTIN, etc."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.low_stock_threshold}
                                            onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="5"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Alert when stock falls below this number</p>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="track_quantity"
                                            checked={data.track_quantity}
                                            onChange={(e) => setData('track_quantity', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="track_quantity" className="ml-3 text-sm text-gray-700">
                                            Track quantity for this product
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="continue_selling"
                                            checked={data.continue_selling_when_out_of_stock}
                                            onChange={(e) => setData('continue_selling_when_out_of_stock', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="continue_selling" className="ml-3 text-sm text-gray-700">
                                            Continue selling when out of stock
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="taxable"
                                            checked={data.taxable}
                                            onChange={(e) => setData('taxable', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="taxable" className="ml-3 text-sm text-gray-700">
                                            Charge tax on this product
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Shipping */}
                    {currentStep === 3 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Shipping</h2>
                                <p className="mt-1 text-sm text-gray-500">Configure shipping and delivery options</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="requires_shipping"
                                            checked={data.requires_shipping}
                                            onChange={(e) => setData('requires_shipping', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="requires_shipping" className="ml-3 text-sm text-gray-700">
                                            This product requires shipping
                                        </label>
                                    </div>
                                </div>

                                {data.requires_shipping && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Weight</label>
                                                <div className="flex">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.weight}
                                                        onChange={(e) => setData('weight', e.target.value)}
                                                        className="block w-full rounded-l-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                        placeholder="0.00"
                                                    />
                                                    <select
                                                        value={data.weight_unit}
                                                        onChange={(e) => setData('weight_unit', e.target.value)}
                                                        className="rounded-r-lg border border-l-0 border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="g">g</option>
                                                        <option value="lb">lb</option>
                                                        <option value="oz">oz</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.length}
                                                    onChange={(e) => setData('length', e.target.value)}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none sm:px-4"
                                                    placeholder="Length"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.width}
                                                    onChange={(e) => setData('width', e.target.value)}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none sm:px-4"
                                                    placeholder="Width"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.height}
                                                    onChange={(e) => setData('height', e.target.value)}
                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none sm:px-4"
                                                    placeholder="Height"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Save */}
                    {currentStep === 4 && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Review Your Changes</h2>
                                    <p className="mt-1 text-sm text-gray-500">Review all details before saving. Click any section to edit.</p>
                                </div>

                                <div className="space-y-4 sm:space-y-5">
                                    {/* Basic Info Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(0)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 sm:p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between sm:mb-3">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Package className="h-4 w-4 text-orange-500" />
                                                Basic Information
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:gap-3 sm:text-sm">
                                            <div>
                                                <span className="text-gray-500">Name:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.name || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Category:</span>
                                                <span className="ml-1 font-medium text-gray-900">{getCategoryName(data.category_id)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Condition:</span>
                                                <span className="ml-1 font-medium text-gray-900">{getConditionLabel(data.condition)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Images:</span>
                                                <span className="ml-1 font-medium text-gray-900">{imagePreviewUrls.length}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Pricing Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(1)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 sm:p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between sm:mb-3">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <DollarSign className="h-4 w-4 text-orange-500" />
                                                Pricing
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 sm:gap-3 sm:text-sm">
                                            <div>
                                                <span className="text-gray-500">Price:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.price ? `₱${parseFloat(data.price).toFixed(2)}` : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Compare:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.compare_at_price ? `₱${parseFloat(data.compare_at_price).toFixed(2)}` : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Status:</span>
                                                <span className="ml-1 font-medium text-gray-900">{getStatusLabel(data.status)}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Inventory Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(2)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 sm:p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between sm:mb-3">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Tag className="h-4 w-4 text-orange-500" />
                                                Inventory
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 sm:gap-3 sm:text-sm">
                                            <div>
                                                <span className="text-gray-500">Qty:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.quantity || '0'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">SKU:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.sku || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Tracking:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.track_quantity ? 'On' : 'Off'}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Shipping Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(3)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 sm:p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between sm:mb-3">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Truck className="h-4 w-4 text-orange-500" />
                                                Shipping
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 sm:gap-3 sm:text-sm">
                                            <div>
                                                <span className="text-gray-500">Shipping:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.requires_shipping ? 'Required' : 'Not required'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Weight:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.weight ? `${data.weight} ${data.weight_unit}` : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                                <div className="mb-6">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 sm:text-xl">
                                        <Info className="h-5 w-5 text-orange-500" />
                                        SEO & Meta <span className="text-sm font-normal text-gray-400">(Optional)</span>
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">Optimize your product for search engines</p>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">URL Handle</label>
                                        <input
                                            type="text"
                                            value={data.handle}
                                            onChange={(e) => setData('handle', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="product-url-handle"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">This will be used in the product URL</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Meta Title</label>
                                        <input
                                            type="text"
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="SEO title for search engines"
                                            maxLength={255}
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">{data.meta_title.length}/255 characters</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Meta Description</label>
                                        <textarea
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            rows={3}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="SEO description for search engines"
                                            maxLength={500}
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">{data.meta_description.length}/500 characters</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-4 flex items-center justify-between sm:mt-6">
                        <div>
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={goToBack}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-5"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back</span>
                                </button>
                            )}
                            {currentStep === 0 && (
                                <Link
                                    href={`/seller/products/${product.id}`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-5"
                                >
                                    Cancel
                                </Link>
                            )}
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            {currentStep < steps.length - 1 && (
                                <button
                                    type="button"
                                    onClick={goToNext}
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:px-6"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            )}

                            {currentStep === steps.length - 1 && (
                                <>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={(e) => handleSubmit(e, 'draft')}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:px-5"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span className="hidden sm:inline">Save as Draft</span>
                                        <span className="sm:hidden">Draft</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={(e) => handleSubmit(e)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 sm:px-6"
                                    >
                                        {processing ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="hidden sm:inline">Update Product</span>
                                                <span className="sm:hidden">Update</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
