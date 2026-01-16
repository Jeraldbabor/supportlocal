<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductRating;
use App\Notifications\ProductRatingReplyReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductRatingController extends Controller
{
    /**
     * Display all ratings for seller's products
     */
    public function index(Request $request): Response
    {
        $sellerId = auth()->id();

        // Get filter parameters
        $productId = $request->input('product_id');
        $rating = $request->input('rating');
        $search = $request->input('search');

        // Base query for seller's products
        $query = ProductRating::query()
            ->whereHas('product', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->with(['product:id,name,images', 'user:id,name,profile_picture,avatar']);

        // Apply filters
        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($rating) {
            $query->where('rating', $rating);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('review', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $ratings = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        // Append avatar URLs to user models
        $ratings->getCollection()->transform(function ($rating) {
            if ($rating->user) {
                $rating->user->append('avatar_url');
            }

            return $rating;
        });

        // Get seller's products for filter dropdown
        $sellerProducts = Product::where('seller_id', $sellerId)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get overall statistics
        $statistics = $this->getSellerStatistics($sellerId, $productId);

        return Inertia::render('seller/products/Ratings', [
            'ratings' => $ratings,
            'sellerProducts' => $sellerProducts,
            'statistics' => $statistics,
            'filters' => [
                'product_id' => $productId,
                'rating' => $rating,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display ratings for a specific product
     */
    public function show(Product $product): Response|JsonResponse
    {
        // Ensure the product belongs to the authenticated seller
        if ($product->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this product.');
        }

        $ratings = $product->ratings()
            ->with('user:id,name,profile_picture,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Append avatar URLs to user models
        $ratings->getCollection()->transform(function ($rating) {
            if ($rating->user) {
                $rating->user->append('avatar_url');
            }

            return $rating;
        });

        // Get rating distribution
        $distribution = $product->ratings()
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (! isset($distribution[$i])) {
                $distribution[$i] = 0;
            }
        }

        // Calculate percentage for each rating
        $totalRatings = array_sum($distribution);
        $distributionWithPercentage = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $distribution[$i] ?? 0;
            $distributionWithPercentage[] = [
                'rating' => $i,
                'count' => $count,
                'percentage' => $totalRatings > 0 ? round(($count / $totalRatings) * 100, 1) : 0,
            ];
        }

        return Inertia::render('seller/products/ProductRatings', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'images' => $product->images ? array_map(function ($image) {
                    return \App\Helpers\ImageHelper::url($image);
                }, $product->images) : [],
                'primary_image' => $product->primary_image,
                'average_rating' => $product->average_rating ? (float) $product->average_rating : 0,
                'review_count' => $product->review_count,
            ],
            'ratings' => $ratings,
            'distribution' => $distributionWithPercentage,
            'summary' => [
                'average_rating' => $product->average_rating ? (float) $product->average_rating : 0,
                'total_reviews' => $product->review_count,
                'total_ratings' => $totalRatings,
            ],
        ]);
    }

    /**
     * Get API data for ratings (for AJAX requests)
     */
    public function apiIndex(Request $request, Product $product): JsonResponse
    {
        // Ensure the product belongs to the authenticated seller
        if ($product->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $ratings = $product->ratings()
            ->with('user:id,name,profile_picture,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Append avatar URLs to user models
        $ratings->getCollection()->transform(function ($rating) {
            if ($rating->user) {
                $rating->user->append('avatar_url');
            }

            return $rating;
        });

        // Get rating distribution
        $distribution = $product->ratings()
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (! isset($distribution[$i])) {
                $distribution[$i] = 0;
            }
        }

        return response()->json([
            'ratings' => $ratings,
            'distribution' => $distribution,
            'summary' => [
                'average_rating' => $product->average_rating,
                'total_reviews' => $product->review_count,
            ],
        ]);
    }

    /**
     * Get overall seller rating statistics
     */
    private function getSellerStatistics(int $sellerId, ?int $productId = null): array
    {
        $query = ProductRating::query()
            ->whereHas('product', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            });

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $totalReviews = $query->count();
        $averageRating = $query->avg('rating');

        // Get rating distribution
        $distribution = $query
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings
        for ($i = 1; $i <= 5; $i++) {
            if (! isset($distribution[$i])) {
                $distribution[$i] = 0;
            }
        }

        // Calculate percentages
        $distributionWithPercentage = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $distribution[$i] ?? 0;
            $distributionWithPercentage[] = [
                'rating' => $i,
                'count' => $count,
                'percentage' => $totalReviews > 0 ? round(($count / $totalReviews) * 100, 1) : 0,
            ];
        }

        // Get recent reviews count (last 30 days)
        $recentReviewsCount = ProductRating::query()
            ->whereHas('product', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => $averageRating ? round($averageRating, 1) : 0,
            'distribution' => $distributionWithPercentage,
            'recent_reviews_count' => $recentReviewsCount,
        ];
    }

    /**
     * Store or update seller reply to a rating
     */
    public function storeReply(Request $request, Product $product, ProductRating $rating): JsonResponse
    {
        // Ensure the product belongs to the authenticated seller
        if ($product->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure the rating belongs to the product
        if ($rating->product_id !== $product->id) {
            return response()->json([
                'message' => 'Rating does not belong to this product',
            ], 404);
        }

        $validated = $request->validate([
            'seller_reply' => ['required', 'string', 'max:1000'],
        ]);

        $rating->update([
            'seller_reply' => $validated['seller_reply'],
            'seller_replied_at' => now(),
        ]);

        // Reload with user relationship
        $rating->load('user:id,name,profile_picture,avatar');

        // Append avatar URL
        if ($rating->user) {
            $rating->user->append('avatar_url');
        }

        // Notify the buyer who left the rating
        $rating->load('product.seller');
        if ($rating->user) {
            $rating->user->notify(new ProductRatingReplyReceived($rating));
        }

        return response()->json([
            'message' => 'Reply posted successfully!',
            'rating' => $rating,
        ]);
    }

    /**
     * Delete seller reply from a rating
     */
    public function deleteReply(Product $product, ProductRating $rating): JsonResponse
    {
        // Ensure the product belongs to the authenticated seller
        if ($product->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure the rating belongs to the product
        if ($rating->product_id !== $product->id) {
            return response()->json([
                'message' => 'Rating does not belong to this product',
            ], 404);
        }

        $rating->update([
            'seller_reply' => null,
            'seller_replied_at' => null,
        ]);

        return response()->json([
            'message' => 'Reply deleted successfully!',
        ]);
    }
}
