<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List all products with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0);

        // Category filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Rating filter
        if ($request->has('min_rating')) {
            $query->where('average_rating', '>=', $request->min_rating);
        }

        // Seller filter
        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('order_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = min($request->get('per_page', 20), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'products' => $products->map(fn ($p) => $this->formatProduct($p)),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'has_more' => $products->hasMorePages(),
            ],
        ]);
    }

    /**
     * Get featured products
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 8), 20);

        $products = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'products' => $products->map(fn ($p) => $this->formatProduct($p)),
        ]);
    }

    /**
     * Get top-rated products
     */
    public function topRated(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 12), 20);

        $products = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where('review_count', '>=', 5)
            ->where('average_rating', '>', 0)
            ->orderBy('average_rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'products' => $products->map(fn ($p) => $this->formatProduct($p)),
        ]);
    }

    /**
     * Get trending products
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 12), 20);

        $products = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where(function ($q) {
                $q->where('view_count', '>', 0)
                    ->orWhere('order_count', '>', 0);
            })
            ->orderByRaw('(view_count * 1 + order_count * 10) DESC')
            ->orderBy('updated_at', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'products' => $products->map(fn ($p) => $this->formatProduct($p)),
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $search = $request->get('q');
        $perPage = min($request->get('per_page', 20), 50);

        $products = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('order_count', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'query' => $search,
            'products' => $products->map(fn ($p) => $this->formatProduct($p)),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'has_more' => $products->hasMorePages(),
            ],
        ]);
    }

    /**
     * Get single product details
     */
    public function show(Product $product): JsonResponse
    {
        if ($product->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $product->load(['seller', 'category', 'ratings' => function ($query) {
            $query->with('user')->latest()->take(5);
        }]);

        // Increment view count
        $product->incrementViewCount();

        return response()->json([
            'success' => true,
            'product' => $this->formatProductDetail($product),
        ]);
    }

    /**
     * Get product ratings
     */
    public function ratings(Product $product, Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 10), 50);

        $ratings = $product->ratings()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'ratings' => $ratings->map(fn ($r) => $this->formatRating($r)),
            'pagination' => [
                'current_page' => $ratings->currentPage(),
                'last_page' => $ratings->lastPage(),
                'per_page' => $ratings->perPage(),
                'total' => $ratings->total(),
            ],
            'average_rating' => $product->average_rating,
            'review_count' => $product->review_count,
        ]);
    }

    /**
     * Store a product rating
     */
    public function storeRating(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        // Check if user has purchased this product (optional)
        // For now, any authenticated user can rate

        // Check if already rated
        if ($product->hasUserRated($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You have already rated this product',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        $rating = ProductRating::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        // Update product average rating
        $product->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
            'rating' => $this->formatRating($rating->load('user')),
        ], 201);
    }

    /**
     * Update a product rating
     */
    public function updateRating(Request $request, Product $product, ProductRating $rating): JsonResponse
    {
        $user = $request->user();

        if ($rating->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        $rating->update($validated);
        $product->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating updated successfully',
            'rating' => $this->formatRating($rating->fresh()->load('user')),
        ]);
    }

    /**
     * Delete a product rating
     */
    public function deleteRating(Request $request, Product $product, ProductRating $rating): JsonResponse
    {
        $user = $request->user();

        if ($rating->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $rating->delete();
        $product->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating deleted successfully',
        ]);
    }

    /**
     * Format product for list view
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
            'formatted_price' => $product->formatted_price,
            'image' => ImageHelper::url($product->featured_image),
            'images' => $product->image_urls,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'seller' => $product->seller ? [
                'id' => $product->seller->id,
                'name' => $product->seller->name,
                'avatar_url' => $product->seller->avatar_url,
            ] : null,
            'rating' => (float) ($product->average_rating ?? 0),
            'review_count' => (int) ($product->review_count ?? 0),
            'stock_status' => $product->stock_status,
            'in_stock' => $product->isInStock(),
            'quantity' => $product->quantity,
        ];
    }

    /**
     * Format product for detail view
     */
    private function formatProductDetail(Product $product): array
    {
        $formatted = $this->formatProduct($product);

        return array_merge($formatted, [
            'description' => $product->description,
            'short_description' => $product->short_description,
            'sku' => $product->sku,
            'condition' => $product->condition,
            'weight' => $product->weight,
            'weight_unit' => $product->weight_unit,
            'shipping_cost' => (float) ($product->shipping_cost ?? 0),
            'free_shipping' => $product->free_shipping ?? false,
            'tags' => $product->tags ?? [],
            'view_count' => $product->view_count,
            'order_count' => $product->order_count,
            'recent_ratings' => $product->ratings->map(fn ($r) => $this->formatRating($r)),
            'seller' => $product->seller ? [
                'id' => $product->seller->id,
                'name' => $product->seller->name,
                'avatar_url' => $product->seller->avatar_url,
                'rating' => (float) ($product->seller->average_rating ?? 0),
                'review_count' => (int) ($product->seller->review_count ?? 0),
                'is_online' => $product->seller->is_online,
            ] : null,
        ]);
    }

    /**
     * Format rating
     */
    private function formatRating(ProductRating $rating): array
    {
        return [
            'id' => $rating->id,
            'rating' => $rating->rating,
            'review' => $rating->review,
            'user' => $rating->user ? [
                'id' => $rating->user->id,
                'name' => $rating->user->name,
                'avatar_url' => $rating->user->avatar_url,
            ] : null,
            'seller_reply' => $rating->seller_reply,
            'seller_replied_at' => $rating->seller_replied_at?->toISOString(),
            'created_at' => $rating->created_at->toISOString(),
        ];
    }
}
