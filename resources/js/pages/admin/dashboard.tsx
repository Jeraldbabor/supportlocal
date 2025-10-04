import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Database, FileText, Settings, Shield, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrator Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section */}
                <div className="rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:from-red-950/20 dark:to-orange-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name}!</h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Role: <span className="font-semibold text-red-600 dark:text-red-400">Administrator</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage users, system settings, and platform operations</p>
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Issues</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Sellers</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">1 registered seller</p>
                                </div>
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    1
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Buyers</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">1 registered buyer</p>
                                </div>
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                    1
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Administrators</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">1 admin user</p>
                                </div>
                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                    1
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Manage Users</span>
                                </div>
                            </button>
                            <Link
                                href="/admin/seller-applications"
                                className="block w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/80"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5" />
                                    <span className="font-medium">Seller Applications</span>
                                </div>
                            </Link>
                            <button className="w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950/80">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-5 w-5" />
                                    <span className="font-medium">View Reports</span>
                                </div>
                            </button>
                            <button className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5" />
                                    <span className="font-medium">System Settings</span>
                                </div>
                            </button>
                            <button className="w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/80">
                                <div className="flex items-center gap-3">
                                    <Database className="h-5 w-5" />
                                    <span className="font-medium">Database Management</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
