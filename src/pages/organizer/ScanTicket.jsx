/* ═══════════════════════════════════════════════════════════
   ScanTicket.jsx — Tictify 2026 Organizer Ops
   Syne + DM Sans · ink #080910 · gold #E8C96A
   Scanner lifecycle (html5-qrcode) untouched — design wraps it.
═══════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  scanTicket,
  fetchGateManifest,
  syncGateAdmits,
} from "../../services/ticketService";
import {
  getDeviceId,
  newScanId,
  saveManifest,
  loadCached,
  localScan,
  recordOnlineAdmit,
  pendingCount,
  getPending,
  markSynced,
} from "../../services/gateOffline";
import { getToken } from "../../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Nav icons (inline, dependency-free) ─────────────────── */

const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/organizer/dashboard", icon: "grid" },
  { key: "create", label: "Create Event", to: "/organizer/create-event", icon: "plusCircle" },
  { key: "events", label: "My Events", to: "/organizer/events", icon: "calendar" },
  { key: "sales", label: "Sales", to: "/organizer/sales", icon: "bars" },
  { key: "scan", label: "Scan Tickets", to: "/organizer/scan/select", icon: "qr" },
  { key: "withdraw", label: "Withdraw", to: "/organizer/withdraw", icon: "wallet" },
];

