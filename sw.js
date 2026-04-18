/**
 * PWA + bypass ERR_NGROK_6024 (free-plan interstitial): shton header-in që kërkon ngrok
 * për kërkesa programatike. Shiko: https://ngrok.com/docs/errors/err_ngrok_6024/
 */
self.addEventListener("install", function(event) {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

function isNgrokHost(url) {
    try {
        var u = typeof url === "string" ? url : url.url;
        return (
            u.indexOf("ngrok-free.dev") !== -1 ||
            u.indexOf("ngrok-free.app") !== -1 ||
            u.indexOf("ngrok.io") !== -1
        );
    } catch (e) {
        return false;
    }
}

self.addEventListener("fetch", function(event) {
    var req = event.request;
    if (!isNgrokHost(req.url)) {
        event.respondWith(fetch(req));
        return;
    }
    try {
        var headers = new Headers(req.headers);
        headers.set("ngrok-skip-browser-warning", "true");
        event.respondWith(
            fetch(new Request(req, { headers: headers, redirect: "follow" }))
        );
    } catch (e) {
        event.respondWith(fetch(req));
    }
});
