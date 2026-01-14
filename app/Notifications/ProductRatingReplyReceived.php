<?php

namespace App\Notifications;

use App\Models\ProductRating;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductRatingReplyReceived extends Notification
{
    use Queueable;

    protected $rating;

    /**
     * Create a new notification instance.
     */
    public function __construct(ProductRating $rating)
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
        $productName = $this->rating->product->name;
        $sellerName = $this->rating->product->seller->name;

        return (new MailMessage)
            ->subject('Seller Replied to Your Product Review')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('The seller has replied to your review on "'.$productName.'"')
            ->line('Seller: '.$sellerName)
            ->line('Reply: "'.$this->rating->seller_reply.'"')
            ->action('View Reply', url('/buyer/product/'.$this->rating->product_id))
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
            'title' => 'Seller Replied to Your Review',
            'message' => $this->rating->product->seller->name.' replied to your review on "'.$this->rating->product->name.'"',
            'rating_id' => $this->rating->id,
            'product_id' => $this->rating->product_id,
            'product_name' => $this->rating->product->name,
            'seller_name' => $this->rating->product->seller->name,
            'seller_reply' => $this->rating->seller_reply,
            'action_url' => '/buyer/product/'.$this->rating->product_id,
        ];
    }
}
