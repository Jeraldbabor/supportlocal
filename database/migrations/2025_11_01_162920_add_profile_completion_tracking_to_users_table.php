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
            $table->timestamp('profile_completion_reminder_dismissed_at')->nullable()->after('last_login_at');
            $table->timestamp('profile_completed_at')->nullable()->after('profile_completion_reminder_dismissed_at');
            $table->integer('profile_completion_percentage')->default(0)->after('profile_completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profile_completion_reminder_dismissed_at',
                'profile_completed_at',
                'profile_completion_percentage',
            ]);
        });
    }
};
