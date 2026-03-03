import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import React from 'react';
import { createRoot } from 'react-dom/client';
import PageLoader from './components/PageLoader';
import { CartProvider } from './contexts/CartContext';
import { initializeTheme } from './hooks/use-appearance';
import Echo from './lib/echo'; // Initialize Echo for real-time features

// Re-establish Echo connections after Inertia navigation
// This ensures WebSocket channels are properly re-authenticated with fresh CSRF tokens
router.on('navigate', () => {
    if (Echo && Echo.connector && Echo.connector.pusher) {
        // Force reconnection to re-authenticate channels with fresh CSRF token
        const pusher = Echo.connector.pusher;

        // If the connection is in a bad state, reconnect
        if (pusher.connection.state !== 'connected') {
            pusher.connect();
        }
    }
});

// Wrapper component that provides CartContext to all pages
function AppShell({ Component, props }: { Component: React.ComponentType<Record<string, unknown>>; props: Record<string, unknown> }) {
    const isAuthenticated = !!props?.auth?.['user' as keyof typeof props.auth];

    return (
        <CartProvider isAuthenticated={isAuthenticated}>
            <PageLoader>
                <Component {...props} />
            </PageLoader>
        </CartProvider>
    );
}

const appName = 'Support Local Hinoba-an';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Wrap App with our shell that includes CartProvider and PageLoader
        root.render(
            <App {...props}>
                {({ Component, props: pageProps }: { Component: React.ComponentType<Record<string, unknown>>; props: Record<string, unknown> }) => (
                    <AppShell Component={Component} props={pageProps} />
                )}
            </App>,
        );
    },
    progress: {
        color: '#EA580C', // Orange-600 to match brand
    },
});

// This will set light / dark mode on load...
initializeTheme();
