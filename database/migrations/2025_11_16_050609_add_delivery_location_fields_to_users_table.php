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
            // Add structured location fields for delivery address
            $table->string('delivery_province')->nullable()->after('delivery_address');
            $table->string('delivery_city')->nullable()->after('delivery_province');
            $table->string('delivery_barangay')->nullable()->after('delivery_city');
            $table->string('delivery_street')->nullable()->after('delivery_barangay');
            $table->string('delivery_building_details')->nullable()->after('delivery_street');
            $table->decimal('delivery_latitude', 10, 8)->nullable()->after('delivery_building_details');
            $table->decimal('delivery_longitude', 11, 8)->nullable()->after('delivery_latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_province',
                'delivery_city',
                'delivery_barangay',
                'delivery_street',
                'delivery_building_details',
                'delivery_latitude',
                'delivery_longitude',
            ]);
        });
    }
};
