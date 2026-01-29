<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderRequest;
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
        $customOrderData = $this->getCustomOrderAnalytics($user->id, $startDate, $endDate);

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
            'customOrders' => $customOrderData,
        ]);
    }

    /**
     * Get custom order analytics data.
     */
    private function getCustomOrderAnalytics(int $sellerId, Carbon $startDate, Carbon $endDate): array
    {
        // Current period stats
        $total = CustomOrderRequest::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $pending = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_PENDING)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $quoted = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_QUOTED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $accepted = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_ACCEPTED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $inProgress = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_IN_PROGRESS)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $readyForCheckout = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_READY_FOR_CHECKOUT)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $completed = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $cancelled = CustomOrderRequest::where('seller_id', $sellerId)
            ->whereIn('status', [CustomOrderRequest::STATUS_CANCELLED, CustomOrderRequest::STATUS_REJECTED, CustomOrderRequest::STATUS_DECLINED])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Revenue from completed custom orders
        $totalRevenue = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('quoted_price');

        $avgOrderValue = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->avg('quoted_price');

        // Calculate previous period for comparison
        $periodDays = $startDate->diffInDays($endDate);
        $prevStartDate = $startDate->copy()->subDays($periodDays);
        $prevEndDate = $startDate->copy()->subDay();

        $prevTotal = CustomOrderRequest::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();

        $prevCompleted = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();

        $prevRevenue = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->sum('quoted_price');

        // Growth calculations
        $requestsGrowth = $this->calculateGrowth($prevTotal, $total);
        $completedGrowth = $this->calculateGrowth($prevCompleted, $completed);
        $revenueGrowth = $this->calculateGrowth($prevRevenue, $totalRevenue);

        // Conversion rate (completed / total requests)
        $conversionRate = $total > 0 ? round(($completed / $total) * 100, 2) : 0;
        $prevConversionRate = $prevTotal > 0 ? round(($prevCompleted / $prevTotal) * 100, 2) : 0;

        // Recent custom orders
        $recentRequests = CustomOrderRequest::where('seller_id', $sellerId)
            ->with('buyer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->filter(fn ($request) => $request->buyer !== null)
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'request_number' => $request->request_number,
                    'title' => $request->title,
                    'buyer' => [
                        'id' => $request->buyer->id,
                        'name' => $request->buyer->name,
                        'avatar_url' => $request->buyer->avatar_url,
                    ],
                    'status' => $request->status,
                    'status_label' => $request->status_label,
                    'status_color' => $request->status_color,
                    'quoted_price' => $request->quoted_price,
                    'created_at' => $request->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $request->created_at->diffForHumans(),
                ];
            })
            ->values()
            ->toArray();

        // Status breakdown for chart
        $statusBreakdown = [
            ['status' => 'Pending', 'count' => $pending, 'color' => '#f59e0b'],
            ['status' => 'Quoted', 'count' => $quoted, 'color' => '#3b82f6'],
            ['status' => 'Accepted', 'count' => $accepted, 'color' => '#10b981'],
            ['status' => 'In Progress', 'count' => $inProgress, 'color' => '#8b5cf6'],
            ['status' => 'Ready', 'count' => $readyForCheckout, 'color' => '#f97316'],
            ['status' => 'Completed', 'count' => $completed, 'color' => '#059669'],
            ['status' => 'Cancelled/Declined', 'count' => $cancelled, 'color' => '#6b7280'],
        ];

        // All-time stats (not just period)
        $allTimeTotal = CustomOrderRequest::where('seller_id', $sellerId)->count();
        $allTimeCompleted = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->count();
        $allTimeRevenue = CustomOrderRequest::where('seller_id', $sellerId)
            ->where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->sum('quoted_price');
        $activeRequests = CustomOrderRequest::where('seller_id', $sellerId)
            ->whereNotIn('status', [
                CustomOrderRequest::STATUS_COMPLETED,
                CustomOrderRequest::STATUS_CANCELLED,
                CustomOrderRequest::STATUS_REJECTED,
                CustomOrderRequest::STATUS_DECLINED,
            ])
            ->count();

        return [
            'overview' => [
                'total' => $total,
                'pending' => $pending,
                'quoted' => $quoted,
                'in_progress' => $inProgress,
                'ready_for_checkout' => $readyForCheckout,
                'completed' => $completed,
                'cancelled' => $cancelled,
                'total_revenue' => round($totalRevenue, 2),
                'avg_order_value' => round($avgOrderValue ?? 0, 2),
                'conversion_rate' => $conversionRate,
            ],
            'growth' => [
                'requests' => $requestsGrowth,
                'completed' => $completedGrowth,
                'revenue' => $revenueGrowth,
            ],
            'comparison' => [
                'prev_total' => $prevTotal,
                'prev_completed' => $prevCompleted,
                'prev_revenue' => round($prevRevenue, 2),
                'prev_conversion_rate' => $prevConversionRate,
            ],
            'status_breakdown' => array_filter($statusBreakdown, fn($item) => $item['count'] > 0),
            'recent_requests' => $recentRequests,
            'all_time' => [
                'total' => $allTimeTotal,
                'completed' => $allTimeCompleted,
                'revenue' => round($allTimeRevenue, 2),
                'active' => $activeRequests,
            ],
        ];
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
            ->map(fn ($item) => [
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
            ->map(fn ($item) => [
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
            ->map(fn ($item) => [
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
            ->map(fn ($item) => [
                'status' => ucfirst($item->status),
                'count' => $item->count,
            ]);

        // Products by stock status
        $productsByStock = Product::where('seller_id', $sellerId)
            ->select('stock_status', DB::raw('COUNT(*) as count'))
            ->groupBy('stock_status')
            ->get()
            ->map(fn ($item) => [
                'status' => str_replace('_', ' ', ucwords($item->stock_status, '_')),
                'count' => $item->count,
            ]);

        // Most viewed products
        $mostViewed = Product::where('seller_id', $sellerId)
            ->where('view_count', '>', 0)
            ->orderByDesc('view_count')
            ->take(5)
            ->get(['id', 'name', 'view_count', 'featured_image', 'images'])
            ->map(fn ($product) => [
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
            ->whereNotNull('user_id')
            ->select(
                'user_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent')
            )
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->take(10)
            ->with('buyer')
            ->get()
            ->filter(fn ($item) => $item->buyer !== null)
            ->map(fn ($item) => [
                'customer' => [
                    'id' => $item->buyer->id,
                    'name' => $item->buyer->name,
                    'email' => $item->buyer->email,
                    'avatar' => $item->buyer->avatar_url,
                ],
                'order_count' => $item->order_count,
                'total_spent' => round($item->total_spent, 2),
                'avg_order_value' => round($item->total_spent / $item->order_count, 2),
            ])
            ->values();

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
            ->whereNotNull('product_id')
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
            ->filter(fn ($item) => $item->product !== null)
            ->map(fn ($item) => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'image' => $item->product->primary_image,
                ],
                'quantity_sold' => $item->total_quantity,
                'revenue' => round($item->total_revenue, 2),
            ])
            ->values();

        $topByQuantity = OrderItem::whereHas('order', function ($query) use ($sellerId, $startDate, $endDate) {
            $query->where('seller_id', $sellerId)
                ->where('status', Order::STATUS_COMPLETED)
                ->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->whereNotNull('product_id')
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
            ->filter(fn ($item) => $item->product !== null)
            ->map(fn ($item) => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'image' => $item->product->primary_image,
                ],
                'quantity_sold' => $item->total_quantity,
                'order_count' => $item->order_count,
            ])
            ->values();

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
            ->map(fn ($order) => [
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
     * Export analytics data (CSV/PDF).
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $format = $request->input('format', 'csv'); // csv or pdf
        $dateRange = $request->input('range', '30');
        $endDate = Carbon::now();
        $startDate = $this->getStartDate($dateRange, $endDate);

        // Get analytics data
        $overview = $this->getOverviewStats($user->id, $startDate, $endDate);
        $revenueData = $this->getRevenueAnalytics($user->id, $startDate, $endDate, $dateRange);
        $ordersData = $this->getOrdersAnalytics($user->id, $startDate, $endDate, $dateRange);
        $productsData = $this->getProductsAnalytics($user->id, $startDate, $endDate);
        $customersData = $this->getCustomersAnalytics($user->id, $startDate, $endDate);
        $topProducts = $this->getTopProducts($user->id, $startDate, $endDate);
        $recentOrders = $this->getRecentOrders($user->id, 50);

        if ($format === 'pdf') {
            return $this->exportPdf($user, $overview, $revenueData, $ordersData, $productsData, $customersData, $topProducts, $recentOrders, $startDate, $endDate);
        }

        return $this->exportCsv($user, $overview, $revenueData, $ordersData, $productsData, $customersData, $topProducts, $recentOrders, $startDate, $endDate);
    }

    /**
     * Export analytics data as CSV.
     */
    private function exportCsv($user, $overview, $revenueData, $ordersData, $productsData, $customersData, $topProducts, $recentOrders, $startDate, $endDate)
    {
        $filename = 'seller_report_'.$user->id.'_'.now()->format('Y-m-d_His').'.csv';
        $handle = fopen('php://temp', 'r+');

        // Overview Section
        fputcsv($handle, ['SELLER ANALYTICS REPORT']);
        fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
        fputcsv($handle, ['Period:', $startDate->format('Y-m-d').' to '.$endDate->format('Y-m-d')]);
        fputcsv($handle, []);

        fputcsv($handle, ['OVERVIEW STATISTICS']);
        fputcsv($handle, ['Metric', 'Value', 'Growth %']);
        fputcsv($handle, ['Total Revenue', number_format($overview['total_revenue'], 2), $overview['revenue_growth'].'%']);
        fputcsv($handle, ['Total Orders', $overview['total_orders'], $overview['orders_growth'].'%']);
        fputcsv($handle, ['Total Customers', $overview['total_customers'], $overview['customers_growth'].'%']);
        fputcsv($handle, ['Average Order Value', number_format($overview['avg_order_value'], 2), $overview['avg_order_value_growth'].'%']);
        fputcsv($handle, ['Conversion Rate', $overview['conversion_rate'].'%', '']);
        fputcsv($handle, []);

        // Revenue Timeline
        fputcsv($handle, ['REVENUE TIMELINE']);
        fputcsv($handle, ['Period', 'Revenue', 'Order Count']);
        foreach ($revenueData['timeline'] as $period) {
            fputcsv($handle, [
                $period['period'],
                number_format($period['revenue'] ?? 0, 2),
                $period['order_count'] ?? 0,
            ]);
        }
        fputcsv($handle, []);

        // Orders by Status
        fputcsv($handle, ['ORDERS BY STATUS']);
        fputcsv($handle, ['Status', 'Count']);
        foreach ($ordersData['by_status'] as $status) {
            fputcsv($handle, [$status['status'], $status['count']]);
        }
        fputcsv($handle, []);

        // Top Products by Revenue
        fputcsv($handle, ['TOP PRODUCTS BY REVENUE']);
        fputcsv($handle, ['Product Name', 'Quantity Sold', 'Revenue']);
        foreach ($topProducts['by_revenue'] as $product) {
            fputcsv($handle, [
                $product['product']['name'],
                $product['quantity_sold'],
                number_format($product['revenue'], 2),
            ]);
        }
        fputcsv($handle, []);

        // Top Customers
        fputcsv($handle, ['TOP CUSTOMERS']);
        fputcsv($handle, ['Customer Name', 'Email', 'Order Count', 'Total Spent', 'Avg Order Value']);
        foreach ($customersData['top_customers'] as $customer) {
            fputcsv($handle, [
                $customer['customer']['name'],
                $customer['customer']['email'],
                $customer['order_count'],
                number_format($customer['total_spent'], 2),
                number_format($customer['avg_order_value'], 2),
            ]);
        }
        fputcsv($handle, []);

        // Recent Orders
        fputcsv($handle, ['RECENT ORDERS']);
        fputcsv($handle, ['Order Number', 'Customer', 'Total Amount', 'Status', 'Date']);
        foreach ($recentOrders as $order) {
            fputcsv($handle, [
                $order['order_number'],
                $order['customer']['name'],
                number_format($order['total_amount'], 2),
                $order['status_label'],
                $order['created_at'],
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * Export analytics data as PDF.
     */
    private function exportPdf($user, $overview, $revenueData, $ordersData, $productsData, $customersData, $topProducts, $recentOrders, $startDate, $endDate)
    {
        // For PDF, we'll return a simple HTML that can be printed to PDF
        // In production, you might want to use a library like dompdf or snappy
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Seller Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Seller Analytics Report</h1>
    <p><strong>Generated:</strong> '.now()->format('Y-m-d H:i:s').'</p>
    <p><strong>Period:</strong> '.$startDate->format('Y-m-d').' to '.$endDate->format('Y-m-d').'</p>
    
    <div class="summary">
        <h2>Overview Statistics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Growth %</th></tr>
            <tr><td>Total Revenue</td><td>₱'.number_format($overview['total_revenue'], 2).'</td><td>'.$overview['revenue_growth'].'%</td></tr>
            <tr><td>Total Orders</td><td>'.$overview['total_orders'].'</td><td>'.$overview['orders_growth'].'%</td></tr>
            <tr><td>Total Customers</td><td>'.$overview['total_customers'].'</td><td>'.$overview['customers_growth'].'%</td></tr>
            <tr><td>Average Order Value</td><td>₱'.number_format($overview['avg_order_value'], 2).'</td><td>'.$overview['avg_order_value_growth'].'%</td></tr>
            <tr><td>Conversion Rate</td><td>'.$overview['conversion_rate'].'%</td><td>-</td></tr>
        </table>
    </div>

    <h2>Top Products by Revenue</h2>
    <table>
        <tr><th>Product Name</th><th>Quantity Sold</th><th>Revenue</th></tr>';
        foreach ($topProducts['by_revenue'] as $product) {
            $html .= '<tr>
                <td>'.htmlspecialchars($product['product']['name']).'</td>
                <td>'.$product['quantity_sold'].'</td>
                <td>₱'.number_format($product['revenue'], 2).'</td>
            </tr>';
        }
        $html .= '</table>

    <h2>Top Customers</h2>
    <table>
        <tr><th>Customer Name</th><th>Email</th><th>Order Count</th><th>Total Spent</th></tr>';
        foreach (array_slice($customersData['top_customers'], 0, 10) as $customer) {
            $html .= '<tr>
                <td>'.htmlspecialchars($customer['customer']['name']).'</td>
                <td>'.htmlspecialchars($customer['customer']['email']).'</td>
                <td>'.$customer['order_count'].'</td>
                <td>₱'.number_format($customer['total_spent'], 2).'</td>
            </tr>';
        }
        $html .= '</table>

    <h2>Recent Orders</h2>
    <table>
        <tr><th>Order Number</th><th>Customer</th><th>Total Amount</th><th>Status</th><th>Date</th></tr>';
        foreach (array_slice($recentOrders, 0, 20) as $order) {
            $html .= '<tr>
                <td>'.$order['order_number'].'</td>
                <td>'.htmlspecialchars($order['customer']['name']).'</td>
                <td>₱'.number_format($order['total_amount'], 2).'</td>
                <td>'.$order['status_label'].'</td>
                <td>'.$order['created_at'].'</td>
            </tr>';
        }
        $html .= '</table>
</body>
</html>';

        $filename = 'seller_report_'.$user->id.'_'.now()->format('Y-m-d_His').'.html';

        return response($html, 200, [
            'Content-Type' => 'text/html',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
