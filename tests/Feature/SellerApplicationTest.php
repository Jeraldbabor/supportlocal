<?php

namespace Tests\Feature;

use App\Models\SellerApplication;
use App\Models\User;
use App\Notifications\SellerApplicationApproved;
use App\Notifications\SellerApplicationRejected;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SellerApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
    }

    /** @test */
    public function buyer_can_submit_seller_application()
    {
        $buyer = User::factory()->create([
            'role' => User::ROLE_BUYER,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone_number' => '1234567890',
            'address' => '123 Main St',
            'profile_picture' => 'avatars/john.jpg',
        ]);

        $this->actingAs($buyer);

        $idDocument = UploadedFile::fake()->create('id.pdf', 100);

        $response = $this->post(route('seller.application.store'), [
            'business_description' => 'I am a local artisan specializing in handmade jewelry with over 5 years of experience.',
            'business_type' => 'Handmade Jewelry',
            'id_document_type' => 'national_id',
            'id_document' => $idDocument,
        ]);

        $response->assertRedirect(route('seller.application.create'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('seller_applications', [
            'user_id' => $buyer->id,
            'business_description' => 'I am a local artisan specializing in handmade jewelry with over 5 years of experience.',
            'business_type' => 'Handmade Jewelry',
            'id_document_type' => 'national_id',
            'status' => SellerApplication::STATUS_PENDING,
        ]);
    }

    /** @test */
    public function admin_can_approve_seller_application_and_preserve_buyer_profile()
    {
        Notification::fake();

        // Create a buyer with complete profile
        $buyer = User::factory()->create([
            'role' => User::ROLE_BUYER,
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone_number' => '9876543210',
            'address' => '456 Oak Ave',
            'profile_picture' => 'avatars/jane.jpg',
            'date_of_birth' => '1990-05-15',
            'delivery_address' => '456 Oak Ave',
            'delivery_phone' => '9876543210',
            'gcash_number' => '09123456789',
            'gcash_name' => 'Jane Smith',
        ]);

        $admin = User::factory()->create(['role' => User::ROLE_ADMINISTRATOR]);

        $application = SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        $this->actingAs($admin);

        $response = $this->post(route('admin.seller-applications.approve', $application), [
            'admin_notes' => 'Great application with complete documentation.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Refresh the models
        $buyer->refresh();
        $application->refresh();

        // Check that application is approved
        $this->assertEquals(SellerApplication::STATUS_APPROVED, $application->status);
        $this->assertEquals($admin->id, $application->reviewed_by);
        $this->assertEquals('Great application with complete documentation.', $application->admin_notes);
        $this->assertNotNull($application->reviewed_at);

        // Check that user role is updated to seller
        $this->assertEquals(User::ROLE_SELLER, $buyer->role);
        $this->assertTrue($buyer->is_active);

        // Verify that all buyer profile information is preserved
        $this->assertEquals('Jane Smith', $buyer->name);
        $this->assertEquals('jane@example.com', $buyer->email);
        $this->assertEquals('9876543210', $buyer->phone_number);
        $this->assertEquals('456 Oak Ave', $buyer->address);
        $this->assertEquals('avatars/jane.jpg', $buyer->profile_picture);
        $this->assertEquals('1990-05-15', $buyer->date_of_birth?->format('Y-m-d'));
        $this->assertEquals('456 Oak Ave', $buyer->delivery_address);
        $this->assertEquals('9876543210', $buyer->delivery_phone);
        $this->assertEquals('09123456789', $buyer->gcash_number);
        $this->assertEquals('Jane Smith', $buyer->gcash_name);

        // Check that notification was sent
        Notification::assertSentTo($buyer, SellerApplicationApproved::class);
    }

    /** @test */
    public function admin_cannot_approve_application_with_incomplete_buyer_profile()
    {
        Notification::fake();

        // Create a buyer with incomplete profile (missing phone and address)
        $buyer = User::factory()->create([
            'role' => User::ROLE_BUYER,
            'name' => 'Bob Wilson',
            'email' => 'bob@example.com',
            'phone_number' => null, // Missing
            'address' => null, // Missing
        ]);

        $admin = User::factory()->create(['role' => User::ROLE_ADMINISTRATOR]);

        $application = SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        $this->actingAs($admin);

        $response = $this->post(route('admin.seller-applications.approve', $application), [
            'admin_notes' => 'Approving application.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['approval']);

        // Check that application remains pending
        $application->refresh();
        $this->assertEquals(SellerApplication::STATUS_PENDING, $application->status);

        // Check that user role remains buyer
        $buyer->refresh();
        $this->assertEquals(User::ROLE_BUYER, $buyer->role);

        // Check that no notification was sent
        Notification::assertNotSentTo($buyer, SellerApplicationApproved::class);
    }

    /** @test */
    public function admin_can_reject_seller_application()
    {
        Notification::fake();

        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMINISTRATOR]);

        $application = SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        $this->actingAs($admin);

        $response = $this->post(route('admin.seller-applications.reject', $application), [
            'admin_notes' => 'Insufficient documentation provided.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Refresh the models
        $buyer->refresh();
        $application->refresh();

        // Check that application is rejected
        $this->assertEquals(SellerApplication::STATUS_REJECTED, $application->status);
        $this->assertEquals($admin->id, $application->reviewed_by);
        $this->assertEquals('Insufficient documentation provided.', $application->admin_notes);
        $this->assertNotNull($application->reviewed_at);

        // Check that user role remains buyer
        $this->assertEquals(User::ROLE_BUYER, $buyer->role);

        // Check that notification was sent
        Notification::assertSentTo($buyer, SellerApplicationRejected::class);
    }

    /** @test */
    public function user_can_view_their_application_status()
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        $application = SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
            'admin_notes' => 'Under review',
        ]);

        $this->actingAs($buyer);

        $response = $this->get(route('seller.application.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('buyer/seller-application')
            ->has('existingApplication')
            ->where('existingApplication.status', SellerApplication::STATUS_PENDING)
            ->where('existingApplication.admin_notes', 'Under review')
        );
    }

    /** @test */
    public function buyer_cannot_submit_multiple_applications()
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        // Create existing application
        SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        $this->actingAs($buyer);

        $idDocument = UploadedFile::fake()->create('id.pdf', 100);

        $response = $this->post(route('seller.application.store'), [
            'business_description' => 'Another application',
            'business_type' => 'Test',
            'id_document_type' => 'national_id',
            'id_document' => $idDocument,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['application']);

        // Verify only one application exists
        $this->assertEquals(1, SellerApplication::where('user_id', $buyer->id)->count());
    }

    /** @test */
    public function user_profile_completeness_methods_work_correctly()
    {
        // Complete profile
        $completeUser = User::factory()->create([
            'name' => 'Complete User',
            'email' => 'complete@example.com',
            'phone_number' => '1234567890',
            'address' => '123 Complete St',
            'date_of_birth' => '1990-01-01',
            'profile_picture' => 'avatar.jpg',
        ]);

        $this->assertTrue($completeUser->hasCompleteProfileForSeller());
        $this->assertEquals(100, $completeUser->profile_completeness);
        $this->assertEmpty($completeUser->getMissingSellerProfileFields());

        // Incomplete profile
        $incompleteUser = User::factory()->create([
            'name' => 'Incomplete User',
            'email' => 'incomplete@example.com',
            'phone_number' => null,
            'address' => null,
        ]);

        $this->assertFalse($incompleteUser->hasCompleteProfileForSeller());
        $this->assertLessThan(100, $incompleteUser->profile_completeness);
        $this->assertContains('Phone Number', $incompleteUser->getMissingSellerProfileFields());
        $this->assertContains('Address', $incompleteUser->getMissingSellerProfileFields());
    }

    /** @test */
    public function buyer_can_view_seller_application_confirmation_page()
    {
        $buyer = User::factory()->create([
            'role' => User::ROLE_BUYER,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->actingAs($buyer);

        $response = $this->get(route('seller.application.confirm'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('buyer/seller-application-confirmation')
            ->has('user')
            ->where('user.name', 'John Doe')
            ->where('user.email', 'john@example.com')
        );
    }

    /** @test */
    public function buyer_with_existing_application_is_redirected_from_confirmation_to_form()
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        // Create an existing application
        SellerApplication::factory()->create([
            'user_id' => $buyer->id,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        $this->actingAs($buyer);

        $response = $this->get(route('seller.application.confirm'));

        $response->assertRedirect(route('seller.application.create'));
    }

    /** @test */
    public function buyer_can_access_application_form_directly_via_new_route()
    {
        $buyer = User::factory()->create([
            'role' => User::ROLE_BUYER,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->actingAs($buyer);

        $response = $this->get(route('seller.application.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('buyer/seller-application')
            ->has('idTypes')
            ->where('hasExistingApplication', false)
        );
    }
}
