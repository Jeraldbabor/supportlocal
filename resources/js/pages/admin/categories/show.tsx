import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, FolderTree, Trash2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    image: string | null;
    parent_id: number | null;
    parent: {
        id: number;
        name: string;
    } | null;
    children: Array<{
        id: number;
        name: string;
        products_count: number;
    }>;
    products_count: number;
    sort_order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
    { title: 'Category Details', href: '#' },
];

export default function CategoryShow() {
    const { category } = usePage<SharedData & Props>().props;

    const handleToggleStatus = () => {
        router.post(`/admin/categories/${category.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            router.delete(`/admin/categories/${category.id}`, {
                onSuccess: () => router.visit('/admin/categories'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />

            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/admin/categories">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button className="flex-1 sm:flex-initial">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Category
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-initial">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                        {/* Category Info */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <FolderTree className="h-6 w-6" style={{ color: '#6b7280' }} />
                                    <div>
                                        <CardTitle className="text-gray-900">{category.name}</CardTitle>
                                        <CardDescription className="text-gray-500">Slug: {category.slug}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.description && (
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700">{category.description}</p>
                                    </div>
                                )}
                                {!category.description && <p className="text-gray-500">No description provided</p>}
                            </CardContent>
                        </Card>

                        {/* Subcategories */}
                        {category.children && category.children.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-gray-900">Subcategories</CardTitle>
                                    <CardDescription className="text-gray-500">{category.children.length} subcategories</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {category.children.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0">
                                                <span className="font-medium text-gray-900">{child.name}</span>
                                                <span className="text-sm text-gray-500">{child.products_count} products</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Category Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-gray-900">Category Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Status</span>
                                    <Badge
                                        className={
                                            category.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }
                                    >
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Parent Category</span>
                                    <span className="text-sm text-gray-900">{category.parent ? category.parent.name : 'Root'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Products</span>
                                    <span className="text-sm font-medium text-gray-900">{category.products_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Subcategories</span>
                                    <span className="text-sm font-medium text-gray-900">{category.children.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Sort Order</span>
                                    <span className="text-sm text-gray-900">{category.sort_order}</span>
                                </div>
                                {category.icon && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Icon</span>
                                        <span className="text-sm text-gray-900">{category.icon}</span>
                                    </div>
                                )}
                                {category.color && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Color</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                                            <span className="text-sm text-gray-900">{category.color}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SEO Info */}
                        {(category.meta_title || category.meta_description) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-gray-900">SEO Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {category.meta_title && (
                                        <div>
                                            <div className="font-medium text-gray-500">Meta Title</div>
                                            <div className="mt-1 text-gray-900">{category.meta_title}</div>
                                        </div>
                                    )}
                                    {category.meta_description && (
                                        <div>
                                            <div className="font-medium text-gray-500">Meta Description</div>
                                            <div className="mt-1 text-gray-900">{category.meta_description}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-gray-900">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button onClick={handleToggleStatus} variant="outline" className="w-full">
                                    {category.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={`/admin/categories/${category.id}/edit`}>
                                    <Button variant="outline" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Category
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
