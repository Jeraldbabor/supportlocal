<?php

namespace App\Notifications;

use App\Models\CustomOrderBid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BidAccepted extends Notification implements ShouldQueue
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
        $buyer = $request->buyer;

        return (new MailMessage)
            ->subject('Congratulations! Your Bid Was Accepted')
            ->greeting('Great news, '.$notifiable->name.'!')
            ->line('Your bid on "'.$request->title.'" has been accepted!')
            ->line('**Buyer:** '.$buyer->name)
            ->line('**Agreed Price:** ₱'.number_format($this->bid->proposed_price, 2))
            ->line('**Delivery Timeline:** '.$this->bid->estimated_days.' days')
            ->action('Start Working', url('/seller/custom-orders/'.$request->id))
            ->line('Please start working on this order and keep the buyer updated on progress.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->bid->customOrderRequest;
        $buyer = $request->buyer;

        return [
            'type' => 'bid_accepted',
            'title' => 'Bid Accepted!',
            'bid_id' => $this->bid->id,
            'request_id' => $request->id,
            'request_number' => $request->request_number,
            'request_title' => $request->title,
            'buyer_id' => $buyer->id,
            'buyer_name' => $buyer->name,
            'agreed_price' => $this->bid->proposed_price,
            'estimated_days' => $this->bid->estimated_days,
            'message' => 'Your bid on "'.$request->title.'" was accepted by '.$buyer->name,
            'action_url' => '/seller/custom-orders/'.$request->id,
        ];
    }
}
