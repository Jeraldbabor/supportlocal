<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'type', 'group'];

    /**
     * Default settings with their types and groups
     */
    public static array $defaults = [
        // General Settings
        'site_name' => ['value' => 'Support Local', 'type' => 'string', 'group' => 'general'],
        'site_description' => ['value' => '', 'type' => 'string', 'group' => 'general'],
        'site_email' => ['value' => '', 'type' => 'string', 'group' => 'general'],
        'site_phone' => ['value' => '', 'type' => 'string', 'group' => 'general'],
        'site_address' => ['value' => '', 'type' => 'string', 'group' => 'general'],
        'maintenance_mode' => ['value' => false, 'type' => 'boolean', 'group' => 'general'],

        // E-commerce Settings
        'currency' => ['value' => 'PHP', 'type' => 'string', 'group' => 'ecommerce'],
        'currency_symbol' => ['value' => '₱', 'type' => 'string', 'group' => 'ecommerce'],
        'tax_rate' => ['value' => '', 'type' => 'string', 'group' => 'ecommerce'],
        'shipping_enabled' => ['value' => true, 'type' => 'boolean', 'group' => 'ecommerce'],
        'default_shipping_cost' => ['value' => '', 'type' => 'string', 'group' => 'ecommerce'],
        'free_shipping_threshold' => ['value' => '', 'type' => 'string', 'group' => 'ecommerce'],
        'low_stock_threshold' => ['value' => '', 'type' => 'string', 'group' => 'ecommerce'],

        // Seller Settings
        'seller_application_enabled' => ['value' => true, 'type' => 'boolean', 'group' => 'seller'],
        'seller_approval_required' => ['value' => true, 'type' => 'boolean', 'group' => 'seller'],
        'seller_commission_rate' => ['value' => '', 'type' => 'string', 'group' => 'seller'],

        // Notification Settings
        'email_notifications_enabled' => ['value' => true, 'type' => 'boolean', 'group' => 'notifications'],
        'admin_email' => ['value' => '', 'type' => 'string', 'group' => 'notifications'],
        'admin_login_alert' => ['value' => true, 'type' => 'boolean', 'group' => 'notifications'],
        'new_order_notification' => ['value' => true, 'type' => 'boolean', 'group' => 'notifications'],
        'new_user_notification' => ['value' => true, 'type' => 'boolean', 'group' => 'notifications'],
        'new_seller_application_notification' => ['value' => true, 'type' => 'boolean', 'group' => 'notifications'],

        // SEO Settings
        'meta_title' => ['value' => '', 'type' => 'string', 'group' => 'seo'],
        'meta_description' => ['value' => '', 'type' => 'string', 'group' => 'seo'],
        'meta_keywords' => ['value' => '', 'type' => 'string', 'group' => 'seo'],
        'google_analytics_id' => ['value' => '', 'type' => 'string', 'group' => 'seo'],
    ];

    /**
     * Cache key for all settings
     */
    protected static string $cacheKey = 'app_settings';

    /**
     * Get a setting value by key
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = self::getAllCached();
        
        if (isset($settings[$key])) {
            return $settings[$key];
        }

        // Return default from defaults array or provided default
        if (isset(self::$defaults[$key])) {
            return self::$defaults[$key]['value'];
        }

        return $default;
    }

    /**
     * Set a setting value
     */
    public static function set(string $key, mixed $value): void
    {
        $type = self::$defaults[$key]['type'] ?? 'string';
        $group = self::$defaults[$key]['group'] ?? 'general';

        // Convert value based on type for storage
        $storedValue = self::convertForStorage($value, $type);

        self::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue, 'type' => $type, 'group' => $group]
        );

        // Clear the cache
        self::clearCache();
    }

    /**
     * Set multiple settings at once
     */
    public static function setMany(array $settings, string $group = null): void
    {
        foreach ($settings as $key => $value) {
            $type = self::$defaults[$key]['type'] ?? 'string';
            $settingGroup = $group ?? self::$defaults[$key]['group'] ?? 'general';
            $storedValue = self::convertForStorage($value, $type);

            self::updateOrCreate(
                ['key' => $key],
                ['value' => $storedValue, 'type' => $type, 'group' => $settingGroup]
            );
        }

        // Clear the cache
        self::clearCache();
    }

    /**
     * Get all settings as an array, cached for performance
     */
    public static function getAllCached(): array
    {
        return Cache::remember(self::$cacheKey, 3600, function () {
            $settings = [];
            
            // Start with defaults
            foreach (self::$defaults as $key => $config) {
                $settings[$key] = $config['value'];
            }

            // Override with database values
            $dbSettings = self::all();
            foreach ($dbSettings as $setting) {
                $settings[$setting->key] = self::convertFromStorage($setting->value, $setting->type);
            }

            return $settings;
        });
    }

    /**
     * Get settings grouped by their group
     */
    public static function getGrouped(): array
    {
        $settings = self::getAllCached();
        $grouped = [];

        foreach (self::$defaults as $key => $config) {
            $group = $config['group'];
            if (!isset($grouped[$group])) {
                $grouped[$group] = [];
            }
            $grouped[$group][$key] = $settings[$key] ?? $config['value'];
        }

        return $grouped;
    }

    /**
     * Clear the settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget(self::$cacheKey);
    }

    /**
     * Convert value for storage
     */
    protected static function convertForStorage(mixed $value, string $type): string
    {
        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'integer' => (string) intval($value),
            'float' => (string) floatval($value),
            'json' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Convert value from storage
     */
    protected static function convertFromStorage(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value === '1' || $value === 'true',
            'integer' => intval($value),
            'float' => floatval($value),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Seed default settings into the database
     */
    public static function seedDefaults(): void
    {
        foreach (self::$defaults as $key => $config) {
            self::firstOrCreate(
                ['key' => $key],
                [
                    'value' => self::convertForStorage($config['value'], $config['type']),
                    'type' => $config['type'],
                    'group' => $config['group'],
                ]
            );
        }
        
        self::clearCache();
    }
}
