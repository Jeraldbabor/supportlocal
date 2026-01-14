import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart3, Package, TrendingUp, Users } from 'lucide-react';

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
    const { salesReport, userGrowthReport, productPerformanceReport, sellerPerformanceReport, categoryPerformanceReport, dateRange } =
        usePage<SharedData & Props>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
                    <p className="text-muted-foreground">
                        Reports from {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                    </p>
                </div>

                {/* Sales Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{salesReport.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">From {salesReport.total_orders} orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{salesReport.average_order_value.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userGrowthReport.new_users}</div>
                            <p className="text-xs text-muted-foreground">Total: {userGrowthReport.total_users}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Selling Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productPerformanceReport.top_selling_products.length > 0 ? (
                                productPerformanceReport.top_selling_products.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                                            {product.seller && <div className="text-xs text-muted-foreground">by {product.seller}</div>}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{product.orders_count} orders</div>
                                            <div className="text-sm text-muted-foreground">₱{product.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No products sold in this period</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Sellers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Sellers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sellerPerformanceReport.top_sellers.length > 0 ? (
                                sellerPerformanceReport.top_sellers.map((seller) => (
                                    <div key={seller.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                        <div>
                                            <div className="font-medium">{seller.name}</div>
                                            <div className="text-sm text-muted-foreground">{seller.products_count} products</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{seller.orders_count} orders</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No seller data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Status Breakdown */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(productPerformanceReport.products_by_status).map(([status, count]) => (
                                    <div key={status} className="flex justify-between">
                                        <span className="capitalize">{status}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{productPerformanceReport.low_stock_products}</div>
                            <p className="text-sm text-muted-foreground">Products with low or out of stock</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
