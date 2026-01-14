<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        $request->fulfill();

        // Transfer guest cart if stored in session
        if (session()->has('pending_guest_cart')) {
            $this->transferGuestCart($request);
            session()->forget('pending_guest_cart');
        }

        return redirect()->intended(route('buyer.dashboard', absolute: false))
            ->with('success', 'Email verified successfully! Welcome to SupportLocal. Please complete your profile to get started.');
    }

    /**
     * Transfer guest cart items to authenticated user
     */
    private function transferGuestCart(EmailVerificationRequest $request): void
    {
        $guestCart = session('pending_guest_cart');

        if (! $guestCart || ! is_array($guestCart)) {
            return;
        }

        $user = $request->user();

        foreach ($guestCart as $item) {
            if (! isset($item['product_id'], $item['quantity'])) {
                continue;
            }

            // Check if product exists and is active
            $product = Product::find($item['product_id']);
            if (! $product || ! $product->is_active) {
                continue;
            }

            // Check if user already has this product in their cart
            $existingOrder = Order::where('user_id', $user->id)
                ->where('status', Order::STATUS_CART)
                ->first();

            if ($existingOrder) {
                $existingItem = OrderItem::where('order_id', $existingOrder->id)
                    ->where('product_id', $product->id)
                    ->first();

                if ($existingItem) {
                    // Update quantity
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->save();

                    continue;
                }
            } else {
                // Create new cart order
                $existingOrder = Order::create([
                    'user_id' => $user->id,
                    'status' => Order::STATUS_CART,
                    'total_amount' => 0,
                ]);
            }

            // Add new item
            OrderItem::create([
                'order_id' => $existingOrder->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ]);

            // Update order total
            $existingOrder->total_amount = $existingOrder->items->sum(function ($item) {
                return $item->price * $item->quantity;
            });
            $existingOrder->save();
        }
    }
}
