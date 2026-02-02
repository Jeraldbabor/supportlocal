<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

        // Get cooldown info for the user
        $userId = $request->user()->id;
        $cooldownKey = "email_verification_cooldown_{$userId}";
        $countKey = "email_verification_count_{$userId}";

        $cooldownUntil = Cache::get($cooldownKey);
        $resendCount = Cache::get($countKey, 0);

        $cooldownSeconds = 0;
        if ($cooldownUntil && now()->lt($cooldownUntil)) {
            $cooldownSeconds = now()->diffInSeconds($cooldownUntil);
        }

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
            'sellerCount' => $sellerCount,
            'featuredArtisans' => $featuredArtisans,
            'cooldownSeconds' => $cooldownSeconds,
            'resendCount' => $resendCount,
        ]);
    }
}
