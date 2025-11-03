<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileCompletionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function incomplete_buyer_profile_is_detected()
    {
        $user = User::factory()->create([
            'name' => 'Test Buyer',
            'email' => 'buyer@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => null,
            'delivery_address' => null,
        ]);

        $status = $user->getProfileCompletionStatus();

        $this->assertFalse($status['is_complete']);
        $this->assertEquals(50, $status['percentage']); // 2 out of 4 fields complete
        $this->assertCount(2, $status['missing_fields']);
    }

    /** @test */
    public function complete_buyer_profile_is_detected()
    {
        $user = User::factory()->create([
            'name' => 'Complete Buyer',
            'email' => 'complete@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => '1234567890',
            'delivery_address' => '123 Main Street',
        ]);

        $status = $user->getProfileCompletionStatus();

        $this->assertTrue($status['is_complete']);
        $this->assertEquals(100, $status['percentage']);
        $this->assertCount(0, $status['missing_fields']);
    }

    /** @test */
    public function incomplete_seller_profile_is_detected()
    {
        $user = User::factory()->create([
            'name' => 'Test Seller',
            'email' => 'seller@test.com',
            'role' => User::ROLE_SELLER,
            'phone_number' => '1234567890',
            'address' => null,
        ]);

        $status = $user->getProfileCompletionStatus();

        $this->assertFalse($status['is_complete']);
        $this->assertEquals(75, $status['percentage']); // 3 out of 4 fields complete
        $this->assertCount(1, $status['missing_fields']);
        $this->assertEquals('address', $status['missing_fields'][0]['field']);
    }

    /** @test */
    public function complete_seller_profile_is_detected()
    {
        $user = User::factory()->create([
            'name' => 'Complete Seller',
            'email' => 'seller@test.com',
            'role' => User::ROLE_SELLER,
            'phone_number' => '1234567890',
            'address' => '123 Business Ave',
        ]);

        $status = $user->getProfileCompletionStatus();

        $this->assertTrue($status['is_complete']);
        $this->assertEquals(100, $status['percentage']);
    }

    /** @test */
    public function profile_completion_recommendation_is_critical_when_incomplete()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => null,
            'delivery_address' => null,
        ]);

        $recommendation = $user->getProfileCompletionRecommendation();

        $this->assertNotNull($recommendation);
        $this->assertEquals('critical', $recommendation['priority']);
        $this->assertEquals('Complete Your Profile', $recommendation['title']);
        $this->assertArrayHasKey('missing_fields', $recommendation);
    }

    /** @test */
    public function profile_completion_recommendation_for_email_verification()
    {
        $user = User::factory()->create([
            'name' => 'Verified User',
            'email' => 'verified@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => '1234567890',
            'delivery_address' => '123 Main St',
            'email_verified_at' => null,
        ]);

        $recommendation = $user->getProfileCompletionRecommendation();

        $this->assertNotNull($recommendation);
        $this->assertEquals('high', $recommendation['priority']);
        $this->assertEquals('Verify Your Email', $recommendation['title']);
    }

    /** @test */
    public function no_recommendation_for_complete_profile_with_verified_email()
    {
        $user = User::factory()->create([
            'name' => 'Perfect User',
            'email' => 'perfect@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => '1234567890',
            'delivery_address' => '123 Main St',
            'email_verified_at' => now(),
            'profile_picture' => 'path/to/picture.jpg',
        ]);

        $recommendation = $user->getProfileCompletionRecommendation();

        $this->assertNull($recommendation);
    }

    /** @test */
    public function user_can_dismiss_profile_completion_reminder()
    {
        $user = User::factory()->create();

        $this->assertFalse($user->hasProfileCompletionReminderDismissed());

        $user->dismissProfileCompletionReminder();

        $this->assertTrue($user->hasProfileCompletionReminderDismissed());
        $this->assertNotNull($user->fresh()->profile_completion_reminder_dismissed_at);
    }

    /** @test */
    public function profile_completion_tracking_updates_on_profile_update()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => null,
            'delivery_address' => null,
            'profile_completion_percentage' => 0,
        ]);

        $user->update([
            'phone_number' => '1234567890',
            'delivery_address' => '123 Main St',
        ]);

        $user->updateProfileCompletionTracking();

        $this->assertEquals(100, $user->fresh()->profile_completion_percentage);
        $this->assertNotNull($user->fresh()->profile_completed_at);
    }

    /** @test */
    public function profile_completion_banner_data_is_shared_with_inertia()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => null,
            'delivery_address' => null,
        ]);

        $response = $this->actingAs($user)->get('/buyer/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->has('profileCompletion')
            ->has('profileCompletion.status')
            ->has('profileCompletion.recommendation')
            ->where('profileCompletion.status.is_complete', false)
            ->where('profileCompletion.status.percentage', 50)
        );
    }

    /** @test */
    public function user_can_dismiss_profile_completion_reminder_via_api()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/profile/dismiss-completion-reminder');

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $this->assertTrue($user->fresh()->hasProfileCompletionReminderDismissed());
    }

    /** @test */
    public function user_can_get_profile_completion_status_via_api()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'role' => User::ROLE_BUYER,
            'phone_number' => null,
            'delivery_address' => null,
        ]);

        $response = $this->actingAs($user)->get('/profile/completion-status');

        $response->assertOk();
        $response->assertJsonStructure([
            'status' => [
                'is_complete',
                'percentage',
                'completed_fields',
                'total_fields',
                'missing_fields',
                'has_email_verified',
                'has_profile_picture',
            ],
            'recommendation' => [
                'title',
                'description',
                'action',
                'url',
                'priority',
            ],
        ]);
    }

    /** @test */
    public function administrator_has_correct_required_fields()
    {
        $user = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'role' => User::ROLE_ADMINISTRATOR,
            'phone_number' => null,
        ]);

        $requiredFields = $user->getRequiredFieldsForRole();

        $this->assertArrayHasKey('name', $requiredFields);
        $this->assertArrayHasKey('email', $requiredFields);
        $this->assertArrayHasKey('phone_number', $requiredFields);
        $this->assertArrayNotHasKey('delivery_address', $requiredFields);
        $this->assertArrayNotHasKey('address', $requiredFields);
    }

    /** @test */
    public function buyer_has_correct_required_fields()
    {
        $user = User::factory()->create([
            'role' => User::ROLE_BUYER,
        ]);

        $requiredFields = $user->getRequiredFieldsForRole();

        $this->assertArrayHasKey('name', $requiredFields);
        $this->assertArrayHasKey('email', $requiredFields);
        $this->assertArrayHasKey('phone_number', $requiredFields);
        $this->assertArrayHasKey('delivery_address', $requiredFields);
        $this->assertArrayNotHasKey('address', $requiredFields);
    }

    /** @test */
    public function seller_has_correct_required_fields()
    {
        $user = User::factory()->create([
            'role' => User::ROLE_SELLER,
        ]);

        $requiredFields = $user->getRequiredFieldsForRole();

        $this->assertArrayHasKey('name', $requiredFields);
        $this->assertArrayHasKey('email', $requiredFields);
        $this->assertArrayHasKey('phone_number', $requiredFields);
        $this->assertArrayHasKey('address', $requiredFields);
        $this->assertArrayNotHasKey('delivery_address', $requiredFields);
    }
}
