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

class SellerRatingController extends Controller
{
    /**
     * Display product ratings for seller's products
     */
    public function index(Request $request): Response
    {
        $seller = auth()->user();

        // Query product ratings for this seller's products
        $query = ProductRating::whereHas('product', function ($q) use ($seller) {
            $q->where('seller_id', $seller->id);
        })->with([
            'user' => function ($query) {
                $query->select('id', 'name', 'profile_picture');
            },
            'product' => function ($query) {
                $query->select('id', 'name', 'images', 'featured_image');
            },
        ]);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })->orWhere('review', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('has_reply')) {
            if ($request->has_reply === 'yes') {
                $query->whereNotNull('seller_reply');
            } elseif ($request->has_reply === 'no') {
                $query->whereNull('seller_reply');
            }
        }

        $ratings = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform ratings to include avatar_url and product image
        $ratings->getCollection()->transform(function ($rating) {
            if ($rating->user) {
                $rating->user->append('avatar_url');
            }
            if ($rating->product) {
                $rating->product_name = $rating->product->name;
                $rating->product_image = \App\Helpers\ImageHelper::url($rating->product->featured_image ?? ($rating->product->images[0] ?? null));
            }

            return $rating;
        });

        // Get statistics
        $statistics = $this->getProductRatingStatistics($seller);

        return Inertia::render('seller/ratings/Index', [
            'ratings' => $ratings,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'rating', 'has_reply']),
        ]);
    }

    /**
     * Store seller's reply to a product rating
     */
    public function storeReply(Request $request, ProductRating $rating): JsonResponse
    {
        // Verify this rating is for the authenticated seller's product
        $rating->load('product');
        if (! $rating->product || $rating->product->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:1000'],
        ]);

        $rating->update([
            'seller_reply' => $validated['reply'],
            'seller_replied_at' => now(),
        ]);

        // Notify the buyer who left the rating
        $rating->load(['user' => function ($query) {
            $query->select('id', 'name', 'profile_picture');
        }, 'product.seller']);

        if ($rating->user) {
            $rating->user->notify(new ProductRatingReplyReceived($rating));
        }

        return response()->json([
            'message' => 'Reply posted successfully!',
            'rating' => $rating,
        ]);
    }

    /**
     * Delete seller's reply to a product rating
     */
    public function deleteReply(ProductRating $rating): JsonResponse
    {
        // Verify this rating is for the authenticated seller's product
        $rating->load('product');
        if (! $rating->product || $rating->product->seller_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $rating->update([
            'seller_reply' => null,
            'seller_replied_at' => null,
        ]);

        return response()->json([
            'message' => 'Reply deleted successfully!',
            'rating' => $rating->load(['user' => function ($query) {
                $query->select('id', 'name', 'profile_picture');
            }]),
        ]);
    }

    /**
     * Get statistics for seller's product ratings
     */
    private function getProductRatingStatistics($seller): array
    {
        // Get all product ratings for this seller's products
        $baseQuery = ProductRating::whereHas('product', function ($q) use ($seller) {
            $q->where('seller_id', $seller->id);
        });

        $totalRatings = (clone $baseQuery)->count();
        $averageRating = (clone $baseQuery)->avg('rating') ?? 0;
        $ratingsWithReview = (clone $baseQuery)->whereNotNull('review')->where('review', '!=', '')->count();
        $repliedRatings = (clone $baseQuery)->whereNotNull('seller_reply')->count();

        // Get rating distribution
        $distributionData = (clone $baseQuery)
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $distributionData[$i] ?? 0;
            $percentage = $totalRatings > 0 ? round(($count / $totalRatings) * 100, 1) : 0;
            $distribution[] = [
                'rating' => $i,
                'count' => $count,
                'percentage' => $percentage,
            ];
        }

        return [
            'total_ratings' => $totalRatings,
            'average_rating' => round($averageRating, 1),
            'ratings_with_review' => $ratingsWithReview,
            'replied_ratings' => $repliedRatings,
            'distribution' => $distribution,
        ];
    }
}
