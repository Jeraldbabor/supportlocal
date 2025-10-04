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
        'productId' => $id,
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

        Route::get('/seller/dashboard', [App\Http\Controllers\Seller\DashboardController::class, 'index'])->name('seller.dashboard');

        Route::get('/seller/orders', function () {
            return Inertia::render('seller/orders');
        })->name('seller.orders');

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
            ]
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

        Route::get('/buyer/products', function () {
            return Inertia::render('buyer/products/Index');
        })->name('buyer.products');

        Route::get('/buyer/product/{id}', function ($id) {
            return Inertia::render('buyer/products/Detail', [
                'productId' => $id,
            ]);
        })->name('buyer.product.detail');

        Route::get('/buyer/orders', function () {
            return Inertia::render('buyer/orders');
        })->name('buyer.orders');

        Route::get('/buyer/wishlist', function () {
            return Inertia::render('buyer/wishlist');
        })->name('buyer.wishlist');

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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

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
