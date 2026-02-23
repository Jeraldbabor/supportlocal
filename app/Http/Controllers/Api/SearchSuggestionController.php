<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchSuggestionController extends Controller
{
    /**
     * Get search suggestions for autocomplete.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'products');

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $results = [];

        if ($type === 'products') {
            $results = $this->getProductSuggestions($query);
        } elseif ($type === 'sellers') {
            $results = $this->getSellerSuggestions($query);
        }

        return response()->json($results);
    }

    /**
     * Get product search suggestions.
     */
    private function getProductSuggestions(string $query): array
    {
        // Get matching products
        $products = Product::where('status', 'active')
            ->where('quantity', '>', 0)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhereHas('seller', function ($sellerQuery) use ($query) {
                        $sellerQuery->where('name', 'like', "%{$query}%");
                    })
                    ->orWhereHas('category', function ($catQuery) use ($query) {
                        $catQuery->where('name', 'like', "%{$query}%");
                    });
            })
            ->with(['seller:id,name', 'category:id,name'])
            ->select('id', 'name', 'price', 'featured_image', 'seller_id', 'category_id')
            ->orderByRaw('
                CASE 
                    WHEN name = ? THEN 0 
                    WHEN name LIKE ? THEN 1 
                    ELSE 2 
                END
            ', [$query, "{$query}%"])
            ->orderBy('order_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'primary_image' => \App\Helpers\ImageHelper::url($product->featured_image),
                    'seller_name' => $product->seller->name ?? null,
                    'category_name' => $product->category->name ?? null,
                ];
            });

        // Get matching categories
        $categories = ProductCategory::where('name', 'like', "%{$query}%")
            ->whereHas('products', function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            })
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }])
            ->orderByRaw('
                CASE 
                    WHEN name = ? THEN 0 
                    WHEN name LIKE ? THEN 1 
                    ELSE 2 
                END
            ', [$query, "{$query}%"])
            ->limit(3)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'products_count' => $category->products_count,
                ];
            });

        // Get matching sellers for product search
        $sellers = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhereHas('sellerApplication', function ($appQuery) use ($query) {
                        $appQuery->where('business_name', 'like', "%{$query}%");
                    });
            })
            ->whereHas('products', function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            })
            ->with('sellerApplication:id,user_id,business_name')
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }])
            ->select('id', 'name', 'profile_picture', 'avatar', 'delivery_city', 'delivery_province')
            ->orderByRaw('
                CASE 
                    WHEN name = ? THEN 0 
                    WHEN name LIKE ? THEN 1 
                    ELSE 2 
                END
            ', [$query, "{$query}%"])
            ->limit(3)
            ->get()
            ->map(function ($seller) {
                $seller->append('avatar_url');
                $location = trim(($seller->delivery_city ?? '').', '.($seller->delivery_province ?? ''), ', ');

                return [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'business_name' => $seller->sellerApplication->business_name ?? null,
                    'profile_image' => $seller->avatar_url,
                    'products_count' => $seller->products_count,
                    'location' => $location ?: null,
                ];
            });

        // Generate keyword suggestions based on popular search patterns
        $keywords = $this->generateKeywordSuggestions($query, 'products');

        return [
            'keywords' => $keywords,
            'categories' => $categories->toArray(),
            'products' => $products->toArray(),
            'sellers' => $sellers->toArray(),
        ];
    }

    /**
     * Get seller search suggestions.
     */
    private function getSellerSuggestions(string $query): array
    {
        // Get matching sellers
        $sellers = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('address', 'like', "%{$query}%")
                    ->orWhereHas('sellerApplication', function ($appQuery) use ($query) {
                        $appQuery->where('business_name', 'like', "%{$query}%")
                            ->orWhere('business_description', 'like', "%{$query}%");
                    });
            })
            ->with('sellerApplication:id,user_id,business_name,status')
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }])
            ->select('id', 'name', 'profile_picture', 'avatar', 'delivery_city', 'delivery_province', 'average_rating')
            ->orderByRaw('
                CASE 
                    WHEN name = ? THEN 0 
                    WHEN name LIKE ? THEN 1 
                    ELSE 2 
                END
            ', [$query, "{$query}%"])
            ->orderBy('average_rating', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($seller) {
                $seller->append('avatar_url');
                $location = trim(($seller->delivery_city ?? '').', '.($seller->delivery_province ?? ''), ', ');

                return [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'business_name' => $seller->sellerApplication->business_name ?? null,
                    'profile_image' => $seller->avatar_url,
                    'products_count' => $seller->products_count,
                    'location' => $location ?: null,
                    'is_verified' => $seller->sellerApplication && $seller->sellerApplication->status === SellerApplication::STATUS_APPROVED,
                ];
            });

        // Generate keyword suggestions for sellers
        $keywords = $this->generateKeywordSuggestions($query, 'sellers');

        return [
            'keywords' => $keywords,
            'sellers' => $sellers->toArray(),
        ];
    }

    /**
     * Generate keyword suggestions based on the search query.
     */
    private function generateKeywordSuggestions(string $query, string $type): array
    {
        $suggestions = [];

        if ($type === 'products') {
            // Get product names that start with the query
            $productNames = Product::where('status', 'active')
                ->where('quantity', '>', 0)
                ->where('name', 'like', "{$query}%")
                ->select('name')
                ->distinct()
                ->limit(5)
                ->pluck('name')
                ->toArray();

            // Extract the first 2-3 words for suggestions
            foreach ($productNames as $name) {
                $words = explode(' ', $name);
                if (count($words) > 2) {
                    $suggestion = implode(' ', array_slice($words, 0, 3));
                    if (! in_array($suggestion, $suggestions) && stripos($suggestion, $query) !== false) {
                        $suggestions[] = $suggestion;
                    }
                }
            }

            // Add category-based suggestions
            $categoryNames = ProductCategory::where('name', 'like', "%{$query}%")
                ->pluck('name')
                ->take(2)
                ->toArray();

            foreach ($categoryNames as $catName) {
                if (! in_array($catName, $suggestions)) {
                    $suggestions[] = $catName;
                }
            }
        } else {
            // Get seller/business names that match
            $businessNames = User::where('role', User::ROLE_SELLER)
                ->where('is_active', true)
                ->whereHas('sellerApplication', function ($q) use ($query) {
                    $q->where('business_name', 'like', "{$query}%");
                })
                ->with('sellerApplication:id,user_id,business_name')
                ->limit(3)
                ->get()
                ->pluck('sellerApplication.business_name')
                ->filter()
                ->toArray();

            foreach ($businessNames as $name) {
                if (! in_array($name, $suggestions)) {
                    $suggestions[] = $name;
                }
            }
        }

        // Limit and return unique suggestions
        return array_slice(array_unique($suggestions), 0, 4);
    }
}
