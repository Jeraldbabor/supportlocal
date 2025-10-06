<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the seller dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $sellerApplication = $user->sellerApplication;

        // Get profile summary
        $profileController = new ProfileController;
        $profileSummary = $profileController->summary();

        // Get settings summary
        $settingsController = new SettingsController;
        $settingsSummary = $settingsController->summary();

        // Get comprehensive statistics
        $this->getComprehensiveStats($user, $productStats, $orderStats, $revenueStats, $customerStats);

        // Calculate dashboard statistics
        $dashboardStats = [
            'profile_completeness' => $user->profile_completeness,
            'account_health_score' => $this->calculateAccountHealthScore($user),
            'days_as_seller' => $sellerApplication && $sellerApplication->reviewed_at
                ? $sellerApplication->reviewed_at->diffInDays(now())
                : 0,
        ];

        // Get recommendations for seller
        $recommendations = $this->getSellerRecommendations($user, $profileSummary, $settingsSummary, $productStats);

        // Get recent activity
        $recentActivity = $this->getRecentActivity($user);

        // Get recent products
        $recentProducts = Product::where('seller_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('seller/dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
            ],
            'profileSummary' => $profileSummary,
            'settingsSummary' => $settingsSummary,
            'dashboardStats' => $dashboardStats,
            'productStats' => $productStats,
            'orderStats' => $orderStats,
            'revenueStats' => $revenueStats,
            'customerStats' => $customerStats,
            'recommendations' => $recommendations,
            'recentActivity' => $recentActivity,
            'recentProducts' => $recentProducts,
            'businessInfo' => $sellerApplication ? [
                'type' => $sellerApplication->business_type,
                'description' => $sellerApplication->business_description,
                'approved_at' => $sellerApplication->reviewed_at,
            ] : null,
        ]);
    }

    /**
     * Calculate account health score based on profile completeness and settings.
     */
    private function calculateAccountHealthScore($user): int
    {
        $score = 0;

        // Profile completeness (30%)
        $score += ($user->profile_completeness * 0.3);

        // Email verification (15%)
        if ($user->email_verified_at) {
            $score += 15;
        }

        // Profile picture (10%)
        if ($user->profile_picture) {
            $score += 10;
        }

        // Business setup (15%)
        if ($user->sellerApplication && $user->sellerApplication->isApproved()) {
            $score += 15;
        }

        // Product activity (20%)
        $productCount = Product::where('seller_id', $user->id)->count();
        $productScore = min($productCount * 5, 20); // Max 20 points for 4+ products
        $score += $productScore;

        // Account activity (10%)
        if ($user->last_login_at && $user->last_login_at->greaterThan(now()->subDays(7))) {
            $score += 10;
        }

        return min(100, round($score));
    }

    /**
     * Get personalized recommendations for the seller.
     */
    private function getSellerRecommendations($user, $profileSummary, $settingsSummary, $productStats): array
    {
        $recommendations = [];

        // Business setup has highest priority for sellers without approved applications
        if (! $settingsSummary['business_setup']) {
            $recommendations[] = [
                'type' => 'business',
                'title' => 'Set Up Business Information',
                'description' => 'Complete your business details to start selling',
                'action' => 'Setup Business',
                'url' => route('seller.profile.business'),
                'priority' => 'critical',
                'icon' => 'settings',
            ];
        }

        // Product recommendations (high priority)
        if ($productStats['total'] === 0) {
            $recommendations[] = [
                'type' => 'product',
                'title' => 'Add Your First Product',
                'description' => 'Start selling by adding your first artisan product',
                'action' => 'Add Product',
                'url' => route('seller.products.create'),
                'priority' => 'high',
                'icon' => 'package',
            ];
        } elseif ($productStats['total'] < 3) {
            $recommendations[] = [
                'type' => 'product',
                'title' => 'Add More Products',
                'description' => 'Increase your visibility by adding more products',
                'action' => 'Add Product',
                'url' => route('seller.products.create'),
                'priority' => 'medium',
                'icon' => 'package',
            ];
        }

        // Inventory alerts
        if ($productStats['out_of_stock'] > 0) {
            $recommendations[] = [
                'type' => 'inventory',
                'title' => 'Restock Out-of-Stock Items',
                'description' => "You have {$productStats['out_of_stock']} product(s) out of stock",
                'action' => 'View Products',
                'url' => route('seller.products.index', ['filter' => 'out_of_stock']),
                'priority' => 'high',
                'icon' => 'alert-triangle',
            ];
        }

        if ($productStats['low_stock'] > 0) {
            $recommendations[] = [
                'type' => 'inventory',
                'title' => 'Restock Low Inventory',
                'description' => "You have {$productStats['low_stock']} product(s) running low on stock",
                'action' => 'View Products',
                'url' => route('seller.products.index', ['filter' => 'low_stock']),
                'priority' => 'medium',
                'icon' => 'alert-circle',
            ];
        }

        // Draft products
        if ($productStats['draft'] > 0) {
            $recommendations[] = [
                'type' => 'product',
                'title' => 'Publish Draft Products',
                'description' => "You have {$productStats['draft']} draft product(s) ready to publish",
                'action' => 'View Drafts',
                'url' => route('seller.products.index', ['filter' => 'draft']),
                'priority' => 'medium',
                'icon' => 'edit',
            ];
        }

        // Profile recommendations
        if ($profileSummary['profile_completeness'] < 100) {
            $recommendations[] = [
                'type' => 'profile',
                'title' => 'Complete Your Profile',
                'description' => 'Complete your profile to build trust with customers',
                'action' => 'Complete Profile',
                'url' => route('seller.profile.edit'),
                'priority' => 'high',
                'icon' => 'user',
            ];
        }

        if (! $profileSummary['has_avatar']) {
            $recommendations[] = [
                'type' => 'profile',
                'title' => 'Add Profile Picture',
                'description' => 'Add a profile picture to personalize your seller account',
                'action' => 'Upload Picture',
                'url' => route('seller.profile.edit'),
                'priority' => 'medium',
                'icon' => 'user',
            ];
        }

        // Settings recommendations
        if (! $settingsSummary['email_verified']) {
            $recommendations[] = [
                'type' => 'security',
                'title' => 'Verify Your Email',
                'description' => 'Verify your email address for account security',
                'action' => 'Verify Email',
                'url' => route('seller.settings.security'),
                'priority' => 'high',
                'icon' => 'alert-triangle',
            ];
        }

        // Note: Business setup recommendation moved to top of function for higher priority

        // Sort by priority
        usort($recommendations, function ($a, $b) {
            $priorities = ['critical' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];

            return $priorities[$b['priority']] - $priorities[$a['priority']];
        });

        return array_slice($recommendations, 0, 6); // Return top 6 recommendations
    }

    /**
     * Get recent activity for the seller.
     */
    private function getRecentActivity($user): array
    {
        $activities = [];

        // Recent product activities
        $recentProducts = Product::where('seller_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();

        foreach ($recentProducts as $product) {
            if ($product->created_at->eq($product->updated_at)) {
                $activities[] = [
                    'type' => 'product_created',
                    'title' => 'Product Added',
                    'description' => "Added new product: {$product->name}",
                    'date' => $product->created_at->format('M d, Y g:i A'),
                    'icon' => 'package',
                ];
            } else {
                $activities[] = [
                    'type' => 'product_updated',
                    'title' => 'Product Updated',
                    'description' => "Updated product: {$product->name}",
                    'date' => $product->updated_at->format('M d, Y g:i A'),
                    'icon' => 'edit',
                ];
            }
        }

        // Profile updates
        if ($user->updated_at->greaterThan($user->created_at)) {
            $activities[] = [
                'type' => 'profile_update',
                'title' => 'Profile Updated',
                'description' => 'Your profile information was updated',
                'date' => $user->updated_at->format('M d, Y g:i A'),
                'icon' => 'user',
            ];
        }

        // Email verification
        if ($user->email_verified_at) {
            $activities[] = [
                'type' => 'email_verified',
                'title' => 'Email Verified',
                'description' => 'Your email address was verified',
                'date' => $user->email_verified_at->format('M d, Y g:i A'),
                'icon' => 'check-circle',
            ];
        }

        // Seller application
        if ($user->sellerApplication) {
            $app = $user->sellerApplication;
            $activities[] = [
                'type' => 'seller_application',
                'title' => 'Seller Application '.ucfirst($app->status),
                'description' => 'Your seller application was '.$app->status,
                'date' => $app->reviewed_at ? $app->reviewed_at->format('M d, Y g:i A') : $app->created_at->format('M d, Y g:i A'),
                'icon' => $app->isApproved() ? 'check-circle' : ($app->isRejected() ? 'alert-triangle' : 'calendar'),
            ];
        }

        // Last login activity
        if ($user->last_login_at) {
            $activities[] = [
                'type' => 'login',
                'title' => 'Account Access',
                'description' => 'Last login to your account',
                'date' => $user->last_login_at->format('M d, Y g:i A'),
                'icon' => 'user',
            ];
        }

        // Sort by date (newest first)
        usort($activities, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($activities, 0, 6); // Return last 6 activities
    }

    /**
     * Get comprehensive statistics for the seller dashboard.
     */
    private function getComprehensiveStats($user, &$productStats, &$orderStats, &$revenueStats, &$customerStats): void
    {
        $userId = $user->id;
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();
        $lastWeek = $now->copy()->subWeek();

        // Enhanced Product Statistics
        $productStats = [
            'total' => Product::where('seller_id', $userId)->count(),
            'active' => Product::where('seller_id', $userId)->where('status', Product::STATUS_ACTIVE)->count(),
            'draft' => Product::where('seller_id', $userId)->where('status', Product::STATUS_DRAFT)->count(),
            'low_stock' => Product::where('seller_id', $userId)->where('stock_status', Product::STOCK_LOW_STOCK)->count(),
            'out_of_stock' => Product::where('seller_id', $userId)->where('stock_status', Product::STOCK_OUT_OF_STOCK)->count(),
            'total_views' => Product::where('seller_id', $userId)->sum('view_count') ?? 0,
            'total_orders' => Product::where('seller_id', $userId)->sum('order_count') ?? 0,
            'average_rating' => Product::where('seller_id', $userId)->avg('average_rating') ?? 0,
            'created_this_month' => Product::where('seller_id', $userId)->where('created_at', '>=', $lastMonth)->count(),
            'created_this_week' => Product::where('seller_id', $userId)->where('created_at', '>=', $lastWeek)->count(),
        ];

        // Order Statistics
        $orderQuery = Order::where('seller_id', $userId);
        $orderStats = [
            'total' => $orderQuery->count(),
            'pending' => Order::where('seller_id', $userId)->where('status', Order::STATUS_PENDING)->count(),
            'confirmed' => Order::where('seller_id', $userId)->where('status', Order::STATUS_CONFIRMED)->count(),
            'completed' => Order::where('seller_id', $userId)->where('status', Order::STATUS_COMPLETED)->count(),
            'cancelled' => Order::where('seller_id', $userId)->where('status', Order::STATUS_CANCELLED)->count(),
            'this_month' => Order::where('seller_id', $userId)->where('created_at', '>=', $lastMonth)->count(),
            'this_week' => Order::where('seller_id', $userId)->where('created_at', '>=', $lastWeek)->count(),
            'today' => Order::where('seller_id', $userId)->whereDate('created_at', $now->toDateString())->count(),
            'average_items_per_order' => $this->calculateAverageItemsPerOrder($userId),
        ];

        // Revenue Statistics
        $completedOrdersQuery = Order::where('seller_id', $userId)->where('status', Order::STATUS_COMPLETED);
        $revenueStats = [
            'total' => $completedOrdersQuery->sum('total_amount') ?? 0,
            'this_month' => Order::where('seller_id', $userId)
                ->where('status', Order::STATUS_COMPLETED)
                ->where('created_at', '>=', $lastMonth)
                ->sum('total_amount') ?? 0,
            'this_week' => Order::where('seller_id', $userId)
                ->where('status', Order::STATUS_COMPLETED)
                ->where('created_at', '>=', $lastWeek)
                ->sum('total_amount') ?? 0,
            'today' => Order::where('seller_id', $userId)
                ->where('status', Order::STATUS_COMPLETED)
                ->whereDate('created_at', $now->toDateString())
                ->sum('total_amount') ?? 0,
            'pending_amount' => Order::where('seller_id', $userId)
                ->whereIn('status', [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])
                ->sum('total_amount') ?? 0,
            'average_order_value' => Order::where('seller_id', $userId)
                ->where('status', Order::STATUS_COMPLETED)
                ->avg('total_amount') ?? 0,
        ];

        // Calculate previous month for growth comparison
        $previousMonth = $lastMonth->copy()->subMonth();
        $revenueStats['last_month'] = Order::where('seller_id', $userId)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$previousMonth, $lastMonth])
            ->sum('total_amount') ?? 0;
        
        // Calculate growth percentage
        if ($revenueStats['last_month'] > 0) {
            $revenueStats['month_growth_percentage'] = round(
                (($revenueStats['this_month'] - $revenueStats['last_month']) / $revenueStats['last_month']) * 100, 
                2
            );
        } else {
            $revenueStats['month_growth_percentage'] = $revenueStats['this_month'] > 0 ? 100 : 0;
        }

        // Customer Statistics
        $uniqueCustomers = Order::where('seller_id', $userId)
            ->distinct('user_id')
            ->count('user_id');
        
        $returningCustomers = Order::where('seller_id', $userId)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $customerStats = [
            'total_unique' => $uniqueCustomers,
            'returning' => $returningCustomers,
            'new_this_month' => Order::where('seller_id', $userId)
                ->where('created_at', '>=', $lastMonth)
                ->distinct('user_id')
                ->count('user_id'),
            'retention_rate' => $uniqueCustomers > 0 ? round(($returningCustomers / $uniqueCustomers) * 100, 2) : 0,
        ];

        // Add trending products
        $productStats['trending'] = Product::where('seller_id', $userId)
            ->where('view_count', '>', 0)
            ->orderByDesc('view_count')
            ->take(5)
            ->pluck('name', 'id')
            ->toArray();

        // Add best sellers
        $productStats['best_sellers'] = Product::where('seller_id', $userId)
            ->where('order_count', '>', 0)
            ->orderByDesc('order_count')
            ->take(5)
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Calculate average items per order for the seller.
     */
    private function calculateAverageItemsPerOrder($sellerId): float
    {
        $totalOrders = Order::where('seller_id', $sellerId)->count();
        
        if ($totalOrders === 0) {
            return 0;
        }

        $totalItems = OrderItem::whereHas('order', function ($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        })->sum('quantity');

        return round($totalItems / $totalOrders, 2);
    }
}
