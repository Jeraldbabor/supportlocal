<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * User role constants
     */
    const ROLE_SELLER = 'seller';

    const ROLE_BUYER = 'buyer';

    const ROLE_ADMINISTRATOR = 'administrator';

    /**
     * Available user roles
     */
    public static $roles = [
        self::ROLE_SELLER => 'Seller/Artisan',
        self::ROLE_BUYER => 'Buyer',
        self::ROLE_ADMINISTRATOR => 'Administrator',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone_number',
        'address',
        'date_of_birth',
        'profile_picture',
        'delivery_address',
        'delivery_phone',
        'delivery_notes',
        'gcash_number',
        'gcash_name',
        'is_active',
        'email_verified_at',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is a seller/artisan
     */
    public function isSeller(): bool
    {
        return $this->hasRole(self::ROLE_SELLER);
    }

    /**
     * Check if user is a buyer
     */
    public function isBuyer(): bool
    {
        return $this->hasRole(self::ROLE_BUYER);
    }

    /**
     * Check if user is an administrator
     */
    public function isAdministrator(): bool
    {
        return $this->hasRole(self::ROLE_ADMINISTRATOR);
    }

    /**
     * Get the display name for the user's role
     */
    public function getRoleDisplayName(): string
    {
        return self::$roles[$this->role] ?? 'Unknown';
    }

    /**
     * Get the seller's products
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    /**
     * Get the seller applications submitted by this user
     */
    public function sellerApplications()
    {
        return $this->hasMany(SellerApplication::class);
    }

    /**
     * Get the user's seller application.
     */
    public function sellerApplication()
    {
        return $this->hasOne(SellerApplication::class);
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->is_active ?? true;
    }

    /**
     * Activate the user
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the user
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Get user's full name with role
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name.' ('.$this->getRoleDisplayName().')';
    }

    /**
     * Get user avatar URL
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->profile_picture) {
            return asset('storage/'.$this->profile_picture);
        }

        // Default avatar using initials
        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): bool
    {
        return $this->update(['last_login_at' => now()]);
    }

    /**
     * Scope to filter by role
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to filter active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope to search users by name or email
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Check if the user has a complete profile for seller transition
     */
    public function hasCompleteProfileForSeller(): bool
    {
        return ! empty($this->name) &&
               ! empty($this->email) &&
               ! empty($this->phone_number);
    }

    /**
     * Get profile completeness percentage
     */
    public function getProfileCompletenessAttribute(): int
    {
        $fields = [
            'name', 'email', 'phone_number', 'address',
            'date_of_birth', 'profile_picture',
        ];

        $completed = 0;
        foreach ($fields as $field) {
            if (! empty($this->$field)) {
                $completed++;
            }
        }

        return round(($completed / count($fields)) * 100);
    }

    /**
     * Get missing profile fields for seller account
     */
    public function getMissingSellerProfileFields(): array
    {
        $requiredFields = [
            'name' => 'Full Name',
            'email' => 'Email Address',
            'phone_number' => 'Phone Number',
            'address' => 'Address',
        ];

        $missing = [];
        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                $missing[] = $label;
            }
        }

        return $missing;
    }
}
