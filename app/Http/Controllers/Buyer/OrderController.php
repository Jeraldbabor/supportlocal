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
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
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
            ->with([
                'orderItems.product.seller', // Eager load nested relationships
                'seller',
            ])
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

            // Get all product IDs
            $productIds = array_column($items, 'product_id');
            
            // Eager load products with their sellers to avoid N+1 queries
            $products = Product::with('seller')
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // Validate products and calculate total
            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                
                if (!$product) {
                    throw new \Exception("Product not found: {$item['product_id']}");
                }

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
                    'product' => $product, // Store product object to avoid re-querying
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
                // Use already loaded products instead of querying again
                $shippingFee = 0;
                $processedProducts = [];
                foreach ($sellerItems as $item) {
                    $productId = $item['product_id'];
                    // Only add shipping cost once per unique product
                    if (! in_array($productId, $processedProducts)) {
                        $product = $item['product'] ?? $products->get($productId);
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

                // Create order items (products already loaded, no need to query again)
                foreach ($sellerItems as $item) {
                    $product = $item['product'] ?? $products->get($item['product_id']);
                    
                    if (!$product) {
                        \Log::error('Product not found when creating order item', [
                            'product_id' => $item['product_id'],
                            'order_id' => $order->id,
                        ]);
                        continue;
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $product->name,
                        'product_image' => $product->primary_image,
                        'seller_name' => $product->seller->name ?? 'Unknown Seller',
                        'quantity' => $item['quantity'],
                        'price' => $item['unit_price'],
                        'total' => $item['total_price'],
                    ]);
                }

                $createdOrders[] = $order;

                // Notify seller of new order (queue the notification to avoid blocking)
                $seller = User::find($sellerId);
                if ($seller) {
                    // Load the buyer relationship for the notification
                    $order->load('buyer');

                    try {
                        // Queue the notification instead of sending synchronously
                        $seller->notify((new NewOrderReceived($order))->onQueue('notifications'));
                    } catch (\Exception $e) {
                        // If queuing fails, log but don't block order creation
                        Log::warning('Failed to queue order notification', [
                            'order_id' => $order->id,
                            'seller_id' => $sellerId,
                            'error' => $e->getMessage(),
                        ]);
                        // Fallback to synchronous notification if queue fails
                        try {
                            $seller->notify(new NewOrderReceived($order));
                        } catch (\Exception $e2) {
                            Log::error('Failed to send order notification synchronously', [
                                'order_id' => $order->id,
                                'seller_id' => $sellerId,
                                'error' => $e2->getMessage(),
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('buyer.orders.index')
                ->with('success', 'Orders placed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();

            // Log the full error for debugging
            Log::error('Order creation failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['items']), // Don't log full items array
            ]);

            // Return user-friendly error message
            $errorMessage = 'Failed to place order. Please try again.';
            if (config('app.debug')) {
                $errorMessage = $e->getMessage();
            }

            return back()
                ->withErrors(['error' => $errorMessage])
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
            // Ensure storage directory exists
            $paymentProofsDir = storage_path('app/public/payment-proofs');
            if (!File::exists($paymentProofsDir)) {
                File::makeDirectory($paymentProofsDir, 0755, true);
            }

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
