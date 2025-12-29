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
        Schema::table('conversations', function (Blueprint $table) {
            $table->timestamp('deleted_by_buyer_at')->nullable()->after('last_message_at');
            $table->timestamp('deleted_by_seller_at')->nullable()->after('deleted_by_buyer_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['deleted_by_buyer_at', 'deleted_by_seller_at']);
        });
    }
};
