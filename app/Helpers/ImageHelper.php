<?php

namespace App\Helpers;

class ImageHelper
{
    /**
     * Get the public URL for an image stored in storage/app/public
     * Uses /images/ route which works reliably on Railway without symlinks
     *
     * @param string|null $path The storage path (e.g., 'products/image.jpg')
     * @param string|null $fallback Fallback URL if path is null/empty
     * @return string
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

        // Use /images/ route which serves files directly from storage/app/public
        return '/images/'.$path;
    }

    /**
     * Convert an array of image paths to URLs
     *
     * @param array|null $paths Array of storage paths
     * @return array|null
     */
    public static function urls(?array $paths): ?array
    {
        if (empty($paths) || !is_array($paths)) {
            return null;
        }

        return array_map(function ($path) {
            return self::url($path);
        }, $paths);
    }
}
