<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification with retry logic.
     * Progressive cooldown: 1 min for first 2 attempts, 10 min on 3rd attempt.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $userId = $user->id;

        Log::info('Verification email resend requested', [
            'user_id' => $userId,
            'email' => $user->email,
        ]);

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Check cooldown
        $cooldownKey = "email_verification_cooldown_{$userId}";
        $countKey = "email_verification_count_{$userId}";

        $cooldownUntil = Cache::get($cooldownKey);
        if ($cooldownUntil && now()->lt($cooldownUntil)) {
            $remainingSeconds = now()->diffInSeconds($cooldownUntil);
            $remainingMinutes = ceil($remainingSeconds / 60);

            Log::info('Verification email resend blocked by cooldown', [
                'user_id' => $userId,
                'cooldown_remaining_seconds' => $remainingSeconds,
            ]);

            return back()->withErrors([
                'email' => "Please wait {$remainingMinutes} minute(s) before requesting another verification email.",
            ]);
        }

        // Get current resend count (resets after 10 minutes of no activity)
        $resendCount = Cache::get($countKey, 0);
        $resendCount++;

        // Retry logic: 3 automatic attempts per request
        $maxAttempts = 3;
        $attempt = 0;
        $emailSent = false;

        while ($attempt < $maxAttempts && ! $emailSent) {
            $attempt++;
            try {
                $user->sendEmailVerificationNotification();
                Log::info('Verification email resent successfully', [
                    'user_id' => $userId,
                    'email' => $user->email,
                    'attempt' => $attempt,
                    'resend_count' => $resendCount,
                ]);
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::error('Failed to resend verification email', [
                    'user_id' => $userId,
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
            Log::warning('All verification email resend attempts failed', [
                'user_id' => $userId,
                'email' => $user->email,
                'total_attempts' => $maxAttempts,
            ]);

            return back()->withErrors([
                'email' => 'Unable to send verification email after multiple attempts. Please try again later.',
            ]);
        }

        // Set cooldown based on resend count
        // 1st and 2nd resend: 1 minute cooldown
        // 3rd resend: 10 minute cooldown, then reset counter
        if ($resendCount >= 3) {
            // 10 minute cooldown on 3rd attempt, reset counter
            Cache::put($cooldownKey, now()->addMinutes(10), now()->addMinutes(10));
            Cache::forget($countKey); // Reset count after 3rd attempt

            Log::info('Verification email 3rd resend - 10 minute cooldown applied', [
                'user_id' => $userId,
            ]);

            return back()->with('status', 'verification-link-sent')
                ->with('cooldown_message', 'Verification email sent. You can request another one in 10 minutes.');
        } else {
            // 1 minute cooldown for 1st and 2nd attempts
            Cache::put($cooldownKey, now()->addMinutes(1), now()->addMinutes(1));
            Cache::put($countKey, $resendCount, now()->addMinutes(15)); // Keep count for 15 mins

            Log::info('Verification email resend - 1 minute cooldown applied', [
                'user_id' => $userId,
                'resend_count' => $resendCount,
            ]);
        }

        return back()->with('status', 'verification-link-sent');
    }
}
