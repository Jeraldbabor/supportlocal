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
            $table->enum('shipping_provider', ['jt_express', 'other'])->nullable()->after('shipping_fee');
            $table->string('tracking_number', 100)->nullable()->after('shipping_provider');
            $table->string('waybill_number', 100)->nullable()->after('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_provider', 'tracking_number', 'waybill_number']);
        });
    }
};
