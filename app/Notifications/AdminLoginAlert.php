<?php

namespace App\Notifications;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminLoginAlert extends Notification
{
    protected User $admin;

    protected string $ipAddress;

    protected string $userAgent;

    protected string $loginTime;

    protected ?string $location;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $admin, string $ipAddress, string $userAgent)
    {
        $this->admin = $admin;
        $this->ipAddress = $ipAddress;
        $this->userAgent = $userAgent;
        $this->loginTime = now()->format('F j, Y g:i A');
        $this->location = $this->getLocationFromIp($ipAddress);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $siteName = Setting::get('site_name', config('app.name'));
        $deviceInfo = $this->parseUserAgent($this->userAgent);

        return (new MailMessage)
            ->subject("🔐 Admin Login Alert - {$siteName}")
            ->greeting('Admin Login Detected')
            ->line("An administrator account has just logged in to {$siteName}.")
            ->line('')
            ->line('**Login Details:**')
            ->line("• **Account:** {$this->admin->name} ({$this->admin->email})")
            ->line("• **Time:** {$this->loginTime}")
            ->line("• **IP Address:** {$this->ipAddress}")
            ->line("• **Device:** {$deviceInfo['device']}")
            ->line("• **Browser:** {$deviceInfo['browser']}")
            ->line("• **Platform:** {$deviceInfo['platform']}")
            ->when($this->location, function ($message) {
                return $message->line("• **Location:** {$this->location}");
            })
            ->line('')
            ->line('If this was you, no action is needed.')
            ->line('')
            ->line('**If this was NOT you:**')
            ->line('1. Change your password immediately')
            ->line('2. Review your account security settings')
            ->line('3. Check for any unauthorized changes')
            ->action('Go to Security Settings', url('/admin/security'))
            ->line('')
            ->salutation("Stay secure,\n{$siteName} Security Team");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'admin_id' => $this->admin->id,
            'admin_name' => $this->admin->name,
            'admin_email' => $this->admin->email,
            'ip_address' => $this->ipAddress,
            'login_time' => $this->loginTime,
        ];
    }

    /**
     * Parse user agent string to get device info
     */
    protected function parseUserAgent(string $userAgent): array
    {
        $device = 'Unknown Device';
        $browser = 'Unknown Browser';
        $platform = 'Unknown Platform';

        // Detect platform
        if (preg_match('/Windows/i', $userAgent)) {
            $platform = 'Windows';
            if (preg_match('/Windows NT 10/i', $userAgent)) {
                $platform = 'Windows 10/11';
            } elseif (preg_match('/Windows NT 6.3/i', $userAgent)) {
                $platform = 'Windows 8.1';
            } elseif (preg_match('/Windows NT 6.2/i', $userAgent)) {
                $platform = 'Windows 8';
            } elseif (preg_match('/Windows NT 6.1/i', $userAgent)) {
                $platform = 'Windows 7';
            }
        } elseif (preg_match('/Macintosh|Mac OS X/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $platform = 'Android';
        } elseif (preg_match('/iPhone|iPad|iPod/i', $userAgent)) {
            $platform = 'iOS';
        }

        // Detect browser
        if (preg_match('/Chrome\/[\d.]+/i', $userAgent) && ! preg_match('/Edg/i', $userAgent)) {
            preg_match('/Chrome\/([\d.]+)/i', $userAgent, $matches);
            $browser = 'Chrome '.($matches[1] ?? '');
        } elseif (preg_match('/Firefox\/[\d.]+/i', $userAgent)) {
            preg_match('/Firefox\/([\d.]+)/i', $userAgent, $matches);
            $browser = 'Firefox '.($matches[1] ?? '');
        } elseif (preg_match('/Safari\/[\d.]+/i', $userAgent) && ! preg_match('/Chrome/i', $userAgent)) {
            preg_match('/Version\/([\d.]+)/i', $userAgent, $matches);
            $browser = 'Safari '.($matches[1] ?? '');
        } elseif (preg_match('/Edg\/[\d.]+/i', $userAgent)) {
            preg_match('/Edg\/([\d.]+)/i', $userAgent, $matches);
            $browser = 'Edge '.($matches[1] ?? '');
        } elseif (preg_match('/Opera|OPR\/[\d.]+/i', $userAgent)) {
            $browser = 'Opera';
        }

        // Detect device type
        if (preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent)) {
            if (preg_match('/iPad/i', $userAgent)) {
                $device = 'Tablet (iPad)';
            } elseif (preg_match('/iPhone/i', $userAgent)) {
                $device = 'Mobile (iPhone)';
            } elseif (preg_match('/Android/i', $userAgent)) {
                $device = preg_match('/Mobile/i', $userAgent) ? 'Mobile (Android)' : 'Tablet (Android)';
            } else {
                $device = 'Mobile Device';
            }
        } else {
            $device = 'Desktop Computer';
        }

        return [
            'device' => $device,
            'browser' => trim($browser),
            'platform' => $platform,
        ];
    }

    /**
     * Get approximate location from IP address (basic implementation)
     */
    protected function getLocationFromIp(string $ip): ?string
    {
        // Skip for local/private IPs
        if (in_array($ip, ['127.0.0.1', '::1']) ||
            preg_match('/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/', $ip)) {
            return 'Local Network';
        }

        // You can integrate with a geolocation API here if needed
        // For now, return null (can be enhanced later)
        return null;
    }
}
