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
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('payment_method');
            $table->string('payment_proof')->nullable()->after('payment_status');
            $table->text('payment_verification_notes')->nullable()->after('payment_proof');
            $table->timestamp('payment_verified_at')->nullable()->after('payment_verification_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'payment_proof',
                'payment_verification_notes',
                'payment_verified_at',
            ]);
        });
    }
};
