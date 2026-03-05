<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Normalize all image paths in the database.
 *
 * Converts any full URLs that reference old R2 dev domains or the current CDN
 * domain back to clean relative paths (e.g. "products/filename.webp").
 *
 * Also strips "/storage/" prefixes that were incorrectly saved by the
 * mobile Seller ProductController.
 */
return new class extends Migration
{
    /**
     * Domains/prefixes to strip from stored image paths.
     */
    private array $prefixesToStrip = [
        'https://pub-4c16c2cc517348e296766714852055f4.r2.dev/',
        'https://cdn.supportlocal.shop/',
        '/storage/',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ── Single-value VARCHAR/TEXT columns ──────────────────────────
        $singleColumns = [
            ['table' => 'products',           'column' => 'featured_image'],
            ['table' => 'users',              'column' => 'profile_picture'],
            ['table' => 'order_items',        'column' => 'product_image'],
            ['table' => 'orders',             'column' => 'payment_proof'],
            ['table' => 'messages',           'column' => 'image'],
            ['table' => 'product_categories', 'column' => 'icon'],
            ['table' => 'product_categories', 'column' => 'image'],
        ];

        foreach ($singleColumns as $col) {
            $this->fixSingleColumn($col['table'], $col['column']);
        }

        // ── JSON array columns ────────────────────────────────────────
        $this->fixJsonColumn('products', 'images');
        $this->fixJsonColumn('custom_order_requests', 'reference_images');
    }

    /**
     * Fix a single-value column by running REPLACE for each known prefix.
     */
    private function fixSingleColumn(string $table, string $column): void
    {
        if (! \Schema::hasTable($table) || ! \Schema::hasColumn($table, $column)) {
            return;
        }

        foreach ($this->prefixesToStrip as $prefix) {
            $affected = DB::table($table)
                ->where($column, 'like', $prefix.'%')
                ->update([
                    $column => DB::raw("REPLACE(\"{$column}\", ".DB::getPdo()->quote($prefix).", '')"),
                ]);

            if ($affected > 0) {
                Log::info("Normalized {$affected} rows in {$table}.{$column} (stripped '{$prefix}')");
            }
        }
    }

    /**
     * Fix a JSON array column by loading each row, normalizing every element,
     * and writing back the cleaned array.
     */
    private function fixJsonColumn(string $table, string $column): void
    {
        if (! \Schema::hasTable($table) || ! \Schema::hasColumn($table, $column)) {
            return;
        }

        $rows = DB::table($table)
            ->whereNotNull($column)
            ->where(function ($q) use ($column) {
                foreach ($this->prefixesToStrip as $prefix) {
                    $q->orWhere($column, 'like', '%'.$prefix.'%');
                }
            })
            ->get(['id', $column]);

        $fixedCount = 0;

        foreach ($rows as $row) {
            $paths = json_decode($row->$column, true);
            if (! is_array($paths)) {
                continue;
            }

            $changed = false;
            $cleaned = array_map(function ($path) use (&$changed) {
                if (! is_string($path)) {
                    return $path;
                }
                $original = $path;
                foreach ($this->prefixesToStrip as $prefix) {
                    if (str_starts_with($path, $prefix)) {
                        $path = substr($path, strlen($prefix));
                        break;
                    }
                }
                if ($path !== $original) {
                    $changed = true;
                }

                return $path;
            }, $paths);

            if ($changed) {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update([$column => json_encode(array_values($cleaned))]);
                $fixedCount++;
            }
        }

        if ($fixedCount > 0) {
            Log::info("Normalized JSON paths in {$fixedCount} rows of {$table}.{$column}");
        }
    }

    /**
     * Reverse the migrations.
     *
     * This is a data migration — reversing it would require re-saving the old
     * full URLs which is not desirable. The down() is intentionally a no-op.
     */
    public function down(): void
    {
        // No rollback — the old r2.dev URLs should not be restored.
    }
};
