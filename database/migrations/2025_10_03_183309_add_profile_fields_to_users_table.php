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
        Schema::table('users', function (Blueprint $table) {
            // Personal Information
            $table->string('phone_number')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone_number');
            $table->date('date_of_birth')->nullable()->after('address');
            $table->string('profile_picture')->nullable()->after('date_of_birth');

            // Delivery Information
            $table->text('delivery_address')->nullable()->after('profile_picture');
            $table->string('delivery_phone')->nullable()->after('delivery_address');
            $table->text('delivery_notes')->nullable()->after('delivery_phone');

            // Payment Information
            $table->string('gcash_number')->nullable()->after('delivery_notes');
            $table->string('gcash_name')->nullable()->after('gcash_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone_number',
                'address',
                'date_of_birth',
                'profile_picture',
                'delivery_address',
                'delivery_phone',
                'delivery_notes',
                'gcash_number',
                'gcash_name',
            ]);
        });
    }
};
