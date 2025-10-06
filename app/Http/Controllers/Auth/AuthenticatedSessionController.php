<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
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
        
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'sellerCount' => $sellerCount,
            'featuredArtisans' => $featuredArtisans,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Store user role in session for middleware
        $request->session()->put('user_role', $user->role);

        // Flash a welcome message with role information
        $request->session()->flash('status', "Welcome back, {$user->name}! You are logged in as {$user->getRoleDisplayName()}.");

        // Redirect based on user role
        $redirectUrl = $this->getRoleDashboardUrl($user);

        return redirect()->intended($redirectUrl);
    }

    /**
     * Get the appropriate dashboard URL based on user role
     */
    private function getRoleDashboardUrl(User $user): string
    {
        switch ($user->role) {
            case User::ROLE_SELLER:
                return route('seller.dashboard', absolute: false);
            case User::ROLE_ADMINISTRATOR:
                return route('admin.dashboard', absolute: false);
            case User::ROLE_BUYER:
                return route('buyer.dashboard', absolute: false);
            default:
                return route('dashboard', absolute: false);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
