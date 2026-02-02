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
                    'image' => \App\Helpers\ImageHelper::url($product->featured_image),
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
                    'image' => \App\Helpers\ImageHelper::url($product->featured_image),
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
                    'image' => \App\Helpers\ImageHelper::url($product->featured_image),
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
                    'image' => \App\Helpers\ImageHelper::url($product->featured_image),
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
        // Team members data
        $artisans = [
            [
                'id' => 1,
                'name' => 'JERALD B. BABOR',
                'specialty' => 'Full-Stack Web Developer',
                'image' => '/jerald.jfif',
                'description' => 'A skilled full-stack web developer creating innovative digital solutions and web applications, and the only one who developed this website and maintained it.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 2,
                'name' => 'JONAS D. PARREÑO, MIT',
                'specialty' => 'System Analyst/Capstone Adviser',
                'image' => '/sirjd.jpg',
                'description' => 'An experienced adviser specializing in analysis and capstone project guidance, helping students excel in their academic journey.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 3,
                'name' => 'DECEY B. ALIHID',
                'specialty' => 'Documentator',
                'image' => '/decery.jfif',
                'description' => 'A dedicated documentator ensuring clear, comprehensive documentation for projects and processes.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 4,
                'name' => 'MICALEA OLIAMINA',
                'specialty' => 'Documentator',
                'image' => '/mekay.jfif',
                'description' => 'A meticulous documentator creating detailed documentation to support project success and knowledge sharing.',
                'location' => 'Philippines',
                'experience' => '',
            ],
        ];

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
            'artisans' => $artisans,
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
     * Each email can only send one contact message
     */
    public function sendContactMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // Check if this email has already sent a contact message
        $existingMessage = ContactMessage::where('email', $validated['email'])->first();
        if ($existingMessage) {
            return back()->withErrors([
                'email' => 'This email address has already been used to send a message. Please use a different email address.',
            ])->withInput();
        }

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
