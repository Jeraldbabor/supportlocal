<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CustomOrderRequest extends Model
{
    use HasFactory;

    /**
     * Status constants
     */
    const STATUS_OPEN = 'open'; // Public request accepting bids

    const STATUS_PENDING = 'pending'; // Direct request to specific seller

    const STATUS_QUOTED = 'quoted';

    const STATUS_ACCEPTED = 'accepted';

    const STATUS_REJECTED = 'rejected';

    const STATUS_DECLINED = 'declined';

    const STATUS_IN_PROGRESS = 'in_progress';

    const STATUS_READY_FOR_CHECKOUT = 'ready_for_checkout';

    const STATUS_COMPLETED = 'completed';

    const STATUS_CANCELLED = 'cancelled';

    /**
     * Categories for custom orders
     */
    public static $categories = [
        'clothing' => 'Clothing & Apparel',
        'accessories' => 'Accessories & Jewelry',
        'home_decor' => 'Home Decor',
        'furniture' => 'Furniture',
        'art' => 'Art & Paintings',
        'crafts' => 'Crafts & Handmade',
        'food' => 'Food & Delicacies',
        'gifts' => 'Personalized Gifts',
        'bags' => 'Bags & Pouches',
        'woodwork' => 'Woodwork',
        'metalwork' => 'Metalwork',
        'pottery' => 'Pottery & Ceramics',
        'textiles' => 'Textiles & Weaving',
        'other' => 'Other',
    ];

    /**
     * Status labels for display
     */
    public static $statusLabels = [
        self::STATUS_OPEN => 'Open for Bids',
        self::STATUS_PENDING => 'Pending Review',
        self::STATUS_QUOTED => 'Quote Received',
        self::STATUS_ACCEPTED => 'Bid Accepted',
        self::STATUS_REJECTED => 'Request Rejected',
        self::STATUS_DECLINED => 'Quote Declined',
        self::STATUS_IN_PROGRESS => 'In Progress',
        self::STATUS_READY_FOR_CHECKOUT => 'Ready for Checkout',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_CANCELLED => 'Cancelled',
    ];

    /**
     * Status colors for UI badges
     */
    public static $statusColors = [
        self::STATUS_OPEN => 'blue',
        self::STATUS_PENDING => 'yellow',
        self::STATUS_QUOTED => 'blue',
        self::STATUS_ACCEPTED => 'green',
        self::STATUS_REJECTED => 'red',
        self::STATUS_DECLINED => 'gray',
        self::STATUS_IN_PROGRESS => 'purple',
        self::STATUS_READY_FOR_CHECKOUT => 'orange',
        self::STATUS_COMPLETED => 'green',
        self::STATUS_CANCELLED => 'gray',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'request_number',
        'buyer_id',
        'seller_id',
        'is_public',
        'title',
        'category',
        'description',
        'reference_images',
        'budget_min',
        'budget_max',
        'quantity',
        'preferred_deadline',
        'special_requirements',
        'status',
        'quoted_price',
        'estimated_days',
        'seller_notes',
        'quoted_at',
        'accepted_at',
        'rejected_at',
        'rejection_reason',
        'completed_at',
        'product_id',
        'order_id',
        'accepted_bid_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'reference_images' => 'array',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'quoted_price' => 'decimal:2',
        'preferred_deadline' => 'date',
        'quoted_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_public' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'status_label',
        'status_color',
        'reference_image_urls',
        'formatted_budget',
        'category_label',
        'bids_count',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            // Generate unique request number
            if (empty($request->request_number)) {
                $request->request_number = 'COR-'.strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Get the buyer that made the request
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the seller that received the request
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the product created for this request
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the order created from this request
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get all bids for this request
     */
    public function bids(): HasMany
    {
        return $this->hasMany(CustomOrderBid::class);
    }

    /**
     * Get the accepted bid
     */
    public function acceptedBid(): BelongsTo
    {
        return $this->belongsTo(CustomOrderBid::class, 'accepted_bid_id');
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
     * Get reference image URLs
     */
    public function getReferenceImageUrlsAttribute(): array
    {
        if (! $this->reference_images || ! is_array($this->reference_images)) {
            return [];
        }

        return array_values(array_filter(array_map(function ($path) {
            if (is_string($path) && ! empty($path)) {
                return \App\Helpers\ImageHelper::url($path);
            }

            return null;
        }, $this->reference_images)));
    }

    /**
     * Get formatted budget range
     */
    public function getFormattedBudgetAttribute(): ?string
    {
        if (! $this->budget_min && ! $this->budget_max) {
            return null;
        }

        if ($this->budget_min && $this->budget_max) {
            return '₱'.number_format($this->budget_min, 2).' - ₱'.number_format($this->budget_max, 2);
        }

        if ($this->budget_min) {
            return 'From ₱'.number_format($this->budget_min, 2);
        }

        return 'Up to ₱'.number_format($this->budget_max, 2);
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute(): ?string
    {
        return $this->category ? (self::$categories[$this->category] ?? $this->category) : null;
    }

    /**
     * Get bids count
     */
    public function getBidsCountAttribute(): int
    {
        return $this->bids()->count();
    }

    /**
     * Check if request is open for bidding
     */
    public function isOpenForBids(): bool
    {
        return $this->is_public && $this->status === self::STATUS_OPEN;
    }

    /**
     * Check if a seller can bid on this request
     */
    public function canReceiveBidFrom(int $sellerId): bool
    {
        if (! $this->isOpenForBids()) {
            return false;
        }

        // Check if seller already submitted a bid
        return ! $this->bids()->where('seller_id', $sellerId)->exists();
    }

    /**
     * Check if request can be quoted (for direct requests)
     */
    public function canBeQuoted(): bool
    {
        return $this->status === self::STATUS_PENDING && ! $this->is_public;
    }

    /**
     * Check if request can be accepted by buyer
     */
    public function canBeAccepted(): bool
    {
        return $this->status === self::STATUS_QUOTED;
    }

    /**
     * Check if request can be declined by buyer
     */
    public function canBeDeclined(): bool
    {
        return $this->status === self::STATUS_QUOTED;
    }

    /**
     * Check if request can be rejected by seller
     */
    public function canBeRejected(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_QUOTED,
        ]);
    }

    /**
     * Check if work can be started
     */
    public function canStartWork(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    /**
     * Check if request can be sent for checkout (seller finished work)
     */
    public function canBeSentForCheckout(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if request can be checked out by buyer
     */
    public function canBeCheckedOut(): bool
    {
        return $this->status === self::STATUS_READY_FOR_CHECKOUT;
    }

    /**
     * Check if request can be completed (after payment)
     */
    public function canBeCompleted(): bool
    {
        return $this->status === self::STATUS_READY_FOR_CHECKOUT;
    }

    /**
     * Scope: For buyer
     */
    public function scopeForBuyer($query, $buyerId)
    {
        return $query->where('buyer_id', $buyerId);
    }

    /**
     * Scope: For seller
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Scope: With status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Pending
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Open for bidding (public requests)
     */
    public function scopeOpenForBids($query)
    {
        return $query->where('is_public', true)->where('status', self::STATUS_OPEN);
    }

    /**
     * Scope: Public requests
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: Active (not completed or cancelled)
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
            self::STATUS_REJECTED,
            self::STATUS_DECLINED,
        ]);
    }
}
