<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = min($request->get('per_page', 20), 50);

        $wishlistItems = WishlistItem::with(['product.seller', 'product.category'])
            ->where('user_id', $user->id)
            ->whereHas('product', function ($query) {
                $query->where('status', 'active');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'products' => $wishlistItems->map(function ($item) {
                return $this->formatWishlistProduct($item->product);
            }),
            'pagination' => [
                'current_page' => $wishlistItems->currentPage(),
                'last_page' => $wishlistItems->lastPage(),
                'per_page' => $wishlistItems->perPage(),
                'total' => $wishlistItems->total(),
                'has_more' => $wishlistItems->hasMorePages(),
            ],
        ]);
    }

    /**
     * Toggle product in wishlist (add if not exists, remove if exists)
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $user = $request->user();
        $productId = $validated['product_id'];

        $existing = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            $inWishlist = false;
            $message = 'Removed from wishlist';
        } else {
            WishlistItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
            ]);
            $inWishlist = true;
            $message = 'Added to wishlist';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'in_wishlist' => $inWishlist,
            'wishlist_count' => WishlistItem::where('user_id', $user->id)->count(),
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $user = $request->user();

        // Check if already in wishlist
        $existing = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in wishlist',
            ], 422);
        }

        WishlistItem::create([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Added to wishlist',
            'wishlist_count' => WishlistItem::where('user_id', $user->id)->count(),
        ]);
    }

    /**
     * Remove product from wishlist
     */
    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
        ]);

        $user = $request->user();

        $deleted = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => $deleted ? 'Removed from wishlist' : 'Product not in wishlist',
            'wishlist_count' => WishlistItem::where('user_id', $user->id)->count(),
        ]);
    }

    /**
     * Clear entire wishlist
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();

        WishlistItem::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist cleared',
            'wishlist_count' => 0,
        ]);
    }

    /**
     * Format wishlist product
     */
    private function formatWishlistProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
            'formatted_price' => $product->formatted_price,
            'image' => ImageHelper::url($product->featured_image),
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'seller' => $product->seller ? [
                'id' => $product->seller->id,
                'name' => $product->seller->name,
            ] : null,
            'rating' => (float) ($product->average_rating ?? 0),
            'review_count' => (int) ($product->review_count ?? 0),
            'in_stock' => $product->isInStock(),
            'quantity' => $product->quantity,
        ];
    }
}
