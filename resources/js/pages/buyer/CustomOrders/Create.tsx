import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Gavel,
    Image as ImageIcon,
    Info,
    Lightbulb,
    Loader2,
    Package,
    Palette,
    PenTool,
    Send,
    Sparkles,
    Star,
    Trophy,
    Upload,
    Users,
    Wand2,
    X,
    Zap,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Props {
    categories: Record<string, string>;
}

export default function CustomOrderCreate({ categories }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: '',
        description: '',
        budget_min: '',
        budget_max: '',
        quantity: '1',
        preferred_deadline: '',
        special_requirements: '',
        reference_images: [] as File[],
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addImages(files);
    };

    const addImages = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length + data.reference_images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        const newImages = [...data.reference_images, ...imageFiles].slice(0, 5);
        setData('reference_images', newImages);

        const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
        setPreviewImages((prev) => [...prev, ...newPreviews].slice(0, 5));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        addImages(files);
    };

    const removeImage = (index: number) => {
        const newImages = data.reference_images.filter((_, i) => i !== index);
        setData('reference_images', newImages);

        URL.revokeObjectURL(previewImages[index]);
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/buyer/custom-orders', {
            forceFormData: true,
        });
    };

    // Calculate form completion percentage
    const requiredFields = ['title', 'category', 'description', 'quantity'];
    const completedFields = requiredFields.filter((field) => data[field as keyof typeof data]);
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

    return (
        <BuyerLayout>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/50">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl" />
                    <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-200/30 to-amber-200/30 blur-3xl" />
                </div>

                <div className="relative py-8 lg:py-12">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6">
                        {/* Back Button */}
                        <Link href="/buyer/custom-orders">
                            <Button variant="ghost" size="sm" className="mb-6 group hover:bg-white/60">
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to My Requests
                            </Button>
                        </Link>

                        {/* Header Section */}
                        <div className="mb-10 text-center">
                            <div className="mb-6 inline-flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 blur-xl opacity-50 animate-pulse" />
                                    <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 shadow-xl shadow-amber-500/25">
                                        <Gavel className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="mb-3 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
                                Create Your Custom Order
                            </h1>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Describe your vision and let talented artisans compete to bring it to life
                            </p>

                            {/* Stats badges */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border border-amber-200/50 px-4 py-2">
                                    <Users className="mr-2 h-4 w-4 text-amber-600" />
                                    <span className="text-gray-700">500+ Active Artisans</span>
                                </Badge>
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border border-green-200/50 px-4 py-2">
                                    <Clock className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-gray-700">Avg. 3 bids within 24hrs</span>
                                </Badge>
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border border-blue-200/50 px-4 py-2">
                                    <Star className="mr-2 h-4 w-4 text-blue-600" />
                                    <span className="text-gray-700">4.9/5 Satisfaction Rate</span>
                                </Badge>
                            </div>
                        </div>

                        {/* How it Works - Redesigned */}
                        <Card className="mb-8 border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-amber-100/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        How It Works
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { icon: PenTool, title: 'Post Request', desc: 'Describe your project', color: 'from-amber-500 to-orange-500' },
                                            { icon: Users, title: 'Receive Bids', desc: 'Artisans send proposals', color: 'from-orange-500 to-red-500' },
                                            { icon: Trophy, title: 'Choose Best', desc: 'Compare & select', color: 'from-red-500 to-pink-500' },
                                            { icon: Zap, title: 'Get Started', desc: 'Work begins!', color: 'from-pink-500 to-purple-500' },
                                        ].map((step, idx) => (
                                            <div key={idx} className="relative group">
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg",
                                                        step.color
                                                    )}>
                                                        <step.icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                                                </div>
                                                {idx < 3 && (
                                                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2">
                                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 overflow-hidden">
                                    {/* Form Header with Progress */}
                                    <CardHeader className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-xl">
                                                    <FileText className="h-5 w-5" />
                                                    Request Details
                                                </CardTitle>
                                                <CardDescription className="text-amber-100 mt-1">
                                                    The more details you provide, the better bids you'll receive
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-amber-100 mb-1">Completion</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white rounded-full transition-all duration-500"
                                                            style={{ width: `${completionPercentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold">{completionPercentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 sm:p-8">
                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            {/* Basic Information Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                                    <div className="p-1.5 rounded-lg bg-amber-100">
                                                        <Wand2 className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                                                </div>

                                                {/* Title */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="title" className="text-gray-700 font-medium flex items-center gap-1">
                                                        Project Title <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={data.title}
                                                        onChange={(e) => setData('title', e.target.value)}
                                                        placeholder="e.g., Custom Handwoven Abaca Bag for Wedding Gift"
                                                        className={cn(
                                                            "h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 transition-all",
                                                            errors.title && 'border-red-400 bg-red-50/50'
                                                        )}
                                                    />
                                                    {errors.title && (
                                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.title}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Category */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="category" className="text-gray-700 font-medium flex items-center gap-1">
                                                        Category <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                                        <SelectTrigger className={cn(
                                                            "h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20",
                                                            errors.category && 'border-red-400 bg-red-50/50'
                                                        )}>
                                                            <SelectValue placeholder="Select a category for your project" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(categories).map(([key, label]) => (
                                                                <SelectItem key={key} value={key} className="py-3">
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.category && (
                                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.category}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-1">
                                                        Detailed Description <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        placeholder="Describe your project in detail. Include:&#10;• Dimensions (size, length, width)&#10;• Colors and patterns you prefer&#10;• Materials (wood type, fabric, etc.)&#10;• Style preferences and inspiration&#10;• Any specific features or requirements"
                                                        rows={6}
                                                        className={cn(
                                                            "bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 resize-none transition-all",
                                                            errors.description && 'border-red-400 bg-red-50/50'
                                                        )}
                                                    />
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">Minimum 20 characters required</span>
                                                        <span className={cn(
                                                            "font-medium",
                                                            data.description.length < 20 ? 'text-gray-400' :
                                                            data.description.length < 100 ? 'text-amber-500' : 'text-green-500'
                                                        )}>
                                                            {data.description.length}/2000
                                                        </span>
                                                    </div>
                                                    {errors.description && (
                                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Budget & Details Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                                    <div className="p-1.5 rounded-lg bg-green-100">
                                                        <Palette className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900">Budget & Specifications</h3>
                                                </div>

                                                {/* Budget Range */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="budget_min" className="text-gray-700 font-medium">
                                                            Minimum Budget
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                                                            <Input
                                                                id="budget_min"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.budget_min}
                                                                onChange={(e) => setData('budget_min', e.target.value)}
                                                                placeholder="0.00"
                                                                className="pl-8 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20"
                                                            />
                                                        </div>
                                                        {errors.budget_min && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {errors.budget_min}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="budget_max" className="text-gray-700 font-medium">
                                                            Maximum Budget
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                                                            <Input
                                                                id="budget_max"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.budget_max}
                                                                onChange={(e) => setData('budget_max', e.target.value)}
                                                                placeholder="0.00"
                                                                className="pl-8 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20"
                                                            />
                                                        </div>
                                                        {errors.budget_max && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {errors.budget_max}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quantity & Deadline */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="quantity" className="text-gray-700 font-medium flex items-center gap-1">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                            Quantity <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="quantity"
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={data.quantity}
                                                            onChange={(e) => setData('quantity', e.target.value)}
                                                            className={cn(
                                                                "h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20",
                                                                errors.quantity && 'border-red-400 bg-red-50/50'
                                                            )}
                                                        />
                                                        {errors.quantity && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {errors.quantity}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="preferred_deadline" className="text-gray-700 font-medium flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            Preferred Deadline
                                                        </Label>
                                                        <Input
                                                            id="preferred_deadline"
                                                            type="date"
                                                            value={data.preferred_deadline}
                                                            onChange={(e) => setData('preferred_deadline', e.target.value)}
                                                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                            className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20"
                                                        />
                                                        {errors.preferred_deadline && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {errors.preferred_deadline}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Special Requirements */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="special_requirements" className="text-gray-700 font-medium">
                                                        Special Requirements or Notes
                                                        <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
                                                    </Label>
                                                    <Textarea
                                                        id="special_requirements"
                                                        value={data.special_requirements}
                                                        onChange={(e) => setData('special_requirements', e.target.value)}
                                                        placeholder="Any special instructions, preferences, materials to avoid, packaging requirements, etc."
                                                        rows={3}
                                                        className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Reference Images Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                                    <div className="p-1.5 rounded-lg bg-purple-100">
                                                        <ImageIcon className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900">Reference Images</h3>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Optional</Badge>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Upload up to 5 images to help artisans visualize your vision
                                                </p>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />

                                                {/* Drag & Drop Zone */}
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    onClick={() => previewImages.length < 5 && fileInputRef.current?.click()}
                                                    className={cn(
                                                        "relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                                                        isDragging
                                                            ? "border-amber-400 bg-amber-50 scale-[1.01]"
                                                            : "border-gray-200 bg-gray-50/50 hover:border-amber-300 hover:bg-amber-50/50",
                                                        previewImages.length >= 5 && "pointer-events-none opacity-50"
                                                    )}
                                                >
                                                    {previewImages.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-10 px-4">
                                                            <div className={cn(
                                                                "p-4 rounded-full mb-4 transition-colors",
                                                                isDragging ? "bg-amber-100" : "bg-gray-100"
                                                            )}>
                                                                <Upload className={cn(
                                                                    "h-8 w-8 transition-colors",
                                                                    isDragging ? "text-amber-500" : "text-gray-400"
                                                                )} />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {isDragging ? 'Drop your images here' : 'Drag & drop images here'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                                                            <p className="text-xs text-gray-400 mt-3">PNG, JPG, WEBP up to 5MB each</p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4">
                                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                                {previewImages.map((preview, index) => (
                                                                    <div key={index} className="group relative aspect-square">
                                                                        <img
                                                                            src={preview}
                                                                            alt={`Preview ${index + 1}`}
                                                                            className="w-full h-full rounded-lg object-cover border-2 border-white shadow-md"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeImage(index);
                                                                            }}
                                                                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs font-medium">
                                                                            {index + 1}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {previewImages.length < 5 && (
                                                                    <div className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/50">
                                                                        <Upload className="h-5 w-5" />
                                                                        <span className="text-[10px] mt-1 font-medium">Add More</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-center text-xs text-gray-500 mt-3">
                                                                {previewImages.length}/5 images uploaded
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-6 border-t border-gray-100">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-lg font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Posting Your Request...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="mr-2 h-5 w-5" />
                                                            Post Request & Start Receiving Bids
                                                        </>
                                                    )}
                                                </Button>
                                                <p className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Your request will be visible to all verified artisans
                                                </p>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Tips Card */}
                                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg overflow-hidden sticky top-6">
                                    <CardContent className="p-5">
                                        <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-4">
                                            <div className="p-1.5 rounded-lg bg-blue-100">
                                                <Lightbulb className="h-4 w-4 text-blue-600" />
                                            </div>
                                            Pro Tips
                                        </h4>
                                        <ul className="space-y-3">
                                            {[
                                                { icon: PenTool, text: 'Be specific about dimensions and colors' },
                                                { icon: Palette, text: 'Set a realistic budget range' },
                                                { icon: ImageIcon, text: 'Add reference images when possible' },
                                                { icon: Package, text: 'Mention preferred materials' },
                                                { icon: Clock, text: 'Allow enough time for quality work' },
                                            ].map((tip, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm text-blue-800">
                                                    <div className="mt-0.5 p-1 rounded bg-blue-100/80">
                                                        <tip.icon className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                    <span>{tip.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Need Help Card */}
                                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg overflow-hidden">
                                    <CardContent className="p-5">
                                        <h4 className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
                                            <div className="p-1.5 rounded-lg bg-amber-100">
                                                <Info className="h-4 w-4 text-amber-600" />
                                            </div>
                                            Need Help?
                                        </h4>
                                        <p className="text-sm text-amber-800 mb-4">
                                            Not sure how to describe your project? Browse similar requests for inspiration.
                                        </p>
                                        <Link href="/buyer/custom-orders">
                                            <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100/50">
                                                View Sample Requests
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
