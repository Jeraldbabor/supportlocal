<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(rand(2, 4), true);
        $price = $this->faker->randomFloat(2, 10, 1000);
        $comparePrice = $this->faker->boolean(30) ? $price + $this->faker->randomFloat(2, 5, 100) : null;
        $costPrice = $this->faker->randomFloat(2, 5, $price - 5);
        
        return [
            'seller_id' => User::where('role', 'seller')->inRandomOrder()->first()?->id ?? User::factory()->create(['role' => 'seller'])->id,
            'name' => ucwords($name),
            'description' => $this->faker->paragraphs(3, true),
            'short_description' => $this->faker->sentence(12),
            'sku' => 'PRD-' . strtoupper(Str::random(8)),
            'slug' => Str::slug($name) . '-' . strtolower(Str::random(6)),
            'price' => $price,
            'compare_price' => $comparePrice,
            'cost_price' => $costPrice,
            'quantity' => $this->faker->numberBetween(0, 100),
            'low_stock_threshold' => $this->faker->numberBetween(1, 10),
            'track_quantity' => $this->faker->boolean(90),
            'allow_backorders' => $this->faker->boolean(20),
            'weight' => $this->faker->randomFloat(2, 0.1, 50),
            'weight_unit' => $this->faker->randomElement(['kg', 'g', 'lb', 'oz']),
            'dimensions' => [
                'length' => $this->faker->randomFloat(2, 1, 100),
                'width' => $this->faker->randomFloat(2, 1, 100),
                'height' => $this->faker->randomFloat(2, 1, 100),
            ],
            'condition' => $this->faker->randomElement(['new', 'used', 'refurbished']),
            'status' => $this->faker->randomElement(['draft', 'active', 'inactive']),
            'is_featured' => $this->faker->boolean(10),
            'is_digital' => $this->faker->boolean(15),
            'requires_shipping' => $this->faker->boolean(85),
            'shipping_cost' => $this->faker->boolean(50) ? $this->faker->randomFloat(2, 0, 50) : null,
            'free_shipping' => $this->faker->boolean(30),
            'meta_title' => $this->faker->sentence(6),
            'meta_description' => $this->faker->sentence(15),
            'tags' => $this->faker->words(rand(3, 8)),
            'category_id' => ProductCategory::inRandomOrder()->first()?->id,
            'view_count' => $this->faker->numberBetween(0, 1000),
            'order_count' => $this->faker->numberBetween(0, 50),
            'average_rating' => $this->faker->boolean(70) ? $this->faker->randomFloat(1, 3.0, 5.0) : null,
            'review_count' => $this->faker->numberBetween(0, 100),
            'published_at' => $this->faker->boolean(70) ? $this->faker->dateTimeBetween('-1 year', 'now') : null,
        ];
    }

    /**
     * Indicate that the product is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Product::STATUS_ACTIVE,
            'published_at' => now(),
        ]);
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'status' => Product::STATUS_ACTIVE,
            'published_at' => now(),
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 0,
            'stock_status' => Product::STOCK_OUT_OF_STOCK,
        ]);
    }

    /**
     * Indicate that the product has low stock.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 3,
            'low_stock_threshold' => 5,
            'stock_status' => Product::STOCK_LOW_STOCK,
        ]);
    }
}
