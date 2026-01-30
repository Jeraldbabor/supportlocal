<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    /**
     * Display a listing of newsletter subscribers.
     */
    public function index(Request $request): Response
    {
        $query = NewsletterSubscriber::query();

        // Apply status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'unsubscribed') {
                $query->where('is_active', false);
            }
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('email', 'like', "%{$search}%");
        }

        $subscribers = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($subscriber) => [
                'id' => $subscriber->id,
                'email' => $subscriber->email,
                'is_active' => $subscriber->is_active,
                'subscribed_at' => $subscriber->subscribed_at,
                'unsubscribed_at' => $subscriber->unsubscribed_at,
                'created_at' => $subscriber->created_at,
            ]);

        return Inertia::render('admin/newsletter/index', [
            'subscribers' => $subscribers,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => NewsletterSubscriber::count(),
                'active' => NewsletterSubscriber::where('is_active', true)->count(),
                'unsubscribed' => NewsletterSubscriber::where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Delete a newsletter subscriber.
     */
    public function destroy(NewsletterSubscriber $subscriber)
    {
        $subscriber->delete();

        return redirect()
            ->route('admin.newsletter.index')
            ->with('message', 'Subscriber deleted successfully.');
    }

    /**
     * Export subscribers as CSV.
     */
    public function export(Request $request)
    {
        $query = NewsletterSubscriber::query();

        // Apply same filters as index
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'unsubscribed') {
                $query->where('is_active', false);
            }
        }

        $subscribers = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="newsletter-subscribers-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($subscribers) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, ['Email', 'Status', 'Subscribed At', 'Unsubscribed At']);
            
            // Data rows
            foreach ($subscribers as $subscriber) {
                fputcsv($file, [
                    $subscriber->email,
                    $subscriber->is_active ? 'Active' : 'Unsubscribed',
                    $subscriber->subscribed_at?->format('Y-m-d H:i:s'),
                    $subscriber->unsubscribed_at?->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Toggle subscriber status (activate/deactivate).
     */
    public function toggleStatus(NewsletterSubscriber $subscriber)
    {
        if ($subscriber->is_active) {
            $subscriber->unsubscribe();
            $message = 'Subscriber has been deactivated.';
        } else {
            $subscriber->update([
                'is_active' => true,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]);
            $message = 'Subscriber has been reactivated.';
        }

        return back()->with('message', $message);
    }
}
