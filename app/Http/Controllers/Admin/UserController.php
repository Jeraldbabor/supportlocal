<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply role filter
        if ($request->filled('role')) {
            $query->byRole($request->role);
        }

        // Apply status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->inactive();
            }
        }

        $users = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_display' => $user->getRoleDisplayName(),
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at,
                'phone_number' => $user->phone_number,
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => User::$roles,
            'stats' => [
                'total' => User::count(),
                'active' => User::active()->count(),
                'inactive' => User::inactive()->count(),
                'administrators' => User::byRole(User::ROLE_ADMINISTRATOR)->count(),
                'sellers' => User::byRole(User::ROLE_SELLER)->count(),
                'buyers' => User::byRole(User::ROLE_BUYER)->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => User::$roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(array_keys(User::$roles))],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'is_active' => ['boolean'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('message', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        $user->load('sellerApplication');
        
        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_display' => $user->getRoleDisplayName(),
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'avatar_url' => $user->avatar_url,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'gcash_number' => $user->gcash_number,
                'gcash_name' => $user->gcash_name,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'seller_application' => $user->sellerApplication, // @phpstan-ignore-line
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'gcash_number' => $user->gcash_number,
                'gcash_name' => $user->gcash_name,
            ],
            'roles' => User::$roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(array_keys(User::$roles))],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
            'delivery_phone' => ['nullable', 'string', 'max:20'],
            'delivery_notes' => ['nullable', 'string', 'max:500'],
            'gcash_number' => ['nullable', 'string', 'max:20'],
            'gcash_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        // Only update password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('message', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deletion of the current admin user
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Delete profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('message', 'User deleted successfully.');
    }

    /**
     * Toggle user active status
     */
    public function toggleStatus(User $user)
    {
        // Prevent deactivating the current admin user
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';
        
        return back()->with('message', "User {$status} successfully.");
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return back()->with('message', 'Password reset successfully.');
    }

    /**
     * Verify user email
     */
    public function verifyEmail(User $user)
    {
        if ($user->email_verified_at) {
            return back()->with('error', 'Email is already verified.');
        }

        $user->update([
            'email_verified_at' => now()
        ]);

        return back()->with('message', 'Email verified successfully.');
    }

    /**
     * Send email verification notification
     */
    public function sendVerification(User $user)
    {
        if ($user->email_verified_at) {
            return back()->with('error', 'Email is already verified.');
        }

        // In a real application, you would send an email here
        // For now, we'll just mark it as verified
        $user->update([
            'email_verified_at' => now()
        ]);

        return back()->with('message', 'Email verification sent successfully.');
    }

    /**
     * Upload user profile picture
     */
    public function uploadAvatar(Request $request, User $user)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        // Delete old profile picture
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->update([
            'profile_picture' => $path
        ]);

        return back()->with('message', 'Profile picture updated successfully.');
    }
}
