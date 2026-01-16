<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateImagesToS3 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:migrate-to-s3 {--dry-run : Show what would be migrated without actually migrating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate images from local storage to S3';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if (config('filesystems.default') !== 's3') {
            $this->error('S3 is not configured as the default filesystem disk.');
            $this->info('Set FILESYSTEM_DISK=s3 in your .env file');
            return 1;
        }

        $this->info('Starting image migration to S3...');
        $this->newLine();

        $localFiles = Storage::disk('public')->allFiles();
        $totalFiles = count($localFiles);

        if ($totalFiles === 0) {
            $this->info('No files found in local storage.');
            return 0;
        }

        $this->info("Found {$totalFiles} files to migrate.");
        $this->newLine();

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No files will be migrated');
            $this->newLine();
        }

        $bar = $this->output->createProgressBar($totalFiles);
        $bar->start();

        $migrated = 0;
        $failed = 0;

        foreach ($localFiles as $file) {
            try {
                if (Storage::disk('s3')->exists($file)) {
                    $bar->advance();
                    continue; // Skip if already exists in S3
                }

                if (!$dryRun) {
                    $contents = Storage::disk('public')->get($file);
                    Storage::disk('s3')->put($file, $contents);
                }

                $migrated++;
                $bar->advance();
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Failed to migrate {$file}: {$e->getMessage()}");
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        if ($dryRun) {
            $this->info("Would migrate {$migrated} files.");
        } else {
            $this->info("Successfully migrated {$migrated} files.");
            if ($failed > 0) {
                $this->warn("Failed to migrate {$failed} files.");
            }
        }

        return 0;
    }
}
