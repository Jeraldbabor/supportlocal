import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    EyeOff,
    FileText,
    Key,
    Laptop,
    Lock,
    LogOut,
    Monitor,
    Shield,
    Smartphone,
    Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';

interface ActiveSession {
    id: string;
    ip_address: string;
    device_type: string;
    browser: string;
    platform: string;
    last_activity: string;
    last_activity_full: string;
    is_current: boolean;
}

interface AuditLog {
    id: number;
    user: { name: string; email: string } | null;
    action: string;
    action_label: string;
    description: string;
    ip_address: string;
    created_at: string;
    created_at_full: string;
}

interface Props {
    activeSessions: ActiveSession[];
    auditLogs: AuditLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Security', href: '/admin/security' },
];

const DeviceIcon = ({ deviceType }: { deviceType: string }) => {
    switch (deviceType?.toLowerCase()) {
        case 'mobile':
            return <Smartphone className="h-4 w-4" />;
        case 'tablet':
            return <Tablet className="h-4 w-4" />;
        default:
            return <Monitor className="h-4 w-4" />;
    }
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'login':
            return 'bg-green-100 text-green-800';
        case 'logout':
            return 'bg-gray-100 text-gray-800';
        case 'create':
            return 'bg-blue-100 text-blue-800';
        case 'update':
            return 'bg-yellow-100 text-yellow-800';
        case 'delete':
            return 'bg-red-100 text-red-800';
        case 'password_change':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function Security({ activeSessions, auditLogs }: Props) {
    const { flash } = usePage().props as any;
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages with toast
    useEffect(() => {
        if (flash?.status) {
            setToastMessage(flash.status);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    // Password Change Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
        revoke_sessions: false,
    });

    // Revoke Sessions Form
    const revokeSessionsForm = useForm({
        password: '',
    });

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/admin/security/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleRevokeOtherSessions = (e: React.FormEvent) => {
        e.preventDefault();
        revokeSessionsForm.post('/admin/security/sessions/revoke-others', {
            preserveScroll: true,
            onSuccess: () => revokeSessionsForm.reset(),
        });
    };

    const handleRevokeSession = (sessionId: string) => {
        if (confirm('Are you sure you want to log out this session?')) {
            router.delete(`/admin/security/sessions/${sessionId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Settings" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Security Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your password, active sessions, and view audit logs.
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.status && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Success</AlertTitle>
                        <AlertDescription className="text-green-700">{flash.status}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Laptop className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                                    <p className="text-2xl font-semibold">{activeSessions.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Recent Audit Logs</p>
                                    <p className="text-2xl font-semibold">{auditLogs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="sessions" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="sessions" className="gap-2">
                            <Laptop className="h-4 w-4" />
                            Sessions
                        </TabsTrigger>
                        <TabsTrigger value="password" className="gap-2">
                            <Key className="h-4 w-4" />
                            Password
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Audit Logs
                        </TabsTrigger>
                    </TabsList>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Laptop className="h-5 w-5" />
                                    Active Sessions
                                </CardTitle>
                                <CardDescription>
                                    These are the devices currently logged into your account. You can log out any
                                    session you don't recognize.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`flex items-center justify-between rounded-lg border p-4 ${
                                            session.is_current ? 'border-green-200 bg-green-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <DeviceIcon deviceType={session.device_type} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {session.browser} on {session.platform}
                                                    </p>
                                                    {session.is_current && (
                                                        <Badge variant="outline" className="text-green-600">
                                                            Current Session
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.ip_address} • Last active {session.last_activity}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.is_current && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleRevokeSession(session.id)}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log Out
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {activeSessions.length > 1 && (
                                    <>
                                        <Separator />
                                        <form onSubmit={handleRevokeOtherSessions} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="revoke_password">
                                                    Log Out of All Other Sessions
                                                </Label>
                                                <Input
                                                    id="revoke_password"
                                                    type="password"
                                                    placeholder="Enter your password to confirm"
                                                    value={revokeSessionsForm.data.password}
                                                    onChange={(e) =>
                                                        revokeSessionsForm.setData('password', e.target.value)
                                                    }
                                                />
                                                {revokeSessionsForm.errors.password && (
                                                    <p className="text-sm text-red-500">
                                                        {revokeSessionsForm.errors.password}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={revokeSessionsForm.processing}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log Out All Other Sessions
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Use a strong password with at least 12 characters, including uppercase, lowercase,
                                    numbers, and symbols.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordForm.data.current_password}
                                                onChange={(e) =>
                                                    passwordForm.setData('current_password', e.target.value)
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {passwordForm.errors.current_password && (
                                            <p className="text-sm text-red-500">
                                                {passwordForm.errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {passwordForm.errors.password && (
                                            <p className="text-sm text-red-500">{passwordForm.errors.password}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Min 12 characters with uppercase, lowercase, numbers, and symbols.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) =>
                                                passwordForm.setData('password_confirmation', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="revoke_sessions"
                                            type="checkbox"
                                            className="rounded"
                                            checked={passwordForm.data.revoke_sessions}
                                            onChange={(e) => passwordForm.setData('revoke_sessions', e.target.checked)}
                                        />
                                        <Label htmlFor="revoke_sessions" className="text-sm">
                                            Log out of all other sessions after changing password
                                        </Label>
                                    </div>

                                    <Button type="submit" disabled={passwordForm.processing}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audit Logs Tab */}
                    <TabsContent value="audit">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Recent Audit Logs
                                </CardTitle>
                                <CardDescription>
                                    A log of recent administrative actions in the system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {auditLogs.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No audit logs yet.
                                        </p>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getActionColor(log.action)}>
                                                        {log.action_label}
                                                    </Badge>
                                                    <div>
                                                        <p className="text-sm font-medium">{log.description}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {log.user?.name} • {log.ip_address}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{log.created_at}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {auditLogs.length > 0 && (
                                    <div className="mt-4">
                                        <Button variant="outline" asChild>
                                            <Link href="/admin/security/audit-logs">View All Audit Logs</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </AppLayout>
    );
}
