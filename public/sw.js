// Service Worker for Support Local PWA
const CACHE_NAME = 'support-local-v3';

// Assets to cache on install (safe static shell only)
const PRECACHE_ASSETS = ['/favicon.svg', '/favicon.ico', '/manifest.json'];

function isStaticAssetRequest(requestUrl, request) {
    if (request.method !== 'GET') return false;
    if (!requestUrl.startsWith(self.location.origin)) return false;

    // Keep caching strictly to static files to avoid stale realtime data.
    if (requestUrl.includes('/build/')) return true;
    if (request.destination === 'style') return true;
    if (request.destination === 'script') return true;
    if (request.destination === 'image') return true;
    if (request.destination === 'font') return true;
    if (request.destination === 'manifest') return true;

    // Fallback extension check.
    const url = new URL(requestUrl);
    return /\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|eot|map|json)$/i.test(url.pathname);
}

// Install event - cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }),
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
                    .map((name) => caches.delete(name)),
            );
        }),
    );
    // Claim all clients immediately
    self.clients.claim();
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests.
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests.
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Always bypass SW cache for app/data requests.
    if (event.request.url.includes('/api/')) return;
    if (event.request.headers.get('X-Inertia')) return;
    if (event.request.url.includes('/buyer/')) return;
    if (event.request.url.includes('/seller/')) return;
    if (event.request.url.includes('/admin/')) return;
    if (event.request.url.includes('/chat')) return;
    if (event.request.url.includes('/orders')) return;
    if (event.request.url.includes('/notifications')) return;
    if (event.request.url.includes('/messages')) return;

    // For navigation requests, always try network first.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/').then((cachedPage) => {
                    if (cachedPage) {
                        return cachedPage;
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    });
                });
            }),
        );
        return;
    }

    // Do not cache dynamic data routes.
    if (!isStaticAssetRequest(event.request.url, event.request)) {
        return;
    }

    // For static assets, use stale-while-revalidate strategy.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Update cache with fresh response.
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
        }),
    );
});
