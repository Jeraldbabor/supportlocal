<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductCategory>
 */
class ProductCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(rand(1, 3), true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(10),
            'icon' => $this->faker->randomElement(['craft', 'utensils', 'palette', 'shirt', 'heart', 'book', 'futbol', 'laptop']),
            'color' => $this->faker->hexColor(),
            'parent_id' => null,
            'sort_order' => $this->faker->numberBetween(1, 100),
            'is_active' => $this->faker->boolean(90),
            'meta_title' => $this->faker->sentence(6),
            'meta_description' => $this->faker->sentence(15),
        ];
    }

    /**
     * Indicate that the category is a child category.
     */
    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => \App\Models\ProductCategory::factory(),
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
