<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Skip for SQLite as it doesn't support ALTER TABLE DROP CONSTRAINT
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // For PostgreSQL, we need to drop the existing check constraint and recreate it
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');

        // Recreate the constraint with the new values including 'completed'
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Skip for SQLite as it doesn't support ALTER TABLE DROP CONSTRAINT
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Drop the updated constraint
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');

        // Recreate the original constraint without 'completed'
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))");
    }
};
