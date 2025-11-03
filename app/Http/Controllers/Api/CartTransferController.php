<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartTransferController extends Controller
{
    /**
     * Transfer guest cart items to authenticated user's cart
     */
    public function transfer(Request $request)
    {
        Log::info('=== CART TRANSFER REQUEST RECEIVED ===', [
            'request_data' => $request->all(),
            'auth_check' => Auth::check(),
            'user_id' => Auth::id(),
        ]);

        // Ensure user is authenticated
        if (!Auth::check()) {
            Log::warning('Cart transfer failed: User not authenticated');
            return response()->json([
                'success' => false,
                'message' => 'User must be authenticated to transfer cart',
            ], 401);
        }

        $user = Auth::user();
        
        Log::info('Validating cart transfer data', [
            'user_id' => $user->id,
            'items_count' => count($request->input('items', [])),
        ]);

        // Validate the request
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        Log::info('Validation passed', ['validated_items' => $validated['items']]);

        try {
            Log::info('Finding or creating cart order for user', ['user_id' => $user->id]);

            // Find or create a pending cart order for the user
            $cart = Order::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'status' => 'cart', // Cart status means it's not checked out yet
                ],
                [
                    'order_number' => 'CART-' . $user->id . '-' . time(),
                    'total_amount' => 0,
                ]
            );

            Log::info('Cart order ready', [
                'cart_id' => $cart->id,
                'order_number' => $cart->order_number,
                'was_just_created' => $cart->wasRecentlyCreated,
            ]);

            $totalAmount = 0;
            $transferredItems = 0;

            foreach ($validated['items'] as $item) {
                Log::info('Processing cart item', [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                ]);
                // Check if this product is already in the user's cart
                $existingItem = OrderItem::where('order_id', $cart->id)
                    ->where('product_id', $item['product_id'])
                    ->first();

                if ($existingItem) {
                    // Update quantity if item already exists
                    $oldQuantity = $existingItem->quantity;
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->total = $existingItem->quantity * $existingItem->price;
                    $existingItem->save();
                    
                    Log::info('Updated existing cart item', [
                        'item_id' => $existingItem->id,
                        'old_quantity' => $oldQuantity,
                        'new_quantity' => $existingItem->quantity,
                        'total' => $existingItem->total,
                    ]);
                } else {
                    // Create new cart item
                    $product = \App\Models\Product::with('seller')->find($item['product_id']);
                    
                    if ($product) {
                        $newItem = OrderItem::create([
                            'order_id' => $cart->id,
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'product_image' => $product->featured_image ?? $product->primary_image,
                            'seller_name' => $product->seller->business_name ?? $product->seller->name,
                            'quantity' => $item['quantity'],
                            'price' => $product->price,
                            'total' => $product->price * $item['quantity'],
                        ]);
                        
                        Log::info('Created new cart item', [
                            'item_id' => $newItem->id,
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'quantity' => $item['quantity'],
                            'price' => $product->price,
                            'total' => $newItem->total,
                        ]);
                    } else {
                        Log::warning('Product not found', ['product_id' => $item['product_id']]);
                    }
                }

                $transferredItems++;
            }

            // Recalculate cart total
            $cart->total_amount = $cart->items()->sum('total');
            $cart->save();

            Log::info('Guest cart transferred successfully', [
                'user_id' => $user->id,
                'cart_id' => $cart->id,
                'items_transferred' => $transferredItems,
                'total_amount' => $cart->total_amount,
                'final_items_count' => $cart->items()->count(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart items transferred successfully',
                'cart_total' => $cart->total_amount,
                'items_count' => $cart->items()->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error transferring guest cart', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error transferring cart items',
            ], 500);
        }
    }
}
