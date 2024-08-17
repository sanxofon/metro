const CACHE_NAME = 'metronomo-cache-v7.5'; // Increment version with each update
const urlsToCache = [
  '/metro/',
  'index.html',
  'metro.js',
  'metro.css',
  'teclado.css',
  'teclado.js',
  'beats.js',
  'metro.jpg',
  'icon-192x192.png',
  'icon-512x512.png',
  'favicon.png'
];

self.addEventListener('install', event => {
  // Make sure the new service worker takes over immediately
  self.skipWaiting(); 

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches on activation
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME; // Delete any caches that don't match
        }).map(cacheName => {
          return caches.delete(cacheName); 
        })
      );
    })
  );

  // Take control of existing clients
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache if available
        }

        // Fetch from network if not in cache
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the new response (for safe requests)
            if (networkResponse && networkResponse.status === 200 && 
                event.request.method === 'GET') { 

              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => { 
            // Handle fetch errors (optional, but recommended)
            console.error('Fetch error:', error);
            // You could potentially return a fallback page here 
          });
      })
  );
});