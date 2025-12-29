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
        Schema::table('seller_ratings', function (Blueprint $table) {
            $table->text('seller_reply')->nullable()->after('review');
            $table->timestamp('seller_replied_at')->nullable()->after('seller_reply');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_ratings', function (Blueprint $table) {
            $table->dropColumn(['seller_reply', 'seller_replied_at']);
        });
    }
};
