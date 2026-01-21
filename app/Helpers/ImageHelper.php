<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    /**
     * Get the storage disk name to use for uploads
     */
    public static function getDisk(): string
    {
        // Use R2 if configured, otherwise use public (local)
        if (config('filesystems.disks.r2.key')) {
            return 'r2';
        }

        return 'public';
    }

    /**
     * Get the public URL for an image
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

        // If it's already a full URL, return as-is
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        // If it starts with /, convert /storage/ to /images/
        if (str_starts_with($path, '/')) {
            if (str_starts_with($path, '/storage/')) {
                return str_replace('/storage/', '/images/', $path);
            }
            return $path;
        }

        // Check if R2 is configured
        if (config('filesystems.disks.r2.key')) {
            try {
                return Storage::disk('r2')->url($path);
            } catch (\Exception $e) {
                Log::warning('Failed to generate R2 URL', ['path' => $path, 'error' => $e->getMessage()]);
                // Fallback to local
                return '/images/'.$path;
            }
        }

        // Use /images/ route for local storage
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

    /**
     * Store an uploaded file
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $folder  Folder name (e.g., 'products', 'avatars')
     * @return string|false  The stored path or false on failure
     */
    public static function store($file, string $folder): string|false
    {
        return $file->store($folder, self::getDisk());
    }

    /**
     * Delete a file from storage
     *
     * @param  string|null  $path  The file path to delete
     */
    public static function delete(?string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        try {
            return Storage::disk(self::getDisk())->delete($path);
        } catch (\Exception $e) {
            Log::warning('Failed to delete file', ['path' => $path, 'error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Check if a file exists in storage
     *
     * @param  string|null  $path  The file path to check
     */
    public static function exists(?string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        try {
            return Storage::disk(self::getDisk())->exists($path);
        } catch (\Exception $e) {
            return false;
        }
    }
}
