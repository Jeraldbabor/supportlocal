import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PageContent {
    id: number;
    page_type: string;
    section: string;
    title: string | null;
    content: string | null;
    metadata: Record<string, unknown> | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    content: PageContent | null;
    pageType: string;
    section: string;
    sections: Record<string, string>;
}

export default function PageContentEdit() {
    const { content, pageType, section, sections } = usePage<SharedData & Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse metadata for contact info
    interface ContactMetadata {
        email?: { primary?: string; secondary?: string };
        phone?: { primary?: string; secondary?: string };
        address?: { line1?: string; line2?: string; line3?: string };
        business_hours?: { monday_friday?: string; saturday?: string; sunday?: string };
    }
    const contactMetadata = (content?.metadata as ContactMetadata | null) || ({} as ContactMetadata);
    const [contactInfo, setContactInfo] = useState({
        email: {
            primary: (contactMetadata.email?.primary as string) || 'hello@supportlocal.com',
            secondary: (contactMetadata.email?.secondary as string) || 'support@supportlocal.com',
        },
        phone: {
            primary: (contactMetadata.phone?.primary as string) || '(555) 123-4567',
            secondary: (contactMetadata.phone?.secondary as string) || 'Toll-free: (800) 123-4567',
        },
        address: {
            line1: (contactMetadata.address?.line1 as string) || '123 Support Local Street',
            line2: (contactMetadata.address?.line2 as string) || 'Creative District',
            line3: (contactMetadata.address?.line3 as string) || 'Metro Manila, Philippines 1000',
        },
        business_hours: {
            monday_friday: (contactMetadata.business_hours?.monday_friday as string) || 'Monday - Friday: 9:00 AM - 6:00 PM',
            saturday: (contactMetadata.business_hours?.saturday as string) || 'Saturday: 10:00 AM - 4:00 PM',
            sunday: (contactMetadata.business_hours?.sunday as string) || 'Sunday: Closed',
        },
    });

    const [formData, setFormData] = useState({
        page_type: pageType,
        section: section || '',
        title: content?.title || '',
        content: content?.content || '',
        sort_order: content?.sort_order || 0,
        is_active: content?.is_active ?? true,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // If editing contact_info section, include metadata
        let metadata = null;
        if (formData.section === 'contact_info') {
            metadata = {
                email: contactInfo.email,
                phone: contactInfo.phone,
                address: contactInfo.address,
                business_hours: contactInfo.business_hours,
            };
        }

        const submitData = {
            ...formData,
            id: content?.id || null,
            metadata: formData.section === 'contact_info' ? metadata : content?.metadata || null,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.post('/admin/page-content', submitData as any, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleInputChange = (name: string, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrator Dashboard', href: '/admin/dashboard' },
        { title: 'Page Content', href: '/admin/page-content' },
        { title: content ? 'Edit Content' : 'Create Content', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={content ? 'Edit Page Content' : 'Create Page Content'} />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                            {content ? 'Edit Page Content' : 'Create Page Content'}
                        </h1>
                        <p className="text-sm text-gray-500">{content ? 'Update the page content' : 'Add new content to your pages'}</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/admin/page-content')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-900">{content ? 'Edit Content' : 'Create Content'}</CardTitle>
                        <CardDescription className="text-gray-500">
                            Customize the content for your {pageType === 'about' ? 'About' : 'Contact'} page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="page_type" className="text-gray-700">
                                        Page Type
                                    </Label>
                                    <Select
                                        value={formData.page_type}
                                        onValueChange={(value) => handleInputChange('page_type', value)}
                                        disabled={!!content}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="about">About Page</SelectItem>
                                            <SelectItem value="contact">Contact Page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="section" className="text-gray-700">
                                        Section
                                    </Label>
                                    <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(sections).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-gray-700">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Enter content title (optional)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-gray-700">
                                    Content
                                </Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    rows={10}
                                    placeholder="Enter the content. HTML is supported."
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500">
                                    You can use HTML tags for formatting. For example: &lt;p&gt;Your text here&lt;/p&gt;
                                </p>
                            </div>

                            {/* Contact Information Fields - Only show for contact_info section */}
                            {formData.section === 'contact_info' && (
                                <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
                                    <div>
                                        <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Contact Information</h3>

                                        {/* Email */}
                                        <div className="mb-4 space-y-2">
                                            <Label className="text-gray-700">Email Addresses</Label>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <Input
                                                    placeholder="Primary Email"
                                                    value={contactInfo.email.primary}
                                                    onChange={(e) =>
                                                        setContactInfo({
                                                            ...contactInfo,
                                                            email: { ...contactInfo.email, primary: e.target.value },
                                                        })
                                                    }
                                                />
                                                <Input
                                                    placeholder="Secondary Email (optional)"
                                                    value={contactInfo.email.secondary}
                                                    onChange={(e) =>
                                                        setContactInfo({
                                                            ...contactInfo,
                                                            email: { ...contactInfo.email, secondary: e.target.value },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="mb-4 space-y-2">
                                            <Label className="text-gray-700">Phone Numbers</Label>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <Input
                                                    placeholder="Primary Phone"
                                                    value={contactInfo.phone.primary}
                                                    onChange={(e) =>
                                                        setContactInfo({
                                                            ...contactInfo,
                                                            phone: { ...contactInfo.phone, primary: e.target.value },
                                                        })
                                                    }
                                                />
                                                <Input
                                                    placeholder="Secondary Phone (optional)"
                                                    value={contactInfo.phone.secondary}
                                                    onChange={(e) =>
                                                        setContactInfo({
                                                            ...contactInfo,
                                                            phone: { ...contactInfo.phone, secondary: e.target.value },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="mb-4 space-y-2">
                                            <Label className="text-gray-700">Address</Label>
                                            <Input
                                                placeholder="Address Line 1"
                                                value={contactInfo.address.line1}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        address: { ...contactInfo.address, line1: e.target.value },
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Address Line 2 (optional)"
                                                value={contactInfo.address.line2}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        address: { ...contactInfo.address, line2: e.target.value },
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="City, State, ZIP"
                                                value={contactInfo.address.line3}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        address: { ...contactInfo.address, line3: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Business Hours */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Business Hours</Label>
                                            <Input
                                                placeholder="Monday - Friday Hours"
                                                value={contactInfo.business_hours.monday_friday}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        business_hours: {
                                                            ...contactInfo.business_hours,
                                                            monday_friday: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Saturday Hours"
                                                value={contactInfo.business_hours.saturday}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        business_hours: {
                                                            ...contactInfo.business_hours,
                                                            saturday: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Sunday Hours"
                                                value={contactInfo.business_hours.sunday}
                                                onChange={(e) =>
                                                    setContactInfo({
                                                        ...contactInfo,
                                                        business_hours: {
                                                            ...contactInfo.business_hours,
                                                            sunday: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order" className="text-gray-700">
                                        Sort Order
                                    </Label>
                                    <Input
                                        id="sort_order"
                                        name="sort_order"
                                        type="number"
                                        min="0"
                                        value={formData.sort_order}
                                        onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Lower numbers appear first. Use this to control the order of content sections.
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer text-gray-700">
                                        Active
                                    </Label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/page-content')}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Saving...' : content ? 'Update Content' : 'Create Content'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