/* ── App shell: sidebar ≥1024px, blurred top bar below ───── */
function Shell({ active, title, subtitle, children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navButtons = (cls) =>
    NAV.map((item) => (
      <button
        key={item.key}
        className={`${cls} ${active === item.key ? "is-active" : ""}`}
        onClick={() => go(item.to)}
      >
        <Icon name={item.icon} />
        <span>{item.label}</span>
      </button>
    ));

  return (
    <div className="sct-app">
      <aside className="sct-sidebar">
        <button className="sct-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <nav className="sct-nav">{navButtons("sct-nav-item")}</nav>
      </aside>

      <header className="sct-topbar">
        <button className="sct-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <button
          className={`sct-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`sct-drawer ${menuOpen ? "is-open" : ""}`}>
        {navButtons("sct-drawer-item")}
      </div>

      <main className="sct-main">
        <div className="sct-head">
          <h1 className="sct-title">{title}</h1>
          {subtitle && <p className="sct-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

export default function ScanTicket() {
  injectStyles("tictify-scan-ticket-css", CSS);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event");

  const qrRegionId = "qr-reader";
  const scannerRef = useRef(null);
  const activeScanRef = useRef(false);
  const deviceIdRef = useRef(getDeviceId());
  const flushingRef = useRef(false);

  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modal, setModal] = useState(null);
  const [gate, setGate] = useState(null);

  /* ── Offline state ── */
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [manifestState, setManifestState] = useState("idle"); // idle|loading|ready|error
  const [manifestInfo, setManifestInfo] = useState(null); // { eventTitle, count, generatedAt }
  const [queued, setQueued] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState(null); // { synced, conflicts:[...] }

  async function refreshQueued() {
    if (!eventId) return;
    try {
      setQueued(await pendingCount(eventId));
    } catch {
      /* ignore */
    }
  }

  /* ── Pull the manifest and cache it for offline use ── */
  async function loadManifest({ silent = false } = {}) {
    if (!eventId) return;
    if (!silent) setManifestState("loading");
    try {
      const data = await fetchGateManifest(eventId);
      const { record } = await saveManifest(eventId, data);
      setManifestInfo({
        eventTitle: data.eventTitle,
        count: (data.tickets || []).length,
        generatedAt: record?.manifest?.generatedAt,
      });
      setManifestState("ready");
    } catch (err) {
      // Network failure → fall back to whatever we cached earlier
      const cached = await loadCached(eventId);
      if (cached?.manifest) {
        setManifestInfo({
          eventTitle: cached.manifest.eventTitle,
          count: (cached.manifest.tickets || []).length,
          generatedAt: cached.manifest.generatedAt,
        });
        setManifestState("ready");
        if (err.offline) setOnline(false);
      } else {
        setManifestState("error");
      }
    }
  }

  /* ── Flush queued offline admits to the server, reconcile ── */
  async function flushQueue({ announce = true } = {}) {
    if (!eventId || flushingRef.current) return;
    let pending;
    try {
      pending = await getPending(eventId);
    } catch {
      return;
    }
    if (!pending.length) {
      await refreshQueued();
      return;
    }

    flushingRef.current = true;
    setSyncing(true);
    try {
      const resp = await syncGateAdmits(
        eventId,
        pending.map((p) => ({
          code: p.code,
          clientScanId: p.clientScanId,
          at: p.at,
          deviceId: p.deviceId,
        })),
      );
      const results = resp.results || [];
      // admitted + already are both durably recorded server-side
      const done = results
        .filter((r) => r.result === "admitted" || r.result === "already")
        .map((r) => r.clientScanId);
      await markSynced(eventId, done);

      // A conflict = this device admitted the guest offline, but the
      // server refused (another device/online already took the seat).
      const conflicts = results
        .filter((r) => r.result === "denied")
        .map((r) => {
          const src = pending.find((p) => p.clientScanId === r.clientScanId);
          return { code: r.code || src?.code, reason: r.reason, message: r.message };
        });

      setOnline(true);
      await loadManifest({ silent: true }); // pull authoritative counts back
      await refreshQueued();
      if (announce) {
        setSyncSummary({
          synced: done.length,
          denied: results.filter((r) => r.result === "denied").length,
          conflicts,
        });
      }
    } catch (err) {
      if (err.offline) setOnline(false);
      // leave the queue intact; it retries on next reconnect
    } finally {
      flushingRef.current = false;
      setSyncing(false);
    }
  }

  /* ================= LIVE GATE STATS ================= */
  async function fetchGate() {
    if (!eventId) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/gate/${eventId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) return; // keep last values
      const data = await res.json();
      setGate(data);
    } catch {
      /* silent — keep last values */
    }
  }

  useEffect(() => {
    if (!eventId) return;
    fetchGate();
    const interval = setInterval(fetchGate, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!eventId) {
      navigate("/organizer/scan/select", { replace: true });
    }
  }, [eventId, navigate]);

  /* ================= ARM OFFLINE GATE ================= */
  useEffect(() => {
    if (!eventId) return;
    loadManifest();
    refreshQueued();
    flushQueue({ announce: false }); // clear any leftover queue on entry

    const goOnline = () => {
      setOnline(true);
      flushQueue({ announce: true });
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  /* ================= START CAMERA ================= */
  const startCamera = async () => {
    if (scanning || processing) return;

    try {
      const scanner = new Html5Qrcode(qrRegionId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        throw new Error("No camera available on this device");
      }

      // 🔑 Always prefer back camera
      const camera =
        cameras.find((c) =>
          /back|rear|environment/i.test(c.label),
        ) || cameras[cameras.length - 1];

      setScanning(true);
      activeScanRef.current = true;

      await scanner.start(
        camera.id,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
          disableFlip: true,
        },
        async (decodedText) => {
          if (!activeScanRef.current || processing) return;
          activeScanRef.current = false;
          await handleScan(decodedText);
        },
      );
    } catch (err) {
      await stopCamera();
      setModal({
        type: "error",
        message:
          "Camera permission denied or unavailable. Please allow camera access or use manual entry.",
      });
    }
  };

  /* ================= STOP CAMERA ================= */
  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {}
    scannerRef.current = null;
    setScanning(false);
    activeScanRef.current = false;
  };

  /* ── Offline validation against the cached manifest ── */
  async function doOfflineScan(code) {
    const r = await localScan(eventId, code, deviceIdRef.current);
    await refreshQueued();

    if (r.status === "VALID") {
      const groupInfo =
        r.groupSize > 1
          ? ` · ${r.remaining} of ${r.groupSize} entries left`
          : "";
      setModal({
        type: "success",
        offline: true,
        message: `${r.guestName || "Guest"} admitted${groupInfo}${
          r.cacheWarning ? ` — ${r.cacheWarning}` : ""
        }`,
      });
    } else if (r.status === "USED") {
      setModal({
        type: "error",
        offline: true,
        message: `Already admitted — all ${r.groupSize} on this ticket are in${
          r.guestName ? ` (${r.guestName})` : ""
        }`,
      });
      activeScanRef.current = true;
    } else {
      setModal({
        type: "error",
        offline: true,
        message: `Not valid — ${r.message || "this code isn't in the guest list"}`,
      });
      activeScanRef.current = true;
    }
    await stopCamera();
  }

  /* ================= SCAN HANDLER ================= */
  async function handleScan(code) {
    setProcessing(true);
    const trimmed = code.trim();

    // Offline (known or last-known) → validate locally, queue for sync
    if (!online) {
      try {
        await doOfflineScan(trimmed);
      } finally {
        setTimeout(() => setProcessing(false), 900);
      }
      return;
    }

    const clientScanId = newScanId();
    try {
      const res = await scanTicket(trimmed, eventId, {
        clientScanId,
        deviceId: deviceIdRef.current,
      });

      // keep the local manifest baseline fresh + never re-send this scan
      await recordOnlineAdmit(
        eventId,
        trimmed,
        clientScanId,
        deviceIdRef.current,
        res.admitted,
      );
      await refreshQueued();

      const groupInfo =
        res.groupSize > 1
          ? ` · ${res.remaining} of ${res.groupSize} entries left on this ticket`
          : "";

      setModal({
        type: "success",
        message: `${res.message || "Ticket verified successfully"}${
          res.attendee ? ` — ${res.attendee}` : ""
        }${groupInfo}`,
      });

      await stopCamera();
      fetchGate();
    } catch (err) {
      if (err.offline) {
        // Lost signal mid-scan → seamlessly fall back to offline
        setOnline(false);
        try {
          await doOfflineScan(trimmed);
        } finally {
          setTimeout(() => setProcessing(false), 900);
        }
        return;
      }
      // A real server verdict (used / wrong event / cancelled)
      setModal({
        type: "error",
        message: err.message || "Invalid, used, or wrong event ticket",
      });
      activeScanRef.current = true;
    } finally {
      setTimeout(() => setProcessing(false), 1200);
    }
  }

  /* ================= MANUAL ENTRY ================= */
  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode || processing) return;
    await handleScan(manualCode);
    setManualCode("");
  }

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Shell
      active="scan"
      title="Scan Tickets"
      subtitle="Point the camera at a guest's QR code to validate entry"
    >
      {modal && (
        <Modal {...modal} onClose={() => setModal(null)} />
      )}

      {processing && (
        <div className="sct-overlay">
          <div className="sct-processing">
            <div className="sct-spinner" />
            <p>Verifying ticket…</p>
          </div>
        </div>
      )}

      {syncSummary && (
        <SyncSummary {...syncSummary} onClose={() => setSyncSummary(null)} />
      )}

      <div className="sct-stage">
        {!online && (
          <div className="sct-offline-banner" role="status">
            <span className="sct-offline-dot" aria-hidden="true" />
            <span>
              <strong>OFFLINE</strong> — validating from the cached guest list.
              {queued > 0 ? ` ${queued} admit${queued === 1 ? "" : "s"} queued to sync.` : ""}
            </span>
          </div>
        )}

        {online && queued > 0 && (
          <div className="sct-sync-strip" role="status">
            <span>
              {syncing
                ? "Syncing queued admits…"
                : `${queued} offline admit${queued === 1 ? "" : "s"} waiting to sync`}
            </span>
            <button
              className="sct-mini-btn"
              onClick={() => flushQueue({ announce: true })}
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
        )}

        <div className="sct-manifest-row">
          <span className="sct-manifest-status">
            {manifestState === "loading" && "Loading guest list…"}
            {manifestState === "ready" && manifestInfo && (
              <>
                <Icon name="check" /> {manifestInfo.count} tickets cached for
                offline
              </>
            )}
            {manifestState === "error" && (
              <>
                <Icon name="alert" /> No cached guest list — connect once to
                enable offline
              </>
            )}
            {manifestState === "idle" && ""}
          </span>
          <button
            className="sct-mini-btn"
            onClick={() => loadManifest()}
            disabled={manifestState === "loading" || !online}
            title={online ? "Refresh cached guest list" : "Reconnect to refresh"}
          >
            Refresh list
          </button>
        </div>

        {gate && (
          <section className="sct-gate" aria-live="polite">
            <div className="sct-gate-top">
              <span className="sct-gate-live">
                <span className="sct-gate-dot" aria-hidden="true" />
                Live gate
              </span>
              <span className="sct-gate-nums">
                <strong>{Number(gate.guestsAdmitted ?? 0).toLocaleString()}</strong>
                <em>/ {Number(gate.guestsExpected ?? 0).toLocaleString()}</em>
              </span>
            </div>
            <div className="sct-gate-bar">
              <div
                className="sct-gate-fill"
                style={{
                  width: `${
                    Number(gate.guestsExpected) > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (Number(gate.guestsAdmitted ?? 0) /
                              Number(gate.guestsExpected)) *
                              100,
                          ),
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="sct-gate-caption">
              {Number(gate.guestsRemaining ?? 0).toLocaleString()} still outside
            </p>
          </section>
        )}

        <section className="sct-scanner-card">
          <div className={`sct-viewport ${scanning ? "is-scanning" : ""}`}>
            <div
              id={qrRegionId}
              className="sct-camera"
            />

            {/* Decorative frame — never intercepts the scanner */}
            <div className="sct-frame" aria-hidden="true">
              <span className="sct-corner is-tl" />
              <span className="sct-corner is-tr" />
              <span className="sct-corner is-bl" />
              <span className="sct-corner is-br" />
              <span className="sct-scanline" />
              {!scanning && (
                <div className="sct-idle">
                  <Icon name="qr" />
                  <p>Camera is off</p>
                </div>
              )}
            </div>
          </div>

          {!scanning ? (
            <button
              className="sct-btn sct-btn-gold"
              onClick={startCamera}
            >
              Start Camera Scan
            </button>
          ) : (
            <button
              className="sct-btn sct-btn-stop"
              onClick={stopCamera}
            >
              Stop Camera
            </button>
          )}
        </section>

        <div className="sct-divider">
          <span>OR</span>
        </div>

        <form
          onSubmit={handleManualSubmit}
          className="sct-form"
        >
          <label className="sct-label" htmlFor="sct-manual">Manual entry</label>
          <input
            id="sct-manual"
            className="sct-input"
            placeholder="Enter ticket code manually"
            value={manualCode}
            onChange={(e) =>
              setManualCode(e.target.value)
            }
          />
          <button className="sct-btn sct-btn-ghost">
            Verify Code
          </button>
        </form>

        <p className="sct-note">
          <Icon name="info" /> <strong>Offline mode</strong> validates against the guest list cached on
          this device. It can't stop two phones that are both offline from admitting
          the same single-entry ticket — any such clashes are flagged here the moment
          the devices sync.
        </p>
      </div>
    </Shell>
  );
}

