<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AdminAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'description',
        'ip_address',
        'user_agent',
        'route',
        'method',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    /**
     * Get the user that performed this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to get recent logs.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Log an admin action.
     */
    public static function log(
        string $action,
        ?string $description = null,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): ?self {
        $user = Auth::user();

        // Only log if user is authenticated and is an administrator
        if (!$user || !$user->isAdministrator()) {
            return null;
        }

        return self::create([
            'user_id' => $user->id,
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'route' => Request::route()?->getName(),
            'method' => Request::method(),
        ]);
    }

    /**
     * Log a model creation.
     */
    public static function logCreate(Model $model, ?string $description = null): ?self
    {
        return self::log(
            'create',
            $description ?? 'Created ' . class_basename($model) . ' #' . $model->id,
            $model,
            null,
            $model->toArray()
        );
    }

    /**
     * Log a model update.
     */
    public static function logUpdate(Model $model, array $oldValues, ?string $description = null): ?self
    {
        $changedValues = array_intersect_key($model->toArray(), $oldValues);

        return self::log(
            'update',
            $description ?? 'Updated ' . class_basename($model) . ' #' . $model->id,
            $model,
            $oldValues,
            $changedValues
        );
    }

    /**
     * Log a model deletion.
     */
    public static function logDelete(Model $model, ?string $description = null): ?self
    {
        return self::log(
            'delete',
            $description ?? 'Deleted ' . class_basename($model) . ' #' . $model->id,
            $model,
            $model->toArray(),
            null
        );
    }

    /**
     * Get human-readable action label.
     */
    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'create' => 'Created',
            'update' => 'Updated',
            'delete' => 'Deleted',
            'login' => 'Logged In',
            'logout' => 'Logged Out',
            'password_change' => 'Changed Password',
            'user_activate' => 'Activated User',
            'user_deactivate' => 'Deactivated User',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }
}
