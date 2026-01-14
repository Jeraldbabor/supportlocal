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

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/categories">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Category
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Category Info */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <FolderTree className="h-6 w-6" />
                                    <div>
                                        <CardTitle>{category.name}</CardTitle>
                                        <CardDescription>Slug: {category.slug}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.description && (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p>{category.description}</p>
                                    </div>
                                )}
                                {!category.description && <p className="text-muted-foreground">No description provided</p>}
                            </CardContent>
                        </Card>

                        {/* Subcategories */}
                        {category.children && category.children.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subcategories</CardTitle>
                                    <CardDescription>{category.children.length} subcategories</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {category.children.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                                <span className="font-medium">{child.name}</span>
                                                <span className="text-sm text-muted-foreground">{child.products_count} products</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge
                                        className={
                                            category.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                        }
                                    >
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Parent Category</span>
                                    <span className="text-sm">{category.parent ? category.parent.name : 'Root'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Products</span>
                                    <span className="text-sm font-medium">{category.products_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Subcategories</span>
                                    <span className="text-sm font-medium">{category.children.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Sort Order</span>
                                    <span className="text-sm">{category.sort_order}</span>
                                </div>
                                {category.icon && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Icon</span>
                                        <span className="text-sm">{category.icon}</span>
                                    </div>
                                )}
                                {category.color && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Color</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                                            <span className="text-sm">{category.color}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SEO Info */}
                        {(category.meta_title || category.meta_description) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {category.meta_title && (
                                        <div>
                                            <div className="font-medium text-muted-foreground">Meta Title</div>
                                            <div className="mt-1">{category.meta_title}</div>
                                        </div>
                                    )}
                                    {category.meta_description && (
                                        <div>
                                            <div className="font-medium text-muted-foreground">Meta Description</div>
                                            <div className="mt-1">{category.meta_description}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
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
