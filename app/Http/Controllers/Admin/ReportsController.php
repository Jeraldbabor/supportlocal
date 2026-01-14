<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SellerApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        // Sales Report
        $salesReport = $this->getSalesReport($startDate, $endDate);

        // User Growth Report
        $userGrowthReport = $this->getUserGrowthReport($startDate, $endDate);

        // Product Performance Report
        $productPerformanceReport = $this->getProductPerformanceReport($startDate, $endDate);

        // Seller Performance Report
        $sellerPerformanceReport = $this->getSellerPerformanceReport($startDate, $endDate);

        // Category Performance Report
        $categoryPerformanceReport = $this->getCategoryPerformanceReport($startDate, $endDate);

        return Inertia::render('admin/reports/index', [
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'salesReport' => $salesReport,
            'userGrowthReport' => $userGrowthReport,
            'productPerformanceReport' => $productPerformanceReport,
            'sellerPerformanceReport' => $sellerPerformanceReport,
            'categoryPerformanceReport' => $categoryPerformanceReport,
        ]);
    }

    /**
     * Get date range from request or default to last 30 days.
     */
    private function getDateRange(Request $request): array
    {
        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->start_date)
            : Carbon::now()->subDays(30);

        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->end_date)
            : Carbon::now();

        return [
            'start' => $startDate->startOfDay(),
            'end' => $endDate->endOfDay(),
        ];
    }

    /**
     * Get sales report data.
     */
    private function getSalesReport(Carbon $startDate, Carbon $endDate): array
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->get();

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Daily sales breakdown
        $dailySales = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dayOrders = Order::whereDate('created_at', $currentDate)
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->get();

            $dailySales[] = [
                'date' => $currentDate->format('Y-m-d'),
                'revenue' => $dayOrders->sum('total_amount'),
                'orders' => $dayOrders->count(),
            ];

            $currentDate->addDay();
        }

        // Status breakdown
        $statusBreakdown = [];
        foreach ([Order::STATUS_PENDING, Order::STATUS_CONFIRMED, Order::STATUS_SHIPPED, Order::STATUS_DELIVERED, Order::STATUS_COMPLETED, Order::STATUS_CANCELLED] as $status) {
            $statusBreakdown[$status] = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', $status)
                ->count();
        }

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => $averageOrderValue,
            'daily_sales' => $dailySales,
            'status_breakdown' => $statusBreakdown,
        ];
    }

    /**
     * Get user growth report data.
     */
    private function getUserGrowthReport(Carbon $startDate, Carbon $endDate): array
    {
        $totalUsers = User::where('created_at', '<=', $endDate)->count();
        $newUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();

        // User growth by role
        $growthByRole = [];
        foreach ([User::ROLE_BUYER, User::ROLE_SELLER, User::ROLE_ADMINISTRATOR] as $role) {
            $growthByRole[$role] = User::where('role', $role)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
        }

        // Daily user registrations
        $dailyRegistrations = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dailyRegistrations[] = [
                'date' => $currentDate->format('Y-m-d'),
                'count' => User::whereDate('created_at', $currentDate)->count(),
            ];
            $currentDate->addDay();
        }

        return [
            'total_users' => $totalUsers,
            'new_users' => $newUsers,
            'growth_by_role' => $growthByRole,
            'daily_registrations' => $dailyRegistrations,
        ];
    }

    /**
     * Get product performance report data.
     */
    private function getProductPerformanceReport(Carbon $startDate, Carbon $endDate): array
    {
        // Top selling products using join
        $topSellingProducts = Product::with('seller')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->select('products.*', DB::raw('COUNT(DISTINCT orders.id) as orders_count'))
            ->groupBy('products.id')
            ->orderBy('orders_count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'orders_count' => $product->orders_count,
                'seller' => $product->seller ? $product->seller->name : null,
            ]);

        // Products by status
        $productsByStatus = [];
        foreach (Product::$statuses as $status => $label) {
            $productsByStatus[$status] = Product::where('status', $status)->count();
        }

        // Stock alerts
        $lowStockProducts = Product::where('stock_status', Product::STOCK_LOW_STOCK)
            ->orWhere('stock_status', Product::STOCK_OUT_OF_STOCK)
            ->count();

        return [
            'top_selling_products' => $topSellingProducts,
            'products_by_status' => $productsByStatus,
            'low_stock_products' => $lowStockProducts,
            'total_products' => Product::count(),
            'active_products' => Product::where('status', Product::STATUS_ACTIVE)->count(),
        ];
    }

    /**
     * Get seller performance report data.
     */
    private function getSellerPerformanceReport(Carbon $startDate, Carbon $endDate): array
    {
        // Top performing sellers
        $topSellers = User::where('role', User::ROLE_SELLER)
            ->withCount(['products' => function ($query) {
                $query->where('status', Product::STATUS_ACTIVE);
            }])
            ->withCount(['sellerOrders' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', Order::STATUS_CANCELLED);
            }])
            ->orderBy('seller_orders_count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($seller) => [
                'id' => $seller->id,
                'name' => $seller->name,
                'products_count' => $seller->products_count,
                'orders_count' => $seller->seller_orders_count,
            ]);

        // Seller applications
        $applicationsStats = [
            'pending' => SellerApplication::where('status', SellerApplication::STATUS_PENDING)->count(),
            'approved' => SellerApplication::where('status', SellerApplication::STATUS_APPROVED)->count(),
            'rejected' => SellerApplication::where('status', SellerApplication::STATUS_REJECTED)->count(),
        ];

        return [
            'top_sellers' => $topSellers,
            'applications_stats' => $applicationsStats,
            'total_sellers' => User::where('role', User::ROLE_SELLER)->count(),
            'active_sellers' => User::where('role', User::ROLE_SELLER)
                ->where('is_active', true)
                ->count(),
        ];
    }

    /**
     * Get category performance report data.
     */
    private function getCategoryPerformanceReport(Carbon $startDate, Carbon $endDate): array
    {
        // This would require joining through products and order items
        // For now, return basic category stats
        $categories = ProductCategory::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'products_count' => $category->products_count,
            ]);

        return [
            'top_categories' => $categories,
            'total_categories' => ProductCategory::count(),
            'active_categories' => ProductCategory::where('is_active', true)->count(),
        ];
    }

    /**
     * Export reports data.
     */
    public function export(Request $request)
    {
        // This would generate CSV/Excel export
        // For now, return JSON
        $dateRange = $this->getDateRange($request);
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        $reportType = $request->get('type', 'sales');

        $data = match ($reportType) {
            'sales' => $this->getSalesReport($startDate, $endDate),
            'users' => $this->getUserGrowthReport($startDate, $endDate),
            'products' => $this->getProductPerformanceReport($startDate, $endDate),
            'sellers' => $this->getSellerPerformanceReport($startDate, $endDate),
            default => [],
        };

        return response()->json($data);
    }
}
