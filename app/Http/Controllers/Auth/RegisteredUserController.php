<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        $sellerCount = User::where('role', User::ROLE_SELLER)->count();

        // Get 4 featured artisans for the showcase
        $featuredArtisans = User::where('role', User::ROLE_SELLER)
            ->select(['id', 'name', 'profile_picture'])
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                ];
            });

        return Inertia::render('auth/register', [
            'sellerCount' => $sellerCount,
            'featuredArtisans' => $featuredArtisans,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_BUYER, // Default all new users to buyer
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Transfer guest cart to authenticated user (if exists in request)
        $this->transferGuestCart($request, $user);

        // Redirect to buyer dashboard where they'll see profile completion banner
        // and can access their cart from there
        return redirect()->route('buyer.dashboard')->with('success', 'Welcome! Please complete your profile to get started.');
    }

    /**
     * Transfer guest cart items to the newly registered user
     */
    private function transferGuestCart(Request $request, User $user): void
    {
        try {
            // Get guest cart from request (sent from frontend)
            $guestCartJson = $request->input('guest_cart');

            if (! $guestCartJson) {
                Log::info('No guest cart to transfer during registration');

                return;
            }

            $guestCart = json_decode($guestCartJson, true);

            if (! is_array($guestCart) || empty($guestCart)) {
                Log::info('Guest cart is empty or invalid');

                return;
            }

            Log::info('[Registration] Transferring guest cart', [
                'user_id' => $user->id,
                'items_count' => count($guestCart),
            ]);

            // Create cart order for the user
            $cart = Order::create([
                'user_id' => $user->id,
                'order_number' => 'CART-'.$user->id.'-'.time(),
                'status' => 'cart',
                'total_amount' => 0,
            ]);

            Log::info('[Registration] Cart order created', [
                'cart_id' => $cart->id,
                'order_number' => $cart->order_number,
            ]);

            $totalAmount = 0;

            foreach ($guestCart as $item) {
                if (! isset($item['product_id']) || ! isset($item['quantity'])) {
                    continue;
                }

                $product = Product::with('seller')->find($item['product_id']);

                if (! $product) {
                    Log::warning('[Registration] Product not found', ['product_id' => $item['product_id']]);

                    continue;
                }

                $orderItem = OrderItem::create([
                    'order_id' => $cart->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->featured_image ?? $product->primary_image,
                    'seller_name' => $product->seller->business_name ?? $product->seller->name,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $product->price * $item['quantity'],
                ]);

                $totalAmount += $orderItem->total;

                Log::info('[Registration] Cart item created', [
                    'item_id' => $orderItem->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                ]);
            }

            // Update cart total
            $cart->total_amount = $totalAmount;
            $cart->save();

            Log::info('[Registration] Guest cart transferred successfully', [
                'user_id' => $user->id,
                'cart_id' => $cart->id,
                'total_items' => $cart->items()->count(),
                'total_amount' => $cart->total_amount,
            ]);

        } catch (\Exception $e) {
            Log::error('[Registration] Error transferring guest cart', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
