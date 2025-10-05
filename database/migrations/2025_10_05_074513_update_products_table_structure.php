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
        Schema::table('products', function (Blueprint $table) {
            // Drop the index that includes the category column first
            $table->dropIndex(['category', 'status']);
            
            // Add missing handle field for SEO-friendly URLs (nullable first)
            $table->string('handle')->nullable()->after('slug');
            
            // Remove the old string category field since we now use category_id foreign key
            $table->dropColumn('category');
        });
        
        // Update existing products with handles based on their names
        $products = \App\Models\Product::whereNull('handle')->get();
        foreach ($products as $product) {
            $handle = \Illuminate\Support\Str::slug($product->name);
            // Ensure uniqueness
            $counter = 1;
            $originalHandle = $handle;
            while (\App\Models\Product::where('handle', $handle)->where('id', '!=', $product->id)->exists()) {
                $handle = $originalHandle . '-' . $counter++;
            }
            $product->update(['handle' => $handle]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('handle');
            $table->string('category')->nullable();
            
            // Re-add the index that was dropped
            $table->index(['category', 'status']);
        });
    }
};
