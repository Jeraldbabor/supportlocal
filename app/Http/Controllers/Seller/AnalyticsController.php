<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Show the analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $dateRange = $request->input('range', '30'); // Default to last 30 days
        
        // Calculate date range
        $endDate = Carbon::now();
        $startDate = $this->getStartDate($dateRange, $endDate);
        
        // Get all analytics data
        $overview = $this->getOverviewStats($user->id, $startDate, $endDate);
        $revenueData = $this->getRevenueAnalytics($user->id, $startDate, $endDate, $dateRange);
        $ordersData = $this->getOrdersAnalytics($user->id, $startDate, $endDate, $dateRange);
        $productsData = $this->getProductsAnalytics($user->id, $startDate, $endDate);
        $customersData = $this->getCustomersAnalytics($user->id, $startDate, $endDate);
        $topProducts = $this->getTopProducts($user->id, $startDate, $endDate);
        $recentOrders = $this->getRecentOrders($user->id, 10);
        
        return Inertia::render('seller/analytics', [
            'dateRange' => $dateRange,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'overview' => $overview,
            'revenue' => $revenueData,
            'orders' => $ordersData,
            'products' => $productsData,
            'customers' => $customersData,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Get start date based on range selection.
     */
    private function getStartDate(string $range, Carbon $endDate): Carbon
    {
        return match ($range) {
            '7' => $endDate->copy()->subDays(7),
            '30' => $endDate->copy()->subDays(30),
            '90' => $endDate->copy()->subDays(90),
            '365' => $endDate->copy()->subYear(),
            'ytd' => $endDate->copy()->startOfYear(),
            'mtd' => $endDate->copy()->startOfMonth(),
            default => $endDate->copy()->subDays(30),
        };
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(int $sellerId, Carbon $startDate, Carbon $endDate): array
    {
        // Current period stats
        $totalRevenue = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $totalOrders = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $completedOrders = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $uniqueCustomers = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->distinct('user_id')
            ->count('user_id');

        // Calculate previous period for comparison
        $periodDays = $startDate->diffInDays($endDate);
        $prevStartDate = $startDate->copy()->subDays($periodDays);
        $prevEndDate = $startDate->copy()->subDay();

        $prevRevenue = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->sum('total_amount');

        $prevOrders = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();

        $prevCustomers = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->distinct('user_id')
            ->count('user_id');

        // Calculate growth percentages
        $revenueGrowth = $this->calculateGrowth($prevRevenue, $totalRevenue);
        $ordersGrowth = $this->calculateGrowth($prevOrders, $totalOrders);
        $customersGrowth = $this->calculateGrowth($prevCustomers, $uniqueCustomers);

        // Calculate average order value
        $avgOrderValue = $completedOrders > 0 ? $totalRevenue / $completedOrders : 0;
        $prevCompletedOrders = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();
        $prevAvgOrderValue = $prevCompletedOrders > 0 ? $prevRevenue / $prevCompletedOrders : 0;
        $avgOrderValueGrowth = $this->calculateGrowth($prevAvgOrderValue, $avgOrderValue);

        return [
            'total_revenue' => round($totalRevenue, 2),
            'revenue_growth' => $revenueGrowth,
            'total_orders' => $totalOrders,
            'orders_growth' => $ordersGrowth,
            'total_customers' => $uniqueCustomers,
            'customers_growth' => $customersGrowth,
            'avg_order_value' => round($avgOrderValue, 2),
            'avg_order_value_growth' => $avgOrderValueGrowth,
            'conversion_rate' => $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 2) : 0,
        ];
    }

    /**
     * Get revenue analytics data.
     */
    private function getRevenueAnalytics(int $sellerId, Carbon $startDate, Carbon $endDate, string $range): array
    {
        // Determine grouping based on range
        $groupBy = $this->getGroupByFormat($range);
        
        $revenueByPeriod = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("TO_CHAR(created_at, '{$groupBy}') as period"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Fill in missing periods with zero values
        $filledData = $this->fillMissingPeriods($revenueByPeriod, $startDate, $endDate, $range);

        // Calculate revenue by status
        $revenueByStatus = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'status',
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => ucfirst($item->status),
                'revenue' => round($item->revenue, 2),
                'count' => $item->count,
            ]);

        return [
            'timeline' => $filledData,
            'by_status' => $revenueByStatus,
        ];
    }

    /**
     * Get orders analytics data.
     */
    private function getOrdersAnalytics(int $sellerId, Carbon $startDate, Carbon $endDate, string $range): array
    {
        $groupBy = $this->getGroupByFormat($range);
        
        // Orders over time
        $ordersByPeriod = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("TO_CHAR(created_at, '{$groupBy}') as period"),
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
                DB::raw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed"),
                DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled")
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Orders by status
        $ordersByStatus = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => ucfirst($item->status),
                'count' => $item->count,
            ]);

        // Orders by payment method
        $ordersByPayment = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('payment_method')
            ->get()
            ->map(fn($item) => [
                'method' => strtoupper($item->payment_method),
                'count' => $item->count,
                'revenue' => round($item->revenue, 2),
            ]);

        // Average order fulfillment time
        $avgFulfillmentTime = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereNotNull('completed_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_hours')
            ->value('avg_hours');

        return [
            'timeline' => $ordersByPeriod,
            'by_status' => $ordersByStatus,
            'by_payment_method' => $ordersByPayment,
            'avg_fulfillment_hours' => round($avgFulfillmentTime ?? 0, 1),
        ];
    }

    /**
     * Get products analytics data.
     */
    private function getProductsAnalytics(int $sellerId, Carbon $startDate, Carbon $endDate): array
    {
        $totalProducts = Product::where('seller_id', $sellerId)->count();
        $activeProducts = Product::where('seller_id', $sellerId)
            ->where('status', Product::STATUS_ACTIVE)
            ->count();
        
        // Products by status
        $productsByStatus = Product::where('seller_id', $sellerId)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => ucfirst($item->status),
                'count' => $item->count,
            ]);

        // Products by stock status
        $productsByStock = Product::where('seller_id', $sellerId)
            ->select('stock_status', DB::raw('COUNT(*) as count'))
            ->groupBy('stock_status')
            ->get()
            ->map(fn($item) => [
                'status' => str_replace('_', ' ', ucwords($item->stock_status, '_')),
                'count' => $item->count,
            ]);

        // Most viewed products
        $mostViewed = Product::where('seller_id', $sellerId)
            ->where('view_count', '>', 0)
            ->orderByDesc('view_count')
            ->take(5)
            ->get(['id', 'name', 'view_count', 'featured_image', 'images'])
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'views' => $product->view_count,
                'image' => $product->primary_image,
            ]);

        // Products added in period
        $productsAdded = Product::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return [
            'total' => $totalProducts,
            'active' => $activeProducts,
            'added_in_period' => $productsAdded,
            'by_status' => $productsByStatus,
            'by_stock' => $productsByStock,
            'most_viewed' => $mostViewed,
        ];
    }

    /**
     * Get customers analytics data.
     */
    private function getCustomersAnalytics(int $sellerId, Carbon $startDate, Carbon $endDate): array
    {
        // Total unique customers
        $totalCustomers = Order::where('seller_id', $sellerId)
            ->distinct('user_id')
            ->count('user_id');

        // New customers in period
        $newCustomers = Order::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotExists(function ($query) use ($sellerId, $startDate) {
                $query->select(DB::raw(1))
                    ->from('orders as o2')
                    ->whereColumn('o2.user_id', 'orders.user_id')
                    ->where('o2.seller_id', $sellerId)
                    ->where('o2.created_at', '<', $startDate);
            })
            ->distinct('user_id')
            ->count('user_id');

        // Returning customers
        $returningCustomers = Order::where('seller_id', $sellerId)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        // Top customers
        $topCustomers = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'user_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent')
            )
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->take(10)
            ->with('buyer:id,name,email,profile_picture,avatar')
            ->get()
            ->map(fn($item) => [
                'customer' => [
                    'id' => $item->buyer->id,
                    'name' => $item->buyer->name,
                    'email' => $item->buyer->email,
                    'avatar' => $item->buyer->avatar_url,
                ],
                'order_count' => $item->order_count,
                'total_spent' => round($item->total_spent, 2),
                'avg_order_value' => round($item->total_spent / $item->order_count, 2),
            ]);

        // Customer lifetime value
        $avgLifetimeValue = Order::where('seller_id', $sellerId)
            ->where('status', Order::STATUS_COMPLETED)
            ->select('user_id', DB::raw('SUM(total_amount) as total'))
            ->groupBy('user_id')
            ->get()
            ->avg('total');

        return [
            'total' => $totalCustomers,
            'new' => $newCustomers,
            'returning' => $returningCustomers,
            'retention_rate' => $totalCustomers > 0 ? round(($returningCustomers / $totalCustomers) * 100, 2) : 0,
            'avg_lifetime_value' => round($avgLifetimeValue ?? 0, 2),
            'top_customers' => $topCustomers,
        ];
    }

    /**
     * Get top selling products.
     */
    private function getTopProducts(int $sellerId, Carbon $startDate, Carbon $endDate): array
    {
        $topByRevenue = OrderItem::whereHas('order', function ($query) use ($sellerId, $startDate, $endDate) {
            $query->where('seller_id', $sellerId)
                ->where('status', Order::STATUS_COMPLETED)
                ->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(price * quantity) as total_revenue')
            )
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->with('product:id,name,price,featured_image,images')
            ->get()
            ->map(fn($item) => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'image' => $item->product->primary_image,
                ],
                'quantity_sold' => $item->total_quantity,
                'revenue' => round($item->total_revenue, 2),
            ]);

        $topByQuantity = OrderItem::whereHas('order', function ($query) use ($sellerId, $startDate, $endDate) {
            $query->where('seller_id', $sellerId)
                ->where('status', Order::STATUS_COMPLETED)
                ->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('COUNT(DISTINCT order_id) as order_count')
            )
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->take(10)
            ->with('product:id,name,price,featured_image,images')
            ->get()
            ->map(fn($item) => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'image' => $item->product->primary_image,
                ],
                'quantity_sold' => $item->total_quantity,
                'order_count' => $item->order_count,
            ]);

        return [
            'by_revenue' => $topByRevenue,
            'by_quantity' => $topByQuantity,
        ];
    }

    /**
     * Get recent orders.
     */
    private function getRecentOrders(int $sellerId, int $limit = 10): array
    {
        return Order::where('seller_id', $sellerId)
            ->with(['buyer:id,name,email', 'orderItems.product:id,name'])
            ->orderByDesc('created_at')
            ->take($limit)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => [
                    'id' => $order->buyer->id,
                    'name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                ],
                'total_amount' => round($order->total_amount, 2),
                'status' => $order->status,
                'status_label' => ucfirst($order->status),
                'items_count' => $order->orderItems->count(),
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $order->created_at->diffForHumans(),
            ])
            ->toArray();
    }

    /**
     * Calculate growth percentage.
     */
    private function calculateGrowth(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get group by format based on date range.
     */
    private function getGroupByFormat(string $range): string
    {
        return match ($range) {
            '7' => 'YYYY-MM-DD', // Daily for 7 days
            '30' => 'YYYY-MM-DD', // Daily for 30 days
            '90' => 'IYYY-IW', // Weekly for 90 days (ISO week)
            '365', 'ytd' => 'YYYY-MM', // Monthly for year
            'mtd' => 'YYYY-MM-DD', // Daily for month
            default => 'YYYY-MM-DD',
        };
    }

    /**
     * Fill missing periods with zero values.
     */
    private function fillMissingPeriods($data, Carbon $startDate, Carbon $endDate, string $range): array
    {
        $periods = $this->generatePeriods($startDate, $endDate, $range);
        $dataMap = $data->pluck('revenue', 'period')->toArray();
        
        return collect($periods)->map(function ($period) use ($dataMap) {
            return [
                'period' => $period,
                'revenue' => $dataMap[$period] ?? 0,
            ];
        })->toArray();
    }

    /**
     * Generate all periods between dates.
     */
    private function generatePeriods(Carbon $startDate, Carbon $endDate, string $range): array
    {
        $periods = [];
        $current = $startDate->copy();
        
        $format = match ($range) {
            '7', '30', 'mtd' => 'Y-m-d',
            '90' => 'o-W', // ISO year and week
            '365', 'ytd' => 'Y-m',
            default => 'Y-m-d',
        };
        
        $increment = match ($range) {
            '7', '30', 'mtd' => 'day',
            '90' => 'week',
            '365', 'ytd' => 'month',
            default => 'day',
        };
        
        while ($current->lte($endDate)) {
            $periods[] = $current->format($format);
            $current->add(1, $increment);
        }
        
        return $periods;
    }

    /**
     * Export analytics data (future feature).
     */
    public function export(Request $request)
    {
        // TODO: Implement export functionality (CSV, PDF, etc.)
        return response()->json(['message' => 'Export feature coming soon']);
    }
}
