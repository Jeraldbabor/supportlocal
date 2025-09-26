<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// E-commerce routes
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/products', function () {
    return Inertia::render('Products');
})->name('products');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

Route::get('/product/{id}', function ($id) {
    return Inertia::render('ProductDetail', [
        'productId' => $id
    ]);
})->name('product.detail');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        // Redirect to role-specific dashboard
        return match ($user->role) {
            App\Models\User::ROLE_SELLER => redirect()->route('seller.dashboard'),
            App\Models\User::ROLE_ADMINISTRATOR => redirect()->route('admin.dashboard'),
            App\Models\User::ROLE_BUYER => redirect()->route('buyer.dashboard'),
            default => Inertia::render('dashboard')
        };
    })->name('dashboard');

    // Role-specific routes examples
    Route::middleware(['role:seller'])->group(function () {
        Route::get('/seller/products', function () {
            return Inertia::render('seller/products');
        })->name('seller.products');
        
        Route::get('/seller/dashboard', function () {
            return Inertia::render('seller/dashboard');
        })->name('seller.dashboard');
        
        Route::get('/seller/orders', function () {
            return Inertia::render('seller/orders');
        })->name('seller.orders');
        
        Route::get('/seller/analytics', function () {
            return Inertia::render('seller/analytics');
        })->name('seller.analytics');
    });

    Route::middleware(['role:administrator'])->group(function () {
        Route::get('/admin/users', function () {
            return Inertia::render('admin/users');
        })->name('admin.users');
        
        Route::get('/admin/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('admin.dashboard');
        
        Route::get('/admin/reports', function () {
            return Inertia::render('admin/reports');
        })->name('admin.reports');
        
        Route::get('/admin/settings', function () {
            return Inertia::render('admin/settings');
        })->name('admin.settings');
    });

    Route::middleware(['role:buyer'])->group(function () {
        Route::get('/buyer/dashboard', function () {
            return Inertia::render('buyer/dashboard');
        })->name('buyer.dashboard');
        
        Route::get('/buyer/orders', function () {
            return Inertia::render('buyer/orders');
        })->name('buyer.orders');
        
        Route::get('/buyer/wishlist', function () {
            return Inertia::render('buyer/wishlist');
        })->name('buyer.wishlist');
    });

    // Routes accessible by multiple roles
    Route::middleware(['role:seller,administrator'])->group(function () {
        Route::get('/management', function () {
            return Inertia::render('management/dashboard');
        })->name('management.dashboard');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
