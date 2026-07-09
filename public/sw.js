/* ═══════════════════════════════════════════════════════════
   Tictify Service Worker
   Caching philosophy (this app moves money — be conservative):
   - Hashed build assets (/assets/*)  → cache-first (immutable)
   - Images (logo, hero, QR pngs)     → cache-first
   - Ticket lookups (by-reference)    → network-first with cache
     fallback, so a guest's QR still opens at a venue with no
     signal once they've viewed it before
   - Every other /api/ request        → network ONLY (never cache
     payments, auth, dashboards)
   - Navigations                      → network-first, offline
     fallback to the cached app shell
═══════════════════════════════════════════════════════════ */
const VERSION = "tictify-v1";
const SHELL = ["/", "/manifest.webmanifest", "/logo.png", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never touch POST/PATCH (payments!)

  const url = new URL(request.url);

  /* Ticket data + QR images: network-first, cached fallback (offline QR) */
  if (
    url.pathname.includes("/api/tickets/by-reference/") ||
    url.pathname.includes("/api/tickets/qr/")
  ) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  /* All other API traffic: network only — never serve stale money data */
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) {
    return;
  }

  /* Hashed immutable build assets + images: cache-first */
  if (
    url.pathname.startsWith("/assets/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  /* SPA navigations: network-first, cached shell offline */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/")),
    );
  }
});

/* ── Web Push ────────────────────────────────────────────── */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Tictify", body: event.data?.text() || "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Tictify 🎟️", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
      vibrate: [80, 40, 80],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (new URL(win.url).origin === self.location.origin) {
          win.navigate(url);
          return win.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
