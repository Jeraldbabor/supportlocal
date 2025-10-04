<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Check if user is authenticated
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // If no specific roles are required, allow access
        if (empty($roles)) {
            return $next($request);
        }

        // Check if user has any of the required roles
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                // Store user role in session for easy access
                session(['user_role' => $user->role]);

                return $next($request);
            }
        }

        // User doesn't have required role
        abort(403, 'Access denied. You do not have permission to access this resource.');
    }
}
