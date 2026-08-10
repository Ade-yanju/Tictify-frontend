/* ═══════════════════════════════════════════════════════════
   SelectEventToScan.jsx — Tictify 2026 Organizer Ops
   Syne + DM Sans · ink #080910 · gold #E8C96A
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { getToken } from "../../services/authService";

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
    <div className="ses-app">
      <aside className="ses-sidebar">
        <button className="ses-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <nav className="ses-nav">{navButtons("ses-nav-item")}</nav>
      </aside>

      <header className="ses-topbar">
        <button className="ses-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <button
          className={`ses-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`ses-drawer ${menuOpen ? "is-open" : ""}`}>
        {navButtons("ses-drawer-item")}
      </div>

      <main className="ses-main">
        <div className="ses-head">
          <h1 className="ses-title">{title}</h1>
          {subtitle && <p className="ses-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

/* ================= SAFE DEFAULT ================= */
const EMPTY_EVENTS = [];

export default function SelectEventToScan() {
  injectStyles("tictify-select-scan-css", CSS);

  const navigate = useNavigate();

  const [events, setEvents] = useState(EMPTY_EVENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setError("");
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

      if (!res.ok) throw new Error("Failed to load events");

      const data = await res.json();

      // ✅ Only LIVE events are scannable
      setEvents(
        Array.isArray(data) ? data.filter((e) => e.status === "LIVE") : [],
      );
    } catch {
      setError("Unable to load your events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <Shell
      active="scan"
      title="Select event to scan"
      subtitle="Choose an active event to begin ticket scanning"
    >
      {/* ================= LOADING — skeleton shimmer ================= */}
      {loading && (
        <div className="ses-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="ses-card ses-skel" key={i}>
              <div className="ses-skel-banner" />
              <div className="ses-skel-lines">
                <span className="ses-skel-line" style={{ width: "70%" }} />
                <span className="ses-skel-line" style={{ width: "45%" }} />
                <span className="ses-skel-line" style={{ width: "55%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ERROR ================= */}
      {error && (
        <div className="ses-error">
          <p>{error}</p>
          <button className="ses-btn ses-btn-danger" onClick={loadEvents}>
            Retry
          </button>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && !error && events.length === 0 && (
        <div className="ses-empty">
          <div className="ses-empty-icon" aria-hidden="true">
            <Icon name="qr" />
          </div>
          <p>No active events available for scanning.</p>
          <button
            className="ses-btn ses-btn-gold"
            onClick={() => navigate("/organizer/create-event")}
          >
            Create an Event
          </button>
        </div>
      )}

      {/* ================= EVENT LIST ================= */}
      {!loading && !error && events.length > 0 && (
        <div className="ses-grid">
          {events.map((event) => (
            <button
              key={event._id}
              className="ses-card"
              onClick={() => navigate(`/organizer/scan?event=${event._id}`)}
            >
              {/* BANNER */}
              <div className="ses-banner-wrap">
                <img
                  src={event.banner}
                  alt={event.title}
                  className="ses-banner"
                />
              </div>

              {/* INFO */}
              <div className="ses-info">
                <span className="ses-badge">
                  <span className="ses-badge-dot" /> LIVE
                </span>
                <strong className="ses-event-title">{event.title}</strong>
                <span className="ses-meta">
                  {new Date(event.date).toDateString()}
                </span>
                <span className="ses-meta">{event.location}</span>
              </div>

              <span className="ses-go" aria-hidden="true">
                Scan
                <Icon name="arrowRight" />
              </span>
            </button>
          ))}
        </div>
      )}
    </Shell>
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

@keyframes sesFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
@keyframes sesShimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
@keyframes sesPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.8); } }

/* ── Shell ── */
.ses-app { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.ses-sidebar { position:sticky; top:0; height:100svh; width:250px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:26px 16px; display:flex; flex-direction:column; }
.ses-wordmark { font-family:var(--font-h); font-weight:800; font-size:23px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:2px 12px; }
.ses-wordmark span { color:var(--gold); }
.ses-sidebar .ses-wordmark { margin-bottom:30px; }
.ses-nav { display:flex; flex-direction:column; gap:4px; }
.ses-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:11px 14px; background:none; border:none; border-radius:var(--r-sm); color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.ses-nav-item svg { width:19px; height:19px; flex-shrink:0; }
.ses-nav-item:hover { color:var(--text); background:var(--card); }
.ses-nav-item.is-active { color:var(--gold); background:var(--gold-dim); }
.ses-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

.ses-topbar { display:none; }
.ses-burger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:12px; }
.ses-burger span { display:block; width:18px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.ses-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.ses-burger.is-open span:nth-child(2) { opacity:0; }
.ses-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.ses-drawer { display:none; }

.ses-main { flex:1; min-width:0; padding:clamp(16px,3vw,40px); }
.ses-head { margin-bottom:clamp(22px,4vw,34px); }
.ses-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,4vw,34px); letter-spacing:-.02em; }
.ses-subtitle { color:var(--muted); font-size:14.5px; margin-top:7px; line-height:1.6; }

/* ── Grid + cards ── */
.ses-grid { display:grid; gap:clamp(14px,2vw,20px); grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr)); animation:sesFadeUp .4s ease; }
.ses-card { display:grid; grid-template-columns:84px minmax(0,1fr) auto; gap:14px; align-items:center; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:14px; color:var(--text); text-align:left; transition:transform .25s, border-color .25s, background .25s; }
.ses-card:hover { transform:translateY(-3px); border-color:rgba(232,201,106,.4); background:rgba(255,255,255,0.06); }
.ses-card:hover .ses-go { color:var(--gold); }
.ses-banner-wrap { width:84px; height:84px; border-radius:var(--r-sm); overflow:hidden; background:#000; }
.ses-banner { width:100%; height:100%; object-fit:cover; display:block; }
.ses-info { display:flex; flex-direction:column; gap:4px; min-width:0; }
.ses-badge { display:inline-flex; align-items:center; gap:6px; width:fit-content; font-size:10px; font-weight:700; letter-spacing:.12em; color:var(--live); background:rgba(107,240,160,.1); border:1px solid rgba(107,240,160,.3); padding:3px 9px; border-radius:999px; margin-bottom:2px; }
.ses-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--live); animation:sesPulse 2s ease-in-out infinite; }
.ses-event-title { font-family:var(--font-h); font-weight:700; font-size:15.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ses-meta { font-size:12.5px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ses-go { display:inline-flex; align-items:center; gap:6px; color:var(--muted); font-weight:700; font-size:13.5px; white-space:nowrap; transition:color .25s; }
.ses-go svg { width:16px; height:16px; }

/* ── Buttons ── */
.ses-btn { padding:13px 26px; border-radius:999px; border:1px solid transparent; font-weight:700; font-size:14px; transition:transform .25s, box-shadow .25s; }
.ses-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); }
.ses-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ses-btn-danger { background:rgba(224,92,92,.12); border-color:rgba(224,92,92,.4); color:var(--danger); }
.ses-btn-danger:hover { background:rgba(224,92,92,.2); }

/* ── Error / empty ── */
.ses-error { background:rgba(224,92,92,.08); border:1px solid rgba(224,92,92,.3); border-radius:var(--r); padding:clamp(20px,4vw,28px); margin-bottom:20px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px; animation:sesFadeUp .4s ease; }
.ses-error p { color:var(--danger); font-size:14.5px; }
.ses-empty { background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); padding:clamp(36px,7vw,60px) clamp(20px,4vw,32px); text-align:center; display:grid; justify-items:center; gap:16px; animation:sesFadeUp .4s ease; }
.ses-empty p { color:var(--muted); font-size:14.5px; }
.ses-empty-icon { width:60px; height:60px; border-radius:18px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; }
.ses-empty-icon svg { width:28px; height:28px; }

