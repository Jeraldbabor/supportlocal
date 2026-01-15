<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\ProductRating;
use App\Models\SellerRating;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DataExportController extends Controller
{
    /**
     * Export user's personal data (GDPR compliance).
     */
    public function exportUserData(Request $request)
    {
        $user = Auth::user();

        // Collect all user data
        $userData = [
            'export_date' => now()->toIso8601String(),
            'user' => $this->getUserData($user),
            'orders' => $this->getOrdersData($user),
            'wishlist' => $this->getWishlistData($user),
            'ratings_given' => $this->getRatingsGivenData($user),
            'ratings_received' => $this->getRatingsReceivedData($user),
            'conversations' => $this->getConversationsData($user),
            'products' => $this->getProductsData($user),
            'seller_applications' => $this->getSellerApplicationsData($user),
        ];

        // Generate JSON file
        $filename = 'user_data_export_'.$user->id.'_'.now()->format('Y-m-d_His').'.json';
        $jsonContent = json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Return download response
        return response($jsonContent, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * Get user's basic data.
     */
    private function getUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'role' => $user->role,
            'delivery_address' => $user->delivery_address,
            'delivery_phone' => $user->delivery_phone,
            'delivery_notes' => $user->delivery_notes,
            'delivery_province' => $user->delivery_province,
            'delivery_city' => $user->delivery_city,
            'delivery_barangay' => $user->delivery_barangay,
            'delivery_street' => $user->delivery_street,
            'delivery_building_details' => $user->delivery_building_details,
            'gcash_number' => $user->gcash_number,
            'gcash_name' => $user->gcash_name,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at->toIso8601String(),
            'updated_at' => $user->updated_at->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'is_active' => $user->is_active,
            'average_rating' => $user->average_rating,
            'review_count' => $user->review_count,
        ];
    }

    /**
     * Get user's orders data.
     */
    private function getOrdersData(User $user): array
    {
        $orders = Order::where('user_id', $user->id)
            ->with(['orderItems.product', 'seller:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'seller' => [
                    'id' => $order->seller->id,
                    'name' => $order->seller->name,
                    'email' => $order->seller->email,
                ],
                'shipping_name' => $order->shipping_name,
                'shipping_email' => $order->shipping_email,
                'shipping_phone' => $order->shipping_phone,
                'shipping_address' => $order->shipping_address,
                'delivery_address' => $order->delivery_address,
                'delivery_phone' => $order->delivery_phone,
                'delivery_notes' => $order->delivery_notes,
                'payment_method' => $order->payment_method,
                'gcash_number' => $order->gcash_number,
                'gcash_reference' => $order->gcash_reference,
                'subtotal' => $order->subtotal,
                'shipping_fee' => $order->shipping_fee,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'special_instructions' => $order->special_instructions,
                'rejection_reason' => $order->rejection_reason,
                'created_at' => $order->created_at->toIso8601String(),
                'updated_at' => $order->updated_at->toIso8601String(),
                'seller_confirmed_at' => $order->seller_confirmed_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
                'delivered_at' => $order->delivered_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name ?? 'N/A',
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->price * $item->quantity,
                    ];
                }),
            ];
        })->toArray();
    }

    /**
     * Get user's wishlist data.
     */
    private function getWishlistData(User $user): array
    {
        $wishlistItems = WishlistItem::where('user_id', $user->id)
            ->with('product:id,name,price,featured_image')
            ->orderBy('created_at', 'desc')
            ->get();

        return $wishlistItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name ?? 'N/A',
                'product_price' => $item->product->price ?? null,
                'added_at' => $item->created_at->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Get ratings given by user.
     */
    private function getRatingsGivenData(User $user): array
    {
        $productRatings = ProductRating::where('user_id', $user->id)
            ->with('product:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rating) {
                return [
                    'type' => 'product',
                    'id' => $rating->id,
                    'product_id' => $rating->product_id,
                    'product_name' => $rating->product->name ?? 'N/A',
                    'rating' => $rating->rating,
                    'comment' => $rating->comment,
                    'created_at' => $rating->created_at->toIso8601String(),
                    'updated_at' => $rating->updated_at->toIso8601String(),
                ];
            });

        $sellerRatings = SellerRating::where('user_id', $user->id)
            ->with('seller:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rating) {
                return [
                    'type' => 'seller',
                    'id' => $rating->id,
                    'seller_id' => $rating->seller_id,
                    'seller_name' => $rating->seller->name ?? 'N/A',
                    'rating' => $rating->rating,
                    'comment' => $rating->comment,
                    'created_at' => $rating->created_at->toIso8601String(),
                    'updated_at' => $rating->updated_at->toIso8601String(),
                ];
            });

        return [
            'product_ratings' => $productRatings->toArray(),
            'seller_ratings' => $sellerRatings->toArray(),
        ];
    }

    /**
     * Get ratings received by user (if seller).
     */
    private function getRatingsReceivedData(User $user): array
    {
        if (! $user->isSeller()) {
            return [];
        }

        $sellerRatings = SellerRating::where('seller_id', $user->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return $sellerRatings->map(function ($rating) {
            return [
                'id' => $rating->id,
                'user_id' => $rating->user_id,
                'user_name' => $rating->user->name ?? 'N/A',
                'rating' => $rating->rating,
                'comment' => $rating->comment,
                'reply' => $rating->reply,
                'created_at' => $rating->created_at->toIso8601String(),
                'updated_at' => $rating->updated_at->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Get user's conversations data.
     */
    private function getConversationsData(User $user): array
    {
        $conversations = Conversation::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer:id,name,email', 'seller:id,name,email', 'messages'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return $conversations->map(function ($conversation) use ($user) {
            $otherParty = $conversation->buyer_id === $user->id
                ? $conversation->seller
                : $conversation->buyer;

            return [
                'id' => $conversation->id,
                'other_party' => [
                    'id' => $otherParty->id ?? null,
                    'name' => $otherParty->name ?? 'N/A',
                    'email' => $otherParty->email ?? 'N/A',
                ],
                'role' => $conversation->buyer_id === $user->id ? 'buyer' : 'seller',
                'created_at' => $conversation->created_at->toIso8601String(),
                'updated_at' => $conversation->updated_at->toIso8601String(),
                'messages' => $conversation->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'sender_id' => $message->sender_id,
                        'content' => $message->content,
                        'is_read' => $message->is_read,
                        'created_at' => $message->created_at->toIso8601String(),
                    ];
                }),
            ];
        })->toArray();
    }

    /**
     * Get user's products data (if seller).
     */
    private function getProductsData(User $user): array
    {
        if (! $user->isSeller()) {
            return [];
        }

        $products = $user->products()->orderBy('created_at', 'desc')->get();

        return $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'quantity' => $product->quantity,
                'status' => $product->status,
                'stock_status' => $product->stock_status,
                'is_featured' => $product->is_featured,
                'view_count' => $product->view_count,
                'created_at' => $product->created_at->toIso8601String(),
                'updated_at' => $product->updated_at->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Get user's seller applications data.
     */
    private function getSellerApplicationsData(User $user): array
    {
        $applications = $user->sellerApplications()->orderBy('created_at', 'desc')->get();

        return $applications->map(function ($application) {
            return [
                'id' => $application->id,
                'business_name' => $application->business_name,
                'business_description' => $application->business_description,
                'business_address' => $application->business_address,
                'business_phone' => $application->business_phone,
                'business_email' => $application->business_email,
                'status' => $application->status,
                'rejection_reason' => $application->rejection_reason,
                'created_at' => $application->created_at->toIso8601String(),
                'updated_at' => $application->updated_at->toIso8601String(),
                'approved_at' => $application->approved_at?->toIso8601String(),
            ];
        })->toArray();
    }
}
