<?php

namespace App\Providers;

use App\Listeners\MergeGuestWishlist;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
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

        // Merge guest wishlist when user logs in
        Event::listen(
            Login::class,
            MergeGuestWishlist::class
        );
    }
}
