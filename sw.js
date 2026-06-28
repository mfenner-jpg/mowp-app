const CACHE_VERSION = 'mowp-v2.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Files that rarely change
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Install
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate
self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== STATIC_CACHE)
          .map(key => caches.delete(key))

      );

    })

  );

  self.clients.claim();

});

// Fetch
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Always fetch fresh HTML pages
  if (
      event.request.mode === 'navigate' ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/'
  ) {

      event.respondWith(

          fetch(event.request)
            .then(response => {

                const copy = response.clone();

                caches.open(STATIC_CACHE)
                      .then(cache => cache.put(event.request, copy));

                return response;

            })
            .catch(() => caches.match(event.request))

      );

      return;

  }

  // Cache First for images, css, js

  event.respondWith(

      caches.match(event.request)
        .then(cached => {

            if (cached) return cached;

            return fetch(event.request)
                .then(response => {

                    if (!response || response.status !== 200)
                        return response;

                    const copy = response.clone();

                    caches.open(STATIC_CACHE)
                          .then(cache => cache.put(event.request, copy));

                    return response;

                });

        })

  );

});
