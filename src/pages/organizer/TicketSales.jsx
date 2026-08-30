/* ═══════════════════════════════════════════════════════════
   TicketSales.jsx — Tictify 2026 Organizer Console
   Syne + DM Sans · ink #080910 · gold #E8C96A
   UI overhaul only — sales fetch / stats / modal logic
   preserved exactly.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

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
    <Icon name="grid" />
  ),
  create: (
    <Icon name="plusCircle" />
  ),
  events: (
    <Icon name="calendar" />
  ),
  sales: (
    <Icon name="bars" />
  ),
  scan: (
    <Icon name="qr" />
  ),
  withdraw: (
    <Icon name="wallet" />
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/organizer/dashboard", icon: NavIc.dashboard },
  { label: "Create Event", path: "/organizer/create-event", icon: NavIc.create },
  { label: "Insights", path: "/organizer/insights", icon: NavIc.sales },
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
      className={`tks-nav-item ${active === item.path ? "is-active" : ""}`}
      onClick={() => go(item.path)}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </button>
  ));

  return (
    <div className="tks-shell">
      <aside className="tks-side">
        <button className="tks-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tictify<em>.</em>
        </button>
        <nav className="tks-nav">{navButtons}</nav>
      </aside>

      <div className="tks-body">
        <div className="tks-topbar">
          <button className="tks-wordmark" onClick={() => go("/organizer/dashboard")}>
            Tictify<em>.</em>
          </button>
          <button
            className={`tks-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`tks-drawer ${menuOpen ? "is-open" : ""}`}>
          <nav className="tks-nav">{navButtons}</nav>
        </div>

        <main className="tks-main">{children}</main>
      </div>
    </div>
  );
}

/* ── Presentational helper ───────────────────────────────────── */
function statusClass(status) {
  if (status === "LIVE") return "is-live";
  if (status === "ENDED") return "is-ended";
  if (status === "DRAFT") return "is-draft";
  return "is-pending";
}

/* ================= SAFE DEFAULT ================= */
const EMPTY_SALES = {
  stats: {
    totalTickets: 0,
    totalRevenue: 0,
    platformFees: 0,
    scanned: 0,
    unscanned: 0,
  },
  events: [],
};

