<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * Order status constants
     */
    const STATUS_PENDING = 'pending';

    const STATUS_CONFIRMED = 'confirmed';

    const STATUS_SHIPPED = 'shipped';

    const STATUS_DELIVERED = 'delivered';

    const STATUS_CANCELLED = 'cancelled';

    const STATUS_COMPLETED = 'completed';

    /**
     * Payment status constants
     */
    const PAYMENT_PENDING = 'pending';

    const PAYMENT_PAID = 'paid';

    const PAYMENT_FAILED = 'failed';

    const PAYMENT_REFUNDED = 'refunded';

    /**
     * Payment methods
     */
    const PAYMENT_COD = 'cod';

    const PAYMENT_GCASH = 'gcash';

    /**
     * Delivery methods
     */
    const DELIVERY_METHOD_DELIVERY = 'delivery';

    const DELIVERY_METHOD_PICKUP = 'pickup';

    /**
     * Shipping providers
     */
    const SHIPPING_JT_EXPRESS = 'jt_express';

    const SHIPPING_OTHER = 'other';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id', // This is the buyer_id
        'seller_id',
        'order_number',
        'shipping_name',
        'shipping_email',
        'shipping_phone',
        'shipping_address',
        'delivery_address',
        'delivery_phone',
        'delivery_notes',
        'delivery_method',
        'payment_method',
        'payment_status',
        'payment_proof',
        'payment_verification_notes',
        'payment_verified_at',
        'gcash_number',
        'gcash_reference',
        'special_instructions',
        'subtotal',
        'shipping_fee',
        'shipping_provider',
        'tracking_number',
        'waybill_number',
        'total_amount',
        'commission_rate',
        'admin_commission',
        'seller_net_amount',
        'status',
        'rejection_reason',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
        'seller_confirmed_at',
        'shipped_at',
        'delivered_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'admin_commission' => 'decimal:2',
        'seller_net_amount' => 'decimal:2',
        'seller_confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'payment_proof_url',
    ];

    /**
     * Get the payment proof URL.
     */
    public function getPaymentProofUrlAttribute(): ?string
    {
        if (! $this->payment_proof) {
            return null;
        }

        return \App\Helpers\ImageHelper::url($this->payment_proof);
    }

    /**
     * Get the buyer that owns the order.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the seller that owns the order.
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Alias for orderItems - used for cart functionality
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_CONFIRMED => 'blue',
            self::STATUS_SHIPPED => 'purple',
            self::STATUS_DELIVERED => 'green',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELLED => 'red',
            default => 'gray',
        };
    }

    /**
     * Get the status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_CONFIRMED => 'Confirmed',
            self::STATUS_SHIPPED => 'Shipped',
            self::STATUS_DELIVERED => 'Delivered',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown',
        };
    }

    /**
     * Get the payment status badge color.
     */
    public function getPaymentStatusColorAttribute(): string
    {
        return match ($this->payment_status) {
            self::PAYMENT_PENDING => 'yellow',
            self::PAYMENT_PAID => 'green',
            self::PAYMENT_FAILED => 'red',
            self::PAYMENT_REFUNDED => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get the payment status label.
     */
    public function getPaymentStatusLabelAttribute(): string
    {
        return match ($this->payment_status) {
            self::PAYMENT_PENDING => 'Pending',
            self::PAYMENT_PAID => 'Paid',
            self::PAYMENT_FAILED => 'Failed',
            self::PAYMENT_REFUNDED => 'Refunded',
            default => 'Unknown',
        };
    }

    /**
     * Check if order can be confirmed.
     */
    public function canBeConfirmed(): bool
    {
        if ($this->status !== self::STATUS_PENDING) {
            return false;
        }

        // For COD orders, payment is automatically considered paid
        if ($this->payment_method === self::PAYMENT_COD) {
            return true;
        }

        // For GCash orders, payment must be verified first
        if ($this->payment_method === self::PAYMENT_GCASH) {
            return $this->payment_status === self::PAYMENT_PAID;
        }

        return false;
    }

    /**
     * Check if payment proof can be uploaded.
     */
    public function canUploadPaymentProof(): bool
    {
        return $this->payment_method === self::PAYMENT_GCASH
            && $this->status === self::STATUS_PENDING
            && $this->payment_status === self::PAYMENT_PENDING;
    }

    /**
     * Check if payment can be verified.
     */
    public function canVerifyPayment(): bool
    {
        return $this->payment_method === self::PAYMENT_GCASH
            && $this->status === self::STATUS_PENDING
            && $this->payment_proof !== null
            && $this->payment_status === self::PAYMENT_PENDING;
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Check if order can be cancelled by buyer.
     * Buyers can only cancel orders that are still pending (not yet confirmed by seller).
     */
    public function canBeCancelledByBuyer(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if order can be completed.
     */
    public function canBeCompleted(): bool
    {
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_SHIPPED]);
    }

    /**
     * Calculate and apply commission for this order.
     * This should be called when the order is completed.
     *
     * @param  float|null  $commissionRate  Optional custom rate, defaults to system setting
     * @return array Returns array with commission details
     */
    public function calculateCommission(?float $commissionRate = null): array
    {
        // Get commission rate from settings if not provided
        if ($commissionRate === null) {
            $commissionRate = seller_commission_rate();
        }

        $totalAmount = (float) $this->total_amount;
        $adminCommission = round(($totalAmount * $commissionRate) / 100, 2);
        $sellerNetAmount = round($totalAmount - $adminCommission, 2);

        $this->update([
            'commission_rate' => $commissionRate,
            'admin_commission' => $adminCommission,
            'seller_net_amount' => $sellerNetAmount,
        ]);

        return [
            'total_amount' => $totalAmount,
            'commission_rate' => $commissionRate,
            'admin_commission' => $adminCommission,
            'seller_net_amount' => $sellerNetAmount,
        ];
    }

    /**
     * Scope a query to only include orders for a specific buyer.
     */
    public function scopeForBuyer($query, $buyerId)
    {
        return $query->where('user_id', $buyerId);
    }

    /**
     * Scope a query to only include orders for a specific seller.
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Scope a query to only include orders with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
