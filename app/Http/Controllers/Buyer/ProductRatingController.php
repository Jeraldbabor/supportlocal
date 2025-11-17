<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductRatingController extends Controller
{
    /**
     * Get ratings for a specific product
     */
    public function index(Product $product): JsonResponse
    {
        $ratings = $product->ratings()
            ->with('user:id,name,profile_picture')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
            if (!isset($distribution[$i])) {
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
     * Store a new rating
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        // Check if user already rated this product
        $existingRating = $product->ratings()
            ->where('user_id', auth()->id())
            ->first();

        if ($existingRating) {
            return response()->json([
                'message' => 'You have already rated this product. You can update your existing rating.',
                'error' => 'already_rated',
            ], 422);
        }

        // Create the rating
        $rating = $product->ratings()->create([
            'user_id' => auth()->id(),
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        // Update product's average rating
        $product->updateAverageRating();

        // Load user relationship
        $rating->load('user:id,name,profile_picture');

        return response()->json([
            'message' => 'Rating submitted successfully!',
            'rating' => $rating,
            'product' => [
                'average_rating' => $product->average_rating,
                'review_count' => $product->review_count,
            ],
        ], 201);
    }

    /**
     * Update an existing rating
     */
    public function update(Request $request, Product $product, ProductRating $rating): JsonResponse
    {
        // Ensure user owns this rating
        if ($rating->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure rating belongs to this product
        if ($rating->product_id !== $product->id) {
            return response()->json([
                'message' => 'Rating does not belong to this product',
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

        // Update product's average rating
        $product->updateAverageRating();

        // Load user relationship
        $rating->load('user:id,name,profile_picture');

        return response()->json([
            'message' => 'Rating updated successfully!',
            'rating' => $rating,
            'product' => [
                'average_rating' => $product->average_rating,
                'review_count' => $product->review_count,
            ],
        ]);
    }

    /**
     * Delete a rating
     */
    public function destroy(Product $product, ProductRating $rating): JsonResponse
    {
        // Ensure user owns this rating
        if ($rating->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        // Ensure rating belongs to this product
        if ($rating->product_id !== $product->id) {
            return response()->json([
                'message' => 'Rating does not belong to this product',
            ], 404);
        }

        $rating->delete();

        // Update product's average rating
        $product->updateAverageRating();

        return response()->json([
            'message' => 'Rating deleted successfully!',
            'product' => [
                'average_rating' => $product->average_rating,
                'review_count' => $product->review_count,
            ],
        ]);
    }

    /**
     * Get the current user's rating for a product
     */
    public function getUserRating(Product $product): JsonResponse
    {
        $rating = $product->ratings()
            ->where('user_id', auth()->id())
            ->first();

        return response()->json([
            'rating' => $rating,
        ]);
    }
}
