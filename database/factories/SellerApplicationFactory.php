<?php

namespace Database\Factories;

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SellerApplication>
 */
class SellerApplicationFactory extends Factory
{
    protected $model = SellerApplication::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => User::ROLE_BUYER]),
            'business_description' => fake()->paragraph(5),
            'business_type' => fake()->randomElement([
                'Handmade Crafts',
                'Food & Beverages',
                'Clothing & Accessories',
                'Art & Design',
                'Home & Garden',
                'Electronics & Gadgets',
            ]),
            'id_document_path' => 'seller-applications/id-documents/'.fake()->uuid().'.pdf',
            'id_document_type' => fake()->randomElement(array_keys(SellerApplication::ID_TYPES)),
            'additional_documents_path' => [],
            'status' => SellerApplication::STATUS_PENDING,
            'admin_notes' => null,
            'reviewed_at' => null,
            'reviewed_by' => null,
        ];
    }

    /**
     * Indicate that the application is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SellerApplication::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by' => User::factory()->create(['role' => User::ROLE_ADMINISTRATOR]),
            'admin_notes' => 'Application approved.',
        ]);
    }

    /**
     * Indicate that the application is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SellerApplication::STATUS_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by' => User::factory()->create(['role' => User::ROLE_ADMINISTRATOR]),
            'admin_notes' => 'Application rejected due to insufficient documentation.',
        ]);
    }

    /**
     * Indicate that the application is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SellerApplication::STATUS_PENDING,
            'reviewed_at' => null,
            'reviewed_by' => null,
            'admin_notes' => null,
        ]);
    }
}
