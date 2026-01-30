<?php

namespace App\Providers;

use App\Listeners\MergeGuestWishlist;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production or when behind a proxy with HTTPS
        // This fixes mixed content issues where assets are loaded over HTTP
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
            // Also force HTTPS if we detect we're behind a proxy with HTTPS
            URL::forceScheme('https');
        }

        // Ensure storage directories exist and symlink is created
        $this->ensureStorageSetup();

        // Note: Email verification is handled directly in RegisteredUserController
        // to ensure synchronous sending and better error handling.
        // The Registered event is still fired for other listeners but not for email.

        // Merge guest wishlist when user logs in
        Event::listen(
            Login::class,
            MergeGuestWishlist::class
        );
    }

    /**
     * Ensure storage directories exist and symlink is created
     */
    protected function ensureStorageSetup(): void
    {
        // Create storage directories if they don't exist
        $storageDirs = [
            storage_path('app/public'),
            storage_path('app/public/avatars'),
            storage_path('app/public/products'),
            storage_path('app/public/chat-images'),
            storage_path('app/public/payment-proofs'),
        ];

        foreach ($storageDirs as $dir) {
            if (! File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
        }

        // Create storage symlink if it doesn't exist
        $link = public_path('storage');
        $target = storage_path('app/public');

        if (! File::exists($link)) {
            try {
                // Try to create symlink
                if (PHP_OS_FAMILY !== 'Windows') {
                    symlink($target, $link);
                } else {
                    // On Windows, use junction or copy
                    if (function_exists('linkinfo')) {
                        @symlink($target, $link);
                    }
                }
            } catch (\Exception $e) {
                // If symlink fails, log but don't break the app
                // The /images/{path} route will handle serving files
                \Log::warning('Failed to create storage symlink', ['error' => $e->getMessage()]);
            }
        }
    }
}
