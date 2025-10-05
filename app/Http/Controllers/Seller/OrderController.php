<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderStatusUpdated;
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

        // Check if order can be confirmed
        if ($order->status !== Order::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be confirmed in its current status.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Check stock availability for all items
            foreach ($order->orderItems as $orderItem) {
                $product = $orderItem->product;
                if ($product->quantity < $orderItem->quantity) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
            }

            // Reduce product quantities
            foreach ($order->orderItems as $orderItem) {
                $product = $orderItem->product;
                $product->decrement('quantity', $orderItem->quantity);

                // Update stock status if quantity reaches zero
                if ($product->quantity <= 0) {
                    $product->update(['stock_status' => 'out_of_stock']);
                }
            }

            // Update order status
            $order->update([
                'status' => Order::STATUS_CONFIRMED,
                'confirmed_at' => now(),
            ]);

            // Notify buyer
            $order->buyer->notify(new OrderStatusUpdated($order, 'Your order has been confirmed by the seller'));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order confirmed successfully!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
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
                    $product->increment('quantity', $orderItem->quantity);

                    // Update stock status if quantity is now available
                    if ($product->quantity > 0 && $product->stock_status === 'out_of_stock') {
                        $product->update(['stock_status' => 'in_stock']);
                    }
                }
            }

            // Update order status
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'rejection_reason' => $request->input('rejection_reason'),
                'cancelled_at' => now(),
            ]);

            // Notify buyer
            $reason = $request->input('rejection_reason') ?
                "Your order has been cancelled. Reason: {$request->input('rejection_reason')}" :
                'Your order has been cancelled by the seller';

            $order->buyer->notify(new OrderStatusUpdated($order, $reason));

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
     * Mark order as completed.
     */
    public function complete(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated seller
        if ($order->seller_id !== auth()->id()) {
            abort(403);
        }

        // Check if order can be completed
        if ($order->status !== Order::STATUS_CONFIRMED) {
            return response()->json([
                'success' => false,
                'message' => 'Order must be confirmed before it can be completed.',
            ], 400);
        }

        try {
            // Update order status
            $order->update([
                'status' => Order::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            // Notify buyer
            $order->buyer->notify(new OrderStatusUpdated($order, 'Your order has been completed and delivered'));

            return response()->json([
                'success' => true,
                'message' => 'Order marked as completed!',
                'order' => $order->fresh(['orderItems.product', 'buyer']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
