<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\SellerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerController extends Controller
{
    /**
     * Display a listing of all active sellers/artisans for buyers.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction', 'asc');
        $verified = $request->get('verified');

        $query = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->with(['sellerApplication'])
            ->withCount(['products' => function ($q) {
                $q->where('status', Product::STATUS_ACTIVE);
            }]);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        // Apply verified filter
        if ($verified !== null && $verified !== '') {
            $isVerified = filter_var($verified, FILTER_VALIDATE_BOOLEAN);
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
        $validSorts = ['name', 'business_name', 'created_at', 'products_count'];
        if (in_array($sort, $validSorts)) {
            if ($sort === 'products_count') {
                $query->orderBy('products_count', $direction);
            } else {
                $query->orderBy($sort, $direction);
            }
        }

        $sellers = $query->paginate(12)->withQueryString();

        // Add is_verified computed property to each seller
        $sellers->getCollection()->transform(function ($seller) {
            $seller->is_verified = $seller->sellerApplication && 
                                  $seller->sellerApplication->status === SellerApplication::STATUS_APPROVED;
            
            // Add missing fields with default values
            $seller->average_rating = 0; // TODO: Calculate from product reviews
            $seller->total_sales = 0; // TODO: Calculate from orders
            $seller->location = $seller->address ?? null;
            $seller->business_description = $seller->sellerApplication->business_description ?? null;
            $seller->business_name = $seller->sellerApplication->business_name ?? null;
            $seller->profile_image = $seller->profile_picture; // Map profile_picture to profile_image
            
            return $seller;
        });

        return Inertia::render('buyer/sellers/Index', [
            'sellers' => $sellers,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'verified' => $verified === null ? null : filter_var($verified, FILTER_VALIDATE_BOOLEAN),
            ],
        ]);
    }

    /**
     * Display the specified seller's profile and products.
     */
    public function show(Request $request, User $seller): Response
    {
        // Only show active sellers to buyers
        if ($seller->role !== User::ROLE_SELLER || !$seller->is_active) {
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
        
        // Add missing fields with default values
        $seller->average_rating = 0; // TODO: Calculate from product reviews
        $seller->total_sales = 0; // TODO: Calculate from orders
        $seller->location = $seller->address ?? null;
        $seller->business_description = $seller->sellerApplication->business_description ?? null;
        $seller->business_name = $seller->sellerApplication->business_name ?? null;
        $seller->profile_image = $seller->profile_picture; // Map profile_picture to profile_image

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
        ]);
    }
}