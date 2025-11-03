<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\CartController;
use Inertia\Inertia;

// Public/Guest E-commerce routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'sendContactMessage'])->name('contact.send');

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

// Guest checkout route - prompts to login or continue
Route::get('/checkout', function () {
    return Inertia::render('GuestCheckout');
})->name('checkout');

// API route for transferring guest cart to authenticated user
Route::post('/api/cart/transfer', [App\Http\Controllers\Api\CartTransferController::class, 'transfer'])
    ->middleware('auth')
    ->name('api.cart.transfer');

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

        Route::get('/seller/dashboard', [App\Http\Controllers\Seller\DashboardController::class, 'index'])->name('seller.dashboard');

        // Order Management Routes
        Route::get('/seller/orders', [App\Http\Controllers\Seller\OrderController::class, 'index'])->name('seller.orders');
        Route::get('/seller/orders/{order}', [App\Http\Controllers\Seller\OrderController::class, 'show'])->name('seller.orders.show');
        Route::post('/seller/orders/{order}/confirm', [App\Http\Controllers\Seller\OrderController::class, 'confirm'])->name('seller.orders.confirm');
        Route::post('/seller/orders/{order}/reject', [App\Http\Controllers\Seller\OrderController::class, 'reject'])->name('seller.orders.reject');
        Route::post('/seller/orders/{order}/complete', [App\Http\Controllers\Seller\OrderController::class, 'complete'])->name('seller.orders.complete');

        // Customer Management Routes
        Route::get('/seller/customers', [App\Http\Controllers\Seller\CustomerController::class, 'index'])->name('seller.customers');
        Route::get('/seller/customers/{customer}', [App\Http\Controllers\Seller\CustomerController::class, 'show'])->name('seller.customers.show');
        Route::get('/seller/customers/{customer}/orders', [App\Http\Controllers\Seller\CustomerController::class, 'orders'])->name('seller.customers.orders');

        Route::get('/seller/analytics', function () {
            return Inertia::render('seller/analytics');
        })->name('seller.analytics');

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
        Route::post('/seller/notifications/{id}/read', [App\Http\Controllers\Seller\NotificationController::class, 'markAsRead'])->name('seller.notifications.read');
        Route::delete('/seller/notifications/{id}', [App\Http\Controllers\Seller\NotificationController::class, 'destroy'])->name('seller.notifications.destroy');
        Route::post('/seller/notifications/read-all', [App\Http\Controllers\Seller\NotificationController::class, 'markAllAsRead'])->name('seller.notifications.read-all');
        Route::post('/seller/notifications/clear-all', [App\Http\Controllers\Seller\NotificationController::class, 'clearAllHistory'])->name('seller.notifications.clear-all');
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

        Route::get('/admin/reports', function () {
            return Inertia::render('admin/reports');
        })->name('admin.reports');

        Route::get('/admin/settings', function () {
            return Inertia::render('admin/settings');
        })->name('admin.settings');

        // Seller application management routes
        Route::get('/admin/seller-applications', [App\Http\Controllers\SellerApplicationController::class, 'index'])->name('admin.seller-applications.index');
        Route::get('/admin/seller-applications/{application}', [App\Http\Controllers\SellerApplicationController::class, 'show'])->name('admin.seller-applications.show');
        Route::post('/admin/seller-applications/{application}/approve', [App\Http\Controllers\SellerApplicationController::class, 'approve'])->name('admin.seller-applications.approve');
        Route::post('/admin/seller-applications/{application}/reject', [App\Http\Controllers\SellerApplicationController::class, 'reject'])->name('admin.seller-applications.reject');
        Route::get('/admin/seller-applications/{application}/download/{type}', [App\Http\Controllers\SellerApplicationController::class, 'downloadDocument'])->name('admin.seller-applications.download');
    });

    Route::middleware(['role:buyer'])->group(function () {
        Route::get('/buyer/dashboard', function () {
            return Inertia::render('buyer/dashboard');
        })->name('buyer.dashboard');

        // About and Contact pages
        Route::get('/buyer/about', function () {
            return Inertia::render('buyer/About');
        })->name('buyer.about');
        
        Route::get('/buyer/contact', function () {
            return Inertia::render('buyer/Contact');
        })->name('buyer.contact');
        
        Route::post('/buyer/contact', [HomeController::class, 'sendContactMessage'])->name('buyer.contact.send');

        // Product browsing routes
        Route::get('/buyer/products', [App\Http\Controllers\Buyer\ProductController::class, 'index'])->name('buyer.products');
        Route::get('/buyer/product/{product}', [App\Http\Controllers\Buyer\ProductController::class, 'show'])->name('buyer.product.show');

        // Seller browsing routes
        Route::get('/buyer/sellers', [App\Http\Controllers\Buyer\SellerController::class, 'index'])->name('buyer.sellers');
        Route::get('/buyer/seller/{seller}', [App\Http\Controllers\Buyer\SellerController::class, 'show'])->name('buyer.seller.show');

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
            if (!$profileStatus['is_complete']) {
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
                        'primary_image' => $product->featured_image ?? $product->primary_image,
                        'seller' => [
                            'id' => $product->seller->id,
                            'name' => $product->seller->business_name ?? $product->seller->name,
                        ],
                        'max_quantity' => $product->quantity,
                        'stock_quantity' => $product->quantity,
                    ];
                }
            }

            return Inertia::render('buyer/Checkout', [
                'user' => $user,
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

        // Buyer Notification Routes
        Route::get('/buyer/notifications', [App\Http\Controllers\Buyer\NotificationController::class, 'index'])->name('buyer.notifications.index');
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

        // Seller application routes for buyers
        Route::get('/seller/apply', [App\Http\Controllers\SellerApplicationController::class, 'showPreApplicationMessage'])->name('seller.application.confirm');
        Route::get('/seller/apply/form', [App\Http\Controllers\SellerApplicationController::class, 'create'])->name('seller.application.create');
        Route::post('/seller/apply', [App\Http\Controllers\SellerApplicationController::class, 'store'])->name('seller.application.store');
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Image serving route for when storage symlink doesn't work
Route::get('/images/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (file_exists($fullPath)) {
        return response()->file($fullPath);
    }
    
    // Return placeholder if file doesn't exist
    abort(404);
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
