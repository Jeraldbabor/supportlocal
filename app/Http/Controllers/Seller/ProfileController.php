<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the seller profile dashboard.
     */
    public function show(): Response
    {
        $user = Auth::user();
        $sellerApplication = $user->sellerApplication;
        
        // Calculate profile statistics
        $profileStats = $this->getProfileStatistics($user);
        
        return Inertia::render('seller/profile/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'profile_picture' => $user->profile_picture,
                'avatar_url' => $user->avatar_url,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'gcash_number' => $user->gcash_number,
                'gcash_name' => $user->gcash_name,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at->format('M d, Y'),
                'profile_completeness' => $user->profile_completeness,
                'role_display' => $user->getRoleDisplayName(),
            ],
            'sellerApplication' => $sellerApplication ? [
                'id' => $sellerApplication->id,
                'business_description' => $sellerApplication->business_description,
                'business_type' => $sellerApplication->business_type,
                'status' => $sellerApplication->status,
                'reviewed_at' => $sellerApplication->reviewed_at?->format('M d, Y'),
                'admin_notes' => $sellerApplication->admin_notes,
                'created_at' => $sellerApplication->created_at->format('M d, Y'),
            ] : null,
            'profileStats' => $profileStats,
            'recentActivity' => $this->getRecentActivity($user),
        ]);
    }

    /**
     * Show the form for editing the seller profile.
     */
    public function edit(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('seller/profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'profile_picture' => $user->profile_picture,
                'avatar_url' => $user->avatar_url,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'gcash_number' => $user->gcash_number,
                'gcash_name' => $user->gcash_name,
                'profile_completeness' => $user->profile_completeness,
                'missing_fields' => $user->getMissingSellerProfileFields(),
            ],
        ]);
    }

    /**
     * Update the seller's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'date_of_birth' => 'nullable|date|before:today',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_phone' => 'nullable|string|max:20',
            'delivery_notes' => 'nullable|string|max:1000',
            'gcash_number' => 'nullable|string|max:20|regex:/^09[0-9]{9}$/',
            'gcash_name' => 'nullable|string|max:255',
        ], [
            'gcash_number.regex' => 'GCash number must be a valid Philippine mobile number (e.g., 09123456789)',
        ]);

        // Check if email was changed and reset verification
        $emailChanged = $user->email !== $validated['email'];

        $user->update($validated);

        // Reset email verification if email changed
        if ($emailChanged) {
            $user->email_verified_at = null;
            $user->save();
            
            return redirect()->route('seller.profile.show')->with('success', 
                'Profile updated successfully! Please verify your new email address.');
        }

        return redirect()->route('seller.profile.show')->with('success', 
            'Profile updated successfully! Your information has been saved.');
    }

    /**
     * Update the seller's profile picture.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'avatar' => [
                'required',
                File::image()
                    ->max(2 * 1024) // 2MB
                    ->dimensions(Rule::dimensions()->minWidth(100)->minHeight(100)),
            ],
        ]);

        // Delete old profile picture if it exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Store new profile picture
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['profile_picture' => $path]);

        return redirect()->route('seller.profile.show')->with('success', 
            'Profile picture updated successfully!');
    }

    /**
     * Delete the seller's profile picture.
     */
    public function deleteAvatar(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);
        }

        return redirect()->route('seller.profile.show')->with('success', 
            'Profile picture removed successfully!');
    }

    /**
     * Show seller business information management.
     */
    public function business(): Response
    {
        $user = Auth::user();
        $sellerApplication = $user->sellerApplication;

        return Inertia::render('seller/profile/business', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'business' => $sellerApplication ? [
                'id' => $sellerApplication->id,
                'description' => $sellerApplication->business_description,
                'type' => $sellerApplication->business_type,
                'status' => $sellerApplication->status,
                'reviewed_at' => $sellerApplication->reviewed_at?->format('M d, Y g:i A'),
                'admin_notes' => $sellerApplication->admin_notes,
                'created_at' => $sellerApplication->created_at->format('M d, Y'),
                'can_edit' => $sellerApplication->isApproved(),
            ] : null,
            'businessTypes' => $this->getBusinessTypes(),
        ]);
    }

    /**
     * Update seller business information.
     */
    public function updateBusiness(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $sellerApplication = $user->sellerApplication;

        if (!$sellerApplication || !$sellerApplication->isApproved()) {
            return redirect()->back()->withErrors([
                'business' => 'You must have an approved seller application to update business information.'
            ]);
        }

        $validated = $request->validate([
            'business_description' => 'required|string|min:50|max:2000',
            'business_type' => 'required|string|max:255',
        ]);

        $sellerApplication->update($validated);

        return redirect()->route('seller.profile.business')->with('success', 
            'Business information updated successfully!');
    }

    /**
     * Get profile summary for dashboard widget.
     */
    public function summary(): array
    {
        $user = Auth::user();
        
        return [
            'profile_completeness' => $user->profile_completeness,
            'missing_fields' => $user->getMissingSellerProfileFields(),
            'has_avatar' => !empty($user->profile_picture),
            'email_verified' => !empty($user->email_verified_at),
            'business_setup' => $user->sellerApplication ? $user->sellerApplication->isApproved() : false,
        ];
    }

    /**
     * Get profile statistics for display.
     */
    private function getProfileStatistics($user): array
    {
        $sellerApplication = $user->sellerApplication;
        
        return [
            'profile_score' => $user->profile_completeness,
            'fields_completed' => 6 - count($user->getMissingSellerProfileFields()),
            'total_fields' => 6,
            'days_as_seller' => $sellerApplication && $sellerApplication->reviewed_at 
                ? $sellerApplication->reviewed_at->diffInDays(now())
                : 0,
            'account_verified' => !empty($user->email_verified_at),
            'business_approved' => $sellerApplication ? $sellerApplication->isApproved() : false,
        ];
    }

    /**
     * Get recent activity for the seller.
     */
    private function getRecentActivity($user): array
    {
        $activities = [];
        
        // Profile updates
        if ($user->updated_at->greaterThan($user->created_at)) {
            $activities[] = [
                'type' => 'profile_update',
                'title' => 'Profile Updated',
                'description' => 'Your profile information was updated',
                'date' => $user->updated_at->format('M d, Y g:i A'),
                'icon' => 'user',
            ];
        }
        
        // Email verification
        if ($user->email_verified_at) {
            $activities[] = [
                'type' => 'email_verified',
                'title' => 'Email Verified',
                'description' => 'Your email address was verified',
                'date' => $user->email_verified_at->format('M d, Y g:i A'),
                'icon' => 'mail-check',
            ];
        }
        
        // Seller application
        if ($user->sellerApplication) {
            $app = $user->sellerApplication;
            $activities[] = [
                'type' => 'seller_application',
                'title' => 'Seller Application ' . ucfirst($app->status),
                'description' => 'Your seller application was ' . $app->status,
                'date' => $app->reviewed_at ? $app->reviewed_at->format('M d, Y g:i A') : $app->created_at->format('M d, Y g:i A'),
                'icon' => $app->isApproved() ? 'check-circle' : ($app->isRejected() ? 'x-circle' : 'clock'),
            ];
        }
        
        // Sort by date (newest first)
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, 5); // Return last 5 activities
    }

    /**
     * Get business types for selection.
     */
    private function getBusinessTypes(): array
    {
        return [
            'Handmade Crafts' => 'Handmade Crafts & Artisan Goods',
            'Food & Beverages' => 'Food & Beverages',
            'Clothing & Accessories' => 'Clothing & Fashion Accessories',
            'Art & Design' => 'Art & Creative Design',
            'Home & Garden' => 'Home & Garden Products',
            'Electronics & Gadgets' => 'Electronics & Tech Gadgets',
            'Beauty & Personal Care' => 'Beauty & Personal Care',
            'Books & Media' => 'Books & Digital Media',
            'Sports & Recreation' => 'Sports & Recreation',
            'Other' => 'Other Products & Services',
        ];
    }
}