/* ── Skeleton shimmer ── */
.ses-skel { pointer-events:none; }
.ses-skel-banner, .ses-skel-line { position:relative; overflow:hidden; background:rgba(255,255,255,.06); }
.ses-skel-banner::after, .ses-skel-line::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent); animation:sesShimmer 1.4s infinite; }
.ses-skel-banner { width:84px; height:84px; border-radius:var(--r-sm); }
.ses-skel-lines { display:grid; gap:10px; grid-column:span 2; }
.ses-skel-line { display:block; height:12px; border-radius:6px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .ses-app { display:block; }
  .ses-sidebar { display:none; }
  .ses-topbar { position:sticky; top:0; z-index:900; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 16px; background:rgba(8,9,16,.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .ses-burger { display:flex; }
  .ses-drawer { display:flex; flex-direction:column; gap:2px; position:fixed; inset:60px 0 0 0; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,5vw,32px); z-index:899; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .3s, transform .3s; }
  .ses-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .ses-drawer-item { display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid var(--border); color:var(--text); font-family:var(--font-h); font-size:17px; font-weight:600; text-align:left; padding:18px 4px; }
  .ses-drawer-item svg { width:20px; height:20px; color:var(--muted); }
  .ses-drawer-item.is-active { color:var(--gold); }
  .ses-drawer-item.is-active svg { color:var(--gold); }
}
@media (max-width:480px) {
  .ses-card { grid-template-columns:64px minmax(0,1fr); }
  .ses-banner-wrap, .ses-skel-banner { width:64px; height:64px; }
  .ses-go { grid-column:2; justify-self:end; }
  .ses-skel-lines { grid-column:2; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
