<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BuyerProfileController extends Controller
{
    /**
     * Show the buyer's profile page.
     */
    public function show(): Response
    {
        $user = Auth::user();

        return Inertia::render('buyer/profile', [
            'user' => $user,
        ]);
    }

    /**
     * Update the buyer's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date|before:today',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_phone' => 'nullable|string|max:20',
            'delivery_notes' => 'nullable|string|max:255',
            'gcash_number' => 'nullable|string|max:20',
            'gcash_name' => 'nullable|string|max:255',
            'profile_picture' => [
                'nullable',
                File::image()
                    ->max(5 * 1024), // 5MB max
            ],
        ]);

        $updateData = $request->only([
            'name',
            'email',
            'phone_number',
            'address',
            'date_of_birth',
            'delivery_address',
            'delivery_phone',
            'delivery_notes',
            'gcash_number',
            'gcash_name',
        ]);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store new profile picture
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $updateData['profile_picture'] = $path;
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Delete the profile picture.
     */
    public function deleteProfilePicture(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);
        }

        return redirect()->back()->with('success', 'Profile picture deleted successfully!');
    }

    /**
     * Change the user's password.
     */
    public function changePassword(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function deleteAccount(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Validate password and confirmation phrase
        $request->validate([
            'password' => 'required|string',
            'confirmation_phrase' => 'required|string|in:DELETE MY ACCOUNT',
        ], [
            'confirmation_phrase.in' => 'You must type "DELETE MY ACCOUNT" exactly to confirm account deletion.',
        ]);

        // Verify current password
        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password does not match your current password.'],
            ]);
        }

        // Delete profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Log out the user
        Auth::logout();

        // Delete the user account
        $user->delete();

        // Invalidate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been deleted successfully.');
    }
}
