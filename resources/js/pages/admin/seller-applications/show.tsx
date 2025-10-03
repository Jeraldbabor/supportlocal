import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowLeft, 
    User, 
    Calendar, 
    FileText, 
    Download, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Mail,
    Briefcase
} from 'lucide-react';

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
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Review
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getIdTypeDisplay = (type: string) => {
        const types: Record<string, string> = {
            'national_id': 'National ID',
            'passport': 'Passport',
            'drivers_license': 'Driver\'s License',
        };
        return types[type] || type;
    };

    return (
        <AppLayout>
            <Head title={`Seller Application - ${application.user.name}`} />
            
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/seller-applications">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Applications
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Seller Application #{application.id}
                            </h1>
                            <p className="text-gray-600 mt-1">Review and take action on this application</p>
                        </div>
                    </div>
                    {getStatusBadge(application.status)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Applicant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    minute: '2-digit'
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
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {application.business_description}
                                    </p>
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
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Valid ID Document</h4>
                                            <p className="text-sm text-gray-600">
                                                Type: {getIdTypeDisplay(application.id_document_type)}
                                            </p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => window.open(`/admin/seller-applications/${application.id}/download/id_document`)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>

                                {/* Additional Documents */}
                                {application.additional_documents_path && application.additional_documents_path.length > 0 && (
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Additional Documents</h4>
                                                <p className="text-sm text-gray-600">
                                                    {application.additional_documents_path.length} file(s) submitted
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => window.open(`/admin/seller-applications/${application.id}/download/additional_documents`)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
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
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {application.admin_notes}
                                        </p>
                                        {application.reviewed_at && application.reviewer && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                                                Reviewed by {application.reviewer.name} on{' '}
                                                {new Date(application.reviewed_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {application.status === 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!showApprovalForm && !showRejectionForm && (
                                        <>
                                            <Button 
                                                onClick={() => setShowApprovalForm(true)}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Application
                                            </Button>
                                            <Button 
                                                onClick={() => setShowRejectionForm(true)}
                                                variant="destructive"
                                                className="w-full"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Application
                                            </Button>
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
                                                <Button 
                                                    type="submit" 
                                                    disabled={rejectForm.processing}
                                                    variant="destructive"
                                                    className="flex-1"
                                                >
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
                                    <span className="font-medium">
                                        {new Date(application.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {application.reviewed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reviewed:</span>
                                        <span className="font-medium">
                                            {new Date(application.reviewed_at).toLocaleDateString()}
                                        </span>
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
        </AppLayout>
    );
}