<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * List user's orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->get('status');
        $perPage = min($request->get('per_page', 10), 50);

        $query = Order::with(['items', 'seller'])
            ->where('user_id', $user->id)
            ->where('status', '!=', 'cart')
            ->orderBy('created_at', 'desc');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'orders' => $orders->map(fn ($order) => $this->formatOrder($order)),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'has_more' => $orders->hasMorePages(),
            ],
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        // Ensure the order belongs to the user
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $order->load(['items.product', 'seller']);

        return response()->json([
            'success' => true,
            'order' => $this->formatOrderDetail($order),
        ]);
    }

    /**
     * Create a new order (checkout)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'payment_method' => ['required', 'in:cod,gcash'],
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'delivery_province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'delivery_city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'delivery_barangay' => ['sometimes', 'nullable', 'string', 'max:100'],
            'special_instructions' => ['sometimes', 'nullable', 'string', 'max:500'],
            'gcash_number' => ['required_if:payment_method,gcash', 'nullable', 'string', 'max:20'],
            // For Buy Now
            'buy_now' => ['sometimes', 'boolean'],
            'product_id' => ['required_if:buy_now,true', 'integer', 'exists:products,id'],
            'quantity' => ['required_if:buy_now,true', 'integer', 'min:1'],
        ]);

        try {
            DB::beginTransaction();

            $items = [];
            $totalAmount = 0;
            $shippingFee = 0;
            $sellerId = null;

            // Handle Buy Now vs Cart checkout
            if ($request->get('buy_now')) {
                // Buy Now - single product
                $product = Product::with('seller')->findOrFail($validated['product_id']);

                if ($product->status !== 'active' || $product->quantity < $validated['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Product is unavailable or has insufficient stock',
                    ], 422);
                }

                $itemTotal = $product->price * $validated['quantity'];
                $shippingFee = $product->free_shipping ? 0 : ($product->shipping_cost ?? 50);
                $totalAmount = $itemTotal + $shippingFee;
                $sellerId = $product->seller_id;

                $items[] = [
                    'product' => $product,
                    'quantity' => $validated['quantity'],
                    'price' => $product->price,
                    'total' => $itemTotal,
                ];
            } else {
                // Cart checkout
                $cart = Order::with(['items.product.seller'])
                    ->where('user_id', $user->id)
                    ->where('status', 'cart')
                    ->first();

                if (! $cart || $cart->items->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your cart is empty',
                    ], 422);
                }

                // Validate all items are still available
                foreach ($cart->items as $item) {
                    $product = $item->product;

                    if (! $product || $product->status !== 'active') {
                        return response()->json([
                            'success' => false,
                            'message' => "Product '{$item->product_name}' is no longer available",
                        ], 422);
                    }

                    if ($product->quantity < $item->quantity) {
                        return response()->json([
                            'success' => false,
                            'message' => "Insufficient stock for '{$product->name}'. Available: {$product->quantity}",
                        ], 422);
                    }

                    $itemTotal = $item->price * $item->quantity;
                    $itemShipping = $product->free_shipping ? 0 : ($product->shipping_cost ?? 50);

                    $items[] = [
                        'product' => $product,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total' => $itemTotal,
                        'cart_item' => $item,
                    ];

                    $totalAmount += $itemTotal;
                    $shippingFee += $itemShipping;

                    // Get seller (assuming single seller per order for simplicity)
                    if (! $sellerId) {
                        $sellerId = $product->seller_id;
                    }
                }

                $totalAmount += $shippingFee;
            }

            // Create the order
            $order = Order::create([
                'user_id' => $user->id,
                'seller_id' => $sellerId,
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'shipping_name' => $validated['shipping_name'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'delivery_address' => $validated['shipping_address'],
                'delivery_phone' => $validated['shipping_phone'],
                'delivery_notes' => $validated['special_instructions'] ?? null,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? Order::PAYMENT_PENDING : Order::PAYMENT_PENDING,
                'gcash_number' => $validated['gcash_number'] ?? null,
                'subtotal' => $totalAmount - $shippingFee,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            // Create order items and reduce stock
            foreach ($items as $itemData) {
                $product = $itemData['product'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->featured_image ?? $product->primary_image,
                    'seller_name' => $product->seller->name ?? 'Unknown Seller',
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'total' => $itemData['total'],
                ]);

                // Reduce stock
                $product->reduceStock($itemData['quantity']);

                // Increment order count
                $product->increment('order_count');
            }

            // Clear cart if not Buy Now
            if (! $request->get('buy_now') && isset($cart)) {
                $cart->items()->delete();
                $cart->delete();
            }

            // Notify seller
            $seller = User::find($sellerId);
            if ($seller) {
                $seller->notify(new \App\Notifications\OrderReceived($order));
            }

            DB::commit();

            Log::info('Mobile order created', [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'total' => $totalAmount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $this->formatOrderDetail($order->fresh()->load(['items', 'seller'])),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Mobile order creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order. Please try again.',
            ], 500);
        }
    }

    /**
     * Cancel an order
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        if (! $order->canBeCancelledByBuyer()) {
            return response()->json([
                'success' => false,
                'message' => 'This order cannot be cancelled',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        try {
            DB::beginTransaction();

            // Restore stock for each item
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increaseStock($item->quantity);
                    $product->decrement('order_count');
                }
            }

            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'cancellation_reason' => $validated['reason'] ?? 'Cancelled by buyer',
                'cancelled_by' => 'buyer',
                'cancelled_at' => now(),
            ]);

            // Notify seller
            if ($order->seller) {
                $order->seller->notify(new \App\Notifications\OrderCancelled($order));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'order' => $this->formatOrder($order->fresh()),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Mobile order cancellation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order. Please try again.',
            ], 500);
        }
    }

    /**
     * Upload payment proof for GCash orders
     */
    public function uploadPaymentProof(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        if (! $order->canUploadPaymentProof()) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof cannot be uploaded for this order',
            ], 422);
        }

        $request->validate([
            'payment_proof' => ['required', 'image', 'max:5120'], // 5MB max
            'gcash_reference' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $order->update([
            'payment_proof' => $path,
            'gcash_reference' => $request->get('gcash_reference'),
        ]);

        // Notify seller
        if ($order->seller) {
            $order->seller->notify(new \App\Notifications\PaymentProofUploaded($order));
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment proof uploaded successfully. Waiting for seller verification.',
            'payment_proof_url' => ImageHelper::url($path),
        ]);
    }

    /**
     * Format order for list view
     */
    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'status_label' => $order->status_label,
            'status_color' => $order->status_color,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'payment_status_label' => $order->payment_status_label,
            'subtotal' => (float) $order->subtotal,
            'shipping_fee' => (float) $order->shipping_fee,
            'total_amount' => (float) $order->total_amount,
            'items_count' => $order->items->count(),
            'first_item' => $order->items->first() ? [
                'name' => $order->items->first()->product_name,
                'image' => ImageHelper::url($order->items->first()->product_image),
            ] : null,
            'seller' => $order->seller ? [
                'id' => $order->seller->id,
                'name' => $order->seller->name,
            ] : null,
            'can_cancel' => $order->canBeCancelledByBuyer(),
            'can_upload_payment_proof' => $order->canUploadPaymentProof(),
            'created_at' => $order->created_at->toISOString(),
        ];
    }

    /**
     * Format order for detail view
     */
    private function formatOrderDetail(Order $order): array
    {
        return array_merge($this->formatOrder($order), [
            'shipping_name' => $order->shipping_name,
            'shipping_phone' => $order->shipping_phone,
            'shipping_address' => $order->shipping_address,
            'delivery_notes' => $order->delivery_notes,
            'gcash_number' => $order->gcash_number,
            'gcash_reference' => $order->gcash_reference,
            'payment_proof_url' => $order->payment_proof_url,
            'tracking_number' => $order->tracking_number,
            'shipping_provider' => $order->shipping_provider,
            'rejection_reason' => $order->rejection_reason,
            'cancellation_reason' => $order->cancellation_reason,
            'cancelled_by' => $order->cancelled_by,
            'seller_confirmed_at' => $order->seller_confirmed_at?->toISOString(),
            'shipped_at' => $order->shipped_at?->toISOString(),
            'delivered_at' => $order->delivered_at?->toISOString(),
            'completed_at' => $order->completed_at?->toISOString(),
            'cancelled_at' => $order->cancelled_at?->toISOString(),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product_name,
                    'image' => ImageHelper::url($item->product_image),
                    'seller_name' => $item->seller_name,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'total' => (float) $item->total,
                ];
            }),
        ]);
    }
}
