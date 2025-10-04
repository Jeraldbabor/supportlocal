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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
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
     * Get the user's seller application.
     */
    public function sellerApplication()
    {
        return $this->hasOne(SellerApplication::class);
    }
}
