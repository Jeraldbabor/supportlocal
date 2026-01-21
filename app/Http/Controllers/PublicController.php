<?php

namespace App\Http\Controllers;

use App\Helpers\WishlistHelper;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class PublicController extends Controller
{
    /**
     * Display all products for public viewing
     */
    public function products(Request $request)
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
                // All domestic sellers (not overseas)
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
                // Specific city or province
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
                // Popular = combination of views, orders, and ratings
                $query->orderByRaw('(COALESCE(view_count, 0) * 0.1 + COALESCE(order_count, 0) * 10 + COALESCE(average_rating, 0) * 100) DESC')
                    ->orderByDesc('created_at');
                break;
            case 'latest':
            case 'newest':
                $query->latest();
                break;
            case 'top_sales':
            case 'sales':
                // Sort by monthly sales using a subquery, then by order_count
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
        // Using whereHas with eager loading to prevent N+1 queries
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
                'free_shipping' => (bool) ($product->free_shipping ?? false),
                'seller' => [
                    'id' => $product->seller->id ?? 0,
                    'name' => $product->seller->name ?? 'Unknown Artisan',
                ],
                'location' => $product->seller ?
                    trim(($product->seller->delivery_city ?? '').', '.($product->seller->delivery_province ?? ''), ', ')
                    : null,
            ];
        });

        // Get all categories for filtering (only active categories with active products)
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

        // Get wishlist product IDs for current user/guest
        $wishlistProductIds = WishlistHelper::getProductIds();

        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories ?? [],
            'sellers' => $sellers ?? [],
            'locations' => $locations ?? [],
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
     * Display a specific product detail page
     */
    public function productDetail(Request $request, Product $product)
    {
        // Make sure the product is active and available
        if ($product->status !== 'active' || $product->quantity <= 0) {
            abort(404, 'Product not found or unavailable');
        }

        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'price' => (float) $product->price,
            'images' => $product->image_urls ?: ['/placeholder.jpg'],
            'artisan' => $product->seller->name ?? 'Unknown Artisan',
            'artisan_id' => $product->seller_id,
            'artisan_image' => $product->seller->avatar_url,
            'average_rating' => $product->average_rating ? (float) $product->average_rating : null,
            'review_count' => $product->review_count ?? 0,
            'category' => $product->category->name ?? 'Miscellaneous',
            'description' => $product->description,
            'materials' => $product->tags ? $product->tags : ['Handmade', 'Natural materials'],
            'dimensions' => is_array($product->dimensions) ? implode(' x ', $product->dimensions) : 'See product description',
            'care' => 'Handle with care. Clean as needed.',
            'inStock' => $product->quantity > 0,
            'stockCount' => $product->quantity,
            'weight' => $product->weight,
            'sku' => $product->sku,
            'tags' => $product->tags ?? [],
        ];

        // Get related products (same category, different artisan)
        $relatedProducts = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->take(4)
            ->get()
            ->map(function ($relatedProduct) {
                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'price' => (float) $relatedProduct->price,
                    'image' => $relatedProduct->primary_image ?: '/placeholder.jpg',
                    'artisan' => $relatedProduct->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $relatedProduct->seller->avatar_url,
                    'average_rating' => $relatedProduct->average_rating ? (float) $relatedProduct->average_rating : null,
                    'review_count' => $relatedProduct->review_count ?? 0,
                ];
            });

        // Get product reviews with buyer information
        $reviews = $product->ratings()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'review' => $rating->review,
                    'seller_reply' => $rating->seller_reply,
                    'seller_replied_at' => $rating->seller_replied_at ? $rating->seller_replied_at->format('M d, Y') : null,
                    'created_at' => $rating->created_at->format('M d, Y'),
                    'buyer_name' => $rating->user->name ?? 'Anonymous',
                    'buyer_avatar' => $rating->user->profile_picture
                        ? \App\Helpers\ImageHelper::url($rating->user->profile_picture)
                        : 'https://ui-avatars.com/api/?name='.urlencode($rating->user->name ?? 'Anonymous').'&color=7F9CF5&background=EBF4FF',
                ];
            });

        // Check if product is in wishlist
        $inWishlist = WishlistHelper::hasProduct($product->id);

        return Inertia::render('ProductDetail', [
            'inWishlist' => $inWishlist,
            'product' => $productData,
            'relatedProducts' => $relatedProducts,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Display public artisans page
     */
    public function artisans(Request $request)
    {
        $query = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->withCount(['products' => function ($q) {
                $q->where('status', 'active')->where('quantity', '>', 0);
            }]);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Filter by location
        if ($request->filled('location')) {
            $location = $request->location;
            if ($location === 'domestic') {
                $query->where(function ($q) {
                    $q->whereNotNull('delivery_city')
                        ->orWhereNotNull('delivery_province');
                });
            } elseif ($location === 'metro_manila') {
                $query->where(function ($q) {
                    $q->where('delivery_city', 'like', '%Manila%')
                        ->orWhere('delivery_province', 'like', '%Metro Manila%')
                        ->orWhere('delivery_province', 'like', '%NCR%');
                });
            } elseif ($location === 'north_luzon') {
                $query->whereIn('delivery_province', [
                    'Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan',
                    'Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino',
                    'Abra', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province', 'Apayao',
                    'Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales',
                ]);
            } else {
                $query->where(function ($q) use ($location) {
                    $q->where('delivery_city', 'like', "%{$location}%")
                        ->orWhere('delivery_province', 'like', "%{$location}%");
                });
            }
        }

        // Filter by minimum rating
        if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
            $minRating = (float) $request->min_rating;
            $query->where('average_rating', '>=', $minRating)
                ->where('review_count', '>', 0);
        }

        // Filter by minimum products count
        if ($request->filled('min_products') && is_numeric($request->min_products)) {
            $query->havingRaw('products_count >= ?', [$request->min_products]);
        }

        // Verified filter (if field exists)
        if ($request->has('verified') && $request->verified !== null && $request->verified !== '') {
            if (Schema::hasColumn('users', 'is_verified')) {
                $query->where('is_verified', $request->verified === 'true' || $request->verified === true);
            }
        }

        // Sorting
        $sortBy = $request->get('sort', 'popular');

        switch ($sortBy) {
            case 'popular':
                // Popular = combination of rating, products, and sales
                // Use subqueries directly for PostgreSQL compatibility
                $query->orderByRaw('(COALESCE(users.average_rating, 0) * 100 + (SELECT COUNT(*) FROM products WHERE products.seller_id = users.id AND products.status = \'active\' AND products.quantity > 0) * 10 + (SELECT COUNT(*) FROM orders WHERE orders.seller_id = users.id AND orders.status IN (\'completed\', \'delivered\')) * 5) DESC')
                    ->orderByDesc('users.created_at');
                break;
            case 'products_count':
                $query->orderBy('products_count', 'desc');
                break;
            case 'rating':
                if (Schema::hasColumn('users', 'average_rating')) {
                    $query->where('review_count', '>', 0)
                        ->orderBy('average_rating', 'desc')
                        ->orderBy('review_count', 'desc');
                } else {
                    $query->orderBy('name', 'asc');
                }
                break;
            case 'total_sales':
                $query->withCount(['orders' => function ($q) {
                    $q->whereIn('status', ['completed', 'delivered']);
                }])
                    ->orderBy('orders_count', 'desc');
                break;
            case 'latest':
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'name':
            default:
                $query->orderBy('name', 'asc');
                break;
        }

        $artisans = $query->paginate(12)->through(function ($artisan) {
            // Ensure avatar_url is available
            $artisan->append('avatar_url');
            $profileImage = $artisan->profile_picture ?? null;
            $imageUrl = $artisan->avatar_url ?? null;
            if (! $imageUrl || str_contains($imageUrl, 'ui-avatars.com')) {
                // If avatar_url is a default avatar, use it; otherwise generate one
                $imageUrl = $artisan->avatar_url ?? 'https://ui-avatars.com/api/?name='.urlencode($artisan->name).'&color=7F9CF5&background=EBF4FF';
            }

            // Extract location from delivery fields or address
            $location = 'Local Area';
            if ($artisan->delivery_city || $artisan->delivery_province) {
                $location = trim(($artisan->delivery_city ?? '').', '.($artisan->delivery_province ?? ''), ', ');
            } elseif ($artisan->address) {
                $addressParts = explode(',', $artisan->address);
                $location = trim(end($addressParts));
            }

            // Calculate total sales from completed orders
            $totalSales = \App\Models\Order::where('seller_id', $artisan->id)
                ->whereIn('status', ['completed', 'delivered'])
                ->count();

            return [
                'id' => $artisan->id,
                'name' => $artisan->name,
                'email' => $artisan->email,
                'business_name' => null, // Not available in current schema
                'bio' => null, // Not available in current schema
                'image' => $imageUrl,
                'profile_image' => $imageUrl, // Use the processed imageUrl which already has proper path
                'location' => $location,
                'phone' => $artisan->phone_number,
                'products_count' => $artisan->products_count,
                'specialties' => [], // Not available in current schema
                'rating' => (float) $artisan->average_rating,
                'average_rating' => (float) $artisan->average_rating,
                'review_count' => $artisan->review_count ?? 0,
                'total_sales' => $totalSales,
                'created_at' => $artisan->created_at,
                'is_verified' => false, // Not available in current schema
            ];
        });

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

        return Inertia::render('Artisans', [
            'artisans' => $artisans,
            'locations' => $locations,
            'filters' => array_merge([
                'search' => null,
                'location' => null,
                'min_rating' => null,
                'min_products' => null,
                'verified' => null,
                'sort' => 'popular',
            ], $request->only(['search', 'location', 'min_rating', 'min_products', 'verified', 'sort'])),
        ]);
    }

    /**
     * Display a specific artisan's profile and products
     */
    public function artisanProfile(Request $request, User $artisan)
    {
        if ($artisan->role !== User::ROLE_SELLER || ! $artisan->is_active) {
            abort(404, 'Artisan not found');
        }

        // Ensure avatar_url is available
        $artisan->append('avatar_url');
        $profileImage = $artisan->profile_picture ?? null;
        $imageUrl = $artisan->avatar_url ?? null;
        if (! $imageUrl || str_contains($imageUrl, 'ui-avatars.com')) {
            // If avatar_url is a default avatar, use it; otherwise generate one
            $imageUrl = $artisan->avatar_url ?? 'https://ui-avatars.com/api/?name='.urlencode($artisan->name).'&color=7F9CF5&background=EBF4FF';
        }

        // Extract city from address if exists
        $location = 'Local Area';
        if ($artisan->address) {
            $addressParts = explode(',', $artisan->address);
            $location = trim(end($addressParts));
        }

        // Calculate total sales from completed orders
        $totalSales = \App\Models\Order::where('seller_id', $artisan->id)
            ->whereIn('status', ['completed', 'delivered'])
            ->count();

        $artisanData = [
            'id' => $artisan->id,
            'name' => $artisan->name,
            'email' => $artisan->email,
            'business_name' => null, // Not available in current schema
            'bio' => null, // Not available in current schema
            'image' => $imageUrl,
            'profile_image' => $imageUrl, // Use the processed imageUrl which already has proper path
            'location' => $location,
            'phone' => $artisan->phone_number,
            'specialties' => [], // Not available in current schema
            'rating' => (float) $artisan->average_rating,
            'average_rating' => (float) $artisan->average_rating,
            'review_count' => $artisan->review_count ?? 0,
            'years_of_experience' => null, // Not available in current schema
            'website' => null, // Not available in current schema
            'social_links' => null, // Not available in current schema
            'products_count' => $artisan->products()->where('status', 'active')->count(),
            'total_sales' => $totalSales,
            'created_at' => $artisan->created_at,
            'is_verified' => false, // Not available in current schema
        ];

        $query = Product::with(['category', 'seller'])
            ->where('seller_id', $artisan->id)
            ->where('status', 'active');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'name');

        switch ($sortBy) {
            case 'price':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'name':
            default:
                $query->orderBy('name', 'asc');
                break;
        }

        $products = $query->paginate(12)->through(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'primary_image' => \App\Helpers\ImageHelper::url($product->featured_image),
                'short_description' => $product->short_description ?? $product->description,
                'stock_status' => $product->quantity > 10 ? 'in_stock' : ($product->quantity > 0 ? 'low_stock' : 'out_of_stock'),
                'average_rating' => $product->average_rating ?? 0,
                'view_count' => $product->view_count ?? 0,
                'quantity' => $product->quantity,
                'seller' => [
                    'id' => $product->seller_id,
                    'name' => $product->seller->name ?? 'Unknown',
                ],
            ];
        });

        // Get seller ratings with buyer comments and seller replies
        // Ensure artisan has avatar_url
        $artisan->append('avatar_url');

        $ratings = $artisan->sellerRatings()
            ->with(['user' => function ($query) {
                $query->select('id', 'name', 'profile_picture', 'avatar');
            }])
            ->whereNotNull('review')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($rating) {
                // Ensure user has avatar_url appended
                $rating->user->append('avatar_url');

                return [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'review' => $rating->review,
                    'seller_reply' => $rating->seller_reply,
                    'seller_replied_at' => $rating->seller_replied_at,
                    'created_at' => $rating->created_at->format('M d, Y'),
                    'user' => [
                        'id' => $rating->user->id,
                        'name' => $rating->user->name,
                        'avatar_url' => $rating->user->avatar_url ?? null,
                    ],
                ];
            });

        return Inertia::render('ArtisanProfile', [
            'artisan' => $artisanData,
            'products' => $products,
            'ratings' => $ratings,
            'filters' => array_merge([
                'search' => null,
                'sort' => 'name',
                'direction' => 'asc',
            ], $request->only(['search', 'sort', 'direction'])),
        ]);
    }
}
