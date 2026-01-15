<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SellerApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        // User statistics
        $userStats = [
            'total' => User::count(),
            'active' => User::active()->count(),
            'inactive' => User::inactive()->count(),
            'administrators' => User::byRole(User::ROLE_ADMINISTRATOR)->count(),
            'sellers' => User::byRole(User::ROLE_SELLER)->count(),
            'buyers' => User::byRole(User::ROLE_BUYER)->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'unverified' => User::whereNull('email_verified_at')->count(),
        ];

        // Recent users (last 30 days)
        $recentUsersCount = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Recent active users (last 7 days)
        $recentActiveUsersCount = User::where('last_login_at', '>=', Carbon::now()->subDays(7))->count();

        // Seller application statistics
        $sellerApplicationStats = [
            'total' => SellerApplication::count(),
            'pending' => SellerApplication::where('status', 'pending')->count(),
            'approved' => SellerApplication::where('status', 'approved')->count(),
            'rejected' => SellerApplication::where('status', 'rejected')->count(),
            'recent' => SellerApplication::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
        ];

        // Contact message statistics
        $contactMessageStats = [
            'total' => ContactMessage::count(),
            'new' => ContactMessage::where('status', ContactMessage::STATUS_NEW)->count(),
            'read' => ContactMessage::where('status', ContactMessage::STATUS_READ)->count(),
            'replied' => ContactMessage::where('status', ContactMessage::STATUS_REPLIED)->count(),
            'recent' => ContactMessage::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
        ];

        // System health indicators
        $systemStats = [
            'database_size' => $this->getDatabaseSize(),
            'total_tables' => $this->getTotalTables(),
            'cache_hits' => $this->getCacheHits(),
            'server_uptime' => $this->getServerUptime(),
        ];

        // Recent activity
        $recentActivity = $this->getRecentActivity();

        // Product statistics
        $productStats = [
            'total' => Product::count(),
            'active' => Product::where('status', Product::STATUS_ACTIVE)->count(),
            'inactive' => Product::where('status', Product::STATUS_INACTIVE)->count(),
            'draft' => Product::where('status', Product::STATUS_DRAFT)->count(),
            'archived' => Product::where('status', Product::STATUS_ARCHIVED)->count(),
            'out_of_stock' => Product::where('stock_status', Product::STOCK_OUT_OF_STOCK)->count(),
            'low_stock' => Product::where('stock_status', Product::STOCK_LOW_STOCK)->count(),
            'featured' => Product::where('is_featured', true)->count(),
            'recent' => Product::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
        ];

        // Order statistics
        $orderStats = [
            'total' => Order::count(),
            'pending' => Order::where('status', Order::STATUS_PENDING)->count(),
            'confirmed' => Order::where('status', Order::STATUS_CONFIRMED)->count(),
            'shipped' => Order::where('status', Order::STATUS_SHIPPED)->count(),
            'delivered' => Order::where('status', Order::STATUS_DELIVERED)->count(),
            'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'cancelled' => Order::where('status', Order::STATUS_CANCELLED)->count(),
            'today' => Order::whereDate('created_at', today())->count(),
            'this_week' => Order::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'this_month' => Order::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'total_revenue' => Order::where('status', '!=', Order::STATUS_CANCELLED)->sum('total_amount'),
            'today_revenue' => Order::whereDate('created_at', today())
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->sum('total_amount'),
            'this_month_revenue' => Order::where('created_at', '>=', Carbon::now()->startOfMonth())
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->sum('total_amount'),
        ];

        // Category statistics
        $categoryStats = [
            'total' => ProductCategory::count(),
            'active' => ProductCategory::where('is_active', true)->count(),
            'inactive' => ProductCategory::where('is_active', false)->count(),
            'root' => ProductCategory::root()->count(),
            'with_products' => ProductCategory::has('products')->count(),
        ];

        // Growth metrics
        $growthMetrics = [
            'users_this_month' => User::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'users_last_month' => User::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
                ->where('created_at', '<', Carbon::now()->startOfMonth())->count(),
            'applications_this_week' => SellerApplication::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'applications_last_week' => SellerApplication::where('created_at', '>=', Carbon::now()->subWeek()->startOfWeek())
                ->where('created_at', '<', Carbon::now()->startOfWeek())->count(),
            'orders_this_month' => Order::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'orders_last_month' => Order::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
                ->where('created_at', '<', Carbon::now()->startOfMonth())->count(),
            'products_this_month' => Product::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'products_last_month' => Product::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
                ->where('created_at', '<', Carbon::now()->startOfMonth())->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'userStats' => $userStats,
            'productStats' => $productStats,
            'orderStats' => $orderStats,
            'categoryStats' => $categoryStats,
            'sellerApplicationStats' => $sellerApplicationStats,
            'contactMessageStats' => $contactMessageStats,
            'systemStats' => $systemStats,
            'recentActivity' => $recentActivity,
            'growthMetrics' => $growthMetrics,
            'recentUsersCount' => $recentUsersCount,
            'recentActiveUsersCount' => $recentActiveUsersCount,
        ]);
    }

    /**
     * Get database size information
     */
    private function getDatabaseSize(): array
    {
        try {
            $databaseName = config('database.connections.sqlite.database');
            if (file_exists($databaseName)) {
                $sizeBytes = filesize($databaseName);
                $sizeMB = round($sizeBytes / (1024 * 1024), 2);

                return [
                    'size_mb' => $sizeMB,
                    'size_formatted' => $sizeMB.' MB',
                ];
            }
        } catch (\Exception $e) {
            // Fallback for other database types
        }

        return [
            'size_mb' => 0,
            'size_formatted' => 'Unknown',
        ];
    }

    /**
     * Get total number of tables
     */
    private function getTotalTables(): int
    {
        try {
            $tables = \DB::select("SELECT name FROM sqlite_master WHERE type='table'");

            return count($tables);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get cache hits (placeholder for actual cache metrics)
     */
    private function getCacheHits(): int
    {
        // This would be implemented based on your cache driver
        // For now, return a mock value
        return rand(1000, 5000);
    }

    /**
     * Get server uptime (placeholder)
     */
    private function getServerUptime(): string
    {
        // This would be implemented based on your server setup
        // For now, return a mock value
        return '24 hours';
    }

    /**
     * Get recent activity feed
     */
    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent user registrations
        $recentUsers = User::latest()->limit(3)->get(['name', 'email', 'role', 'created_at']);
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'title' => 'New user registered',
                'description' => "{$user->name} ({$user->role}) joined the platform",
                'time' => $user->created_at,
                'icon' => 'user-plus',
                'color' => 'blue',
            ];
        }

        // Recent seller applications
        $recentApplications = SellerApplication::with('user')->latest()->limit(2)->get();
        foreach ($recentApplications as $application) {
            if ($application->user) {
                $activities[] = [
                    'type' => 'seller_application',
                    'title' => 'New seller application',
                    'description' => "{$application->user->name} submitted a seller application", // @phpstan-ignore-line
                    'time' => $application->created_at,
                    'icon' => 'file-text',
                    'color' => 'orange',
                ];
            }
        }

        // Recent orders
        $recentOrders = Order::with('buyer')->latest()->limit(2)->get();
        foreach ($recentOrders as $order) {
            if ($order->buyer) {
                $activities[] = [
                    'type' => 'new_order',
                    'title' => 'New order received',
                    'description' => "Order #{$order->order_number} from {$order->buyer->name}",
                    'time' => $order->created_at,
                    'icon' => 'shopping-cart',
                    'color' => 'green',
                ];
            }
        }

        // Recent products
        $recentProducts = Product::with('seller')->latest()->limit(2)->get();
        foreach ($recentProducts as $product) {
            $sellerName = $product->seller ? $product->seller->name : 'Unknown';
            $activities[] = [
                'type' => 'new_product',
                'title' => 'New product added',
                'description' => "{$product->name} by {$sellerName}",
                'time' => $product->created_at,
                'icon' => 'package',
                'color' => 'purple',
            ];
        }

        // Sort by time (most recent first)
        usort($activities, function ($a, $b) {
            return $b['time']->timestamp - $a['time']->timestamp;
        });

        return array_slice($activities, 0, 5); // Return top 5 activities
    }
}
