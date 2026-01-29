<?php

namespace App\Notifications;

use App\Models\CustomOrderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomOrderQuoteDeclined extends Notification
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
            ->subject('Quote Declined - '.$request->request_number)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Unfortunately, your quote has been declined by the customer.')
            ->line('**Request:** '.$request->title)
            ->line('**Your Quote:** ₱'.number_format($request->quoted_price, 2))
            ->when($request->rejection_reason, function ($message) use ($request) {
                return $message->line('**Reason:** '.$request->rejection_reason);
            })
            ->action('View Details', url('/seller/custom-orders/'.$request->id))
            ->line('Don\'t be discouraged! You can continue serving other customers.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $request = $this->getRequest();

        return [
            'title' => 'Quote Declined',
            'message' => ($request->buyer->name ?? 'Customer').' declined your quote for "'.$request->title.'".',
            'custom_order_request_id' => $request->id,
            'request_number' => $request->request_number,
            'buyer_name' => $request->buyer->name ?? 'Customer',
            'action_url' => '/seller/custom-orders/'.$request->id,
        ];
    }
}
