import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo | null;
    }
}

window.Pusher = Pusher;

// Only initialize Echo if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

// Validate that credentials exist and are not template strings
const isValidPusherKey = pusherKey && typeof pusherKey === 'string' && pusherKey.length > 0 && !pusherKey.includes('${') && !pusherKey.includes('PUSHER_APP_KEY');
const isValidPusherCluster = pusherCluster && typeof pusherCluster === 'string' && pusherCluster.length > 0 && !pusherCluster.includes('${') && !pusherCluster.includes('pusher_app_cluster');

if (isValidPusherKey && isValidPusherCluster) {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        forceTLS: true,
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
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
