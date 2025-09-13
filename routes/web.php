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

Route::get('/tawi', function () {
    return Inertia::render('Tawi');
})->name('tawi');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
