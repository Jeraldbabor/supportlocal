<?php

namespace Tests\Feature\Seller;

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $seller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'Jane Seller',
            'email' => 'jane@seller.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        SellerApplication::factory()->approved()->create([
            'user_id' => $this->seller->id,
        ]);
    }

    /** @test */
    public function seller_can_view_settings_dashboard()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/index')
            ->has('user')
            ->where('user.name', 'Jane Seller')
        );
    }

    /** @test */
    public function seller_can_view_security_settings()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.security'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/security')
            ->has('user')
        );
    }

    /** @test */
    public function seller_can_update_password()
    {
        $this->actingAs($this->seller);

        $response = $this->put(route('seller.settings.password.update'), [
            'current_password' => 'password123',
            'password' => 'newpassword456',
            'password_confirmation' => 'newpassword456',
        ]);

        $response->assertRedirect(route('seller.settings.security'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertTrue(Hash::check('newpassword456', $this->seller->password));
    }

    /** @test */
    public function seller_cannot_update_password_with_wrong_current_password()
    {
        $this->actingAs($this->seller);

        $response = $this->put(route('seller.settings.password.update'), [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword456',
            'password_confirmation' => 'newpassword456',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['current_password']);

        $this->seller->refresh();
        $this->assertTrue(Hash::check('password123', $this->seller->password));
    }

    /** @test */
    public function seller_can_view_notifications_settings()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.notifications'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/notifications')
            ->has('preferences')
        );
    }

    /** @test */
    public function seller_can_view_business_settings()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.business'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/business')
            ->has('business')
            ->has('businessTypes')
        );
    }

    /** @test */
    public function seller_can_view_account_settings()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.account'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/account')
            ->has('user')
            ->where('user.name', 'Jane Seller')
        );
    }

    /** @test */
    public function seller_can_deactivate_account()
    {
        $this->actingAs($this->seller);

        $response = $this->post(route('seller.settings.deactivate'), [
            'password' => 'password123',
            'reason' => 'No longer selling products',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertFalse($this->seller->is_active);
        $this->assertGuest();
    }

    /** @test */
    public function seller_cannot_deactivate_account_with_wrong_password()
    {
        $this->actingAs($this->seller);

        $response = $this->post(route('seller.settings.deactivate'), [
            'password' => 'wrongpassword',
            'reason' => 'Test reason',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['password']);

        $this->seller->refresh();
        $this->assertTrue($this->seller->is_active);
    }

    /** @test */
    public function seller_can_view_analytics_settings()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.settings.analytics'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/settings/analytics')
            ->has('analyticsSettings')
        );
    }

    /** @test */
    public function seller_can_send_email_verification()
    {
        Notification::fake();

        // Create seller with unverified email
        $unverifiedSeller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'email_verified_at' => null,
        ]);

        $this->actingAs($unverifiedSeller);

        $response = $this->post(route('seller.settings.email.verify'));

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    /** @test */
    public function verified_seller_cannot_send_verification_email()
    {
        $this->actingAs($this->seller); // Already verified

        $response = $this->post(route('seller.settings.email.verify'));

        $response->assertRedirect();
        $response->assertSessionHas('info');
    }

    /** @test */
    public function password_validation_works_correctly()
    {
        $this->actingAs($this->seller);

        // Test missing current password
        $response = $this->put(route('seller.settings.password.update'), [
            'password' => 'newpassword456',
            'password_confirmation' => 'newpassword456',
        ]);

        $response->assertSessionHasErrors(['current_password']);

        // Test password confirmation mismatch
        $response = $this->put(route('seller.settings.password.update'), [
            'current_password' => 'password123',
            'password' => 'newpassword456',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertSessionHasErrors(['password']);

        // Test weak password
        $response = $this->put(route('seller.settings.password.update'), [
            'current_password' => 'password123',
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    /** @test */
    public function deactivation_validation_works_correctly()
    {
        $this->actingAs($this->seller);

        // Test missing password
        $response = $this->post(route('seller.settings.deactivate'), [
            'reason' => 'Test reason',
        ]);

        $response->assertSessionHasErrors(['password']);

        // Test missing reason
        $response = $this->post(route('seller.settings.deactivate'), [
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors(['reason']);
    }
}
