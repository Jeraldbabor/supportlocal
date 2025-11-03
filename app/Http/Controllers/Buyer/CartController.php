<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the buyer's cart
     */
    public function index()
    {
        $user = Auth::user();

        // Find the user's cart (order with status='cart')
        $cart = Order::with(['items.product.seller'])
            ->where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        $cartItems = [];

        if ($cart) {
            $cartItems = $cart->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'primary_image' => $item->product->featured_image ?? $item->product->primary_image,
                    'seller' => [
                        'id' => $item->product->seller->id,
                        'name' => $item->product->seller->business_name ?? $item->product->seller->name,
                    ],
                    'max_quantity' => $item->product->quantity,
                    'stock_quantity' => $item->product->quantity,
                ];
            });
        }

        return Inertia::render('buyer/Cart', [
            'cartItems' => $cartItems,
            'cartTotal' => $cart ? (float) $cart->total_amount : 0,
        ]);
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $product = Product::findOrFail($validated['product_id']);

        // Check if quantity is available
        if ($validated['quantity'] > $product->quantity) {
            return back()->with('error', 'Requested quantity not available');
        }

        // Find or create cart
        $cart = Order::firstOrCreate(
            [
                'user_id' => $user->id,
                'status' => 'cart',
            ],
            [
                'order_number' => 'CART-'.$user->id.'-'.time(),
                'total_amount' => 0,
            ]
        );

        // Check if item already exists in cart
        $cartItem = OrderItem::where('order_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->quantity + $validated['quantity'];
            if ($newQuantity > $product->quantity) {
                return back()->with('error', 'Cannot add more items than available in stock');
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->total = $cartItem->quantity * $cartItem->price;
            $cartItem->save();
        } else {
            // Create new cart item
            OrderItem::create([
                'order_id' => $cart->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => $product->featured_image ?? $product->primary_image,
                'seller_name' => $product->seller->business_name ?? $product->seller->name,
                'quantity' => $validated['quantity'],
                'price' => $product->price,
                'total' => $product->price * $validated['quantity'],
            ]);
        }

        // Update cart total
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return back()->with('success', 'Item added to cart');
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        // Find the cart item
        $cartItem = OrderItem::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'cart');
        })->findOrFail($validated['item_id']);

        // Check stock availability
        $product = $cartItem->product;
        if ($validated['quantity'] > $product->quantity) {
            return back()->with('error', 'Requested quantity not available');
        }

        // Update quantity
        $cartItem->quantity = $validated['quantity'];
        $cartItem->total = $cartItem->quantity * $cartItem->price;
        $cartItem->save();

        // Update cart total
        $cart = $cartItem->order;
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return back()->with('success', 'Cart updated');
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|integer',
        ]);

        $user = Auth::user();

        // Find and delete the cart item
        $cartItem = OrderItem::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'cart');
        })->findOrFail($validated['item_id']);

        $cart = $cartItem->order;
        $cartItem->delete();

        // Update cart total
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return back()->with('success', 'Item removed from cart');
    }

    /**
     * Clear the cart
     */
    public function clearCart()
    {
        $user = Auth::user();

        $cart = Order::where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->total_amount = 0;
            $cart->save();
        }

        return back()->with('success', 'Cart cleared');
    }

    /**
     * Get cart count
     */
    public function getCartCount()
    {
        $user = Auth::user();

        $cart = Order::where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        $count = $cart ? $cart->items()->sum('quantity') : 0;

        return response()->json(['count' => $count]);
    }

    /**
     * Get cart data as JSON (for API)
     */
    public function getCartJson()
    {
        $user = Auth::user();

        $cart = Order::with(['items.product.seller'])
            ->where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        $cartItems = [];

        if ($cart) {
            $cartItems = $cart->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'primary_image' => $item->product->featured_image ?? $item->product->primary_image,
                    'seller' => [
                        'id' => $item->product->seller->id,
                        'name' => $item->product->seller->business_name ?? $item->product->seller->name,
                    ],
                    'max_quantity' => $item->product->quantity,
                    'stock_quantity' => $item->product->quantity,
                ];
            })->toArray();
        }

        // Calculate item count from array
        $itemCount = 0;
        foreach ($cartItems as $item) {
            $itemCount += $item['quantity'];
        }

        return response()->json([
            'items' => $cartItems,
            'cart_total' => $cart ? (float) $cart->total_amount : 0,
            'item_count' => $itemCount,
        ]);
    }

    /**
     * Add item to cart (JSON response for API)
     */
    public function addToCartJson(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $product = Product::findOrFail($validated['product_id']);

        // Check if quantity is available
        if ($validated['quantity'] > $product->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Requested quantity not available',
            ], 400);
        }

        // Find or create cart
        $cart = Order::firstOrCreate(
            [
                'user_id' => $user->id,
                'status' => 'cart',
            ],
            [
                'order_number' => 'CART-'.$user->id.'-'.time(),
                'total_amount' => 0,
            ]
        );

        // Check if item already exists in cart
        $cartItem = OrderItem::where('order_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->quantity + $validated['quantity'];
            if ($newQuantity > $product->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot add more items than available in stock',
                ], 400);
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->total = $cartItem->quantity * $cartItem->price;
            $cartItem->save();
        } else {
            // Create new cart item
            OrderItem::create([
                'order_id' => $cart->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => $product->featured_image ?? $product->primary_image,
                'seller_name' => $product->seller->business_name ?? $product->seller->name,
                'quantity' => $validated['quantity'],
                'price' => $product->price,
                'total' => $product->price * $validated['quantity'],
            ]);
        }

        // Update cart total
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'cart_total' => (float) $cart->total_amount,
            'item_count' => $cart->items()->sum('quantity'),
        ]);
    }

    /**
     * Update cart item quantity (JSON response for API)
     */
    public function updateQuantityJson(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        // Find the cart item by product_id
        $cartItem = OrderItem::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'cart');
        })->where('product_id', $validated['product_id'])->first();

        if (! $cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart',
            ], 404);
        }

        // Check stock availability
        $product = $cartItem->product;
        if ($validated['quantity'] > $product->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Requested quantity not available',
            ], 400);
        }

        // Update quantity
        $cartItem->quantity = $validated['quantity'];
        $cartItem->total = $cartItem->quantity * $cartItem->price;
        $cartItem->save();

        // Update cart total
        $cart = $cartItem->order;
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'cart_total' => (float) $cart->total_amount,
            'item_count' => $cart->items()->sum('quantity'),
        ]);
    }

    /**
     * Remove item from cart (JSON response for API)
     */
    public function removeFromCartJson(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer',
        ]);

        $user = Auth::user();

        // Find and delete the cart item by product_id
        $cartItem = OrderItem::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'cart');
        })->where('product_id', $validated['product_id'])->first();

        if (! $cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart',
            ], 404);
        }

        $cart = $cartItem->order;
        $cartItem->delete();

        // Update cart total
        $cart->total_amount = $cart->items()->sum('total');
        $cart->save();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'cart_total' => (float) $cart->total_amount,
            'item_count' => $cart->items()->sum('quantity'),
        ]);
    }

    /**
     * Clear the cart (JSON response for API)
     */
    public function clearCartJson()
    {
        $user = Auth::user();

        $cart = Order::where('user_id', $user->id)
            ->where('status', 'cart')
            ->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->total_amount = 0;
            $cart->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'cart_total' => 0,
            'item_count' => 0,
        ]);
    }
}
