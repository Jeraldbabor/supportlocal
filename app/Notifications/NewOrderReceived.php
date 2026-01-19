<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification
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
            ->subject('New Order Received - Order #'.$order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have received a new order!')
            ->line('Order ID: #'.$order->id)
            ->line('Total Amount: ₱'.number_format($order->total_amount, 2))
            ->line('Customer: '.($order->buyer->name ?? 'Customer'))
            ->action('View Order Details', url('/seller/orders/'.$order->id))
            ->line('Thank you for using our platform!');
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
            'title' => 'New Order Received',
            'message' => 'You have received a new order #'.$order->id.' from '.($order->buyer->name ?? 'Customer').'. Total: ₱'.number_format($order->total_amount, 2),
            'order_id' => $order->id,
            'customer_name' => $order->buyer->name ?? 'Customer',
            'total_amount' => $order->total_amount,
            'action_url' => '/seller/orders/'.$order->id,
        ];
    }
}
