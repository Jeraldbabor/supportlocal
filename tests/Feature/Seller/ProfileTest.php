<?php

namespace Tests\Feature\Seller;

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $seller;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        // Create a seller with complete profile
        $this->seller = User::factory()->create([
            'role' => User::ROLE_SELLER,
            'name' => 'John Seller',
            'email' => 'john@seller.com',
            'phone_number' => '1234567890',
            'address' => '123 Seller St',
            'profile_picture' => 'avatars/john.jpg',
            'email_verified_at' => now(),
        ]);

        // Create an approved seller application
        SellerApplication::factory()->approved()->create([
            'user_id' => $this->seller->id,
            'business_type' => 'Handmade Crafts',
            'business_description' => 'Creating beautiful handmade items',
        ]);
    }

    /** @test */
    public function seller_can_view_their_profile()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.profile.show'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/profile/show')
            ->has('user')
            ->where('user.name', 'John Seller')
            ->where('user.email', 'john@seller.com')
            ->has('sellerApplication')
            ->where('sellerApplication.business_type', 'Handmade Crafts')
        );
    }

    /** @test */
    public function seller_can_edit_their_profile()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.profile.edit'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/profile/edit')
            ->has('user')
            ->where('user.name', 'John Seller')
        );
    }

    /** @test */
    public function seller_can_update_their_profile()
    {
        $this->actingAs($this->seller);

        $response = $this->put(route('seller.profile.update'), [
            'name' => 'John Updated Seller',
            'email' => 'john.updated@seller.com',
            'phone_number' => '9876543210',
            'address' => '456 Updated St',
            'date_of_birth' => '1990-01-01',
            'delivery_address' => '456 Delivery Ave',
            'delivery_phone' => '9876543210',
            'gcash_number' => '09123456789',
            'gcash_name' => 'John Updated',
        ]);

        $response->assertRedirect(route('seller.profile.show'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertEquals('John Updated Seller', $this->seller->name);
        $this->assertEquals('john.updated@seller.com', $this->seller->email);
        $this->assertEquals('9876543210', $this->seller->phone_number);
        $this->assertEquals('456 Updated St', $this->seller->address);
        $this->assertEquals('09123456789', $this->seller->gcash_number);
    }

    /** @test */
    public function seller_email_verification_resets_when_email_changed()
    {
        $this->actingAs($this->seller);

        $this->assertNotNull($this->seller->email_verified_at);

        $response = $this->put(route('seller.profile.update'), [
            'name' => $this->seller->name,
            'email' => 'newemail@seller.com',
            'phone_number' => $this->seller->phone_number,
            'address' => $this->seller->address,
        ]);

        $response->assertRedirect(route('seller.profile.show'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertEquals('newemail@seller.com', $this->seller->email);
        $this->assertNull($this->seller->email_verified_at);
    }

    /** @test */
    public function seller_can_update_profile_picture()
    {
        $this->actingAs($this->seller);

        $avatar = UploadedFile::fake()->image('new_avatar.jpg', 200, 200);

        $response = $this->post(route('seller.profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

        $response->assertRedirect(route('seller.profile.show'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertNotNull($this->seller->profile_picture);
        $this->assertStringContainsString('avatars/', $this->seller->profile_picture);

        Storage::disk('public')->assertExists($this->seller->profile_picture);
    }

    /** @test */
    public function seller_can_delete_profile_picture()
    {
        $this->actingAs($this->seller);

        $response = $this->delete(route('seller.profile.avatar.delete'));

        $response->assertRedirect(route('seller.profile.show'));
        $response->assertSessionHas('success');

        $this->seller->refresh();
        $this->assertNull($this->seller->profile_picture);
    }

    /** @test */
    public function seller_can_view_business_information()
    {
        $this->actingAs($this->seller);

        $response = $this->get(route('seller.profile.business'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('seller/profile/business')
            ->has('business')
            ->where('business.type', 'Handmade Crafts')
            ->where('business.description', 'Creating beautiful handmade items')
        );
    }

    /** @test */
    public function seller_can_update_business_information()
    {
        $this->actingAs($this->seller);

        $response = $this->put(route('seller.profile.business.update'), [
            'business_description' => 'Updated business description with more details about our handmade crafts and unique products.',
            'business_type' => 'Art & Design',
        ]);

        $response->assertRedirect(route('seller.profile.business'));
        $response->assertSessionHas('success');

        $sellerApplication = $this->seller->sellerApplication;
        $sellerApplication->refresh();

        $this->assertEquals('Art & Design', $sellerApplication->business_type);
        $this->assertStringContainsString('Updated business description', $sellerApplication->business_description);
    }

    /** @test */
    public function seller_cannot_update_business_without_approved_application()
    {
        // Create seller without approved application
        $sellerWithoutApp = User::factory()->create(['role' => User::ROLE_SELLER]);

        $this->actingAs($sellerWithoutApp);

        $response = $this->put(route('seller.profile.business.update'), [
            'business_description' => 'Should not work',
            'business_type' => 'Test',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['business']);
    }

    /** @test */
    public function profile_validation_works_correctly()
    {
        $this->actingAs($this->seller);

        // Test required fields validation
        $response = $this->put(route('seller.profile.update'), [
            'name' => '',
            'email' => '',
            'phone_number' => '',
            'address' => '',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'phone_number', 'address']);

        // Test email uniqueness validation
        $otherUser = User::factory()->create(['email' => 'existing@email.com']);

        $response = $this->put(route('seller.profile.update'), [
            'name' => 'Test Name',
            'email' => 'existing@email.com',
            'phone_number' => '1234567890',
            'address' => 'Test Address',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function avatar_validation_works_correctly()
    {
        $this->actingAs($this->seller);

        // Test non-image file
        $nonImage = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->post(route('seller.profile.avatar.update'), [
            'avatar' => $nonImage,
        ]);

        $response->assertSessionHasErrors(['avatar']);

        // Test file too large
        $largeImage = UploadedFile::fake()->image('large.jpg')->size(3000); // 3MB

        $response = $this->post(route('seller.profile.avatar.update'), [
            'avatar' => $largeImage,
        ]);

        $response->assertSessionHasErrors(['avatar']);
    }
}
