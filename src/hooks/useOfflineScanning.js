import { useState, useCallback, useEffect } from "react";
import api from "../services/api";

export const useOfflineScanning = () => {
  const [scannedTickets, setScannedTickets] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    loadScannedTickets();

    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const loadScannedTickets = useCallback(async () => {
    try {
      const db = await openDatabase();
      const tickets = await getAllFromStore(db, "scanned-tickets");
      setScannedTickets(tickets);
    } catch (error) {
      console.error("Failed to load scanned tickets:", error);
    }
  }, []);

  const scanTicket = useCallback(
    async (qrData, eventId) => {
      try {
        if (isOnline) {
          // Try online verification first
          const response = await api.post("/api/v1/tickets/validate", {
            qrCode: qrData,
            eventId,
          });

          if (response.data.success) {
            return { success: true, offline: false, data: response.data.data };
          }
        } else {
          // Offline mode: save to local DB
          const ticket = {
            id: qrData,
            eventId,
            qrCode: qrData,
            scannedAt: new Date().toISOString(),
            synced: false,
          };

          await storeOfflineData("scanned-tickets", ticket);
          setScannedTickets((prev) => [...prev, ticket]);

          return {
            success: true,
            offline: true,
            data: { qrCode: qrData, message: "Ticket saved offline" },
          };
        }
      } catch (error) {
        if (!isOnline) {
          // If offline scan fails, save anyway
          const ticket = {
            id: qrData,
            eventId,
            qrCode: qrData,
            scannedAt: new Date().toISOString(),
            synced: false,
          };

          await storeOfflineData("scanned-tickets", ticket);
          setScannedTickets((prev) => [...prev, ticket]);

          return {
            success: true,
            offline: true,
            data: { qrCode: qrData },
          };
        }

        return {
          success: false,
          error: error.response?.data?.error?.message || "Scan failed",
        };
      }
    },
    [isOnline]
  );

  const syncScannedTickets = useCallback(async () => {
    if (!isOnline || scannedTickets.length === 0) {
      return { success: false, message: "No tickets to sync or offline" };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const unsyncedTickets = scannedTickets.filter((t) => !t.synced);

      for (const ticket of unsyncedTickets) {
        try {
          await api.post("/api/v1/tickets/sync-scanned", {
            qrCode: ticket.qrCode,
            eventId: ticket.eventId,
            scannedAt: ticket.scannedAt,
          });

          // Mark as synced
          const db = await openDatabase();
          ticket.synced = true;
          await updateInStore(db, "scanned-tickets", ticket);
        } catch (error) {
          console.error(`Failed to sync ticket ${ticket.id}:`, error);
          throw error;
        }
      }

      await loadScannedTickets();

      setIsSyncing(false);
      return {
        success: true,
        message: `Synced ${unsyncedTickets.length} tickets`,
      };
    } catch (error) {
      setSyncError(error.message);
      setIsSyncing(false);

      return {
        success: false,
        error: error.message,
      };
    }
  }, [isOnline, scannedTickets, loadScannedTickets]);

  const clearScannedTickets = useCallback(async () => {
    const db = await openDatabase();
    const store = db.transaction("scanned-tickets", "readwrite").objectStore(
      "scanned-tickets"
    );
    store.clear();
    setScannedTickets([]);
  }, []);

  return {
    scannedTickets,
    isOnline,
    isSyncing,
    syncError,
    scanTicket,
    syncScannedTickets,
    clearScannedTickets,
    loadScannedTickets,
  };
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tictify", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("scanned-tickets")) {
        db.createObjectStore("scanned-tickets", { keyPath: "id" });
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

function storeOfflineData(storeName, data) {
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
}

function updateInStore(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      resolve(data);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export default useOfflineScanning;
