<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of all orders.
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['buyer', 'seller', 'orderItems.product']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                    ->orWhereHas('buyer', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    })
                    ->orWhereHas('seller', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply seller filter
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        // Apply buyer filter
        if ($request->filled('buyer_id')) {
            $query->where('user_id', $request->buyer_id);
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_color' => $order->status_color,
                'subtotal' => $order->subtotal,
                'shipping_fee' => $order->shipping_fee,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'buyer' => $order->buyer ? [
                    'id' => $order->buyer->id,
                    'name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                ] : null,
                'seller' => $order->seller ? [
                    'id' => $order->seller->id,
                    'name' => $order->seller->name,
                ] : null,
                'items_count' => $order->orderItems->count(),
                'created_at' => $order->created_at,
                'seller_confirmed_at' => $order->seller_confirmed_at,
                'shipped_at' => $order->shipped_at,
                'delivered_at' => $order->delivered_at,
                'completed_at' => $order->completed_at,
            ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'seller_id', 'buyer_id', 'date_from', 'date_to']),
            'statuses' => [
                Order::STATUS_PENDING => 'Pending',
                Order::STATUS_CONFIRMED => 'Confirmed',
                Order::STATUS_SHIPPED => 'Shipped',
                Order::STATUS_DELIVERED => 'Delivered',
                Order::STATUS_COMPLETED => 'Completed',
                Order::STATUS_CANCELLED => 'Cancelled',
            ],
            'sellers' => User::where('role', User::ROLE_SELLER)->orderBy('name')->get(['id', 'name', 'email']),
            'buyers' => User::where('role', User::ROLE_BUYER)->orderBy('name')->get(['id', 'name', 'email']),
            'stats' => [
                'total' => Order::count(),
                'pending' => Order::where('status', Order::STATUS_PENDING)->count(),
                'confirmed' => Order::where('status', Order::STATUS_CONFIRMED)->count(),
                'shipped' => Order::where('status', Order::STATUS_SHIPPED)->count(),
                'delivered' => Order::where('status', Order::STATUS_DELIVERED)->count(),
                'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
                'cancelled' => Order::where('status', Order::STATUS_CANCELLED)->count(),
                'today' => Order::whereDate('created_at', today())->count(),
                'this_week' => Order::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
                'this_month' => Order::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
                'total_revenue' => Order::where('status', '!=', Order::STATUS_CANCELLED)->sum('total_amount'),
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        $order->load(['buyer', 'seller', 'orderItems.product']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_color' => $order->status_color,
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
                'special_instructions' => $order->special_instructions,
                'subtotal' => $order->subtotal,
                'shipping_fee' => $order->shipping_fee,
                'total_amount' => $order->total_amount,
                'rejection_reason' => $order->rejection_reason,
                'buyer' => $order->buyer ? [
                    'id' => $order->buyer->id,
                    'name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                    'phone_number' => $order->buyer->phone_number,
                    'avatar_url' => $order->buyer->avatar_url,
                ] : null,
                'seller' => $order->seller ? [
                    'id' => $order->seller->id,
                    'name' => $order->seller->name,
                    'email' => $order->seller->email,
                    'phone_number' => $order->seller->phone_number,
                ] : null,
                'items' => $order->orderItems->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'primary_image' => \App\Helpers\ImageHelper::url($item->product->primary_image),
                    ] : null,
                ]),
                'created_at' => $order->created_at,
                'seller_confirmed_at' => $order->seller_confirmed_at,
                'shipped_at' => $order->shipped_at,
                'delivered_at' => $order->delivered_at,
                'completed_at' => $order->completed_at,
            ],
            'statuses' => [
                Order::STATUS_PENDING => 'Pending',
                Order::STATUS_CONFIRMED => 'Confirmed',
                Order::STATUS_SHIPPED => 'Shipped',
                Order::STATUS_DELIVERED => 'Delivered',
                Order::STATUS_COMPLETED => 'Completed',
                Order::STATUS_CANCELLED => 'Cancelled',
            ],
        ]);
    }

    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        $order->status = $newStatus;

        // Update timestamps based on status
        if ($newStatus === Order::STATUS_CONFIRMED && ! $order->seller_confirmed_at) {
            $order->seller_confirmed_at = now();
        } elseif ($newStatus === Order::STATUS_SHIPPED && ! $order->shipped_at) {
            $order->shipped_at = now();
        } elseif ($newStatus === Order::STATUS_DELIVERED && ! $order->delivered_at) {
            $order->delivered_at = now();
        } elseif ($newStatus === Order::STATUS_COMPLETED && ! $order->completed_at) {
            $order->completed_at = now();
        }

        if ($newStatus === Order::STATUS_CANCELLED && $request->filled('rejection_reason')) {
            $order->rejection_reason = $validated['rejection_reason'];
        }

        $order->save();

        return back()->with('message', "Order status updated from {$oldStatus} to {$newStatus}.");
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order)
    {
        if (! $order->canBeCancelled()) {
            return back()->with('error', 'This order cannot be cancelled.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('message', 'Order cancelled successfully.');
    }
}
