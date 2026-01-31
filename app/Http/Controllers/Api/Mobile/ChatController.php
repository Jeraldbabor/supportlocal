<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = Auth::user();

        $conversations = Conversation::where(function ($query) use ($user) {
            $query->where('buyer_id', $user->id)
                ->orWhere('seller_id', $user->id);
        })
        ->with(['buyer:id,name,avatar', 'seller:id,name,avatar,business_name'])
        ->withCount(['messages as unread_count' => function ($query) use ($user) {
            $query->where('sender_id', '!=', $user->id)
                ->whereNull('read_at');
        }])
        ->orderBy('updated_at', 'desc')
        ->get();

        $data = $conversations->map(function ($conv) use ($user) {
            $otherUser = $conv->buyer_id === $user->id ? $conv->seller : $conv->buyer;
            $lastMessage = $conv->messages()->latest()->first();

            return [
                'id' => $conv->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->business_name ?? $otherUser->name,
                    'avatar' => $otherUser->avatar,
                ],
                'last_message' => $lastMessage ? [
                    'content' => $lastMessage->content,
                    'type' => $lastMessage->type,
                    'is_mine' => $lastMessage->sender_id === $user->id,
                    'created_at' => $lastMessage->created_at->toIso8601String(),
                ] : null,
                'unread_count' => $conv->unread_count,
                'updated_at' => $conv->updated_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get or create a conversation with a user
     */
    public function getOrCreateConversation(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $otherUser = User::findOrFail($validated['user_id']);

        // Determine buyer and seller
        if ($user->role === 'buyer' && $otherUser->role === 'seller') {
            $buyerId = $user->id;
            $sellerId = $otherUser->id;
        } elseif ($user->role === 'seller' && $otherUser->role === 'buyer') {
            $buyerId = $otherUser->id;
            $sellerId = $user->id;
        } else {
            // Both are same role, use first come first serve
            $buyerId = min($user->id, $otherUser->id);
            $sellerId = max($user->id, $otherUser->id);
        }

        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $buyerId, 'seller_id' => $sellerId],
            ['buyer_id' => $buyerId, 'seller_id' => $sellerId]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $conversation->id,
            ],
        ]);
    }

    /**
     * Get messages for a conversation
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        // Check access
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        $otherUser = $conversation->buyer_id === $user->id 
            ? $conversation->seller 
            : $conversation->buyer;

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Get messages with pagination (newest first, then reverse for display)
        $perPage = min($request->input('per_page', 50), 100);
        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $data = $messages->getCollection()->reverse()->values()->map(function ($msg) use ($user) {
            return [
                'id' => $msg->id,
                'content' => $msg->content,
                'type' => $msg->type,
                'attachment_url' => $msg->attachment_url,
                'is_mine' => $msg->sender_id === $user->id,
                'sender' => [
                    'id' => $msg->sender->id,
                    'name' => $msg->sender->name,
                    'avatar' => $msg->sender->avatar,
                ],
                'read_at' => $msg->read_at?->toIso8601String(),
                'created_at' => $msg->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->business_name ?? $otherUser->name,
                        'avatar' => $otherUser->avatar,
                    ],
                ],
                'messages' => $data,
            ],
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        // Check access
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        $validated = $request->validate([
            'content' => 'required_without:attachment|string|max:2000',
            'attachment' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        DB::beginTransaction();
        try {
            $type = 'text';
            $attachmentUrl = null;

            if ($request->hasFile('attachment')) {
                $type = 'image';
                $path = $request->file('attachment')->store('chat-attachments', 'public');
                $attachmentUrl = Storage::url($path);
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $validated['content'] ?? '',
                'type' => $type,
                'attachment_url' => $attachmentUrl,
            ]);

            // Update conversation timestamp
            $conversation->touch();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'attachment_url' => $message->attachment_url,
                    'is_mine' => true,
                    'created_at' => $message->created_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message.',
            ], 500);
        }
    }

    /**
     * Delete a conversation
     */
    public function deleteConversation(Conversation $conversation): JsonResponse
    {
        $user = Auth::user();

        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        // Soft delete messages first
        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted.',
        ]);
    }

    /**
     * Get unread message count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();

        $count = Message::whereHas('conversation', function ($query) use ($user) {
            $query->where('buyer_id', $user->id)
                ->orWhere('seller_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->whereNull('read_at')
        ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }
}
