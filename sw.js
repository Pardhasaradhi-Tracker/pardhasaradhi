const CACHE_NAME = 'pardhasaradhi-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — cache all app files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if(key !== CACHE_NAME){
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      if(response) return response;
      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Offline and not cached — return the main app for navigation requests
      if(event.request.mode === 'navigate'){
        return caches.match('/index.html');
      }
    })
  );
});
