import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    ChevronDown,
    DollarSign,
    Image as ImageIcon,
    Loader2,
    Package,
    PenTool,
    Search,
    Send,
    Sparkles,
    Upload,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Seller {
    id: number;
    name: string;
    avatar_url: string | null;
    address?: string;
}

interface Props {
    seller: Seller | null;
    sellers: Seller[] | null;
}

export default function CustomOrderCreate({ seller, sellers }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        seller_id: seller?.id?.toString() || '',
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        quantity: '1',
        preferred_deadline: '',
        special_requirements: '',
        reference_images: [] as File[],
    });

    // Filter sellers based on search query
    const filteredSellers = sellers?.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSeller = (selectedSeller: Seller) => {
        setData('seller_id', selectedSeller.id.toString());
        setSearchQuery('');
        setIsDropdownOpen(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxImages = 5;
        const currentCount = data.reference_images.length;

        if (currentCount + files.length > maxImages) {
            alert(`You can upload a maximum of ${maxImages} images.`);
            return;
        }

        // Create preview URLs
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);

        // Update form data
        setData('reference_images', [...data.reference_images, ...files]);
    };

    const removeImage = (index: number) => {
        const newImages = [...data.reference_images];
        newImages.splice(index, 1);
        setData('reference_images', newImages);

        const newPreviews = [...previewImages];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/buyer/custom-orders', {
            forceFormData: true,
        });
    };

    const selectedSeller = seller || (sellers?.find((s) => s.id.toString() === data.seller_id) ?? null);

    return (
        <BuyerLayout title="Request Custom Order">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/buyer/custom-orders" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Custom Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                            <PenTool className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Request Custom Order</h1>
                            <p className="text-gray-600">Tell the artisan what you want them to create for you</p>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="flex items-start gap-4 pt-6">
                        <Sparkles className="h-6 w-6 flex-shrink-0 text-amber-600" />
                        <div>
                            <h3 className="font-semibold text-amber-900">How Custom Orders Work</h3>
                            <ul className="mt-2 space-y-1 text-sm text-amber-800">
                                <li>1. Submit your request with details about what you want</li>
                                <li>2. The artisan will review and send you a quote</li>
                                <li>3. Accept the quote to proceed, or decline to find another artisan</li>
                                <li>4. Track your order progress until completion</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Seller Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-amber-600" />
                                    Select Artisan
                                </CardTitle>
                                <CardDescription>Choose the artisan you want to create your custom product</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {seller ? (
                                    <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={seller.avatar_url || undefined} />
                                            <AvatarFallback className="bg-amber-100 text-xl text-amber-700">
                                                {seller.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-gray-900">{seller.name}</p>
                                            {seller.address && <p className="text-sm text-gray-500">{seller.address}</p>}
                                        </div>
                                        <Link href="/buyer/sellers">
                                            <Button variant="outline" size="sm">
                                                Change
                                            </Button>
                                        </Link>
                                    </div>
                                ) : sellers && sellers.length > 0 ? (
                                    <div>
                                        {/* Searchable Dropdown */}
                                        <div className="relative" ref={dropdownRef}>
                                            <div
                                                className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-3 transition-all ${
                                                    errors.seller_id ? 'border-red-500' : 'border-gray-300 hover:border-amber-400'
                                                } ${isDropdownOpen ? 'ring-opacity-50 ring-2 ring-amber-500' : ''}`}
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            >
                                                {selectedSeller ? (
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={selectedSeller.avatar_url || undefined} />
                                                            <AvatarFallback className="bg-amber-100 text-sm text-amber-700">
                                                                {selectedSeller.name?.[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-900">{selectedSeller.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Select an artisan...</span>
                                                )}
                                                <ChevronDown
                                                    className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>

                                            {isDropdownOpen && (
                                                <div className="absolute z-50 mt-2 max-h-80 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                                                    {/* Search Input */}
                                                    <div className="sticky top-0 border-b bg-white p-3">
                                                        <div className="relative">
                                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search artisan by name..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Artisan List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredSellers.length > 0 ? (
                                                            filteredSellers.map((s) => (
                                                                <div
                                                                    key={s.id}
                                                                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-amber-50 ${
                                                                        data.seller_id === s.id.toString() ? 'bg-amber-50' : ''
                                                                    }`}
                                                                    onClick={() => handleSelectSeller(s)}
                                                                >
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={s.avatar_url || undefined} />
                                                                        <AvatarFallback className="bg-amber-100 text-amber-700">
                                                                            {s.name?.[0]?.toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">{s.name}</p>
                                                                        {s.address && <p className="text-sm text-gray-500">{s.address}</p>}
                                                                    </div>
                                                                    {data.seller_id === s.id.toString() && (
                                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                                                                            <svg
                                                                                className="h-3 w-3"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={3}
                                                                                    d="M5 13l4 4L19 7"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-8 text-center text-gray-500">
                                                                <User className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                                                <p>No artisans found matching "{searchQuery}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {errors.seller_id && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.seller_id}
                                            </p>
                                        )}

                                        {/* Selected Artisan Preview */}
                                        {selectedSeller && (
                                            <div className="mt-4 flex items-center gap-4 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                                <Avatar className="h-14 w-14 ring-2 ring-amber-300 ring-offset-2">
                                                    <AvatarImage src={selectedSeller.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-amber-100 text-lg text-amber-700">
                                                        {selectedSeller.name?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{selectedSeller.name}</p>
                                                    {selectedSeller.address && <p className="text-sm text-gray-600">{selectedSeller.address}</p>}
                                                    <p className="mt-1 text-xs text-amber-700">Selected Artisan</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setData('seller_id', '')}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                                        <p className="text-yellow-800">No artisans available. Please browse our artisans first.</p>
                                        <Link href="/buyer/sellers">
                                            <Button variant="outline" className="mt-2">
                                                Browse Artisans
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PenTool className="h-5 w-5 text-amber-600" />
                                    Request Details
                                </CardTitle>
                                <CardDescription>Describe what you want the artisan to create</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Custom wooden name sign for nursery"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe in detail what you want. Include size, colors, materials, style preferences, and any other specific requirements..."
                                        rows={6}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.description}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">Minimum 20 characters</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="quantity" className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            Quantity *
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            className={errors.quantity ? 'border-red-500' : ''}
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.quantity}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="preferred_deadline" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            Preferred Deadline
                                        </Label>
                                        <Input
                                            id="preferred_deadline"
                                            type="date"
                                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                            value={data.preferred_deadline}
                                            onChange={(e) => setData('preferred_deadline', e.target.value)}
                                            className={errors.preferred_deadline ? 'border-red-500' : ''}
                                        />
                                        {errors.preferred_deadline && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.preferred_deadline}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Budget */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-amber-600" />
                                    Budget Range (Optional)
                                </CardTitle>
                                <CardDescription>Let the artisan know your budget expectations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="budget_min">Minimum Budget (₱)</Label>
                                        <Input
                                            id="budget_min"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 500"
                                            value={data.budget_min}
                                            onChange={(e) => setData('budget_min', e.target.value)}
                                            className={errors.budget_min ? 'border-red-500' : ''}
                                        />
                                        {errors.budget_min && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.budget_min}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="budget_max">Maximum Budget (₱)</Label>
                                        <Input
                                            id="budget_max"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 2000"
                                            value={data.budget_max}
                                            onChange={(e) => setData('budget_max', e.target.value)}
                                            className={errors.budget_max ? 'border-red-500' : ''}
                                        />
                                        {errors.budget_max && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.budget_max}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reference Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-amber-600" />
                                    Reference Images (Optional)
                                </CardTitle>
                                <CardDescription>Upload images to help the artisan understand what you want (max 5 images)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                                            {previewImages.map((preview, index) => (
                                                <div key={index} className="group relative aspect-square">
                                                    <img
                                                        src={preview}
                                                        alt={`Reference ${index + 1}`}
                                                        className="h-full w-full rounded-lg border object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {previewImages.length < 5 && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-amber-400 hover:bg-amber-50"
                                        >
                                            <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                            <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                                        </div>
                                    )}

                                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Special Requirements (Optional)</CardTitle>
                                <CardDescription>Any additional notes or special instructions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="e.g., Gift wrapping needed, specific packaging requirements, allergies to certain materials..."
                                    rows={4}
                                    value={data.special_requirements}
                                    onChange={(e) => setData('special_requirements', e.target.value)}
                                    className={errors.special_requirements ? 'border-red-500' : ''}
                                />
                                {errors.special_requirements && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.special_requirements}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Link href="/buyer/custom-orders">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing || !data.seller_id}
                                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Request
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </BuyerLayout>
    );
}
