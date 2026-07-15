/* ═══════════════════════════════════════════════════════════
   gateOffline.js — offline gate scanning support
   • tiny hand-rolled IndexedDB wrapper (NO deps; manifests can
     be large so we deliberately avoid localStorage)
   • per-device id, cached manifest, local optimistic admits,
     and a durable outbound queue for /gate/sync
   Every DB call guards quota / private-mode failures gracefully.
═══════════════════════════════════════════════════════════ */

const DB_NAME = "tictify-gate";
const DB_VERSION = 1;
const STORE = "events"; // one record per eventId: { eventId, manifest, queue }
const DEVICE_KEY = "tictify_gate_device_id";

/* ── Per-device id (persisted; survives reloads) ── */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked → ephemeral id (still works for this session)
    return `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function newScanId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `scan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* ── IndexedDB open (memoized) ── */
let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "eventId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
  });
  return dbPromise;
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

async function getRecord(eventId) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const r = tx(db, "readonly").get(eventId);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return null; // no IndexedDB → treat as empty cache
  }
}

async function putRecord(record) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const r = tx(db, "readwrite").put(record);
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
    return { ok: true };
  } catch (err) {
    // QuotaExceededError, private-mode, etc. — surface, never crash
    console.warn("Gate cache write failed:", err?.name || err);
    return { ok: false, error: err?.name || "WriteFailed" };
  }
}

/* ── Manifest cache ── */
export async function saveManifest(eventId, manifest) {
  const existing = (await getRecord(eventId)) || { eventId, queue: [] };
  const record = {
    eventId,
    manifest: {
      eventTitle: manifest.eventTitle || "",
      cancelled: Boolean(manifest.cancelled),
      generatedAt: manifest.generatedAt || new Date().toISOString(),
      // normalize + keep a mutable local admittedCount baseline
      tickets: (manifest.tickets || []).map((t) => ({
        reference: t.reference,
        qrCode: t.qrCode,
        guestName: t.guestName || "",
        ticketType: t.ticketType || "",
        groupSize: Math.max(1, t.groupSize || 1),
        admittedCount: t.admittedCount || 0,
        scanned: Boolean(t.scanned),
      })),
    },
    queue: existing.queue || [],
  };
  const res = await putRecord(record);
  return { ...res, record };
}

export async function loadCached(eventId) {
  return await getRecord(eventId);
}

/* ── Local (offline) scan against the cached manifest ──
   Returns { status: "VALID"|"USED"|"FAKE", guestName, ticketType,
             groupSize, remaining, admittedCount } */
function matchTicket(tickets, rawCode) {
  const code = String(rawCode || "").trim();
  if (!code) return null;
  let ref = null;
  let qr = code;
  if (code.toUpperCase().startsWith("TICKET:")) {
    ref = code.split(":")[1]?.trim() || null;
    qr = null; // legacy payload — match by reference only
  }
  const lc = code.toLowerCase();
  return (
    tickets.find(
      (t) =>
        (qr && t.qrCode === qr) ||
        (t.reference && t.reference.toLowerCase() === lc) ||
        (ref && t.reference && t.reference.toLowerCase() === ref.toLowerCase()),
    ) || null
  );
}

export async function localScan(eventId, rawCode, deviceId) {
  const record = await getRecord(eventId);
  if (!record?.manifest) {
    return { status: "FAKE", reason: "NO_MANIFEST", message: "No cached guest list — refresh while online first" };
  }
  if (record.manifest.cancelled) {
    return { status: "FAKE", reason: "CANCELLED", message: "This event was cancelled" };
  }

  const ticket = matchTicket(record.manifest.tickets, rawCode);
  if (!ticket) {
    return { status: "FAKE", reason: "NOT_FOUND", message: "Not in the guest list" };
  }

  const groupSize = Math.max(1, ticket.groupSize || 1);
  if ((ticket.admittedCount || 0) >= groupSize) {
    return {
      status: "USED",
      guestName: ticket.guestName,
      ticketType: ticket.ticketType,
      groupSize,
      admittedCount: ticket.admittedCount,
      remaining: 0,
    };
  }

  // Optimistic local admit
  ticket.admittedCount = (ticket.admittedCount || 0) + 1;
  if (ticket.admittedCount >= groupSize) ticket.scanned = true;

  const clientScanId = newScanId();
  record.queue = record.queue || [];
  record.queue.push({
    code: rawCode,
    clientScanId,
    at: new Date().toISOString(),
    deviceId,
    synced: false,
  });

  const saved = await putRecord(record);

  return {
    status: "VALID",
    guestName: ticket.guestName,
    ticketType: ticket.ticketType,
    groupSize,
    admittedCount: ticket.admittedCount,
    remaining: groupSize - ticket.admittedCount,
    clientScanId,
    cacheWarning: saved.ok ? null : "Couldn't save locally (storage full) — sync as soon as you're back online",
  };
}

/* ── Record a successful ONLINE admit locally so the baseline stays
   fresh and the same scan is never re-sent by a later flush. ── */
export async function recordOnlineAdmit(eventId, rawCode, clientScanId, deviceId, serverAdmittedCount) {
  const record = await getRecord(eventId);
  if (!record?.manifest) return;
  const ticket = matchTicket(record.manifest.tickets, rawCode);
  if (ticket) {
    ticket.admittedCount =
      typeof serverAdmittedCount === "number"
        ? serverAdmittedCount
        : (ticket.admittedCount || 0) + 1;
    const gs = Math.max(1, ticket.groupSize || 1);
    if (ticket.admittedCount >= gs) ticket.scanned = true;
  }
  record.queue = record.queue || [];
  record.queue.push({
    code: rawCode,
    clientScanId,
    at: new Date().toISOString(),
    deviceId,
    synced: true, // already on the server — never re-sent
  });
  await putRecord(record);
}

/* ── Queue helpers ── */
export async function pendingCount(eventId) {
  const record = await getRecord(eventId);
  return (record?.queue || []).filter((q) => !q.synced).length;
}

export async function getPending(eventId) {
  const record = await getRecord(eventId);
  return (record?.queue || []).filter((q) => !q.synced);
}

/* Mark items synced by clientScanId after a successful /sync round-trip */
export async function markSynced(eventId, clientScanIds = []) {
  const record = await getRecord(eventId);
  if (!record) return;
  const ids = new Set(clientScanIds);
  for (const q of record.queue || []) {
    if (ids.has(q.clientScanId)) q.synced = true;
  }
  await putRecord(record);
}
