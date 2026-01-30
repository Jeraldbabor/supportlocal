<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancelledByBuyer extends Notification
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
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
     * Get the order, reloading if needed for queued notifications
     */
    protected function getOrder()
    {
        // If order is an ID (happens when serialized for queue), load it
        if (is_numeric($this->order)) {
            return \App\Models\Order::with('buyer')->findOrFail($this->order);
        }

        // If order is already loaded with relationships, use it
        if ($this->order && $this->order->relationLoaded('buyer')) {
            return $this->order;
        }

        // Otherwise reload with relationships (for queued notifications)
        $orderId = $this->order->id ?? $this->order;

        return \App\Models\Order::with('buyer')->findOrFail($orderId);
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->getOrder();

        return (new MailMessage)
            ->subject('Order Cancelled - Order #'.$order->order_number)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('An order has been cancelled by the buyer.')
            ->line('Order Number: #'.$order->order_number)
            ->line('Total Amount: ₱'.number_format($order->total_amount, 2))
            ->line('Customer: '.($order->buyer->name ?? 'Customer'))
            ->line('Cancellation Reason: '.$order->cancellation_reason)
            ->action('View Order Details', url('/seller/orders/'.$order->id))
            ->line('The product quantities have been restored to your inventory.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $order = $this->getOrder();

        return [
            'title' => 'Order Cancelled by Buyer',
            'message' => 'Order #'.$order->order_number.' has been cancelled by '.($order->buyer->name ?? 'Customer').'. Reason: '.$order->cancellation_reason,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->buyer->name ?? 'Customer',
            'total_amount' => $order->total_amount,
            'cancellation_reason' => $order->cancellation_reason,
            'action_url' => '/seller/orders/'.$order->id,
        ];
    }
}
