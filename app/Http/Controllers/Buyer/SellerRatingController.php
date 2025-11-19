<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\SellerRating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerRatingController extends Controller
{
    /**
     * Get ratings for a specific seller
     */
    public function index(User $seller): JsonResponse
    {
        $ratings = $seller->sellerRatings()
            ->with('user:id,name,profile_picture')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Get rating distribution
        $distribution = $seller->sellerRatings()
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (!isset($distribution[$i])) {
                $distribution[$i] = 0;
            }
        }

        return response()->json([
            'ratings' => $ratings,
            'distribution' => $distribution,
            'summary' => [
                'average_rating' => $seller->average_rating,
                'total_reviews' => $seller->review_count,
            ],
        ]);
    }

    /**
     * Store a new rating for a seller
     */
    public function store(Request $request, User $seller): JsonResponse
    {
        // Ensure the user is rating a seller
        if (!$seller->isSeller()) {
            return response()->json([
                'message' => 'This user is not a seller.',
            ], 400);
        }

        // Prevent users from rating themselves
        if ($seller->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot rate yourself.',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        // Check if user already rated this seller
        $existingRating = $seller->sellerRatings()
            ->where('user_id', auth()->id())
            ->first();

        if ($existingRating) {
            return response()->json([
                'message' => 'You have already rated this seller. You can update your existing rating.',
                'error' => 'already_rated',
            ], 422);
        }

        // Create the rating
        $rating = $seller->sellerRatings()->create([
            'user_id' => auth()->id(),
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        // Update seller's average rating
        $seller->updateAverageRating();
        $seller->refresh();

        // Load user relationship
        $rating->load('user:id,name,profile_picture');

        return response()->json([
            'message' => 'Rating submitted successfully!',
            'rating' => $rating,
            'seller' => [
                'average_rating' => $seller->average_rating,
                'review_count' => $seller->review_count,
            ],
        ], 201);
    }

    /**
     * Update an existing rating
     */
    public function update(Request $request, User $seller, SellerRating $rating): JsonResponse
    {
        // Ensure user owns this rating
        if ($rating->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure rating belongs to this seller
        if ($rating->seller_id !== $seller->id) {
            return response()->json([
                'message' => 'Rating does not belong to this seller',
            ], 404);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        $rating->update([
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        // Update seller's average rating
        $seller->updateAverageRating();
        $seller->refresh();

        // Load user relationship
        $rating->load('user:id,name,profile_picture');

        return response()->json([
            'message' => 'Rating updated successfully!',
            'rating' => $rating,
            'seller' => [
                'average_rating' => $seller->average_rating,
                'review_count' => $seller->review_count,
            ],
        ]);
    }

    /**
     * Delete a rating
     */
    public function destroy(User $seller, SellerRating $rating): JsonResponse
    {
        // Ensure user owns this rating
        if ($rating->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure rating belongs to this seller
        if ($rating->seller_id !== $seller->id) {
            return response()->json([
                'message' => 'Rating does not belong to this seller',
            ], 404);
        }

        $rating->delete();

        // Update seller's average rating
        $seller->updateAverageRating();
        $seller->refresh();

        return response()->json([
            'message' => 'Rating deleted successfully!',
            'seller' => [
                'average_rating' => $seller->average_rating,
                'review_count' => $seller->review_count,
            ],
        ]);
    }

    /**
     * Get the current user's rating for a seller
     */
    public function getUserRating(User $seller): JsonResponse
    {
        $rating = $seller->sellerRatings()
            ->where('user_id', auth()->id())
            ->first();

        return response()->json([
            'rating' => $rating,
        ]);
    }
}
