<?php

namespace App\Notifications;

use App\Models\SellerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSellerApplicationSubmitted extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('New Seller Application Submitted')
            ->greeting('Hello Admin,')
            ->line('A new seller/artisan application has been submitted and requires your review.')
            ->line('Applicant: '.$this->application->user->name)
            ->line('Email: '.$this->application->user->email)
            ->line('Business Type: '.($this->application->business_type ?: 'Not specified'))
            ->action('Review Application', route('admin.seller-applications.show', $this->application))
            ->line('Please review and take action on this application as soon as possible.')
            ->salutation('Best regards, The SupportLocal System');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Seller Application',
            'message' => $this->application->user->name.' has submitted a seller application for review.',
            'application_id' => $this->application->id,
            'applicant_name' => $this->application->user->name,
            'applicant_email' => $this->application->user->email,
            'business_type' => $this->application->business_type,
            'action_url' => route('admin.seller-applications.show', $this->application),
            'type' => 'new_seller_application',
        ];
    }
}
