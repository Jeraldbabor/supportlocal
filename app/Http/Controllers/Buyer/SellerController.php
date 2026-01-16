<?php

namespace App\Http\Controllers\Buyer;

use App\Helpers\WishlistHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SellerController extends Controller
{
    /**
     * Display a listing of all active sellers/artisans for buyers.
     */
    public function index(Request $request): Response
    {
        $query = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->with(['sellerApplication'])
            ->withCount(['products' => function ($q) {
                $q->where('status', Product::STATUS_ACTIVE)->where('quantity', '>', 0);
            }]);

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('sellerApplication', function ($appQuery) use ($search) {
                        $appQuery->where('business_name', 'like', "%{$search}%")
                            ->orWhere('business_description', 'like', "%{$search}%");
                    });
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
            if (Schema::hasColumn('users', 'average_rating')) {
                $query->where('average_rating', '>=', $minRating)
                    ->where('review_count', '>', 0);
            }
        }

        // Filter by minimum products count
        if ($request->filled('min_products') && is_numeric($request->min_products)) {
            $query->havingRaw('products_count >= ?', [$request->min_products]);
        }

        // Apply verified filter
        if ($request->has('verified') && $request->verified !== null && $request->verified !== '') {
            $isVerified = filter_var($request->verified, FILTER_VALIDATE_BOOLEAN);
            if ($isVerified) {
                $query->whereHas('sellerApplication', function ($q) {
                    $q->where('status', SellerApplication::STATUS_APPROVED);
                });
            } else {
                $query->whereDoesntHave('sellerApplication', function ($q) {
                    $q->where('status', SellerApplication::STATUS_APPROVED);
                });
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort', 'popular');

        switch ($sortBy) {
            case 'popular':
                // Popular = combination of rating, products, and sales
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

        $sellers = $query->paginate(12)->withQueryString();

        // Get unique locations for filtering
        $locations = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('status', Product::STATUS_ACTIVE)->where('quantity', '>', 0);
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

        // Transform sellers data
        $sellers->getCollection()->transform(function ($seller) {
            $seller->is_verified = $seller->sellerApplication &&
                                  $seller->sellerApplication->status === SellerApplication::STATUS_APPROVED;

            // Calculate total sales from completed orders
            $seller->total_sales = \App\Models\Order::where('seller_id', $seller->id)
                ->whereIn('status', ['completed', 'delivered'])
                ->count();

            // Extract location from delivery fields or address
            $location = 'Local Area';
            if ($seller->delivery_city || $seller->delivery_province) {
                $location = trim(($seller->delivery_city ?? '').', '.($seller->delivery_province ?? ''), ', ');
            } elseif ($seller->address) {
                $addressParts = explode(',', $seller->address);
                $location = trim(end($addressParts));
            }
            $seller->location = $location;

            $seller->business_description = $seller->sellerApplication->business_description ?? null;
            $seller->business_name = $seller->sellerApplication->business_name ?? null;
            $seller->profile_image = $seller->profile_picture;

            return $seller;
        });

        return Inertia::render('buyer/sellers/Index', [
            'sellers' => $sellers,
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
     * Display the specified seller's profile and products.
     */
    public function show(Request $request, User $seller): Response
    {
        // Only show active sellers to buyers
        if ($seller->role !== User::ROLE_SELLER || ! $seller->is_active) {
            abort(404);
        }

        $category = $request->get('category');
        $search = $request->get('search');
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        // Get seller's products
        $productsQuery = $seller->products()
            ->where('status', Product::STATUS_ACTIVE)
            ->with(['category']);

        // Apply category filter
        if ($category) {
            $productsQuery->where('category_id', $category);
        }

        // Apply search filter
        if ($search) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $validSorts = ['name', 'price', 'created_at', 'view_count'];
        if (in_array($sort, $validSorts)) {
            $productsQuery->orderBy($sort, $direction);
        }

        $products = $productsQuery->paginate(12)->withQueryString();

        // Get categories for filter (only categories that have products from this seller)
        $categories = \App\Models\ProductCategory::whereHas('products', function ($q) use ($seller) {
            $q->where('seller_id', $seller->id)
                ->where('status', Product::STATUS_ACTIVE);
        })->get();

        // Load seller profile data
        $seller->load(['products' => function ($q) {
            $q->where('status', Product::STATUS_ACTIVE);
        }, 'sellerApplication']);

        // Add is_verified computed property
        $seller->is_verified = $seller->sellerApplication &&
                              $seller->sellerApplication->status === SellerApplication::STATUS_APPROVED;

        // Calculate actual products count
        $seller->products_count = $seller->products()
            ->where('status', Product::STATUS_ACTIVE)
            ->count();

        // Calculate total sales from completed orders
        $seller->total_sales = \App\Models\Order::where('seller_id', $seller->id)
            ->whereIn('status', ['completed', 'delivered'])
            ->count();

        // Add other fields
        $seller->location = $seller->address ?? null;
        $seller->business_description = $seller->sellerApplication->business_description ?? null;
        $seller->business_name = $seller->sellerApplication->business_name ?? null;
        // Ensure avatar_url is available for frontend
        $seller->append('avatar_url');
        $seller->profile_image = $seller->avatar_url; // Use avatar_url which includes proper /images/ path

        // Get current user's rating for this seller
        $userRating = null;
        if (auth()->check()) {
            $userRating = $seller->sellerRatings()
                ->where('user_id', auth()->id())
                ->first();
        }

        // Get wishlist product IDs
        $wishlistProductIds = WishlistHelper::getProductIds();

        return Inertia::render('buyer/sellers/Show', [
            'seller' => $seller,
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'userRating' => $userRating,
            'wishlistProductIds' => $wishlistProductIds,
        ]);
    }
}
