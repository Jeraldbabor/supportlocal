<?php

namespace App\Http\Controllers\Api\Mobile\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SellerApplication;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get seller dashboard data
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Check if user is a seller
        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        // Get date range
        $days = $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now()->endOfDay();
        
        // Previous period for comparison
        $prevStartDate = Carbon::now()->subDays($days * 2)->startOfDay();
        $prevEndDate = Carbon::now()->subDays($days)->endOfDay();

        // Product stats
        $productStats = $this->getProductStats($user->id);
        
        // Order stats
        $orderStats = $this->getOrderStats($user->id, $startDate, $endDate, $prevStartDate, $prevEndDate);
        
        // Revenue stats
        $revenueStats = $this->getRevenueStats($user->id, $startDate, $endDate, $prevStartDate, $prevEndDate);
        
        // Customer stats
        $customerStats = $this->getCustomerStats($user->id, $startDate, $endDate, $prevStartDate, $prevEndDate);

        // Recent orders
        $recentOrders = $this->getRecentOrders($user->id, 5);

        // Recent products
        $recentProducts = Product::where('seller_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'price', 'quantity', 'status', 'images', 'created_at']);

        // Account health
        $accountHealth = $this->getAccountHealth($user);

        // Pending actions
        $pendingActions = $this->getPendingActions($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'product_stats' => $productStats,
                'order_stats' => $orderStats,
                'revenue_stats' => $revenueStats,
                'customer_stats' => $customerStats,
                'recent_orders' => $recentOrders,
                'recent_products' => $recentProducts,
                'account_health' => $accountHealth,
                'pending_actions' => $pendingActions,
                'period' => [
                    'days' => $days,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                ],
            ],
        ]);
    }

    /**
     * Get quick stats for dashboard header
     */
    public function quickStats(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Today's stats
        $todayOrders = Order::whereHas('items', function ($q) use ($user) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $user->id));
        })->whereDate('created_at', $today)->count();

        $todayRevenue = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $user->id))
            ->whereHas('order', fn($q) => $q->whereDate('created_at', $today)->where('status', 'completed'))
            ->sum(DB::raw('price * quantity'));

        // This month's stats
        $monthRevenue = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $user->id))
            ->whereHas('order', fn($q) => $q->where('created_at', '>=', $thisMonth)->where('status', 'completed'))
            ->sum(DB::raw('price * quantity'));

        // Pending orders count
        $pendingOrders = Order::whereHas('items', function ($q) use ($user) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $user->id));
        })->whereIn('status', ['pending', 'confirmed'])->count();

        // Low stock products
        $lowStockCount = Product::where('seller_id', $user->id)
            ->where('status', 'active')
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
                'month_revenue' => $monthRevenue,
                'pending_orders' => $pendingOrders,
                'low_stock_count' => $lowStockCount,
            ],
        ]);
    }

    private function getProductStats(int $sellerId): array
    {
        $total = Product::where('seller_id', $sellerId)->count();
        $active = Product::where('seller_id', $sellerId)->where('status', 'active')->count();
        $draft = Product::where('seller_id', $sellerId)->where('status', 'draft')->count();
        $outOfStock = Product::where('seller_id', $sellerId)->where('quantity', 0)->count();
        $lowStock = Product::where('seller_id', $sellerId)
            ->where('status', 'active')
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->where('quantity', '>', 0)
            ->count();

        return [
            'total' => $total,
            'active' => $active,
            'draft' => $draft,
            'out_of_stock' => $outOfStock,
            'low_stock' => $lowStock,
        ];
    }

    private function getOrderStats(int $sellerId, $startDate, $endDate, $prevStartDate, $prevEndDate): array
    {
        $getOrderCount = function ($start, $end, $status = null) use ($sellerId) {
            $query = Order::whereHas('items', function ($q) use ($sellerId) {
                $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
            })->whereBetween('created_at', [$start, $end]);

            if ($status) {
                $query->where('status', $status);
            }

            return $query->count();
        };

        $currentTotal = $getOrderCount($startDate, $endDate);
        $previousTotal = $getOrderCount($prevStartDate, $prevEndDate);
        $growth = $previousTotal > 0 ? round((($currentTotal - $previousTotal) / $previousTotal) * 100, 1) : 0;

        $pending = $getOrderCount($startDate, $endDate, 'pending');
        $confirmed = $getOrderCount($startDate, $endDate, 'confirmed');
        $shipped = $getOrderCount($startDate, $endDate, 'shipped');
        $completed = $getOrderCount($startDate, $endDate, 'completed');
        $cancelled = $getOrderCount($startDate, $endDate, 'cancelled');

        return [
            'total' => $currentTotal,
            'growth' => $growth,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'shipped' => $shipped,
            'completed' => $completed,
            'cancelled' => $cancelled,
        ];
    }

    private function getRevenueStats(int $sellerId, $startDate, $endDate, $prevStartDate, $prevEndDate): array
    {
        $getRevenue = function ($start, $end) use ($sellerId) {
            return OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
                ->whereHas('order', fn($q) => $q->whereBetween('created_at', [$start, $end])->where('status', 'completed'))
                ->sum(DB::raw('price * quantity'));
        };

        $currentRevenue = $getRevenue($startDate, $endDate);
        $previousRevenue = $getRevenue($prevStartDate, $prevEndDate);
        $growth = $previousRevenue > 0 ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1) : 0;

        // Commission (2%)
        $commission = $currentRevenue * 0.02;
        $netRevenue = $currentRevenue - $commission;

        return [
            'gross' => $currentRevenue,
            'commission' => $commission,
            'net' => $netRevenue,
            'growth' => $growth,
        ];
    }

    private function getCustomerStats(int $sellerId, $startDate, $endDate, $prevStartDate, $prevEndDate): array
    {
        $getCustomerCount = function ($start, $end) use ($sellerId) {
            return Order::whereHas('items', function ($q) use ($sellerId) {
                $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
            })->whereBetween('created_at', [$start, $end])
                ->distinct('user_id')
                ->count('user_id');
        };

        $currentCustomers = $getCustomerCount($startDate, $endDate);
        $previousCustomers = $getCustomerCount($prevStartDate, $prevEndDate);
        $growth = $previousCustomers > 0 ? round((($currentCustomers - $previousCustomers) / $previousCustomers) * 100, 1) : 0;

        // Total unique customers ever
        $totalCustomers = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
        })->distinct('user_id')->count('user_id');

        return [
            'period' => $currentCustomers,
            'total' => $totalCustomers,
            'growth' => $growth,
        ];
    }

    private function getRecentOrders(int $sellerId, int $limit): array
    {
        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
        })
            ->with(['user:id,name,email,avatar', 'items' => function ($q) use ($sellerId) {
                $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
                    ->with('product:id,name,images');
            }])
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();

        return $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total' => $order->items->sum(fn($item) => $item->price * $item->quantity),
                'items_count' => $order->items->count(),
                'customer' => [
                    'name' => $order->user->name ?? 'Guest',
                    'avatar' => $order->user->avatar ?? null,
                ],
                'first_item' => $order->items->first() ? [
                    'name' => $order->items->first()->product->name ?? 'Unknown',
                    'image' => $order->items->first()->product->images[0] ?? null,
                ] : null,
                'created_at' => $order->created_at->toIso8601String(),
            ];
        })->toArray();
    }

    private function getAccountHealth($user): array
    {
        $score = 0;
        $maxScore = 100;
        $items = [];

        // Profile completeness (30 points)
        $profileFields = ['name', 'email', 'phone', 'address', 'avatar'];
        $filledFields = collect($profileFields)->filter(fn($field) => !empty($user->$field))->count();
        $profileScore = ($filledFields / count($profileFields)) * 30;
        $score += $profileScore;
        $items[] = [
            'name' => 'Profile Completeness',
            'score' => round($profileScore),
            'max' => 30,
            'status' => $profileScore >= 25 ? 'good' : ($profileScore >= 15 ? 'warning' : 'poor'),
        ];

        // Email verification (20 points)
        $emailScore = $user->email_verified_at ? 20 : 0;
        $score += $emailScore;
        $items[] = [
            'name' => 'Email Verified',
            'score' => $emailScore,
            'max' => 20,
            'status' => $emailScore > 0 ? 'good' : 'poor',
        ];

        // Products (30 points)
        $productCount = Product::where('seller_id', $user->id)->where('status', 'active')->count();
        $productScore = min(30, $productCount * 3);
        $score += $productScore;
        $items[] = [
            'name' => 'Active Products',
            'score' => round($productScore),
            'max' => 30,
            'status' => $productScore >= 20 ? 'good' : ($productScore >= 10 ? 'warning' : 'poor'),
        ];

        // Recent activity (20 points)
        $recentOrder = Order::whereHas('items', function ($q) use ($user) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $user->id));
        })->where('created_at', '>=', Carbon::now()->subDays(30))->exists();
        $activityScore = $recentOrder ? 20 : 0;
        $score += $activityScore;
        $items[] = [
            'name' => 'Recent Activity',
            'score' => $activityScore,
            'max' => 20,
            'status' => $activityScore > 0 ? 'good' : 'warning',
        ];

        return [
            'score' => round($score),
            'max_score' => $maxScore,
            'percentage' => round(($score / $maxScore) * 100),
            'items' => $items,
        ];
    }

    private function getPendingActions(int $sellerId): array
    {
        $actions = [];

        // Pending orders
        $pendingOrders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
        })->where('status', 'pending')->count();

        if ($pendingOrders > 0) {
            $actions[] = [
                'type' => 'pending_orders',
                'count' => $pendingOrders,
                'message' => "{$pendingOrders} order(s) awaiting confirmation",
                'priority' => 'high',
            ];
        }

        // Unverified payments
        $unverifiedPayments = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn($q) => $q->where('seller_id', $sellerId));
        })->where('payment_method', 'gcash')
            ->where('payment_status', 'pending')
            ->whereNotNull('payment_proof')
            ->count();

        if ($unverifiedPayments > 0) {
            $actions[] = [
                'type' => 'unverified_payments',
                'count' => $unverifiedPayments,
                'message' => "{$unverifiedPayments} payment(s) need verification",
                'priority' => 'high',
            ];
        }

        // Low stock products
        $lowStock = Product::where('seller_id', $sellerId)
            ->where('status', 'active')
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->count();

        if ($lowStock > 0) {
            $actions[] = [
                'type' => 'low_stock',
                'count' => $lowStock,
                'message' => "{$lowStock} product(s) running low on stock",
                'priority' => 'medium',
            ];
        }

        // Out of stock products
        $outOfStock = Product::where('seller_id', $sellerId)
            ->where('status', 'active')
            ->where('quantity', 0)
            ->count();

        if ($outOfStock > 0) {
            $actions[] = [
                'type' => 'out_of_stock',
                'count' => $outOfStock,
                'message' => "{$outOfStock} product(s) are out of stock",
                'priority' => 'high',
            ];
        }

        return $actions;
    }
}
