<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SellerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

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

        // System health indicators
        $systemStats = [
            'database_size' => $this->getDatabaseSize(),
            'total_tables' => $this->getTotalTables(),
            'cache_hits' => $this->getCacheHits(),
            'server_uptime' => $this->getServerUptime(),
        ];

        // Recent activity
        $recentActivity = $this->getRecentActivity();

        // Growth metrics
        $growthMetrics = [
            'users_this_month' => User::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'users_last_month' => User::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
                                      ->where('created_at', '<', Carbon::now()->startOfMonth())->count(),
            'applications_this_week' => SellerApplication::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'applications_last_week' => SellerApplication::where('created_at', '>=', Carbon::now()->subWeek()->startOfWeek())
                                                          ->where('created_at', '<', Carbon::now()->startOfWeek())->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'userStats' => $userStats,
            'sellerApplicationStats' => $sellerApplicationStats,
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
                    'size_formatted' => $sizeMB . ' MB'
                ];
            }
        } catch (\Exception $e) {
            // Fallback for other database types
        }

        return [
            'size_mb' => 0,
            'size_formatted' => 'Unknown'
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
                'color' => 'blue'
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
                    'color' => 'orange'
                ];
            }
        }

        // Sort by time (most recent first)
        usort($activities, function ($a, $b) {
            return $b['time']->timestamp - $a['time']->timestamp;
        });

        return array_slice($activities, 0, 5); // Return top 5 activities
    }
}