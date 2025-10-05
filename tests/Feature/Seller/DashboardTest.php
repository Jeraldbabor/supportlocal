<?php

namespace Tests\Feature\Seller;

use App\Models\Product;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function seller_can_view_dashboard_with_complete_profile()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Complete Seller',
            'email' => 'complete@seller.com',
            'phone_number' => '1234567890',
            'address' => '123 Complete St',
            'date_of_birth' => '1990-01-01',
            'profile_picture' => 'avatars/complete.jpg',
            'email_verified_at' => now(),
            'last_login_at' => now()->subDays(1),
        ]);

        $application = SellerApplication::factory()->approved()->create([
            'user_id' => $seller->id,
            'business_type' => 'Electronics',
            'business_description' => 'Selling quality electronics',
        ]);

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/dashboard')
            ->has('user')
            ->has('profileSummary')
            ->has('settingsSummary')
            ->has('dashboardStats')
            ->has('recommendations')
            ->has('businessInfo')
            ->where('user.name', 'Complete Seller')
            ->where('profileSummary.profile_completeness', 100)
            ->where('settingsSummary.email_verified', true)
            ->where('settingsSummary.business_setup', true)
            ->where('businessInfo.type', 'Electronics')
        );
    }

    /** @test */
    public function seller_dashboard_shows_incomplete_profile_recommendations()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Incomplete Seller',
            'email' => 'incomplete@seller.com',
            'phone_number' => null, // Missing
            'address' => null, // Missing
            'profile_picture' => null, // Missing
            'email_verified_at' => null, // Not verified
        ]);

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/dashboard')
            ->has('profileSummary')
            ->has('settingsSummary')
            ->has('recommendations')
            ->where('profileSummary.profile_completeness', fn ($completeness) => $completeness < 100)
            ->where('profileSummary.has_avatar', false)
            ->where('settingsSummary.email_verified', false)
            ->where('settingsSummary.business_setup', false)
            ->has('recommendations.0')
        );
    }

    /** @test */
    public function seller_dashboard_calculates_correct_account_health_score()
    {
        // Test high score seller
        $highScoreSeller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'High Score Seller',
            'email' => 'highscore@seller.com',
            'phone_number' => '1234567890',
            'address' => '123 High Score St',
            'date_of_birth' => '1990-01-01',
            'profile_picture' => 'avatars/high.jpg',
            'email_verified_at' => now(),
            'last_login_at' => now()->subDays(1),
        ]);

        SellerApplication::factory()->approved()->create([
            'user_id' => $highScoreSeller->id,
        ]);

        // Create products to boost account health score (product activity: 20%)
        Product::factory()->count(4)->create([
            'seller_id' => $highScoreSeller->id,
        ]);

        $this->actingAs($highScoreSeller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->where('dashboardStats.account_health_score', fn ($score) => $score >= 90)
            ->where('dashboardStats.profile_completeness', 100)
        );

        // Test low score seller
        $lowScoreSeller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Low Score Seller',
            'email' => 'lowscore@seller.com',
            'phone_number' => null,
            'address' => null,
            'profile_picture' => null,
            'email_verified_at' => null,
            'last_login_at' => now()->subDays(30),
        ]);

        $this->actingAs($lowScoreSeller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->where('dashboardStats.account_health_score', fn ($score) => $score < 50)
            ->where('dashboardStats.profile_completeness', fn ($completeness) => $completeness < 100)
        );
    }

    /** @test */
    public function seller_dashboard_shows_days_as_seller()
    {
        $seller = User::factory()->create(['role' => User::ROLE_SELLER]);

        $application = SellerApplication::factory()->approved()->create([
            'user_id' => $seller->id,
            'reviewed_at' => now()->subDays(30), // Approved 30 days ago
        ]);

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->where('dashboardStats.days_as_seller', fn ($days) => abs($days - 30) < 1)
        );
    }

    /** @test */
    public function seller_dashboard_recommendations_are_prioritized()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Test Seller',
            'email' => 'test@seller.com',
            'phone_number' => null, // Missing - high priority
            'address' => null, // Missing - high priority
            'profile_picture' => null, // Missing - medium priority
            'email_verified_at' => null, // Not verified - high priority
        ]);

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->has('recommendations')
            ->has('recommendations.0', fn ($recommendation) => $recommendation->where('priority', 'critical')
                ->has('type')
                ->has('title')
                ->has('description')
                ->has('action')
                ->has('url')
                ->has('icon')
            )
        );
    }

    /** @test */
    public function seller_dashboard_limits_recommendations_to_five()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Test Seller',
            'email' => 'test@seller.com',
            'phone_number' => null,
            'address' => null,
            'profile_picture' => null,
            'email_verified_at' => null,
        ]);

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->has('recommendations')
            ->where('recommendations', fn ($recommendations) => count($recommendations) <= 5)
        );
    }

    /** @test */
    public function seller_without_application_shows_business_setup_recommendation()
    {
        $seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'No App Seller',
            'email' => 'noapp@seller.com',
            'phone_number' => '1234567890',
            'address' => '123 No App St',
            'email_verified_at' => now(),
            'date_of_birth' => '1990-01-01',
            'profile_picture' => 'path/to/picture.jpg',
        ]);

        // No seller application created

        $this->actingAs($seller);

        $response = $this->get(route('seller.dashboard'));

        $response->assertInertia(fn ($page) => $page->where('settingsSummary.business_setup', false)
            ->where('businessInfo', null)
            ->has('recommendations')
            ->where('recommendations.0.type', 'business')
        );
    }
}
