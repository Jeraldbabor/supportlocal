<?php

namespace App\Helpers;

use App\Models\WishlistItem;
use Illuminate\Support\Str;

class WishlistHelper
{
    /**
     * Get the guest token from session or create a new one.
     */
    public static function getGuestToken(): string
    {
        if (!session()->has('guest_wishlist_token')) {
            session()->put('guest_wishlist_token', Str::uuid()->toString());
        }

        return session('guest_wishlist_token');
    }

    /**
     * Get wishlist items for the current user (guest or authenticated).
     */
    public static function getItems()
    {
        if (auth()->check()) {
            return WishlistItem::forUser(auth()->id())
                ->with(['product.category', 'product.seller'])
                ->get();
        }

        return WishlistItem::forGuest(self::getGuestToken())
            ->with(['product.category', 'product.seller'])
            ->get();
    }

    /**
     * Get count of wishlist items for the current user (guest or authenticated).
     */
    public static function getCount(): int
    {
        if (auth()->check()) {
            return WishlistItem::forUser(auth()->id())->count();
        }

        return WishlistItem::forGuest(self::getGuestToken())->count();
    }

    /**
     * Check if a product is in the wishlist.
     */
    public static function hasProduct(int $productId): bool
    {
        if (auth()->check()) {
            return WishlistItem::forUser(auth()->id())
                ->where('product_id', $productId)
                ->exists();
        }

        return WishlistItem::forGuest(self::getGuestToken())
            ->where('product_id', $productId)
            ->exists();
    }

    /**
     * Add a product to the wishlist.
     */
    public static function addProduct(int $productId): bool
    {
        try {
            if (auth()->check()) {
                WishlistItem::updateOrCreate(
                    [
                        'user_id' => auth()->id(),
                        'product_id' => $productId,
                    ],
                    [
                        'user_id' => auth()->id(),
                        'product_id' => $productId,
                    ]
                );
            } else {
                WishlistItem::updateOrCreate(
                    [
                        'guest_token' => self::getGuestToken(),
                        'product_id' => $productId,
                    ],
                    [
                        'guest_token' => self::getGuestToken(),
                        'product_id' => $productId,
                    ]
                );
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Remove a product from the wishlist.
     */
    public static function removeProduct(int $productId): bool
    {
        try {
            if (auth()->check()) {
                WishlistItem::forUser(auth()->id())
                    ->where('product_id', $productId)
                    ->delete();
            } else {
                WishlistItem::forGuest(self::getGuestToken())
                    ->where('product_id', $productId)
                    ->delete();
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Clear all wishlist items for the current user.
     */
    public static function clear(): bool
    {
        try {
            if (auth()->check()) {
                WishlistItem::forUser(auth()->id())->delete();
            } else {
                WishlistItem::forGuest(self::getGuestToken())->delete();
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Merge guest wishlist items with user account after login.
     */
    public static function mergeGuestWishlist(int $userId): void
    {
        if (!session()->has('guest_wishlist_token')) {
            return;
        }

        $guestToken = session('guest_wishlist_token');
        $guestItems = WishlistItem::forGuest($guestToken)->get();

        foreach ($guestItems as $item) {
            try {
                // Try to add to user's wishlist
                WishlistItem::firstOrCreate([
                    'user_id' => $userId,
                    'product_id' => $item->product_id,
                ]);

                // Delete the guest item
                $item->delete();
            } catch (\Exception $e) {
                // If there's a conflict (product already in user's wishlist), just delete the guest item
                $item->delete();
            }
        }

        // Clear the guest token from session
        session()->forget('guest_wishlist_token');
    }

    /**
     * Get wishlist product IDs for the current user.
     */
    public static function getProductIds(): array
    {
        if (auth()->check()) {
            return WishlistItem::forUser(auth()->id())
                ->pluck('product_id')
                ->toArray();
        }

        return WishlistItem::forGuest(self::getGuestToken())
            ->pluck('product_id')
            ->toArray();
    }
}
