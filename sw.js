/** PWA: service worker minimal (kalim direkt i kërkesave, mundëson "Shto në ekranin kryesor"). */
self.addEventListener("install", function(event) {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
    event.respondWith(fetch(event.request));
});
