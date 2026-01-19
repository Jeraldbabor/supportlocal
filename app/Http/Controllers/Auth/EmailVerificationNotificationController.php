<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('Verification email resend requested', [
            'user_id' => $request->user()->id,
            'email' => $request->user()->email,
        ]);

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        try {
            $request->user()->sendEmailVerificationNotification();
            Log::info('Verification email resent', [
                'user_id' => $request->user()->id,
                'email' => $request->user()->email,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to resend verification email', [
                'user_id' => $request->user()->id,
                'email' => $request->user()->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'email' => 'Unable to send verification email. Please try again later.',
            ]);
        }

        return back()->with('status', 'verification-link-sent');
    }
}
