<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomOrderRejected extends Notification
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
            ->subject('Custom Order Request Update - '.$request->request_number)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We regret to inform you that '.$sellerName.' is unable to fulfill your custom order request at this time.')
            ->line('**Request:** '.$request->title)
            ->when($request->rejection_reason, function ($message) use ($request) {
                return $message->line('**Reason:** '.$request->rejection_reason);
            })
            ->action('Browse Other Artisans', url('/buyer/sellers'))
            ->line('Don\'t worry! There are many talented artisans on our platform who may be able to help you.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();
        $sellerName = $request->seller->business_name ?? $request->seller->name ?? 'Seller';

        return [
            'title' => 'Custom Order Request Declined',
            'message' => $sellerName.' was unable to accept your custom order request "'.$request->title.'".',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'seller_name' => $sellerName,
            'action_url' => '/buyer/custom-orders/'.$request->id,
        ];
    }
}
