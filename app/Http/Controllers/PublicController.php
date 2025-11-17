<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Http\Request;
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

        // Filter by category
        if ($request->has('category') && $request->category !== 'All') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
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
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort', 'name');
        switch ($sortBy) {
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
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
                'primary_image' => $product->featured_image,
                'image' => $product->featured_image ? '/storage/'.$product->featured_image : '/placeholder.jpg',
                'artisan' => $product->seller->name ?? 'Unknown Artisan',
                'artisan_image' => $product->seller->avatar_url ?? null,
                'average_rating' => $product->average_rating ? (float) $product->average_rating : null,
                'review_count' => $product->review_count ?? 0,
                'category' => $product->category->name ?? 'Miscellaneous',
                'description' => $product->description,
                'stock_quantity' => $product->quantity,
            ];
        });

        // Get all categories for filtering
        $categories = ProductCategory::withCount('products')->get();

        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories ?? [],
            'filters' => array_merge([
                'category' => null,
                'search' => null,
                'min_price' => null,
                'max_price' => null,
                'sort' => 'name',
            ], $request->only(['category', 'search', 'min_price', 'max_price', 'sort'])),
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
            'images' => $product->images ? array_map(function ($img) {
                return '/images/'.$img;
            }, $product->images) : ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
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
                    'image' => $relatedProduct->primary_image ? '/images/'.$relatedProduct->primary_image : '/placeholder.jpg',
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
                    'created_at' => $rating->created_at->format('M d, Y'),
                    'buyer_name' => $rating->user->name ?? 'Anonymous',
                    'buyer_avatar' => $rating->user->profile_picture 
                        ? '/storage/'.$rating->user->profile_picture 
                        : 'https://ui-avatars.com/api/?name='.urlencode($rating->user->name ?? 'Anonymous').'&color=7F9CF5&background=EBF4FF',
                ];
            });

        return Inertia::render('ProductDetail', [
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
                $q->where('status', 'active');
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

        // Verified filter (if field exists)
        if ($request->has('verified') && $request->verified !== null && $request->verified !== '') {
            // Only apply if is_verified column exists
            if (Schema::hasColumn('users', 'is_verified')) {
                $query->where('is_verified', $request->verified === 'true' || $request->verified === true);
            }
        }

        // Sorting
        $sortBy = $request->get('sort', 'name');
        $direction = $request->get('direction', 'asc');

        switch ($sortBy) {
            case 'products_count':
                $query->orderBy('products_count', 'desc');
                break;
            case 'average_rating':
                // Only sort by average_rating if column exists
                if (Schema::hasColumn('users', 'average_rating')) {
                    $query->orderBy('average_rating', 'desc');
                } else {
                    $query->orderBy('name', 'asc');
                }
                break;
            case 'total_sales':
                $query->withCount('orders')->orderBy('orders_count', 'desc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            case 'name':
            default:
                $query->orderBy('name', $direction);
                break;
        }

        $artisans = $query->paginate(12)->through(function ($artisan) {
            $profileImage = $artisan->profile_picture ?? null;
            $imageUrl = $profileImage ? '/storage/'.$profileImage : null;
            if (! $imageUrl) {
                $imageUrl = 'https://ui-avatars.com/api/?name='.urlencode($artisan->name).'&color=7F9CF5&background=EBF4FF';
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

            return [
                'id' => $artisan->id,
                'name' => $artisan->name,
                'email' => $artisan->email,
                'business_name' => null, // Not available in current schema
                'bio' => null, // Not available in current schema
                'image' => $imageUrl,
                'profile_image' => $profileImage,
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

        return Inertia::render('Artisans', [
            'artisans' => $artisans,
            'filters' => array_merge([
                'search' => null,
                'sort' => 'name',
                'direction' => 'asc',
                'verified' => null,
            ], $request->only(['search', 'sort', 'direction', 'verified'])),
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

        $profileImage = $artisan->profile_picture ?? null;
        $imageUrl = $profileImage ? '/storage/'.$profileImage : null;
        if (! $imageUrl) {
            $imageUrl = 'https://ui-avatars.com/api/?name='.urlencode($artisan->name).'&color=7F9CF5&background=EBF4FF';
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
            'profile_image' => $profileImage,
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
                'primary_image' => $product->featured_image,
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

        return Inertia::render('ArtisanProfile', [
            'artisan' => $artisanData,
            'products' => $products,
            'filters' => array_merge([
                'search' => null,
                'sort' => 'name',
                'direction' => 'asc',
            ], $request->only(['search', 'sort', 'direction'])),
        ]);
    }
}
