<?php

namespace App\Notifications;

use App\Models\CustomOrderBid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BidRejected extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CustomOrderBid $bid,
        public bool $anotherBidAccepted = false
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

        $mail = (new MailMessage)
            ->subject('Update on Your Bid - '.$request->title)
            ->greeting('Hello '.$notifiable->name.',');

        if ($this->anotherBidAccepted) {
            $mail->line('We wanted to let you know that the buyer has selected another artisan for their custom order request: "'.$request->title.'".')
                ->line('Don\'t be discouraged! Keep an eye on the marketplace for more opportunities.');
        } else {
            $mail->line('Unfortunately, your bid on "'.$request->title.'" was not selected.')
                ->line('**Reason:** '.($this->bid->rejection_reason ?? 'No specific reason provided'));
        }

        return $mail
            ->action('Browse Marketplace', url('/seller/marketplace'))
            ->line('Thank you for your interest. Keep bidding on projects that match your skills!');
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

        $message = $this->anotherBidAccepted
            ? 'Another artisan was selected for "'.$request->title.'"'
            : 'Your bid on "'.$request->title.'" was declined';

        return [
            'type' => 'bid_rejected',
            'title' => 'Bid Update',
            'bid_id' => $this->bid->id,
            'request_id' => $request->id,
            'request_number' => $request->request_number,
            'request_title' => $request->title,
            'buyer_id' => $buyer->id,
            'buyer_name' => $buyer->name,
            'proposed_price' => $this->bid->proposed_price,
            'another_bid_accepted' => $this->anotherBidAccepted,
            'rejection_reason' => $this->bid->rejection_reason,
            'message' => $message,
            'action_url' => '/seller/marketplace',
        ];
    }
}
