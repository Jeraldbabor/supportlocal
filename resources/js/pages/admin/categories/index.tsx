import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, FolderTree, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    parent: { id: number; name: string } | null;
    children_count: number;
    products_count: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    categories: {
        data: Category[];
        links: Array<{ url?: string; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        parent_id?: string;
        is_active?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        root: number;
        with_products: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
];

export default function CategoriesIndex() {
    const { categories, filters, stats } = usePage<SharedData & Props>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/admin/categories', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleToggleStatus = (categoryId: number) => {
        router.post(`/admin/categories/${categoryId}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            router.delete(`/admin/categories/${categoryId}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Management" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</div>
                            <p className="text-xs text-gray-500">Total Categories</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.active}</div>
                            <p className="text-xs text-gray-500">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="text-xl font-bold text-gray-600 sm:text-2xl">{stats.inactive}</div>
                            <p className="text-xs text-gray-500">Inactive</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.root}</div>
                            <p className="text-xs text-gray-500">Root Categories</p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2 md:col-span-1">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.with_products}</div>
                            <p className="text-xs text-gray-500">With Products</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Category Management</h1>
                        <p className="text-sm text-gray-500">Manage product categories</p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4" style={{ color: '#6b7280' }} />
                                    <Input
                                        placeholder="Search categories..."
                                        value={searchTerm}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSearch} className="w-full sm:w-auto">
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Table - Desktop */}
                <Card className="hidden md:block">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Parent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Products</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <FolderTree className="h-5 w-5" style={{ color: '#6b7280' }} />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{category.name}</div>
                                                        {category.description && <div className="text-sm text-gray-500">{category.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {category.parent ? (
                                                    <span className="text-sm text-gray-900">{category.parent.name}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Root</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{category.products_count} products</div>
                                                {category.children_count > 0 && (
                                                    <div className="text-xs text-gray-500">{category.children_count} subcategories</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/categories/${category.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/categories/${category.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Category
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                                                            {category.is_active ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Category
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Cards - Mobile */}
                <div className="space-y-3 md:hidden">
                    {categories.data.map((category) => (
                        <Card key={category.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <FolderTree className="mt-0.5 h-5 w-5" style={{ color: '#6b7280' }} />
                                        <div>
                                            <div className="font-medium text-gray-900">{category.name}</div>
                                            {category.description && <div className="mt-1 text-sm text-gray-500">{category.description}</div>}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{category.parent ? category.parent.name : 'Root'}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {category.products_count} products
                                                {category.children_count > 0 && ` • ${category.children_count} subcategories`}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/categories/${category.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/categories/${category.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Category
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                                                {category.is_active ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Category
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {categories.links && categories.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {categories.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                                            link.active
                                                ? 'bg-orange-500 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
