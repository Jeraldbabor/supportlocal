<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewMarketplaceRequest extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CustomOrderRequest $request
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Only database notification - no email to avoid spam
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_marketplace_request',
            'request_id' => $this->request->id,
            'request_number' => $this->request->request_number,
            'request_title' => $this->request->title,
            'category' => $this->request->category,
            'category_label' => $this->request->category_label,
            'formatted_budget' => $this->request->formatted_budget,
            'buyer_id' => $this->request->buyer_id,
            'buyer_name' => $this->request->buyer?->name,
            'message' => 'New custom order request: "'.$this->request->title.'"',
            'url' => '/seller/marketplace/'.$this->request->id,
        ];
    }
}
