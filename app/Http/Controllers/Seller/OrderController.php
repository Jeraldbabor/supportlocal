<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderStatusUpdated;
use App\Notifications\PaymentRejected;
use App\Notifications\PaymentVerified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of seller's orders.
     */
    public function index(): Response
    {
        $orders = Order::where('seller_id', auth()->id())
            ->with(['orderItems.product', 'buyer'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        $order->load(['orderItems.product', 'buyer']);

        return Inertia::render('seller/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Confirm an order and reduce product quantities.
     */
    public function confirm(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Load necessary relationships
        $order->load(['orderItems.product', 'buyer']);

        // Check if order can be confirmed
        if (! $order->canBeConfirmed()) {
            if ($order->payment_method === Order::PAYMENT_GCASH && $order->payment_status !== Order::PAYMENT_PAID) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be confirmed. Payment must be verified first.',
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Order cannot be confirmed in its current status.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Check stock availability for all items (skip for custom orders without products)
            foreach ($order->orderItems as $orderItem) {
                $product = $orderItem->product;
                // Skip stock check for custom orders (no product linked)
                if ($product && $product->quantity < $orderItem->quantity) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
            }

            // Reduce product quantities (skip for custom orders without products)
            foreach ($order->orderItems as $orderItem) {
                $product = $orderItem->product;
                // Skip quantity reduction for custom orders (no product linked)
                if ($product) {
                    $product->decrement('quantity', $orderItem->quantity);

                    // Update stock status if quantity reaches zero
                    if ($product->quantity <= 0) {
                        $product->update(['stock_status' => 'out_of_stock']);
                    }
                }
            }

            // Update order status
            $order->update([
                'status' => Order::STATUS_CONFIRMED,
                'seller_confirmed_at' => now(),
            ]);

            DB::commit();

            // Notify buyer after response so confirmation API returns faster.
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new OrderStatusUpdated($freshOrder, 'Your order has been confirmed by the seller'));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Order confirmation notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Order confirmed successfully!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Order confirmation failed', [
                'order_id' => $order->id,
                'seller_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'An error occurred while confirming the order. Please try again.',
            ], 500);
        }
    }

    /**
     * Reject an order.
     */
    public function reject(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if order can be rejected
        if (! in_array($order->status, [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be rejected in its current status.',
            ], 400);
        }

        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        try {
            // If order was already confirmed, restore product quantities
            if ($order->status === Order::STATUS_CONFIRMED) {
                foreach ($order->orderItems as $orderItem) {
                    $product = $orderItem->product;
                    // Skip quantity restoration for custom orders (no product linked)
                    if ($product) {
                        $product->increment('quantity', $orderItem->quantity);

                        // Update stock status if quantity is now available
                        if ($product->quantity > 0 && $product->stock_status === 'out_of_stock') {
                            $product->update(['stock_status' => 'in_stock']);
                        }
                    }
                }
            }

            // Update order status
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'rejection_reason' => $request->input('rejection_reason'),
                'cancelled_at' => now(),
            ]);

            $reason = $request->input('rejection_reason') ?
                "Your order has been cancelled. Reason: {$request->input('rejection_reason')}" :
                'Your order has been cancelled by the seller';

            // Notify buyer after response so cancellation API returns faster.
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId, $reason) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new OrderStatusUpdated($freshOrder, $reason));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Order rejection notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Mark order as shipped with shipping provider details.
     */
    public function ship(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if order can be shipped
        if ($order->status !== Order::STATUS_CONFIRMED) {
            return response()->json([
                'success' => false,
                'message' => 'Order must be confirmed before it can be shipped.',
            ], 400);
        }

        $request->validate([
            'shipping_provider' => ['required', 'string', 'in:jt_express,other'],
            'tracking_number' => ['required', 'string', 'max:100'],
            'waybill_number' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            // Update order status and shipping information
            $order->update([
                'status' => Order::STATUS_SHIPPED,
                'shipping_provider' => $request->input('shipping_provider'),
                'tracking_number' => $request->input('tracking_number'),
                'waybill_number' => $request->input('waybill_number'),
                'shipped_at' => now(),
            ]);

            $shippingProviderName = $request->input('shipping_provider') === Order::SHIPPING_JT_EXPRESS ? 'J&T Express' : 'Other';
            // Notify buyer after response so shipping API returns faster.
            $shippingMessage = "Your order has been shipped via {$shippingProviderName}. Tracking Number: {$request->input('tracking_number')}";
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId, $shippingMessage) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new OrderStatusUpdated($freshOrder, $shippingMessage));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Order shipping notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Order marked as shipped successfully!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to ship order: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark order as completed.
     */
    public function complete(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if order can be completed (must be confirmed or shipped)
        if (! in_array($order->status, [Order::STATUS_CONFIRMED, Order::STATUS_SHIPPED])) {
            return response()->json([
                'success' => false,
                'message' => 'Order must be confirmed or shipped before it can be completed.',
            ], 400);
        }

        try {
            // Update order status
            $order->update([
                'status' => Order::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            // Calculate and apply admin commission
            $commissionDetails = $order->calculateCommission();

            // Notify buyer after response so completion API returns faster.
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new OrderStatusUpdated($freshOrder, 'Your order has been completed and delivered'));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Order completion notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Order marked as completed!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
                'commission' => $commissionDetails,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify payment for an order.
     */
    public function verifyPayment(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if payment can be verified
        if (! $order->canVerifyPayment()) {
            return response()->json([
                'success' => false,
                'message' => 'Payment cannot be verified for this order.',
            ], 400);
        }

        $request->validate([
            'payment_verification_notes' => 'nullable|string|max:500',
        ]);

        try {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'payment_verification_notes' => $request->input('payment_verification_notes'),
                'payment_verified_at' => now(),
            ]);

            // Notify buyer after response so verification API returns faster.
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new PaymentVerified($freshOrder));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Payment verification notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject payment proof for an order.
     */
    public function rejectPayment(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if payment can be rejected
        if ($order->payment_method !== Order::PAYMENT_GCASH
            || $order->status !== Order::STATUS_PENDING
            || $order->payment_proof === null
            || $order->payment_status !== Order::PAYMENT_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Payment cannot be rejected for this order.',
            ], 400);
        }

        $request->validate([
            'payment_verification_notes' => 'required|string|max:500',
        ]);

        try {
            // Delete payment proof
            \App\Helpers\ImageHelper::delete($order->payment_proof);

            $order->update([
                'payment_status' => Order::PAYMENT_FAILED,
                'payment_proof' => null,
                'payment_verification_notes' => $request->input('payment_verification_notes'),
                'payment_verified_at' => null,
            ]);

            // Notify buyer after response so rejection API returns faster.
            $rejectionNotes = $request->input('payment_verification_notes');
            $orderId = $order->id;
            $buyerId = $order->buyer->id ?? null;
            if ($buyerId) {
                dispatch(function () use ($orderId, $buyerId, $rejectionNotes) {
                    try {
                        $freshOrder = Order::with(['orderItems.product', 'seller', 'buyer'])->find($orderId);
                        $buyer = \App\Models\User::find($buyerId);
                        if ($freshOrder && $buyer) {
                            $buyer->notify(new PaymentRejected($freshOrder, $rejectionNotes));
                        }
                    } catch (\Throwable $notificationException) {
                        \Log::warning('Payment rejection notification failed', [
                            'order_id' => $orderId,
                            'buyer_id' => $buyerId,
                            'error' => $notificationException->getMessage(),
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment proof rejected. Buyer has been notified.',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject payment: '.$e->getMessage(),
            ], 500);
        }
    }
}
