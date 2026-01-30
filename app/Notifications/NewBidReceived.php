<?php

namespace App\Notifications;

use App\Models\CustomOrderBid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBidReceived extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CustomOrderBid $bid
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $request = $this->bid->customOrderRequest;
        $seller = $this->bid->seller;

        return (new MailMessage)
            ->subject('New Bid on Your Custom Order Request')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have received a new bid on your custom order request: "'.$request->title.'"')
            ->line('**Seller:** '.$seller->name)
            ->line('**Proposed Price:** ₱'.number_format($this->bid->proposed_price, 2))
            ->line('**Estimated Delivery:** '.$this->bid->estimated_days.' days')
            ->action('View All Bids', url('/buyer/custom-orders/'.$request->id))
            ->line('Review all bids and choose the best artisan for your project!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->bid->customOrderRequest;
        $seller = $this->bid->seller;

        return [
            'type' => 'new_bid_received',
            'bid_id' => $this->bid->id,
            'request_id' => $request->id,
            'request_number' => $request->request_number,
            'request_title' => $request->title,
            'seller_id' => $seller->id,
            'seller_name' => $seller->name,
            'proposed_price' => $this->bid->proposed_price,
            'estimated_days' => $this->bid->estimated_days,
            'message' => 'New bid from '.$seller->name.' on "'.$request->title.'"',
            'url' => '/buyer/custom-orders/'.$request->id,
        ];
    }
}
