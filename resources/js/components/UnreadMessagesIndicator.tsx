import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchWithCsrf } from '@/lib/csrf';
import { router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UnreadMessagesIndicatorProps {
    initialCount?: number;
    showText?: boolean;
    variant?: 'icon' | 'button';
    className?: string;
}

export default function UnreadMessagesIndicator({
    initialCount = 0,
    showText = false,
    variant = 'icon',
    className = '',
}: UnreadMessagesIndicatorProps) {
    const [unreadCount, setUnreadCount] = useState(initialCount);

    // Subscribe to real-time updates for unread count
    useEffect(() => {
        // This would require additional backend implementation
        // For now, it just uses the initial count

        // Optional: Poll for unread count updates
        const interval = setInterval(async () => {
            try {
                const response = await fetchWithCsrf('/api/chat/unread-count');
                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.count);
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        router.visit('/chat');
    };

    if (variant === 'button') {
        return (
            <Button onClick={handleClick} variant="ghost" className={className}>
                <MessageSquare className="mr-2 h-5 w-5" />
                {showText && 'Messages'}
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                    </Badge>
                )}
            </Button>
        );
    }

    return (
        <Button onClick={handleClick} variant="ghost" size="icon" className={`relative ${className}`}>
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full px-1.5 text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
            )}
            <span className="sr-only">{unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}</span>
        </Button>
    );
}
