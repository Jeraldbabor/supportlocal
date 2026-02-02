import Toast from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Key, Laptop, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Settings {
    general: {
        site_name: string;
        site_description: string;
        site_email: string;
        site_phone: string;
        site_address: string;
        registration_enabled: boolean;
        maintenance_mode: boolean;
    };
    ecommerce: {
        currency: string;
        currency_symbol: string;
        tax_rate: number | string;
        shipping_enabled: boolean;
        default_shipping_cost: number | string;
        free_shipping_threshold: number | string;
        low_stock_threshold: number | string;
    };
    seller: {
        seller_application_enabled: boolean;
        seller_approval_required: boolean;
        seller_commission_rate: number | string;
    };
    notifications: {
        email_notifications_enabled: boolean;
        admin_email: string;
        admin_login_alert: boolean;
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
    const { flash } = usePage<SharedData>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // General settings state
    const [generalSettings, setGeneralSettings] = useState(settings.general);
    // E-commerce settings state
    const [ecommerceSettings, setEcommerceSettings] = useState(settings.ecommerce);
    // Seller settings state
    const [sellerSettings, setSellerSettings] = useState(settings.seller);
    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
    // SEO settings state
    const [seoSettings, setSeoSettings] = useState(settings.seo);

    // Handle flash messages
    useEffect(() => {
        if (flash?.message) {
            setToastMessage(flash.message);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    const handleGeneralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/admin/settings/general', generalSettings, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleEcommerceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/admin/settings/ecommerce', ecommerceSettings, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleSellerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/admin/settings/seller', sellerSettings, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleNotificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/admin/settings/notifications', notificationSettings, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleSeoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/admin/settings/seo', seoSettings, {
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
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="mb-4 grid w-full grid-cols-7">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
                        <TabsTrigger value="seller">Seller</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="backup">Backup</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Basic site information and configuration</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleGeneralSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="site_name">Site Name</Label>
                                        <Input
                                            id="site_name"
                                            value={generalSettings.site_name}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">Site Description</Label>
                                        <Textarea
                                            id="site_description"
                                            value={generalSettings.site_description}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_email">Site Email</Label>
                                        <Input
                                            id="site_email"
                                            type="email"
                                            value={generalSettings.site_email}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, site_email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_phone">Site Phone</Label>
                                        <Input
                                            id="site_phone"
                                            value={generalSettings.site_phone}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, site_phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_address">Site Address</Label>
                                        <Textarea
                                            id="site_address"
                                            value={generalSettings.site_address}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, site_address: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                    {/* Access Control Section */}
                                    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                                        <h4 className="font-medium">Access Control</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="registration_enabled">User Registration</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Allow new users to register accounts
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="registration_enabled"
                                                    checked={generalSettings.registration_enabled}
                                                    onCheckedChange={(checked) =>
                                                        setGeneralSettings({ ...generalSettings, registration_enabled: checked })
                                                    }
                                                />
                                            </div>
                                            {!generalSettings.registration_enabled && (
                                                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                                    ⚠️ Registration is disabled. New users cannot create accounts.
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Put the site in maintenance mode (only admins can access)
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="maintenance_mode"
                                                    checked={generalSettings.maintenance_mode}
                                                    onCheckedChange={(checked) =>
                                                        setGeneralSettings({ ...generalSettings, maintenance_mode: checked })
                                                    }
                                                />
                                            </div>
                                            {generalSettings.maintenance_mode && (
                                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
                                                    🚧 Maintenance mode is active. Only administrators can access the site.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save General Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* E-commerce Settings */}
                    <TabsContent value="ecommerce" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>E-commerce Settings</CardTitle>
                                <CardDescription>Configure payment, shipping, and inventory settings</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleEcommerceSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input
                                                id="currency"
                                                value={ecommerceSettings.currency}
                                                onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, currency: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                            <Input
                                                id="currency_symbol"
                                                value={ecommerceSettings.currency_symbol}
                                                onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, currency_symbol: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                        <Input
                                            id="tax_rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0"
                                            value={ecommerceSettings.tax_rate}
                                            onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, tax_rate: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="shipping_enabled"
                                            checked={ecommerceSettings.shipping_enabled}
                                            onCheckedChange={(checked) => setEcommerceSettings({ ...ecommerceSettings, shipping_enabled: checked })}
                                        />
                                        <Label htmlFor="shipping_enabled">Enable Shipping</Label>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="default_shipping_cost">Default Shipping Cost</Label>
                                            <Input
                                                id="default_shipping_cost"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0"
                                                value={ecommerceSettings.default_shipping_cost}
                                                onChange={(e) =>
                                                    setEcommerceSettings({ ...ecommerceSettings, default_shipping_cost: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (0 = disabled)</Label>
                                            <Input
                                                id="free_shipping_threshold"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0"
                                                value={ecommerceSettings.free_shipping_threshold}
                                                onChange={(e) =>
                                                    setEcommerceSettings({ ...ecommerceSettings, free_shipping_threshold: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                        <Input
                                            id="low_stock_threshold"
                                            type="number"
                                            min="0"
                                            placeholder="5"
                                            value={ecommerceSettings.low_stock_threshold}
                                            onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, low_stock_threshold: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save E-commerce Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Seller Settings */}
                    <TabsContent value="seller" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>Seller Settings</CardTitle>
                                <CardDescription>Configure seller application and management settings</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSellerSubmit} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="seller_application_enabled"
                                            checked={sellerSettings.seller_application_enabled}
                                            onCheckedChange={(checked) =>
                                                setSellerSettings({ ...sellerSettings, seller_application_enabled: checked })
                                            }
                                        />
                                        <Label htmlFor="seller_application_enabled">Enable Seller Applications</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="seller_approval_required"
                                            checked={sellerSettings.seller_approval_required}
                                            onCheckedChange={(checked) => setSellerSettings({ ...sellerSettings, seller_approval_required: checked })}
                                        />
                                        <Label htmlFor="seller_approval_required">Require Admin Approval</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seller_commission_rate">Seller Commission Rate (%)</Label>
                                        <Input
                                            id="seller_commission_rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="0"
                                            value={sellerSettings.seller_commission_rate}
                                            onChange={(e) => setSellerSettings({ ...sellerSettings, seller_commission_rate: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Percentage deducted from seller earnings (0 = no commission)</p>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Seller Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>Configure email and notification preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleNotificationSubmit} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="email_notifications_enabled"
                                            checked={notificationSettings.email_notifications_enabled}
                                            onCheckedChange={(checked) =>
                                                setNotificationSettings({ ...notificationSettings, email_notifications_enabled: checked })
                                            }
                                        />
                                        <Label htmlFor="email_notifications_enabled">Enable Email Notifications</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_email">Admin Email</Label>
                                        <Input
                                            id="admin_email"
                                            type="email"
                                            value={notificationSettings.admin_email}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, admin_email: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This email will receive all admin notifications including login alerts
                                        </p>
                                    </div>

                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="mb-3 text-sm font-medium">Security Notifications</h4>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="admin_login_alert"
                                                checked={notificationSettings.admin_login_alert}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, admin_login_alert: checked })
                                                }
                                            />
                                            <div>
                                                <Label htmlFor="admin_login_alert">Admin Login Alerts</Label>
                                                <p className="text-xs text-muted-foreground">Receive email when any admin account logs in</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="mb-3 text-sm font-medium">Activity Notifications</h4>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="new_order_notification"
                                                checked={notificationSettings.new_order_notification}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, new_order_notification: checked })
                                                }
                                            />
                                            <Label htmlFor="new_order_notification">Notify on New Orders</Label>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new_user_notification"
                                            checked={notificationSettings.new_user_notification}
                                            onCheckedChange={(checked) =>
                                                setNotificationSettings({ ...notificationSettings, new_user_notification: checked })
                                            }
                                        />
                                        <Label htmlFor="new_user_notification">Notify on New Users</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="new_seller_application_notification"
                                            checked={notificationSettings.new_seller_application_notification}
                                            onCheckedChange={(checked) =>
                                                setNotificationSettings({ ...notificationSettings, new_seller_application_notification: checked })
                                            }
                                        />
                                        <Label htmlFor="new_seller_application_notification">Notify on Seller Applications</Label>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SEO Settings */}
                    <TabsContent value="seo" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>SEO Settings</CardTitle>
                                <CardDescription>Configure search engine optimization settings</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSeoSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_title">Meta Title</Label>
                                        <Input
                                            id="meta_title"
                                            value={seoSettings.meta_title}
                                            onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            value={seoSettings.meta_description}
                                            onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                        <Input
                                            id="meta_keywords"
                                            value={seoSettings.meta_keywords}
                                            onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                                        <Input
                                            id="google_analytics_id"
                                            value={seoSettings.google_analytics_id}
                                            onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save SEO Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Settings
                                </CardTitle>
                                <CardDescription>Manage your account security, active sessions, and view audit logs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="rounded-full bg-purple-100 p-2">
                                                <Laptop className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold">Active Sessions</h3>
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            View and manage devices currently logged into your account.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="rounded-full bg-orange-100 p-2">
                                                <Key className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <h3 className="font-semibold">Password Policy</h3>
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">Change your password with strong security requirements.</p>
                                    </div>

                                    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="rounded-full bg-blue-100 p-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="font-semibold">Audit Logs</h3>
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">Track administrative actions and account activity.</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Access the full security dashboard to manage sessions, change your password, and view detailed audit logs.
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/security">
                                            <Shield className="mr-2 h-4 w-4" />
                                            Open Security Dashboard
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Database Backup Settings */}
                    <TabsContent value="backup" className="mt-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-muted/50">
                                <CardTitle>Database Backup</CardTitle>
                                <CardDescription>Manage automated database backups</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <h3 className="mb-2 font-semibold">Automated Backups</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Database backups are automatically created daily at 2:00 AM (Asia/Manila timezone). Backups are retained for 7
                                        days and stored in <code className="rounded bg-background px-1 py-0.5 text-xs">storage/app/backups</code>.
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
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.post(
                                                '/admin/database/backup',
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        setToastMessage('Database backup initiated successfully!');
                                                        setToastType('success');
                                                        setShowToast(true);
                                                    },
                                                    onError: () => {
                                                        setToastMessage('Failed to create backup.');
                                                        setToastType('error');
                                                        setShowToast(true);
                                                    },
                                                },
                                            );
                                        }}
                                    >
                                        Create Backup Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Cache Management */}
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/50">
                        <CardTitle>Cache Management</CardTitle>
                        <CardDescription>Clear application cache to refresh data</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Button onClick={handleClearCache} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Cache
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </AppLayout>
    );
}
