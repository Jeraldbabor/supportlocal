<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_role',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'is_successful',
        'failure_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_successful' => 'boolean',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the user that performed this activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a user activity.
     */
    public static function log(
        string $action,
        ?User $user = null,
        ?string $description = null,
        bool $isSuccessful = true,
        ?string $failureReason = null,
        ?array $metadata = null,
        ?Request $request = null
    ): self {
        $request = $request ?? request();
        $userAgent = $request->userAgent();
        $parsed = self::parseUserAgent($userAgent);

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'action' => $action,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'device_type' => $parsed['device_type'],
            'browser' => $parsed['browser'],
            'platform' => $parsed['platform'],
            'is_successful' => $isSuccessful,
            'failure_reason' => $failureReason,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log a successful login.
     */
    public static function logLogin(User $user, ?Request $request = null): self
    {
        return self::log(
            'login',
            $user,
            "{$user->getRoleDisplayName()} {$user->name} logged in",
            true,
            null,
            null,
            $request
        );
    }

    /**
     * Log a failed login attempt.
     */
    public static function logFailedLogin(string $email, string $reason = 'Invalid credentials', ?Request $request = null): self
    {
        return self::log(
            'login_failed',
            null,
            "Failed login attempt for {$email}",
            false,
            $reason,
            ['attempted_email' => $email],
            $request
        );
    }

    /**
     * Log a logout.
     */
    public static function logLogout(User $user, ?Request $request = null): self
    {
        return self::log(
            'logout',
            $user,
            "{$user->getRoleDisplayName()} {$user->name} logged out",
            true,
            null,
            null,
            $request
        );
    }

    /**
     * Log a user registration.
     */
    public static function logRegistration(User $user, ?Request $request = null): self
    {
        return self::log(
            'register',
            $user,
            "New {$user->getRoleDisplayName()} registered: {$user->name}",
            true,
            null,
            null,
            $request
        );
    }

    /**
     * Log a password reset request.
     */
    public static function logPasswordResetRequest(User $user, ?Request $request = null): self
    {
        return self::log(
            'password_reset_request',
            $user,
            "{$user->name} requested a password reset",
            true,
            null,
            null,
            $request
        );
    }

    /**
     * Log a password change.
     */
    public static function logPasswordChange(User $user, ?Request $request = null): self
    {
        return self::log(
            'password_change',
            $user,
            "{$user->name} changed their password",
            true,
            null,
            null,
            $request
        );
    }

    /**
     * Parse user agent string.
     */
    protected static function parseUserAgent(?string $userAgent): array
    {
        if (!$userAgent) {
            return [
                'device_type' => 'unknown',
                'browser' => 'Unknown',
                'platform' => 'Unknown',
            ];
        }

        // Detect device type
        $deviceType = 'desktop';
        if (preg_match('/Mobile|Android|iPhone|iPad|iPod/i', $userAgent)) {
            $deviceType = preg_match('/iPad|Tablet/i', $userAgent) ? 'tablet' : 'mobile';
        }

        // Detect browser
        $browser = 'Unknown';
        if (preg_match('/Firefox\/([0-9.]+)/i', $userAgent, $matches)) {
            $browser = 'Firefox ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Edg\/([0-9.]+)/i', $userAgent, $matches)) {
            $browser = 'Edge ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Chrome\/([0-9.]+)/i', $userAgent, $matches)) {
            $browser = 'Chrome ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Safari\/([0-9.]+)/i', $userAgent) && !preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/OPR\/([0-9.]+)/i', $userAgent, $matches)) {
            $browser = 'Opera ' . explode('.', $matches[1])[0];
        }

        // Detect platform
        $platform = 'Unknown';
        if (preg_match('/Windows NT 10/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/Windows/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/Mac OS X/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/iPhone|iPad/i', $userAgent)) {
            $platform = 'iOS';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $platform = 'Android';
        }

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'platform' => $platform,
        ];
    }

    /**
     * Get human-readable action label.
     */
    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'login' => 'Logged In',
            'logout' => 'Logged Out',
            'login_failed' => 'Failed Login',
            'register' => 'Registered',
            'password_reset_request' => 'Password Reset Request',
            'password_change' => 'Password Changed',
            'profile_update' => 'Profile Updated',
            'email_verified' => 'Email Verified',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }

    /**
     * Get role display name.
     */
    public function getRoleDisplayAttribute(): string
    {
        return match ($this->user_role) {
            User::ROLE_ADMINISTRATOR => 'Admin',
            User::ROLE_SELLER => 'Seller',
            User::ROLE_BUYER => 'Buyer',
            default => 'User',
        };
    }

    /**
     * Scope to filter by action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by role.
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('user_role', $role);
    }

    /**
     * Scope to get recent logs.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
