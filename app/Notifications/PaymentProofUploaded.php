<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentProofUploaded extends Notification
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
        return (new MailMessage)
            ->subject('Payment Proof Uploaded - Order #'.$this->order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('A buyer has uploaded a payment proof for their order.')
            ->line('Order ID: #'.$this->order->id)
            ->line('Total Amount: ₱'.number_format($this->order->total_amount, 2))
            ->line('Customer: '.$this->order->buyer->name)
            ->action('Review Payment Proof', route('seller.orders.show', $this->order))
            ->line('Please review the payment proof and verify or reject it.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Payment Proof Uploaded',
            'message' => 'Order #'.$this->order->id.' - '.$this->order->buyer->name.' has uploaded a payment proof. Please review it.',
            'order_id' => $this->order->id,
            'customer_name' => $this->order->buyer->name,
            'total_amount' => $this->order->total_amount,
            'action_url' => route('seller.orders.show', $this->order),
        ];
    }
}
