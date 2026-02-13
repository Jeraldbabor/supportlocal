<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
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

        // Check if registration is enabled
        $registrationEnabled = Setting::get('registration_enabled', true);

        return Inertia::render('auth/register', [
            'sellerCount' => $sellerCount,
            'featuredArtisans' => $featuredArtisans,
            'registrationEnabled' => $registrationEnabled,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if registration is enabled
        if (! Setting::get('registration_enabled', true)) {
            return redirect()->route('register')
                ->with('error', 'Registration is currently disabled. Please try again later.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email:rfc,dns|max:255|unique:'.User::class,
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'password.min' => 'Password must be at least 8 characters.',
            'password.letters' => 'Password must contain at least one letter.',
            'password.mixed' => 'Password must contain both uppercase and lowercase letters.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one special character (@, #, $, %, etc.).',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_BUYER, // Default all new users to buyer
        ]);

        // Log user registration activity
        Log::info('New user registered', [
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Log to activity log
        ActivityLog::logRegistration($user, $request);

        // Login the user first
        Auth::login($user);

        // Send verification email directly and synchronously with retry logic
        // We call this directly instead of relying on the Registered event
        // to ensure the email is sent immediately before redirect
        $maxAttempts = 3;
        $attempt = 0;
        $emailSent = false;

        // Refresh the user to ensure all attributes are loaded
        $user->refresh();

        while ($attempt < $maxAttempts && ! $emailSent) {
            $attempt++;
            try {
                // Send the verification notification
                $user->sendEmailVerificationNotification();

                Log::info('Verification email sent successfully during registration', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'attempt' => $attempt,
                ]);

                $emailSent = true;
            } catch (\Throwable $e) {
                // Log the error with full details for debugging
                Log::error('Failed to send verification email during registration', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                // Wait 1 second before retrying (except on last attempt)
                if ($attempt < $maxAttempts) {
                    sleep(1);
                }
            }
        }

        if (! $emailSent) {
            Log::warning('All verification email attempts failed during registration', [
                'user_id' => $user->id,
                'email' => $user->email,
                'total_attempts' => $maxAttempts,
            ]);
        }

        // Fire the Registered event for any other listeners (but not for email - already sent above)
        event(new Registered($user));

        // Store guest cart data in session for transfer after email verification
        if ($request->has('guestCart')) {
            session(['pending_guest_cart' => $request->guestCart]);
        }

        // Redirect to email verification page
        return redirect()->route('verification.notice')->with('success', 'Registration successful! Please check your email to verify your account.');
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