/* ================= SYNC SUMMARY / CONFLICTS ================= */
function SyncSummary({ synced, conflicts = [], onClose }) {
  const hasConflicts = conflicts.length > 0;
  return (
    <div className="sct-overlay">
      <div className={`sct-modal ${hasConflicts ? "is-error" : "is-success"}`}>
        <div className="sct-modal-icon" aria-hidden="true">
          {hasConflicts ? (
            <Icon name="alertTriangle" />
          ) : (
            <Icon name="check" />
          )}
        </div>
        <h3>{hasConflicts ? "Synced with conflicts" : "All synced"}</h3>
        <p>
          {synced} offline admit{synced === 1 ? "" : "s"} synced to the server.
          {hasConflicts
            ? ` ${conflicts.length} could NOT be admitted — another device or an online scan already took ${conflicts.length === 1 ? "that seat" : "those seats"}:`
            : " Everything reconciled cleanly."}
        </p>
        {hasConflicts && (
          <ul className="sct-conflicts">
            {conflicts.map((c, i) => (
              <li key={i}>
                <code>{String(c.code || "").slice(0, 22)}</code> — {c.message || c.reason}
              </li>
            ))}
          </ul>
        )}
        <button className="sct-btn sct-btn-gold" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ type, message, offline, onClose }) {
  return (
    <div className="sct-overlay">
      <div className={`sct-modal ${type === "error" ? "is-error" : "is-success"}`}>
        <div className="sct-modal-icon" aria-hidden="true">
          {type === "error" ? (
            <Icon name="close" />
          ) : (
            <Icon name="check" />
          )}
        </div>
        {offline && <span className="sct-modal-tag">OFFLINE CHECK</span>}
        <h3>
          {type === "error"
            ? "Access Denied"
            : "Access Granted"}
        </h3>
        <p>{message}</p>
        <button
          className="sct-btn sct-btn-gold"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.18);
  --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22);
  --text:#F0EDE8; --muted:#8B887E; --danger:#E05C5C; --live:#6BF0A0;
  --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  --r:20px; --r-sm:12px;
}
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }
input { font-family:var(--font-b); }

