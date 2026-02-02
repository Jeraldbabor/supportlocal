<?php

use App\Models\Setting;

if (! function_exists('setting')) {
    /**
     * Get a setting value by key
     */
    function setting(string $key, mixed $default = null): mixed
    {
        return Setting::get($key, $default);
    }
}

if (! function_exists('settings')) {
    /**
     * Get all settings as an array
     */
    function settings(): array
    {
        return Setting::getAllCached();
    }
}

if (! function_exists('format_currency')) {
    /**
     * Format a number as currency using the app's currency settings
     */
    function format_currency(float|int $amount, bool $showSymbol = true): string
    {
        $symbol = $showSymbol ? Setting::get('currency_symbol', '₱') : '';

        return $symbol.number_format($amount, 2);
    }
}

if (! function_exists('calculate_tax')) {
    /**
     * Calculate tax for an amount
     */
    function calculate_tax(float|int $amount): float
    {
        $taxRate = Setting::get('tax_rate', '');
        $taxRate = $taxRate !== '' ? (float) $taxRate : 0;

        return $amount * ($taxRate / 100);
    }
}

if (! function_exists('calculate_shipping')) {
    /**
     * Calculate shipping cost based on subtotal
     */
    function calculate_shipping(float|int $subtotal): float
    {
        if (! Setting::get('shipping_enabled', true)) {
            return 0;
        }

        $freeThreshold = Setting::get('free_shipping_threshold', '');
        $freeThreshold = $freeThreshold !== '' ? (float) $freeThreshold : 0;
        if ($freeThreshold > 0 && $subtotal >= $freeThreshold) {
            return 0;
        }

        $shippingCost = Setting::get('default_shipping_cost', '');

        return $shippingCost !== '' ? (float) $shippingCost : 0;
    }
}

if (! function_exists('is_maintenance_mode')) {
    /**
     * Check if the app is in maintenance mode
     */
    function is_maintenance_mode(): bool
    {
        return (bool) Setting::get('maintenance_mode', false);
    }
}

if (! function_exists('is_low_stock')) {
    /**
     * Check if a quantity is considered low stock
     */
    function is_low_stock(int $quantity): bool
    {
        $threshold = Setting::get('low_stock_threshold', '');
        $threshold = $threshold !== '' ? (int) $threshold : 5;

        return $quantity <= $threshold;
    }
}

if (! function_exists('seller_commission_rate')) {
    /**
     * Get the seller commission rate
     */
    function seller_commission_rate(): float
    {
        $rate = Setting::get('seller_commission_rate', '');

        return $rate !== '' ? (float) $rate : 0;
    }
}
