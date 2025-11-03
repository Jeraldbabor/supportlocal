import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './contexts/CartContext';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Wrapper component that provides CartContext to all pages
function AppShell({ Component, props }: { Component: React.ComponentType<Record<string, unknown>>; props: Record<string, unknown> }) {
    const isAuthenticated = !!props?.auth?.['user' as keyof typeof props.auth];

    return (
        <CartProvider isAuthenticated={isAuthenticated}>
            <Component {...props} />
        </CartProvider>
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Wrap App with our shell that includes CartProvider
        root.render(
            <App {...props}>
                {({ Component, props: pageProps }: { Component: React.ComponentType<Record<string, unknown>>; props: Record<string, unknown> }) => (
                    <AppShell Component={Component} props={pageProps} />
                )}
            </App>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
