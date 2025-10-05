<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
{
    use Queueable;

    public $order;

    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, ?string $message = null)
    {
        $this->order = $order;
        $this->message = $message ?? $this->getDefaultMessage();
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
        $subject = "Order #{$this->order->id} - Status Update";

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line($this->message)
            ->line("Order ID: #{$this->order->id}")
            ->line('Total Amount: ₱'.number_format($this->order->total_amount, 2))
            ->line('Status: '.ucfirst(str_replace('_', ' ', $this->order->status)))
            ->action('View Order', $this->getOrderUrl($notifiable))
            ->line('Thank you for using SupportLocal!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'message' => $this->message,
            'status' => $this->order->status,
            'total_amount' => $this->order->total_amount,
            'url' => $this->getOrderUrl($notifiable),
        ];
    }

    /**
     * Get default message based on order status.
     */
    private function getDefaultMessage(): string
    {
        return match ($this->order->status) {
            Order::STATUS_PENDING => 'New order received and is pending confirmation.',
            Order::STATUS_CONFIRMED => 'Your order has been confirmed by the seller.',
            Order::STATUS_CANCELLED => 'Your order has been cancelled.',
            Order::STATUS_COMPLETED => 'Your order has been completed and delivered.',
            default => 'Your order status has been updated.',
        };
    }

    /**
     * Get the appropriate order URL based on user role.
     */
    private function getOrderUrl(object $notifiable): string
    {
        if ($notifiable->role === 'seller') {
            return route('seller.orders.show', $this->order);
        } else {
            return route('buyer.orders.show', $this->order);
        }
    }
}
