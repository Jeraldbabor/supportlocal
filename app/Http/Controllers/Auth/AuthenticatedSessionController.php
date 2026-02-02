<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ActivityLog;
use App\Models\AdminAuditLog;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\AdminEmailNotifiable;
use App\Notifications\AdminLoginAlert;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        // Log user login activity
        Log::info('User logged in', [
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Log to activity log (all users)
        ActivityLog::logLogin($user, $request);

        // Log admin login to audit log and send email notification (admin only)
        if ($user->isAdministrator()) {
            AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'login',
                'description' => "Admin {$user->name} logged in",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'route' => 'login',
                'method' => 'POST',
            ]);

            // Send email notification to admin email from settings
            $this->sendAdminLoginNotification($user, $request);
        }

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
     * Send admin login notification email
     */
    private function sendAdminLoginNotification(User $admin, Request $request): void
    {
        try {
            // Check if email notifications are enabled
            $emailNotificationsEnabled = Setting::get('email_notifications_enabled', true);
            if (! $emailNotificationsEnabled) {
                Log::info('Admin login notification skipped - email notifications disabled');

                return;
            }

            // Check if admin login alerts are enabled
            $adminLoginAlertEnabled = Setting::get('admin_login_alert', true);
            if (! $adminLoginAlertEnabled) {
                Log::info('Admin login notification skipped - admin login alerts disabled');

                return;
            }

            // Get admin email from settings
            $adminEmail = Setting::get('admin_email', '');
            if (empty($adminEmail)) {
                // Fallback to the logged-in admin's email if no admin email is configured
                $adminEmail = $admin->email;
            }

            // Send the notification
            $notifiable = new AdminEmailNotifiable($adminEmail);
            $notifiable->notify(new AdminLoginAlert(
                $admin,
                $request->ip(),
                $request->userAgent() ?? 'Unknown'
            ));

            Log::info('Admin login notification sent', [
                'admin_id' => $admin->id,
                'admin_email' => $admin->email,
                'notification_email' => $adminEmail,
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the login
            Log::error('Failed to send admin login notification', [
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Log user logout activity before logging out
        if ($user) {
            Log::info('User logged out', [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'ip_address' => $request->ip(),
            ]);

            // Log to activity log (all users)
            ActivityLog::logLogout($user, $request);

            // Log admin logout to audit log (admin only)
            if ($user->isAdministrator()) {
                AdminAuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'logout',
                    'description' => "Admin {$user->name} logged out",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'route' => 'logout',
                    'method' => 'POST',
                ]);
            }
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
