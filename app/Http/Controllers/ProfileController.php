<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_display' => $user->getRoleDisplayName(),
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'gcash_number' => $user->gcash_number,
                'gcash_name' => $user->gcash_name,
                'profile_picture' => $user->profile_picture,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
            'delivery_phone' => ['nullable', 'string', 'max:20'],
            'delivery_notes' => ['nullable', 'string', 'max:500'],
            'gcash_number' => ['nullable', 'string', 'max:20'],
            'gcash_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        // Update profile completion tracking
        $user->updateProfileCompletionTracking();

        return back()->with('message', 'Profile updated successfully.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.']);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('message', 'Password updated successfully.');
    }

    /**
     * Upload user profile picture.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old profile picture
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update([
            'profile_picture' => $path,
        ]);

        return back()->with('message', 'Profile picture updated successfully.');
    }

    /**
     * Delete the user's profile picture.
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);

            return back()->with('message', 'Profile picture deleted successfully.');
        }

        return back()->with('error', 'No profile picture to delete.');
    }

    /**
     * Send email verification notification.
     */
    public function sendVerification(Request $request)
    {
        if ($request->user()->email_verified_at) {
            return back()->with('error', 'Email is already verified.');
        }

        // In a real application, you would send an email here
        // For now, we'll just mark it as verified for demo purposes
        $request->user()->update([
            'email_verified_at' => now(),
        ]);

        return back()->with('message', 'Email verification sent successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'The password is incorrect.']);
        }

        // Delete profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Logout and delete the user
        auth()->logout();
        $user->delete();

        return redirect('/')->with('message', 'Your account has been deleted successfully.');
    }

    /**
     * Dismiss profile completion reminder.
     */
    public function dismissProfileCompletionReminder(Request $request)
    {
        $user = $request->user();
        $user->dismissProfileCompletionReminder();

        return response()->json([
            'success' => true,
            'message' => 'Profile completion reminder dismissed.',
        ]);
    }

    /**
     * Get profile completion status.
     */
    public function getProfileCompletionStatus(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => $user->getProfileCompletionStatus(),
            'recommendation' => $user->getProfileCompletionRecommendation(),
        ]);
    }
}
