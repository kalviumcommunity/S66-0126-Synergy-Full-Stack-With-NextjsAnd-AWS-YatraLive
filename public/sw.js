// Service Worker for offline support
const CACHE_NAME = 'train-tracker-v1';
const API_CACHE_NAME = 'train-tracker-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API requests - network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful API responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Static assets - cache first, network fallback
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// Background sync for offline events
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // Implement sync logic if needed
    console.log('Syncing favorites...');
}
