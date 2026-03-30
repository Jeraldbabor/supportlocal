<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
        <meta name="color-scheme" content="light">

        {{-- Force light mode - prevent dark mode from being applied --}}
        <script>
            (function() {
                // Immediately remove dark class if it exists and force light mode
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';

                // Override any appearance settings to force light mode
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('appearance', 'light');
                }

                // Watch for any attempts to add dark class and remove it immediately
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (document.documentElement.classList.contains('dark')) {
                                document.documentElement.classList.remove('dark');
                                document.documentElement.style.colorScheme = 'light';
                            }
                        }
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            if (document.documentElement.style.colorScheme === 'dark') {
                                document.documentElement.style.colorScheme = 'light';
                            }
                        }
                    });
                });

                // Start observing for class and style changes
                observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });

                // Also prevent dark mode on any system theme changes
                if (window.matchMedia) {
                    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                    const handleChange = () => {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem('appearance', 'light');
                        }
                    };
                    mediaQuery.addEventListener('change', handleChange);
                }

                // Periodically check and remove dark class (as a safety net)
                setInterval(function() {
                    if (document.documentElement.classList.contains('dark')) {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                }, 100);
            })();
        </script>

        {{-- Inline style to set the HTML background color - always light mode --}}
        <style>
            html {
                background-color: oklch(1 0 0) !important;
                color-scheme: light !important;
            }

            html.dark {
                background-color: oklch(1 0 0) !important;
                color-scheme: light !important;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Favicon -->
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="alternate icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/favicon.svg">

        <!-- PWA Manifest -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#EA580C">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Support Local">
        <meta name="mobile-web-app-capable" content="yes">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        {{-- Service Worker Registration --}}
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

                    if (isLocalDev) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            registrations.forEach(function(registration) {
                                registration.unregister();
                            });
                        });
                        if ('caches' in window) {
                            caches.keys().then(function(cacheNames) {
                                cacheNames.forEach(function(cacheName) {
                                    caches.delete(cacheName);
                                });
                            });
                        }
                        return;
                    }

                    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function(registration) {
                        registration.update();
                        console.log('SW registered: ', registration.scope);
                    }).catch(function(error) {
                        console.log('SW registration failed: ', error);
                    });
                });
            }
        </script>
    </body>
</html>
