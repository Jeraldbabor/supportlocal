<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List all categories
     */
    public function index(Request $request): JsonResponse
    {
        $withCount = $request->boolean('with_count', true);

        $query = ProductCategory::where('is_active', true)
            ->orderBy('name');

        if ($withCount) {
            $query->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }]);
        }

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'categories' => $categories->map(function ($category) use ($withCount) {
                $data = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'image' => $category->image ? ImageHelper::url($category->image) : null,
                ];

                if ($withCount) {
                    $data['products_count'] = $category->products_count ?? 0;
                }

                return $data;
            }),
        ]);
    }

    /**
     * Get single category details
     */
    public function show(ProductCategory $category): JsonResponse
    {
        if (! $category->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        $category->loadCount(['products' => function ($q) {
            $q->where('status', 'active')->where('quantity', '>', 0);
        }]);

        return response()->json([
            'success' => true,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image ? ImageHelper::url($category->image) : null,
                'products_count' => $category->products_count ?? 0,
            ],
        ]);
    }

    /**
     * Get products in a category
     */
    public function products(Request $request, ProductCategory $category): JsonResponse
    {
        if (! $category->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        $perPage = min($request->get('per_page', 20), 50);

        $query = Product::with(['seller', 'category'])
            ->where('category_id', $category->id)
            ->where('status', 'active')
            ->where('quantity', '>', 0);

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');

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
            default:
                $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
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
     * Format product for response
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
            'seller' => $product->seller ? [
                'id' => $product->seller->id,
                'name' => $product->seller->name,
                'avatar_url' => $product->seller->avatar_url,
            ] : null,
            'rating' => (float) ($product->average_rating ?? 0),
            'review_count' => (int) ($product->review_count ?? 0),
            'in_stock' => $product->isInStock(),
        ];
    }
}
