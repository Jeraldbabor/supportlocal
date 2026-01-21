import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PageContent {
    id: number;
    page_type: string;
    section: string;
    title: string | null;
    content: string | null;
    metadata: Record<string, unknown> | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    contents: PageContent[];
    currentPage: string;
    sections: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Page Content', href: '/admin/page-content' },
];

export default function PageContentIndex() {
    const { contents, currentPage, sections } = usePage<SharedData & Props>().props;
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handlePageChange = (page: string) => {
        router.get('/admin/page-content', { page }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            setIsDeleting(id);
            router.delete(`/admin/page-content/${id}`, {
                preserveScroll: true,
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const getSectionDisplayName = (section: string): string => {
        return sections[section] || section;
    };

    const groupedContents = contents.reduce(
        (acc, content) => {
            if (!acc[content.section]) {
                acc[content.section] = [];
            }
            acc[content.section].push(content);
            return acc;
        },
        {} as Record<string, PageContent[]>,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page Content Management" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Page Content Management</h1>
                        <p className="text-sm text-gray-500">Customize your About and Contact pages</p>
                    </div>
                    <Link
                        href={`/admin/page-content/edit?page=${currentPage}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Content
                    </Link>
                </div>

                <Tabs value={currentPage} onValueChange={handlePageChange} className="w-full">
                    <TabsList className="bg-gray-100">
                        <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">About Page</TabsTrigger>
                        <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Contact Page</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-gray-900 sm:text-lg">About Page Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {contents.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                        <p className="text-gray-500">No content found for the About page.</p>
                                        <Link
                                            href="/admin/page-content/edit?page=about"
                                            className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:underline"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add your first content section
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedContents).map(([section, sectionContents]) => (
                                            <div key={section} className="space-y-2">
                                                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{getSectionDisplayName(section)}</h3>
                                                <div className="space-y-2">
                                                    {sectionContents.map((content) => (
                                                        <div key={content.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="font-medium text-gray-900">{content.title || 'Untitled'}</h4>
                                                                    {content.is_active ? (
                                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                                    ) : (
                                                                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                                                    )}
                                                                    <Badge variant="outline" className="border-gray-300 text-gray-700">Order: {content.sort_order}</Badge>
                                                                </div>
                                                                {content.content && (
                                                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                                        {content.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/admin/page-content/${content.id}/edit`}
                                                                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(content.id)}
                                                                    disabled={isDeleting === content.id}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-gray-900 sm:text-lg">Contact Page Content</CardTitle>
                                <p className="mt-2 text-sm text-gray-500">
                                    Customize your contact information including email, phone, address, and business hours. Click "Edit" on the
                                    "Contact Information" section to update these details.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {contents.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12" style={{ color: '#9ca3af' }} />
                                        <p className="text-gray-500">No content found for the Contact page.</p>
                                        <Link
                                            href="/admin/page-content/edit?page=contact"
                                            className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:underline"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add your first content section
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedContents).map(([section, sectionContents]) => (
                                            <div key={section} className="space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{getSectionDisplayName(section)}</h3>
                                                    {section === 'contact_info' && (
                                                        <Badge variant="outline" className="border-gray-300 text-xs text-gray-700">
                                                            Customize Contact Details
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    {sectionContents.map((content) => (
                                                        <div
                                                            key={content.id}
                                                            className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${
                                                                section === 'contact_info'
                                                                    ? 'border-blue-200 bg-blue-50'
                                                                    : 'border-gray-200 bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="font-medium text-gray-900">{content.title || 'Untitled'}</h4>
                                                                    {content.is_active ? (
                                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                                    ) : (
                                                                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                                                    )}
                                                                    <Badge variant="outline" className="border-gray-300 text-gray-700">Order: {content.sort_order}</Badge>
                                                                </div>
                                                                {section === 'contact_info' && (
                                                                    <p className="mt-2 text-sm text-gray-500">
                                                                        Click <strong>Edit</strong> to customize Email, Phone, Address, and Business
                                                                        Hours
                                                                    </p>
                                                                )}
                                                                {content.content && section !== 'contact_info' && (
                                                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                                        {content.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/admin/page-content/${content.id}/edit`}
                                                                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(content.id)}
                                                                    disabled={isDeleting === content.id}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
