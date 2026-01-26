import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'pusher'> | null;
    }
}

window.Pusher = Pusher;

// Helper to get fresh CSRF token - this is called dynamically for each auth request
const getCsrfToken = (): string => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

// Only initialize Echo if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

// Validate that credentials exist and are not template strings
const isValidPusherKey =
    pusherKey && typeof pusherKey === 'string' && pusherKey.length > 0 && !pusherKey.includes('${') && !pusherKey.includes('PUSHER_APP_KEY');
const isValidPusherCluster =
    pusherCluster &&
    typeof pusherCluster === 'string' &&
    pusherCluster.length > 0 &&
    !pusherCluster.includes('${') &&
    !pusherCluster.includes('pusher_app_cluster');

if (isValidPusherKey && isValidPusherCluster) {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        // Pass Pusher options as a single object to avoid deprecation warning
        Pusher: Pusher,
        wsHost: undefined,
        wsPort: undefined,
        wssPort: undefined,
        forceTLS: true,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        // Pusher-specific options
        cluster: pusherCluster,
        authEndpoint: '/broadcasting/auth',
        // Use authorizer function to get fresh CSRF token for each channel subscription
        // @ts-expect-error - authorizer callback type is intentionally simplified
        authorizer: (channel: { name: string }) => {
            return {
                authorize: (socketId: string, callback: (error: Error | null, authData?: { auth: string; channel_data?: string }) => void) => {
                    fetch('/broadcasting/auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                        },
                        body: JSON.stringify({
                            socket_id: socketId,
                            channel_name: channel.name,
                        }),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Unauthorized');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            callback(null, data);
                        })
                        .catch((error) => {
                            callback(error instanceof Error ? error : new Error(String(error)));
                        });
                },
            };
        },
    });
} else {
    // Set to null if Pusher is not configured
    window.Echo = null;
    if (process.env.NODE_ENV === 'development') {
        console.warn('Pusher credentials not found or invalid. Real-time features will be disabled.');
    }
}

export default window.Echo;
