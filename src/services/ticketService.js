import { getToken } from "./authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/tickets`;

/* A network-level failure (no signal) is flagged so the caller can fall
   back to offline mode; a server verdict (used/wrong event) is a normal
   Error and must be shown as a denial, NOT treated as offline. */
function networkError(message) {
  const err = new Error(message || "You appear to be offline");
  err.offline = true;
  return err;
}

export async function scanTicket(code, eventId, opts = {}) {
  const token = getToken();

  let res;
  try {
    res = await fetch(`${API}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
        eventId,
        clientScanId: opts.clientScanId,
        deviceId: opts.deviceId,
      }),
    });
  } catch {
    // fetch itself threw → no connectivity
    throw networkError();
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw networkError();
  }

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}

/* Offline gate: cached guest list for local validation */
export async function fetchGateManifest(eventId) {
  const token = getToken();
  const res = await fetch(`${API}/gate/manifest/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    throw networkError();
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load manifest");
  return data;
}

/* Offline gate: replay queued admits, get per-item reconciliation */
export async function syncGateAdmits(eventId, admits) {
  const token = getToken();
  const res = await fetch(`${API}/gate/sync/${eventId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admits }),
  }).catch(() => {
    throw networkError();
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Sync failed");
  return data;
}
