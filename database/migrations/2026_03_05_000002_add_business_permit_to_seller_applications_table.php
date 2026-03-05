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
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->string('business_permit_type')->nullable()->after('id_document_type');
            $table->string('business_permit_path')->nullable()->after('business_permit_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->dropColumn(['business_permit_type', 'business_permit_path']);
        });
    }
};
