import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

interface Props {
    dateRange: {
        start: string;
        end: string;
    };
    salesReport: {
        total_revenue: number;
        total_orders: number;
        average_order_value: number;
        daily_sales: Array<{ date: string; revenue: number; orders: number }>;
        status_breakdown: Record<string, number>;
    };
    userGrowthReport: {
        total_users: number;
        new_users: number;
        growth_by_role: Record<string, number>;
        daily_registrations: Array<{ date: string; count: number }>;
    };
    productPerformanceReport: {
        top_selling_products: Array<{
            id: number;
            name: string;
            sku: string;
            price: number;
            orders_count: number;
            seller: string | null;
        }>;
        products_by_status: Record<string, number>;
        low_stock_products: number;
        total_products: number;
        active_products: number;
    };
    sellerPerformanceReport: {
        top_sellers: Array<{
            id: number;
            name: string;
            business_name: string | null;
            products_count: number;
            orders_count: number;
        }>;
        applications_stats: {
            pending: number;
            approved: number;
            rejected: number;
        };
        total_sellers: number;
        active_sellers: number;
    };
    categoryPerformanceReport: {
        top_categories: Array<{
            id: number;
            name: string;
            products_count: number;
        }>;
        total_categories: number;
        active_categories: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

export default function ReportsIndex() {
    const { salesReport, userGrowthReport, productPerformanceReport, sellerPerformanceReport, dateRange } = usePage<SharedData & Props>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">System Reports</h1>
                    <p className="text-sm text-gray-500">
                        Reports from {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                    </p>
                </div>

                {/* Sales Overview */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-900">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">₱{salesReport.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">From {salesReport.total_orders} orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-900">Average Order Value</CardTitle>
                            <BarChart3 className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">₱{salesReport.average_order_value.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card className="sm:col-span-2 md:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-900">New Users</CardTitle>
                            <Users className="h-4 w-4" style={{ color: '#6b7280' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{userGrowthReport.new_users}</div>
                            <p className="text-xs text-gray-500">Total: {userGrowthReport.total_users}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Selling Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productPerformanceReport.top_selling_products.length > 0 ? (
                                productPerformanceReport.top_selling_products.map((product) => (
                                    <div key={product.id} className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                            {product.seller && <div className="text-xs text-gray-500">by {product.seller}</div>}
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="font-medium text-gray-900">{product.orders_count} orders</div>
                                            <div className="text-sm text-gray-500">₱{product.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No products sold in this period</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Sellers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900 sm:text-lg">Top Performing Sellers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sellerPerformanceReport.top_sellers.length > 0 ? (
                                sellerPerformanceReport.top_sellers.map((seller) => (
                                    <div key={seller.id} className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{seller.name}</div>
                                            <div className="text-sm text-gray-500">{seller.products_count} products</div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="font-medium text-gray-900">{seller.orders_count} orders</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No seller data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Status Breakdown */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-gray-900 sm:text-lg">Product Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(productPerformanceReport.products_by_status).map(([status, count]) => (
                                    <div key={status} className="flex justify-between">
                                        <span className="capitalize text-gray-700">{status}</span>
                                        <span className="font-medium text-gray-900">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-gray-900 sm:text-lg">Stock Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600 sm:text-2xl">{productPerformanceReport.low_stock_products}</div>
                            <p className="text-sm text-gray-500">Products with low or out of stock</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
