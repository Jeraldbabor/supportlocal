<?php

namespace App\Http\Controllers\Api\Mobile\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use App\Notifications\PaymentRejected;
use App\Notifications\PaymentVerified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * List seller's orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $query = Order::whereHas('items', function ($q) use ($user) {
            $q->whereHas('product', fn ($q) => $q->where('seller_id', $user->id));
        });

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by payment status
        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Filter by payment method
        if ($paymentMethod = $request->input('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        // Filter for payment verification needed
        if ($request->boolean('needs_verification')) {
            $query->where('payment_method', 'gcash')
                ->where('payment_status', 'pending')
                ->whereNotNull('payment_proof');
        }

        // Search by order number or customer name
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->input('per_page', 20), 50);
        $orders = $query->with([
            'user:id,name,email,avatar,phone',
            'items' => function ($q) use ($user) {
                $q->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))
                    ->with('product:id,name,images,price');
            },
        ])->paginate($perPage);

        // Transform orders to include seller-specific totals
        $transformedOrders = $orders->getCollection()->map(function ($order) {
            $sellerTotal = $order->items->sum(fn ($item) => $item->price * $item->quantity);

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'has_payment_proof' => ! empty($order->payment_proof),
                'seller_total' => $sellerTotal,
                'items_count' => $order->items->count(),
                'customer' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'avatar' => $order->user->avatar,
                ] : null,
                'first_item' => $order->items->first() ? [
                    'name' => $order->items->first()->product->name ?? 'Unknown',
                    'image' => $order->items->first()->product->images[0] ?? null,
                    'quantity' => $order->items->first()->quantity,
                ] : null,
                'created_at' => $order->created_at->toIso8601String(),
                'updated_at' => $order->updated_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedOrders,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get order details
     */
    public function show(Order $order): JsonResponse
    {
        $user = Auth::user();

        // Check if order contains seller's products
        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load([
            'user:id,name,email,avatar,phone,address',
            'items' => function ($q) use ($user) {
                $q->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))
                    ->with('product:id,name,images,price,sku');
            },
        ]);

        $sellerTotal = $order->items->sum(fn ($item) => $item->price * $item->quantity);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'payment_proof' => $order->payment_proof,
                'seller_total' => $sellerTotal,
                'shipping_name' => $order->shipping_name,
                'shipping_phone' => $order->shipping_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_notes' => $order->shipping_notes,
                'tracking_number' => $order->tracking_number,
                'shipping_carrier' => $order->shipping_carrier,
                'notes' => $order->notes,
                'customer' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                    'avatar' => $order->user->avatar,
                ] : null,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name ?? 'Unknown',
                    'sku' => $item->product->sku ?? null,
                    'image' => $item->product->images[0] ?? null,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->price * $item->quantity,
                ]),
                'created_at' => $order->created_at->toIso8601String(),
                'updated_at' => $order->updated_at->toIso8601String(),
                'confirmed_at' => $order->confirmed_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Confirm an order
     */
    public function confirm(Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending orders can be confirmed.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Get seller's items
            $sellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->get();

            // Check and reduce stock
            foreach ($sellerItems as $item) {
                $product = $item->product;
                if ($product->quantity < $item->quantity) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for {$product->name}. Available: {$product->quantity}",
                    ], 422);
                }
                $product->decrement('quantity', $item->quantity);
            }

            $order->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            // Notify customer
            if ($order->user) {
                $order->user->notify(new OrderStatusUpdated($order, 'confirmed'));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order confirmed successfully.',
                'data' => [
                    'status' => 'confirmed',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject an order
     */
    public function reject(Request $request, Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if (! in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'This order cannot be rejected.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            // Restore stock if order was confirmed
            if ($order->status === 'confirmed') {
                $sellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->get();
                foreach ($sellerItems as $item) {
                    $item->product->increment('quantity', $item->quantity);
                }
            }

            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $validated['reason'] ?? 'Rejected by seller',
                'cancelled_at' => now(),
            ]);

            // Notify customer
            if ($order->user) {
                $order->user->notify(new OrderStatusUpdated($order, 'cancelled'));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order rejected.',
                'data' => [
                    'status' => 'cancelled',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark order as shipped
     */
    public function ship(Request $request, Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Only confirmed orders can be shipped.',
            ], 422);
        }

        $validated = $request->validate([
            'tracking_number' => 'nullable|string|max:100',
            'shipping_carrier' => 'nullable|string|max:100',
        ]);

        $order->update([
            'status' => 'shipped',
            'shipped_at' => now(),
            'tracking_number' => $validated['tracking_number'] ?? $order->tracking_number,
            'shipping_carrier' => $validated['shipping_carrier'] ?? $order->shipping_carrier,
        ]);

        // Notify customer
        if ($order->user) {
            $order->user->notify(new OrderStatusUpdated($order, 'shipped'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Order marked as shipped.',
            'data' => [
                'status' => 'shipped',
                'tracking_number' => $order->tracking_number,
                'shipping_carrier' => $order->shipping_carrier,
            ],
        ]);
    }

    /**
     * Mark order as completed
     */
    public function complete(Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->status !== 'shipped') {
            return response()->json([
                'success' => false,
                'message' => 'Only shipped orders can be marked as completed.',
            ], 422);
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Notify customer
        if ($order->user) {
            $order->user->notify(new OrderStatusUpdated($order, 'completed'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Order marked as completed.',
            'data' => [
                'status' => 'completed',
            ],
        ]);
    }

    /**
     * Verify payment (for GCash orders)
     */
    public function verifyPayment(Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->payment_method !== 'gcash') {
            return response()->json([
                'success' => false,
                'message' => 'This order does not use GCash payment.',
            ], 422);
        }

        if (empty($order->payment_proof)) {
            return response()->json([
                'success' => false,
                'message' => 'No payment proof uploaded yet.',
            ], 422);
        }

        $order->update([
            'payment_status' => 'paid',
            'payment_verified_at' => now(),
        ]);

        // Notify customer
        if ($order->user) {
            $order->user->notify(new PaymentVerified($order));
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully.',
            'data' => [
                'payment_status' => 'paid',
            ],
        ]);
    }

    /**
     * Reject payment proof
     */
    public function rejectPayment(Request $request, Order $order): JsonResponse
    {
        $user = Auth::user();

        $hasSellerItems = $order->items()->whereHas('product', fn ($q) => $q->where('seller_id', $user->id))->exists();

        if (! $hasSellerItems) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $order->update([
            'payment_status' => 'failed',
            'payment_rejection_reason' => $validated['reason'],
            'payment_proof' => null, // Clear the proof so they can re-upload
        ]);

        // Notify customer
        if ($order->user) {
            $order->user->notify(new PaymentRejected($order, $validated['reason']));
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment rejected. Customer has been notified.',
            'data' => [
                'payment_status' => 'failed',
            ],
        ]);
    }

    /**
     * Get order statistics
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $baseQuery = fn () => Order::whereHas('items', function ($q) use ($user) {
            $q->whereHas('product', fn ($q) => $q->where('seller_id', $user->id));
        });

        $stats = [
            'pending' => $baseQuery()->where('status', 'pending')->count(),
            'confirmed' => $baseQuery()->where('status', 'confirmed')->count(),
            'shipped' => $baseQuery()->where('status', 'shipped')->count(),
            'completed' => $baseQuery()->where('status', 'completed')->count(),
            'cancelled' => $baseQuery()->where('status', 'cancelled')->count(),
            'needs_verification' => $baseQuery()
                ->where('payment_method', 'gcash')
                ->where('payment_status', 'pending')
                ->whereNotNull('payment_proof')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
