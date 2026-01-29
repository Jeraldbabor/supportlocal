<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public/Guest E-commerce routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'sendContactMessage'])->name('contact.send');

// Legal pages (required for Facebook/OAuth compliance)
Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Product browsing routes
Route::get('/products', [PublicController::class, 'products'])->name('products');
Route::get('/product/{product}', [PublicController::class, 'productDetail'])->name('product.detail');

// Public artisan browsing routes
Route::get('/artisans', [PublicController::class, 'artisans'])->name('artisans');
Route::get('/artisan/{artisan}', [PublicController::class, 'artisanProfile'])->name('artisan.profile');

// Shopping cart routes (using session for guests)
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/add', [CartController::class, 'addToCart'])->name('cart.add');
Route::put('/cart/update', [CartController::class, 'updateQuantity'])->name('cart.update');
Route::delete('/cart/remove', [CartController::class, 'removeFromCart'])->name('cart.remove');
Route::delete('/cart/clear', [CartController::class, 'clearCart'])->name('cart.clear');
Route::get('/cart/count', [CartController::class, 'getCartCount'])->name('cart.count');

// Wishlist routes (supports both guests and authenticated users)
Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
Route::post('/wishlist/add', [WishlistController::class, 'store'])->name('wishlist.add');
Route::delete('/wishlist/remove', [WishlistController::class, 'destroy'])->name('wishlist.remove');
Route::delete('/wishlist/clear', [WishlistController::class, 'clear'])->name('wishlist.clear');
Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
Route::get('/wishlist/count', [WishlistController::class, 'count'])->name('wishlist.count');
Route::post('/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');

// Guest checkout route - prompts to login or continue
Route::get('/checkout', function () {
    return Inertia::render('GuestCheckout');
})->name('checkout');

// API route for transferring guest cart to authenticated user
Route::post('/api/cart/transfer', [App\Http\Controllers\Api\CartTransferController::class, 'transfer'])
    ->middleware('auth')
    ->name('api.cart.transfer');

// API route for geocoding (Nominatim proxy to avoid CORS)
Route::get('/api/geocode', [GeocodeController::class, 'geocode'])->name('api.geocode');

// API route for search suggestions (autocomplete)
Route::get('/api/search/suggestions', [App\Http\Controllers\Api\SearchSuggestionController::class, 'suggestions'])->name('api.search.suggestions');

// API routes for buyer cart (returns JSON)
Route::middleware('auth')->prefix('api/buyer')->group(function () {
    Route::get('/cart', [App\Http\Controllers\Buyer\CartController::class, 'getCartJson'])->name('api.buyer.cart');
    Route::post('/cart/add', [App\Http\Controllers\Buyer\CartController::class, 'addToCartJson'])->name('api.buyer.cart.add');
    Route::put('/cart/update', [App\Http\Controllers\Buyer\CartController::class, 'updateQuantityJson'])->name('api.buyer.cart.update');
    Route::delete('/cart/remove', [App\Http\Controllers\Buyer\CartController::class, 'removeFromCartJson'])->name('api.buyer.cart.remove');
    Route::delete('/cart/clear', [App\Http\Controllers\Buyer\CartController::class, 'clearCartJson'])->name('api.buyer.cart.clear');
});

