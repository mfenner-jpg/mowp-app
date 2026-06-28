// Meals on Wheels Pasco
// Service Worker
// Version 2.0.1

const CACHE_NAME = "mowp-v2.0.1";

const APP_FILES = [
    "/",
    "/index.html",
    "/manifest.json",
    "/favicon.png",
    "/icon-192.png",
    "/icon-512.png"
];

// Install

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))

    );

});

// Activate

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

        })

    );

    self.clients.claim();

});

// Fetch

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    const requestURL = new URL(event.request.url);

    // Always get newest HTML

    if (
        event.request.mode === "navigate" ||
        requestURL.pathname.endsWith(".html") ||
        requestURL.pathname === "/"
    ) {

        event.respondWith(

            fetch(event.request)

                .then(networkResponse => {

                    const copy = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, copy));

                    return networkResponse;

                })

                .catch(() => caches.match(event.request))

        );

        return;

    }

    // Cache images/css/js/fonts

    event.respondWith(

        caches.match(event.request)

            .then(cacheResponse => {

                if (cacheResponse) {

                    return cacheResponse;

                }

                return fetch(event.request)

                    .then(networkResponse => {

                        if (!networkResponse || networkResponse.status !== 200) {

                            return networkResponse;

                        }

                        const copy = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, copy));

                        return networkResponse;

                    });

            })

    );

});