@keyframes sctSpin { to { transform:rotate(360deg); } }
@keyframes sctFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
@keyframes sctScanline { 0% { top:10%; } 50% { top:88%; } 100% { top:10%; } }
@keyframes sctCornerPulse { 0%,100% { opacity:.55; } 50% { opacity:1; } }

/* ── Shell ── */
.sct-app { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.sct-sidebar { position:sticky; top:0; height:100svh; width:250px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:26px 16px; display:flex; flex-direction:column; }
.sct-wordmark { font-family:var(--font-h); font-weight:800; font-size:23px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:2px 12px; }
.sct-wordmark span { color:var(--gold); }
.sct-sidebar .sct-wordmark { margin-bottom:30px; }
.sct-nav { display:flex; flex-direction:column; gap:4px; }
.sct-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:11px 14px; background:none; border:none; border-radius:var(--r-sm); color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.sct-nav-item svg { width:19px; height:19px; flex-shrink:0; }
.sct-nav-item:hover { color:var(--text); background:var(--card); }
.sct-nav-item.is-active { color:var(--gold); background:var(--gold-dim); }
.sct-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

.sct-topbar { display:none; }
.sct-burger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:12px; }
.sct-burger span { display:block; width:18px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.sct-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.sct-burger.is-open span:nth-child(2) { opacity:0; }
.sct-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.sct-drawer { display:none; }

.sct-main { flex:1; min-width:0; padding:clamp(16px,3vw,40px); }
.sct-head { margin-bottom:clamp(22px,4vw,34px); }
.sct-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,4vw,34px); letter-spacing:-.02em; }
.sct-subtitle { color:var(--muted); font-size:14.5px; margin-top:7px; line-height:1.6; }

