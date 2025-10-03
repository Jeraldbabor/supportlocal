import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface SellerApplicationFormProps {
    idTypes: Record<string, string>;
    hasExistingApplication?: boolean;
    existingApplication?: {
        status: string;
        created_at: string;
        admin_notes?: string;
    };
}

export default function SellerApplicationForm({ 
    idTypes, 
    hasExistingApplication = false, 
    existingApplication 
}: SellerApplicationFormProps) {
    const [selectedIdFile, setSelectedIdFile] = useState<File | null>(null);
    const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState<File[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        business_description: '',
        business_type: '',
        id_document_type: '',
        id_document: null as File | null,
        additional_documents: [] as File[],
    });

    const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedIdFile(file);
        setData('id_document', file);
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
                setSelectedAdditionalFiles([]);
            },
        });
    };

    if (hasExistingApplication) {
        return (
            <BuyerLayout title="Seller Application">
                <Head title="Apply to Become a Seller" />
                <div className="max-w-4xl mx-auto p-6">
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
                            <CardDescription>
                                Your seller application status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Application Status</Label>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                                        existingApplication?.status === 'pending' 
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : existingApplication?.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
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
                                        <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                                            {existingApplication.admin_notes}
                                        </p>
                                    </div>
                                )}

                                {existingApplication?.status === 'pending' && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Your application is currently being reviewed by our admin team. You will be notified once a decision is made.
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
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Apply to Become a Seller/Artisan</CardTitle>
                        <CardDescription>
                            Join our community of talented artisans and start selling your unique products. 
                            Please provide the required information and documentation for review.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Business Description */}
                            <div className="space-y-2">
                                <Label htmlFor="business_description">
                                    Business Description *
                                </Label>
                                <Textarea
                                    id="business_description"
                                    placeholder="Describe your business, the products you plan to sell, and your experience as an artisan..."
                                    value={data.business_description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('business_description', e.target.value)}
                                    rows={5}
                                    required
                                />
                                <InputError message={errors.business_description} />
                            </div>

                            {/* Business Type */}
                            <div className="space-y-2">
                                <Label htmlFor="business_type">
                                    Business Type (Optional)
                                </Label>
                                <Input
                                    id="business_type"
                                    type="text"
                                    placeholder="e.g., Pottery, Jewelry, Woodworking, Textiles, etc."
                                    value={data.business_type}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('business_type', e.target.value)}
                                />
                                <InputError message={errors.business_type} />
                            </div>

                            {/* ID Document Type */}
                            <div className="space-y-2">
                                <Label htmlFor="id_document_type">
                                    Valid ID Type *
                                </Label>
                                <Select 
                                    value={data.id_document_type} 
                                    onValueChange={(value) => setData('id_document_type', value)}
                                    required
                                >
                                    <SelectTrigger>
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
                                <InputError message={errors.id_document_type} />
                            </div>

                            {/* ID Document Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="id_document">
                                    Upload Valid ID *
                                </Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        id="id_document"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleIdFileChange}
                                        className="hidden"
                                        required
                                    />
                                    <label
                                        htmlFor="id_document"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                                Click to upload
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, or PDF up to 10MB
                                            </p>
                                        </div>
                                    </label>
                                    {selectedIdFile && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            {selectedIdFile.name}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.id_document} />
                            </div>

                            {/* Additional Documents Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="additional_documents">
                                    Additional Documents (Optional)
                                </Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        id="additional_documents"
                                        type="file"
                                        accept="image/*,.pdf"
                                        multiple
                                        onChange={handleAdditionalFilesChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="additional_documents"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                                Click to upload
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Business certificates, portfolio samples, etc.
                                            </p>
                                        </div>
                                    </label>
                                    {selectedAdditionalFiles.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {selectedAdditionalFiles.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FileText className="h-4 w-4" />
                                                    {file.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.additional_documents} />
                            </div>

                            {/* Terms and Conditions */}
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    By submitting this application, you agree to our terms and conditions for sellers. 
                                    Your application will be reviewed within 3-5 business days.
                                </AlertDescription>
                            </Alert>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={processing}
                                size="lg"
                            >
                                {processing ? 'Submitting Application...' : 'Submit Application'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BuyerLayout>
    );
}