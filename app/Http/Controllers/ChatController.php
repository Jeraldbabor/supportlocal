<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display the chat interface.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Get all conversations for the current user that haven't been deleted by them
        $conversations = Conversation::where(function ($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->whereNull('deleted_by_buyer_at');
            })
            ->orWhere(function ($query) use ($user) {
                $query->where('seller_id', $user->id)
                      ->whereNull('deleted_by_seller_at');
            })
            ->with(['buyer', 'seller', 'product', 'lastMessage'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherParticipant($user->id);
                // Ensure avatar_url is included in the serialization
                $otherUser->append('avatar_url');
                
                return [
                    'id' => $conversation->id,
                    'other_user' => $otherUser,
                    'product' => $conversation->product,
                    'last_message' => $conversation->lastMessage,
                    'last_message_at' => $conversation->last_message_at,
                    'unread_count' => $conversation->getUnreadCountForUser($user->id),
                ];
            });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get or create a conversation between two users.
     */
    public function getOrCreateConversation(Request $request)
    {
        $request->validate([
            'other_user_id' => 'required|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $currentUser = auth()->user();
        $otherUserId = $request->other_user_id;

        // Determine who is buyer and who is seller
        $otherUser = User::findOrFail($otherUserId);
        
        $buyerId = $otherUser->isSeller() ? $currentUser->id : $otherUserId;
        $sellerId = $otherUser->isSeller() ? $otherUserId : $currentUser->id;

        // Find or create conversation
        $conversation = Conversation::where(function ($query) use ($buyerId, $sellerId) {
            $query->where('buyer_id', $buyerId)
                  ->where('seller_id', $sellerId);
        })->orWhere(function ($query) use ($buyerId, $sellerId) {
            $query->where('buyer_id', $sellerId)
                  ->where('seller_id', $buyerId);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'buyer_id' => $buyerId,
                'seller_id' => $sellerId,
                'product_id' => $request->product_id,
                'last_message_at' => now(),
            ]);
        }

        return response()->json([
            'conversation_id' => $conversation->id,
        ]);
    }

    /**
     * Get messages for a specific conversation.
     */
    public function getMessages($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = auth()->user();

        // Verify user is part of the conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403, 'Unauthorized access to conversation');
        }

        // Mark messages as read
        $conversation->markAsReadForUser($user->id);

        // Get all messages
        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->each(function ($message) {
                // Ensure sender has avatar_url
                $message->sender->append('avatar_url');
            });

        $otherUser = $conversation->getOtherParticipant($user->id);
        $otherUser->append('avatar_url');

        return response()->json([
            'messages' => $messages,
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => $otherUser,
                'product' => $conversation->product,
            ],
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message' => 'required_without:image|string|max:5000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $conversation = Conversation::findOrFail($conversationId);
        $user = auth()->user();

        // Verify user is part of the conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403, 'Unauthorized access to conversation');
        }

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat-images', 'public');
        }

        // Create the message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->message ?? '',
            'image' => $imagePath,
        ]);

        // Restore conversation for recipient if they deleted it
        $updateData = ['last_message_at' => now()];
        if ($conversation->buyer_id === $user->id && $conversation->deleted_by_seller_at) {
            $updateData['deleted_by_seller_at'] = null;
            \Log::info('Restoring conversation for seller', ['conversation_id' => $conversation->id]);
        } elseif ($conversation->seller_id === $user->id && $conversation->deleted_by_buyer_at) {
            $updateData['deleted_by_buyer_at'] = null;
            \Log::info('Restoring conversation for buyer', ['conversation_id' => $conversation->id, 'buyer_id' => $conversation->buyer_id]);
        }

        // Update conversation's last message timestamp and restore if needed
        $conversation->update($updateData);
        
        \Log::info('Conversation updated', [
            'conversation_id' => $conversation->id,
            'deleted_by_buyer_at' => $conversation->fresh()->deleted_by_buyer_at,
            'deleted_by_seller_at' => $conversation->fresh()->deleted_by_seller_at,
        ]);

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        // Load sender with avatar_url
        $message->load('sender');
        $message->sender->append('avatar_url');

        return response()->json([
            'message' => $message,
        ]);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = auth()->user();

        // Verify user is part of the conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403, 'Unauthorized access to conversation');
        }

        $conversation->markAsReadForUser($user->id);

        return response()->json(['success' => true]);
    }

    /**
     * Get total unread message count for current user.
     */
    public function getUnreadCount()
    {
        $user = auth()->user();

        $unreadCount = Message::whereHas('conversation', function ($query) use ($user) {
            $query->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->where('is_read', false)
        ->count();

        return response()->json(['count' => $unreadCount]);
    }

    /**
     * Delete a conversation for the current user only.
     */
    public function deleteConversation($conversationId)
    {
        $user = auth()->user();
        
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403, 'Unauthorized to delete this conversation.');
        }

        // Soft delete for the current user only
        if ($user->id === $conversation->buyer_id) {
            $conversation->deleted_by_buyer_at = now();
        } else {
            $conversation->deleted_by_seller_at = now();
        }
        $conversation->save();

        // If both users have deleted the conversation, permanently delete it
        if ($conversation->deleted_by_buyer_at && $conversation->deleted_by_seller_at) {
            $conversation->messages()->delete();
            $conversation->delete();
        }

        return redirect()->route('chat.index')->with('success', 'Conversation deleted successfully.');
    }

    /**
     * Broadcast that user started typing.
     */
    public function startTyping($conversationId)
    {
        $user = auth()->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403);
        }

        broadcast(new UserTyping($conversationId, $user->id, $user->name, true));

        return response()->json(['status' => 'typing']);
    }

    /**
     * Broadcast that user stopped typing.
     */
    public function stopTyping($conversationId)
    {
        $user = auth()->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403);
        }

        broadcast(new UserTyping($conversationId, $user->id, $user->name, false));

        return response()->json(['status' => 'stopped']);
    }

    /**
     * Get conversations list for API calls.
     */
    public function getConversations()
    {
        $user = auth()->user();
        
        \Log::info('Getting conversations for user', ['user_id' => $user->id]);
        
        // Get all conversations for the current user that haven't been deleted by them
        $conversations = Conversation::where(function ($query) use ($user) {
                // Buyer conversations that aren't deleted by buyer
                $query->where(function ($q) use ($user) {
                    $q->where('buyer_id', $user->id)
                      ->whereNull('deleted_by_buyer_at');
                })
                // OR Seller conversations that aren't deleted by seller
                ->orWhere(function ($q) use ($user) {
                    $q->where('seller_id', $user->id)
                      ->whereNull('deleted_by_seller_at');
                });
            })
            ->with(['buyer', 'seller', 'product', 'lastMessage'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherParticipant($user->id);
                // Ensure avatar_url is included in the serialization
                $otherUser->append('avatar_url');
                
                return [
                    'id' => $conversation->id,
                    'other_user' => $otherUser,
                    'product' => $conversation->product,
                    'last_message' => $conversation->lastMessage,
                    'last_message_at' => $conversation->last_message_at,
                    'unread_count' => $conversation->getUnreadCountForUser($user->id),
                ];
            });

        \Log::info('Found conversations', ['count' => $conversations->count()]);

        return response()->json($conversations);
    }
}
