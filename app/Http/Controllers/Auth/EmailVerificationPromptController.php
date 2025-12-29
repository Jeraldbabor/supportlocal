<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

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

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
            'sellerCount' => $sellerCount,
            'featuredArtisans' => $featuredArtisans,
        ]);
    }
}
