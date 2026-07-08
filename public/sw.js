const CACHE_NAME = "tictify-v1";
const RUNTIME_CACHE = "tictify-runtime-v1";
const OFFLINE_PAGE = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/logo.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error("Cache addAll error:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip API requests for now (handled separately)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Background Sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tickets") {
    event.waitUntil(syncScannedTickets());
  } else if (event.tag === "sync-data") {
    event.waitUntil(syncOfflineData());
  }
});

async function syncScannedTickets() {
  try {
    const db = await openDatabase();
    const scannedTickets = await getAllFromStore(db, "scanned-tickets");

    for (const ticket of scannedTickets) {
      try {
        await fetch("/api/v1/tickets/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticket),
        });

        await deleteFromStore(db, "scanned-tickets", ticket.id);
      } catch (error) {
        console.error("Sync error:", error);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

async function syncOfflineData() {
  try {
    const db = await openDatabase();
    const pendingActions = await getAllFromStore(db, "pending-actions");

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await deleteFromStore(db, "pending-actions", action.id);
        }
      } catch (error) {
        console.error("Action sync error:", error);
      }
    }
  } catch (error) {
    console.error("Offline data sync failed:", error);
    throw error;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tictify", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("scanned-tickets")) {
        db.createObjectStore("scanned-tickets", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("pending-actions")) {
        db.createObjectStore("pending-actions", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "_id" });
      }

      if (!db.objectStoreNames.contains("user-data")) {
        db.createObjectStore("user-data", { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: data.tag || "notification",
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        if (windowClients[i].url === urlToOpen) {
          return windowClients[i].focus();
        }
      }

      return clients.openWindow(urlToOpen);
    })
  );
});
