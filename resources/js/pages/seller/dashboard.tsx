import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seller Dashboard',
        href: '/seller/dashboard',
    },
];

export default function SellerDashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Welcome, {user?.name}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Role: <span className="font-semibold text-blue-600 dark:text-blue-400">Seller/Artisan</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your products, orders, and customer relationships
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                            <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Customers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Recent Orders
                        </h3>
                        <div className="text-center py-8">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Orders will appear here when customers purchase your products
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/80">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5" />
                                    <span className="font-medium">Add New Product</span>
                                </div>
                            </button>
                            <button className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-left text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-950/80">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="h-5 w-5" />
                                    <span className="font-medium">View All Products</span>
                                </div>
                            </button>
                            <button className="w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-left text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-950/80">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5" />
                                    <span className="font-medium">View Analytics</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}