<?php

namespace App\Http\Middleware;

use App\Helpers\WishlistHelper;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $sharedData = [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? tap($request->user(), function ($user) {
                    $user->append('avatar_url');
                }) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];

        // Add unread notifications count for authenticated users
        if ($request->user()) {
            $sharedData['unreadNotificationsCount'] = $request->user()->unreadNotifications()->count();

            // Add new contact messages count for administrators
            if ($request->user()->role === \App\Models\User::ROLE_ADMINISTRATOR) {
                $sharedData['newContactMessagesCount'] = \App\Models\ContactMessage::where('status', \App\Models\ContactMessage::STATUS_NEW)->count();
            }

            // Add marketplace notification counts for sellers
            if ($request->user()->role === \App\Models\User::ROLE_SELLER) {
                // Count unread marketplace notifications (new requests)
                $sharedData['unreadMarketplaceCount'] = $request->user()
                    ->unreadNotifications()
                    ->where('type', \App\Notifications\NewMarketplaceRequest::class)
                    ->count();

                // Count unread bid notifications (bid accepted/rejected)
                $sharedData['unreadBidNotificationsCount'] = $request->user()
                    ->unreadNotifications()
                    ->whereIn('type', [
                        \App\Notifications\BidAccepted::class,
                        \App\Notifications\BidRejected::class,
                    ])
                    ->count();
            }

            // Add unread bid notifications for buyers
            if ($request->user()->role === \App\Models\User::ROLE_BUYER) {
                $sharedData['unreadBidReceivedCount'] = $request->user()
                    ->unreadNotifications()
                    ->where('type', \App\Notifications\NewBidReceived::class)
                    ->count();
            }

            // Add profile completion status and recommendation
            $sharedData['profileCompletion'] = [
                'status' => $request->user()->getProfileCompletionStatus(),
                'recommendation' => $request->user()->getProfileCompletionRecommendation(),
            ];
        }

        // Add wishlist count (works for both guests and authenticated users)
        $sharedData['wishlistCount'] = WishlistHelper::getCount();

        return $sharedData;
    }
}
