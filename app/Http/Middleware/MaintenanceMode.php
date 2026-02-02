<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMode
{
    /**
     * Routes that should be accessible even in maintenance mode
     */
    protected array $except = [
        'login',
        'login.store',
        'logout',
        'admin/*',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if maintenance mode is enabled
        if ($this->isMaintenanceModeEnabled()) {
            // Allow admins to access the site
            if ($this->isAdmin($request)) {
                return $next($request);
            }

            // Allow certain routes (login, logout, admin routes)
            if ($this->shouldPassThrough($request)) {
                return $next($request);
            }

            // Return maintenance page
            return $this->maintenanceResponse($request);
        }

        return $next($request);
    }

    /**
     * Check if maintenance mode is enabled
     */
    protected function isMaintenanceModeEnabled(): bool
    {
        try {
            // Check if settings table exists
            if (! \Schema::hasTable('settings')) {
                return false;
            }

            return (bool) Setting::get('maintenance_mode', false);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check if the current user is an admin
     */
    protected function isAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user && $user->role === User::ROLE_ADMINISTRATOR;
    }

    /**
     * Determine if the request should pass through maintenance mode
     */
    protected function shouldPassThrough(Request $request): bool
    {
        foreach ($this->except as $except) {
            if ($request->routeIs($except)) {
                return true;
            }

            // Check for admin routes
            if ($except === 'admin/*' && str_starts_with($request->path(), 'admin')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return the maintenance mode response
     */
    protected function maintenanceResponse(Request $request): Response
    {
        $siteName = Setting::get('site_name', config('app.name'));
        $siteEmail = Setting::get('site_email', '');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'We are currently performing scheduled maintenance. Please try again later.',
            ], 503);
        }

        return Inertia::render('Maintenance', [
            'siteName' => $siteName,
            'siteEmail' => $siteEmail,
        ])->toResponse($request)->setStatusCode(503);
    }
}
