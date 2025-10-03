import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Eye, Search, Filter, User, Calendar, FileText } from 'lucide-react';

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
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    reviewer?: User;
}

interface SellerApplicationsIndexProps {
    applications: {
        data: SellerApplication[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function SellerApplicationsIndex({ applications }: SellerApplicationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        // In a real app, you would update the URL params and refetch data
        // For now, we'll just update the local state
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        // In a real app, you would debounce this and refetch data
    };

    const filteredApplications = applications.data.filter(app => {
        const matchesSearch = searchTerm === '' || 
            app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.business_type && app.business_type.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: applications.total,
        pending: applications.data.filter(app => app.status === 'pending').length,
        approved: applications.data.filter(app => app.status === 'approved').length,
        rejected: applications.data.filter(app => app.status === 'rejected').length,
    };

    return (
        <AppLayout>
            <Head title="Seller Applications" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Seller Applications</h1>
                        <p className="text-gray-600 mt-1">Review and manage seller/artisan applications</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-600">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by name, email, or business type..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No applications found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredApplications.map((application) => (
                                    <div
                                        key={application.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900">
                                                            {application.user.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-500 text-sm">
                                                        {application.user.email}
                                                    </span>
                                                    {getStatusBadge(application.status)}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Business Type:</span>{' '}
                                                        {application.business_type || 'Not specified'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="font-medium">Applied:</span>{' '}
                                                        {new Date(application.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {application.business_description}
                                                </p>
                                            </div>
                                            
                                            <div className="ml-4">
                                                <Link href={`/admin/seller-applications/${application.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Review
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination would go here in a real app */}
            </div>
        </AppLayout>
    );
}