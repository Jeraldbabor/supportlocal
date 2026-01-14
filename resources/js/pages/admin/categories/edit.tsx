import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    image: string | null;
    parent_id: number | null;
    sort_order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
}

interface Props {
    category: Category;
    rootCategories: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
    { title: 'Edit Category', href: '#' },
];

export default function CategoryEdit() {
    const { category, rootCategories } = usePage<SharedData & Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Convert boolean values
        data.is_active = formData.get('is_active') === 'on' ? '1' : '0';

        // Handle parent_id
        if (data.parent_id === 'none' || data.parent_id === '') {
            data.parent_id = null;
        }

        router.put(`/admin/categories/${category.id}`, data, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Category: ${category.name}`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Link href="/admin/categories">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                            <CardDescription>Update category details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input id="name" name="name" defaultValue={category.name} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" defaultValue={category.slug} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" defaultValue={category.description || ''} rows={4} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">Parent Category</Label>
                                <Select name="parent_id" defaultValue={category.parent_id?.toString() || 'none'}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Root Category)</SelectItem>
                                        {rootCategories
                                            .filter((cat) => cat.id !== category.id)
                                            .map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Input id="icon" name="icon" defaultValue={category.icon || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input id="color" name="color" defaultValue={category.color || ''} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input id="sort_order" name="sort_order" type="number" defaultValue={category.sort_order} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="is_active" name="is_active" defaultChecked={category.is_active} />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                            <CardDescription>Search engine optimization settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input id="meta_title" name="meta_title" defaultValue={category.meta_title || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea id="meta_description" name="meta_description" defaultValue={category.meta_description || ''} rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Link href="/admin/categories">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
