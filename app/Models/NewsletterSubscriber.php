<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'subscribed_at',
        'unsubscribed_at',
        'is_active',
    ];

    protected $casts = [
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active subscribers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Subscribe an email to the newsletter.
     */
    public static function subscribe(string $email): self
    {
        return static::updateOrCreate(
            ['email' => strtolower(trim($email))],
            [
                'is_active' => true,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]
        );
    }

    /**
     * Unsubscribe an email from the newsletter.
     */
    public function unsubscribe(): self
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);

        return $this;
    }
}
