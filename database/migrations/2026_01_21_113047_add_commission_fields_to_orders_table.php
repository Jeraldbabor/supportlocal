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
            // Commission rate applied at time of order completion (stored for historical accuracy)
            $table->decimal('commission_rate', 5, 2)->default(0)->after('total_amount');
            // Admin commission amount (2% of total_amount by default)
            $table->decimal('admin_commission', 10, 2)->default(0)->after('commission_rate');
            // Seller's net amount after commission deduction
            $table->decimal('seller_net_amount', 10, 2)->default(0)->after('admin_commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['commission_rate', 'admin_commission', 'seller_net_amount']);
        });
    }
};
