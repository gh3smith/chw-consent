/* Offline cache for CHW Consent. Bump VERSION whenever any file changes so phones pick up the update. */
const VERSION = "chw-consent-v4";
const FILES = [
  "./", "./index.html", "./core.js", "./pdf-lib.min.js", "./zxing.min.js", "./consent_form.pdf", "./form-preview.jpg",
  "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
