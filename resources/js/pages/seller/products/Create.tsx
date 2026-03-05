import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, DollarSign, Eye, Info, Package, Save, Tag, Truck, Upload, X } from 'lucide-react';
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

const steps = [
    { id: 'basic', label: 'Basic Info', icon: Package, description: 'Name, description & images' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Set your prices' },
    { id: 'inventory', label: 'Inventory', icon: Tag, description: 'Stock & tracking' },
    { id: 'shipping', label: 'Shipping', icon: Truck, description: 'Weight & delivery' },
    { id: 'review', label: 'Review', icon: Eye, description: 'Review & publish' },
];

export default function CreateProduct({ categories, conditions }: CreateProductProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
    const [isOnSale, setIsOnSale] = useState(false);

    const { data, setData, processing, errors } = useForm({
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

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!data.name.trim()) newErrors.name = 'Product name is required.';
            if (!data.description.trim()) newErrors.description = 'Product description is required.';
        }

        if (step === 1) {
            if (!data.price || parseFloat(data.price) <= 0) newErrors.price = 'Price is required and must be greater than 0.';
        }

        if (step === 2) {
            if (!data.quantity && data.quantity !== '0') newErrors.quantity = 'Quantity is required.';
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
        // Only allow going to previous steps or current step
        if (step <= currentStep) {
            setStepErrors({});
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent, publishStatus: 'draft' | 'active' = 'draft') => {
        e.preventDefault();
        setShowError(false);
        setShowSuccess(false);

        // Submit directly using the useForm state, overriding the status
        const submitData = {
            ...data,
            status: publishStatus,
        };

        const options = {
            forceFormData: true,
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
            onError: (errors: Record<string, string | string[]>) => {
                console.error('Product creation failed:', errors);
                const errorMessages = typeof errors === 'object' ? Object.values(errors).flat() : ['An error occurred'];
                const detailedMessage =
                    errorMessages.length > 0 ? errorMessages.join(', ') : 'Failed to create product. Please check your input and try again.';

                setErrorMessage(detailedMessage);
                setShowError(true);
            },
        };

        router.post('/seller/products', submitData, options);
    };

    const getCategoryName = (id: string) => {
        const cat = categories.find((c) => c.id.toString() === id);
        return cat?.name || '—';
    };

    const getConditionLabel = (key: string) => {
        return conditions[key] || key;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product - Seller Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 sm:p-6" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller/products" className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50">
                            <ArrowLeft className="h-4 w-4" style={{ color: '#374151' }} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Create Product</h1>
                            <p className="text-sm text-gray-600 sm:text-base">Add a new handcrafted product to your store</p>
                        </div>
                    </div>
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
                                        {/* Step circle */}
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
                                        {/* Step label - hidden on mobile, visible on sm+ */}
                                        <span
                                            className={`hidden text-center text-xs font-medium sm:block sm:text-sm ${
                                                isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                        {/* Mobile-only: show abbreviated label for current step */}
                                        {isCurrent && (
                                            <span className="block text-center text-[10px] font-medium text-orange-600 sm:hidden">{step.label}</span>
                                        )}
                                        <span className="hidden text-center text-xs text-gray-400 md:block">{step.description}</span>
                                    </button>

                                    {/* Connector line */}
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

                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="border-green-500 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" style={{ color: '#16a34a' }} />
                        <AlertDescription>Product created successfully!</AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {showError && (
                    <Alert className="border-red-500 bg-red-50 text-red-800">
                        <X className="h-4 w-4" style={{ color: '#dc2626' }} />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    className="mx-auto w-full max-w-3xl"
                >
                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                <p className="mt-1 text-sm text-gray-500">Tell us about your product</p>
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
                                    {errors.short_description && <p className="mt-1.5 text-sm text-red-600">{errors.short_description}</p>}
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
                                        {errors.category_id && <p className="mt-1.5 text-sm text-red-600">{errors.category_id}</p>}
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
                                        {errors.condition && <p className="mt-1.5 text-sm text-red-600">{errors.condition}</p>}
                                    </div>
                                </div>

                                {/* Product Images */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Product Images</label>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="group relative">
                                                <img src={url} alt={`Preview ${index + 1}`} className="h-28 w-full rounded-lg border object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-1 left-1 rounded bg-orange-500 px-1.5 py-0.5 text-xs font-medium text-white">
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50"
                                        >
                                            <Upload className="h-6 w-6 text-gray-400" />
                                            <span className="text-xs text-gray-500">Add Image</span>
                                        </button>
                                    </div>

                                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />

                                    <p className="mt-2 text-sm text-gray-500">Upload up to 10 images. First image will be used as featured image.</p>
                                    {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
                                    <div>
                                        {data.tags.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {data.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(index)}
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
                                    </div>
                                    <p className="mt-1.5 text-sm text-gray-500">Press Enter to add. Example: handmade, ceramic, artisan</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing */}
                    {currentStep === 1 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
                                <p className="mt-1 text-sm text-gray-500">Set competitive prices for your product</p>
                            </div>

                            <div className="space-y-5">
                                {/* Original Price */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Original Price (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={isOnSale ? data.compare_price : data.price}
                                        onChange={(e) => setData(isOnSale ? 'compare_price' : 'price', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none ${
                                            !isOnSale && (stepErrors.price || errors.price) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">Your product's regular price</p>
                                    {!isOnSale && (stepErrors.price || errors.price) && (
                                        <p className="mt-1.5 text-sm text-red-600">{stepErrors.price || errors.price}</p>
                                    )}
                                </div>

                                {/* Sale Toggle */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isOnSale}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setIsOnSale(checked);
                                                if (checked) {
                                                    setData({ ...data, compare_price: data.price, price: '' });
                                                } else {
                                                    setData({ ...data, price: data.compare_price || data.price, compare_price: '' });
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">This product is on sale</span>
                                            <p className="text-xs text-gray-500">Show a discounted price alongside the original</p>
                                        </div>
                                    </label>

                                    {isOnSale && (
                                        <div className="mt-3">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Sale Price (₱) <span className="text-red-500">*</span>
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
                                                placeholder="Enter the discounted price"
                                            />
                                            {(stepErrors.price || errors.price) && (
                                                <p className="mt-1.5 text-sm text-red-600">{stepErrors.price || errors.price}</p>
                                            )}
                                            {data.compare_price && data.price && parseFloat(data.compare_price) > parseFloat(data.price) && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
                                                    🏷️{' '}
                                                    {Math.round(
                                                        ((parseFloat(data.compare_price) - parseFloat(data.price)) / parseFloat(data.compare_price)) *
                                                            100,
                                                    )}
                                                    % off — customers will see the savings!
                                                </p>
                                            )}
                                            {data.compare_price &&
                                                data.price &&
                                                parseFloat(data.price) > 0 &&
                                                parseFloat(data.price) >= parseFloat(data.compare_price) && (
                                                    <p className="mt-1.5 text-xs text-amber-600">
                                                        Sale price should be lower than the original price
                                                    </p>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Inventory */}
                    {currentStep === 2 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
                                <p className="mt-1 text-sm text-gray-500">Manage your stock levels</p>
                            </div>

                            <div className="space-y-5">
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
                                            className={`block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none ${
                                                stepErrors.quantity || errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                        />
                                        {(stepErrors.quantity || errors.quantity) && (
                                            <p className="mt-1.5 text-sm text-red-600">{stepErrors.quantity || errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Low Stock Threshold <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.low_stock_threshold}
                                            onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                            placeholder="5"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Alert when stock falls below this number</p>
                                        {errors.low_stock_threshold && <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>}
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
                                            id="allow_backorders"
                                            checked={data.allow_backorders}
                                            onChange={(e) => setData('allow_backorders', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="allow_backorders" className="ml-3 text-sm text-gray-700">
                                            Allow customers to purchase when out of stock
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Shipping */}
                    {currentStep === 3 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Shipping</h2>
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

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_digital"
                                            checked={data.is_digital}
                                            onChange={(e) => setData('is_digital', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_digital" className="ml-3 text-sm text-gray-700">
                                            This is a digital product
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="free_shipping"
                                            checked={data.free_shipping}
                                            onChange={(e) => setData('free_shipping', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="free_shipping" className="ml-3 text-sm text-gray-700">
                                            Free shipping
                                        </label>
                                    </div>
                                </div>

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
                                        {errors.weight && <p className="mt-1.5 text-sm text-red-600">{errors.weight}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Shipping Cost (₱)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.shipping_cost}
                                            onChange={(e) => setData('shipping_cost', e.target.value)}
                                            disabled={data.free_shipping}
                                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                            placeholder="0.00"
                                        />
                                        {errors.shipping_cost && <p className="mt-1.5 text-sm text-red-600">{errors.shipping_cost}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.dimensions.length}
                                                onChange={(e) => setData('dimensions', { ...data.dimensions, length: e.target.value })}
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                placeholder="Height"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Publish */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Review Your Product</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Review all the details before publishing. Click on any section to make changes.
                                    </p>
                                </div>

                                {/* Product Summary */}
                                <div className="space-y-5">
                                    {/* Basic Info Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(0)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Package className="h-4 w-4 text-orange-500" />
                                                Basic Information
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
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
                                                <span className="ml-1 font-medium text-gray-900">{selectedImages.length} uploaded</span>
                                            </div>
                                        </div>
                                        {data.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{data.description}</p>}
                                    </button>

                                    {/* Pricing Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(1)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <DollarSign className="h-4 w-4 text-orange-500" />
                                                Pricing
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Original Price:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {(isOnSale ? data.compare_price : data.price)
                                                        ? `₱${parseFloat(isOnSale ? data.compare_price : data.price).toFixed(2)}`
                                                        : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Sale Price:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {isOnSale && data.price ? `₱${parseFloat(data.price).toFixed(2)}` : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Inventory Summary */}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(2)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Tag className="h-4 w-4 text-orange-500" />
                                                Inventory
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Quantity:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.quantity || '0'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Low Stock:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.low_stock_threshold || '5'}</span>
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
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Truck className="h-4 w-4 text-orange-500" />
                                                Shipping
                                            </h3>
                                            <span className="text-xs text-orange-500">Edit →</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Shipping:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.free_shipping ? 'Free' : data.requires_shipping ? 'Required' : 'Not required'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Weight:</span>
                                                <span className="ml-1 font-medium text-gray-900">
                                                    {data.weight ? `${data.weight} ${data.weight_unit}` : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Digital:</span>
                                                <span className="ml-1 font-medium text-gray-900">{data.is_digital ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* SEO Section on Review page */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-6">
                                    <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                        <Info className="h-5 w-5 text-orange-500" />
                                        SEO & Meta <span className="text-sm font-normal text-gray-400">(Optional)</span>
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">Optimize your product for search engines</p>
                                </div>

                                <div className="space-y-5">
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
                                        {errors.meta_title && <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>}
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
                                        {errors.meta_description && <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>}
                                    </div>

                                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_featured" className="ml-3 text-sm text-gray-700">
                                            Feature this product on your store
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={goToBack}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>
                            )}
                            {currentStep === 0 && (
                                <Link
                                    href="/seller/products"
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {currentStep < steps.length - 1 && (
                                <button
                                    type="button"
                                    onClick={goToNext}
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
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
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save as Draft
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={(e) => handleSubmit(e, 'active')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            'Creating...'
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Create & Publish
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
