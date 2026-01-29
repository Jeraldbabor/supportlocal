<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add seller_id column if it doesn't exist
        if (! Schema::hasColumn('order_items', 'seller_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('seller_id')->nullable()->after('product_id');
            });
        }

        // Check if product_id column is already nullable (skip if already done)
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        // Get column info to check if already nullable
        $isNullable = false;
        if ($driver === 'pgsql') {
            $result = DB::selectOne("
                SELECT is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'order_items' AND column_name = 'product_id'
            ");
            $isNullable = $result && $result->is_nullable === 'YES';
        } elseif ($driver === 'mysql') {
            $result = DB::selectOne("
                SELECT IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_id'
            ");
            $isNullable = $result && $result->IS_NULLABLE === 'YES';
        } elseif ($driver === 'sqlite') {
            // For SQLite, check the column info
            $columns = DB::select('PRAGMA table_info(order_items)');
            foreach ($columns as $column) {
                if ($column->name === 'product_id') {
                    $isNullable = $column->notnull == 0;
                    break;
                }
            }
        }

        // Only modify if not already nullable
        if (! $isNullable) {
            // Drop foreign key constraint (handle different naming conventions)
            try {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->dropForeign(['product_id']);
                });
            } catch (\Exception $e) {
                // Try alternative constraint name for PostgreSQL
                try {
                    if (Schema::getConnection()->getDriverName() === 'pgsql') {
                        DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
                    }
                } catch (\Exception $e2) {
                    // Constraint might not exist, continue
                }
            }

            // Change product_id to be nullable
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->nullable()->change();
            });

            // Re-add foreign key with SET NULL on delete
            try {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->foreign('product_id')
                        ->references('id')
                        ->on('products')
                        ->onDelete('set null');
                });
            } catch (\Exception $e) {
                // Foreign key might already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('order_items', 'seller_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn('seller_id');
            });
        }

        try {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropForeign(['product_id']);
            });
        } catch (\Exception $e) {
            // Constraint might not exist
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });

        try {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreign('product_id')
                    ->references('id')
                    ->on('products')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Foreign key might already exist
        }
    }
};
