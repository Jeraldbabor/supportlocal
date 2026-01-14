<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerRating;
use App\Notifications\SellerRatingReplyReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerRatingController extends Controller
{
    /**
     * Display seller's own ratings
     */
    public function index(Request $request): Response
    {
        $seller = auth()->user();

        $query = $seller->sellerRatings()
            ->with(['user' => function ($query) {
                $query->select('id', 'name', 'profile_picture');
            }]);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })->orWhere('review', 'like', "%{$search}%");
            });
        }

        if ($request->filled('rating')) {
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

        // Transform ratings to include avatar_url
        $ratings->getCollection()->transform(function ($rating) {
            $rating->user->append('avatar_url');

            return $rating;
        });

        // Get statistics
        $statistics = $this->getSellerStatistics($seller);

        return Inertia::render('seller/ratings/Index', [
            'ratings' => $ratings,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'rating', 'has_reply']),
        ]);
    }

    /**
     * Store seller's reply to a rating
     */
    public function storeReply(Request $request, SellerRating $rating): JsonResponse
    {
        // Verify this rating is for the authenticated seller
        if ($rating->seller_id !== auth()->id()) {
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
        }, 'seller']);
        if ($rating->user) {
            $rating->user->notify(new SellerRatingReplyReceived($rating));
        }

        return response()->json([
            'message' => 'Reply posted successfully!',
            'rating' => $rating,
        ]);
    }

    /**
     * Delete seller's reply to a rating
     */
    public function deleteReply(SellerRating $rating): JsonResponse
    {
        // Verify this rating is for the authenticated seller
        if ($rating->seller_id !== auth()->id()) {
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
     * Get statistics for seller's ratings
     */
    private function getSellerStatistics($seller): array
    {
        $totalRatings = $seller->sellerRatings()->count();
        $averageRating = $seller->average_rating;
        $ratingsWithReview = $seller->sellerRatings()->whereNotNull('review')->count();
        $repliedRatings = $seller->sellerRatings()->whereNotNull('seller_reply')->count();

        // Get rating distribution
        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $seller->sellerRatings()->where('rating', $i)->count();
            $percentage = $totalRatings > 0 ? round(($count / $totalRatings) * 100, 1) : 0;
            $distribution[] = [
                'rating' => $i,
                'count' => $count,
                'percentage' => $percentage,
            ];
        }

        return [
            'total_ratings' => $totalRatings,
            'average_rating' => $averageRating,
            'ratings_with_review' => $ratingsWithReview,
            'replied_ratings' => $repliedRatings,
            'distribution' => $distribution,
        ];
    }
}
