/* ── Web Push subscription helper ─────────────────────────────
   subscribeToPush("events")            → guest new-event alerts
   subscribeToPush("sales", getToken()) → organizer sale alerts
   Returns { ok, message }. Never throws.                       */

const API = import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function subscribeToPush(topic = "events", token = null) {
  try {
    if (!pushSupported()) {
      return { ok: false, message: "Notifications aren't supported on this browser." };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, message: "Notifications were blocked. You can enable them in your browser settings." };
    }

    // The SW only registers in production builds; register on demand here
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const keyRes = await fetch(`${API}/api/notifications/vapid-public-key`);
    if (!keyRes.ok) return { ok: false, message: "Notifications aren't available right now." };
    const { publicKey } = await keyRes.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const endpoint = topic === "sales" ? "subscribe-sales" : "subscribe";
    const res = await fetch(`${API}/api/notifications/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, message: body.message || "Subscription failed." };
    }

    return {
      ok: true,
      message:
        topic === "sales"
          ? "Sale alerts on — you'll get a push for every ticket sold 💰"
          : "You're in! We'll ping you when new events drop 🎉",
    };
  } catch (err) {
    console.error("Push subscribe failed:", err);
    return { ok: false, message: "Could not enable notifications." };
  }
}
