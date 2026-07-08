/* ═══════════════════════════════════════════════════════════
   OrganizerEventStats.jsx — Tictify 2026 Organizer Ops
   Syne + DM Sans · ink #080910 · gold #E8C96A
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

/* ── Nav icons (inline, dependency-free) ─────────────────── */
const Ic = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="12" width="8" height="9" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </svg>
  ),
  create: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1v1" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
};

const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/organizer/dashboard", icon: Ic.dashboard },
  { key: "create", label: "Create Event", to: "/organizer/create-event", icon: Ic.create },
  { key: "events", label: "My Events", to: "/organizer/events", icon: Ic.events },
  { key: "sales", label: "Sales", to: "/organizer/sales", icon: Ic.sales },
  { key: "scan", label: "Scan Tickets", to: "/organizer/scan/select", icon: Ic.scan },
  { key: "withdraw", label: "Withdraw", to: "/organizer/withdraw", icon: Ic.wallet },
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
        {item.icon}
        <span>{item.label}</span>
      </button>
    ));

  return (
    <div className="oes-app">
      <aside className="oes-sidebar">
        <button className="oes-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <nav className="oes-nav">{navButtons("oes-nav-item")}</nav>
      </aside>

      <header className="oes-topbar">
        <button className="oes-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <button
          className={`oes-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`oes-drawer ${menuOpen ? "is-open" : ""}`}>
        {navButtons("oes-drawer-item")}
      </div>

      <main className="oes-main">
        <div className="oes-head">
          <h1 className="oes-title">{title}</h1>
          {subtitle && <p className="oes-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

/* ================= SAFE DEFAULT ================= */
const EMPTY_EVENTS = [];

export default function OrganizerEventStats() {
  injectStyles("tictify-event-stats-css", CSS);

  const navigate = useNavigate();

  const [events, setEvents] = useState(EMPTY_EVENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [promoStats, setPromoStats] = useState({});

  /* ================= LOAD STATS ================= */
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/organizer/events/stats`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load stats");

        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to load event statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  /* ================= LOAD PROMOTER LEADERBOARDS ================= */
  useEffect(() => {
    if (!events.length) return;
    let cancelled = false;

    async function loadPromoters() {
      const entries = await Promise.all(
        events.map(async (event) => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/tickets/promoters/${event.eventId}`,
              {
                headers: { Authorization: `Bearer ${getToken()}` },
              },
            );
            if (!res.ok) return [event.eventId, null];
            return [event.eventId, await res.json()];
          } catch {
            return [event.eventId, null];
          }
        }),
      );
      if (!cancelled) setPromoStats(Object.fromEntries(entries));
    }

    loadPromoters();
    return () => {
      cancelled = true;
    };
  }, [events]);

  return (
    <Shell
      active="events"
      title="Event Performance"
      subtitle="Ticket sales, scans, and revenue overview"
    >
      {/* ================= LOADING — skeleton shimmer ================= */}
      {loading && (
        <section className="oes-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <article className="oes-card oes-skel" key={i}>
              <div className="oes-skel-banner" />
              <div className="oes-body">
                <span className="oes-skel-line" style={{ width: "62%" }} />
                <span className="oes-skel-line" style={{ width: "40%" }} />
                <div className="oes-stats-grid">
                  <span className="oes-skel-tile" />
                  <span className="oes-skel-tile" />
                  <span className="oes-skel-tile" />
                  <span className="oes-skel-tile" />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {error && !loading && (
        <div className="oes-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ================= EMPTY ================= */}
          {events.length === 0 ? (
            <div className="oes-empty">
              <div className="oes-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
                </svg>
              </div>
              <p>You haven’t hosted any events yet.</p>
              <button
                className="oes-btn oes-btn-gold"
                onClick={() => navigate("/organizer/create-event")}
              >
                Create an Event
              </button>
            </div>
          ) : (
            <section className="oes-grid">
              {events.map((event) => (
                <article key={event.eventId} className="oes-card">
                  {/* ================= BANNER ================= */}
                  <div className="oes-banner-wrap">
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="oes-banner"
                      loading="lazy"
                    />

                    <span className={`oes-status ${statusClass(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* ================= BODY ================= */}
                  <div className="oes-body">
                    <h3 className="oes-event-title">{event.title}</h3>

                    <p className="oes-meta">
                      {new Date(event.date).toDateString()}
                    </p>

                    <div className="oes-stats-grid">
                      <Stat
                        label="Tickets Sold"
                        value={event.ticketsSold ?? 0}
                      />
                      <Stat
                        label="Remaining"
                        value={event.ticketsRemaining ?? 0}
                      />
                      <Stat label="Scanned" value={event.ticketsScanned ?? 0} />
                      <Stat
                        label="Revenue"
                        value={`₦${(event.revenue ?? 0).toLocaleString()}`}
                        accent
                      />
                    </div>

                    <PromoterBoard data={promoStats[event.eventId]} />
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </Shell>
  );
}

/* ================= STATUS → CLASS ================= */
function statusClass(status) {
  if (status === "LIVE") return "is-live";
  if (status === "ENDED") return "is-ended";
  return "is-pending";
}

/* ================= PROMOTER LEADERBOARD ================= */
function PromoterBoard({ data }) {
  if (!data) return null; // still loading or fetch failed — stay quiet

  const promoters = Array.isArray(data.promoters)
    ? [...data.promoters].sort(
        (a, b) => (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0),
      )
    : [];

  return (
    <div className="oes-promo">
      <h4 className="oes-promo-title">Promoter leaderboard</h4>

      {promoters.length === 0 ? (
        <p className="oes-promo-empty">
          No promoter sales yet — share promoter links from My Events to start
          tracking.
        </p>
      ) : (
        <>
          <ul className="oes-promo-list">
            {promoters.map((p, i) => (
              <li className="oes-promo-row" key={p.code}>
                <span
                  className={`oes-promo-rank ${i < 3 ? "is-medal" : ""}`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="oes-promo-code">{p.code}</span>
                <span className="oes-promo-sold">
                  {(p.ticketsSold ?? 0).toLocaleString()}{" "}
                  {(p.ticketsSold ?? 0) === 1 ? "ticket" : "tickets"}
                </span>
                <span className="oes-promo-rev">
                  ₦{(p.revenue ?? 0).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <p className="oes-promo-direct">
            Direct (no promoter): {(data.directSales ?? 0).toLocaleString()}{" "}
            tickets
          </p>
        </>
      )}
    </div>
  );
}

/* ================= STAT ================= */
function Stat({ label, value, accent }) {
  return (
    <div className={`oes-stat ${accent ? "is-accent" : ""}`}>
      <span className="oes-stat-label">{label}</span>
      <strong className="oes-stat-value">{value}</strong>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
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

@keyframes oesFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
@keyframes oesShimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }

/* ── Shell ── */
.oes-app { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.oes-sidebar { position:sticky; top:0; height:100svh; width:250px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:26px 16px; display:flex; flex-direction:column; }
.oes-wordmark { font-family:var(--font-h); font-weight:800; font-size:23px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:2px 12px; }
.oes-wordmark span { color:var(--gold); }
.oes-sidebar .oes-wordmark { margin-bottom:30px; }
.oes-nav { display:flex; flex-direction:column; gap:4px; }
.oes-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:11px 14px; background:none; border:none; border-radius:var(--r-sm); color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.oes-nav-item svg { width:19px; height:19px; flex-shrink:0; }
.oes-nav-item:hover { color:var(--text); background:var(--card); }
.oes-nav-item.is-active { color:var(--gold); background:var(--gold-dim); }
.oes-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

.oes-topbar { display:none; }
.oes-burger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:12px; }
.oes-burger span { display:block; width:18px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.oes-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.oes-burger.is-open span:nth-child(2) { opacity:0; }
.oes-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.oes-drawer { display:none; }

.oes-main { flex:1; min-width:0; padding:clamp(16px,3vw,40px); }
.oes-head { margin-bottom:clamp(22px,4vw,34px); }
.oes-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,4vw,34px); letter-spacing:-.02em; }
.oes-subtitle { color:var(--muted); font-size:14.5px; margin-top:7px; line-height:1.6; }

/* ── Grid + cards ── */
.oes-grid { display:grid; gap:clamp(14px,2.4vw,24px); grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr)); animation:oesFadeUp .4s ease; }
.oes-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; display:flex; flex-direction:column; transition:transform .3s, border-color .3s; }
.oes-card:hover { transform:translateY(-4px); border-color:var(--border-h); }
.oes-banner-wrap { position:relative; height:clamp(150px,22vw,200px); background:#000; }
.oes-banner { width:100%; height:100%; object-fit:cover; display:block; }
.oes-status { position:absolute; top:12px; right:12px; padding:5px 12px; border-radius:999px; font-size:10.5px; font-weight:700; letter-spacing:.1em; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.oes-status.is-live { background:rgba(107,240,160,.16); border:1px solid rgba(107,240,160,.45); color:var(--live); }
.oes-status.is-ended { background:rgba(224,92,92,.16); border:1px solid rgba(224,92,92,.45); color:var(--danger); }
.oes-status.is-pending { background:var(--gold-dim); border:1px solid rgba(232,201,106,.45); color:var(--gold); }
.oes-body { padding:clamp(16px,3vw,22px); display:flex; flex-direction:column; gap:6px; flex:1; }
.oes-event-title { font-family:var(--font-h); font-weight:700; font-size:17px; letter-spacing:-.01em; }
.oes-meta { font-size:13px; color:var(--muted); margin-bottom:10px; }

/* KPI tiles */
.oes-stats-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:auto; }
.oes-stat { background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); padding:12px 12px 10px; display:flex; flex-direction:column; gap:5px; min-width:0; }
.oes-stat.is-accent { background:linear-gradient(180deg, var(--gold-dim), rgba(255,255,255,.03) 90%); border-color:rgba(232,201,106,.3); }
.oes-stat-label { font-size:10.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.oes-stat-value { font-family:var(--font-h); font-weight:700; font-size:16.5px; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.oes-stat.is-accent .oes-stat-value { color:var(--gold); }

/* ── Promoter leaderboard ── */
.oes-promo { margin-top:14px; padding-top:14px; border-top:1px solid var(--border); }
.oes-promo-title { font-size:10.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
.oes-promo-empty { color:var(--muted); font-size:12.5px; line-height:1.6; }
.oes-promo-list { list-style:none; display:flex; flex-direction:column; gap:6px; }
.oes-promo-row { display:flex; align-items:center; gap:10px; padding:8px 10px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); min-width:0; }
.oes-promo-rank { flex-shrink:0; width:22px; height:22px; display:grid; place-items:center; border-radius:50%; background:rgba(255,255,255,.06); border:1px solid var(--border); color:var(--muted); font-family:var(--font-h); font-weight:700; font-size:11px; font-variant-numeric:tabular-nums; }
.oes-promo-rank.is-medal { background:var(--gold-dim); border-color:rgba(232,201,106,.4); color:var(--gold); }
.oes-promo-code { flex:1; min-width:0; font-family:var(--font-h); font-weight:700; font-size:13px; letter-spacing:.02em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.oes-promo-sold { flex-shrink:0; color:var(--muted); font-size:12px; font-variant-numeric:tabular-nums; white-space:nowrap; }
.oes-promo-rev { flex-shrink:0; font-family:var(--font-h); font-weight:700; font-size:12.5px; color:var(--gold); font-variant-numeric:tabular-nums; white-space:nowrap; }
.oes-promo-direct { margin-top:9px; color:var(--muted); font-size:12px; font-variant-numeric:tabular-nums; }

/* ── Buttons / error / empty ── */
.oes-btn { padding:13px 26px; border-radius:999px; border:1px solid transparent; font-weight:700; font-size:14px; transition:transform .25s, box-shadow .25s; }
.oes-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); }
.oes-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.oes-error { background:rgba(224,92,92,.08); border:1px solid rgba(224,92,92,.3); border-radius:var(--r); padding:clamp(20px,4vw,28px); animation:oesFadeUp .4s ease; }
.oes-error p { color:var(--danger); font-size:14.5px; }
.oes-empty { background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); padding:clamp(36px,7vw,60px) clamp(20px,4vw,32px); text-align:center; display:grid; justify-items:center; gap:16px; animation:oesFadeUp .4s ease; }
.oes-empty p { color:var(--muted); font-size:14.5px; }
.oes-empty-icon { width:60px; height:60px; border-radius:18px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; }
.oes-empty-icon svg { width:28px; height:28px; }

/* ── Skeleton shimmer ── */
.oes-skel { pointer-events:none; }
.oes-skel-banner, .oes-skel-line, .oes-skel-tile { position:relative; overflow:hidden; background:rgba(255,255,255,.06); display:block; }
.oes-skel-banner::after, .oes-skel-line::after, .oes-skel-tile::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent); animation:oesShimmer 1.4s infinite; }
.oes-skel-banner { height:clamp(150px,22vw,200px); }
.oes-skel-line { height:13px; border-radius:6px; margin-bottom:6px; }
.oes-skel-tile { height:64px; border-radius:var(--r-sm); }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .oes-app { display:block; }
  .oes-sidebar { display:none; }
  .oes-topbar { position:sticky; top:0; z-index:900; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 16px; background:rgba(8,9,16,.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .oes-burger { display:flex; }
  .oes-drawer { display:flex; flex-direction:column; gap:2px; position:fixed; inset:60px 0 0 0; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,5vw,32px); z-index:899; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .3s, transform .3s; }
  .oes-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .oes-drawer-item { display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid var(--border); color:var(--text); font-family:var(--font-h); font-size:17px; font-weight:600; text-align:left; padding:18px 4px; }
  .oes-drawer-item svg { width:20px; height:20px; color:var(--muted); }
  .oes-drawer-item.is-active { color:var(--gold); }
  .oes-drawer-item.is-active svg { color:var(--gold); }
}
@media (max-width:360px) {
  .oes-stats-grid { grid-template-columns:1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
