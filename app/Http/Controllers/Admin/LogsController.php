<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class LogsController extends Controller
{
    /**
     * Display application logs.
     */
    public function index(Request $request): Response
    {
        $logFile = storage_path('logs/laravel.log');
        $logs = [];
        $totalLines = 0;
        $currentPage = $request->get('page', 1);
        $perPage = 100;
        $filter = $request->get('filter', 'all'); // all, error, warning, info, debug

        if (File::exists($logFile)) {
            $file = new \SplFileObject($logFile);
            $file->seek(PHP_INT_MAX);
            $totalLines = $file->key() + 1;

            // Calculate which lines to read (read from end for pagination)
            $startLine = max(0, $totalLines - ($currentPage * $perPage));
            $endLine = $totalLines - (($currentPage - 1) * $perPage);

            // Read lines in reverse (read last N lines)
            $lines = [];
            $readCount = min($perPage, $totalLines - $startLine);
            if ($readCount > 0) {
                $file->seek($startLine);
                for ($i = 0; $i < $readCount; $i++) {
                    $line = $file->current();
                    if ($line !== false) {
                        $lines[] = trim($line);
                    }
                    $file->next();
                }
            }

            // Parse log entries
            $entries = [];
            $currentEntry = '';

            foreach ($lines as $line) {
                // Check if line starts a new log entry (starts with date)
                if (preg_match('/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/', $line)) {
                    if ($currentEntry) {
                        $parsed = $this->parseLogEntry($currentEntry);
                        if ($this->matchesFilter($parsed, $filter)) {
                            $entries[] = $parsed;
                        }
                    }
                    $currentEntry = $line;
                } else {
                    $currentEntry .= "\n".$line;
                }
            }

            // Add last entry
            if ($currentEntry) {
                $parsed = $this->parseLogEntry($currentEntry);
                if ($this->matchesFilter($parsed, $filter)) {
                    $entries[] = $parsed;
                }
            }

            $logs = array_reverse($entries);
        }

        $totalPages = ceil($totalLines / $perPage);

        // Get log file stats
        $logStats = [
            'file_exists' => File::exists($logFile),
            'file_size' => File::exists($logFile) ? $this->formatBytes(File::size($logFile)) : '0 B',
            'total_lines' => $totalLines,
            'last_modified' => File::exists($logFile) ? File::lastModified($logFile) : null,
        ];

        // Count log levels
        $levelCounts = [
            'error' => 0,
            'warning' => 0,
            'info' => 0,
            'debug' => 0,
            'other' => 0,
        ];

        foreach ($logs as $log) {
            $level = strtolower($log['level'] ?? 'other');
            if (isset($levelCounts[$level])) {
                $levelCounts[$level]++;
            } else {
                $levelCounts['other']++;
            }
        }

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
            'pagination' => [
                'current_page' => $currentPage,
                'per_page' => $perPage,
                'total' => $totalLines,
                'total_pages' => $totalPages,
            ],
            'filters' => [
                'filter' => $filter,
            ],
            'stats' => $logStats,
            'level_counts' => $levelCounts,
        ]);
    }

    /**
     * Parse a log entry.
     */
    private function parseLogEntry(string $entry): array
    {
        $parsed = [
            'raw' => $entry,
            'timestamp' => null,
            'level' => 'info',
            'message' => $entry,
            'context' => null,
            'stack_trace' => null,
        ];

        // Extract timestamp
        if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $entry, $matches)) {
            $parsed['timestamp'] = $matches[1];
        }

        // Extract log level
        if (preg_match('/\.(ERROR|WARNING|INFO|DEBUG|CRITICAL|ALERT|EMERGENCY):/', $entry, $matches)) {
            $parsed['level'] = strtolower($matches[1]);
        } elseif (preg_match('/\b(error|warning|info|debug|critical|alert|emergency)\b/i', $entry, $matches)) {
            $parsed['level'] = strtolower($matches[1]);
        }

        // Extract message (first line after timestamp)
        $lines = explode("\n", $entry);
        if (count($lines) > 1) {
            $parsed['message'] = trim($lines[1] ?? $lines[0]);
        }

        // Extract stack trace
        $stackTraceStart = strpos($entry, 'Stack trace:');
        if ($stackTraceStart !== false) {
            $parsed['stack_trace'] = substr($entry, $stackTraceStart);
            $parsed['message'] = substr($entry, 0, $stackTraceStart);
        }

        return $parsed;
    }

    /**
     * Check if log entry matches filter.
     */
    private function matchesFilter(array $entry, string $filter): bool
    {
        if ($filter === 'all') {
            return true;
        }

        return strtolower($entry['level'] ?? '') === strtolower($filter);
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }

    /**
     * Download log file.
     */
    public function download()
    {
        $logFile = storage_path('logs/laravel.log');

        if (! File::exists($logFile)) {
            abort(404, 'Log file not found');
        }

        return response()->download($logFile, 'laravel-'.date('Y-m-d').'.log');
    }

    /**
     * Clear log file.
     */
    public function clear()
    {
        $logFile = storage_path('logs/laravel.log');

        if (File::exists($logFile)) {
            File::put($logFile, '');
        }

        return back()->with('message', 'Log file cleared successfully.');
    }

    /**
     * View a specific log entry in detail.
     */
    public function show(Request $request)
    {
        $logFile = storage_path('logs/laravel.log');
        $lineNumber = $request->get('line');

        if (! File::exists($logFile) || ! $lineNumber) {
            abort(404);
        }

        $file = new \SplFileObject($logFile);
        $file->seek($lineNumber);
        $entry = $file->current();

        $parsed = $this->parseLogEntry($entry);

        return Inertia::render('admin/logs/show', [
            'log' => $parsed,
            'line_number' => $lineNumber,
        ]);
    }
}
