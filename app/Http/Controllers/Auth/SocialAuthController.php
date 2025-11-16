<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the OAuth provider authentication page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        // Validate provider
        if (! in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')
                ->with('error', 'Invalid authentication provider.');
        }

        try {
            // For Facebook, explicitly request email scope and fields including large picture
            if ($provider === 'facebook') {
                return Socialite::driver($provider)
                    ->fields(['id', 'name', 'email', 'first_name', 'last_name', 'picture.type(large)'])
                    ->scopes(['email', 'public_profile'])
                    ->redirect();
            }
            
            // For Google, request profile and email
            if ($provider === 'google') {
                return Socialite::driver($provider)
                    ->scopes(['profile', 'email'])
                    ->redirect();
            }
            
            return Socialite::driver($provider)->redirect();
        } catch (\Exception $e) {
            \Log::error('Social auth redirect error for ' . $provider . ': ' . $e->getMessage());
            return redirect()->route('login')
                ->with('error', 'Unable to authenticate with '.$provider.'. Please try again.');
        }
    }

    /**
     * Handle the OAuth provider callback.
     */
    public function callback(string $provider): RedirectResponse
    {
        \Log::info('=== Social Auth Callback Started ===');
        \Log::info('Provider: ' . $provider);
        \Log::info('Request URL: ' . request()->fullUrl());
        
        // Validate provider
        if (! in_array($provider, ['google', 'facebook'])) {
            \Log::error('Invalid provider attempted: ' . $provider);
            return redirect()->route('login')
                ->with('error', 'Invalid authentication provider.');
        }

        try {
            \Log::info('Attempting to get user from ' . $provider);
            // Get user information from the provider
            $socialUser = Socialite::driver($provider)->user();
            
            // Get avatar URL - for Facebook, check both avatar and picture.data.url
            $avatarUrl = null;
            if ($provider === 'facebook') {
                $raw = $socialUser->getRaw();
                if (isset($raw['picture']['data']['url'])) {
                    $avatarUrl = $raw['picture']['data']['url'];
                } else {
                    $avatarUrl = $socialUser->getAvatar();
                }
            } else {
                $avatarUrl = $socialUser->getAvatar();
            }

            Log::info('User data retrieved from ' . $provider, [
                'id' => $socialUser->getId(),
                'email' => $socialUser->getEmail(),
                'name' => $socialUser->getName(),
                'nickname' => $socialUser->getNickname(),
                'avatar' => $avatarUrl,
                'raw_avatar' => $socialUser->getAvatar()
            ]);
            
            // Check if email is provided
            $email = $socialUser->getEmail();
            if (! $email) {
                \Log::error('No email received from ' . $provider);
                // For Facebook, create a proxy email using their ID if no email provided
                if ($provider === 'facebook') {
                    $email = $socialUser->getId() . '@facebook.proxy.local';
                    \Log::info('Created proxy email for Facebook user: ' . $email);
                } else {
                    return redirect()->route('login')
                        ->with('error', 'We could not get your email address from ' . ucfirst($provider) . '. Please make sure your ' . ucfirst($provider) . ' account has a verified email address and that you granted email permission to this app.');
                }
            }
            
            \Log::info('Email verified, proceeding with authentication: ' . $email);

            // Check if user exists with this provider
            $user = User::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();

            // If user doesn't exist with provider, check by email
            if (! $user) {
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Update existing user with social auth details
                    $user->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'provider_token' => $socialUser->token,
                        'avatar' => $avatarUrl,
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ]);
                } else {
                    // Create new user
                    try {
                        $userData = [
                            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Facebook User',
                            'email' => $email,
                            'provider' => $provider,
                            'provider_id' => (string) $socialUser->getId(),
                            'provider_token' => $socialUser->token ?? null,
                            'avatar' => $avatarUrl ?? null,
                            'password' => bcrypt(Str::random(32)), // Random password for social users
                            'email_verified_at' => now(), // Auto-verify email for social logins
                            'role' => User::ROLE_BUYER, // Default role
                            'is_active' => true,
                        ];
                        
                        \Log::info('Attempting to create user with data: ' . json_encode([
                            'email' => $userData['email'],
                            'provider' => $userData['provider'],
                            'provider_id' => $userData['provider_id'],
                        ]));
                        
                        $user = User::create($userData);
                        \Log::info('New user created successfully via ' . $provider . ': ' . $user->email . ' (ID: ' . $user->id . ')');
                    } catch (\Exception $createError) {
                        \Log::error('Failed to create user: ' . $createError->getMessage());
                        \Log::error('SQL State: ' . ($createError->getCode() ?? 'N/A'));
                        \Log::error('Stack trace: ' . $createError->getTraceAsString());
                        throw $createError;
                    }
                }
            } else {
                // Update existing social user's token and avatar
                $user->update([
                    'provider_token' => $socialUser->token,
                    'avatar' => $avatarUrl,
                ]);
            }

            // Update last login timestamp
            $user->updateLastLogin();

            // Log the user in
            Auth::login($user, true);
            
            \Log::info('User logged in successfully: ' . $user->email . ' with role: ' . $user->role);

            // Redirect based on user role
            return $this->redirectUserByRole($user);
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            \Log::error('Social auth invalid state: ' . $e->getMessage());
            return redirect()->route('login')
                ->with('error', 'Authentication session expired. Please try again.');
        } catch (\Exception $e) {
            \Log::error('Social auth error for ' . $provider . ': ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return redirect()->route('login')
                ->with('error', 'Unable to authenticate with '.$provider.'. Error: ' . $e->getMessage());
        }
    }

    /**
     * Redirect user to appropriate dashboard based on role.
     */
    protected function redirectUserByRole(User $user): RedirectResponse
    {
        // Check if profile is complete and show reminder if needed
        try {
            $profileStatus = $user->getProfileCompletionStatus();
            
            if (! $profileStatus['is_complete'] && ! $user->hasProfileCompletionReminderDismissed()) {
                session()->flash('profile_incomplete', true);
            }
        } catch (\Exception $e) {
            \Log::warning('Could not check profile completion: ' . $e->getMessage());
        }

        \Log::info('Redirecting user to dashboard for role: ' . $user->role);
        
        try {
            $route = match ($user->role) {
                User::ROLE_SELLER => route('seller.dashboard'),
                User::ROLE_ADMINISTRATOR => route('admin.dashboard'),
                default => route('buyer.dashboard'),
            };
            
            \Log::info('Redirect route: ' . $route);
            
            return redirect($route);
        } catch (\Exception $e) {
            \Log::error('Failed to redirect to dashboard: ' . $e->getMessage());
            // Fallback to home page
            return redirect('/');
        }
    }
}
