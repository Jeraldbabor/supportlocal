<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        return Inertia::render('admin/settings/index', [
            'settings' => $this->getSettings(),
        ]);
    }

    /**
     * Get all system settings.
     */
    private function getSettings(): array
    {
        // In a real application, you'd store these in a database
        // For now, we'll use config/cache
        return [
            'general' => [
                'site_name' => config('app.name', 'Support Local'),
                'site_description' => Cache::get('settings.site_description', ''),
                'site_email' => Cache::get('settings.site_email', config('mail.from.address')),
                'site_phone' => Cache::get('settings.site_phone', ''),
                'site_address' => Cache::get('settings.site_address', ''),
                'maintenance_mode' => Cache::get('settings.maintenance_mode', false),
            ],
            'ecommerce' => [
                'currency' => Cache::get('settings.currency', 'PHP'),
                'currency_symbol' => Cache::get('settings.currency_symbol', '₱'),
                'tax_rate' => Cache::get('settings.tax_rate', 0),
                'shipping_enabled' => Cache::get('settings.shipping_enabled', true),
                'default_shipping_cost' => Cache::get('settings.default_shipping_cost', 50),
                'free_shipping_threshold' => Cache::get('settings.free_shipping_threshold', 0),
                'low_stock_threshold' => Cache::get('settings.low_stock_threshold', 5),
            ],
            'seller' => [
                'seller_application_enabled' => Cache::get('settings.seller_application_enabled', true),
                'seller_approval_required' => Cache::get('settings.seller_approval_required', true),
                'seller_commission_rate' => Cache::get('settings.seller_commission_rate', 0),
            ],
            'notifications' => [
                'email_notifications_enabled' => Cache::get('settings.email_notifications_enabled', true),
                'admin_email' => Cache::get('settings.admin_email', config('mail.from.address')),
                'new_order_notification' => Cache::get('settings.new_order_notification', true),
                'new_user_notification' => Cache::get('settings.new_user_notification', true),
                'new_seller_application_notification' => Cache::get('settings.new_seller_application_notification', true),
            ],
            'seo' => [
                'meta_title' => Cache::get('settings.meta_title', ''),
                'meta_description' => Cache::get('settings.meta_description', ''),
                'meta_keywords' => Cache::get('settings.meta_keywords', ''),
                'google_analytics_id' => Cache::get('settings.google_analytics_id', ''),
            ],
        ];
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(Request $request)
    {
        $validated = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'site_description' => ['nullable', 'string', 'max:500'],
            'site_email' => ['required', 'email', 'max:255'],
            'site_phone' => ['nullable', 'string', 'max:20'],
            'site_address' => ['nullable', 'string', 'max:500'],
            'maintenance_mode' => ['boolean'],
        ]);

        // Update config (in production, you'd update database)
        foreach ($validated as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return back()->with('message', 'General settings updated successfully.');
    }

    /**
     * Update ecommerce settings.
     */
    public function updateEcommerce(Request $request)
    {
        $validated = $request->validate([
            'currency' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'shipping_enabled' => ['boolean'],
            'default_shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        foreach ($validated as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return back()->with('message', 'E-commerce settings updated successfully.');
    }

    /**
     * Update seller settings.
     */
    public function updateSeller(Request $request)
    {
        $validated = $request->validate([
            'seller_application_enabled' => ['boolean'],
            'seller_approval_required' => ['boolean'],
            'seller_commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return back()->with('message', 'Seller settings updated successfully.');
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'email_notifications_enabled' => ['boolean'],
            'admin_email' => ['required', 'email', 'max:255'],
            'new_order_notification' => ['boolean'],
            'new_user_notification' => ['boolean'],
            'new_seller_application_notification' => ['boolean'],
        ]);

        foreach ($validated as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return back()->with('message', 'Notification settings updated successfully.');
    }

    /**
     * Update SEO settings.
     */
    public function updateSeo(Request $request)
    {
        $validated = $request->validate([
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'google_analytics_id' => ['nullable', 'string', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return back()->with('message', 'SEO settings updated successfully.');
    }

    /**
     * Clear application cache.
     */
    public function clearCache()
    {
        \Artisan::call('cache:clear');
        \Artisan::call('config:clear');
        \Artisan::call('view:clear');

        return back()->with('message', 'Cache cleared successfully.');
    }
}
