import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Settings {
    general: {
        site_name: string;
        site_description: string;
        site_email: string;
        site_phone: string;
        site_address: string;
        maintenance_mode: boolean;
    };
    ecommerce: {
        currency: string;
        currency_symbol: string;
        tax_rate: number;
        shipping_enabled: boolean;
        default_shipping_cost: number;
        free_shipping_threshold: number;
        low_stock_threshold: number;
    };
    seller: {
        seller_application_enabled: boolean;
        seller_approval_required: boolean;
        seller_commission_rate: number;
    };
    notifications: {
        email_notifications_enabled: boolean;
        admin_email: string;
        new_order_notification: boolean;
        new_user_notification: boolean;
        new_seller_application_notification: boolean;
    };
    seo: {
        meta_title: string;
        meta_description: string;
        meta_keywords: string;
        google_analytics_id: string;
    };
}

interface Props {
    settings: Settings;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

export default function SettingsIndex() {
    const { settings } = usePage<SharedData & Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (section: string, data: Record<string, unknown>) => {
        setIsSubmitting(true);
        // Convert data to proper format for router.post
        const payload: Record<string, string | number | boolean> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                payload[key] = value;
            } else if (value !== null && value !== undefined) {
                payload[key] = String(value);
            }
        });
        router.post(`/admin/settings/${section}`, payload, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleClearCache = () => {
        if (confirm('Are you sure you want to clear the cache? This may temporarily slow down the application.')) {
            router.post('/admin/settings/clear-cache', {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
                        <TabsTrigger value="seller">Seller</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="backup">Backup</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Basic site information and configuration</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        handleSubmit('general', Object.fromEntries(formData.entries()) as Record<string, unknown>);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="site_name">Site Name</Label>
                                        <Input id="site_name" name="site_name" defaultValue={settings.general.site_name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">Site Description</Label>
                                        <Textarea
                                            id="site_description"
                                            name="site_description"
                                            defaultValue={settings.general.site_description}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_email">Site Email</Label>
                                        <Input id="site_email" name="site_email" type="email" defaultValue={settings.general.site_email} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_phone">Site Phone</Label>
                                        <Input id="site_phone" name="site_phone" defaultValue={settings.general.site_phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_address">Site Address</Label>
                                        <Textarea id="site_address" name="site_address" defaultValue={settings.general.site_address} rows={2} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="maintenance_mode" name="maintenance_mode" defaultChecked={settings.general.maintenance_mode} />
                                        <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save General Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* E-commerce Settings */}
                    <TabsContent value="ecommerce">
                        <Card>
                            <CardHeader>
                                <CardTitle>E-commerce Settings</CardTitle>
                                <CardDescription>Configure payment, shipping, and inventory settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        handleSubmit('ecommerce', Object.fromEntries(formData.entries()) as Record<string, unknown>);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input id="currency" name="currency" defaultValue={settings.ecommerce.currency} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                            <Input
                                                id="currency_symbol"
                                                name="currency_symbol"
                                                defaultValue={settings.ecommerce.currency_symbol}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                        <Input id="tax_rate" name="tax_rate" type="number" step="0.01" defaultValue={settings.ecommerce.tax_rate} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="shipping_enabled" name="shipping_enabled" defaultChecked={settings.ecommerce.shipping_enabled} />
                                        <Label htmlFor="shipping_enabled">Enable Shipping</Label>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="default_shipping_cost">Default Shipping Cost</Label>
                                            <Input
                                                id="default_shipping_cost"
                                                name="default_shipping_cost"
                                                type="number"
                                                step="0.01"
                                                defaultValue={settings.ecommerce.default_shipping_cost}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                                            <Input
                                                id="free_shipping_threshold"
                                                name="free_shipping_threshold"
                                                type="number"
                                                step="0.01"
                                                defaultValue={settings.ecommerce.free_shipping_threshold}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                        <Input
                                            id="low_stock_threshold"
                                            name="low_stock_threshold"
                                            type="number"
                                            defaultValue={settings.ecommerce.low_stock_threshold}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save E-commerce Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Seller Settings */}
                    <TabsContent value="seller">
                        <Card>
                            <CardHeader>
                                <CardTitle>Seller Settings</CardTitle>
                                <CardDescription>Configure seller application and management settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        handleSubmit('seller', Object.fromEntries(formData.entries()) as Record<string, unknown>);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="seller_application_enabled"
                                            name="seller_application_enabled"
                                            defaultChecked={settings.seller.seller_application_enabled}
                                        />
                                        <Label htmlFor="seller_application_enabled">Enable Seller Applications</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="seller_approval_required"
                                            name="seller_approval_required"
                                            defaultChecked={settings.seller.seller_approval_required}
                                        />
                                        <Label htmlFor="seller_approval_required">Require Admin Approval</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seller_commission_rate">Seller Commission Rate (%)</Label>
                                        <Input
                                            id="seller_commission_rate"
                                            name="seller_commission_rate"
                                            type="number"
                                            step="0.01"
                                            defaultValue={settings.seller.seller_commission_rate}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save Seller Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>Configure email and notification preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        handleSubmit('notifications', Object.fromEntries(formData.entries()) as Record<string, unknown>);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="email_notifications_enabled"
                                            name="email_notifications_enabled"
                                            defaultChecked={settings.notifications.email_notifications_enabled}
                                        />
                                        <Label htmlFor="email_notifications_enabled">Enable Email Notifications</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_email">Admin Email</Label>
                                        <Input
                                            id="admin_email"
                                            name="admin_email"
                                            type="email"
                                            defaultValue={settings.notifications.admin_email}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new_order_notification"
                                            name="new_order_notification"
                                            defaultChecked={settings.notifications.new_order_notification}
                                        />
                                        <Label htmlFor="new_order_notification">Notify on New Orders</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new_user_notification"
                                            name="new_user_notification"
                                            defaultChecked={settings.notifications.new_user_notification}
                                        />
                                        <Label htmlFor="new_user_notification">Notify on New Users</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new_seller_application_notification"
                                            name="new_seller_application_notification"
                                            defaultChecked={settings.notifications.new_seller_application_notification}
                                        />
                                        <Label htmlFor="new_seller_application_notification">Notify on Seller Applications</Label>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save Notification Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SEO Settings */}
                    <TabsContent value="seo">
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO Settings</CardTitle>
                                <CardDescription>Configure search engine optimization settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        handleSubmit('seo', Object.fromEntries(formData.entries()) as Record<string, unknown>);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_title">Meta Title</Label>
                                        <Input id="meta_title" name="meta_title" defaultValue={settings.seo.meta_title} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            name="meta_description"
                                            defaultValue={settings.seo.meta_description}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                        <Input id="meta_keywords" name="meta_keywords" defaultValue={settings.seo.meta_keywords} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                                        <Input id="google_analytics_id" name="google_analytics_id" defaultValue={settings.seo.google_analytics_id} />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save SEO Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Database Backup Settings */}
                    <TabsContent value="backup">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Backup</CardTitle>
                                <CardDescription>Manage automated database backups</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <h3 className="mb-2 font-semibold">Automated Backups</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Database backups are automatically created daily at 2:00 AM (Asia/Manila timezone).
                                        Backups are retained for 7 days and stored in <code className="rounded bg-background px-1 py-0.5 text-xs">storage/app/backups</code>.
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span>Automatic daily backups enabled</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span>Backup retention: 7 days</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                            <span>Backups are compressed (gzip)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-2 font-semibold">Manual Backup</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Create an immediate database backup. This may take a few moments depending on your database size.
                                    </p>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.post('/admin/database/backup', {}, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    alert('Database backup initiated successfully!');
                                                },
                                            });
                                        }}
                                    >
                                        <Button type="submit" variant="outline">
                                            Create Backup Now
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Cache Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cache Management</CardTitle>
                        <CardDescription>Clear application cache to refresh data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleClearCache} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Cache
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
