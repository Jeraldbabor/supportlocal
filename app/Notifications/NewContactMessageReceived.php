<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewContactMessageReceived extends Notification
{
    use Queueable;

    protected $contactMessage;

    /**
     * Create a new notification instance.
     */
    public function __construct(ContactMessage $contactMessage)
    {
        $this->contactMessage = $contactMessage;
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
            ->subject('New Contact Message Received')
            ->greeting('Hello Admin,')
            ->line('A new contact message has been received through the contact form.')
            ->line('From: '.$this->contactMessage->name)
            ->line('Email: '.$this->contactMessage->email)
            ->line('Subject: '.$this->contactMessage->subject)
            ->line('Message: '.substr($this->contactMessage->message, 0, 100).'...')
            ->action('View Message', route('admin.contact-messages.show', $this->contactMessage))
            ->line('Please review and respond to this message as soon as possible.')
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
            'title' => 'New Contact Message',
            'message' => $this->contactMessage->name.' sent a message: "'.substr($this->contactMessage->subject, 0, 50).'..."',
            'contact_message_id' => $this->contactMessage->id,
            'sender_name' => $this->contactMessage->name,
            'sender_email' => $this->contactMessage->email,
            'subject' => $this->contactMessage->subject,
            'action_url' => route('admin.contact-messages.show', $this->contactMessage),
            'type' => 'new_contact_message',
        ];
    }
}
