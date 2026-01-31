<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get current user's cart
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $cart->load(['items.product.seller']);

        $items = $cart->items->map(fn ($item) => $this->formatCartItem($item));

        return response()->json([
            'success' => true,
            'cart' => [
                'id' => $cart->id,
                'items' => $items,
                'items_count' => $cart->items->count(),
                'subtotal' => (float) $cart->items->sum('total'),
                'shipping_fee' => $this->calculateShippingFee($cart),
                'total' => (float) $cart->total_amount,
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $product = Product::with('seller')->findOrFail($validated['product_id']);

        // Check if product is active and in stock
        if ($product->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This product is no longer available',
            ], 422);
        }

        if ($product->quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock. Only ' . $product->quantity . ' items available.',
            ], 422);
        }

        $cart = $this->getOrCreateCart($user);

        // Check if item already exists in cart
        $existingItem = $cart->items()->where('product_id', $product->id)->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $validated['quantity'];

            if ($newQuantity > $product->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot add more items. Maximum available: ' . $product->quantity,
                ], 422);
            }

            $existingItem->update([
                'quantity' => $newQuantity,
                'total' => $newQuantity * $existingItem->price,
            ]);
        } else {
            OrderItem::create([
                'order_id' => $cart->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => $product->featured_image ?? $product->primary_image,
                'seller_name' => $product->seller->name ?? 'Unknown Seller',
                'quantity' => $validated['quantity'],
                'price' => $product->price,
                'total' => $product->price * $validated['quantity'],
            ]);
        }

        // Recalculate cart total
        $this->recalculateCartTotal($cart);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'cart' => $this->getCartSummary($cart->fresh()),
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $item = $cart->items()->where('product_id', $validated['product_id'])->first();

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart',
            ], 404);
        }

        $product = Product::find($validated['product_id']);

        if ($validated['quantity'] > $product->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock. Only ' . $product->quantity . ' items available.',
            ], 422);
        }

        $item->update([
            'quantity' => $validated['quantity'],
            'total' => $validated['quantity'] * $item->price,
        ]);

        $this->recalculateCartTotal($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'cart' => $this->getCartSummary($cart->fresh()),
        ]);
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
        ]);

        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $item = $cart->items()->where('product_id', $validated['product_id'])->first();

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart',
            ], 404);
        }

        $item->delete();
        $this->recalculateCartTotal($cart);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'cart' => $this->getCartSummary($cart->fresh()),
        ]);
    }

    /**
     * Clear all items from cart
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Order::where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->update(['total_amount' => 0]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'cart' => [
                'items' => [],
                'items_count' => 0,
                'subtotal' => 0,
                'shipping_fee' => 0,
                'total' => 0,
            ],
        ]);
    }

    /**
     * Get or create cart for user
     */
    private function getOrCreateCart($user): Order
    {
        return Order::firstOrCreate(
            [
                'user_id' => $user->id,
                'status' => 'cart',
            ],
            [
                'order_number' => 'CART-' . $user->id . '-' . time(),
                'total_amount' => 0,
            ]
        );
    }

    /**
     * Recalculate cart total
     */
    private function recalculateCartTotal(Order $cart): void
    {
        $subtotal = $cart->items()->sum('total');
        $shippingFee = $this->calculateShippingFee($cart);

        $cart->update([
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'total_amount' => $subtotal + $shippingFee,
        ]);
    }

    /**
     * Calculate shipping fee
     */
    private function calculateShippingFee(Order $cart): float
    {
        // Load items with products if not loaded
        if (! $cart->relationLoaded('items')) {
            $cart->load('items.product');
        }

        $shippingFee = 0;

        foreach ($cart->items as $item) {
            if ($item->product && ! $item->product->free_shipping) {
                $shippingFee += ($item->product->shipping_cost ?? 50);
            }
        }

        return $shippingFee;
    }

    /**
     * Get cart summary
     */
    private function getCartSummary(Order $cart): array
    {
        $cart->load(['items.product.seller']);

        return [
            'id' => $cart->id,
            'items' => $cart->items->map(fn ($item) => $this->formatCartItem($item)),
            'items_count' => $cart->items->count(),
            'subtotal' => (float) $cart->items->sum('total'),
            'shipping_fee' => $this->calculateShippingFee($cart),
            'total' => (float) $cart->total_amount,
        ];
    }

    /**
     * Format cart item
     */
    private function formatCartItem(OrderItem $item): array
    {
        return [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'name' => $item->product_name,
            'image' => ImageHelper::url($item->product_image),
            'price' => (float) $item->price,
            'quantity' => $item->quantity,
            'total' => (float) $item->total,
            'seller_name' => $item->seller_name,
            'max_quantity' => $item->product?->quantity ?? 0,
            'in_stock' => $item->product?->isInStock() ?? false,
            'shipping_cost' => (float) ($item->product?->shipping_cost ?? 50),
            'free_shipping' => $item->product?->free_shipping ?? false,
        ];
    }
}
