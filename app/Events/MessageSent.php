<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $conversation = $this->message->conversation;
        $recipientId = $this->message->sender_id === $conversation->buyer_id
            ? $conversation->seller_id
            : $conversation->buyer_id;

        return [
            new PrivateChannel('conversation.'.$this->message->conversation_id),
            new PrivateChannel('App.Models.User.'.$recipientId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        // Ensure sender has avatar_url appended
        $this->message->load(['sender', 'conversation.product']);
        $this->message->sender->append('avatar_url');

        return [
            'message' => $this->message,
            'sender' => $this->message->sender,
            'conversation' => [
                'id' => $this->message->conversation->id,
                'product' => $this->message->conversation->product,
            ],
        ];
    }
}
