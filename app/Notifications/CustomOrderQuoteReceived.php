<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomOrderQuoteReceived extends Notification
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
            ->subject('Quote Received for Your Custom Order - ' . $request->request_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Great news! ' . $sellerName . ' has sent you a quote for your custom order request.')
            ->line('**Request:** ' . $request->title)
            ->line('**Quoted Price:** ₱' . number_format($request->quoted_price, 2))
            ->line('**Estimated Delivery:** ' . $request->estimated_days . ' days')
            ->when($request->seller_notes, function ($message) use ($request) {
                return $message->line('**Seller Notes:** ' . $request->seller_notes);
            })
            ->action('Review Quote', url('/buyer/custom-orders/' . $request->id))
            ->line('Please review the quote and accept or decline it.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();
        $sellerName = $request->seller->business_name ?? $request->seller->name ?? 'Seller';

        return [
            'title' => 'Quote Received',
            'message' => $sellerName . ' quoted ₱' . number_format($request->quoted_price, 2) . ' for your custom order "' . $request->title . '".',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'quoted_price' => $request->quoted_price,
            'seller_name' => $sellerName,
            'action_url' => '/buyer/custom-orders/' . $request->id,
        ];
    }
}
