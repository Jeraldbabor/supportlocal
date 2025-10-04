<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerApplication extends Model
{
    use HasFactory;

    /**
     * Application status constants
     */
    const STATUS_PENDING = 'pending';

    const STATUS_APPROVED = 'approved';

    const STATUS_REJECTED = 'rejected';

    /**
     * Available ID document types
     */
    const ID_TYPES = [
        'national_id' => 'National ID',
        'passport' => 'Passport',
        'drivers_license' => 'Driver\'s License',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'business_description',
        'business_type',
        'id_document_path',
        'id_document_type',
        'additional_documents_path',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'reviewed_at' => 'datetime',
        'additional_documents_path' => 'array',
    ];

    /**
     * Get the user that submitted the application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who reviewed the application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if application is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if application is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if application is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Approve the application.
     */
    public function approve(User $reviewer, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'admin_notes' => $notes,
        ]);

        // Update user role to seller
        $this->user->update(['role' => User::ROLE_SELLER]);
    }

    /**
     * Reject the application.
     */
    public function reject(User $reviewer, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Get the display name for ID document type.
     */
    public function getIdDocumentTypeDisplayAttribute(): string
    {
        return self::ID_TYPES[$this->id_document_type] ?? $this->id_document_type;
    }

    /**
     * Scope for pending applications.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for approved applications.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for rejected applications.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }
}
