<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the buyer dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get buyer's order statistics
        $totalOrders = Order::where('user_id', $user->id)->count();
        $pendingOrders = Order::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();
        $completedOrders = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // Get total amount spent
        $totalSpent = Order::where('user_id', $user->id)
            ->whereIn('status', ['completed', 'shipped', 'processing'])
            ->sum('total_amount');

        // Get total reviews given
        $totalReviews = ProductRating::where('user_id', $user->id)->count();

        // Get average rating given by the user
        $averageRating = ProductRating::where('user_id', $user->id)->avg('rating');

        // Get recent orders (last 5)
        $recentOrders = Order::where('user_id', $user->id)
            ->with(['seller:id,name,email', 'items.product:id,name,price,images'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'items_count' => $order->items->count(),
                    'seller_name' => $order->seller ? $order->seller->name : 'Unknown Seller',
                    'created_at' => $order->created_at->format('M d, Y'),
                    'created_at_human' => $order->created_at->diffForHumans(),
                    'items' => $order->items->filter(fn($item) => $item->product)->map(function ($item) {
                        return [
                            'product_name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'image' => $item->product->images,
                        ];
                    })->values(),
                ];
            });

        // Get recent activity (orders and reviews combined)
        $recentActivity = collect();

        // Add recent orders to activity
        $orderActivities = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'order',
                    'status' => $order->status,
                    'description' => "Order #{$order->order_number}",
                    'amount' => $order->total_amount,
                    'date' => $order->created_at->format('M d, Y'),
                    'date_human' => $order->created_at->diffForHumans(),
                    'timestamp' => $order->created_at->timestamp,
                ];
            });

        // Add recent reviews to activity
        $reviewActivities = ProductRating::where('user_id', $user->id)
            ->with('product:id,name')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->filter(fn($rating) => $rating->product)
            ->map(function ($rating) {
                return [
                    'type' => 'review',
                    'product_name' => $rating->product->name,
                    'rating' => $rating->rating,
                    'description' => "Reviewed {$rating->product->name}",
                    'date' => $rating->created_at->format('M d, Y'),
                    'date_human' => $rating->created_at->diffForHumans(),
                    'timestamp' => $rating->created_at->timestamp,
                ];
            });

        // Merge and sort activities by timestamp
        $recentActivity = $orderActivities
            ->concat($reviewActivities)
            ->sortByDesc('timestamp')
            ->take(5)
            ->values();

        return Inertia::render('buyer/dashboard', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
                'completedOrders' => $completedOrders,
                'totalSpent' => $totalSpent,
                'totalReviews' => $totalReviews,
                'averageRating' => $averageRating ? round($averageRating, 1) : 0,
            ],
            'recentOrders' => $recentOrders,
            'recentActivity' => $recentActivity,
        ]);
    }
}
