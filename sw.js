/**
 * Service worker minimal — lejon "Instalo aplikacionin" në Chrome/Android
 * (PWA). Nuk bën cache të hartës; kërkesat kalojnë në rrjet si zakonisht.
 */
self.addEventListener("install", function(event) {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
    event.respondWith(fetch(event.request));
});
