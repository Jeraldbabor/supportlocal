<?php

namespace App\Http\Controllers;

use App\Helpers\WishlistHelper;
use App\Models\ContactMessage;
use App\Models\PageContent;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Notifications\NewContactMessageReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the home page with featured products
     */
    public function index()
    {
        // Get featured products (latest 8 products that are active)
        $featuredProducts = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                    'image' => $product->featured_image ? '/storage/'.$product->featured_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url,
                    'seller_id' => $product->seller_id ?? 0,
                    'rating' => $product->average_rating ?? 0,
                    'review_count' => $product->review_count ?? 0,
                    'category' => $product->category->name ?? 'Miscellaneous',
                    'order_count' => (int) ($product->order_count ?? 0),
                    'view_count' => (int) ($product->view_count ?? 0),
                ];
            });

        // Get top products (by rating, minimum 5 reviews)
        $topProducts = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where('review_count', '>=', 5)
            ->where('average_rating', '>', 0)
            ->orderByDesc('average_rating')
            ->orderByDesc('review_count')
            ->take(12)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                    'image' => $product->featured_image ? '/storage/'.$product->featured_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url,
                    'seller_id' => $product->seller_id ?? 0,
                    'rating' => $product->average_rating ?? 0,
                    'review_count' => $product->review_count ?? 0,
                    'category' => $product->category->name ?? 'Miscellaneous',
                    'order_count' => (int) ($product->order_count ?? 0),
                    'view_count' => (int) ($product->view_count ?? 0),
                ];
            });

        // Get top sales (by order_count from completed orders)
        $topSales = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where('order_count', '>', 0)
            ->orderByDesc('order_count')
            ->take(12)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                    'image' => $product->featured_image ? '/storage/'.$product->featured_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url,
                    'seller_id' => $product->seller_id ?? 0,
                    'rating' => $product->average_rating ?? 0,
                    'review_count' => $product->review_count ?? 0,
                    'category' => $product->category->name ?? 'Miscellaneous',
                    'order_count' => (int) ($product->order_count ?? 0),
                    'view_count' => (int) ($product->view_count ?? 0),
                ];
            });

        // Get trending products (by view_count and order_count, recent activity)
        $trendingProducts = Product::with(['seller', 'category'])
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where(function ($q) {
                $q->where('view_count', '>', 0)
                    ->orWhere('order_count', '>', 0);
            })
            ->orderByRaw('(view_count * 1 + order_count * 10) DESC')
            ->orderByDesc('updated_at')
            ->take(12)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                    'image' => $product->featured_image ? '/storage/'.$product->featured_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url,
                    'seller_id' => $product->seller_id ?? 0,
                    'rating' => $product->average_rating ?? 0,
                    'review_count' => $product->review_count ?? 0,
                    'category' => $product->category->name ?? 'Miscellaneous',
                    'order_count' => (int) ($product->order_count ?? 0),
                    'view_count' => (int) ($product->view_count ?? 0),
                ];
            });

        // Get wishlist product IDs for current user/guest
        $wishlistProductIds = WishlistHelper::getProductIds();

        // Get categories for the category section (only categories with active products)
        $categories = ProductCategory::whereHas('products', function ($q) {
            $q->where('status', 'active')->where('quantity', '>', 0);
        })
            ->orderBy('name')
            ->take(10) // Limit to 10 categories for the home page
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug ?? null,
                ];
            });

        return Inertia::render('Home', [
            'featuredProducts' => $featuredProducts ?? [],
            'topProducts' => $topProducts ?? [],
            'topSales' => $topSales ?? [],
            'trendingProducts' => $trendingProducts ?? [],
            'wishlistProductIds' => $wishlistProductIds,
            'categories' => $categories ?? [],
        ]);
    }

    /**
     * Display the about page
     */
    public function about()
    {
        // Get featured artisans (sellers with products)
        $artisans = User::where('role', User::ROLE_SELLER)
            ->whereHas('products', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['products' => function ($query) {
                $query->where('status', 'active')->with('category')->take(3);
            }])
            ->take(4)
            ->get()
            ->map(function ($artisan) {
                return [
                    'id' => $artisan->id,
                    'name' => $artisan->name,
                    'specialty' => $artisan->products->first()->category->name ?? 'General Crafts',
                    'image' => $artisan->avatar_url,
                    'description' => $artisan->bio ?? 'Passionate artisan creating beautiful handmade items.',
                    'location' => $artisan->city ?? 'Local Area',
                    'experience' => $artisan->years_of_experience ?? '5+ years',
                ];
            });

        // Get dynamic page content
        $pageContents = PageContent::getPageContents(PageContent::PAGE_TYPE_ABOUT)
            ->map(function ($content) {
                return [
                    'section' => $content->section,
                    'title' => $content->title,
                    'content' => $content->content,
                    'metadata' => $content->metadata,
                ];
            })
            ->keyBy('section');

        return Inertia::render('About', [
            'artisans' => $artisans ?? [],
            'pageContents' => $pageContents,
        ]);
    }

    /**
     * Display the contact page
     */
    public function contact()
    {
        // Get dynamic page content
        $pageContents = PageContent::getPageContents(PageContent::PAGE_TYPE_CONTACT)
            ->map(function ($content) {
                return [
                    'section' => $content->section,
                    'title' => $content->title,
                    'content' => $content->content,
                    'metadata' => $content->metadata,
                ];
            })
            ->keyBy('section');

        return Inertia::render('Contact', [
            'pageContents' => $pageContents,
        ]);
    }

    /**
     * Handle contact form submission
     */
    public function sendContactMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // Store the message in the database
        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => ContactMessage::STATUS_NEW,
        ]);

        // Notify all administrators about the new contact message
        $admins = User::where('role', User::ROLE_ADMINISTRATOR)->get();
        Notification::send($admins, new NewContactMessageReceived($contactMessage));

        return back()->with('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
    }
}
