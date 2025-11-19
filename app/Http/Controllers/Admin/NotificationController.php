<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display admin's notifications.
     */
    public function index(): Response
    {
        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/notifications/index', [
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
}
