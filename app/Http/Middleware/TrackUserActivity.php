<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * The number of seconds between activity updates.
     * This prevents database spam on every request.
     */
    protected int $updateInterval = 60;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Only update if enough time has passed since the last update
            // This prevents excessive database writes
            $lastSeen = $user->last_seen_at;
            $now = now();

            if (!$lastSeen || $lastSeen->diffInSeconds($now) >= $this->updateInterval) {
                // Use query builder to avoid model events and be more efficient
                \DB::table('users')
                    ->where('id', $user->id)
                    ->update(['last_seen_at' => $now]);
            }
        }

        return $next($request);
    }
}
