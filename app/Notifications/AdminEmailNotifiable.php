<?php

namespace App\Notifications;

use Illuminate\Notifications\Notifiable;

/**
 * A simple notifiable class that represents an email address.
 * Used for sending notifications to the admin email from settings.
 */
class AdminEmailNotifiable
{
    use Notifiable;

    protected string $email;

    public function __construct(string $email)
    {
        $this->email = $email;
    }

    /**
     * Route notifications for the mail channel.
     */
    public function routeNotificationForMail(): string
    {
        return $this->email;
    }
}
