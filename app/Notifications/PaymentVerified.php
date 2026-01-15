<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentVerified extends Notification
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->load(['orderItems.product', 'seller', 'buyer']);
    }

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
        $sellerName = $this->order->seller->business_name ?? $this->order->seller->name ?? 'the seller';

        return (new MailMessage)
            ->subject('Payment Verified - Order #'.$this->order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Great news! Your payment has been verified by '.$sellerName.'.')
            ->line('Order ID: #'.$this->order->id)
            ->line('Total Amount: ₱'.number_format($this->order->total_amount, 2))
            ->action('View Order', route('buyer.orders.show', $this->order))
            ->line('Your order will now be processed by the seller.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Payment Verified ✅',
            'message' => 'Your payment for Order #'.$this->order->id.' has been verified. The seller will now process your order.',
            'order_id' => $this->order->id,
            'total_amount' => $this->order->total_amount,
            'action_url' => route('buyer.orders.show', $this->order),
        ];
    }
}
