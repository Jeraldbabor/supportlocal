<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Get the cart session key based on authentication status
     */
    private function getCartSessionKey(Request $request)
    {
        if ($request->user()) {
            // For authenticated users, use user-specific cart
            return 'cart_user_'.$request->user()->id;
        } else {
            // For guests, use guest cart
            return 'cart_guest';
        }
    }

    /**
     * Display the shopping cart
     */
    public function index(Request $request)
    {
        $cartKey = $this->getCartSessionKey($request);
        $cart = $request->session()->get($cartKey, []);
        $cartItems = [];
        $total = 0;

        if (! empty($cart)) {
            $productIds = array_keys($cart);
            $products = Product::with(['seller', 'category'])
                ->whereIn('id', $productIds)
                ->where('status', 'active')
                ->get();

            foreach ($products as $product) {
                $quantity = $cart[$product->id]['quantity'] ?? 1;
                $subtotal = $product->price * $quantity;
                $total += $subtotal;

                $cartItems[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'image' => $product->primary_image ? '/images/'.$product->primary_image : '/placeholder.jpg',
                    'artisan' => $product->seller->name ?? 'Unknown Artisan',
                    'artisan_image' => $product->seller->avatar_url ?? null,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                    'max_quantity' => $product->quantity,
                    'in_stock' => $product->quantity > 0,
                ];
            }
        }

        return Inertia::render('Cart', [
            'cartItems' => $cartItems,
            'cartCount' => array_sum(array_column($cart, 'quantity')),
            'subtotal' => $total,
            'shipping' => $total > 75 ? 0 : 8.99,
            'tax' => $total * 0.08, // 8% tax
            'total' => $total + ($total > 75 ? 0 : 8.99) + ($total * 0.08),
        ]);
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is available
        if ($product->status !== 'active' || $product->quantity <= 0) {
            return response()->json(['error' => 'Product is not available'], 400);
        }

        $cartKey = $this->getCartSessionKey($request);
        $cart = $request->session()->get($cartKey, []);
        $productId = $request->product_id;
        $quantity = $request->quantity;

        // Check stock availability
        $currentQuantity = $cart[$productId]['quantity'] ?? 0;
        $newQuantity = $currentQuantity + $quantity;

        if ($newQuantity > $product->quantity) {
            return response()->json(['error' => 'Not enough stock available'], 400);
        }

        // Add or update cart item
        $cart[$productId] = [
            'quantity' => $newQuantity,
            'added_at' => now(),
        ];

        $request->session()->put($cartKey, $cart);

        // Calculate new cart count
        $cartCount = array_sum(array_column($cart, 'quantity'));

        return response()->json([
            'success' => 'Product added to cart successfully',
            'cart_count' => $cartCount,
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $cartKey = $this->getCartSessionKey($request);
        $cart = $request->session()->get($cartKey, []);
        $productId = $request->product_id;
        $quantity = $request->quantity;

        if ($quantity == 0) {
            // Remove item from cart
            unset($cart[$productId]);
        } else {
            // Check stock availability
            $product = Product::findOrFail($productId);
            if ($quantity > $product->quantity) {
                return response()->json(['error' => 'Not enough stock available'], 400);
            }

            // Update quantity
            $cart[$productId] = [
                'quantity' => $quantity,
                'added_at' => $cart[$productId]['added_at'] ?? now(),
            ];
        }

        $request->session()->put($cartKey, $cart);

        // Calculate new cart count
        $cartCount = array_sum(array_column($cart, 'quantity'));

        return response()->json([
            'success' => 'Cart updated successfully',
            'cart_count' => $cartCount,
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $cartKey = $this->getCartSessionKey($request);
        $cart = $request->session()->get($cartKey, []);
        $productId = $request->product_id;

        unset($cart[$productId]);
        $request->session()->put($cartKey, $cart);

        // Calculate new cart count
        $cartCount = array_sum(array_column($cart, 'quantity'));

        return response()->json([
            'success' => 'Product removed from cart',
            'cart_count' => $cartCount,
        ]);
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Request $request)
    {
        $cartKey = $this->getCartSessionKey($request);
        $request->session()->forget($cartKey);

        return response()->json([
            'success' => 'Cart cleared successfully',
            'cart_count' => 0,
        ]);
    }

    /**
     * Get cart count for navigation
     */
    public function getCartCount(Request $request)
    {
        $cartKey = $this->getCartSessionKey($request);
        $cart = $request->session()->get($cartKey, []);
        $cartCount = array_sum(array_column($cart, 'quantity'));

        return response()->json(['cart_count' => $cartCount]);
    }
}
