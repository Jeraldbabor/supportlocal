<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Console\Command;

class TestProductSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the product management system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Product Management System...');
        $this->newLine();

        // Test 1: Check categories
        $categoryCount = ProductCategory::count();
        $this->info("✓ Product Categories: {$categoryCount} found");

        // Test 2: Create or find seller
        $seller = User::where('role', 'seller')->first();
        if (! $seller) {
            $seller = User::factory()->create([
                'role' => 'seller',
                'name' => 'Test Seller',
                'email' => 'testseller@example.com',
            ]);
            $this->info("✓ Created test seller: {$seller->name}");
        } else {
            $this->info("✓ Found existing seller: {$seller->name}");
        }

        // Test 3: Create a test product
        $category = ProductCategory::first();
        $this->info("✓ Using category: {$category->name}");

        try {
            // Check if test product already exists
            $existingProduct = Product::where('name', 'Test Handmade Pottery Bowl')->first();
            if ($existingProduct) {
                $product = $existingProduct;
                $this->info("✓ Found existing test product: {$product->name} (ID: {$product->id})");
            } else {
                $product = Product::create([
                    'seller_id' => $seller->id,
                    'category_id' => $category->id,
                    'name' => 'Test Handmade Pottery Bowl',
                    'description' => 'Beautiful handcrafted ceramic bowl perfect for serving.',
                    'short_description' => 'Handcrafted ceramic bowl',
                    'price' => 29.99,
                    'quantity' => 10,
                    'status' => 'active',
                    'requires_shipping' => true,
                    'taxable' => true,
                    'track_quantity' => true,
                    'tags' => ['handmade', 'pottery', 'ceramic'],
                    'handle' => 'test-handmade-pottery-bowl-'.time(),
                ]);
                $this->info("✓ Created new product: {$product->name} (ID: {$product->id})");
            }

            // Test relationships
            $product->refresh(); // Refresh to get latest data
            $this->info("✓ Product seller: {$product->seller->name}");
            if ($product->category) {
                $this->info("✓ Product category: {$product->category->name}");
            } else {
                $this->warn("⚠ Product has no category assigned (category_id: {$product->category_id})");
            }
            $this->info("✓ Product stock status: {$product->stock_status}");
            $this->info('✓ Product tags: '.implode(', ', $product->tags));

            // Test stock methods
            $this->info('✓ Is in stock: '.($product->isInStock() ? 'Yes' : 'No'));
            $this->info('✓ Has low stock: '.($product->hasLowStock() ? 'Yes' : 'No'));

            // Test product statistics
            $totalProducts = Product::where('seller_id', $seller->id)->count();
            $activeProducts = Product::where('seller_id', $seller->id)->where('status', 'active')->count();
            $this->info("✓ Seller has {$totalProducts} total products, {$activeProducts} active");

        } catch (\Exception $e) {
            $this->error('✗ Error testing product: '.$e->getMessage());

            return Command::FAILURE;
        }

        $this->newLine();
        $this->info('🎉 Product Management System Test Complete!');

        return Command::SUCCESS;
    }
}
