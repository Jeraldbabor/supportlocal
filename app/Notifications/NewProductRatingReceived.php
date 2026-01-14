<?php

namespace App\Notifications;

use App\Models\ProductRating;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProductRatingReceived extends Notification
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
        $stars = str_repeat('⭐', $this->rating->rating);
        $productName = $this->rating->product->name;

        return (new MailMessage)
            ->subject('New Product Rating - '.$productName)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have received a new rating on your product!')
            ->line('Product: '.$productName)
            ->line('Rating: '.$stars.' ('.$this->rating->rating.'/5)')
            ->line('From: '.$this->rating->user->name)
            ->when($this->rating->review, function ($mail) {
                return $mail->line('Review: "'.$this->rating->review.'"');
            })
            ->action('View Rating & Reply', url('/seller/products/'.$this->rating->product_id.'/ratings'))
            ->line('Thank you for using our platform!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Product Rating',
            'message' => $this->rating->user->name.' rated your product "'.$this->rating->product->name.'" with '.$this->rating->rating.' stars'.($this->rating->review ? ' and left a review.' : '.'),
            'rating_id' => $this->rating->id,
            'product_id' => $this->rating->product_id,
            'product_name' => $this->rating->product->name,
            'rating' => $this->rating->rating,
            'review' => $this->rating->review,
            'customer_name' => $this->rating->user->name,
            'action_url' => '/seller/products/'.$this->rating->product_id.'/ratings',
        ];
    }
}
