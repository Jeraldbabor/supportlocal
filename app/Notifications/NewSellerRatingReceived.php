<?php

namespace App\Notifications;

use App\Models\SellerRating;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSellerRatingReceived extends Notification
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
        $stars = str_repeat('⭐', $this->rating->rating);

        return (new MailMessage)
            ->subject('New Seller Rating Received')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have received a new rating as a seller!')
            ->line('Rating: '.$stars.' ('.$this->rating->rating.'/5)')
            ->line('From: '.$this->rating->user->name)
            ->when($this->rating->review, function ($mail) {
                return $mail->line('Review: "'.$this->rating->review.'"');
            })
            ->action('View Rating & Reply', url('/seller/seller-ratings'))
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
            'title' => 'New Seller Rating',
            'message' => $this->rating->user->name.' rated you with '.$this->rating->rating.' stars'.($this->rating->review ? ' and left a review.' : '.'),
            'rating_id' => $this->rating->id,
            'rating' => $this->rating->rating,
            'review' => $this->rating->review,
            'customer_name' => $this->rating->user->name,
            'action_url' => '/seller/seller-ratings',
        ];
    }
}
