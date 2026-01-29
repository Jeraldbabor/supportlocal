<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomOrderStatusUpdated extends Notification
{
    use Queueable;

    protected $customOrderRequest;
    protected $customMessage;

    /**
     * Create a new notification instance.
     */
    public function __construct(CustomOrderRequest $customOrderRequest, string $customMessage = null)
    {
        $this->customOrderRequest = $customOrderRequest;
        $this->customMessage = $customMessage;
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
            return CustomOrderRequest::with('seller')->findOrFail($this->customOrderRequest);
        }

        if ($this->customOrderRequest && $this->customOrderRequest->relationLoaded('seller')) {
            return $this->customOrderRequest;
        }

        $requestId = $this->customOrderRequest->id ?? $this->customOrderRequest;
        return CustomOrderRequest::with('seller')->findOrFail($requestId);
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $request = $this->getRequest();
        $sellerName = $request->seller->business_name ?? $request->seller->name ?? 'Seller';

        return (new MailMessage)
            ->subject('Custom Order Update - ' . $request->request_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->customMessage ?? 'Your custom order has been updated.')
            ->line('**Request:** ' . $request->title)
            ->line('**Status:** ' . $request->status_label)
            ->line('**Artisan:** ' . $sellerName)
            ->action('View Details', url('/buyer/custom-orders/' . $request->id))
            ->line('Thank you for supporting local artisans!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();
        $sellerName = $request->seller->business_name ?? $request->seller->name ?? 'Seller';

        return [
            'title' => 'Custom Order Update',
            'message' => $this->customMessage ?? 'Your custom order "' . $request->title . '" status changed to ' . $request->status_label . '.',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'status' => $request->status,
            'status_label' => $request->status_label,
            'seller_name' => $sellerName,
            'action_url' => '/buyer/custom-orders/' . $request->id,
        ];
    }
}
