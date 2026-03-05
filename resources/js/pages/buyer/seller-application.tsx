import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ArrowRight, Briefcase, CheckCircle, FileText, Shield, Upload } from 'lucide-react';
import { useState } from 'react';

interface SellerApplicationFormProps {
    idTypes: Record<string, string>;
    permitTypes: Record<string, string>;
    hasExistingApplication?: boolean;
    existingApplication?: {
        status: string;
        created_at: string;
        admin_notes?: string;
    };
}

export default function SellerApplicationForm({
    idTypes,
    permitTypes,
    hasExistingApplication = false,
    existingApplication,
}: SellerApplicationFormProps) {
    const [selectedIdFile, setSelectedIdFile] = useState<File | null>(null);
    const [selectedPermitFile, setSelectedPermitFile] = useState<File | null>(null);
    const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState<File[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

    const steps = [
        { title: 'Business Info', icon: Briefcase, description: 'Tell us about your business' },
        { title: 'Identity', icon: Shield, description: 'Verify your identity' },
        { title: 'Documents', icon: FileText, description: 'Business permits & extras' },
        { title: 'Review', icon: CheckCircle, description: 'Review & submit' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        business_description: '',
        business_type: '',
        business_location: '',
        id_document_type: '',
        id_document: null as File | null,
        business_permit_type: '',
        business_permit: null as File | null,
        additional_documents: [] as File[],
    });

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!data.business_description.trim()) newErrors.business_description = 'Business description is required.';
            if (!data.business_location.trim()) newErrors.business_location = 'Business location is required.';
        }

        if (step === 1) {
            if (!data.id_document_type) newErrors.id_document_type = 'Please select an ID type.';
            if (!data.id_document) newErrors.id_document = 'Please upload your valid ID.';
        }

        setStepErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const goToPrev = () => {
        setStepErrors({});
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const goToStep = (step: number) => {
        if (step < currentStep) {
            setStepErrors({});
            setCurrentStep(step);
        }
    };

    const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedIdFile(file);
        setData('id_document', file);
    };

    const handlePermitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedPermitFile(file);
        setData('business_permit', file);
    };

    const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedAdditionalFiles(files);
        setData('additional_documents', files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/apply', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedIdFile(null);
                setSelectedPermitFile(null);
                setSelectedAdditionalFiles([]);
            },
        });
    };

    if (hasExistingApplication) {
        return (
            <BuyerLayout title="Seller Application">
                <Head title="Apply to Become a Seller" />
                <div className="mx-auto max-w-4xl p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {existingApplication?.status === 'pending' && (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        Application Under Review
                                    </>
                                )}
                                {existingApplication?.status === 'approved' && (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Application Approved
                                    </>
                                )}
                                {existingApplication?.status === 'rejected' && (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                        Application Rejected
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>Your seller application status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Application Status</Label>
                                    <div
                                        className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                            existingApplication?.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : existingApplication?.status === 'approved'
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {existingApplication?.status === 'pending' && 'Under Review'}
                                        {existingApplication?.status === 'approved' && 'Approved'}
                                        {existingApplication?.status === 'rejected' && 'Rejected'}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Submitted</Label>
                                    <p className="text-sm text-gray-600">
                                        {existingApplication?.created_at ? new Date(existingApplication.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                {existingApplication?.admin_notes && (
                                    <div>
                                        <Label className="text-sm font-medium">Admin Notes</Label>
                                        <p className="mt-1 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{existingApplication.admin_notes}</p>
                                    </div>
                                )}

                                {existingApplication?.status === 'pending' && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Your application is currently being reviewed by our admin team. You will be notified once a decision is
                                            made.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {existingApplication?.status === 'approved' && (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Congratulations! Your seller application has been approved. You can now start selling on our platform.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {existingApplication?.status === 'rejected' && (
                                    <div className="pt-2">
                                        <Button
                                            onClick={() => {
                                                window.location.href = '/seller/apply/form?reapply=1';
                                            }}
                                            className="w-full bg-amber-600 hover:bg-amber-700"
                                        >
                                            Apply Again
                                        </Button>
                                        <p className="mt-2 text-center text-xs text-gray-500">
                                            You can submit a new application with updated information.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </BuyerLayout>
        );
    }

    return (
        <BuyerLayout title="Apply to Become a Seller">
            <Head title="Apply to Become a Seller" />
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Become a Seller / Artisan</h1>
                    <p className="mt-2 text-sm text-gray-500">Complete the steps below to submit your application</p>
                </div>

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={index} className="flex flex-1 items-center">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        disabled={index > currentStep}
                                        className={`flex flex-col items-center gap-1.5 ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12 ${
                                                isCompleted
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : isActive
                                                      ? 'border-amber-500 bg-amber-50 text-amber-600'
                                                      : 'border-gray-300 bg-white text-gray-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                            ) : (
                                                <StepIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                            )}
                                        </div>
                                        <span
                                            className={`hidden text-xs font-medium sm:block ${
                                                isActive ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {step.title}
                                        </span>
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={`mx-2 h-0.5 flex-1 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Mobile step label */}
                    <p className="mt-3 text-center text-sm font-medium text-amber-600 sm:hidden">
                        Step {currentStep + 1}: {steps[currentStep].title}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Business Info */}
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-amber-500" />
                                    Business Information
                                </CardTitle>
                                <CardDescription>Tell us about yourself and what you plan to sell</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="business_description">
                                        Business Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="business_description"
                                        placeholder="Describe your business, the products you plan to sell, and your experience as an artisan..."
                                        value={data.business_description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('business_description', e.target.value)}
                                        rows={5}
                                        className={stepErrors.business_description || errors.business_description ? 'border-red-300' : ''}
                                    />
                                    <InputError message={stepErrors.business_description || errors.business_description} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="business_type">Business Type (Optional)</Label>
                                    <Input
                                        id="business_type"
                                        type="text"
                                        placeholder="e.g., Pottery, Jewelry, Woodworking, Textiles, etc."
                                        value={data.business_type}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('business_type', e.target.value)}
                                    />
                                    <InputError message={errors.business_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="business_location">
                                        Business Location <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="business_location"
                                        type="text"
                                        placeholder="e.g., Hinoba-an, Negros Occidental"
                                        value={data.business_location}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('business_location', e.target.value)}
                                        className={stepErrors.business_location || errors.business_location ? 'border-red-300' : ''}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Enter the municipality/city where your business is located. Businesses in Hinoba-an may qualify for instant
                                        approval.
                                    </p>
                                    <InputError message={stepErrors.business_location || errors.business_location} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Identity Verification */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-500" />
                                    Identity Verification
                                </CardTitle>
                                <CardDescription>Upload a valid government-issued ID for verification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="id_document_type">
                                        Valid ID Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.id_document_type} onValueChange={(value) => setData('id_document_type', value)}>
                                        <SelectTrigger className={stepErrors.id_document_type ? 'border-red-300' : ''}>
                                            <SelectValue placeholder="Select ID type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(idTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={stepErrors.id_document_type || errors.id_document_type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="id_document">
                                        Upload Valid ID <span className="text-red-500">*</span>
                                    </Label>
                                    <div
                                        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                            stepErrors.id_document || errors.id_document
                                                ? 'border-red-300 bg-red-50/50'
                                                : selectedIdFile
                                                  ? 'border-green-300 bg-green-50/50'
                                                  : 'border-gray-300 hover:border-amber-300'
                                        }`}
                                    >
                                        <input id="id_document" type="file" accept="image/*,.pdf" onChange={handleIdFileChange} className="hidden" />
                                        <label htmlFor="id_document" className="flex cursor-pointer flex-col items-center gap-2">
                                            <Upload className={`h-8 w-8 ${selectedIdFile ? 'text-green-500' : 'text-gray-400'}`} />
                                            <div>
                                                <span className="text-sm font-medium text-amber-700 hover:text-amber-800">
                                                    {selectedIdFile ? 'Change file' : 'Click to upload'}
                                                </span>
                                                <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                                            </div>
                                        </label>
                                        {selectedIdFile && (
                                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                                <FileText className="h-4 w-4" />
                                                {selectedIdFile.name}
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={stepErrors.id_document || errors.id_document} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Business Permit & Additional Docs */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-amber-500" />
                                    Business Permits & Documents
                                </CardTitle>
                                <CardDescription>
                                    Upload business permits or additional documents if you have any. These are optional but help speed up your review.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Business Permit Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="business_permit_type">Business Permit / Registration Type</Label>
                                    <Select value={data.business_permit_type} onValueChange={(value) => setData('business_permit_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select permit type (if applicable)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permitTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">If you have any business registration or permit, select the type above.</p>
                                    <InputError message={errors.business_permit_type} />
                                </div>

                                {/* Business Permit Upload */}
                                {data.business_permit_type && (
                                    <div className="space-y-2">
                                        <Label htmlFor="business_permit">Upload Business Permit / Registration</Label>
                                        <div
                                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                                selectedPermitFile ? 'border-green-300 bg-green-50/50' : 'border-gray-300 hover:border-amber-300'
                                            }`}
                                        >
                                            <input
                                                id="business_permit"
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handlePermitFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="business_permit" className="flex cursor-pointer flex-col items-center gap-2">
                                                <Upload className={`h-8 w-8 ${selectedPermitFile ? 'text-green-500' : 'text-gray-400'}`} />
                                                <div>
                                                    <span className="text-sm font-medium text-amber-700 hover:text-amber-800">
                                                        {selectedPermitFile ? 'Change file' : 'Click to upload'}
                                                    </span>
                                                    <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                                                </div>
                                            </label>
                                            {selectedPermitFile && (
                                                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                                    <FileText className="h-4 w-4" />
                                                    {selectedPermitFile.name}
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.business_permit} />
                                    </div>
                                )}

                                <div className="border-t pt-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="additional_documents">Additional Supporting Documents</Label>
                                        <div
                                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                                selectedAdditionalFiles.length > 0
                                                    ? 'border-green-300 bg-green-50/50'
                                                    : 'border-gray-300 hover:border-amber-300'
                                            }`}
                                        >
                                            <input
                                                id="additional_documents"
                                                type="file"
                                                accept="image/*,.pdf"
                                                multiple
                                                onChange={handleAdditionalFilesChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="additional_documents" className="flex cursor-pointer flex-col items-center gap-2">
                                                <Upload
                                                    className={`h-8 w-8 ${selectedAdditionalFiles.length > 0 ? 'text-green-500' : 'text-gray-400'}`}
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-amber-700 hover:text-amber-800">Click to upload</span>
                                                    <p className="text-xs text-gray-500">Business certificates, portfolio samples, etc.</p>
                                                </div>
                                            </label>
                                            {selectedAdditionalFiles.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    {selectedAdditionalFiles.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            {file.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.additional_documents} />
                                    </div>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Don't have permits yet? No problem — you can skip this step. You can always provide them later.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-amber-500" />
                                        Review Your Application
                                    </CardTitle>
                                    <CardDescription>Make sure everything looks good before submitting</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Business Info Summary */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(0)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Briefcase className="h-4 w-4 text-amber-500" />
                                                Business Information
                                            </h3>
                                            <span className="text-xs text-amber-600">Edit →</span>
                                        </div>
                                        <div className="space-y-1.5 text-sm">
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">Description:</span>{' '}
                                                {data.business_description
                                                    ? data.business_description.length > 100
                                                        ? data.business_description.slice(0, 100) + '...'
                                                        : data.business_description
                                                    : '—'}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">Business Type:</span> {data.business_type || 'Not specified'}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">Location:</span> {data.business_location || '—'}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Identity Summary */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Shield className="h-4 w-4 text-amber-500" />
                                                Identity Verification
                                            </h3>
                                            <span className="text-xs text-amber-600">Edit →</span>
                                        </div>
                                        <div className="space-y-1.5 text-sm">
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">ID Type:</span>{' '}
                                                {data.id_document_type ? idTypes[data.id_document_type] || data.id_document_type : '—'}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">ID Document:</span>{' '}
                                                {selectedIdFile ? <span className="text-green-600">{selectedIdFile.name}</span> : '—'}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Documents Summary */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <FileText className="h-4 w-4 text-amber-500" />
                                                Business Permits & Documents
                                            </h3>
                                            <span className="text-xs text-amber-600">Edit →</span>
                                        </div>
                                        <div className="space-y-1.5 text-sm">
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">Permit:</span>{' '}
                                                {data.business_permit_type
                                                    ? permitTypes[data.business_permit_type] || data.business_permit_type
                                                    : 'None'}
                                            </p>
                                            {selectedPermitFile && (
                                                <p className="text-gray-600">
                                                    <span className="text-gray-500">Permit File:</span>{' '}
                                                    <span className="text-green-600">{selectedPermitFile.name}</span>
                                                </p>
                                            )}
                                            <p className="text-gray-600">
                                                <span className="text-gray-500">Additional Docs:</span>{' '}
                                                {selectedAdditionalFiles.length > 0 ? `${selectedAdditionalFiles.length} file(s)` : 'None'}
                                            </p>
                                        </div>
                                    </button>
                                </CardContent>
                            </Card>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    By submitting this application, you agree to our terms and conditions for sellers. Your application will be
                                    reviewed within 3-5 business days.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex items-center justify-between">
                        {currentStep > 0 ? (
                            <Button type="button" variant="outline" onClick={goToPrev}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={goToNext} className="bg-amber-600 hover:bg-amber-700">
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                {processing ? 'Submitting...' : 'Submit Application'}
                                <CheckCircle className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </BuyerLayout>
    );
}
