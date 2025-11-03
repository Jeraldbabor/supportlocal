<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Make shipping fields nullable for cart orders (before checkout)
            $table->string('shipping_name')->nullable()->change();
            $table->string('shipping_email')->nullable()->change();
            $table->string('shipping_phone')->nullable()->change();
            $table->text('shipping_address')->nullable()->change();
            $table->decimal('subtotal', 10, 2)->nullable()->change();
        });
        
        // Handle payment_method separately with raw SQL
        DB::statement('ALTER TABLE orders ALTER COLUMN payment_method DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Revert shipping fields to NOT NULL
            $table->string('shipping_name')->nullable(false)->change();
            $table->string('shipping_email')->nullable(false)->change();
            $table->string('shipping_phone')->nullable(false)->change();
            $table->text('shipping_address')->nullable(false)->change();
            $table->decimal('subtotal', 10, 2)->nullable(false)->change();
        });
        
        DB::statement('ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL');
    }
};
