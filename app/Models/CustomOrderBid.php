<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOrderBid extends Model
{
    use HasFactory;

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';

    const STATUS_ACCEPTED = 'accepted';

    const STATUS_REJECTED = 'rejected';

    const STATUS_WITHDRAWN = 'withdrawn';

    /**
     * Status labels for display
     */
    public static $statusLabels = [
        self::STATUS_PENDING => 'Pending Review',
        self::STATUS_ACCEPTED => 'Accepted',
        self::STATUS_REJECTED => 'Rejected',
        self::STATUS_WITHDRAWN => 'Withdrawn',
    ];

    /**
     * Status colors for UI badges
     */
    public static $statusColors = [
        self::STATUS_PENDING => 'yellow',
        self::STATUS_ACCEPTED => 'green',
        self::STATUS_REJECTED => 'red',
        self::STATUS_WITHDRAWN => 'gray',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'custom_order_request_id',
        'seller_id',
        'proposed_price',
        'estimated_days',
        'message',
        'additional_notes',
        'status',
        'accepted_at',
        'rejected_at',
        'rejection_reason',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'proposed_price' => 'decimal:2',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'status_label',
        'status_color',
    ];

    /**
     * Get the custom order request
     */
    public function customOrderRequest(): BelongsTo
    {
        return $this->belongsTo(CustomOrderRequest::class);
    }

    /**
     * Get the seller who made the bid
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::$statusLabels[$this->status] ?? 'Unknown';
    }

    /**
     * Get the status color
     */
    public function getStatusColorAttribute(): string
    {
        return self::$statusColors[$this->status] ?? 'gray';
    }

    /**
     * Check if bid can be accepted
     */
    public function canBeAccepted(): bool
    {
        return $this->status === self::STATUS_PENDING
            && $this->customOrderRequest
            && $this->customOrderRequest->status === CustomOrderRequest::STATUS_OPEN;
    }

    /**
     * Check if bid can be rejected
     */
    public function canBeRejected(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if bid can be withdrawn by seller
     */
    public function canBeWithdrawn(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Scope: Pending bids
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: For seller
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Transform for API response with seller info
     */
    public function toArrayWithSeller(): array
    {
        $seller = $this->seller;

        return [
            'id' => $this->id,
            'custom_order_request_id' => $this->custom_order_request_id,
            'seller_id' => $this->seller_id,
            'proposed_price' => $this->proposed_price,
            'estimated_days' => $this->estimated_days,
            'message' => $this->message,
            'additional_notes' => $this->additional_notes,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,
            'accepted_at' => $this->accepted_at,
            'rejected_at' => $this->rejected_at,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'seller' => $seller ? [
                'id' => $seller->id,
                'name' => $seller->name,
                'avatar_url' => $seller->avatar_url,
                'address' => $seller->address,
                'seller_rating' => $seller->average_seller_rating ?? null,
                'total_sales' => $seller->completed_orders_count ?? 0,
            ] : null,
        ];
    }
}
