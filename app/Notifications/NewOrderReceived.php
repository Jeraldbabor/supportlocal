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
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Order Received - Order #'.$this->order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have received a new order!')
            ->line('Order ID: #'.$this->order->id)
            ->line('Total Amount: ₱'.number_format($this->order->total_amount, 2))
            ->line('Customer: '.$this->order->buyer->name)
            ->action('View Order Details', url('/seller/orders/'.$this->order->id))
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
            'title' => 'New Order Received',
            'message' => 'You have received a new order #'.$this->order->id.' from '.$this->order->buyer->name.'. Total: ₱'.number_format($this->order->total_amount, 2),
            'order_id' => $this->order->id,
            'customer_name' => $this->order->buyer->name,
            'total_amount' => $this->order->total_amount,
            'action_url' => '/seller/orders/'.$this->order->id,
        ];
    }
}