@keyframes sctGatePulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(107,240,160,.45); } 50% { opacity:.55; box-shadow:0 0 0 5px rgba(107,240,160,0); } }

/* ── Live gate strip ── */
.sct-gate { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(14px,3vw,18px) clamp(16px,3vw,20px); margin-bottom:16px; }
.sct-gate-top { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.sct-gate-live { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--live); }
.sct-gate-dot { width:8px; height:8px; border-radius:50%; background:var(--live); animation:sctGatePulse 1.8s ease-in-out infinite; }
.sct-gate-nums { font-family:var(--font-h); font-variant-numeric:tabular-nums; display:inline-flex; align-items:baseline; gap:5px; }
.sct-gate-nums strong { font-weight:800; font-size:clamp(20px,4vw,26px); color:var(--text); letter-spacing:-.01em; }
.sct-gate-nums em { font-style:normal; font-weight:600; font-size:14px; color:var(--muted); }
.sct-gate-bar { height:6px; margin-top:12px; background:rgba(255,255,255,.08); border-radius:99px; overflow:hidden; }
.sct-gate-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#E8C96A,#F5E196); box-shadow:0 0 12px var(--gold-glo); transition:width .6s ease; }
.sct-gate-caption { margin-top:9px; font-size:12.5px; color:var(--muted); font-variant-numeric:tabular-nums; }

