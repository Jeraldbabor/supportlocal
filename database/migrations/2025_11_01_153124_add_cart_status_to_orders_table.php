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

        // Drop the existing constraint
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');

        // Add the new constraint with 'cart' status
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('cart', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed'))");
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

        // Drop the constraint
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');

        // Add back the old constraint without 'cart' status
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed'))");
    }
};
