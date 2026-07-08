/* ═══════════════════════════════════════════════════════════
   MyEvents.jsx — Tictify 2026 Organizer Console
   Syne + DM Sans · ink #080910 · gold #E8C96A
   UI overhaul only — fetch / publish / end / delete / share
   logic preserved exactly.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Shell nav icons (inline, dependency-free) ───────────────── */
const NavIc = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  create: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1v1" />
    </svg>
  ),
  withdraw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/organizer/dashboard", icon: NavIc.dashboard },
  { label: "Create Event", path: "/organizer/create-event", icon: NavIc.create },
  { label: "My Events", path: "/organizer/events", icon: NavIc.events },
  { label: "Sales", path: "/organizer/sales", icon: NavIc.sales },
  { label: "Scan Tickets", path: "/organizer/scan/select", icon: NavIc.scan },
  { label: "Withdraw", path: "/organizer/withdraw", icon: NavIc.withdraw },
];

/* ── App shell: sidebar ≥1024px, top bar + drawer below ──────── */
function Shell({ active, children }) {
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

  const navButtons = NAV_ITEMS.map((item) => (
    <button
      key={item.path}
      className={`mev-nav-item ${active === item.path ? "is-active" : ""}`}
      onClick={() => go(item.path)}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  ));

  return (
    <div className="mev-shell">
      <aside className="mev-side">
        <button className="mev-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tictify<em>.</em>
        </button>
        <nav className="mev-nav">{navButtons}</nav>
      </aside>

      <div className="mev-body">
        <div className="mev-topbar">
          <button className="mev-wordmark" onClick={() => go("/organizer/dashboard")}>
            Tictify<em>.</em>
          </button>
          <button
            className={`mev-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`mev-drawer ${menuOpen ? "is-open" : ""}`}>
          <nav className="mev-nav">{navButtons}</nav>
        </div>

        <main className="mev-main">{children}</main>
      </div>
    </div>
  );
}

/* ── Presentational helpers ──────────────────────────────────── */
function statusClass(status) {
  if (status === "LIVE") return "is-live";
  if (status === "ENDED") return "is-ended";
  if (status === "DRAFT") return "is-draft";
  return "is-pending";
}
function fmtMoney(n) {
  const v = Number(n);
  if (isNaN(v)) return "₦0";
  return `₦${v.toLocaleString()}`;
}

export default function MyEvents() {
  injectStyles("tictify-mev-css", CSS);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [promoEvent, setPromoEvent] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  /* ================= FETCH ================= */
  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/organizer`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= ACTIONS ================= */
  async function updateStatus(id, action) {
    if (processingId) return;
    setProcessingId(id);

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${action}/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      await fetchEvents();
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteEvent(id) {
    if (processingId) return;
    setProcessingId(id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      await fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
      setConfirmDelete(null);
    }
  }

  function copyEventLink(id) {
    const link = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  /* ================= GUEST LIST CSV EXPORT ================= */
  async function exportGuestList(event) {
    if (exportingId) return;
    setExportingId(event._id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/export/${event._id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "You don't have permission to export this guest list."
            : "Could not export the guest list. Please try again.",
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(event.title || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-guest-list.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorNotice(err.message || "Export failed. Please try again.");
    } finally {
      setExportingId(null);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Shell active="/organizer/events">
      {confirmDelete && (
        <ConfirmModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deleteEvent(confirmDelete)}
        />
      )}

      {promoEvent && (
        <PromoterModal
          event={promoEvent}
          onClose={() => setPromoEvent(null)}
        />
      )}

      {errorNotice && (
        <ErrorModal
          message={errorNotice}
          onClose={() => setErrorNotice(null)}
        />
      )}

      {/* HEADER */}
      <header className="mev-head">
        <div>
          <h1 className="mev-title">My Events</h1>
          <p className="mev-sub">Manage, publish, and monitor your events</p>
        </div>

        <button
          className="mev-btn mev-btn-gold"
          onClick={() => navigate("/organizer/create-event")}
        >
          + Create Event
        </button>
      </header>

      {/* LOADING SKELETON */}
      {loading && (
        <section className="mev-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="mev-skel-card" key={i}>
              <div className="mev-skel mev-skel-banner" />
              <div className="mev-skel" style={{ height: 18, width: "70%" }} />
              <div className="mev-skel" style={{ height: 13, width: "50%" }} />
              <div className="mev-skel" style={{ height: 34 }} />
            </div>
          ))}
        </section>
      )}

      {/* EMPTY */}
      {!loading && events.length === 0 && (
        <section className="mev-empty">
          <p className="mev-empty-icon">🎪</p>
          <h3 className="mev-empty-title">No events yet</h3>
          <p className="mev-empty-text">
            Create your first event and start selling tickets.
          </p>
          <button
            className="mev-btn mev-btn-gold"
            onClick={() => navigate("/organizer/create-event")}
          >
            Create Event
          </button>
        </section>
      )}

      {/* GRID */}
      {!loading && events.length > 0 && (
        <section className="mev-grid">
          {events.map((event) => {
            const capacity = Number(event.capacity) || 0;
            const sold = Number(event.sold ?? event.ticketsSold ?? 0) || 0;
            const pct =
              capacity > 0
                ? Math.min(100, Math.round((sold / capacity) * 100))
                : 0;

            return (
              <article key={event._id} className="mev-card">
                <div className="mev-banner">
                  {event.banner ? (
                    <img src={event.banner} alt="" loading="lazy" />
                  ) : (
                    <span className="mev-banner-fallback" aria-hidden="true">
                      {(event.title || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className={`mev-badge ${statusClass(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="mev-card-body">
                  <h3 className="mev-card-title">{event.title}</h3>
                  <p className="mev-card-meta">
                    {new Date(event.date).toDateString()} • {event.location}
                  </p>

                  {capacity > 0 && (
                    <div className="mev-progress-wrap">
                      <div className="mev-progress">
                        <div
                          className="mev-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="mev-progress-label">
                        {sold}/{capacity} tickets · {pct}% sold
                      </span>
                    </div>
                  )}

                  {event.revenue != null && (
                    <p className="mev-revenue">{fmtMoney(event.revenue)}</p>
                  )}
                </div>

                <div className="mev-actions">
                  <button
                    className="mev-abtn mev-abtn-share"
                    onClick={() => copyEventLink(event._id)}
                  >
                    {copiedId === event._id ? "Copied ✓" : "Share"}
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    onClick={() => setPromoEvent(event)}
                  >
                    Promoter link
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    disabled={exportingId === event._id}
                    onClick={() => exportGuestList(event)}
                  >
                    {exportingId === event._id ? "Exporting…" : "Guest list (CSV)"}
                  </button>

                  {event.status === "DRAFT" && (
                    <button
                      className="mev-abtn mev-abtn-publish"
                      disabled={processingId === event._id}
                      onClick={() => updateStatus(event._id, "publish")}
                    >
                      Publish
                    </button>
                  )}

                  {event.status === "LIVE" && (
                    <>
                      <button
                        className="mev-abtn mev-abtn-end"
                        disabled={processingId === event._id}
                        onClick={() => updateStatus(event._id, "end")}
                      >
                        End
                      </button>

                      <button
                        className="mev-abtn mev-abtn-scan"
                        onClick={() =>
                          navigate(`/organizer/scan?event=${event._id}`)
                        }
                      >
                        Scan
                      </button>
                    </>
                  )}

                  {event.status === "ENDED" && (
                    <button
                      className="mev-abtn mev-abtn-delete"
                      disabled={processingId === event._id}
                      onClick={() => setConfirmDelete(event._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </Shell>
  );
}

/* ================= MODALS ================= */

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="mev-overlay">
      <div className="mev-modal">
        <h3>Delete Event?</h3>
        <p>This action cannot be undone.</p>
        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="mev-abtn mev-abtn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoterModal({ event, onClose }) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const valid = code.length >= 2 && code.length <= 30;
  const link = `${window.location.origin}/events/${event._id}?ref=${
    code || "CODE"
  }`;

  function handleChange(e) {
    setCode(
      e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "")
        .slice(0, 30),
    );
  }

  function copyLink() {
    if (!valid) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-promo-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Promoter link</h3>
        <p className="mev-promo-explainer">
          Each promoter gets their own link — you&apos;ll see exactly how many
          tickets each one sells.
        </p>

        <label className="mev-promo-label" htmlFor="mev-promo-code">
          Promoter code
        </label>
        <input
          id="mev-promo-code"
          className="mev-promo-input"
          placeholder="e.g. TOBI"
          value={code}
          onChange={handleChange}
          autoFocus
        />

        <p className="mev-promo-preview" aria-live="polite">
          {link}
        </p>

        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="mev-btn mev-btn-gold"
            disabled={!valid}
            onClick={copyLink}
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ message, onClose }) {
  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-error-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Something went wrong</h3>
        <p>{message}</p>
        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

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

/* ── Shell ── */
.mev-shell { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.mev-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.mev-main { flex:1; width:100%; max-width:1160px; margin:0 auto; padding:clamp(16px,3vw,40px); }

.mev-wordmark { font-family:var(--font-h); font-weight:800; font-size:21px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:0; }
.mev-wordmark em { font-style:normal; color:var(--gold); }

.mev-side { display:none; }
.mev-topbar { position:sticky; top:0; z-index:950; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,24px); background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.mev-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); }
.mev-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.mev-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.mev-burger.is-open span:nth-child(2) { opacity:0; }
.mev-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.mev-drawer { position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,4vw,28px) 28px; display:flex; flex-direction:column; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
.mev-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }

.mev-nav { display:flex; flex-direction:column; gap:4px; }
.mev-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.mev-nav-item svg { width:18px; height:18px; flex-shrink:0; }
.mev-nav-item:hover { color:var(--text); background:var(--card); }
.mev-nav-item.is-active { background:var(--gold-dim); color:var(--gold); }
.mev-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

@media (min-width:1024px) {
  .mev-side { display:flex; flex-direction:column; width:250px; flex-shrink:0; position:sticky; top:0; height:100svh; background:var(--surface); border-right:1px solid var(--border); padding:26px 14px 18px; }
  .mev-side .mev-wordmark { padding:0 14px; margin-bottom:30px; }
  .mev-side .mev-nav { flex:1; }
  .mev-topbar { display:none; }
  .mev-drawer { display:none; }
}

/* ── Header ── */
.mev-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:28px; }
.mev-title { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); letter-spacing:-.01em; }
.mev-sub { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── Buttons ── */
.mev-btn { border-radius:999px; font-weight:600; font-size:14px; padding:12px 22px; border:1px solid transparent; transition:transform .2s, box-shadow .2s, border-color .2s; white-space:nowrap; }
.mev-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.mev-btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 26px var(--gold-glo); }
.mev-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.mev-btn-ghost:hover { border-color:var(--border-h); }

/* ── Grid + cards ── */
.mev-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(290px,100%),1fr)); gap:clamp(14px,2vw,20px); }
.mev-card { display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; transition:transform .25s, border-color .25s; }
.mev-card:hover { transform:translateY(-3px); border-color:var(--border-h); }

.mev-banner { position:relative; aspect-ratio:16/9; background:linear-gradient(135deg, var(--gold-dim), rgba(255,255,255,.03)); display:grid; place-items:center; overflow:hidden; }
.mev-banner img { width:100%; height:100%; object-fit:cover; display:block; }
.mev-banner-fallback { font-family:var(--font-h); font-weight:800; font-size:44px; color:rgba(232,201,106,.4); }

.mev-badge { position:absolute; top:12px; left:12px; display:inline-flex; align-items:center; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.mev-badge.is-live { background:rgba(107,240,160,.16); color:var(--live); border:1px solid rgba(107,240,160,.3); }
.mev-badge.is-draft { background:rgba(8,9,16,.55); color:var(--text); border:1px solid var(--border-h); }
.mev-badge.is-ended { background:rgba(224,92,92,.16); color:var(--danger); border:1px solid rgba(224,92,92,.3); }
.mev-badge.is-pending { background:var(--gold-dim); color:var(--gold); border:1px solid rgba(232,201,106,.3); }

.mev-card-body { flex:1; padding:16px 18px 6px; }
.mev-card-title { font-family:var(--font-h); font-weight:700; font-size:16.5px; letter-spacing:-.01em; margin-bottom:6px; overflow-wrap:anywhere; }
.mev-card-meta { color:var(--muted); font-size:13px; line-height:1.5; overflow-wrap:anywhere; }

.mev-progress-wrap { margin-top:12px; }
.mev-progress { height:4px; background:rgba(255,255,255,.08); border-radius:99px; overflow:hidden; }
.mev-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#E8C96A,#F5E196); transition:width .5s ease; }
.mev-progress-label { display:block; margin-top:6px; font-size:11.5px; color:var(--muted); }

.mev-revenue { margin-top:10px; font-family:var(--font-h); font-weight:700; font-size:15px; color:var(--gold); font-variant-numeric:tabular-nums; }

/* ── Card actions ── */
.mev-actions { display:flex; gap:8px; flex-wrap:wrap; padding:14px 18px 18px; }
.mev-abtn { border-radius:999px; font-weight:600; font-size:12.5px; padding:9px 16px; border:1px solid transparent; transition:opacity .2s, border-color .2s, background .2s; }
.mev-abtn:disabled { opacity:.55; cursor:not-allowed; }
.mev-abtn-share { background:var(--card); border-color:var(--border); color:var(--text); }
.mev-abtn-share:hover { border-color:var(--border-h); }
.mev-abtn-publish { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.mev-abtn-end { background:rgba(224,92,92,.14); border-color:rgba(224,92,92,.35); color:var(--danger); }
.mev-abtn-end:hover { background:rgba(224,92,92,.22); }
.mev-abtn-scan { background:transparent; border-color:rgba(107,240,160,.4); color:var(--live); }
.mev-abtn-scan:hover { background:rgba(107,240,160,.1); }
.mev-abtn-delete { background:var(--danger); border-color:var(--danger); color:#fff; }
.mev-abtn-delete:hover { opacity:.85; }
.mev-abtn-tool { background:transparent; border-color:var(--border); color:var(--muted); }
.mev-abtn-tool:hover { border-color:rgba(232,201,106,.4); color:var(--gold); }

/* ── Empty state ── */
.mev-empty { text-align:center; padding:clamp(40px,7vw,72px) 24px; background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); margin-top:12px; }
.mev-empty-icon { font-size:42px; }
.mev-empty-title { font-family:var(--font-h); font-weight:700; font-size:18px; margin-top:12px; }
.mev-empty-text { color:var(--muted); font-size:14px; margin:8px 0 20px; }

/* ── Skeleton shimmer ── */
.mev-skel-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:16px; display:flex; flex-direction:column; gap:12px; }
.mev-skel { border-radius:var(--r-sm); background:linear-gradient(100deg, rgba(255,255,255,.04) 30%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 70%); background-size:200% 100%; animation:mevShimmer 1.4s linear infinite; }
.mev-skel-banner { aspect-ratio:16/9; }
@keyframes mevShimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }

/* ── Modal ── */
.mev-overlay { position:fixed; inset:0; z-index:2000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.mev-modal { width:min(100%,380px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); text-align:center; animation:mevPop .3s ease; }
@keyframes mevPop { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.mev-modal h3 { font-family:var(--font-h); font-size:18px; font-weight:700; margin-bottom:10px; }
.mev-modal p { color:var(--muted); font-size:14px; line-height:1.6; }
.mev-modal-actions { display:flex; justify-content:center; gap:12px; margin-top:22px; flex-wrap:wrap; }
.mev-modal-actions .mev-abtn { padding:11px 22px; font-size:13.5px; }
.mev-modal .mev-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

/* ── Promoter link modal ── */
.mev-promo-modal { text-align:left; width:min(100%,420px); }
.mev-promo-modal h3 { text-align:left; }
.mev-promo-explainer { color:var(--muted); font-size:13.5px; line-height:1.6; margin-bottom:18px; }
.mev-promo-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.mev-promo-input { width:100%; padding:13px 15px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; font-family:var(--font-h); font-weight:600; letter-spacing:.04em; outline:none; transition:border-color .2s, box-shadow .2s; }
.mev-promo-input::placeholder { color:var(--muted); font-family:var(--font-b); font-weight:400; letter-spacing:0; }
.mev-promo-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.mev-promo-preview { margin-top:12px; padding:11px 13px; background:rgba(255,255,255,.03); border:1px dashed var(--border-h); border-radius:var(--r-sm); color:var(--gold); font-size:12.5px; line-height:1.5; overflow-wrap:anywhere; }
.mev-promo-modal .mev-modal-actions { justify-content:flex-end; }

/* ── Error modal ── */
.mev-error-modal { border-color:rgba(224,92,92,.35); background:linear-gradient(180deg, rgba(224,92,92,.08), var(--surface) 55%); }
.mev-error-modal h3 { color:var(--danger); }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:480px) {
  .mev-head .mev-btn { width:100%; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