/* ── Scanner stage ── */
.sct-stage { max-width:460px; animation:sctFadeUp .4s ease; }
.sct-scanner-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(14px,3vw,20px); }
.sct-viewport { position:relative; border-radius:var(--r-sm); overflow:hidden; background:#000; }
.sct-camera { width:100%; min-height:320px; background:#000; }
.sct-camera video { display:block; }

.sct-frame { position:absolute; inset:0; pointer-events:none; z-index:6; }
.sct-corner { position:absolute; width:34px; height:34px; border:3px solid var(--gold); animation:sctCornerPulse 2.6s ease-in-out infinite; }
.sct-corner.is-tl { top:12px; left:12px; border-right:none; border-bottom:none; border-top-left-radius:10px; }
.sct-corner.is-tr { top:12px; right:12px; border-left:none; border-bottom:none; border-top-right-radius:10px; }
.sct-corner.is-bl { bottom:12px; left:12px; border-right:none; border-top:none; border-bottom-left-radius:10px; }
.sct-corner.is-br { bottom:12px; right:12px; border-left:none; border-top:none; border-bottom-right-radius:10px; }
.sct-scanline { position:absolute; left:10%; right:10%; top:10%; height:2px; border-radius:2px; background:linear-gradient(90deg, transparent, var(--gold), transparent); box-shadow:0 0 14px var(--gold-glo); opacity:0; }
.sct-viewport.is-scanning .sct-scanline { opacity:1; animation:sctScanline 2.6s ease-in-out infinite; }
.sct-idle { position:absolute; inset:0; display:grid; place-content:center; justify-items:center; gap:12px; color:var(--muted); }
.sct-idle svg { width:44px; height:44px; opacity:.5; }
.sct-idle p { font-size:13px; letter-spacing:.04em; }

/* ── Buttons / form ── */
.sct-btn { width:100%; padding:14px 24px; border-radius:999px; border:1px solid transparent; font-weight:700; font-size:14.5px; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; }
.sct-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); }
.sct-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.sct-btn-stop { background:rgba(224,92,92,.12); border-color:rgba(224,92,92,.4); color:var(--danger); }
.sct-btn-stop:hover { background:rgba(224,92,92,.2); }
.sct-btn-ghost { background:transparent; border-color:var(--border); color:var(--text); }
.sct-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }
.sct-scanner-card .sct-btn { margin-top:14px; }

.sct-divider { display:flex; align-items:center; gap:14px; margin:22px 0; color:var(--muted); font-size:11.5px; font-weight:600; letter-spacing:.16em; }
.sct-divider::before, .sct-divider::after { content:''; flex:1; height:1px; background:var(--border); }

.sct-form { display:flex; flex-direction:column; gap:12px; }
.sct-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.sct-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; outline:none; transition:border-color .2s, box-shadow .2s; }
.sct-input::placeholder { color:var(--muted); }
.sct-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }

