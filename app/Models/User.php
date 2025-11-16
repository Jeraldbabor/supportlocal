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
        'profile_completion_reminder_dismissed_at',
        'profile_completed_at',
        'profile_completion_percentage',
        'provider',
        'provider_id',
        'provider_token',
        'avatar',
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
            'profile_completion_reminder_dismissed_at' => 'datetime',
            'profile_completed_at' => 'datetime',
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
     * Get orders where user is the buyer
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Get orders where user is the seller
     */
    public function sellerOrders()
    {
        return $this->hasMany(Order::class, 'seller_id');
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
        // First, check for uploaded profile picture
        if ($this->profile_picture) {
            return asset('storage/'.$this->profile_picture);
        }

        // Second, check for social media avatar
        if ($this->avatar) {
            return $this->avatar;
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

    /**
     * Check if user has completed essential profile information
     */
    public function hasCompleteProfile(): bool
    {
        $requiredFields = $this->getRequiredFieldsForRole();

        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get required fields based on user role
     */
    public function getRequiredFieldsForRole(): array
    {
        $baseFields = [
            'name' => 'Full Name',
            'email' => 'Email Address',
        ];

        $roleSpecificFields = [
            self::ROLE_SELLER => [
                'phone_number' => 'Phone Number',
                'address' => 'Business Address',
            ],
            self::ROLE_BUYER => [
                'phone_number' => 'Phone Number',
                'delivery_address' => 'Delivery Address',
            ],
            self::ROLE_ADMINISTRATOR => [
                'phone_number' => 'Phone Number',
            ],
        ];

        return array_merge(
            $baseFields,
            $roleSpecificFields[$this->role] ?? []
        );
    }

    /**
     * Get missing profile fields for current user
     */
    public function getMissingProfileFields(): array
    {
        $requiredFields = $this->getRequiredFieldsForRole();
        $missing = [];

        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                $missing[] = [
                    'field' => $field,
                    'label' => $label,
                ];
            }
        }

        return $missing;
    }

    /**
     * Get profile completion status with details
     */
    public function getProfileCompletionStatus(): array
    {
        $requiredFields = $this->getRequiredFieldsForRole();
        $totalFields = count($requiredFields);
        $completedFields = 0;

        foreach ($requiredFields as $field => $label) {
            if (! empty($this->$field)) {
                $completedFields++;
            }
        }

        $percentage = $totalFields > 0 ? round(($completedFields / $totalFields) * 100) : 100;
        $isComplete = $completedFields === $totalFields;
        $missingFields = $this->getMissingProfileFields();

        return [
            'is_complete' => $isComplete,
            'percentage' => $percentage,
            'completed_fields' => $completedFields,
            'total_fields' => $totalFields,
            'missing_fields' => $missingFields,
            'has_email_verified' => ! empty($this->email_verified_at),
            'has_profile_picture' => ! empty($this->profile_picture),
        ];
    }

    /**
     * Get recommended next action for profile completion
     */
    public function getProfileCompletionRecommendation(): ?array
    {
        $status = $this->getProfileCompletionStatus();

        if ($status['is_complete']) {
            // Check optional fields
            if (! $status['has_email_verified']) {
                return [
                    'title' => 'Verify Your Email',
                    'description' => 'Verify your email address to secure your account and receive important notifications.',
                    'action' => 'Verify Email',
                    'url' => $this->getProfileEditUrl(),
                    'priority' => 'high',
                ];
            }

            if (! $status['has_profile_picture']) {
                return [
                    'title' => 'Add Profile Picture',
                    'description' => 'Upload a profile picture to personalize your account.',
                    'action' => 'Upload Picture',
                    'url' => $this->getProfileEditUrl(),
                    'priority' => 'medium',
                ];
            }

            return null;
        }

        // Profile is incomplete
        $missingCount = count($status['missing_fields']);
        $missingList = array_slice(array_column($status['missing_fields'], 'label'), 0, 3);
        $missingText = implode(', ', $missingList);

        if ($missingCount > 3) {
            $missingText .= ' and '.($missingCount - 3).' more';
        }

        return [
            'title' => 'Complete Your Profile',
            'description' => "To use all features of the system, please complete your profile. Missing: {$missingText}",
            'action' => 'Complete Profile',
            'url' => $this->getProfileEditUrl(),
            'priority' => 'critical',
            'missing_fields' => $status['missing_fields'],
        ];
    }

    /**
     * Get profile edit URL based on user role
     */
    public function getProfileEditUrl(): string
    {
        return match ($this->role) {
            self::ROLE_SELLER => route('seller.profile.edit'),
            self::ROLE_BUYER => route('buyer.profile'),
            self::ROLE_ADMINISTRATOR => route('user.profile.edit'),
            default => route('user.profile.edit'),
        };
    }

    /**
     * Dismiss the profile completion reminder
     */
    public function dismissProfileCompletionReminder(): bool
    {
        return $this->update([
            'profile_completion_reminder_dismissed_at' => now(),
        ]);
    }

    /**
     * Check if user has dismissed the profile completion reminder
     */
    public function hasProfileCompletionReminderDismissed(): bool
    {
        return ! empty($this->profile_completion_reminder_dismissed_at);
    }

    /**
     * Update profile completion tracking
     */
    public function updateProfileCompletionTracking(): bool
    {
        $status = $this->getProfileCompletionStatus();

        $data = [
            'profile_completion_percentage' => $status['percentage'],
        ];

        // Mark as completed if 100%
        if ($status['is_complete'] && empty($this->profile_completed_at)) {
            $data['profile_completed_at'] = now();
        }

        return $this->update($data);
    }
}
