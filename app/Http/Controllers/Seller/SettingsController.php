<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Show seller settings dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/settings/index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
            ],
        ]);
    }

    /**
     * Show security settings.
     */
    public function security(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/settings/security', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
            ],
        ]);
    }

    /**
     * Update seller password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return redirect()->back()->withErrors([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('seller.settings.security')->with('success', 
            'Password updated successfully!');
    }

    /**
     * Show notifications preferences.
     */
    public function notifications(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/settings/notifications', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'preferences' => [
                'email_notifications' => true, // Default for now
                'order_notifications' => true,
                'marketing_emails' => false,
                'sms_notifications' => false,
            ],
        ]);
    }

    /**
     * Show business settings.
     */
    public function business(): Response
    {
        $user = Auth::user();
        $sellerApplication = $user->sellerApplication;
        
        return Inertia::render('seller/settings/business', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'business' => $sellerApplication ? [
                'description' => $sellerApplication->business_description,
                'type' => $sellerApplication->business_type,
                'status' => $sellerApplication->status,
                'approved_at' => $sellerApplication->reviewed_at,
            ] : null,
            'businessTypes' => [
                'Handmade Crafts',
                'Food & Beverages',
                'Clothing & Accessories',
                'Art & Design',
                'Home & Garden',
                'Electronics & Gadgets',
                'Beauty & Personal Care',
                'Books & Media',
                'Sports & Recreation',
                'Other',
            ],
        ]);
    }

    /**
     * Show account settings.
     */
    public function account(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/settings/account', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Deactivate seller account.
     */
    public function deactivate(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string',
            'reason' => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return redirect()->back()->withErrors([
                'password' => 'The password is incorrect.',
            ]);
        }

        // Deactivate account
        $user->deactivate();

        // Log the deactivation reason
        \Log::info('Seller account deactivated', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'reason' => $request->reason,
            'deactivated_at' => now(),
        ]);

        Auth::logout();

        return redirect()->route('login')->with('success', 
            'Your seller account has been deactivated successfully.');
    }

    /**
     * Show seller statistics and analytics settings.
     */
    public function analytics(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/settings/analytics', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'analyticsSettings' => [
                'track_page_views' => true,
                'share_anonymous_data' => false,
                'export_data_enabled' => true,
            ],
        ]);
    }

    /**
     * Send email verification notification.
     */
    public function sendEmailVerification(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->back()->with('info', 'Your email address is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return redirect()->back()->with('success', 
            'Verification email sent! Please check your inbox.');
    }

    /**
     * Get seller settings summary for dashboard.
     */
    public function summary(): array
    {
        $user = Auth::user();
        
        return [
            'email_verified' => !empty($user->email_verified_at),
            'account_active' => $user->is_active,
            'profile_complete' => $user->profile_completeness >= 80,
            'business_setup' => $user->sellerApplication ? $user->sellerApplication->isApproved() : false,
            'needs_attention' => [
                'email_verification' => empty($user->email_verified_at),
                'incomplete_profile' => $user->profile_completeness < 80,
                'missing_business_info' => !$user->sellerApplication,
            ],
        ];
    }
}