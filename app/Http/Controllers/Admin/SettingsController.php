<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
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
            'settings' => Setting::getGrouped(),
        ]);
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
            'maintenance_mode' => ['nullable'],
            'registration_enabled' => ['nullable'],
        ]);

        // Convert boolean fields
        $validated['maintenance_mode'] = filter_var($request->input('maintenance_mode'), FILTER_VALIDATE_BOOLEAN);
        $validated['registration_enabled'] = filter_var($request->input('registration_enabled'), FILTER_VALIDATE_BOOLEAN);

        Setting::setMany($validated, 'general');

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
            'shipping_enabled' => ['nullable'],
            'default_shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        // Convert shipping_enabled to boolean
        $validated['shipping_enabled'] = filter_var($request->input('shipping_enabled'), FILTER_VALIDATE_BOOLEAN);

        Setting::setMany($validated, 'ecommerce');

        return back()->with('message', 'E-commerce settings updated successfully.');
    }

    /**
     * Update seller settings.
     */
    public function updateSeller(Request $request)
    {
        $validated = $request->validate([
            'seller_application_enabled' => ['nullable'],
            'seller_approval_required' => ['nullable'],
            'seller_commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        // Convert boolean fields
        $validated['seller_application_enabled'] = filter_var($request->input('seller_application_enabled'), FILTER_VALIDATE_BOOLEAN);
        $validated['seller_approval_required'] = filter_var($request->input('seller_approval_required'), FILTER_VALIDATE_BOOLEAN);

        Setting::setMany($validated, 'seller');

        return back()->with('message', 'Seller settings updated successfully.');
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'email_notifications_enabled' => ['nullable'],
            'admin_email' => ['required', 'email', 'max:255'],
            'admin_login_alert' => ['nullable'],
            'new_order_notification' => ['nullable'],
            'new_user_notification' => ['nullable'],
            'new_seller_application_notification' => ['nullable'],
        ]);

        // Convert boolean fields
        $validated['email_notifications_enabled'] = filter_var($request->input('email_notifications_enabled'), FILTER_VALIDATE_BOOLEAN);
        $validated['admin_login_alert'] = filter_var($request->input('admin_login_alert'), FILTER_VALIDATE_BOOLEAN);
        $validated['new_order_notification'] = filter_var($request->input('new_order_notification'), FILTER_VALIDATE_BOOLEAN);
        $validated['new_user_notification'] = filter_var($request->input('new_user_notification'), FILTER_VALIDATE_BOOLEAN);
        $validated['new_seller_application_notification'] = filter_var($request->input('new_seller_application_notification'), FILTER_VALIDATE_BOOLEAN);

        Setting::setMany($validated, 'notifications');

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

        Setting::setMany($validated, 'seo');

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

        // Re-cache settings after clearing
        Setting::clearCache();

        return back()->with('message', 'Cache cleared successfully.');
    }
}
