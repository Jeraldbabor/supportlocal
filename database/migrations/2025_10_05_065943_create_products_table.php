<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');

            // Basic product information
            $table->string('name');
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('sku')->unique();
            $table->string('slug')->unique();

            // Pricing
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable(); // Original price for discounts
            $table->decimal('cost_price', 10, 2)->nullable(); // Cost for profit calculation

            // Inventory management
            $table->integer('quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->boolean('track_quantity')->default(true);
            $table->boolean('allow_backorders')->default(false);
            $table->string('stock_status')->default('in_stock'); // in_stock, out_of_stock, low_stock

            // Product attributes
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('weight_unit')->default('kg');
            $table->json('dimensions')->nullable(); // length, width, height
            $table->string('condition')->default('new'); // new, used, refurbished

            // SEO and metadata
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('tags')->nullable();

            // Product status and visibility
            $table->enum('status', ['draft', 'active', 'inactive', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_digital')->default(false);
            $table->boolean('requires_shipping')->default(true);

            // Images (stored as JSON array of image paths)
            $table->json('images')->nullable();
            $table->string('featured_image')->nullable();

            // Category and classification
            $table->string('category')->nullable();
            $table->json('subcategories')->nullable();

            // Shipping
            $table->decimal('shipping_weight', 8, 2)->nullable();
            $table->decimal('shipping_cost', 8, 2)->nullable();
            $table->boolean('free_shipping')->default(false);

            // Analytics
            $table->integer('view_count')->default(0);
            $table->integer('order_count')->default(0);
            $table->decimal('average_rating', 3, 2)->nullable();
            $table->integer('review_count')->default(0);

            // Timestamps
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['seller_id', 'status']);
            $table->index(['category', 'status']);
            $table->index(['status', 'is_featured']);
            $table->index('stock_status');
            $table->index('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
