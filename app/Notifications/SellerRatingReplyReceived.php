<?php

namespace App\Notifications;

use App\Models\SellerRating;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SellerRatingReplyReceived extends Notification
{
    use Queueable;

    protected $rating;

    /**
     * Create a new notification instance.
     */
    public function __construct(SellerRating $rating)
    {
        $this->rating = $rating;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sellerName = $this->rating->seller->name;

        return (new MailMessage)
            ->subject('Seller Replied to Your Rating')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('The seller has replied to your rating!')
            ->line('Seller: '.$sellerName)
            ->line('Reply: "'.$this->rating->seller_reply.'"')
            ->action('View Reply', url('/buyer/seller/'.$this->rating->seller_id))
            ->line('Thank you for your feedback!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Seller Replied to Your Rating',
            'message' => $this->rating->seller->name.' replied to your seller rating.',
            'rating_id' => $this->rating->id,
            'seller_id' => $this->rating->seller_id,
            'seller_name' => $this->rating->seller->name,
            'seller_reply' => $this->rating->seller_reply,
            'action_url' => '/buyer/seller/'.$this->rating->seller_id,
        ];
    }
}
