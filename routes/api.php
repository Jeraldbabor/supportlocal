<?php

use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\CartController;
use App\Http\Controllers\Api\Mobile\CategoryController;
use App\Http\Controllers\Api\Mobile\OrderController;
use App\Http\Controllers\Api\Mobile\ProductController;
use App\Http\Controllers\Api\Mobile\SellerController;
use App\Http\Controllers\Api\Mobile\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public routes (no authentication required)
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

    // Products (public browsing)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/top-rated', [ProductController::class, 'topRated']);
    Route::get('/products/trending', [ProductController::class, 'trending']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/{product}/ratings', [ProductController::class, 'ratings']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::get('/categories/{category}/products', [CategoryController::class, 'products']);

    // Sellers/Artisans (public profiles)
    Route::get('/sellers', [SellerController::class, 'index']);
    Route::get('/sellers/{seller}', [SellerController::class, 'show']);
    Route::get('/sellers/{seller}/products', [SellerController::class, 'products']);
    Route::get('/sellers/{seller}/ratings', [SellerController::class, 'ratings']);
});

// Protected routes (authentication required)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/user', [AuthController::class, 'updateProfile']);
    Route::post('/auth/user/avatar', [AuthController::class, 'updateAvatar']);
    Route::put('/auth/user/password', [AuthController::class, 'updatePassword']);
    Route::put('/auth/user/delivery-address', [AuthController::class, 'updateDeliveryAddress']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update', [CartController::class, 'update']);
    Route::delete('/cart/remove', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::post('/wishlist/add', [WishlistController::class, 'add']);
    Route::delete('/wishlist/remove', [WishlistController::class, 'remove']);
    Route::delete('/wishlist/clear', [WishlistController::class, 'clear']);

    // Orders (Buyer)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{order}/payment-proof', [OrderController::class, 'uploadPaymentProof']);

    // Product ratings (authenticated users can rate)
    Route::post('/products/{product}/ratings', [ProductController::class, 'storeRating']);
    Route::put('/products/{product}/ratings/{rating}', [ProductController::class, 'updateRating']);
    Route::delete('/products/{product}/ratings/{rating}', [ProductController::class, 'deleteRating']);

    // Seller ratings (authenticated users can rate)
    Route::post('/sellers/{seller}/ratings', [SellerController::class, 'storeRating']);
    Route::put('/sellers/{seller}/ratings/{rating}', [SellerController::class, 'updateRating']);
    Route::delete('/sellers/{seller}/ratings/{rating}', [SellerController::class, 'deleteRating']);

    // Notifications
    Route::get('/notifications', [AuthController::class, 'notifications']);
    Route::post('/notifications/{id}/read', [AuthController::class, 'markNotificationAsRead']);
    Route::post('/notifications/read-all', [AuthController::class, 'markAllNotificationsAsRead']);

    // Custom Orders (Buyer)
    Route::get('/custom-orders/categories', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'categories']);
    Route::get('/custom-orders', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'index']);
    Route::post('/custom-orders', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'store']);
    Route::get('/custom-orders/{customOrder}', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'show']);
    Route::post('/custom-orders/{customOrder}/cancel', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'cancel']);
    Route::post('/custom-orders/{customOrder}/accept-quote', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'acceptQuote']);
    Route::post('/custom-orders/{customOrder}/decline-quote', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'declineQuote']);
    Route::post('/custom-orders/{customOrder}/bids/{bid}/accept', [App\Http\Controllers\Api\Mobile\CustomOrderController::class, 'acceptBid']);

    // Chat/Messaging
    Route::get('/chat/conversations', [App\Http\Controllers\Api\Mobile\ChatController::class, 'conversations']);
    Route::post('/chat/conversations', [App\Http\Controllers\Api\Mobile\ChatController::class, 'getOrCreateConversation']);
    Route::get('/chat/conversations/{conversation}/messages', [App\Http\Controllers\Api\Mobile\ChatController::class, 'messages']);
    Route::post('/chat/conversations/{conversation}/messages', [App\Http\Controllers\Api\Mobile\ChatController::class, 'sendMessage']);
    Route::delete('/chat/conversations/{conversation}', [App\Http\Controllers\Api\Mobile\ChatController::class, 'deleteConversation']);
    Route::get('/chat/unread-count', [App\Http\Controllers\Api\Mobile\ChatController::class, 'unreadCount']);
});

// Seller-specific routes (authenticated sellers only)
Route::prefix('v1/seller')->middleware(['auth:sanctum'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Api\Mobile\Seller\DashboardController::class, 'index']);
    Route::get('/dashboard/quick-stats', [App\Http\Controllers\Api\Mobile\Seller\DashboardController::class, 'quickStats']);

    // Products management
    Route::get('/categories', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'categories']);
    Route::get('/products', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'index']);
    Route::post('/products', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'store']);
    Route::get('/products/{product}', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'show']);
    Route::put('/products/{product}', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'update']);
    Route::delete('/products/{product}', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'destroy']);
    Route::post('/products/{product}/toggle-status', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'toggleStatus']);
    Route::put('/products/{product}/inventory', [App\Http\Controllers\Api\Mobile\Seller\ProductController::class, 'updateInventory']);

    // Orders management
    Route::get('/orders/stats', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'stats']);
    Route::get('/orders', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'show']);
    Route::post('/orders/{order}/confirm', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'confirm']);
    Route::post('/orders/{order}/reject', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'reject']);
    Route::post('/orders/{order}/ship', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'ship']);
    Route::post('/orders/{order}/complete', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'complete']);
    Route::post('/orders/{order}/verify-payment', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'verifyPayment']);
    Route::post('/orders/{order}/reject-payment', [App\Http\Controllers\Api\Mobile\Seller\OrderController::class, 'rejectPayment']);

    // Marketplace (Bidding on public requests)
    Route::get('/marketplace', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'index']);
    Route::get('/marketplace/{customOrder}', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'show']);
    Route::post('/marketplace/{customOrder}/bid', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'submitBid']);
    Route::get('/my-bids', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'myBids']);
    Route::put('/my-bids/{bid}', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'updateBid']);
    Route::post('/my-bids/{bid}/withdraw', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'withdrawBid']);

    // Direct Custom Order Requests (for this seller)
    Route::get('/custom-requests', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'directRequests']);
    Route::post('/custom-requests/{customOrder}/quote', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'submitQuote']);
    Route::post('/custom-requests/{customOrder}/start-work', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'startWork']);
    Route::post('/custom-requests/{customOrder}/send-for-checkout', [App\Http\Controllers\Api\Mobile\Seller\MarketplaceController::class, 'sendForCheckout']);
});
