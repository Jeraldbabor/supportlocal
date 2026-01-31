<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SellerRating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    /**
     * List all sellers/artisans
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 50);

        $query = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }])
            ->having('products_count', '>', 0);

        // Sort
        $sortBy = $request->get('sort_by', 'rating');

        switch ($sortBy) {
            case 'products':
                $query->orderBy('products_count', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'rating':
            default:
                $query->orderBy('average_rating', 'desc')
                    ->orderBy('review_count', 'desc');
        }

        $sellers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'sellers' => $sellers->map(fn ($s) => $this->formatSeller($s)),
            'pagination' => [
                'current_page' => $sellers->currentPage(),
                'last_page' => $sellers->lastPage(),
                'per_page' => $sellers->perPage(),
                'total' => $sellers->total(),
                'has_more' => $sellers->hasMorePages(),
            ],
        ]);
    }

    /**
     * Get single seller profile
     */
    public function show(User $seller): JsonResponse
    {
        if ($seller->role !== User::ROLE_SELLER || ! $seller->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Seller not found',
            ], 404);
        }

        $seller->loadCount(['products' => function ($q) {
            $q->where('status', 'active')->where('quantity', '>', 0);
        }]);

        // Get recent ratings
        $recentRatings = $seller->sellerRatings()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'seller' => $this->formatSellerDetail($seller, $recentRatings),
        ]);
    }

    /**
     * Get seller's products
     */
    public function products(Request $request, User $seller): JsonResponse
    {
        if ($seller->role !== User::ROLE_SELLER) {
            return response()->json([
                'success' => false,
                'message' => 'Seller not found',
            ], 404);
        }

        $perPage = min($request->get('per_page', 20), 50);

        $products = Product::with(['category'])
            ->where('seller_id', $seller->id)
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
            ],
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
     * Get seller ratings
     */
    public function ratings(User $seller, Request $request): JsonResponse
    {
        if ($seller->role !== User::ROLE_SELLER) {
            return response()->json([
                'success' => false,
                'message' => 'Seller not found',
            ], 404);
        }

        $perPage = min($request->get('per_page', 10), 50);

        $ratings = $seller->sellerRatings()
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
            'average_rating' => (float) ($seller->average_rating ?? 0),
            'review_count' => (int) ($seller->review_count ?? 0),
        ]);
    }

    /**
     * Store a seller rating
     */
    public function storeRating(Request $request, User $seller): JsonResponse
    {
        if ($seller->role !== User::ROLE_SELLER) {
            return response()->json([
                'success' => false,
                'message' => 'Seller not found',
            ], 404);
        }

        $user = $request->user();

        // Check if already rated
        $existing = SellerRating::where('seller_id', $seller->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already rated this seller',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        $rating = SellerRating::create([
            'seller_id' => $seller->id,
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        // Update seller average rating
        $seller->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
            'rating' => $this->formatRating($rating->load('user')),
        ], 201);
    }

    /**
     * Update a seller rating
     */
    public function updateRating(Request $request, User $seller, SellerRating $rating): JsonResponse
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
        $seller->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating updated successfully',
            'rating' => $this->formatRating($rating->fresh()->load('user')),
        ]);
    }

    /**
     * Delete a seller rating
     */
    public function deleteRating(Request $request, User $seller, SellerRating $rating): JsonResponse
    {
        $user = $request->user();

        if ($rating->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $rating->delete();
        $seller->updateAverageRating();

        return response()->json([
            'success' => true,
            'message' => 'Rating deleted successfully',
        ]);
    }

    /**
     * Format seller for list view
     */
    private function formatSeller(User $seller): array
    {
        return [
            'id' => $seller->id,
            'name' => $seller->name,
            'avatar_url' => $seller->avatar_url,
            'rating' => (float) ($seller->average_rating ?? 0),
            'review_count' => (int) ($seller->review_count ?? 0),
            'products_count' => $seller->products_count ?? 0,
            'is_online' => $seller->is_online,
        ];
    }

    /**
     * Format seller for detail view
     */
    private function formatSellerDetail(User $seller, $recentRatings): array
    {
        return [
            'id' => $seller->id,
            'name' => $seller->name,
            'avatar_url' => $seller->avatar_url,
            'address' => $seller->address,
            'phone_number' => $seller->phone_number,
            'rating' => (float) ($seller->average_rating ?? 0),
            'review_count' => (int) ($seller->review_count ?? 0),
            'products_count' => $seller->products_count ?? 0,
            'is_online' => $seller->is_online,
            'last_seen_at' => $seller->last_seen_at?->toISOString(),
            'member_since' => $seller->created_at->format('F Y'),
            'recent_ratings' => $recentRatings->map(fn ($r) => $this->formatRating($r)),
        ];
    }

    /**
     * Format rating
     */
    private function formatRating(SellerRating $rating): array
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
            'seller_reply' => $rating->seller_reply ?? null,
            'created_at' => $rating->created_at->toISOString(),
        ];
    }

    /**
     * Format product
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
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'rating' => (float) ($product->average_rating ?? 0),
            'review_count' => (int) ($product->review_count ?? 0),
            'in_stock' => $product->isInStock(),
        ];
    }
}
