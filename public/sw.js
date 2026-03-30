// Service Worker for Support Local PWA
const CACHE_NAME = 'support-local-v2';

// Assets to cache on install (app shell)
const PRECACHE_ASSETS = [
    '/',
    '/favicon.svg',
    '/favicon.ico',
    '/manifest.json',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Claim all clients immediately
    self.clients.claim();
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Skip API requests - always go to network
    if (event.request.url.includes('/api/')) return;

    // For navigation requests, always try network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/') || new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable',
                });
            })
        );
        return;
    }

    // For static assets, use stale-while-revalidate strategy
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Update cache with fresh response
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Always return a valid Response object.
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                    });
                });

            return cachedResponse || fetchPromise;
        })
    );
});
