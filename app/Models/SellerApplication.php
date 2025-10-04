<?php

namespace App\Models;

use App\Notifications\SellerApplicationApproved;
use App\Notifications\SellerApplicationRejected;
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
        // Check if the buyer has sufficient profile information
        if (!$this->user->hasCompleteProfileForSeller()) {
            $missingFields = $this->user->getMissingSellerProfileFields();
            throw new \Exception('Cannot approve application. User profile is incomplete. Missing: ' . implode(', ', $missingFields));
        }

        $this->update([
            'status' => self::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'admin_notes' => $notes,
        ]);

        // Preserve buyer profile information and update role to seller
        // Note: All profile fields (name, email, phone, address, avatar, etc.) 
        // are already stored in the same users table and will be preserved
        $this->user->update([
            'role' => User::ROLE_SELLER,
            'is_active' => true, // Ensure the seller account is active
        ]);

        // Send notification to the user
        $this->user->notify(new SellerApplicationApproved($this));

        // Log the role change for audit purposes with complete profile preservation
        \Log::info('User role changed from buyer to seller with complete data preservation', [
            'user_id' => $this->user->id,
            'user_email' => $this->user->email,
            'application_id' => $this->id,
            'reviewed_by' => $reviewer->id,
            'preserved_buyer_data' => [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone_number' => $this->user->phone_number,
                'profile_picture' => $this->user->profile_picture,
                'address' => $this->user->address,
                'date_of_birth' => $this->user->date_of_birth,
                'delivery_address' => $this->user->delivery_address,
                'delivery_phone' => $this->user->delivery_phone,
                'delivery_notes' => $this->user->delivery_notes,
                'gcash_number' => $this->user->gcash_number,
                'gcash_name' => $this->user->gcash_name,
                'email_verified_at' => $this->user->email_verified_at,
                'created_at' => $this->user->created_at,
                'last_login_at' => $this->user->last_login_at,
            ],
            'business_information' => [
                'business_type' => $this->business_type,
                'business_description' => $this->business_description,
                'application_date' => $this->created_at,
                'approved_date' => now(),
            ],
            'data_preservation_complete' => true,
        ]);
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

        // Send notification to the user
        $this->user->notify(new SellerApplicationRejected($this));
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
