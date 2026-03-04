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
            // Use the public R2 URL directly (not the S3 API endpoint)
            $r2PublicUrl = config('filesystems.disks.r2.url');
            if ($r2PublicUrl) {
                return rtrim($r2PublicUrl, '/').'/'.ltrim($path, '/');
            }

            // Fallback to Storage URL if no public URL configured
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
        if (empty($paths)) {
            return null;
        }

        return array_map(function ($path) {
            return self::url($path);
        }, $paths);
    }

    /**
     * Store an uploaded file and optimize it for web delivery
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $folder  Folder name (e.g., 'products', 'avatars')
     * @return string|false The stored path or false on failure
     */
    public static function store($file, string $folder): string|false
    {
        try {
            // Check if the file is an image by mime type
            $mime = $file->getMimeType();
            $isImage = str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml';

            $disk = self::getDisk();

            if ($isImage) {
                if (! class_exists('\Intervention\Image\Drivers\Gd\Driver')) {
                    Log::warning('Intervention GD Driver not found, falling back to vanilla upload');

                    return $file->store($folder, $disk);
                }

                // Initialize Intervention Image
                $manager = new \Intervention\Image\ImageManager(
                    new \Intervention\Image\Drivers\Gd\Driver
                );

                // Read the uploaded image
                $image = $manager->read($file->getRealPath());

                // Resize if larger than 1200px (scaling down proportionally)
                if ($image->width() > 1200 || $image->height() > 1200) {
                    $image->scaleDown(width: 1200, height: 1200);
                }

                // Convert to WebP format with 80% quality to dramatically reduce size
                $encodedImage = $image->toWebp(quality: 80);

                // Generate a unique filename with .webp extension
                $filename = \Illuminate\Support\Str::uuid().'.webp';
                $path = $folder.'/'.$filename;

                // Store the optimized image with proper Content-Type and Cache-Control headers
                $options = [
                    'visibility' => 'public',
                    'ContentType' => 'image/webp',
                    'CacheControl' => 'max-age=31536000, public', // Cache for 1 year
                ];

                Storage::disk($disk)->put($path, $encodedImage->toString(), $options);

                return $path;
            } else {
                // For non-images (or SVGs), just use default storage but still add Cache-Control
                $path = $file->store($folder, $disk);

                // If storing to R2, try to update metadata directly using S3 client
                if ($disk === 'r2' && $path) {
                    try {
                        // Check if S3 driver supports getClient
                        $diskInstance = Storage::disk('r2');
                        if (method_exists($diskInstance, 'getClient')) {
                            $s3Client = $diskInstance->getClient();
                            $bucket = config('filesystems.disks.r2.bucket');

                            if ($bucket && $s3Client) {
                                $s3Client->copyObject([
                                    'Bucket' => $bucket,
                                    'Key' => $path,
                                    'CopySource' => "{$bucket}/{$path}",
                                    'MetadataDirective' => 'REPLACE',
                                    'CacheControl' => 'max-age=31536000, public',
                                    'ContentType' => $mime,
                                    // Use 'public-read' only if specifically needed, R2 often handles this via bucket policy
                                    'ACL' => 'public-read',
                                ]);
                            }
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Failed to set Cache-Control metadata', ['error' => $e->getMessage()]);
                    }
                }

                return $path;
            }
        } catch (\Throwable $e) {
            Log::error('Failed to store optimized file', ['error' => $e->getMessage(), 'file' => $file->getClientOriginalName()]);

            // Fallback to normal store if intervention fails
            try {
                return $file->store($folder, self::getDisk());
            } catch (\Throwable $fallbackErr) {
                Log::error('Fallback file store also failed', ['error' => $fallbackErr->getMessage()]);

                return false;
            }
        }
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
