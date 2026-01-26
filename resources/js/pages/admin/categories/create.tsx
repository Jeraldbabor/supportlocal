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

interface Props {
    rootCategories: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
    { title: 'Create Category', href: '#' },
];

export default function CategoryCreate() {
    const { rootCategories } = usePage<SharedData & Props>().props;
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
            delete data.parent_id;
        }

        router.post('/admin/categories', data, {
            onSuccess: () => router.visit('/admin/categories'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="flex items-center justify-between">
                    <Link href="/admin/categories">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-900">Category Information</CardTitle>
                            <CardDescription className="text-gray-500">Create a new product category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">
                                    Category Name *
                                </Label>
                                <Input id="name" name="name" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-gray-700">
                                    Slug
                                </Label>
                                <Input id="slug" name="slug" placeholder="Auto-generated from name" />
                                <p className="text-xs text-gray-500">Leave empty to auto-generate from name</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-700">
                                    Description
                                </Label>
                                <Textarea id="description" name="description" rows={4} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id" className="text-gray-700">
                                    Parent Category
                                </Label>
                                <Select name="parent_id" defaultValue="none">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Root Category)</SelectItem>
                                        {rootCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="icon" className="text-gray-700">
                                        Icon
                                    </Label>
                                    <Input id="icon" name="icon" placeholder="e.g., package, shopping-bag" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color" className="text-gray-700">
                                        Color
                                    </Label>
                                    <Input id="color" name="color" placeholder="e.g., #FF5733, blue" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order" className="text-gray-700">
                                    Sort Order
                                </Label>
                                <Input id="sort_order" name="sort_order" type="number" defaultValue="0" />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="is_active" name="is_active" defaultChecked />
                                <Label htmlFor="is_active" className="text-gray-700">
                                    Active
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-900">SEO Settings</CardTitle>
                            <CardDescription className="text-gray-500">Search engine optimization settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title" className="text-gray-700">
                                    Meta Title
                                </Label>
                                <Input id="meta_title" name="meta_title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_description" className="text-gray-700">
                                    Meta Description
                                </Label>
                                <Textarea id="meta_description" name="meta_description" rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-initial">
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Creating...' : 'Create Category'}
                        </Button>
                        <Link href="/admin/categories">
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
