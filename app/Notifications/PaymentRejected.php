<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    public $rejectionReason;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, string $rejectionReason)
    {
        $this->order = $order->load(['orderItems.product', 'seller', 'buyer']);
        $this->rejectionReason = $rejectionReason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sellerName = $this->order->seller->business_name ?? $this->order->seller->name ?? 'the seller';

        return (new MailMessage)
            ->subject('Payment Proof Rejected - Order #'.$this->order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Unfortunately, your payment proof for Order #'.$this->order->id.' has been rejected by '.$sellerName.'.')
            ->line('Rejection Reason:')
            ->line($this->rejectionReason)
            ->action('Upload New Payment Proof', route('buyer.orders.show', $this->order))
            ->line('Please upload a new payment proof to proceed with your order.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Payment Proof Rejected ❌',
            'message' => 'Your payment proof for Order #'.$this->order->id.' was rejected. Reason: '.$this->rejectionReason,
            'order_id' => $this->order->id,
            'rejection_reason' => $this->rejectionReason,
            'total_amount' => $this->order->total_amount,
            'action_url' => route('buyer.orders.show', $this->order),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
