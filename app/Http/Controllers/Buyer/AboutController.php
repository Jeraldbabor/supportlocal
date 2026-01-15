<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        $artisans = User::where('role', 'seller')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Calculate time since joining
                $joinedAt = Carbon::parse($user->created_at);
                $now = Carbon::now();

                $years = (int) $joinedAt->diffInYears($now);
                $months = (int) $joinedAt->diffInMonths($now) % 12;
                $days = (int) $joinedAt->diffInDays($now) % 30;

                // Build experience string - show only the most significant unit
                if ($years >= 1) {
                    $experience = $years.' '.($years == 1 ? 'year' : 'years');
                } elseif ($months >= 1) {
                    $experience = $months.' '.($months == 1 ? 'month' : 'months');
                } else {
                    $experience = max(1, $days).' '.($days <= 1 ? 'day' : 'days');
                }

                // Build location string
                $locationParts = array_filter([
                    $user->delivery_city,
                    $user->delivery_province,
                ]);
                $location = ! empty($locationParts) ? implode(', ', $locationParts) : ($user->address ?? 'Philippines');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'specialty' => 'Artisan',
                    'image' => $user->profile_picture
                        ? '/storage/'.$user->profile_picture
                        : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&size=200&background=random',
                    'description' => 'A talented artisan creating unique handcrafted items.',
                    'location' => $location,
                    'experience' => $experience,
                ];
            });

        // Get dynamic page content
        $pageContents = PageContent::getPageContents(PageContent::PAGE_TYPE_ABOUT)
            ->map(function ($content) {
                return [
                    'section' => $content->section,
                    'title' => $content->title,
                    'content' => $content->content,
                    'metadata' => $content->metadata,
                ];
            })
            ->keyBy('section');

        return Inertia::render('buyer/About', [
            'artisans' => $artisans,
            'pageContents' => $pageContents,
        ]);
    }
}
