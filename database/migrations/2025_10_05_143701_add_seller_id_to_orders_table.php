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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('seller_id')->nullable()->constrained('users')->onDelete('set null')->after('user_id');
            $table->text('delivery_address')->nullable()->after('shipping_address');
            $table->string('delivery_phone')->nullable()->after('delivery_address');
            $table->text('delivery_notes')->nullable()->after('delivery_phone');
            $table->string('gcash_reference')->nullable()->after('gcash_number');
            $table->text('rejection_reason')->nullable()->after('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('seller_id');
            $table->dropColumn(['delivery_address', 'delivery_phone', 'delivery_notes', 'gcash_reference', 'rejection_reason']);
        });
    }
};
