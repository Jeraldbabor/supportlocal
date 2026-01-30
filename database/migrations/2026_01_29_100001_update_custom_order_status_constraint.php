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
        // For PostgreSQL, we need to update the CHECK constraint
        if (DB::connection()->getDriverName() === 'pgsql') {
            // Drop the existing check constraint
            DB::statement('ALTER TABLE custom_order_requests DROP CONSTRAINT IF EXISTS custom_order_requests_status_check');

            // Add the new check constraint with 'open' status included
            DB::statement("ALTER TABLE custom_order_requests ADD CONSTRAINT custom_order_requests_status_check CHECK (status::text = ANY (ARRAY['open'::character varying, 'pending'::character varying, 'quoted'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'declined'::character varying, 'in_progress'::character varying, 'ready_for_checkout'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[]))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            // Drop the updated constraint
            DB::statement('ALTER TABLE custom_order_requests DROP CONSTRAINT IF EXISTS custom_order_requests_status_check');

            // Re-add the original constraint without 'open'
            DB::statement("ALTER TABLE custom_order_requests ADD CONSTRAINT custom_order_requests_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying, 'quoted'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'declined'::character varying, 'in_progress'::character varying, 'ready_for_checkout'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[]))");
        }
    }
};
