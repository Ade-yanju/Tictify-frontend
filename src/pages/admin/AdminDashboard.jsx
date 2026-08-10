/* ═══════════════════════════════════════════════════════════
   AdminDashboard.jsx — Tictify 2026 Admin
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getToken, logout } from "../../services/authService";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Icons (inline, dependency-free) ─────────────────────── */

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "grid" },
  { label: "Events", path: "/admin/events", icon: "calendar" },
  { label: "Organizers", path: "/admin/organizers", icon: "users" },
  { label: "Withdrawals", path: "/admin/withdrawals", icon: "wallet" },
  { label: "Analytics", path: "/admin/sales", icon: "bars" },
  {
    label: "Ambassadors",
    path: "/admin/ambassadors",
    icon: (
      <Icon name="graduation" />
    ),
  },
  {
    label: "Affiliates",
    path: "/admin/affiliates",
    icon: (
      <Icon name="percent" />
    ),
  },
];

const TOOLTIP_STYLE = {
  background: "#0d0f16",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#F0EDE8",
  fontSize: 13,
};

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  injectStyles("tictify-admin-dashboard-css", CSS);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const [dashRes, chartRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashRes.ok || !chartRes.ok) {
          throw new Error("Session expired or unauthorized");
        }

        setData(await dashRes.json());
        setAnalytics(await chartRes.json());
      } catch (err) {
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onLogout={() => { logout(); navigate("/login"); }} />;

  const stats = data?.stats || {};
  const monthlyData = analytics?.monthlyRevenue || [];
  const salesByEvent = data?.salesByEvent || [];
  const recentSales = data?.recentSales || [];

  // Prepare pie chart data
  const eventStatusData = [
    { name: "Live", value: stats.liveEvents || 0, color: "#6BF0A0" },
    { name: "Ended", value: stats.endedEvents || 0, color: "#E05C5C" },
    { name: "Scheduled", value: stats.scheduledEvents || 0, color: "#E8C96A" },
  ];

  return (
    <Shell
      active="/admin/dashboard"
      title="Admin Dashboard"
      subtitle="Welcome back, Administrator"
      navigate={navigate}
      onLogout={() => { logout(); navigate("/login"); }}
    >
      {/* KPI Grid */}
      <section className="adb-kpis">
        <KPICard label="Total Revenue" value={`₦${(stats.revenue || 0).toLocaleString()}`} icon={"coins"} />
        <KPICard label="Platform Fees" value={`₦${(stats.platformFees || 0).toLocaleString()}`} icon={"bars"} />
        <KPICard label="Tickets Sold" value={stats.ticketsSold || 0} icon={"ticket"} />
        <KPICard label="Active Events" value={stats.events || 0} icon={"calendar"} />
        <KPICard label="Registered Organizers" value={stats.organizers || 0} icon={"users"} />
        <KPICard label="Pending Withdrawals" value={`₦${(stats.pendingAmount || 0).toLocaleString()}`} icon={"clock"} />
      </section>

      {/* Charts Section */}
      <section className="adb-charts">
        {/* Revenue Chart */}
        <div className="adb-card">
          <h3 className="adb-card-title">Revenue Trend</h3>
          {monthlyData.length === 0 ? (
            <ChartEmptyState message="Revenue data will appear here once tickets start selling" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="_id" stroke="#8B887E" tick={{ fill: "#8B887E", fontSize: 12 }} />
                <YAxis stroke="#8B887E" tick={{ fill: "#8B887E", fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#8B887E", fontSize: 13 }} />
                <Line type="monotone" dataKey="totalRevenue" stroke="#E8C96A" strokeWidth={2} name="Revenue" dot={{ fill: "#E8C96A", r: 3 }} />
                <Line type="monotone" dataKey="platformFees" stroke="#6BF0A0" strokeWidth={2} name="Fees" dot={{ fill: "#6BF0A0", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Event Status Pie */}
        <div className="adb-card">
          <h3 className="adb-card-title">Event Status Distribution</h3>
          {eventStatusData.every((d) => d.value === 0) ? (
            <ChartEmptyState message="Event status breakdown will appear once events are hosted" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={eventStatusData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={100}>
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d0f16" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Sales by event */}
      <SalesByEvent rows={salesByEvent} />

      {/* Recent activity */}
      <RecentActivity rows={recentSales} />

      {/* Quick Actions */}
      <section className="adb-actions-section">
        <h3 className="adb-section-title">Quick Actions</h3>
        <div className="adb-actions">
          <ActionCard title="Manage Withdrawals" desc="Approve payout requests" icon={"wallet"} onClick={() => navigate("/admin/withdrawals")} />
          <ActionCard title="View Events" desc="Monitor all events" icon={"calendar"} onClick={() => navigate("/admin/events")} />
          <ActionCard title="Organizers" desc="Manage organizers" icon={"users"} onClick={() => navigate("/admin/organizers")} />
          <ActionCard title="Sales Analytics" desc="View detailed analytics" icon={"bars"} onClick={() => navigate("/admin/sales")} />
        </div>
      </section>
    </Shell>
  );
}

/* ================= APP SHELL ================= */

function Shell({ active, title, subtitle, navigate, onLogout, children }) {
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

  const navButtons = NAV.map((n) => (
    <button
      key={n.path}
      className={`adb-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      <Icon name={n.icon} />
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="adb-page">
      <aside className="adb-sidebar">
        <div className="adb-mark">Tic<em>tify</em></div>
        <nav className="adb-nav">{navButtons}</nav>
        <button className="adb-logout" onClick={onLogout}>
          {"signOut"}
          <span>Logout</span>
        </button>
      </aside>

      <div className="adb-body">
        <header className="adb-topbar">
          <div className="adb-mark">Tic<em>tify</em></div>
          <button
            className={`adb-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`adb-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="adb-logout" onClick={onLogout}>
            {"signOut"}
            <span>Logout</span>
          </button>
        </div>

        <div className="adb-content">
          <header className="adb-phead">
            <h1 className="adb-title">{title}</h1>
            <p className="adb-subtitle">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ChartEmptyState({ message }) {
  return (
    <div className="adb-chart-empty">
      <div className="adb-chart-empty-icon">{"bars"}</div>
      <p>{message}</p>
    </div>
  );
}

function KPICard({ label, value, icon, trend }) {
  return (
    <div className="adb-kpi">
      <div className="adb-kpi-icon"><Icon name={icon} /></div>
      <div className="adb-kpi-content">
        <p className="adb-kpi-label">{label}</p>
        <h3 className="adb-kpi-value">{value}</h3>
        {trend && <p className="adb-kpi-trend">{trend}</p>}
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }) {
  return (
    <button className="adb-action" onClick={onClick}>
      <div className="adb-action-icon"><Icon name={icon} /></div>
      <h4 className="adb-action-title">{title}</h4>
      <p className="adb-action-desc">{desc}</p>
    </button>
  );
}

/* Short, human relative time — "just now", "3m ago", "2d ago". */
function relTime(value) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

function StatusChip({ status }) {
  const key = String(status || "").toUpperCase();
  const cls = key ? key.toLowerCase() : "unknown";
  return <span className={`adb-chip adb-chip-${cls}`}>{key || "—"}</span>;
}

function SalesByEvent({ rows }) {
  return (
    <section className="adb-sbe">
      <h3 className="adb-section-title">Sales by event</h3>
      {rows.length === 0 ? (
        <div className="adb-empty">
          <div className="adb-empty-icon">{"ticket"}</div>
          <p>No sales yet — per-event revenue appears here once tickets start selling.</p>
        </div>
      ) : (
        <div className="adb-table-wrap">
          <table className="adb-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Organizer</th>
                <th className="adb-num">Tickets sold</th>
                <th className="adb-num">Remaining</th>
                <th className="adb-num">Revenue (₦)</th>
                <th className="adb-num">Platform fee (₦)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td data-label="Event"><strong className="adb-td-strong">{r.title}</strong></td>
                  <td data-label="Organizer">{r.organizerName}</td>
                  <td data-label="Tickets sold" className="adb-num">{(r.ticketsSold || 0).toLocaleString()}</td>
                  <td data-label="Remaining" className="adb-num">{r.remaining == null ? "—" : r.remaining.toLocaleString()}</td>
                  <td data-label="Revenue (₦)" className="adb-num adb-gold">₦{(r.revenue || 0).toLocaleString()}</td>
                  <td data-label="Platform fee (₦)" className="adb-num">₦{(r.platformFees || 0).toLocaleString()}</td>
                  <td data-label="Status"><StatusChip status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RecentActivity({ rows }) {
  return (
    <section className="adb-activity">
      <h3 className="adb-section-title">Recent activity</h3>
      {rows.length === 0 ? (
        <div className="adb-empty">
          <div className="adb-empty-icon">{"clock"}</div>
          <p>No recent sales — new ticket purchases will show up here.</p>
        </div>
      ) : (
        <ul className="adb-feed">
          {rows.map((r, i) => (
            <li key={r.reference || i} className="adb-feed-row">
              <span className="adb-feed-dot" />
              <div className="adb-feed-main">
                <p className="adb-feed-line">
                  <strong className="adb-feed-qty">{(r.quantity || 1).toLocaleString()} × {r.ticketType || "Ticket"}</strong>
                  <span className="adb-feed-sep">·</span>
                  <span className="adb-feed-event">{r.eventTitle}</span>
                  <span className="adb-feed-sep">·</span>
                  <span className="adb-feed-amt">₦{(r.amount || 0).toLocaleString()}</span>
                  <span className="adb-feed-sep">·</span>
                  <span className="adb-feed-time">{relTime(r.createdAt)}</span>
                </p>
                <p className="adb-feed-email">{r.buyerEmailMasked}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LoadingScreen() {
  injectStyles("tictify-admin-dashboard-css", CSS);
  return (
    <div className="adb-loading">
      <div className="adb-loading-top">
        <div className="adb-spinner" />
        <p>Loading dashboard…</p>
      </div>
      <div className="adb-skel-row">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="adb-skel" style={{ height: 96 }} />
        ))}
      </div>
      <div className="adb-skel-row adb-skel-row-wide">
        <div className="adb-skel" style={{ height: 320 }} />
        <div className="adb-skel" style={{ height: 320 }} />
      </div>
      <div className="adb-skel-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="adb-skel" style={{ height: 130 }} />
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onLogout }) {
  injectStyles("tictify-admin-dashboard-css", CSS);
  return (
    <div className="adb-error">
      <div className="adb-error-card">
        <div className="adb-error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="adb-btn-gold" onClick={onLogout}>Login Again</button>
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
button, input, select { font-family:var(--font-b); }

@keyframes adb-spin { to { transform:rotate(360deg); } }
@keyframes adb-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes adb-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.adb-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.adb-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.adb-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.adb-mark em { font-style:normal; color:var(--gold); }
.adb-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.adb-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.adb-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.adb-nav-item:hover { color:var(--text); background:var(--card); }
.adb-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.adb-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.adb-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.adb-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.adb-logout svg { width:16px; height:16px; }
.adb-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.adb-topbar { display:none; }
.adb-drawer { display:none; }
.adb-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,32px); }
.adb-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.adb-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── KPI ── */
.adb-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.adb-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:adb-fade .4s ease both; }
.adb-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.adb-kpi-icon { width:40px; height:40px; border-radius:12px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; flex:0 0 auto; }
.adb-kpi-icon svg { width:18px; height:18px; }
.adb-kpi-content { min-width:0; }
.adb-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.adb-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,2.2vw,24px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }
.adb-kpi-trend { font-size:12px; color:var(--live); font-weight:600; margin-top:4px; }

/* ── Cards / charts ── */
.adb-charts { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.adb-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,2.6vw,26px); min-width:0; }
.adb-card-title { font-family:var(--font-h); font-weight:700; font-size:16px; margin-bottom:18px; }
.adb-chart-empty { height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; border:1px dashed var(--border); border-radius:14px; }
.adb-chart-empty-icon { width:46px; height:46px; border-radius:14px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; }
.adb-chart-empty-icon svg { width:22px; height:22px; }
.adb-chart-empty p { color:var(--muted); font-size:13.5px; max-width:260px; text-align:center; line-height:1.6; }

/* ── Quick actions ── */
.adb-actions-section { display:flex; flex-direction:column; gap:16px; }
.adb-section-title { font-family:var(--font-h); font-weight:700; font-size:18px; }
.adb-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.adb-action { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,2.6vw,24px); cursor:pointer; color:var(--text); display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; transition:transform .25s, border-color .25s, background .25s; }
.adb-action:hover { transform:translateY(-3px); border-color:rgba(232,201,106,.4); background:var(--gold-dim); }
.adb-action-icon { width:44px; height:44px; border-radius:14px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; }
.adb-action-icon svg { width:20px; height:20px; }
.adb-action-title { font-family:var(--font-h); font-weight:700; font-size:14px; }
.adb-action-desc { font-size:12.5px; color:var(--muted); }

/* ── Loading / skeleton ── */
.adb-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.adb-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.adb-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:adb-spin .9s linear infinite; }
.adb-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:adb-shimmer 1.3s linear infinite; }
.adb-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:16px; }
.adb-skel-row-wide { grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr)); }

/* ── Error ── */
.adb-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.adb-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:adb-fade .35s ease; }
.adb-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.adb-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.adb-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }
.adb-btn-gold { background:var(--gold); color:#080910; border:none; border-radius:999px; font-weight:700; font-size:14px; padding:13px 26px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.adb-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

/* ── Sales by event (table) ── */
.adb-sbe { display:flex; flex-direction:column; gap:16px; }
.adb-table-wrap { width:100%; overflow-x:auto; border:1px solid var(--border); border-radius:var(--r); background:var(--card); -webkit-overflow-scrolling:touch; }
.adb-table { width:100%; border-collapse:collapse; font-size:14px; min-width:640px; }
.adb-table thead th { text-align:left; font-family:var(--font-h); font-weight:700; font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); padding:14px 16px; border-bottom:1px solid var(--border); white-space:nowrap; }
.adb-table tbody td { padding:14px 16px; border-bottom:1px solid var(--border); color:var(--text); vertical-align:middle; }
.adb-table tbody tr:last-child td { border-bottom:none; }
.adb-table tbody tr { transition:background .2s; }
.adb-table tbody tr:hover { background:rgba(255,255,255,0.03); }
.adb-td-strong { font-weight:600; overflow-wrap:anywhere; }
.adb-num { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.adb-gold { color:var(--gold); font-weight:600; }
.adb-table thead th.adb-num { text-align:right; }

/* ── Status chip ── */
.adb-chip { display:inline-block; font-family:var(--font-h); font-weight:700; font-size:10.5px; letter-spacing:.05em; text-transform:uppercase; padding:4px 10px; border-radius:999px; border:1px solid var(--border); color:var(--muted); white-space:nowrap; }
.adb-chip-live { color:var(--live); border-color:rgba(107,240,160,.4); background:rgba(107,240,160,.1); }
.adb-chip-ended { color:var(--danger); border-color:rgba(224,92,92,.4); background:rgba(224,92,92,.1); }
.adb-chip-draft { color:var(--gold); border-color:rgba(232,201,106,.4); background:var(--gold-dim); }
.adb-chip-cancelled { color:var(--danger); border-color:rgba(224,92,92,.3); background:rgba(224,92,92,.06); text-decoration:line-through; }

/* ── Recent activity feed ── */
.adb-activity { display:flex; flex-direction:column; gap:16px; }
.adb-feed { list-style:none; display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; }
.adb-feed-row { display:flex; gap:12px; align-items:flex-start; padding:14px 18px; border-bottom:1px solid var(--border); }
.adb-feed-row:last-child { border-bottom:none; }
.adb-feed-dot { flex:0 0 auto; width:8px; height:8px; border-radius:50%; background:var(--gold); margin-top:7px; box-shadow:0 0 0 4px var(--gold-dim); }
.adb-feed-main { min-width:0; flex:1; }
.adb-feed-line { display:flex; flex-wrap:wrap; align-items:baseline; gap:6px; font-size:14px; line-height:1.5; }
.adb-feed-qty { font-weight:700; }
.adb-feed-sep { color:var(--muted); }
.adb-feed-event { overflow-wrap:anywhere; }
.adb-feed-amt { font-family:var(--font-h); font-weight:700; color:var(--gold); font-variant-numeric:tabular-nums; }
.adb-feed-time { color:var(--muted); font-size:12.5px; white-space:nowrap; }
.adb-feed-email { color:var(--muted); font-size:12px; margin-top:3px; overflow-wrap:anywhere; }

/* ── Empty state (sections) ── */
.adb-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:clamp(28px,5vw,44px); border:1px dashed var(--border); border-radius:var(--r); background:var(--card); }
.adb-empty-icon { width:44px; height:44px; border-radius:14px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; }
.adb-empty-icon svg { width:22px; height:22px; }
.adb-empty p { color:var(--muted); font-size:13.5px; max-width:340px; line-height:1.6; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .adb-page { flex-direction:column; }
  .adb-sidebar { display:none; }
  .adb-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .adb-topbar .adb-mark { padding:0; font-size:19px; }
  .adb-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .adb-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .adb-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .adb-burger.is-open span:nth-child(2) { opacity:0; }
  .adb-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .adb-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .adb-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .adb-drawer .adb-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .adb-drawer .adb-nav-item.is-active::before { left:0; }
  .adb-drawer .adb-logout { margin-top:22px; }
}
@media (max-width:720px) {
  /* Table collapses into stacked cards — no horizontal scroll needed */
  .adb-table-wrap { overflow-x:visible; border:none; background:none; }
  .adb-table { min-width:0; display:block; }
  .adb-table thead { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
  .adb-table tbody { display:flex; flex-direction:column; gap:12px; }
  .adb-table tbody tr { display:block; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:6px 16px; }
  .adb-table tbody tr:hover { background:var(--card); }
  .adb-table tbody td { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:9px 0; border-bottom:1px solid var(--border); text-align:right; }
  .adb-table tbody tr td:last-child { border-bottom:none; }
  .adb-table tbody td::before { content:attr(data-label); font-family:var(--font-h); font-weight:700; font-size:11px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); text-align:left; flex:0 0 auto; }
  .adb-num { text-align:right; }
}
@media (max-width:480px) {
  .adb-kpi { padding:14px; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
