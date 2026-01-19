<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    /**
     * Get the public URL for an image stored in storage/app/public
     * Uses /images/ route which works reliably on Railway without symlinks
     *
     * @param  string|null  $path  The storage path (e.g., 'products/image.jpg')
     * @param  string|null  $fallback  Fallback URL if path is null/empty
     */
    public static function url(?string $path, ?string $fallback = null): string
    {
        // Return fallback if no path provided
        if (empty($path)) {
            return $fallback ?? '/placeholder.jpg';
        }

        // If it's already a full URL or starts with /, return as-is
        if (str_starts_with($path, 'http') || str_starts_with($path, '/')) {
            // If it's a /storage/ path, convert to /images/
            if (str_starts_with($path, '/storage/')) {
                return str_replace('/storage/', '/images/', $path);
            }

            return $path;
        }

        // Check if S3 is configured - if so, use S3 URLs
        // When FILESYSTEM_DISK=s3, files are stored in S3 and URLs should come from S3
        $defaultDisk = config('filesystems.default');
        if ($defaultDisk === 's3') {
            try {
                // Use the 'public' disk which should be configured for S3
                return Storage::disk('public')->url($path);
            } catch (\Exception $e) {
                // Fallback to /images/ if S3 URL generation fails
                Log::warning('Failed to generate S3 URL, falling back to /images/', ['path' => $path, 'error' => $e->getMessage()]);

                return '/images/'.$path;
            }
        }

        // Use /images/ route which serves files directly from storage/app/public
        // This works on Railway without symlinks, but files are lost on redeploy
        // unless Railway Volume is mounted to /app/storage/app/public
        return '/images/'.$path;
    }

    /**
     * Convert an array of image paths to URLs
     *
     * @param  array|null  $paths  Array of storage paths
     */
    public static function urls(?array $paths): ?array
    {
        if (empty($paths) || ! is_array($paths)) {
            return null;
        }

        return array_map(function ($path) {
            return self::url($path);
        }, $paths);
    }
}
