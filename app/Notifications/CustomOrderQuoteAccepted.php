<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomOrderQuoteAccepted extends Notification
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
            ->subject('Quote Accepted! - '.$request->request_number)
            ->greeting('Congratulations '.$notifiable->name.'!')
            ->line('Your quote has been accepted!')
            ->line('**Request:** '.$request->title)
            ->line('**Accepted Price:** ₱'.number_format($request->quoted_price, 2))
            ->line('**Customer:** '.($request->buyer->name ?? 'Customer'))
            ->action('Start Working', url('/seller/custom-orders/'.$request->id))
            ->line('You can now start working on this custom order. Update the status when you begin.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();

        return [
            'title' => 'Quote Accepted!',
            'message' => ($request->buyer->name ?? 'Customer').' accepted your quote of ₱'.number_format($request->quoted_price, 2).' for "'.$request->title.'".',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'quoted_price' => $request->quoted_price,
            'buyer_name' => $request->buyer->name ?? 'Customer',
            'action_url' => '/seller/custom-orders/'.$request->id,
        ];
    }
}
