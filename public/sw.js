// My-Team Sports service worker — minimal, enables PWA install. No caching.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Network passthrough. The presence of this handler satisfies install criteria.
});
