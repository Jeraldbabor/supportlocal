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
        $this->order = $order->load(['orderItems.product', 'seller', 'buyer']);
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
        $subject = $this->getEmailSubject();
        $actionUrl = $this->getOrderUrl($notifiable);

        return (new MailMessage)
            ->subject($subject)
            ->markdown('emails.orders.status-updated', [
                'order' => $this->order,
                'message' => $this->message,
                'notifiable' => $notifiable,
                'actionUrl' => $actionUrl,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->getNotificationTitle(),
            'order_id' => $this->order->id,
            'message' => $this->message,
            'status' => $this->order->status,
            'total_amount' => $this->order->total_amount,
            'action_url' => $this->getOrderUrl($notifiable),
        ];
    }

    /**
     * Get email subject based on order status.
     */
    private function getEmailSubject(): string
    {
        $orderId = $this->order->id;

        return match ($this->order->status) {
            Order::STATUS_PENDING => "📦 Order #{$orderId} - Awaiting Confirmation",
            Order::STATUS_CONFIRMED => "✅ Order #{$orderId} - Confirmed!",
            Order::STATUS_CANCELLED => "❌ Order #{$orderId} - Cancelled",
            Order::STATUS_COMPLETED => "🎉 Order #{$orderId} - Delivered!",
            default => "📦 Order #{$orderId} - Status Update",
        };
    }

    /**
     * Get notification title based on order status.
     */
    private function getNotificationTitle(): string
    {
        return match ($this->order->status) {
            Order::STATUS_PENDING => 'Order Awaiting Confirmation',
            Order::STATUS_CONFIRMED => 'Order Confirmed! 🎉',
            Order::STATUS_CANCELLED => 'Order Cancelled',
            Order::STATUS_COMPLETED => 'Order Delivered! 🎉',
            default => 'Order Status Updated',
        };
    }

    /**
     * Get default message based on order status.
     */
    private function getDefaultMessage(): string
    {
        $sellerName = $this->order->seller->business_name ?? $this->order->seller->name ?? 'the seller';

        return match ($this->order->status) {
            Order::STATUS_PENDING => 'Your order has been received and is awaiting confirmation from the seller.',
            Order::STATUS_CONFIRMED => "Great news! Your order has been confirmed by {$sellerName} and is being prepared.",
            Order::STATUS_CANCELLED => 'We\'re sorry, but your order has been cancelled.',
            Order::STATUS_COMPLETED => "Your order has been successfully delivered! Thank you for supporting {$sellerName}.",
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
