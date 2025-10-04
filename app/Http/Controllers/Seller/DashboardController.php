<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
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
        $profileController = new ProfileController();
        $profileSummary = $profileController->summary();
        
        // Get settings summary
        $settingsController = new SettingsController();
        $settingsSummary = $settingsController->summary();
        
        // Calculate dashboard statistics
        $dashboardStats = [
            'profile_completeness' => $user->profile_completeness,
            'account_health_score' => $this->calculateAccountHealthScore($user),
            'days_as_seller' => $sellerApplication && $sellerApplication->reviewed_at 
                ? $sellerApplication->reviewed_at->diffInDays(now())
                : 0,
        ];
        
        // Get recommendations for seller
        $recommendations = $this->getSellerRecommendations($user, $profileSummary, $settingsSummary);
        
        // Get recent activity
        $recentActivity = $this->getRecentActivity($user);
        
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
            'recommendations' => $recommendations,
            'recentActivity' => $recentActivity,
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
        
        // Profile completeness (40%)
        $score += ($user->profile_completeness * 0.4);
        
        // Email verification (20%)
        if ($user->email_verified_at) {
            $score += 20;
        }
        
        // Profile picture (10%)
        if ($user->profile_picture) {
            $score += 10;
        }
        
        // Business setup (20%)
        if ($user->sellerApplication && $user->sellerApplication->isApproved()) {
            $score += 20;
        }
        
        // Account activity (10%)
        if ($user->last_login_at && $user->last_login_at->greaterThan(now()->subDays(7))) {
            $score += 10;
        }
        
        return min(100, round($score));
    }
    
    /**
     * Get personalized recommendations for the seller.
     */
    private function getSellerRecommendations($user, $profileSummary, $settingsSummary): array
    {
        $recommendations = [];
        
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
        
        if (!$profileSummary['has_avatar']) {
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
        if (!$settingsSummary['email_verified']) {
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
        
        if (!$settingsSummary['business_setup']) {
            $recommendations[] = [
                'type' => 'business',
                'title' => 'Set Up Business Information',
                'description' => 'Complete your business details to start selling',
                'action' => 'Setup Business',
                'url' => route('seller.profile.business'),
                'priority' => 'high',
                'icon' => 'settings',
            ];
        }
        
        // General recommendations
        $recommendations[] = [
            'type' => 'general',
            'title' => 'Review Security Settings',
            'description' => 'Keep your account secure with strong passwords',
            'action' => 'Security Settings',
            'url' => route('seller.settings.security'),
            'priority' => 'low',
            'icon' => 'settings',
        ];
        
        // Sort by priority
        usort($recommendations, function ($a, $b) {
            $priorities = ['high' => 3, 'medium' => 2, 'low' => 1];
            return $priorities[$b['priority']] - $priorities[$a['priority']];
        });
        
        return array_slice($recommendations, 0, 5); // Return top 5 recommendations
    }
    
    /**
     * Get recent activity for the seller.
     */
    private function getRecentActivity($user): array
    {
        $activities = [];
        
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
                'title' => 'Seller Application ' . ucfirst($app->status),
                'description' => 'Your seller application was ' . $app->status,
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
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, 5); // Return last 5 activities
    }
}