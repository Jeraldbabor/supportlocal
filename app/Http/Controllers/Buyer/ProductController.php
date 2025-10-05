<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of all active products for buyers.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $category = $request->get('category');
        $seller = $request->get('seller');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        $query = Product::where('status', Product::STATUS_ACTIVE)
            ->with(['category', 'seller']);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        // Apply category filter
        if ($category) {
            $query->where('category_id', $category);
        }

        // Apply seller filter
        if ($seller) {
            $query->where('seller_id', $seller);
        }

        // Apply price range filter
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }

        // Apply sorting
        $validSorts = ['name', 'price', 'created_at', 'average_rating', 'view_count'];
        if (in_array($sort, $validSorts)) {
            $query->orderBy($sort, $direction);
        }

        $products = $query->paginate(12)->withQueryString();

        // Get categories for filter dropdown
        $categories = ProductCategory::active()
            ->whereHas('products', function ($q) {
                $q->where('status', Product::STATUS_ACTIVE);
            })
            ->orderBy('sort_order')
            ->get();

        // Get sellers for filter dropdown
        $sellers = User::where('role', User::ROLE_SELLER)
            ->whereHas('products', function ($q) {
                $q->where('status', Product::STATUS_ACTIVE);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('buyer/products/Index', [
            'products' => $products,
            'categories' => $categories,
            'sellers' => $sellers,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'seller' => $seller,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Display the specified product details.
     */
    public function show(Product $product): Response
    {
        // Only show active products to buyers
        if ($product->status !== Product::STATUS_ACTIVE) {
            abort(404);
        }

        $product->load(['category', 'seller']);
        
        // Increment view count
        $product->increment('view_count');

        // Get related products from the same seller
        $relatedProducts = Product::where('status', Product::STATUS_ACTIVE)
            ->where('seller_id', $product->seller_id)
            ->where('id', '!=', $product->id)
            ->with(['seller', 'category'])
            ->limit(4)
            ->get();

        // Get similar products in the same category
        $similarProducts = Product::where('status', Product::STATUS_ACTIVE)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['seller', 'category'])
            ->limit(4)
            ->get();

        return Inertia::render('buyer/products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'similarProducts' => $similarProducts,
        ]);
    }
}