// Note: Public artisan routes moved above to PublicController

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
        // Product Management Routes
        Route::resource('seller/products', App\Http\Controllers\Seller\ProductController::class, [
            'as' => 'seller',
            'except' => ['show'],
        ]);
        Route::get('/seller/products/{product}', [App\Http\Controllers\Seller\ProductController::class, 'show'])->name('seller.products.show');
        Route::post('/seller/products/{product}/toggle-status', [App\Http\Controllers\Seller\ProductController::class, 'toggleStatus'])->name('seller.products.toggle-status');
        Route::post('/seller/products/{product}/duplicate', [App\Http\Controllers\Seller\ProductController::class, 'duplicate'])->name('seller.products.duplicate');
        Route::patch('/seller/products/{product}/inventory', [App\Http\Controllers\Seller\ProductController::class, 'updateInventory'])->name('seller.products.inventory.update');

        // Product Rating Routes for Sellers
        Route::get('/seller/ratings', [App\Http\Controllers\Seller\ProductRatingController::class, 'index'])->name('seller.ratings.index');
        Route::get('/seller/products/{product}/ratings', [App\Http\Controllers\Seller\ProductRatingController::class, 'show'])->name('seller.products.ratings.show');
        Route::get('/seller/products/{product}/ratings/api', [App\Http\Controllers\Seller\ProductRatingController::class, 'apiIndex'])->name('seller.products.ratings.api');
        Route::post('/seller/products/{product}/ratings/{rating}/reply', [App\Http\Controllers\Seller\ProductRatingController::class, 'storeReply'])->name('seller.products.ratings.reply.store');
        Route::delete('/seller/products/{product}/ratings/{rating}/reply', [App\Http\Controllers\Seller\ProductRatingController::class, 'deleteReply'])->name('seller.products.ratings.reply.delete');

        // Product Reviews Routes (ratings on seller's products)
        Route::get('/seller/seller-ratings', [App\Http\Controllers\Seller\SellerRatingController::class, 'index'])->name('seller.seller-ratings.index');
        Route::post('/seller/seller-ratings/{rating}/reply', [App\Http\Controllers\Seller\SellerRatingController::class, 'storeReply'])
            ->name('seller.seller-ratings.reply.store')
            ->whereNumber('rating');
        Route::delete('/seller/seller-ratings/{rating}/reply', [App\Http\Controllers\Seller\SellerRatingController::class, 'deleteReply'])
            ->name('seller.seller-ratings.reply.delete')
            ->whereNumber('rating');

        Route::get('/seller/dashboard', [App\Http\Controllers\Seller\DashboardController::class, 'index'])->name('seller.dashboard');

        // Order Management Routes
        Route::get('/seller/orders', [App\Http\Controllers\Seller\OrderController::class, 'index'])->name('seller.orders');
        Route::get('/seller/orders/{order}', [App\Http\Controllers\Seller\OrderController::class, 'show'])->name('seller.orders.show');
        Route::post('/seller/orders/{order}/confirm', [App\Http\Controllers\Seller\OrderController::class, 'confirm'])->name('seller.orders.confirm');
        Route::post('/seller/orders/{order}/reject', [App\Http\Controllers\Seller\OrderController::class, 'reject'])->name('seller.orders.reject');
        Route::post('/seller/orders/{order}/ship', [App\Http\Controllers\Seller\OrderController::class, 'ship'])->name('seller.orders.ship');
        Route::post('/seller/orders/{order}/complete', [App\Http\Controllers\Seller\OrderController::class, 'complete'])->name('seller.orders.complete');
        Route::post('/seller/orders/{order}/verify-payment', [App\Http\Controllers\Seller\OrderController::class, 'verifyPayment'])->name('seller.orders.verify-payment');
        Route::post('/seller/orders/{order}/reject-payment', [App\Http\Controllers\Seller\OrderController::class, 'rejectPayment'])->name('seller.orders.reject-payment');

        // Customer Management Routes
        Route::get('/seller/customers', [App\Http\Controllers\Seller\CustomerController::class, 'index'])->name('seller.customers');
        Route::get('/seller/customers/{customer}', [App\Http\Controllers\Seller\CustomerController::class, 'show'])->name('seller.customers.show');
        Route::get('/seller/customers/{customer}/orders', [App\Http\Controllers\Seller\CustomerController::class, 'orders'])->name('seller.customers.orders');

        // Analytics Routes
        Route::get('/seller/analytics', [App\Http\Controllers\Seller\AnalyticsController::class, 'index'])->name('seller.analytics');
        Route::get('/seller/analytics/export', [App\Http\Controllers\Seller\AnalyticsController::class, 'export'])->name('seller.analytics.export');

        // Seller Profile Routes
        Route::get('/seller/profile', [App\Http\Controllers\Seller\ProfileController::class, 'show'])->name('seller.profile.show');
        Route::get('/seller/profile/edit', [App\Http\Controllers\Seller\ProfileController::class, 'edit'])->name('seller.profile.edit');
        Route::put('/seller/profile', [App\Http\Controllers\Seller\ProfileController::class, 'update'])->name('seller.profile.update');
        Route::post('/seller/profile/avatar', [App\Http\Controllers\Seller\ProfileController::class, 'updateAvatar'])->name('seller.profile.avatar.update');
        Route::delete('/seller/profile/avatar', [App\Http\Controllers\Seller\ProfileController::class, 'deleteAvatar'])->name('seller.profile.avatar.delete');
        Route::get('/seller/profile/business', [App\Http\Controllers\Seller\ProfileController::class, 'business'])->name('seller.profile.business');
        Route::put('/seller/profile/business', [App\Http\Controllers\Seller\ProfileController::class, 'updateBusiness'])->name('seller.profile.business.update');

        // Seller Settings Routes
        Route::get('/seller/settings', [App\Http\Controllers\Seller\SettingsController::class, 'index'])->name('seller.settings.index');
        Route::get('/seller/settings/security', [App\Http\Controllers\Seller\SettingsController::class, 'security'])->name('seller.settings.security');
        Route::put('/seller/settings/password', [App\Http\Controllers\Seller\SettingsController::class, 'updatePassword'])->name('seller.settings.password.update');
        Route::get('/seller/settings/notifications', [App\Http\Controllers\Seller\SettingsController::class, 'notifications'])->name('seller.settings.notifications');
        Route::get('/seller/settings/business', [App\Http\Controllers\Seller\SettingsController::class, 'business'])->name('seller.settings.business');
        Route::get('/seller/settings/account', [App\Http\Controllers\Seller\SettingsController::class, 'account'])->name('seller.settings.account');
        Route::post('/seller/settings/deactivate', [App\Http\Controllers\Seller\SettingsController::class, 'deactivate'])->name('seller.settings.deactivate');
        Route::get('/seller/settings/analytics', [App\Http\Controllers\Seller\SettingsController::class, 'analytics'])->name('seller.settings.analytics');
        Route::post('/seller/settings/email-verification', [App\Http\Controllers\Seller\SettingsController::class, 'sendEmailVerification'])->name('seller.settings.email.verify');

        // Seller Notification Routes
        Route::get('/seller/notifications', [App\Http\Controllers\Seller\NotificationController::class, 'index'])->name('seller.notifications.index');
        Route::get('/seller/notifications/recent', [App\Http\Controllers\Seller\NotificationController::class, 'getRecent'])->name('seller.notifications.recent');
        Route::post('/seller/notifications/{id}/read', [App\Http\Controllers\Seller\NotificationController::class, 'markAsRead'])->name('seller.notifications.read');
        Route::delete('/seller/notifications/{id}', [App\Http\Controllers\Seller\NotificationController::class, 'destroy'])->name('seller.notifications.destroy');
        Route::post('/seller/notifications/read-all', [App\Http\Controllers\Seller\NotificationController::class, 'markAllAsRead'])->name('seller.notifications.read-all');
        Route::post('/seller/notifications/clear-all', [App\Http\Controllers\Seller\NotificationController::class, 'clearAllHistory'])->name('seller.notifications.clear-all');

        // Custom Order Request Routes for Sellers
        Route::get('/seller/custom-orders', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'index'])->name('seller.custom-orders.index');
        Route::get('/seller/custom-orders/{customOrderRequest}', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'show'])->name('seller.custom-orders.show');
        Route::post('/seller/custom-orders/{customOrderRequest}/quote', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'submitQuote'])->name('seller.custom-orders.quote');
        Route::post('/seller/custom-orders/{customOrderRequest}/reject', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'reject'])->name('seller.custom-orders.reject');
        Route::post('/seller/custom-orders/{customOrderRequest}/start', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'startWork'])->name('seller.custom-orders.start');
        Route::post('/seller/custom-orders/{customOrderRequest}/send-for-checkout', [App\Http\Controllers\Seller\CustomOrderRequestController::class, 'sendForCheckout'])->name('seller.custom-orders.send-for-checkout');
    });

    Route::middleware(['role:administrator'])->group(function () {
        // Test route for debugging
        Route::get('/admin/users-test', function () {
            return response()->json([
                'message' => 'Admin users route is accessible',
                'user_count' => \App\Models\User::count(),
                'auth_user' => auth()->user()->name,
                'auth_role' => auth()->user()->role,
            ]);
        })->name('admin.users.test');

        // User Management Routes
        Route::resource('admin/users', App\Http\Controllers\Admin\UserController::class, [
            'names' => [
                'index' => 'admin.users.index',
                'create' => 'admin.users.create',
                'store' => 'admin.users.store',
                'show' => 'admin.users.show',
                'edit' => 'admin.users.edit',
                'update' => 'admin.users.update',
                'destroy' => 'admin.users.destroy',
            ],
        ]);

        // Additional user management routes
        Route::post('/admin/users/{user}/toggle-status', [App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
        Route::post('/admin/users/{user}/reset-password', [App\Http\Controllers\Admin\UserController::class, 'resetPassword'])->name('admin.users.reset-password');
        Route::post('/admin/users/{user}/verify-email', [App\Http\Controllers\Admin\UserController::class, 'verifyEmail'])->name('admin.users.verify-email');
        Route::post('/admin/users/{user}/send-verification', [App\Http\Controllers\Admin\UserController::class, 'sendVerification'])->name('admin.users.send-verification');
        Route::post('/admin/users/{user}/upload-avatar', [App\Http\Controllers\Admin\UserController::class, 'uploadAvatar'])->name('admin.users.upload-avatar');

        Route::get('/admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

        // Product Management Routes
        Route::resource('admin/products', App\Http\Controllers\Admin\ProductController::class, [
            'names' => [
                'index' => 'admin.products.index',
                'show' => 'admin.products.show',
                'edit' => 'admin.products.edit',
                'update' => 'admin.products.update',
                'destroy' => 'admin.products.destroy',
            ],
        ]);
        Route::post('/admin/products/{product}/toggle-status', [App\Http\Controllers\Admin\ProductController::class, 'toggleStatus'])->name('admin.products.toggle-status');
        Route::post('/admin/products/{product}/toggle-featured', [App\Http\Controllers\Admin\ProductController::class, 'toggleFeatured'])->name('admin.products.toggle-featured');
        Route::post('/admin/products/bulk-update', [App\Http\Controllers\Admin\ProductController::class, 'bulkUpdate'])->name('admin.products.bulk-update');
        Route::post('/admin/products/bulk-delete', [App\Http\Controllers\Admin\ProductController::class, 'bulkDelete'])->name('admin.products.bulk-delete');

        // Order Management Routes
        Route::get('/admin/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('/admin/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('admin.orders.show');
        Route::post('/admin/orders/{order}/update-status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('admin.orders.update-status');
        Route::post('/admin/orders/{order}/cancel', [App\Http\Controllers\Admin\OrderController::class, 'cancel'])->name('admin.orders.cancel');

        // Category Management Routes
        Route::resource('admin/categories', App\Http\Controllers\Admin\CategoryController::class, [
            'names' => [
                'index' => 'admin.categories.index',
                'create' => 'admin.categories.create',
                'store' => 'admin.categories.store',
                'show' => 'admin.categories.show',
                'edit' => 'admin.categories.edit',
                'update' => 'admin.categories.update',
                'destroy' => 'admin.categories.destroy',
            ],
        ]);
        Route::post('/admin/categories/{category}/toggle-status', [App\Http\Controllers\Admin\CategoryController::class, 'toggleStatus'])->name('admin.categories.toggle-status');

        // Reports Routes
        Route::get('/admin/reports', [App\Http\Controllers\Admin\ReportsController::class, 'index'])->name('admin.reports.index');
        Route::get('/admin/reports/export', [App\Http\Controllers\Admin\ReportsController::class, 'export'])->name('admin.reports.export');

        // Analytics Routes
        Route::get('/admin/analytics', [App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics.index');
        Route::get('/admin/analytics/export', [App\Http\Controllers\Admin\AnalyticsController::class, 'export'])->name('admin.analytics.export');

        // Database Backup Routes (Admin only)
        Route::post('/admin/database/backup', function () {
            Artisan::call('db:backup', ['--retention' => 7]);

            return redirect()->back()->with('success', 'Database backup initiated successfully.');
        })->name('admin.database.backup');

        // Settings Routes
        Route::get('/admin/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings.index');
        Route::post('/admin/settings/general', [App\Http\Controllers\Admin\SettingsController::class, 'updateGeneral'])->name('admin.settings.general');
        Route::post('/admin/settings/ecommerce', [App\Http\Controllers\Admin\SettingsController::class, 'updateEcommerce'])->name('admin.settings.ecommerce');
        Route::post('/admin/settings/seller', [App\Http\Controllers\Admin\SettingsController::class, 'updateSeller'])->name('admin.settings.seller');
        Route::post('/admin/settings/notifications', [App\Http\Controllers\Admin\SettingsController::class, 'updateNotifications'])->name('admin.settings.notifications');
        Route::post('/admin/settings/seo', [App\Http\Controllers\Admin\SettingsController::class, 'updateSeo'])->name('admin.settings.seo');
        Route::post('/admin/settings/clear-cache', [App\Http\Controllers\Admin\SettingsController::class, 'clearCache'])->name('admin.settings.clear-cache');

        // Seller application management routes
        Route::get('/admin/seller-applications', [App\Http\Controllers\SellerApplicationController::class, 'index'])->name('admin.seller-applications.index');
        Route::get('/admin/seller-applications/{application}', [App\Http\Controllers\SellerApplicationController::class, 'show'])->name('admin.seller-applications.show');
        Route::post('/admin/seller-applications/{application}/approve', [App\Http\Controllers\SellerApplicationController::class, 'approve'])->name('admin.seller-applications.approve');
        Route::post('/admin/seller-applications/{application}/reject', [App\Http\Controllers\SellerApplicationController::class, 'reject'])->name('admin.seller-applications.reject');
        Route::get('/admin/seller-applications/{application}/preview/{type}', [App\Http\Controllers\SellerApplicationController::class, 'previewDocument'])->name('admin.seller-applications.preview');
        Route::get('/admin/seller-applications/{application}/preview/{type}/{index}', [App\Http\Controllers\SellerApplicationController::class, 'previewDocument'])->name('admin.seller-applications.preview.index');
        Route::get('/admin/seller-applications/{application}/download/{type}', [App\Http\Controllers\SellerApplicationController::class, 'downloadDocument'])->name('admin.seller-applications.download');
        Route::get('/admin/seller-applications/{application}/download/{type}/{index}', [App\Http\Controllers\SellerApplicationController::class, 'downloadDocument'])->name('admin.seller-applications.download.index');

        // Admin notifications routes
        Route::get('/admin/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('admin.notifications.index');
        Route::get('/admin/notifications/recent', [App\Http\Controllers\Admin\NotificationController::class, 'getRecent'])->name('admin.notifications.recent');
        Route::post('/admin/notifications/{id}/read', [App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
        Route::delete('/admin/notifications/{id}', [App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('admin.notifications.destroy');
        Route::post('/admin/notifications/read-all', [App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('admin.notifications.read-all');
        Route::post('/admin/notifications/clear-all', [App\Http\Controllers\Admin\NotificationController::class, 'clearAllHistory'])->name('admin.notifications.clear-all');

        // Admin logs routes
        Route::get('/admin/logs', [App\Http\Controllers\Admin\LogsController::class, 'index'])->name('admin.logs.index');
        Route::get('/admin/logs/download', [App\Http\Controllers\Admin\LogsController::class, 'download'])->name('admin.logs.download');
        Route::post('/admin/logs/clear', [App\Http\Controllers\Admin\LogsController::class, 'clear'])->name('admin.logs.clear');
        Route::get('/admin/logs/show', [App\Http\Controllers\Admin\LogsController::class, 'show'])->name('admin.logs.show');

        // Page Content Management Routes
        Route::get('/admin/page-content', [App\Http\Controllers\Admin\PageContentController::class, 'index'])->name('admin.page-content.index');
        Route::get('/admin/page-content/edit', [App\Http\Controllers\Admin\PageContentController::class, 'edit'])->name('admin.page-content.edit');
        Route::get('/admin/page-content/{id}/edit', [App\Http\Controllers\Admin\PageContentController::class, 'edit'])->name('admin.page-content.edit.id');
        Route::post('/admin/page-content', [App\Http\Controllers\Admin\PageContentController::class, 'store'])->name('admin.page-content.store');
        Route::delete('/admin/page-content/{id}', [App\Http\Controllers\Admin\PageContentController::class, 'destroy'])->name('admin.page-content.destroy');

        // Contact Messages Management Routes
        Route::get('/admin/contact-messages', [App\Http\Controllers\Admin\ContactMessageController::class, 'index'])->name('admin.contact-messages.index');
        Route::get('/admin/contact-messages/{contactMessage}', [App\Http\Controllers\Admin\ContactMessageController::class, 'show'])->name('admin.contact-messages.show');
        Route::post('/admin/contact-messages/{contactMessage}/update-status', [App\Http\Controllers\Admin\ContactMessageController::class, 'updateStatus'])->name('admin.contact-messages.update-status');
        Route::post('/admin/contact-messages/{contactMessage}/reply', [App\Http\Controllers\Admin\ContactMessageController::class, 'reply'])->name('admin.contact-messages.reply');
        Route::delete('/admin/contact-messages/{contactMessage}', [App\Http\Controllers\Admin\ContactMessageController::class, 'destroy'])->name('admin.contact-messages.destroy');
    });

    Route::middleware(['role:buyer'])->group(function () {
        Route::get('/buyer/dashboard', [App\Http\Controllers\Buyer\DashboardController::class, 'index'])->name('buyer.dashboard');

        // About and Contact pages
        Route::get('/buyer/about', [App\Http\Controllers\Buyer\AboutController::class, 'index'])->name('buyer.about');

        Route::get('/buyer/contact', function () {
            // Get dynamic page content
            $pageContents = \App\Models\PageContent::getPageContents(\App\Models\PageContent::PAGE_TYPE_CONTACT)
                ->map(function ($content) {
                    return [
                        'section' => $content->section,
                        'title' => $content->title,
                        'content' => $content->content,
                        'metadata' => $content->metadata,
                    ];
                })
                ->keyBy('section');

            return \Inertia\Inertia::render('buyer/Contact', [
                'pageContents' => $pageContents,
            ]);
        })->name('buyer.contact');

        Route::post('/buyer/contact', [HomeController::class, 'sendContactMessage'])->name('buyer.contact.send');

        // Product browsing routes
        Route::get('/buyer/products', [App\Http\Controllers\Buyer\ProductController::class, 'index'])->name('buyer.products');
        Route::get('/buyer/product/{product}', [App\Http\Controllers\Buyer\ProductController::class, 'show'])->name('buyer.product.show');

        // Product rating routes
        Route::get('/buyer/product/{product}/ratings', [App\Http\Controllers\Buyer\ProductRatingController::class, 'index'])->name('buyer.product.ratings.index');
        Route::post('/buyer/product/{product}/ratings', [App\Http\Controllers\Buyer\ProductRatingController::class, 'store'])->name('buyer.product.ratings.store');
        Route::put('/buyer/product/{product}/ratings/{rating}', [App\Http\Controllers\Buyer\ProductRatingController::class, 'update'])->name('buyer.product.ratings.update');
        Route::delete('/buyer/product/{product}/ratings/{rating}', [App\Http\Controllers\Buyer\ProductRatingController::class, 'destroy'])->name('buyer.product.ratings.destroy');
        Route::get('/buyer/product/{product}/ratings/user', [App\Http\Controllers\Buyer\ProductRatingController::class, 'getUserRating'])->name('buyer.product.ratings.user');

        // Seller browsing routes
        Route::get('/buyer/sellers', [App\Http\Controllers\Buyer\SellerController::class, 'index'])->name('buyer.sellers');
        Route::get('/buyer/seller/{seller}', [App\Http\Controllers\Buyer\SellerController::class, 'show'])->name('buyer.seller.show');

        // Seller rating routes
        Route::get('/buyer/seller/{seller}/ratings', [App\Http\Controllers\Buyer\SellerRatingController::class, 'index'])->name('buyer.seller.ratings.index');
        Route::post('/buyer/seller/{seller}/ratings', [App\Http\Controllers\Buyer\SellerRatingController::class, 'store'])->name('buyer.seller.ratings.store');
        Route::put('/buyer/seller/{seller}/ratings/{rating}', [App\Http\Controllers\Buyer\SellerRatingController::class, 'update'])->name('buyer.seller.ratings.update');
        Route::delete('/buyer/seller/{seller}/ratings/{rating}', [App\Http\Controllers\Buyer\SellerRatingController::class, 'destroy'])->name('buyer.seller.ratings.destroy');
        Route::get('/buyer/seller/{seller}/ratings/user', [App\Http\Controllers\Buyer\SellerRatingController::class, 'getUserRating'])->name('buyer.seller.ratings.user');

        // Cart and checkout routes
        Route::get('/buyer/cart', [App\Http\Controllers\Buyer\CartController::class, 'index'])->name('buyer.cart');
        Route::post('/buyer/cart/add', [App\Http\Controllers\Buyer\CartController::class, 'addToCart'])->name('buyer.cart.add');
        Route::put('/buyer/cart/update', [App\Http\Controllers\Buyer\CartController::class, 'updateQuantity'])->name('buyer.cart.update');
        Route::delete('/buyer/cart/remove', [App\Http\Controllers\Buyer\CartController::class, 'removeFromCart'])->name('buyer.cart.remove');
        Route::delete('/buyer/cart/clear', [App\Http\Controllers\Buyer\CartController::class, 'clearCart'])->name('buyer.cart.clear');
        Route::get('/buyer/cart/count', [App\Http\Controllers\Buyer\CartController::class, 'getCartCount'])->name('buyer.cart.count');

        Route::get('/buyer/checkout', function () {
            $user = auth()->user();

            // Check if profile is complete before allowing checkout
            $profileStatus = $user->getProfileCompletionStatus();
            if (! $profileStatus['is_complete']) {
                return redirect()
                    ->route('buyer.profile')
                    ->with('error', 'Please complete your profile information before checking out. We need your phone number and delivery address to process your order.');
            }

            $buyNow = request()->query('buy_now');
            $productId = request()->query('product_id');
            $quantity = request()->query('quantity', 1);

            $buyNowItem = null;

            // If buy_now is set, fetch the specific product
            if ($buyNow === 'true' && $productId) {
                $product = \App\Models\Product::with('seller')->find($productId);
                if ($product) {
                    $buyNowItem = [
                        'id' => $product->id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => (float) $product->price,
                        'quantity' => (int) $quantity,
                        'primary_image' => \App\Helpers\ImageHelper::url($product->featured_image ?? $product->primary_image),
                        'seller' => [
                            'id' => $product->seller->id,
                            'name' => $product->seller->business_name ?? $product->seller->name,
                        ],
                        'max_quantity' => $product->quantity,
                        'stock_quantity' => $product->quantity,
                        'shipping_cost' => (float) ($product->shipping_cost ?? 50),
                    ];
                }
            }

            return Inertia::render('buyer/Checkout', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone_number,
                    'phone_number' => $user->phone_number,
                    'address' => $user->address,
                    'delivery_address' => $user->delivery_address,
                    'delivery_phone' => $user->delivery_phone,
                    'delivery_notes' => $user->delivery_notes,
                    'delivery_province' => $user->delivery_province,
                    'delivery_city' => $user->delivery_city,
                    'delivery_barangay' => $user->delivery_barangay,
                    'delivery_street' => $user->delivery_street,
                    'delivery_building_details' => $user->delivery_building_details,
                    'delivery_latitude' => $user->delivery_latitude,
                    'delivery_longitude' => $user->delivery_longitude,
                    'gcash_number' => $user->gcash_number,
                    'gcash_name' => $user->gcash_name,
                ],
                'buyNowItem' => $buyNowItem,
            ]);
        })->name('buyer.checkout');

        // Order Management Routes
        Route::resource('/buyer/orders', App\Http\Controllers\Buyer\OrderController::class, [
            'as' => 'buyer',
            'only' => ['index', 'store', 'show', 'destroy'],
        ]);

        // Additional order routes
        Route::post('/buyer/orders/clear-all', [App\Http\Controllers\Buyer\OrderController::class, 'clearAllHistory'])->name('buyer.orders.clear-all');
        Route::post('/buyer/orders/{order}/upload-payment-proof', [App\Http\Controllers\Buyer\OrderController::class, 'uploadPaymentProof'])->name('buyer.orders.upload-payment-proof');

        // Buyer Notification Routes
        Route::get('/buyer/notifications', [App\Http\Controllers\Buyer\NotificationController::class, 'index'])->name('buyer.notifications.index');
        Route::get('/buyer/notifications/recent', [App\Http\Controllers\Buyer\NotificationController::class, 'getRecent'])->name('buyer.notifications.recent');
        Route::post('/buyer/notifications/{id}/read', [App\Http\Controllers\Buyer\NotificationController::class, 'markAsRead'])->name('buyer.notifications.read');
        Route::delete('/buyer/notifications/{id}', [App\Http\Controllers\Buyer\NotificationController::class, 'destroy'])->name('buyer.notifications.destroy');
        Route::post('/buyer/notifications/read-all', [App\Http\Controllers\Buyer\NotificationController::class, 'markAllAsRead'])->name('buyer.notifications.read-all');
        Route::post('/buyer/notifications/clear-all', [App\Http\Controllers\Buyer\NotificationController::class, 'clearAllHistory'])->name('buyer.notifications.clear-all');

        // Buyer profile routes
        Route::get('/buyer/profile', [App\Http\Controllers\BuyerProfileController::class, 'show'])->name('buyer.profile');
        Route::post('/buyer/profile', [App\Http\Controllers\BuyerProfileController::class, 'update'])->name('buyer.profile.update');
        Route::post('/buyer/profile/delete-picture', [App\Http\Controllers\BuyerProfileController::class, 'deleteProfilePicture'])->name('buyer.profile.delete-picture');
        Route::post('/buyer/profile/change-password', [App\Http\Controllers\BuyerProfileController::class, 'changePassword'])->name('buyer.profile.change-password');
        Route::post('/buyer/profile/delete-account', [App\Http\Controllers\BuyerProfileController::class, 'deleteAccount'])->name('buyer.profile.delete-account');

        // Data export route (GDPR compliance)
        Route::get('/data-export', [App\Http\Controllers\DataExportController::class, 'exportUserData'])->name('data.export');

        // Seller application routes for buyers
        Route::get('/seller/apply', [App\Http\Controllers\SellerApplicationController::class, 'showPreApplicationMessage'])->name('seller.application.confirm');
        Route::get('/seller/apply/form', [App\Http\Controllers\SellerApplicationController::class, 'create'])->name('seller.application.create');
        Route::post('/seller/apply', [App\Http\Controllers\SellerApplicationController::class, 'store'])->name('seller.application.store');

        // Custom Order Request Routes for Buyers
        Route::get('/buyer/custom-orders', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'index'])->name('buyer.custom-orders.index');
        Route::get('/buyer/custom-orders/create', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'create'])->name('buyer.custom-orders.create');
        Route::post('/buyer/custom-orders', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'store'])->name('buyer.custom-orders.store');
        Route::get('/buyer/custom-orders/{customOrderRequest}', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'show'])->name('buyer.custom-orders.show');
        Route::post('/buyer/custom-orders/{customOrderRequest}/accept', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'acceptQuote'])->name('buyer.custom-orders.accept');
        Route::post('/buyer/custom-orders/{customOrderRequest}/decline', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'declineQuote'])->name('buyer.custom-orders.decline');
        Route::post('/buyer/custom-orders/{customOrderRequest}/cancel', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'cancel'])->name('buyer.custom-orders.cancel');
        Route::get('/buyer/custom-orders/{customOrderRequest}/checkout', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'checkout'])->name('buyer.custom-orders.checkout');
        Route::post('/buyer/custom-orders/{customOrderRequest}/place-order', [App\Http\Controllers\Buyer\CustomOrderRequestController::class, 'placeOrder'])->name('buyer.custom-orders.place-order');
    });

    // Routes accessible by multiple roles
    Route::middleware(['role:seller,administrator'])->group(function () {
        Route::get('/management', function () {
            return Inertia::render('management/dashboard');
        })->name('management.dashboard');
    });
});

// Profile Management Routes (available to all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('user.profile.edit');
    Route::put('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('user.profile.update');
    Route::post('/profile/password', [App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('user.profile.password');
    Route::post('/profile/avatar', [App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('user.profile.avatar');
    Route::delete('/profile/avatar', [App\Http\Controllers\ProfileController::class, 'deleteAvatar'])->name('user.profile.avatar.delete');
    Route::post('/profile/send-verification', [App\Http\Controllers\ProfileController::class, 'sendVerification'])->name('user.profile.send-verification');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('user.profile.destroy');

    // Profile completion tracking routes
    Route::post('/profile/dismiss-completion-reminder', [App\Http\Controllers\ProfileController::class, 'dismissProfileCompletionReminder'])->name('user.profile.dismiss-completion-reminder');
    Route::get('/profile/completion-status', [App\Http\Controllers\ProfileController::class, 'getProfileCompletionStatus'])->name('user.profile.completion-status');

    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [App\Http\Controllers\ChatController::class, 'index'])->name('index');
        Route::post('/conversation', [App\Http\Controllers\ChatController::class, 'getOrCreateConversation'])->name('conversation.create');
        Route::get('/conversation/{conversationId}/messages', [App\Http\Controllers\ChatController::class, 'getMessages'])->name('conversation.messages');
        Route::post('/conversation/{conversationId}/message', [App\Http\Controllers\ChatController::class, 'sendMessage'])->name('conversation.send');
        Route::post('/conversation/{conversationId}/read', [App\Http\Controllers\ChatController::class, 'markAsRead'])->name('conversation.read');
        Route::post('/conversation/{conversationId}/typing/start', [App\Http\Controllers\ChatController::class, 'startTyping'])->name('conversation.typing.start');
        Route::post('/conversation/{conversationId}/typing/stop', [App\Http\Controllers\ChatController::class, 'stopTyping'])->name('conversation.typing.stop');
        Route::delete('/conversations/{conversationId}', [App\Http\Controllers\ChatController::class, 'deleteConversation'])->name('conversation.delete');
    });

    // API routes for chat
    Route::get('/api/chat/unread-count', [App\Http\Controllers\ChatController::class, 'getUnreadCount'])->name('api.chat.unread-count');
    Route::get('/api/chat/conversations', [App\Http\Controllers\ChatController::class, 'getConversations'])->name('api.chat.conversations');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Image serving route for when storage symlink doesn't work
Route::get('/images/{path}', function ($path) {
    try {
        // Decode the path in case it's URL encoded (handles both encoded and unencoded)
        $decodedPath = urldecode($path);

        // Remove any leading slashes
        $decodedPath = ltrim($decodedPath, '/');

        // Ensure storage directory exists
        $storageBase = storage_path('app/public');
        if (! is_dir($storageBase)) {
            \Illuminate\Support\Facades\File::makeDirectory($storageBase, 0755, true);
        }

        $fullPath = $storageBase.'/'.$decodedPath;

        // Security: prevent directory traversal
        // First check if the file exists at the expected location
        if (! file_exists($fullPath)) {
            // Return placeholder image instead of 404 for better UX
            $placeholderPath = public_path('placeholder.jpg');
            if (file_exists($placeholderPath)) {
                return response()->file($placeholderPath, [
                    'Content-Type' => 'image/jpeg',
                    'Cache-Control' => 'public, max-age=3600',
                ]);
            }
            abort(404);
        }

        // Resolve the real path to prevent directory traversal
        $resolvedPath = realpath($fullPath);
        $storagePath = realpath(storage_path('app/public'));

        if (! $resolvedPath || ! $storagePath) {
            \Log::warning('Image path resolution failed', [
                'full_path' => $fullPath,
                'resolved_path' => $resolvedPath,
                'storage_path' => $storagePath,
            ]);
            abort(404);
        }

        // Security check: ensure resolved path is within storage/public
        if (strpos($resolvedPath, $storagePath) !== 0) {
            \Log::warning('Image path security check failed - directory traversal attempt', [
                'path' => $decodedPath,
                'resolved' => $resolvedPath,
                'storage_base' => $storagePath,
            ]);
            abort(404);
        }

        if (is_file($resolvedPath)) {
            try {
                $mimeType = mime_content_type($resolvedPath);
            } catch (\Exception $e) {
                // Fallback mime type based on extension
                $extension = strtolower(pathinfo($resolvedPath, PATHINFO_EXTENSION));
                $mimeType = match ($extension) {
                    'jpg', 'jpeg' => 'image/jpeg',
                    'png' => 'image/png',
                    'gif' => 'image/gif',
                    'webp' => 'image/webp',
                    default => 'application/octet-stream',
                };
            }

            return response()->file($resolvedPath, [
                'Content-Type' => $mimeType ?: 'image/jpeg',
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        }

        // Return 404 if not a file
        abort(404);
    } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
        throw $e;
    } catch (\Exception $e) {
        \Log::error('Image serving error: '.$e->getMessage(), [
            'path' => $path ?? 'unknown',
            'trace' => $e->getTraceAsString(),
        ]);
        abort(404);
    }
})->where('path', '.*');

// API placeholder image route
Route::get('/api/placeholder/{width}/{height}', function ($width, $height) {
    // Create a simple placeholder image
    $image = imagecreate($width, $height);
    $bgColor = imagecolorallocate($image, 240, 240, 240); // Light gray background
    $textColor = imagecolorallocate($image, 100, 100, 100); // Dark gray text

    // Add text to show dimensions
    $text = "{$width}x{$height}";
    $fontSize = min($width, $height) / 10;
    $x = ($width - strlen($text) * $fontSize * 0.6) / 2;
    $y = ($height + $fontSize) / 2;

    imagestring($image, 5, $x, $y - 10, $text, $textColor);

    // Output the image
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
    imagepng($image);
    imagedestroy($image);

    return response('', 200);
})->where(['width' => '[0-9]+', 'height' => '[0-9]+']);
