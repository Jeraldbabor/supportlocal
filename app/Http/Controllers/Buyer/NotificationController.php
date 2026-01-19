<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display buyer's notifications.
     */
    public function index(): Response
    {
        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('buyer/notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = auth()->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Delete a specific notification.
     */
    public function destroy($id)
    {
        try {
            $notification = auth()->user()
                ->notifications()
                ->where('id', $id)
                ->firstOrFail();

            $notification->delete();

            return back()->with('success', 'Notification deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete notification. Please try again.');
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        auth()->user()
            ->unreadNotifications
            ->markAsRead();

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Clear all notification history.
     */
    public function clearAllHistory()
    {
        try {
            auth()->user()
                ->notifications()
                ->delete();

            return back()->with('success', 'All notification history cleared successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear notification history. Please try again.');
        }
    }

    /**
     * Get recent notifications for dropdown (API endpoint).
     */
    public function getRecent(Request $request)
    {
        // If this is an Inertia request (e.g., direct browser navigation),
        // redirect to the notifications index page instead
        if ($request->header('X-Inertia')) {
            return redirect()->route('buyer.notifications.index');
        }

        $limit = $request->get('limit', 10);

        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true);

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'action_url' => $data['action_url'] ?? null,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'data' => $data,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => auth()->user()->unreadNotifications()->count(),
        ]);
    }
}
