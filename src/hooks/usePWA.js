import { useEffect, useState, useCallback } from "react";

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallPromptReady, setIsInstallPromptReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered", registration);
          setServiceWorkerReady(true);
        })
        .catch((error) => {
          console.error("Service Worker registration failed", error);
        });
    }

    // Listen for online/offline events
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    // Handle install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallPromptReady(true);
    });

    // Handle app installed
    window.addEventListener("appinstalled", () => {
      setIsAppInstalled(true);
      setIsInstallPromptReady(false);
    });

    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsAppInstalled(true);
        setIsInstallPromptReady(false);
      }

      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (serviceWorkerReady && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          ...options,
        });
      });
    }
  }, [serviceWorkerReady]);

  const storeOfflineData = useCallback((storeName, data) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("tictify", 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const addRequest = store.add(data);

        addRequest.onsuccess = () => {
          resolve(data);
        };

        addRequest.onerror = () => {
          reject(addRequest.error);
        };
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }, []);

  const getOfflineData = useCallback((storeName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("tictify", 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }, []);

  const requestBackgroundSync = useCallback((tag) => {
    if (serviceWorkerReady && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register(tag).catch((error) => {
          console.error("Background sync failed:", error);
        });
      });
    }
  }, [serviceWorkerReady]);

  return {
    isOnline,
    isInstallPromptReady,
    isAppInstalled,
    serviceWorkerReady,
    installApp,
    requestNotificationPermission,
    sendNotification,
    storeOfflineData,
    getOfflineData,
    requestBackgroundSync,
  };
};

export default usePWA;