/* ── Overlays / modal ── */
.sct-overlay { position:fixed; inset:0; background:rgba(8,9,16,.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:grid; place-items:center; z-index:2000; padding:20px; }
.sct-processing { text-align:center; color:var(--text); font-family:var(--font-h); font-weight:600; }
.sct-processing p { margin-top:16px; }
.sct-spinner { width:44px; height:44px; margin:0 auto; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:sctSpin 1s linear infinite; }

.sct-modal { width:min(100%,360px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,36px); text-align:center; animation:sctFadeUp .3s ease; }
.sct-modal.is-success { border-color:rgba(107,240,160,.35); background:linear-gradient(180deg, rgba(107,240,160,.1), var(--surface) 60%); }
.sct-modal.is-error { border-color:rgba(224,92,92,.35); background:linear-gradient(180deg, rgba(224,92,92,.1), var(--surface) 60%); }
.sct-modal-icon { width:52px; height:52px; margin:0 auto 16px; border-radius:50%; display:grid; place-items:center; }
.sct-modal-icon svg { width:24px; height:24px; }
.sct-modal.is-success .sct-modal-icon { background:rgba(107,240,160,.14); color:var(--live); }
.sct-modal.is-error .sct-modal-icon { background:rgba(224,92,92,.14); color:var(--danger); }
.sct-modal h3 { font-family:var(--font-h); font-weight:700; font-size:18px; margin-bottom:10px; }
.sct-modal.is-success h3 { color:var(--live); }
.sct-modal.is-error h3 { color:var(--danger); }
.sct-modal p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; overflow-wrap:anywhere; }

/* ── Offline banner + sync strip + manifest row ── */
.sct-offline-banner { display:flex; align-items:center; gap:10px; background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.4); color:#F2B8B8; border-radius:var(--r-sm); padding:11px 14px; margin-bottom:12px; font-size:13px; line-height:1.5; }
.sct-offline-banner strong { color:var(--danger); font-family:var(--font-h); letter-spacing:.06em; }
.sct-offline-dot { width:9px; height:9px; flex-shrink:0; border-radius:50%; background:var(--danger); animation:sctGatePulse 1.8s ease-in-out infinite; }
.sct-sync-strip { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); border-radius:var(--r-sm); padding:10px 14px; margin-bottom:12px; font-size:13px; color:var(--text); }
.sct-manifest-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.sct-manifest-status { font-size:12px; color:var(--muted); line-height:1.5; }
.sct-mini-btn { flex-shrink:0; background:var(--card); border:1px solid var(--border-h); color:var(--text); font-size:12px; font-weight:600; padding:7px 14px; border-radius:999px; transition:border-color .2s, background .2s; }
.sct-mini-btn:hover:not(:disabled) { border-color:rgba(232,201,106,.5); }
.sct-mini-btn:disabled { opacity:.45; cursor:not-allowed; }

/* ── Honesty note ── */
.sct-note { margin-top:20px; font-size:12px; line-height:1.6; color:var(--muted); background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:13px 15px; }
.sct-note strong { color:var(--text); }

/* ── Offline modal tag + conflicts list ── */
.sct-modal-tag { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.12em; color:var(--muted); background:var(--card); border:1px solid var(--border); border-radius:999px; padding:3px 10px; margin-bottom:10px; }
.sct-conflicts { list-style:none; text-align:left; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; max-height:180px; overflow-y:auto; }
.sct-conflicts li { font-size:12.5px; color:var(--muted); line-height:1.5; background:rgba(224,92,92,.08); border:1px solid rgba(224,92,92,.25); border-radius:8px; padding:8px 10px; overflow-wrap:anywhere; }
.sct-conflicts code { color:var(--danger); font-size:11.5px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .sct-app { display:block; }
  .sct-sidebar { display:none; }
  .sct-topbar { position:sticky; top:0; z-index:900; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 16px; background:rgba(8,9,16,.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .sct-burger { display:flex; }
  .sct-drawer { display:flex; flex-direction:column; gap:2px; position:fixed; inset:60px 0 0 0; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,5vw,32px); z-index:899; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .3s, transform .3s; }
  .sct-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .sct-drawer-item { display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid var(--border); color:var(--text); font-family:var(--font-h); font-size:17px; font-weight:600; text-align:left; padding:18px 4px; }
  .sct-drawer-item svg { width:20px; height:20px; color:var(--muted); }
  .sct-drawer-item.is-active { color:var(--gold); }
  .sct-drawer-item.is-active svg { color:var(--gold); }
  .sct-stage { margin:0 auto; }
}
@media (max-width:480px) {
  .sct-camera { min-height:280px; }
  .sct-corner { width:26px; height:26px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition:none !important; }
  .sct-spinner { animation:sctSpin 1s linear infinite !important; }
}
`;
