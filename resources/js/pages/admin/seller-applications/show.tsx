import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Briefcase, Calendar, CheckCircle, Download, FileText, Mail, User, X, XCircle, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface SellerApplication {
    id: number;
    user: User;
    business_description: string;
    business_type: string | null;
    id_document_type: string;
    id_document_path: string;
    business_permit_type: string | null;
    business_permit_path: string | null;
    additional_documents_path: string[] | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewer?: User;
}

interface SellerApplicationShowProps {
    application: SellerApplication;
}

export default function SellerApplicationShow({ application }: SellerApplicationShowProps) {
    const [showApprovalForm, setShowApprovalForm] = useState(false);
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const approveForm = useForm({
        admin_notes: '',
    });

    const rejectForm = useForm({
        admin_notes: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/admin/seller-applications/${application.id}/approve`, {
            onSuccess: () => {
                setShowApprovalForm(false);
                approveForm.reset();
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/admin/seller-applications/${application.id}/reject`, {
            onSuccess: () => {
                setShowRejectionForm(false);
                rejectForm.reset();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="border-yellow-200 bg-yellow-50 text-yellow-700">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Pending Review
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="border-green-200 bg-green-50 text-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="border-red-200 bg-red-50 text-red-700">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getIdTypeDisplay = (type: string) => {
        const types: Record<string, string> = {
            national_id: 'Philippine National ID (PhilSys)',
            passport: 'Philippine Passport',
            drivers_license: "Driver's License (LTO)",
            umid: 'UMID (Unified Multi-Purpose ID)',
            sss_id: 'SSS ID',
            gsis_id: 'GSIS ID',
            philhealth_id: 'PhilHealth ID',
            tin_id: 'TIN ID (BIR)',
            postal_id: 'Postal ID',
            voters_id: "Voter's ID / Voter's Certification",
            prc_id: 'PRC ID (Professional Regulation Commission)',
            owwa_id: 'OWWA ID',
            ofw_id: 'OFW ID',
            senior_citizen_id: 'Senior Citizen ID',
            pwd_id: 'PWD ID (Persons with Disability)',
            solo_parent_id: 'Solo Parent ID',
            barangay_id: 'Barangay ID / Barangay Certification',
            nbi_clearance: 'NBI Clearance',
            police_clearance: 'Police Clearance',
            integrated_bar_id: 'Integrated Bar of the Philippines ID',
            school_id: 'School ID (with current registration)',
            company_id: 'Company ID (with current validity)',
            seaman_book: "Seaman's Book",
            firearms_license: 'License to Own/Possess Firearms (LTOPF)',
            alien_cert: 'Alien Certificate of Registration (ACR)',
            other: 'Other Valid Government-Issued ID',
        };
        return types[type] || type;
    };

    const getPermitTypeDisplay = (type: string) => {
        const types: Record<string, string> = {
            dti_certificate: 'DTI Certificate (Sole Proprietorship)',
            sec_registration: 'SEC Registration (Corporation/Partnership)',
            cda_registration: 'CDA Registration (Cooperative)',
            barangay_clearance: 'Barangay Business Clearance',
            mayors_permit: "Mayor's / Business Permit",
            bir_registration: 'BIR Certificate of Registration (Form 2303)',
            other: 'Other Business Document',
        };
        return types[type] || type;
    };

    const isImageFile = (path: string): boolean => {
        const extension = path.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    };

    const getPreviewUrl = (type: string, index?: number): string => {
        if (index !== undefined) {
            return `/admin/seller-applications/${application.id}/preview/${type}/${index}`;
        }
        return `/admin/seller-applications/${application.id}/preview/${type}`;
    };

    const getDownloadUrl = (type: string, index?: number): string => {
        if (index !== undefined) {
            return `/admin/seller-applications/${application.id}/download/${type}/${index}`;
        }
        return `/admin/seller-applications/${application.id}/download/${type}`;
    };

    return (
        <AppLayout>
            <Head title={`Seller Application - ${application.user.name}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/seller-applications">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Applications
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Seller Application #{application.id}</h1>
                            <p className="mt-1 text-gray-600">Review and take action on this application</p>
                        </div>
                    </div>
                    {getStatusBadge(application.status)}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Applicant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                                        <p className="font-medium">{application.user.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium">{application.user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Application Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium">
                                                {new Date(application.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Business Type</Label>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium">{application.business_type || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{application.business_description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Submitted Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* ID Document */}
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium">Valid ID Document</h4>
                                            <p className="text-sm text-gray-600">Type: {getIdTypeDisplay(application.id_document_type)}</p>

                                            {/* Image Preview */}
                                            {isImageFile(application.id_document_path) && (
                                                <div className="mt-3">
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={getPreviewUrl('id_document')}
                                                            alt="ID Document Preview"
                                                            className="h-32 w-auto cursor-pointer rounded-lg border border-gray-200 object-contain transition-transform hover:scale-105"
                                                            onClick={() =>
                                                                setPreviewImage({ url: getPreviewUrl('id_document'), title: 'Valid ID Document' })
                                                            }
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors hover:bg-black/10">
                                                            <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {isImageFile(application.id_document_path) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPreviewImage({ url: getPreviewUrl('id_document'), title: 'Valid ID Document' })}
                                                >
                                                    <ZoomIn className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => window.open(getDownloadUrl('id_document'))}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Permit Document */}
                                {application.business_permit_path && (
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-medium">Business Permit / Registration</h4>
                                                <p className="text-sm text-gray-600">
                                                    Type:{' '}
                                                    {application.business_permit_type
                                                        ? getPermitTypeDisplay(application.business_permit_type)
                                                        : 'Not specified'}
                                                </p>

                                                {/* Image Preview */}
                                                {isImageFile(application.business_permit_path) && (
                                                    <div className="mt-3">
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={getPreviewUrl('business_permit')}
                                                                alt="Business Permit Preview"
                                                                className="h-32 w-auto cursor-pointer rounded-lg border border-gray-200 object-contain transition-transform hover:scale-105"
                                                                onClick={() =>
                                                                    setPreviewImage({
                                                                        url: getPreviewUrl('business_permit'),
                                                                        title: 'Business Permit / Registration',
                                                                    })
                                                                }
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors hover:bg-black/10">
                                                                <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {isImageFile(application.business_permit_path) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setPreviewImage({
                                                                url: getPreviewUrl('business_permit'),
                                                                title: 'Business Permit / Registration',
                                                            })
                                                        }
                                                    >
                                                        <ZoomIn className="mr-2 h-4 w-4" />
                                                        Preview
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => window.open(getDownloadUrl('business_permit'))}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Documents */}
                                {application.additional_documents_path && application.additional_documents_path.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Additional Documents</h4>
                                                <p className="text-sm text-gray-600">
                                                    {application.additional_documents_path.length} file(s) submitted
                                                </p>
                                            </div>
                                        </div>

                                        {/* List each additional document */}
                                        <div className="space-y-3">
                                            {application.additional_documents_path.map((docPath, index) => (
                                                <div key={index} className="rounded-lg border p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h5 className="text-sm font-medium">Document {index + 1}</h5>
                                                            <p className="text-xs text-gray-500">{docPath.split('/').pop()}</p>

                                                            {/* Image Preview */}
                                                            {isImageFile(docPath) && (
                                                                <div className="mt-3">
                                                                    <div className="relative inline-block">
                                                                        <img
                                                                            src={getPreviewUrl('additional_documents', index)}
                                                                            alt={`Additional Document ${index + 1} Preview`}
                                                                            className="h-32 w-auto cursor-pointer rounded-lg border border-gray-200 object-contain transition-transform hover:scale-105"
                                                                            onClick={() =>
                                                                                setPreviewImage({
                                                                                    url: getPreviewUrl('additional_documents', index),
                                                                                    title: `Additional Document ${index + 1}`,
                                                                                })
                                                                            }
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors hover:bg-black/10">
                                                                            <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {isImageFile(docPath) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setPreviewImage({
                                                                            url: getPreviewUrl('additional_documents', index),
                                                                            title: `Additional Document ${index + 1}`,
                                                                        })
                                                                    }
                                                                >
                                                                    <ZoomIn className="mr-2 h-4 w-4" />
                                                                    Preview
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(getDownloadUrl('additional_documents', index))}
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Admin Notes */}
                        {application.admin_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap text-gray-700">{application.admin_notes}</p>
                                        {application.reviewed_at && application.reviewer && (
                                            <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
                                                Reviewed by {application.reviewer.name} on {new Date(application.reviewed_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {(application.status === 'pending' || application.status === 'rejected') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {application.status === 'rejected' && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                This application was previously rejected. You can still approve it to grant seller privileges.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {!showApprovalForm && !showRejectionForm && (
                                        <>
                                            <Button onClick={() => setShowApprovalForm(true)} className="w-full bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {application.status === 'rejected' ? 'Approve Rejected Application' : 'Approve Application'}
                                            </Button>
                                            {application.status === 'pending' && (
                                                <Button onClick={() => setShowRejectionForm(true)} variant="destructive" className="w-full">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject Application
                                                </Button>
                                            )}
                                        </>
                                    )}

                                    {/* Approval Form */}
                                    {showApprovalForm && (
                                        <form onSubmit={handleApprove} className="space-y-4">
                                            <Alert>
                                                <CheckCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Approving this application will grant the user seller privileges and change their role to seller.
                                                </AlertDescription>
                                            </Alert>

                                            <div>
                                                <Label htmlFor="approve_notes">Admin Notes (Optional)</Label>
                                                <Textarea
                                                    id="approve_notes"
                                                    placeholder="Add any notes about the approval..."
                                                    value={approveForm.data.admin_notes}
                                                    onChange={(e) => approveForm.setData('admin_notes', e.target.value)}
                                                    rows={3}
                                                />
                                                <InputError message={approveForm.errors.admin_notes} />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    disabled={approveForm.processing}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    {approveForm.processing ? 'Approving...' : 'Confirm Approval'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowApprovalForm(false)}
                                                    disabled={approveForm.processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Rejection Form */}
                                    {showRejectionForm && (
                                        <form onSubmit={handleReject} className="space-y-4">
                                            <Alert>
                                                <XCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Rejecting this application will notify the user that their application was not approved.
                                                </AlertDescription>
                                            </Alert>

                                            <div>
                                                <Label htmlFor="reject_notes">Reason for Rejection *</Label>
                                                <Textarea
                                                    id="reject_notes"
                                                    placeholder="Please provide a clear reason for rejection..."
                                                    value={rejectForm.data.admin_notes}
                                                    onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                                    rows={3}
                                                    required
                                                />
                                                <InputError message={rejectForm.errors.admin_notes} />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={rejectForm.processing} variant="destructive" className="flex-1">
                                                    {rejectForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowRejectionForm(false)}
                                                    disabled={rejectForm.processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Application Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="font-medium capitalize">{application.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Submitted:</span>
                                    <span className="font-medium">{new Date(application.created_at).toLocaleDateString()}</span>
                                </div>
                                {application.reviewed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reviewed:</span>
                                        <span className="font-medium">{new Date(application.reviewed_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID Type:</span>
                                    <span className="font-medium">{getIdTypeDisplay(application.id_document_type)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-0 -right-12 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <div className="rounded-lg bg-white p-4 shadow-2xl">
                            <h3 className="mb-2 text-lg font-semibold">{previewImage.title}</h3>
                            <img
                                src={previewImage.url}
                                alt={previewImage.title}
                                className="max-h-[80vh] max-w-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
