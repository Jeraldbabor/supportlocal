<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCustomOrderRequest extends Notification
{
    use Queueable;

    protected $customOrderRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(CustomOrderRequest $customOrderRequest)
    {
        $this->customOrderRequest = $customOrderRequest;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the custom order request, reloading if needed for queued notifications
     */
    protected function getRequest()
    {
        if (is_numeric($this->customOrderRequest)) {
            return CustomOrderRequest::with('buyer')->findOrFail($this->customOrderRequest);
        }

        if ($this->customOrderRequest && $this->customOrderRequest->relationLoaded('buyer')) {
            return $this->customOrderRequest;
        }

        $requestId = $this->customOrderRequest->id ?? $this->customOrderRequest;
        return CustomOrderRequest::with('buyer')->findOrFail($requestId);
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $request = $this->getRequest();

        return (new MailMessage)
            ->subject('New Custom Order Request - ' . $request->request_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a new custom order request!')
            ->line('**Request:** ' . $request->title)
            ->line('**From:** ' . ($request->buyer->name ?? 'Customer'))
            ->line('**Budget:** ' . ($request->formatted_budget ?? 'Not specified'))
            ->line('**Quantity:** ' . $request->quantity)
            ->action('View Request Details', url('/seller/custom-orders/' . $request->id))
            ->line('Please review the request and provide a quote or respond to the customer.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();

        return [
            'title' => 'New Custom Order Request',
            'message' => 'You received a custom order request "' . $request->title . '" from ' . ($request->buyer->name ?? 'Customer') . '.',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'buyer_name' => $request->buyer->name ?? 'Customer',
            'action_url' => '/seller/custom-orders/' . $request->id,
        ];
    }
}
