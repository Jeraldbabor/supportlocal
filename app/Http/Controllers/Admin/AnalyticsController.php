<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderBid;
use App\Models\CustomOrderRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalyticsController extends Controller
{
    /**
     * Show the analytics dashboard.
     */
    public function index(Request $request): InertiaResponse
    {
        $dateRange = $request->input('range', '30');
        $endDate = Carbon::now();
        $startDate = $this->getStartDate($dateRange, $endDate);

        // Get all analytics data
        $overview = $this->getOverviewStats($startDate, $endDate);
        $revenueData = $this->getRevenueChartData($startDate, $endDate, $dateRange);
        $userGrowthData = $this->getUserGrowthChartData();
        $orderTrendsData = $this->getOrderTrendsChartData($startDate, $endDate);
        $topSellers = $this->getTopSellers($startDate, $endDate);
        $topProducts = $this->getTopProducts($startDate, $endDate);
        $customOrderStats = $this->getCustomOrderStats($startDate, $endDate);
        $ordersByStatus = $this->getOrdersByStatus($startDate, $endDate);
        $revenueByCategory = $this->getRevenueByCategory($startDate, $endDate);

        // Marketplace & Bidding Analytics (Unique Feature)
        $marketplaceStats = $this->getMarketplaceStats($startDate, $endDate);
        $biddingTrends = $this->getBiddingTrendsData($startDate, $endDate);
        $topBiddingSellers = $this->getTopBiddingSellers($startDate, $endDate);
        $customOrdersByCategory = $this->getCustomOrdersByCategory($startDate, $endDate);
        $bidActivityByHour = $this->getBidActivityByHour($startDate, $endDate);

        return Inertia::render('admin/analytics', [
            'dateRange' => $dateRange,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'overview' => $overview,
            'revenueData' => $revenueData,
            'userGrowthData' => $userGrowthData,
            'orderTrendsData' => $orderTrendsData,
            'topSellers' => $topSellers,
            'topProducts' => $topProducts,
            'customOrderStats' => $customOrderStats,
            'ordersByStatus' => $ordersByStatus,
            'revenueByCategory' => $revenueByCategory,
            // Marketplace & Bidding (Unique Feature)
            'marketplaceStats' => $marketplaceStats,
            'biddingTrends' => $biddingTrends,
            'topBiddingSellers' => $topBiddingSellers,
            'customOrdersByCategory' => $customOrdersByCategory,
            'bidActivityByHour' => $bidActivityByHour,
        ]);
    }

    /**
     * Export analytics data to Excel/CSV
     */
    public function export(Request $request)
    {
        $dateRange = $request->input('range', '30');
        $reportType = $request->input('type', 'all');
        $endDate = Carbon::now();
        $startDate = $this->getStartDate($dateRange, $endDate);

        $filename = 'analytics_report_'.now()->format('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($startDate, $endDate, $reportType, $dateRange) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Report Header
            fputcsv($file, ['SUPPORTLOCAL ANALYTICS REPORT']);
            fputcsv($file, ['Generated:', now()->format('Y-m-d H:i:s')]);
            fputcsv($file, ['Period:', $startDate->format('Y-m-d').' to '.$endDate->format('Y-m-d')]);
            fputcsv($file, []);

            if ($reportType === 'all' || $reportType === 'overview') {
                $this->exportOverview($file, $startDate, $endDate);
            }

            if ($reportType === 'all' || $reportType === 'revenue') {
                $this->exportRevenue($file, $startDate, $endDate, $dateRange);
            }

            if ($reportType === 'all' || $reportType === 'orders') {
                $this->exportOrders($file, $startDate, $endDate);
            }

            if ($reportType === 'all' || $reportType === 'sellers') {
                $this->exportTopSellers($file, $startDate, $endDate);
            }

            if ($reportType === 'all' || $reportType === 'products') {
                $this->exportTopProducts($file, $startDate, $endDate);
            }

            if ($reportType === 'all' || $reportType === 'users') {
                $this->exportUserGrowth($file);
            }

            if ($reportType === 'all' || $reportType === 'custom_orders') {
                $this->exportCustomOrders($file, $startDate, $endDate);
            }

            if ($reportType === 'all' || $reportType === 'marketplace') {
                $this->exportMarketplace($file, $startDate, $endDate);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
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
     * Get overview statistics
     */
    private function getOverviewStats(Carbon $startDate, Carbon $endDate): array
    {
        $totalRevenue = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedOrders = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $totalCommission = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('admin_commission');

        $newUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();
        $newSellers = User::where('role', User::ROLE_SELLER)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $newBuyers = User::where('role', User::ROLE_BUYER)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $newProducts = Product::whereBetween('created_at', [$startDate, $endDate])->count();

        // Calculate previous period for comparison
        $periodDays = $startDate->diffInDays($endDate);
        $prevStartDate = $startDate->copy()->subDays($periodDays);
        $prevEndDate = $startDate->copy()->subDay();

        $prevRevenue = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->sum('total_amount');

        $prevOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
        $prevUsers = User::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();

        return [
            'total_revenue' => round($totalRevenue, 2),
            'revenue_growth' => $this->calculateGrowth($prevRevenue, $totalRevenue),
            'total_orders' => $totalOrders,
            'orders_growth' => $this->calculateGrowth($prevOrders, $totalOrders),
            'completed_orders' => $completedOrders,
            'total_commission' => round($totalCommission, 2),
            'new_users' => $newUsers,
            'users_growth' => $this->calculateGrowth($prevUsers, $newUsers),
            'new_sellers' => $newSellers,
            'new_buyers' => $newBuyers,
            'new_products' => $newProducts,
            'avg_order_value' => $completedOrders > 0 ? round($totalRevenue / $completedOrders, 2) : 0,
        ];
    }

    /**
     * Get revenue chart data
     */
    private function getRevenueChartData(Carbon $startDate, Carbon $endDate, string $range): array
    {
        $data = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $dayRevenue = Order::whereDate('created_at', $current)
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->sum('total_amount');
            $dayCommission = Order::whereDate('completed_at', $current)
                ->where('status', Order::STATUS_COMPLETED)
                ->sum('admin_commission');

            $data[] = [
                'date' => $current->format('M d'),
                'revenue' => round($dayRevenue, 2),
                'commission' => round($dayCommission, 2),
            ];

            $current->addDay();
        }

        return $data;
    }

    /**
     * Get user growth chart data (last 12 months)
     */
    private function getUserGrowthChartData(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $startOfMonth = Carbon::now()->subMonths($i)->startOfMonth();
            $endOfMonth = Carbon::now()->subMonths($i)->endOfMonth();

            $buyers = User::where('role', User::ROLE_BUYER)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();
            $sellers = User::where('role', User::ROLE_SELLER)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $data[] = [
                'month' => $startOfMonth->format('M Y'),
                'buyers' => $buyers,
                'sellers' => $sellers,
                'total' => $buyers + $sellers,
            ];
        }

        return $data;
    }

    /**
     * Get order trends chart data
     */
    private function getOrderTrendsChartData(Carbon $startDate, Carbon $endDate): array
    {
        $data = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $total = Order::whereDate('created_at', $current)->count();
            $completed = Order::whereDate('created_at', $current)
                ->where('status', Order::STATUS_COMPLETED)
                ->count();
            $cancelled = Order::whereDate('created_at', $current)
                ->where('status', Order::STATUS_CANCELLED)
                ->count();

            $data[] = [
                'date' => $current->format('M d'),
                'total' => $total,
                'completed' => $completed,
                'cancelled' => $cancelled,
            ];

            $current->addDay();
        }

        return $data;
    }

    /**
     * Get top performing sellers
     */
    private function getTopSellers(Carbon $startDate, Carbon $endDate): array
    {
        return Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('seller_id')
            ->select('seller_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )
            ->groupBy('seller_id')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->with('seller')
            ->get()
            ->filter(fn ($item) => $item->seller !== null)
            ->map(fn ($item) => [
                'id' => $item->seller->id,
                'name' => $item->seller->name,
                'email' => $item->seller->email,
                'avatar_url' => $item->seller->avatar_url,
                'order_count' => $item->order_count,
                'total_revenue' => round($item->total_revenue, 2),
                'avg_order_value' => round($item->avg_order_value, 2),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Get top products
     */
    private function getTopProducts(Carbon $startDate, Carbon $endDate): array
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', Order::STATUS_COMPLETED)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereNotNull('order_items.product_id')
            ->select(
                'products.id',
                'products.name',
                'products.price',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'quantity_sold' => $item->total_quantity,
                'revenue' => round($item->total_revenue, 2),
            ])
            ->toArray();
    }

    /**
     * Get custom order statistics
     */
    private function getCustomOrderStats(Carbon $startDate, Carbon $endDate): array
    {
        $total = CustomOrderRequest::whereBetween('created_at', [$startDate, $endDate])->count();
        $completed = CustomOrderRequest::where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $totalValue = CustomOrderRequest::where('status', CustomOrderRequest::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('quoted_price');

        return [
            'total' => $total,
            'pending' => CustomOrderRequest::where('status', CustomOrderRequest::STATUS_PENDING)
                ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'in_progress' => CustomOrderRequest::where('status', CustomOrderRequest::STATUS_IN_PROGRESS)
                ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed' => $completed,
            'cancelled' => CustomOrderRequest::whereIn('status', [
                CustomOrderRequest::STATUS_CANCELLED,
                CustomOrderRequest::STATUS_REJECTED,
                CustomOrderRequest::STATUS_DECLINED,
            ])->whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_value' => round($totalValue, 2),
            'conversion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get marketplace statistics (bidding system)
     */
    private function getMarketplaceStats(Carbon $startDate, Carbon $endDate): array
    {
        // Public requests (open for bidding)
        $publicRequests = CustomOrderRequest::where('is_public', true)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $openRequests = CustomOrderRequest::where('is_public', true)
            ->where('status', CustomOrderRequest::STATUS_OPEN)
            ->count();

        // Bid statistics
        $totalBids = CustomOrderBid::whereBetween('created_at', [$startDate, $endDate])->count();
        $acceptedBids = CustomOrderBid::where('status', CustomOrderBid::STATUS_ACCEPTED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $rejectedBids = CustomOrderBid::where('status', CustomOrderBid::STATUS_REJECTED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $pendingBids = CustomOrderBid::where('status', CustomOrderBid::STATUS_PENDING)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Average bids per request
        $requestsWithBids = CustomOrderRequest::where('is_public', true)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->withCount('bids')
            ->get();

        $avgBidsPerRequest = $requestsWithBids->count() > 0
            ? round($requestsWithBids->avg('bids_count'), 1)
            : 0;

        // Bid acceptance rate
        $bidAcceptanceRate = $totalBids > 0
            ? round(($acceptedBids / $totalBids) * 100, 2)
            : 0;

        // Total value of accepted bids
        $acceptedBidValue = CustomOrderBid::where('status', CustomOrderBid::STATUS_ACCEPTED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('proposed_price');

        // Average bid response time (hours)
        $avgResponseTime = CustomOrderBid::whereBetween('custom_order_bids.created_at', [$startDate, $endDate])
            ->join('custom_order_requests', 'custom_order_bids.custom_order_request_id', '=', 'custom_order_requests.id')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (custom_order_bids.created_at - custom_order_requests.created_at)) / 3600) as avg_hours')
            ->value('avg_hours');

        // Unique sellers who submitted bids
        $activeBidders = CustomOrderBid::whereBetween('custom_order_bids.created_at', [$startDate, $endDate])
            ->distinct('seller_id')
            ->count('seller_id');

        // Previous period for comparison
        $periodDays = $startDate->diffInDays($endDate);
        $prevStartDate = $startDate->copy()->subDays($periodDays);
        $prevEndDate = $startDate->copy()->subDay();

        $prevBids = CustomOrderBid::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();
        $prevPublicRequests = CustomOrderRequest::where('is_public', true)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();

        return [
            'public_requests' => $publicRequests,
            'public_requests_growth' => $this->calculateGrowth($prevPublicRequests, $publicRequests),
            'open_requests' => $openRequests,
            'total_bids' => $totalBids,
            'bids_growth' => $this->calculateGrowth($prevBids, $totalBids),
            'accepted_bids' => $acceptedBids,
            'rejected_bids' => $rejectedBids,
            'pending_bids' => $pendingBids,
            'avg_bids_per_request' => $avgBidsPerRequest,
            'bid_acceptance_rate' => $bidAcceptanceRate,
            'accepted_bid_value' => round($acceptedBidValue, 2),
            'avg_response_time' => round($avgResponseTime ?? 0, 1),
            'active_bidders' => $activeBidders,
        ];
    }

    /**
     * Get bidding trends chart data
     */
    private function getBiddingTrendsData(Carbon $startDate, Carbon $endDate): array
    {
        $data = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $dayBids = CustomOrderBid::whereDate('created_at', $current)->count();
            $dayAccepted = CustomOrderBid::whereDate('accepted_at', $current)
                ->where('status', CustomOrderBid::STATUS_ACCEPTED)
                ->count();
            $dayRequests = CustomOrderRequest::where('is_public', true)
                ->whereDate('created_at', $current)
                ->count();

            $data[] = [
                'date' => $current->format('M d'),
                'bids' => $dayBids,
                'accepted' => $dayAccepted,
                'requests' => $dayRequests,
            ];

            $current->addDay();
        }

        return $data;
    }

    /**
     * Get top bidding sellers (most active in marketplace)
     */
    private function getTopBiddingSellers(Carbon $startDate, Carbon $endDate): array
    {
        return CustomOrderBid::whereBetween('custom_order_bids.created_at', [$startDate, $endDate])
            ->select(
                'seller_id',
                DB::raw('COUNT(*) as total_bids'),
                DB::raw('SUM(CASE WHEN status = \'accepted\' THEN 1 ELSE 0 END) as accepted_bids'),
                DB::raw('AVG(proposed_price) as avg_bid_amount'),
                DB::raw('SUM(CASE WHEN status = \'accepted\' THEN proposed_price ELSE 0 END) as total_won_value')
            )
            ->groupBy('seller_id')
            ->orderByDesc('accepted_bids')
            ->take(10)
            ->with('seller')
            ->get()
            ->filter(fn ($item) => $item->seller !== null)
            ->map(fn ($item) => [
                'id' => $item->seller->id,
                'name' => $item->seller->name,
                'avatar_url' => $item->seller->avatar_url,
                'total_bids' => $item->total_bids,
                'accepted_bids' => (int) $item->accepted_bids,
                'win_rate' => $item->total_bids > 0
                    ? round(($item->accepted_bids / $item->total_bids) * 100, 1)
                    : 0,
                'avg_bid_amount' => round($item->avg_bid_amount, 2),
                'total_won_value' => round($item->total_won_value, 2),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Get custom orders by category
     */
    private function getCustomOrdersByCategory(Carbon $startDate, Carbon $endDate): array
    {
        return CustomOrderRequest::where('is_public', true)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('category')
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->take(10)
            ->get()
            ->map(function ($item) {
                $categoryLabels = CustomOrderRequest::$categories ?? [];

                return [
                    'category' => $categoryLabels[$item->category] ?? ucfirst($item->category),
                    'category_key' => $item->category,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get bid activity by hour of day
     */
    private function getBidActivityByHour(Carbon $startDate, Carbon $endDate): array
    {
        $hourlyData = CustomOrderBid::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();

        $result = [];
        for ($i = 0; $i < 24; $i++) {
            $result[] = [
                'hour' => sprintf('%02d:00', $i),
                'count' => $hourlyData[$i] ?? 0,
            ];
        }

        return $result;
    }

    /**
     * Get orders by status
     */
    private function getOrdersByStatus(Carbon $startDate, Carbon $endDate): array
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($item) => [
                'status' => ucfirst($item->status),
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get revenue by category
     */
    private function getRevenueByCategory(Carbon $startDate, Carbon $endDate): array
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where('orders.status', Order::STATUS_COMPLETED)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereNotNull('order_items.product_id')
            ->select(
                'product_categories.name as category',
                DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
            )
            ->groupBy('product_categories.id', 'product_categories.name')
            ->orderByDesc('revenue')
            ->take(10)
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category,
                'revenue' => round($item->revenue, 2),
            ])
            ->toArray();
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowth(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    // Export methods for CSV

    private function exportOverview($file, Carbon $startDate, Carbon $endDate): void
    {
        $overview = $this->getOverviewStats($startDate, $endDate);

        fputcsv($file, ['=== OVERVIEW STATISTICS ===']);
        fputcsv($file, ['Metric', 'Value', 'Growth %']);
        fputcsv($file, ['Total Revenue', '₱'.number_format($overview['total_revenue'], 2), $overview['revenue_growth'].'%']);
        fputcsv($file, ['Total Commission', '₱'.number_format($overview['total_commission'], 2), '']);
        fputcsv($file, ['Total Orders', $overview['total_orders'], $overview['orders_growth'].'%']);
        fputcsv($file, ['Completed Orders', $overview['completed_orders'], '']);
        fputcsv($file, ['Average Order Value', '₱'.number_format($overview['avg_order_value'], 2), '']);
        fputcsv($file, ['New Users', $overview['new_users'], $overview['users_growth'].'%']);
        fputcsv($file, ['New Sellers', $overview['new_sellers'], '']);
        fputcsv($file, ['New Buyers', $overview['new_buyers'], '']);
        fputcsv($file, ['New Products', $overview['new_products'], '']);
        fputcsv($file, []);
    }

    private function exportRevenue($file, Carbon $startDate, Carbon $endDate, string $dateRange): void
    {
        $revenueData = $this->getRevenueChartData($startDate, $endDate, $dateRange);

        fputcsv($file, ['=== DAILY REVENUE ===']);
        fputcsv($file, ['Date', 'Revenue', 'Commission']);
        foreach ($revenueData as $row) {
            fputcsv($file, [$row['date'], '₱'.number_format($row['revenue'], 2), '₱'.number_format($row['commission'], 2)]);
        }
        fputcsv($file, []);
    }

    private function exportOrders($file, Carbon $startDate, Carbon $endDate): void
    {
        $ordersByStatus = $this->getOrdersByStatus($startDate, $endDate);

        fputcsv($file, ['=== ORDERS BY STATUS ===']);
        fputcsv($file, ['Status', 'Count']);
        foreach ($ordersByStatus as $row) {
            fputcsv($file, [$row['status'], $row['count']]);
        }
        fputcsv($file, []);

        // Export order trends
        $orderTrends = $this->getOrderTrendsChartData($startDate, $endDate);
        fputcsv($file, ['=== DAILY ORDER TRENDS ===']);
        fputcsv($file, ['Date', 'Total Orders', 'Completed', 'Cancelled']);
        foreach ($orderTrends as $row) {
            fputcsv($file, [$row['date'], $row['total'], $row['completed'], $row['cancelled']]);
        }
        fputcsv($file, []);
    }

    private function exportTopSellers($file, Carbon $startDate, Carbon $endDate): void
    {
        $topSellers = $this->getTopSellers($startDate, $endDate);

        fputcsv($file, ['=== TOP PERFORMING SELLERS ===']);
        fputcsv($file, ['Rank', 'Seller Name', 'Email', 'Orders', 'Total Revenue', 'Avg Order Value']);
        foreach ($topSellers as $index => $seller) {
            fputcsv($file, [
                $index + 1,
                $seller['name'],
                $seller['email'],
                $seller['order_count'],
                '₱'.number_format($seller['total_revenue'], 2),
                '₱'.number_format($seller['avg_order_value'], 2),
            ]);
        }
        fputcsv($file, []);
    }

    private function exportTopProducts($file, Carbon $startDate, Carbon $endDate): void
    {
        $topProducts = $this->getTopProducts($startDate, $endDate);

        fputcsv($file, ['=== TOP SELLING PRODUCTS ===']);
        fputcsv($file, ['Rank', 'Product Name', 'Unit Price', 'Quantity Sold', 'Total Revenue']);
        foreach ($topProducts as $index => $product) {
            fputcsv($file, [
                $index + 1,
                $product['name'],
                '₱'.number_format($product['price'], 2),
                $product['quantity_sold'],
                '₱'.number_format($product['revenue'], 2),
            ]);
        }
        fputcsv($file, []);
    }

    private function exportUserGrowth($file): void
    {
        $userGrowth = $this->getUserGrowthChartData();

        fputcsv($file, ['=== USER GROWTH (LAST 12 MONTHS) ===']);
        fputcsv($file, ['Month', 'Buyers', 'Sellers', 'Total']);
        foreach ($userGrowth as $row) {
            fputcsv($file, [$row['month'], $row['buyers'], $row['sellers'], $row['total']]);
        }
        fputcsv($file, []);
    }

    private function exportCustomOrders($file, Carbon $startDate, Carbon $endDate): void
    {
        $customStats = $this->getCustomOrderStats($startDate, $endDate);

        fputcsv($file, ['=== CUSTOM ORDER STATISTICS ===']);
        fputcsv($file, ['Metric', 'Value']);
        fputcsv($file, ['Total Requests', $customStats['total']]);
        fputcsv($file, ['Pending', $customStats['pending']]);
        fputcsv($file, ['In Progress', $customStats['in_progress']]);
        fputcsv($file, ['Completed', $customStats['completed']]);
        fputcsv($file, ['Cancelled/Declined', $customStats['cancelled']]);
        fputcsv($file, ['Total Value', '₱'.number_format($customStats['total_value'], 2)]);
        fputcsv($file, ['Conversion Rate', $customStats['conversion_rate'].'%']);
        fputcsv($file, []);
    }

    private function exportMarketplace($file, Carbon $startDate, Carbon $endDate): void
    {
        $marketplaceStats = $this->getMarketplaceStats($startDate, $endDate);

        fputcsv($file, ['=== MARKETPLACE BIDDING ANALYTICS ===']);
        fputcsv($file, ['Metric', 'Value', 'Growth %']);
        fputcsv($file, ['Public Requests', $marketplaceStats['public_requests'], $marketplaceStats['public_requests_growth'].'%']);
        fputcsv($file, ['Open Requests', $marketplaceStats['open_requests'], '']);
        fputcsv($file, ['Total Bids', $marketplaceStats['total_bids'], $marketplaceStats['bids_growth'].'%']);
        fputcsv($file, ['Accepted Bids', $marketplaceStats['accepted_bids'], '']);
        fputcsv($file, ['Rejected Bids', $marketplaceStats['rejected_bids'], '']);
        fputcsv($file, ['Pending Bids', $marketplaceStats['pending_bids'], '']);
        fputcsv($file, ['Avg Bids Per Request', $marketplaceStats['avg_bids_per_request'], '']);
        fputcsv($file, ['Bid Acceptance Rate', $marketplaceStats['bid_acceptance_rate'].'%', '']);
        fputcsv($file, ['Accepted Bid Value', '₱'.number_format($marketplaceStats['accepted_bid_value'], 2), '']);
        fputcsv($file, ['Avg Response Time (hours)', $marketplaceStats['avg_response_time'], '']);
        fputcsv($file, ['Active Bidders', $marketplaceStats['active_bidders'], '']);
        fputcsv($file, []);

        // Top bidding sellers
        $topBidders = $this->getTopBiddingSellers($startDate, $endDate);
        fputcsv($file, ['=== TOP BIDDING ARTISANS ===']);
        fputcsv($file, ['Rank', 'Artisan Name', 'Total Bids', 'Won Bids', 'Win Rate %', 'Avg Bid', 'Total Won Value']);
        foreach ($topBidders as $index => $bidder) {
            fputcsv($file, [
                $index + 1,
                $bidder['name'],
                $bidder['total_bids'],
                $bidder['accepted_bids'],
                $bidder['win_rate'].'%',
                '₱'.number_format($bidder['avg_bid_amount'], 2),
                '₱'.number_format($bidder['total_won_value'], 2),
            ]);
        }
        fputcsv($file, []);

        // Custom orders by category
        $categoryStats = $this->getCustomOrdersByCategory($startDate, $endDate);
        fputcsv($file, ['=== CUSTOM ORDERS BY CATEGORY ===']);
        fputcsv($file, ['Category', 'Request Count']);
        foreach ($categoryStats as $cat) {
            fputcsv($file, [$cat['category'], $cat['count']]);
        }
        fputcsv($file, []);
    }
}
