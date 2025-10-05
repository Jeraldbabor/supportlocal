<?php

namespace App\Notifications;

use App\Models\SellerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SellerApplicationRejected extends Notification implements ShouldQueue
{
    use Queueable;

    protected $application;

    /**
     * Create a new notification instance.
     */
    public function __construct(SellerApplication $application)
    {
        $this->application = $application;
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
        $message = (new MailMessage)
            ->subject('Update on Your Seller Application')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Thank you for your interest in becoming a seller on SupportLocal.')
            ->line('After careful review, we were unable to approve your seller application at this time.');

        if ($this->application->admin_notes) {
            $message->line('Feedback from our review team:')
                ->line('"'.$this->application->admin_notes.'"');
        }

        return $message
            ->line('You can submit a new application after addressing the feedback provided.')
            ->line('Your buyer account remains active and unaffected.')
            ->action('Submit New Application', route('seller.application.create'))
            ->line('If you have any questions, please don\'t hesitate to contact our support team.')
            ->salutation('Best regards, The SupportLocal Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Seller Application Update',
            'message' => 'Your seller application could not be approved at this time.',
            'application_id' => $this->application->id,
            'admin_notes' => $this->application->admin_notes,
            'action_url' => route('seller.application.create'),
            'type' => 'seller_application_rejected',
        ];
    }
}
