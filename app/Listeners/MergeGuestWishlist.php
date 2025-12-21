<?php

namespace App\Listeners;

use App\Helpers\WishlistHelper;
use Illuminate\Auth\Events\Login;

class MergeGuestWishlist
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        WishlistHelper::mergeGuestWishlist($event->user->id);
    }
}
