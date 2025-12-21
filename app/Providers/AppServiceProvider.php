<?php

namespace App\Providers;

use App\Listeners\MergeGuestWishlist;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
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
        // Merge guest wishlist when user logs in
        Event::listen(
            Login::class,
            MergeGuestWishlist::class
        );
    }
}
