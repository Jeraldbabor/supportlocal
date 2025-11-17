<?php

namespace App\Notifications;

use App\Models\SellerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SellerApplicationApproved extends Notification implements ShouldQueue
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
            ->subject('🎉 Your Seller Application Has Been Approved!')
            ->greeting('Congratulations, '.$notifiable->name.'!')
            ->line('Your seller/artisan application has been approved and you now have seller privileges on SupportLocal.')
            ->line('Your buyer profile information, including your avatar and personal details, has been preserved in your new seller account.');

        if ($this->application->admin_notes) {
            $message->line('Message from our team:')
                ->line('"'.$this->application->admin_notes.'"');
        }

        return $message
            ->line('You can now:')
            ->line('• List and manage your products')
            ->line('• Process customer orders')
            ->line('• Access seller analytics and reports')
            ->line('• Manage your seller profile')
            ->action('Access Seller Dashboard', route('seller.dashboard'))
            ->line('Thank you for joining our community of local sellers and artisans!')
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
            'title' => 'Seller Application Approved',
            'message' => 'Your seller application has been approved! Your profile information has been preserved.',
            'application_id' => $this->application->id,
            'admin_notes' => $this->application->admin_notes,
            'action_url' => route('seller.dashboard'),
            'type' => 'seller_application_approved',
        ];
    }
}
