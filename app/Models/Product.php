<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    /**
     * Product status constants
     */
    const STATUS_DRAFT = 'draft';

    const STATUS_ACTIVE = 'active';

    const STATUS_INACTIVE = 'inactive';

    const STATUS_ARCHIVED = 'archived';

    /**
     * Stock status constants
     */
    const STOCK_IN_STOCK = 'in_stock';

    const STOCK_OUT_OF_STOCK = 'out_of_stock';

    const STOCK_LOW_STOCK = 'low_stock';

    /**
     * Product condition constants
     */
    const CONDITION_NEW = 'new';

    const CONDITION_USED = 'used';

    const CONDITION_REFURBISHED = 'refurbished';

    /**
     * Available product statuses
     */
    public static $statuses = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_ACTIVE => 'Active',
        self::STATUS_INACTIVE => 'Inactive',
        self::STATUS_ARCHIVED => 'Archived',
    ];

    /**
     * Available stock statuses
     */
    public static $stockStatuses = [
        self::STOCK_IN_STOCK => 'In Stock',
        self::STOCK_OUT_OF_STOCK => 'Out of Stock',
        self::STOCK_LOW_STOCK => 'Low Stock',
    ];

    /**
     * Available conditions
     */
    public static $conditions = [
        self::CONDITION_NEW => 'New',
        self::CONDITION_USED => 'Used',
        self::CONDITION_REFURBISHED => 'Refurbished',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'seller_id',
        'category_id',
        'name',
        'description',
        'short_description',
        'sku',
        'slug',
        'price',
        'compare_price',
        'cost_price',
        'quantity',
        'low_stock_threshold',
        'track_quantity',
        'allow_backorders',
        'stock_status',
        'weight',
        'weight_unit',
        'dimensions',
        'condition',
        'meta_title',
        'meta_description',
        'tags',
        'status',
        'is_featured',
        'is_digital',
        'requires_shipping',
        'images',
        'featured_image',
        'subcategories',
        'shipping_weight',
        'shipping_cost',
        'free_shipping',
        'view_count',
        'order_count',
        'average_rating',
        'review_count',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'shipping_weight' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'dimensions' => 'array',
        'tags' => 'array',
        'subcategories' => 'array',
        'images' => 'array',
        'track_quantity' => 'boolean',
        'allow_backorders' => 'boolean',
        'is_featured' => 'boolean',
        'is_digital' => 'boolean',
        'requires_shipping' => 'boolean',
        'free_shipping' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Accessors to append to JSON serialization
     */
    protected $appends = [
        'primary_image',
        'formatted_price',
        'formatted_compare_price',
    ];

    /**
     * Get product count by status
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            // Generate SKU if not provided
            if (empty($product->sku)) {
                $product->sku = 'PRD-'.strtoupper(Str::random(8));
            }

            // Generate slug if not provided
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name).'-'.strtolower(Str::random(6));
            }

            // Update stock status based on quantity
            $product->updateStockStatus();
        });

        static::updating(function ($product) {
            // Update stock status when quantity or threshold changes
            if ($product->isDirty('quantity') || $product->isDirty('low_stock_threshold')) {
                $product->updateStockStatus();
            }

            // Update slug if name changes
            if ($product->isDirty('name') && empty($product->getOriginal('slug'))) {
                $product->slug = Str::slug($product->name).'-'.strtolower(Str::random(6));
            }
        });
    }

    /**
     * Get the seller that owns the product
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the product category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    /**
     * Get the ratings for the product
     */
    public function ratings()
    {
        return $this->hasMany(ProductRating::class);
    }

    /**
     * Calculate and update the average rating for the product
     */
    public function updateAverageRating(): void
    {
        $ratingsData = $this->ratings()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        $this->average_rating = $ratingsData->avg_rating ? round($ratingsData->avg_rating, 2) : 0;
        $this->review_count = $ratingsData->count;
        $this->saveQuietly(); // Save without triggering events
    }

    /**
     * Check if a user has rated this product
     */
    public function hasUserRated($userId): bool
    {
        return $this->ratings()->where('user_id', $userId)->exists();
    }

    /**
     * Get a user's rating for this product
     */
    public function getUserRating($userId)
    {
        return $this->ratings()->where('user_id', $userId)->first();
    }

    /**
     * Update stock status based on current quantity
     */
    public function updateStockStatus(): void
    {
        if (! $this->track_quantity) {
            $this->stock_status = self::STOCK_IN_STOCK;

            return;
        }

        if ($this->quantity <= 0) {
            $this->stock_status = self::STOCK_OUT_OF_STOCK;
        } elseif ($this->quantity <= $this->low_stock_threshold) {
            $this->stock_status = self::STOCK_LOW_STOCK;
        } else {
            $this->stock_status = self::STOCK_IN_STOCK;
        }
    }

    /**
     * Check if product is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock_status === self::STOCK_IN_STOCK ||
               ($this->stock_status === self::STOCK_LOW_STOCK && $this->quantity > 0);
    }

    /**
     * Check if product is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_status === self::STOCK_OUT_OF_STOCK;
    }

    /**
     * Check if product has low stock
     */
    public function hasLowStock(): bool
    {
        return $this->stock_status === self::STOCK_LOW_STOCK;
    }

    /**
     * Check if product is active and published
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && $this->published_at !== null;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return '₱'.number_format($this->price, 2);
    }

    /**
     * Get formatted compare price
     */
    public function getFormattedComparePriceAttribute(): ?string
    {
        return $this->compare_price ? '₱'.number_format($this->compare_price, 2) : null;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentageAttribute(): ?float
    {
        if (! $this->compare_price || $this->compare_price <= $this->price) {
            return null;
        }

        return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 1);
    }

    /**
     * Get profit margin
     */
    public function getProfitMarginAttribute(): ?float
    {
        if (! $this->cost_price || $this->cost_price >= $this->price) {
            return null;
        }

        return round((($this->price - $this->cost_price) / $this->price) * 100, 1);
    }

    /**
     * Get the primary image
     */
    public function getPrimaryImageAttribute(): ?string
    {
        if ($this->featured_image) {
            return $this->featured_image;
        }

        if ($this->images && count($this->images) > 0) {
            return $this->images[0];
        }

        return null;
    }

    /**
     * Scope: Active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->whereNotNull('published_at');
    }

    /**
     * Scope: In stock products
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_status', '!=', self::STOCK_OUT_OF_STOCK);
    }

    /**
     * Scope: Featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: By category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category_id', $category);
    }

    /**
     * Scope: By seller
     */
    public function scopeBySeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Scope: Search by name or description
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('short_description', 'like', "%{$search}%");
        });
    }

    /**
     * Reduce stock quantity
     */
    public function reduceStock(int $quantity): bool
    {
        if (! $this->track_quantity) {
            return true;
        }

        if ($this->quantity < $quantity && ! $this->allow_backorders) {
            return false;
        }

        $this->quantity -= $quantity;
        $this->updateStockStatus();
        $this->save();

        return true;
    }

    /**
     * Increase stock quantity
     */
    public function increaseStock(int $quantity): void
    {
        if ($this->track_quantity) {
            $this->quantity += $quantity;
            $this->updateStockStatus();
            $this->save();
        }
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Publish the product
     */
    public function publish(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'published_at' => now(),
        ]);
    }

    /**
     * Unpublish the product
     */
    public function unpublish(): void
    {
        $this->update([
            'status' => self::STATUS_INACTIVE,
        ]);
    }
}
