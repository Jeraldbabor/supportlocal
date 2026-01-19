<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageReply extends Mailable
{
    use Queueable, SerializesModels;

    public $contactMessage;

    public $replyMessage;

    public $adminName;

    /**
     * Create a new message instance.
     */
    public function __construct(ContactMessage $contactMessage, string $replyMessage, string $adminName)
    {
        $this->contactMessage = $contactMessage;
        $this->replyMessage = $replyMessage;
        $this->adminName = $adminName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'Re: '.$this->contactMessage->subject;

        return new Envelope(
            subject: $subject,
            replyTo: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-message-reply',
            with: [
                'contactMessage' => $this->contactMessage,
                'replyMessage' => $this->replyMessage,
                'adminName' => $this->adminName,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