export default function TicketSales() {
  injectStyles("tictify-tks-css", CSS);
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_SALES);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    type: "error",
    message: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadSales() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/sales`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load ticket sales");

        const json = await res.json();
        if (!mounted) return;

        setData({
          stats: {
            totalTickets: Number(json?.stats?.totalTickets || 0),
            totalRevenue: Number(json?.stats?.totalRevenue || 0),
            platformFees: Number(json?.stats?.platformFees || 0),
            scanned: Number(json?.stats?.scanned || 0),
            unscanned: Number(json?.stats?.unscanned || 0),
          },
          events: Array.isArray(json?.events)
            ? json.events.map((e) => ({
                eventId: e.eventId,
                title: e.title || "Untitled Event",
                ticketsSold: Number(e.ticketsSold || 0),
                revenue: Number(e.revenue || 0),
                status: e.status || "UNKNOWN",
              }))
            : [],
        });
      } catch (err) {
        if (!mounted) return;
        setModal({
          open: true,
          type: "error",
          message:
            err.message || "Unable to load ticket sales at the moment.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSales();
    return () => {
      mounted = false;
    };
  }, []);

  const earnings =
    data.stats.totalRevenue - data.stats.platformFees;

  return (
    <Shell active="/organizer/sales">
      {/* ================= ERROR MODAL ================= */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() =>
            setModal((m) => ({ ...m, open: false }))
          }
        />
      )}

      {/* ================= HEADER ================= */}
      <header className="tks-head">
        <div>
          <h1 className="tks-title">Ticket Sales</h1>
          <p className="tks-sub">
            Track ticket purchases, revenue &amp; attendance
          </p>
        </div>
        <button
          className="tks-back"
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {loading ? (
        <SalesSkeleton />
      ) : (
        <>
          {/* ================= SUMMARY STATS ================= */}
          <section className="tks-kpis" aria-label="Sales summary">
            <Stat label="Tickets Sold" value={data.stats.totalTickets} />
            <Stat
              label="Gross Revenue"
              value={`₦${data.stats.totalRevenue.toLocaleString()}`}
            />
            <Stat
              label="Platform Fees"
              value={`₦${data.stats.platformFees.toLocaleString()}`}
            />
            <Stat
              label="Your Earnings"
              highlight
              value={`₦${earnings.toLocaleString()}`}
            />
            <Stat label="Scanned" value={data.stats.scanned} />
            <Stat label="Pending Entry" value={data.stats.unscanned} />
          </section>

          {/* ================= EVENT BREAKDOWN ================= */}
          <section className="tks-section">
            <h2 className="tks-section-title">Sales by Event</h2>

            {data.events.length === 0 ? (
              <div className="tks-empty">
                <p className="tks-empty-icon"><Icon name="ticket" /></p>
                <p className="tks-empty-text">No ticket sales yet.</p>
              </div>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="tks-table-wrap">
                  <div className="tks-table-scroll">
                    <table className="tks-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Tickets Sold</th>
                          <th>Revenue</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.events.map((event) => (
                          <tr key={event.eventId}>
                            <td className="tks-cell-title">{event.title}</td>
                            <td className="tks-cell-num">
                              {event.ticketsSold.toLocaleString()}
                            </td>
                            <td className="tks-cell-num tks-cell-revenue">
                              ₦{event.revenue.toLocaleString()}
                            </td>
                            <td>
                              <span
                                className={`tks-badge ${statusClass(event.status)}`}
                              >
                                {event.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile: stacked cards */}
                <div className="tks-cards">
                  {data.events.map((event) => (
                    <article key={event.eventId} className="tks-card">
                      <div className="tks-card-top">
                        <strong className="tks-card-title">
                          {event.title}
                        </strong>
                        <span
                          className={`tks-badge ${statusClass(event.status)}`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="tks-card-row">
                        <span>{event.ticketsSold} tickets sold</span>
                        <strong className="tks-card-revenue">
                          ₦{event.revenue.toLocaleString()}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ label, value, highlight }) {
  return (
    <div className={`tks-kpi ${highlight ? "is-highlight" : ""}`}>
      <span className="tks-kpi-label">{label}</span>
      <strong className="tks-kpi-value">{value}</strong>
    </div>
  );
}

function SalesSkeleton() {
  return (
    <div className="tks-skels" aria-hidden="true">
      <div className="tks-skel-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="tks-skel" style={{ height: 92 }} key={i} />
        ))}
      </div>
      <div className="tks-skel" style={{ height: 22, maxWidth: 180 }} />
      <div className="tks-skel" style={{ height: 220 }} />
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div className="tks-overlay">
      <div className="tks-modal">
        <h3 className={type === "error" ? "is-error" : "is-success"}>
          {type === "error" ? "Error" : "Success"}
        </h3>
        <p>{message}</p>
        <button className="tks-btn tks-btn-gold tks-w100" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════════ */
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

/* ── Shell ── */
.tks-shell { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.tks-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.tks-main { flex:1; width:100%; max-width:1160px; margin:0 auto; padding:clamp(16px,3vw,40px); }

.tks-wordmark { font-family:var(--font-h); font-weight:800; font-size:21px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:0; }
.tks-wordmark em { font-style:normal; color:var(--gold); }

.tks-side { display:none; }
.tks-topbar { position:sticky; top:0; z-index:950; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,24px); background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.tks-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); }
.tks-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.tks-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.tks-burger.is-open span:nth-child(2) { opacity:0; }
.tks-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.tks-drawer { position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,4vw,28px) 28px; display:flex; flex-direction:column; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
.tks-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }

.tks-nav { display:flex; flex-direction:column; gap:4px; }
.tks-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.tks-nav-item svg { width:18px; height:18px; flex-shrink:0; }
.tks-nav-item:hover { color:var(--text); background:var(--card); }
.tks-nav-item.is-active { background:var(--gold-dim); color:var(--gold); }
.tks-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

@media (min-width:1024px) {
  .tks-side { display:flex; flex-direction:column; width:250px; flex-shrink:0; position:sticky; top:0; height:100svh; background:var(--surface); border-right:1px solid var(--border); padding:26px 14px 18px; }
  .tks-side .tks-wordmark { padding:0 14px; margin-bottom:30px; }
  .tks-side .tks-nav { flex:1; }
  .tks-topbar { display:none; }
  .tks-drawer { display:none; }
}

/* ── Header ── */
.tks-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:28px; }
.tks-title { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); letter-spacing:-.01em; }
.tks-sub { color:var(--muted); font-size:14px; margin-top:6px; }
.tks-back { background:transparent; border:1px solid var(--border); color:var(--muted); padding:9px 16px; border-radius:999px; font-size:13px; transition:color .2s, border-color .2s; }
.tks-back:hover { color:var(--text); border-color:var(--border-h); }

/* ── KPI row ── */
.tks-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr)); gap:12px; margin-bottom:36px; }
.tks-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:18px 16px; min-width:0; transition:border-color .25s; }
.tks-kpi:hover { border-color:var(--border-h); }
.tks-kpi.is-highlight { background:linear-gradient(135deg, rgba(232,201,106,.18), var(--card) 70%); border-color:rgba(232,201,106,.4); }
.tks-kpi-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
.tks-kpi.is-highlight .tks-kpi-label { color:var(--gold); }
.tks-kpi-value { display:block; font-family:var(--font-h); font-weight:700; font-size:clamp(19px,2.2vw,24px); letter-spacing:-.01em; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }

/* ── Section ── */
.tks-section { margin-top:8px; }
.tks-section-title { font-family:var(--font-h); font-weight:700; font-size:16px; margin-bottom:14px; }

/* ── Table (desktop) ── */
.tks-table-wrap { display:none; }
.tks-table-scroll { overflow-x:auto; border:1px solid var(--border); border-radius:var(--r); background:var(--card); }
.tks-table { width:100%; min-width:560px; border-collapse:collapse; font-size:14px; }
.tks-table th { text-align:left; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); padding:14px 18px; border-bottom:1px solid var(--border); white-space:nowrap; }
.tks-table td { padding:15px 18px; border-bottom:1px solid var(--border); vertical-align:middle; }
.tks-table tbody tr:last-child td { border-bottom:none; }
.tks-table tbody tr { transition:background .2s; }
.tks-table tbody tr:hover { background:rgba(255,255,255,.03); }
.tks-cell-title { font-weight:600; overflow-wrap:anywhere; }
.tks-cell-num { font-variant-numeric:tabular-nums; white-space:nowrap; }
.tks-cell-revenue { font-family:var(--font-h); font-weight:700; color:var(--gold); }

/* ── Cards (mobile) ── */
.tks-cards { display:flex; flex-direction:column; gap:12px; }
.tks-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:16px; }
.tks-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px; }
.tks-card-title { font-family:var(--font-h); font-weight:700; font-size:15px; overflow-wrap:anywhere; }
.tks-card-row { display:flex; justify-content:space-between; align-items:center; gap:10px; color:var(--muted); font-size:13px; }
.tks-card-revenue { font-family:var(--font-h); font-weight:700; font-size:15px; color:var(--gold); font-variant-numeric:tabular-nums; }

@media (min-width:768px) {
  .tks-cards { display:none; }
  .tks-table-wrap { display:block; }
}

/* ── Status badges ── */
.tks-badge { display:inline-flex; align-items:center; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.tks-badge.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.tks-badge.is-draft { background:rgba(255,255,255,.07); color:var(--muted); }
.tks-badge.is-ended { background:rgba(224,92,92,.12); color:var(--danger); }
.tks-badge.is-pending { background:var(--gold-dim); color:var(--gold); }

/* ── Empty state ── */
.tks-empty { text-align:center; padding:clamp(36px,6vw,56px) 24px; background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); }
.tks-empty-icon { font-size:38px; }
.tks-empty-text { color:var(--muted); margin-top:10px; font-size:14px; }

/* ── Skeleton shimmer ── */
.tks-skels { display:flex; flex-direction:column; gap:18px; }
.tks-skel { border-radius:var(--r); background:linear-gradient(100deg, rgba(255,255,255,.04) 30%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 70%); background-size:200% 100%; animation:tksShimmer 1.4s linear infinite; }
@keyframes tksShimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
.tks-skel-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr)); gap:12px; }

/* ── Buttons + modal ── */
.tks-btn { border-radius:999px; font-weight:600; font-size:14px; padding:12px 22px; border:1px solid transparent; transition:transform .2s, box-shadow .2s; white-space:nowrap; }
.tks-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.tks-btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 26px var(--gold-glo); }
.tks-w100 { width:100%; }

.tks-overlay { position:fixed; inset:0; z-index:2000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.tks-modal { width:min(100%,380px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); text-align:center; animation:tksPop .3s ease; }
@keyframes tksPop { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.tks-modal h3 { font-family:var(--font-h); font-size:18px; font-weight:700; margin-bottom:10px; }
.tks-modal h3.is-error { color:var(--danger); }
.tks-modal h3.is-success { color:var(--live); }
.tks-modal p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
