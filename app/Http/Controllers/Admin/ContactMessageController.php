<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageReply;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    /**
     * Display a listing of contact messages.
     */
    public function index(Request $request): Response
    {
        $query = ContactMessage::query();

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($message) => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject,
                'message' => $message->message,
                'status' => $message->status,
                'admin_notes' => $message->admin_notes,
                'read_at' => $message->read_at,
                'created_at' => $message->created_at,
            ]);

        return Inertia::render('admin/contact-messages/index', [
            'messages' => $messages,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => ContactMessage::count(),
                'new' => ContactMessage::where('status', ContactMessage::STATUS_NEW)->count(),
                'read' => ContactMessage::where('status', ContactMessage::STATUS_READ)->count(),
                'replied' => ContactMessage::where('status', ContactMessage::STATUS_REPLIED)->count(),
            ],
        ]);
    }

    /**
     * Display the specified contact message.
     */
    public function show(ContactMessage $contactMessage): Response
    {
        // Mark as read if not already read
        if ($contactMessage->status === ContactMessage::STATUS_NEW) {
            $contactMessage->markAsRead();
        }

        return Inertia::render('admin/contact-messages/show', [
            'message' => [
                'id' => $contactMessage->id,
                'name' => $contactMessage->name,
                'email' => $contactMessage->email,
                'subject' => $contactMessage->subject,
                'message' => $contactMessage->message,
                'status' => $contactMessage->status,
                'admin_notes' => $contactMessage->admin_notes,
                'read_at' => $contactMessage->read_at,
                'created_at' => $contactMessage->created_at,
                'updated_at' => $contactMessage->updated_at,
            ],
        ]);
    }

    /**
     * Update the status of a contact message.
     */
    public function updateStatus(Request $request, ContactMessage $contactMessage)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:new,read,replied,archived',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $contactMessage->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $contactMessage->admin_notes,
        ]);

        if ($validated['status'] === ContactMessage::STATUS_READ && !$contactMessage->read_at) {
            $contactMessage->markAsRead();
        }

        return back()->with('message', 'Message status updated successfully.');
    }

    /**
     * Send a reply email to the contact message sender.
     */
    public function reply(Request $request, ContactMessage $contactMessage)
    {
        $validated = $request->validate([
            'reply_message' => 'required|string|min:10|max:5000',
        ]);

        try {
            $admin = Auth::user();
            
            // Send the email
            Mail::to($contactMessage->email)
                ->send(new ContactMessageReply(
                    $contactMessage,
                    $validated['reply_message'],
                    $admin->name
                ));

            // Update status to replied
            $contactMessage->update([
                'status' => ContactMessage::STATUS_REPLIED,
            ]);

            return back()->with('success', 'Reply email sent successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'reply' => 'Failed to send email: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Delete a contact message.
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return redirect()
            ->route('admin.contact-messages.index')
            ->with('message', 'Contact message deleted successfully.');
    }
}
