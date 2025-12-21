<?php

namespace App\Http\Controllers;

use App\Helpers\WishlistHelper;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page.
     */
    public function index()
    {
        $items = WishlistHelper::getItems();

        // Transform items to include product details
        $wishlistItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'sale_price' => $item->product->sale_price,
                    'description' => $item->product->description,
                    'short_description' => $item->product->short_description,
                    'image' => $item->product->image ?? null,
                    'primary_image' => $item->product->primary_image,
                    'stock_status' => $item->product->stock_status,
                    'stock_quantity' => $item->product->quantity,
                    'average_rating' => $item->product->average_rating,
                    'review_count' => $item->product->ratings()->count(),
                    'category' => $item->product->category ? [
                        'id' => $item->product->category->id,
                        'name' => $item->product->category->name,
                    ] : null,
                    'seller' => [
                        'id' => $item->product->seller->id,
                        'name' => $item->product->seller->name,
                        'avatar' => $item->product->seller->avatar ?? null,
                    ],
                ],
                'added_at' => $item->created_at->format('F j, Y'),
            ];
        });

        return Inertia::render('Wishlist/Index', [
            'wishlistItems' => $wishlistItems,
            'totalItems' => $items->count(),
        ]);
    }

    /**
     * Add a product to the wishlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is active
        if ($product->status !== Product::STATUS_ACTIVE) {
            return back()->with('error', 'This product is not available.');
        }

        $success = WishlistHelper::addProduct($request->product_id);

        if ($success) {
            return back()->with('success', 'Product added to wishlist!');
        }

        return back()->with('error', 'Failed to add product to wishlist.');
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
        ]);

        $success = WishlistHelper::removeProduct($request->product_id);

        if ($success) {
            return back()->with('success', 'Product removed from wishlist!');
        }

        return back()->with('error', 'Failed to remove product from wishlist.');
    }

    /**
     * Clear all items from the wishlist.
     */
    public function clear()
    {
        $success = WishlistHelper::clear();

        if ($success) {
            return back()->with('success', 'Wishlist cleared!');
        }

        return back()->with('error', 'Failed to clear wishlist.');
    }

    /**
     * Toggle a product in the wishlist (add if not present, remove if present).
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $productId = $request->product_id;

        if (WishlistHelper::hasProduct($productId)) {
            WishlistHelper::removeProduct($productId);

            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist',
                'in_wishlist' => false,
                'count' => WishlistHelper::getCount(),
            ]);
        }

        $product = Product::findOrFail($productId);

        // Check if product is active
        if ($product->status !== Product::STATUS_ACTIVE) {
            return response()->json([
                'success' => false,
                'message' => 'This product is not available',
            ], 400);
        }

        WishlistHelper::addProduct($productId);

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist',
            'in_wishlist' => true,
            'count' => WishlistHelper::getCount(),
        ]);
    }

    /**
     * Get wishlist count.
     */
    public function count()
    {
        return response()->json([
            'count' => WishlistHelper::getCount(),
        ]);
    }

    /**
     * Check if products are in wishlist.
     */
    public function check(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer',
        ]);

        $wishlistProductIds = WishlistHelper::getProductIds();

        $inWishlist = [];
        foreach ($request->product_ids as $productId) {
            $inWishlist[$productId] = in_array($productId, $wishlistProductIds);
        }

        return response()->json([
            'in_wishlist' => $inWishlist,
        ]);
    }
}
