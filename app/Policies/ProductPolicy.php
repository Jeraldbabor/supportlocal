<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('seller') || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        // Admins can view any product, sellers can only view their own
        return $user->hasRole('administrator') || 
               ($user->hasRole('seller') && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('seller');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        // Admins can update any product, sellers can only update their own
        return $user->hasRole('administrator') || 
               ($user->hasRole('seller') && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        // Admins can delete any product, sellers can only delete their own
        return $user->hasRole('administrator') || 
               ($user->hasRole('seller') && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->hasRole('administrator') || 
               ($user->hasRole('seller') && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can publish/unpublish the model.
     */
    public function publish(User $user, Product $product): bool
    {
        return $user->hasRole('administrator') || 
               ($user->hasRole('seller') && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can feature the model.
     */
    public function feature(User $user, Product $product): bool
    {
        // Only admins can feature products
        return $user->hasRole('administrator');
    }
}
