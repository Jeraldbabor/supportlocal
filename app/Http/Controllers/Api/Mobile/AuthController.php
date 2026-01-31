<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'role' => ['sometimes', 'in:buyer,seller'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? User::ROLE_BUYER,
            'is_active' => true,
        ]);

        // Send email verification
        $user->sendEmailVerificationNotification();

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email.',
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return token
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        // Update last login
        $user->updateLastLogin();

        $deviceName = $validated['device_name'] ?? 'mobile-app';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['wishlistItems']);

        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
        ]);

        $user->update($validated);
        $user->updateProfileCompletionTracking();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // 2MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->profile_picture) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['profile_picture' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar updated successfully',
            'avatar_url' => $user->fresh()->avatar_url,
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Update delivery address
     */
    public function updateDeliveryAddress(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'delivery_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'delivery_province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'delivery_city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'delivery_barangay' => ['sometimes', 'nullable', 'string', 'max:100'],
            'delivery_street' => ['sometimes', 'nullable', 'string', 'max:255'],
            'delivery_building_details' => ['sometimes', 'nullable', 'string', 'max:255'],
            'delivery_notes' => ['sometimes', 'nullable', 'string', 'max:500'],
            'delivery_latitude' => ['sometimes', 'nullable', 'numeric'],
            'delivery_longitude' => ['sometimes', 'nullable', 'numeric'],
        ]);

        // Build full delivery address
        $addressParts = array_filter([
            $validated['delivery_street'] ?? null,
            $validated['delivery_barangay'] ?? null,
            $validated['delivery_city'] ?? null,
            $validated['delivery_province'] ?? null,
        ]);

        $validated['delivery_address'] = implode(', ', $addressParts);

        $user->update($validated);
        $user->updateProfileCompletionTracking();

        return response()->json([
            'success' => true,
            'message' => 'Delivery address updated successfully',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Request password reset
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to send reset link. Please try again.',
        ], 400);
    }

    /**
     * Get user notifications
     */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => class_basename($notification->type),
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Format user data for response
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_display' => $user->getRoleDisplayName(),
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'avatar_url' => $user->avatar_url,
            'delivery_address' => $user->delivery_address,
            'delivery_phone' => $user->delivery_phone,
            'delivery_province' => $user->delivery_province,
            'delivery_city' => $user->delivery_city,
            'delivery_barangay' => $user->delivery_barangay,
            'delivery_street' => $user->delivery_street,
            'delivery_building_details' => $user->delivery_building_details,
            'delivery_notes' => $user->delivery_notes,
            'delivery_latitude' => $user->delivery_latitude,
            'delivery_longitude' => $user->delivery_longitude,
            'gcash_number' => $user->gcash_number,
            'gcash_name' => $user->gcash_name,
            'email_verified' => ! is_null($user->email_verified_at),
            'is_active' => $user->is_active,
            'profile_completion' => $user->getProfileCompletionStatus(),
            'created_at' => $user->created_at->toISOString(),
        ];
    }
}
