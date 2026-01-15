<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup {--retention=7 : Number of days to keep backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting database backup...');

        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");

        try {
            if ($driver === 'sqlite') {
                $this->backupSqlite($connection);
            } elseif ($driver === 'mysql') {
                $this->backupMysql($connection);
            } elseif ($driver === 'pgsql') {
                $this->backupPostgres($connection);
            } else {
                $this->error("Database driver '{$driver}' is not supported for backups.");

                return Command::FAILURE;
            }

            // Clean up old backups
            $this->cleanupOldBackups((int) $this->option('retention'));

            $this->info('Database backup completed successfully!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Database backup failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    /**
     * Backup SQLite database.
     */
    private function backupSqlite(string $connection): void
    {
        $database = config("database.connections.{$connection}.database");
        $backupPath = storage_path('app/backups');

        if (! is_dir($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $timestamp = Carbon::now()->format('Y-m-d_His');
        $backupFile = $backupPath.'/database_'.$timestamp.'.sqlite';

        if (file_exists($database)) {
            copy($database, $backupFile);
            $this->info("SQLite backup created: {$backupFile}");
        } else {
            throw new \Exception("Database file not found: {$database}");
        }
    }

    /**
     * Backup MySQL database.
     */
    private function backupMysql(string $connection): void
    {
        $host = config("database.connections.{$connection}.host");
        $port = config("database.connections.{$connection}.port");
        $database = config("database.connections.{$connection}.database");
        $username = config("database.connections.{$connection}.username");
        $password = config("database.connections.{$connection}.password");

        $backupPath = storage_path('app/backups');

        if (! is_dir($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $timestamp = Carbon::now()->format('Y-m-d_His');
        $backupFile = $backupPath.'/database_'.$timestamp.'.sql';

        // Check if mysqldump is available
        $mysqldump = $this->findMysqldump();

        if (! $mysqldump) {
            throw new \Exception('mysqldump command not found. Please install MySQL client tools.');
        }

        $command = sprintf(
            '%s -h%s -P%s -u%s %s %s > %s',
            escapeshellarg($mysqldump),
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            $password ? '-p'.escapeshellarg($password) : '',
            escapeshellarg($database),
            escapeshellarg($backupFile)
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception('mysqldump failed with return code: '.$returnVar);
        }

        if (! file_exists($backupFile) || filesize($backupFile) === 0) {
            throw new \Exception('Backup file was not created or is empty.');
        }

        // Compress the backup
        $this->compressBackup($backupFile);

        $this->info("MySQL backup created: {$backupFile}");
    }

    /**
     * Backup PostgreSQL database.
     */
    private function backupPostgres(string $connection): void
    {
        $host = config("database.connections.{$connection}.host");
        $port = config("database.connections.{$connection}.port");
        $database = config("database.connections.{$connection}.database");
        $username = config("database.connections.{$connection}.username");
        $password = config("database.connections.{$connection}.password");

        $backupPath = storage_path('app/backups');

        if (! is_dir($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $timestamp = Carbon::now()->format('Y-m-d_His');
        $backupFile = $backupPath.'/database_'.$timestamp.'.sql';

        // Check if pg_dump is available
        $pgdump = $this->findPgDump();

        if (! $pgdump) {
            throw new \Exception('pg_dump command not found. Please install PostgreSQL client tools.');
        }

        // Set password via environment variable
        putenv("PGPASSWORD={$password}");

        $command = sprintf(
            '%s -h %s -p %s -U %s -d %s -f %s',
            escapeshellarg($pgdump),
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($database),
            escapeshellarg($backupFile)
        );

        exec($command, $output, $returnVar);

        // Clear password from environment
        putenv('PGPASSWORD=');

        if ($returnVar !== 0) {
            throw new \Exception('pg_dump failed with return code: '.$returnVar);
        }

        if (! file_exists($backupFile) || filesize($backupFile) === 0) {
            throw new \Exception('Backup file was not created or is empty.');
        }

        // Compress the backup
        $this->compressBackup($backupFile);

        $this->info("PostgreSQL backup created: {$backupFile}");
    }

    /**
     * Find mysqldump executable.
     */
    private function findMysqldump(): ?string
    {
        $paths = [
            '/usr/bin/mysqldump',
            '/usr/local/bin/mysqldump',
            'mysqldump',
        ];

        foreach ($paths as $path) {
            if ($this->commandExists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Find pg_dump executable.
     */
    private function findPgDump(): ?string
    {
        $paths = [
            '/usr/bin/pg_dump',
            '/usr/local/bin/pg_dump',
            'pg_dump',
        ];

        foreach ($paths as $path) {
            if ($this->commandExists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Check if a command exists.
     */
    private function commandExists(string $command): bool
    {
        $whereIsCommand = (PHP_OS === 'WINNT') ? 'where' : 'which';

        $process = proc_open(
            "{$whereIsCommand} {$command}",
            [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ],
            $pipes
        );

        if ($process !== false) {
            $stdout = stream_get_contents($pipes[1]);
            $returnCode = proc_close($process);

            return $returnCode === 0 && ! empty($stdout);
        }

        return false;
    }

    /**
     * Compress backup file.
     */
    private function compressBackup(string $backupFile): void
    {
        if (! function_exists('gzencode')) {
            return;
        }

        $compressedFile = $backupFile.'.gz';
        $data = file_get_contents($backupFile);
        $compressed = gzencode($data, 9);

        if ($compressed !== false) {
            file_put_contents($compressedFile, $compressed);
            unlink($backupFile); // Remove uncompressed file
            $this->info("Backup compressed: {$compressedFile}");
        }
    }

    /**
     * Clean up old backup files.
     */
    private function cleanupOldBackups(int $retentionDays): void
    {
        $backupPath = storage_path('app/backups');

        if (! is_dir($backupPath)) {
            return;
        }

        $files = glob($backupPath.'/database_*.{sql,sqlite,sql.gz,sqlite.gz}', GLOB_BRACE);
        $cutoffDate = Carbon::now()->subDays($retentionDays);

        $deletedCount = 0;
        foreach ($files as $file) {
            $fileDate = Carbon::createFromTimestamp(filemtime($file));

            if ($fileDate->lt($cutoffDate)) {
                unlink($file);
                $deletedCount++;
            }
        }

        if ($deletedCount > 0) {
            $this->info("Cleaned up {$deletedCount} old backup(s).");
        }
    }
}
