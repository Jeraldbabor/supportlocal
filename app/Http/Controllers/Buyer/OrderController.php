<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Notifications\NewOrderReceived;
use App\Notifications\PaymentProofUploaded;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of buyer's orders.
     */
    public function index(): Response
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['orderItems.product', 'seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('buyer/orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cod,gcash',
            'delivery_address' => 'required|string|max:500',
            'delivery_phone' => 'required|string|max:20',
            'delivery_notes' => 'nullable|string|max:255',
            'gcash_reference' => 'required_if:payment_method,gcash|nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $items = $request->input('items');
            $totalAmount = 0;
            $orderItems = [];

            // Validate products and calculate total
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock availability
                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                // Check if product is active
                if ($product->status !== Product::STATUS_ACTIVE) {
                    throw new \Exception("Product is not available: {$product->name}");
                }

                $itemTotal = $product->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $itemTotal,
                    'seller_id' => $product->seller_id,
                ];
            }

            // Group items by seller to create separate orders
            $ordersBySeller = [];
            foreach ($orderItems as $item) {
                $sellerId = $item['seller_id'];
                if (! isset($ordersBySeller[$sellerId])) {
                    $ordersBySeller[$sellerId] = [];
                }
                $ordersBySeller[$sellerId][] = $item;
            }

            $createdOrders = [];

            // Create separate orders for each seller
            foreach ($ordersBySeller as $sellerId => $sellerItems) {
                $sellerTotal = array_sum(array_column($sellerItems, 'total_price'));

                // Calculate shipping fee from products (sum each unique product's shipping cost once)
                $shippingFee = 0;
                $processedProducts = [];
                foreach ($sellerItems as $item) {
                    $productId = $item['product_id'];
                    // Only add shipping cost once per unique product
                    if (! in_array($productId, $processedProducts)) {
                        $product = Product::find($productId);
                        $shippingFee += $product->shipping_cost ?? 50;
                        $processedProducts[] = $productId;
                    }
                }
                $totalWithShipping = $sellerTotal + $shippingFee;

                $paymentMethod = $request->input('payment_method');
                $paymentStatus = $paymentMethod === Order::PAYMENT_COD
                    ? Order::PAYMENT_PAID
                    : Order::PAYMENT_PENDING;

                $order = Order::create([
                    'user_id' => auth()->id(), // This is the buyer
                    'seller_id' => $sellerId,
                    'order_number' => 'ORD-'.strtoupper(uniqid()),
                    'shipping_name' => auth()->user()->name,
                    'shipping_email' => auth()->user()->email,
                    'shipping_phone' => $request->input('delivery_phone'),
                    'shipping_address' => $request->input('delivery_address'),
                    'delivery_address' => $request->input('delivery_address'),
                    'delivery_phone' => $request->input('delivery_phone'),
                    'delivery_notes' => $request->input('delivery_notes'),
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentStatus,
                    'gcash_reference' => $request->input('gcash_reference'),
                    'special_instructions' => $request->input('delivery_notes'),
                    'subtotal' => $sellerTotal,
                    'shipping_fee' => $shippingFee,
                    'total_amount' => $totalWithShipping,
                    'status' => Order::STATUS_PENDING,
                ]);

                // Create order items
                foreach ($sellerItems as $item) {
                    $product = Product::find($item['product_id']);
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $product->name,
                        'product_image' => $product->primary_image,
                        'seller_name' => $product->seller->name,
                        'quantity' => $item['quantity'],
                        'price' => $item['unit_price'],
                        'total' => $item['total_price'],
                    ]);
                }

                $createdOrders[] = $order;

                // Notify seller of new order
                $seller = User::find($sellerId);
                if ($seller) {
                    // Load the buyer relationship for the notification
                    $order->load('buyer');

                    $seller->notify(new NewOrderReceived($order));
                }
            }

            DB::commit();

            return redirect()->route('buyer.orders.index')
                ->with('success', 'Orders placed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        // Check if the order belongs to the authenticated buyer
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        $order->load(['orderItems.product', 'seller', 'buyer']);

        return Inertia::render('buyer/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Order $order)
    {
        // Check if the order belongs to the authenticated buyer
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow deletion of cancelled, delivered, or completed orders
        if (! in_array($order->status, ['cancelled', 'delivered', 'completed'])) {
            return back()->with('error', 'Only cancelled, delivered, or completed orders can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete order items first
            $order->orderItems()->delete();

            // Delete the order
            $order->delete();

            DB::commit();

            return back()->with('success', 'Order deleted successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->with('error', 'Failed to delete order. Please try again.');
        }
    }

    /**
     * Clear all order history for the authenticated buyer.
     */
    public function clearAllHistory(Request $request)
    {
        try {
            DB::beginTransaction();

            $orders = Order::where('user_id', auth()->id())
                ->whereIn('status', ['cancelled', 'delivered', 'completed'])
                ->get();

            if ($orders->isEmpty()) {
                return back()->with('info', 'No orders available to clear.');
            }

            // Delete all order items for these orders
            $orderIds = $orders->pluck('id');
            OrderItem::whereIn('order_id', $orderIds)->delete();

            // Delete the orders
            Order::where('user_id', auth()->id())
                ->whereIn('status', ['cancelled', 'delivered', 'completed'])
                ->delete();

            DB::commit();

            return back()->with('success', 'Order history cleared successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->with('error', 'Failed to clear order history. Please try again.');
        }
    }

    /**
     * Upload payment proof for an order.
     */
    public function uploadPaymentProof(Request $request, Order $order)
    {
        // Check if the order belongs to the authenticated buyer
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if payment proof can be uploaded
        if (! $order->canUploadPaymentProof()) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof cannot be uploaded for this order.',
            ], 400);
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        try {
            // Delete old payment proof if exists
            if ($order->payment_proof) {
                Storage::disk('public')->delete($order->payment_proof);
            }

            // Store the new payment proof
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');

            // Update order with payment proof
            $order->update([
                'payment_proof' => $path,
            ]);

            // Notify seller
            $order->seller->notify(new PaymentProofUploaded($order));

            return response()->json([
                'success' => true,
                'message' => 'Payment proof uploaded successfully! The seller will review it shortly.',
                'order' => $order->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload payment proof: '.$e->getMessage(),
            ], 500);
        }
    }
}
