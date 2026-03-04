<?php

namespace App\Http\Controllers\Buyer;

use App\Helpers\WishlistHelper;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of all active products for buyers.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0);

        // Filter by category (by ID)
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('category', function ($catQuery) use ($search) {
                        $catQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Price range filtering
        if ($request->filled('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by location (shipped from)
        if ($request->filled('location')) {
            $location = $request->location;
            if ($location === 'domestic') {
                $query->whereHas('seller', function ($q) {
                    $q->where(function ($subQ) {
                        $subQ->whereNotNull('delivery_city')
                            ->orWhereNotNull('delivery_province');
                    });
                });
            } elseif ($location === 'metro_manila') {
                $query->whereHas('seller', function ($q) {
                    $q->where(function ($subQ) {
                        $subQ->where('delivery_city', 'like', '%Manila%')
                            ->orWhere('delivery_province', 'like', '%Metro Manila%')
                            ->orWhere('delivery_province', 'like', '%NCR%');
                    });
                });
            } elseif ($location === 'north_luzon') {
                $query->whereHas('seller', function ($q) {
                    $q->whereIn('delivery_province', [
                        'Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan',
                        'Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino',
                        'Abra', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province', 'Apayao',
                        'Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales',
                    ]);
                });
            } else {
                $query->whereHas('seller', function ($q) use ($location) {
                    $q->where(function ($subQ) use ($location) {
                        $subQ->where('delivery_city', 'like', "%{$location}%")
                            ->orWhere('delivery_province', 'like', "%{$location}%");
                    });
                });
            }
        }

        // Filter by seller/brand
        if ($request->filled('seller')) {
            $query->where('seller_id', $request->seller);
        }

        // Filter by free shipping
        if ($request->filled('free_shipping') && $request->free_shipping === 'true') {
            $query->where('free_shipping', true);
        }

        // Filter by COD (sellers that accept COD)
        if ($request->filled('cod') && $request->cod === 'true') {
            $query->whereHas('seller', function ($q) {
                $q->whereNotNull('gcash_number');
            });
        }

        // Filter by minimum rating
        if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
            $minRating = (float) $request->min_rating;
            $query->where('average_rating', '>=', $minRating)
                ->where('review_count', '>', 0); // Only show products with at least one review
        }

        // Sorting
        $sortBy = $request->get('sort', 'popular');
        $monthStart = Carbon::now()->startOfMonth();

        switch ($sortBy) {
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderByRaw('(COALESCE(view_count, 0) * 0.1 + COALESCE(order_count, 0) * 10 + COALESCE(average_rating, 0) * 100) DESC')
                    ->orderByDesc('created_at');
                break;
            case 'latest':
            case 'newest':
                $query->latest();
                break;
            case 'top_sales':
            case 'sales':
                $monthlySalesSubquery = OrderItem::whereHas('order', function ($q) use ($monthStart) {
                    $q->where('status', \App\Models\Order::STATUS_COMPLETED)
                        ->where('created_at', '>=', $monthStart);
                })
                    ->select('product_id', DB::raw('SUM(quantity) as monthly_sales'))
                    ->groupBy('product_id');

                $query->leftJoinSub($monthlySalesSubquery, 'monthly_sales_data', function ($join) {
                    $join->on('products.id', '=', 'monthly_sales_data.product_id');
                })
                    ->select('products.*')
                    ->orderByRaw('COALESCE(monthly_sales_data.monthly_sales, 0) DESC')
                    ->orderByDesc('products.order_count')
                    ->orderByDesc('products.average_rating')
                    ->orderByDesc('products.view_count');
                break;
            case 'rating':
                $query->where('review_count', '>', 0)
                    ->orderByDesc('average_rating')
                    ->orderByDesc('review_count');
                break;
            case 'name':
            default:
                $query->orderBy('name', 'asc');
                break;
        }

        // Calculate monthly sales for all products (for display in product cards)
        // Calculate monthly sales with eager loading to prevent N+1
        $monthlySales = OrderItem::whereHas('order', function ($q) use ($monthStart) {
            $q->where('status', \App\Models\Order::STATUS_COMPLETED)
                ->where('created_at', '>=', $monthStart);
        })
            ->select('product_id', DB::raw('SUM(quantity) as monthly_sales'))
            ->groupBy('product_id')
            ->pluck('monthly_sales', 'product_id');

        $products = $query->paginate(12)->withQueryString()->through(function ($product) use ($monthlySales) {
            $imageUrl = \App\Helpers\ImageHelper::url($product->featured_image);

            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                'primary_image' => $imageUrl,
                'image' => $imageUrl,
                'average_rating' => $product->average_rating ? (float) $product->average_rating : null,
                'review_count' => $product->review_count ?? 0,
                'order_count' => (int) ($product->order_count ?? 0),
                'monthly_sales' => (int) ($monthlySales[$product->id] ?? 0),
                'view_count' => (int) ($product->view_count ?? 0),
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'stock_quantity' => $product->quantity,
                'stock_status' => $product->quantity > 10 ? 'in_stock' : ($product->quantity > 0 ? 'low_stock' : 'out_of_stock'),
                'free_shipping' => (bool) ($product->free_shipping ?? false),
                'seller' => [
                    'id' => $product->seller->id ?? 0,
                    'name' => $product->seller->name ?? 'Unknown Artisan',
                    'avatar_url' => $product->seller->avatar_url ?? null,
                ],
                'location' => $product->seller ?
                    trim(($product->seller->delivery_city ?? '').', '.($product->seller->delivery_province ?? ''), ', ')
                    : null,
            ];
        });

        // Get all categories for filtering
        $categories = ProductCategory::whereHas('products', function ($q) {
            $q->where('status', 'active')->where('quantity', '>', 0);
        })->orderBy('name')->get();

        // Get unique sellers/brands for filtering
        $sellers = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get unique locations for filtering
        $locations = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            })
            ->where(function ($q) {
                $q->whereNotNull('delivery_city')
                    ->orWhereNotNull('delivery_province');
            })
            ->select('delivery_city', 'delivery_province')
            ->distinct()
            ->get()
            ->map(function ($user) {
                return trim(($user->delivery_city ?? '').', '.($user->delivery_province ?? ''), ', ');
            })
            ->filter()
            ->unique()
            ->sort()
            ->values();

        // Get wishlist product IDs
        $wishlistProductIds = WishlistHelper::getProductIds();

        return Inertia::render('buyer/products/Index', [
            'products' => $products,
            'categories' => $categories,
            'sellers' => $sellers,
            'locations' => $locations,
            'wishlistProductIds' => $wishlistProductIds,
            'filters' => array_merge([
                'category' => null,
                'search' => null,
                'min_price' => null,
                'max_price' => null,
                'location' => null,
                'seller' => null,
                'free_shipping' => null,
                'cod' => null,
                'min_rating' => null,
                'sort' => 'popular',
            ], $request->only(['category', 'search', 'min_price', 'max_price', 'location', 'seller', 'free_shipping', 'cod', 'min_rating', 'sort'])),
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

        // Get ratings with user information (limited to first 5, frontend can load more)
        // Eager load user relationship to prevent N+1 queries
        $ratings = $product->ratings()
            ->with(['user:id,name,profile_picture,avatar'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Check if current user has rated this product
        // Eager load user relationship to prevent N+1 query
        $userRating = null;
        if (auth()->check()) {
            $userRating = $product->ratings()
                ->with('user:id,name,profile_picture,avatar')
                ->where('user_id', auth()->id())
                ->first();
        }

        // Check if product is in wishlist
        $inWishlist = WishlistHelper::hasProduct($product->id);

        return Inertia::render('buyer/products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'similarProducts' => $similarProducts,
            'ratings' => $ratings,
            'inWishlist' => $inWishlist,
            'userRating' => $userRating,
        ]);
    }
}
