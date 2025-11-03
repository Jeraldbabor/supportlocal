<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
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
                    'image' => $product->primary_image ? '/images/'.$product->primary_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url,
                    'rating' => $product->average_rating ?? 4.5,
                    'category' => $product->category->name ?? 'Miscellaneous',
                ];
            });

        return Inertia::render('Home', [
            'featuredProducts' => $featuredProducts ?? [],
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

        return Inertia::render('About', [
            'artisans' => $artisans ?? [],
        ]);
    }

    /**
     * Display the contact page
     */
    public function contact()
    {
        return Inertia::render('Contact');
    }

    /**
     * Handle contact form submission
     */
    public function sendContactMessage(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // Here you would typically send an email or store the message
        // For now, we'll just return a success response

        // TODO: Implement email functionality
        // Mail::to(config('app.contact_email'))->send(new ContactMessage($request->all()));

        return back()->with('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
    }
}
