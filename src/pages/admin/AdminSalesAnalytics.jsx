/* ═══════════════════════════════════════════════════════════
   AdminSalesAnalytics.jsx — Tictify 2026 Admin
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
const Ic = {
  dash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="12" width="8" height="9" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5c2.4.5 4 2.7 4 5.5" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  out: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Ic.dash },
  { label: "Events", path: "/admin/events", icon: Ic.cal },
  { label: "Organizers", path: "/admin/organizers", icon: Ic.users },
  { label: "Withdrawals", path: "/admin/withdrawals", icon: Ic.wallet },
  { label: "Analytics", path: "/admin/sales", icon: Ic.chart },
  {
    label: "Ambassadors",
    path: "/admin/ambassadors",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 4L2 9l10 5 10-5-10-5z" strokeLinejoin="round" />
        <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" strokeLinecap="round" />
        <path d="M22 9v5" strokeLinecap="round" />
      </svg>
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

const EMPTY_DATA = {
  revenueByMonth: [],
  ticketsByMonth: [],
  topEvents: [],
  topOrganizers: [],
};

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminSalesAnalytics() {
  injectStyles("tictify-admin-sales-css", CSS);
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Platform Finance (additive) ── */
  const [finance, setFinance] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState("");
  const [financeRetry, setFinanceRetry] = useState(0);

  /* ================= LOAD ANALYTICS ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Session expired or unauthorized");

        const json = await res.json();

        setData({
          revenueByMonth: json.revenueByMonth || [],
          ticketsByMonth: json.ticketsByMonth || [],
          topEvents: json.topEvents || [],
          topOrganizers: json.topOrganizers || [],
        });
      } catch (err) {
        setError(err.message || "Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  /* ================= LOAD PLATFORM FINANCE ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) return; // main effect handles the redirect

    let cancelled = false;
    setFinanceLoading(true);
    setFinanceError("");

    async function loadFinance() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/finance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Unable to load platform finance");

        const json = await res.json();
        if (!cancelled) setFinance(json);
      } catch {
        // silent-retain: keep last loaded figures, just surface a retry note
        if (!cancelled) setFinanceError("Couldn't refresh platform finance.");
      } finally {
        if (!cancelled) setFinanceLoading(false);
      }
    }

    loadFinance();
    return () => {
      cancelled = true;
    };
  }, [financeRetry]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div className="asa-error">
        <div className="asa-error-card">
          <div className="asa-error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="asa-btn-gold" onClick={handleLogout}>
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Shell
      active="/admin/sales"
      title="Sales & Revenue Analytics"
      subtitle="Insights across events & organizers"
      navigate={navigate}
      onLogout={handleLogout}
    >
      {/* ================= PLATFORM FINANCE ================= */}
      <FinanceSection
        finance={finance}
        loading={financeLoading}
        error={financeError}
        onRetry={() => setFinanceRetry((n) => n + 1)}
      />

      {/* ================= CHARTS ================= */}
      <section className="asa-grid">
        <Chart
          title="Monthly Revenue"
          data={data.revenueByMonth}
          dataKey="total"
        />
        <Chart
          title="Tickets Sold"
          data={data.ticketsByMonth}
          dataKey="count"
          accent="#6BF0A0"
        />
      </section>

      {/* ================= TABLES ================= */}
      <section className="asa-grid">
        <Table
          title="Top Events"
          rows={data.topEvents.map((e) => ({
            name: e.event?.title || "Unknown",
            sold: e.sold || 0,
            revenue: `₦${(e.revenue || 0).toLocaleString()}`,
          }))}
        />

        <Table
          title="Top Organizers"
          rows={data.topOrganizers.map((o) => ({
            name: o.organizer?.name || "Unknown",
            sold: o.sold || 0,
            revenue: `₦${(o.revenue || 0).toLocaleString()}`,
          }))}
        />
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
      className={`asa-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      {n.icon}
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="asa-page">
      <aside className="asa-sidebar">
        <div className="asa-mark">Tic<em>tify</em></div>
        <nav className="asa-nav">{navButtons}</nav>
        <button className="asa-logout" onClick={onLogout}>
          {Ic.out}
          <span>Logout</span>
        </button>
      </aside>

      <div className="asa-body">
        <header className="asa-topbar">
          <div className="asa-mark">Tic<em>tify</em></div>
          <button
            className={`asa-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`asa-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="asa-logout" onClick={onLogout}>
            {Ic.out}
            <span>Logout</span>
          </button>
        </div>

        <div className="asa-content">
          <header className="asa-phead">
            <h1 className="asa-title">{title}</h1>
            <p className="asa-subtitle">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Chart({ title, data, dataKey, accent = "#E8C96A" }) {
  return (
    <div className="asa-card">
      <h3 className="asa-card-title">{title}</h3>

      {data.length === 0 ? (
        <p className="asa-muted">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <XAxis dataKey="_id" stroke="#8B887E" tick={{ fill: "#8B887E", fontSize: 12 }} />
            <YAxis stroke="#8B887E" tick={{ fill: "#8B887E", fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={accent}
              strokeWidth={2}
              dot={{ fill: accent, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Table({ title, rows }) {
  return (
    <div className="asa-card">
      <h3 className="asa-card-title">{title}</h3>

      {rows.length === 0 ? (
        <p className="asa-muted">No records found</p>
      ) : (
        rows.map((r, i) => (
          <div key={i} className="asa-row">
            <span className={`asa-row-rank ${i === 0 ? "is-first" : ""}`}>#{i + 1}</span>
            <strong className="asa-row-name">{r.name}</strong>
            <span className="asa-row-sold">{r.sold} sold</span>
            <span className="asa-row-revenue">{r.revenue}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= PLATFORM FINANCE ================= */

const naira = (v) => `₦${Number(v || 0).toLocaleString()}`;
const num = (v) => Number(v || 0).toLocaleString();

function FinKpi({ label, value, sub, danger }) {
  return (
    <div className={`asa-fin-kpi ${danger ? "is-danger" : ""}`}>
      <p className="asa-fin-kpi-label">{label}</p>
      <h3 className="asa-fin-kpi-value">{value}</h3>
      {sub && <p className="asa-fin-kpi-sub">{sub}</p>}
    </div>
  );
}

function FinanceSection({ finance, loading, error, onRetry }) {
  /* Loading skeleton (only when nothing has been loaded yet) */
  if (loading && !finance) {
    return (
      <section className="asa-fin">
        <h2 className="asa-fin-heading">Platform Finance</h2>
        <div className="asa-skel" style={{ height: 140 }} />
        <div className="asa-fin-skel-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="asa-skel" style={{ height: 100 }} />
          ))}
        </div>
        <div className="asa-fin-skel-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="asa-skel" style={{ height: 100 }} />
          ))}
        </div>
      </section>
    );
  }

  /* Error with nothing to retain — just a small retry note */
  if (!finance) {
    return (
      <section className="asa-fin">
        <div className="asa-fin-head">
          <h2 className="asa-fin-heading">Platform Finance</h2>
          <span className="asa-fin-retry-note">
            {error || "Couldn't load platform finance."}
            <button className="asa-fin-retry-btn" onClick={onRetry}>
              Retry
            </button>
          </span>
        </div>
      </section>
    );
  }

  const s = finance.sales || {};
  const c = finance.commissions || {};
  const m = finance.memberships || {};
  const w = finance.withdrawals || {};
  const r = finance.refunds || {};

  return (
    <section className="asa-fin">
      <div className="asa-fin-head">
        <h2 className="asa-fin-heading">Platform Finance</h2>
        {error && (
          <span className="asa-fin-retry-note">
            {error} Showing last loaded figures.
            <button className="asa-fin-retry-btn" onClick={onRetry}>
              Retry
            </button>
          </span>
        )}
      </div>

      {/* Hero — net platform revenue */}
      <div className="asa-fin-hero">
        <p className="asa-fin-hero-label">Net platform revenue</p>
        <h2 className="asa-fin-hero-value">{naira(finance.netPlatformRevenue)}</h2>
        <p className="asa-fin-hero-sub">
          Platform fees + affiliate memberships + transfer-fee margin − ambassador commissions
        </p>
      </div>

      {/* Money in */}
      <div>
        <h3 className="asa-fin-group-title">Money in</h3>
        <div className="asa-fin-grid">
          <FinKpi
            label="Gross volume"
            value={naira(s.grossVolume)}
            sub="everything guests paid"
          />
          <FinKpi
            label="Platform fees"
            value={naira(s.platformFees)}
            sub="your % on sales"
          />
          <FinKpi
            label="Affiliate memberships"
            value={naira(m.affiliateJoinRevenue)}
            sub={`${num(m.affiliatesJoined)} joined`}
          />
          <FinKpi
            label="Transfer-fee margin"
            value={naira(w.transferFeeMargin)}
            sub={`${num(w.processed)} payouts`}
          />
          <FinKpi
            label="Processing fees"
            value={naira(s.processingFees)}
            sub="passed through to Paystack — not yours"
          />
          <FinKpi
            label="Tickets sold"
            value={num(s.ticketsSold)}
            sub={`${num(s.orders)} orders`}
          />
        </div>
      </div>

      {/* Money out & held */}
      <div>
        <h3 className="asa-fin-group-title">Money out &amp; held</h3>
        <div className="asa-fin-grid">
          <FinKpi
            label="Organizer ticket revenue"
            value={naira(s.ticketRevenue)}
          />
          <FinKpi
            label="Affiliate commissions paid"
            value={naira(c.affiliatePaid)}
            sub={`${num(c.affiliatePayments)} payments · organizer-funded`}
          />
          <FinKpi
            label="Ambassador commissions"
            value={naira(c.ambassadorPaid)}
            sub={`${num(c.ambassadorPayments)} payments · platform-funded`}
            danger
          />
          <FinKpi
            label="Withdrawals paid out"
            value={naira(w.paidOut)}
            sub={`${num(w.processed)} processed`}
          />
          <FinKpi
            label="Refunds"
            value={naira(r.amount)}
            sub={`${num(r.count)} orders`}
            danger
          />
          <FinKpi
            label="Wallet liabilities"
            value={naira(finance.walletLiabilities)}
            sub="held in wallets — owed out"
          />
        </div>
      </div>

      {/* How the money flows */}
      <p className="asa-fin-flow">
        Guest pays → organizer gets ticket price → Tictify keeps fees → partners earn cuts → wallets pay out.
      </p>
    </section>
  );
}

function LoadingModal() {
  injectStyles("tictify-admin-sales-css", CSS);
  return (
    <div className="asa-loading">
      <div className="asa-loading-top">
        <div className="asa-spinner" />
        <p>Loading analytics…</p>
      </div>
      <div className="asa-skel-row">
        <div className="asa-skel" style={{ height: 320 }} />
        <div className="asa-skel" style={{ height: 320 }} />
      </div>
      <div className="asa-skel-row">
        <div className="asa-skel" style={{ height: 240 }} />
        <div className="asa-skel" style={{ height: 240 }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

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

@keyframes asa-spin { to { transform:rotate(360deg); } }
@keyframes asa-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes asa-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.asa-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.asa-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.asa-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.asa-mark em { font-style:normal; color:var(--gold); }
.asa-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.asa-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.asa-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.asa-nav-item:hover { color:var(--text); background:var(--card); }
.asa-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.asa-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.asa-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.asa-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.asa-logout svg { width:16px; height:16px; }
.asa-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.asa-topbar { display:none; }
.asa-drawer { display:none; }
.asa-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.asa-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.asa-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }
.asa-muted { color:var(--muted); font-size:13.5px; }

/* ── Cards ── */
.asa-grid { display:grid; gap:clamp(12px,2vw,20px); grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr)); }
.asa-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,2.6vw,26px); min-width:0; animation:asa-fade .4s ease both; }
.asa-card-title { font-family:var(--font-h); font-weight:700; font-size:16px; margin-bottom:18px; }

/* ── Ranked rows ── */
.asa-row { display:grid; grid-template-columns:34px minmax(0,1fr) auto auto; gap:12px; align-items:center; padding:13px 0; border-bottom:1px solid var(--border); font-size:14px; }
.asa-row:last-child { border-bottom:none; }
.asa-row-rank { font-family:var(--font-h); font-weight:800; font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }
.asa-row-rank.is-first { color:var(--gold); }
.asa-row-name { font-weight:600; overflow-wrap:anywhere; }
.asa-row-sold { color:var(--muted); font-size:13px; white-space:nowrap; font-variant-numeric:tabular-nums; }
.asa-row-revenue { font-family:var(--font-h); font-weight:700; color:var(--gold); font-variant-numeric:tabular-nums; white-space:nowrap; }

/* ── Platform Finance ── */
.asa-fin { display:flex; flex-direction:column; gap:clamp(14px,2vw,20px); min-width:0; animation:asa-fade .4s ease both; }
.asa-fin-head { display:flex; align-items:center; justify-content:space-between; gap:10px 14px; flex-wrap:wrap; }
.asa-fin-heading { font-family:var(--font-h); font-weight:700; font-size:18px; letter-spacing:-.01em; }
.asa-fin-retry-note { display:inline-flex; align-items:center; gap:10px; flex-wrap:wrap; color:var(--muted); font-size:12.5px; min-width:0; }
.asa-fin-retry-btn { background:none; border:1px solid var(--border); color:var(--gold); font-size:12px; font-weight:600; padding:4px 12px; border-radius:999px; cursor:pointer; transition:border-color .2s, background .2s; }
.asa-fin-retry-btn:hover { border-color:var(--gold); background:var(--gold-dim); }
.asa-fin-hero { background:linear-gradient(135deg, rgba(232,201,106,.16) 0%, rgba(232,201,106,.05) 55%, rgba(255,255,255,.03) 100%); border:1px solid rgba(232,201,106,.28); border-radius:var(--r); padding:clamp(20px,3vw,32px); min-width:0; }
.asa-fin-hero-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.asa-fin-hero-value { font-family:var(--font-h); font-weight:800; font-size:clamp(30px,5vw,46px); line-height:1.15; letter-spacing:-.02em; color:var(--gold); font-variant-numeric:tabular-nums; margin-top:8px; word-break:break-word; }
.asa-fin-hero-sub { color:var(--muted); font-size:13px; line-height:1.6; margin-top:10px; max-width:640px; }
.asa-fin-group-title { font-family:var(--font-h); font-weight:700; font-size:14px; margin-bottom:12px; }
.asa-fin-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(10px,1.6vw,16px); }
.asa-fin-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(14px,2vw,20px); min-width:0; transition:transform .25s, border-color .25s; }
.asa-fin-kpi:hover { transform:translateY(-2px); border-color:var(--border-h); }
.asa-fin-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.asa-fin-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(17px,2vw,22px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }
.asa-fin-kpi-sub { color:var(--muted); font-size:12px; line-height:1.5; margin-top:5px; overflow-wrap:anywhere; }
.asa-fin-kpi.is-danger { border-color:rgba(224,92,92,.3); background:rgba(224,92,92,.06); }
.asa-fin-kpi.is-danger .asa-fin-kpi-value { color:var(--danger); }
.asa-fin-flow { color:var(--muted); font-size:12.5px; line-height:1.7; border:1px dashed var(--border); border-radius:var(--r-sm); padding:10px 14px; overflow-wrap:anywhere; }
.asa-fin-skel-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:12px; }

/* ── Loading / skeleton ── */
.asa-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.asa-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.asa-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:asa-spin .9s linear infinite; }
.asa-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:asa-shimmer 1.3s linear infinite; }
.asa-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr)); gap:16px; }

/* ── Error ── */
.asa-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.asa-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:asa-fade .35s ease; }
.asa-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.asa-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.asa-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }
.asa-btn-gold { background:var(--gold); color:#080910; border:none; border-radius:999px; font-weight:700; font-size:14px; padding:13px 26px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.asa-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .asa-page { flex-direction:column; }
  .asa-sidebar { display:none; }
  .asa-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .asa-topbar .asa-mark { padding:0; font-size:19px; }
  .asa-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .asa-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .asa-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .asa-burger.is-open span:nth-child(2) { opacity:0; }
  .asa-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .asa-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .asa-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .asa-drawer .asa-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .asa-drawer .asa-nav-item.is-active::before { left:0; }
  .asa-drawer .asa-logout { margin-top:22px; }
}
@media (max-width:480px) {
  .asa-row { grid-template-columns:28px minmax(0,1fr) auto; }
  .asa-row-sold { grid-column:2; font-size:12px; }
  .asa-row-rank { grid-row:span 2; }
  .asa-row-revenue { grid-row:span 2; align-self:center; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
