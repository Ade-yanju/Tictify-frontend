/* ═══════════════════════════════════════════════════════════
   AdminAffiliates.jsx — Tictify 2026 Admin
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
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
  { label: "Ambassadors", path: "/admin/ambassadors", icon: "graduation" },
  { label: "Affiliates", path: "/admin/affiliates", icon: "percent" },
  { label: "Feedback", path: "/admin/feedback", icon: "mail" },
];

const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminAffiliates() {
  injectStyles("tictify-admin-affiliates-css", CSS);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);

  async function loadAffiliates() {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/affiliates`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Unauthorized or session expired");

      const data = await res.json();
      setStats(data.stats || null);
      setAffiliates(Array.isArray(data.affiliates) ? data.affiliates : []);
    } catch (err) {
      setError(err.message || "Unable to load affiliates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAffiliates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function handleToggle(aff) {
    if (processingId) return;
    if (
      aff.isActive &&
      !window.confirm(
        "Revoke this affiliate? Their login will be disabled immediately."
      )
    ) {
      return;
    }

    setActionError("");
    setProcessingId(aff._id);

    /* optimistic flip — reverted if the server says no */
    setAffiliates((list) =>
      list.map((a) =>
        a._id === aff._id ? { ...a, isActive: !a.isActive } : a
      )
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/affiliates/${aff._id}/toggle`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Action failed");

      await loadAffiliates();
    } catch (err) {
      /* roll back the optimistic flip */
      setAffiliates((list) =>
        list.map((a) =>
          a._id === aff._id ? { ...a, isActive: aff.isActive } : a
        )
      );
      setActionError(err.message || "Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onLogout={() => { logout(); navigate("/login"); }} />;

  const q = query.trim().toLowerCase();
  const filtered = affiliates.filter(
    (a) =>
      !q ||
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.affiliateCode || "").toLowerCase().includes(q)
  );

  return (
    <Shell
      active="/admin/affiliates"
      title="Affiliates"
      subtitle="Track affiliate memberships, ticket sales and commission payouts"
      navigate={navigate}
      onLogout={() => { logout(); navigate("/login"); }}
    >
      {/* KPI cards */}
      <section className="aaf-kpis">
        <StatCard label="Total Affiliates" value={Number(stats?.totalAffiliates || 0).toLocaleString()} tone="gold" icon={"users"} />
        <StatCard label="Membership Revenue" value={fmtNaira(stats?.membershipRevenue)} tone="gold" icon={"coins"} />
        <StatCard label="Tickets Sold" value={Number(stats?.ticketsSold || 0).toLocaleString()} tone="live" icon={"ticket"} />
        <StatCard label="Sales Volume" value={fmtNaira(stats?.salesVolume)} tone="live" icon={"bars"} />
        <StatCard label="Commissions Earned" value={fmtNaira(stats?.commissionsEarned)} tone="gold" icon={"wallet"} />
        <StatCard label="Unpaid Balances" value={fmtNaira(stats?.commissionsUnpaid)} tone="danger" icon={"clock"} />
      </section>

      {/* Action error (inline, dismissible) */}
      {actionError && (
        <div className="aaf-alert" role="alert">
          <span>{actionError}</span>
          <button className="aaf-alert-close" onClick={() => setActionError("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Search */}
      <section className="aaf-search">
        <div className="aaf-search-box">
          {"search"}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or code…"
            aria-label="Search affiliates"
          />
        </div>
      </section>

      {/* List */}
      <section className="aaf-list">
        {affiliates.length === 0 ? (
          <div className="aaf-empty">
            <div className="aaf-empty-icon">{"percent"}</div>
            <p className="aaf-empty-text">No affiliates yet</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="aaf-empty">
            <div className="aaf-empty-icon">{"search"}</div>
            <p className="aaf-empty-text">No affiliates match “{query}”</p>
          </div>
        ) : (
          <div className="aaf-tablewrap">
            <table className="aaf-table">
              <thead>
                <tr>
                  <th>Affiliate</th>
                  <th>Code</th>
                  <th>Tickets</th>
                  <th>Sales Volume</th>
                  <th>Earned</th>
                  <th>Balance</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="aaf-th-action"><span className="aaf-visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id} className={a.isActive ? "" : "is-off"}>
                    <td data-label="Affiliate">
                      <div className="aaf-who">
                        <span className="aaf-name">{a.name || "Affiliate"}</span>
                        <span className="aaf-email">{a.email || "—"}</span>
                      </div>
                    </td>
                    <td data-label="Code">
                      {a.affiliateCode ? (
                        <span className="aaf-code">{a.affiliateCode}</span>
                      ) : (
                        <span className="aaf-dim">—</span>
                      )}
                    </td>
                    <td data-label="Tickets" className="aaf-num">
                      {Number(a.ticketsSold || 0).toLocaleString()}
                    </td>
                    <td data-label="Sales Volume" className="aaf-num">
                      {fmtNaira(a.salesVolume)}
                    </td>
                    <td data-label="Earned" className="aaf-num">
                      {fmtNaira(a.totalEarned)}
                    </td>
                    <td data-label="Balance" className="aaf-num">
                      {fmtNaira(a.balance)}
                    </td>
                    <td data-label="Joined">
                      {a.joinedAt ? new Date(a.joinedAt).toLocaleDateString() : "—"}
                    </td>
                    <td data-label="Status">
                      <span className={`aaf-chip ${a.isActive ? "is-live" : "is-revoked"}`}>
                        {a.isActive ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td data-label="Action" className="aaf-action-cell">
                      {a.isActive ? (
                        <button
                          className="aaf-btn-danger"
                          disabled={processingId === a._id}
                          onClick={() => handleToggle(a)}
                        >
                          {processingId === a._id ? "..." : "Revoke"}
                        </button>
                      ) : (
                        <button
                          className="aaf-btn-gold-ghost"
                          disabled={processingId === a._id}
                          onClick={() => handleToggle(a)}
                        >
                          {processingId === a._id ? "..." : "Reinstate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      className={`aaf-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      <Icon name={n.icon} />
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="aaf-page">
      <aside className="aaf-sidebar">
        <div className="aaf-mark">Tic<em>tify</em></div>
        <nav className="aaf-nav">{navButtons}</nav>
        <button className="aaf-logout" onClick={onLogout}>
          {"signOut"}
          <span>Logout</span>
        </button>
      </aside>

      <div className="aaf-body">
        <header className="aaf-topbar">
          <div className="aaf-mark">Tic<em>tify</em></div>
          <button
            className={`aaf-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`aaf-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="aaf-logout" onClick={onLogout}>
            {"signOut"}
            <span>Logout</span>
          </button>
        </div>

        <div className="aaf-content">
          <header className="aaf-phead">
            <h1 className="aaf-title">{title}</h1>
            <p className="aaf-subtitle">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, tone, icon }) {
  return (
    <div className="aaf-kpi">
      <div className={`aaf-kpi-icon is-${tone}`}><Icon name={icon} /></div>
      <div className="aaf-kpi-content">
        <p className="aaf-kpi-label">{label}</p>
        <h3 className="aaf-kpi-value">{value}</h3>
      </div>
    </div>
  );
}

function LoadingScreen() {
  injectStyles("tictify-admin-affiliates-css", CSS);
  return (
    <div className="aaf-loading">
      <div className="aaf-loading-top">
        <div className="aaf-spinner" />
        <p>Loading…</p>
      </div>
      <div className="aaf-skel-row">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aaf-skel" style={{ height: 92 }} />
        ))}
      </div>
      <div className="aaf-skel" style={{ height: 46, maxWidth: 420 }} />
      <div className="aaf-skel" style={{ height: 320 }} />
    </div>
  );
}

function ErrorScreen({ error, onLogout }) {
  injectStyles("tictify-admin-affiliates-css", CSS);
  return (
    <div className="aaf-error">
      <div className="aaf-error-card">
        <div className="aaf-error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="aaf-btn-gold" onClick={onLogout}>Login Again</button>
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

@keyframes aaf-spin { to { transform:rotate(360deg); } }
@keyframes aaf-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes aaf-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.aaf-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.aaf-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.aaf-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.aaf-mark em { font-style:normal; color:var(--gold); }
.aaf-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.aaf-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.aaf-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.aaf-nav-item:hover { color:var(--text); background:var(--card); }
.aaf-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.aaf-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.aaf-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.aaf-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.aaf-logout svg { width:16px; height:16px; }
.aaf-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.aaf-topbar { display:none; }
.aaf-drawer { display:none; }
.aaf-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.aaf-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.aaf-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── KPI ── */
.aaf-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.aaf-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:aaf-fade .4s ease both; }
.aaf-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.aaf-kpi-icon { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; flex:0 0 auto; }
.aaf-kpi-icon svg { width:18px; height:18px; }
.aaf-kpi-icon.is-gold { background:var(--gold-dim); color:var(--gold); }
.aaf-kpi-icon.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.aaf-kpi-icon.is-danger { background:rgba(224,92,92,.12); color:var(--danger); }
.aaf-kpi-content { min-width:0; }
.aaf-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aaf-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,2.2vw,24px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }

/* ── Action alert (inline, dismissible) ── */
.aaf-alert { background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.4); color:var(--danger); padding:13px 18px; border-radius:var(--r-sm); display:flex; justify-content:space-between; align-items:center; gap:12px; font-weight:600; font-size:14px; animation:aaf-fade .3s ease; }
.aaf-alert-close { background:none; border:none; color:var(--danger); font-size:20px; cursor:pointer; line-height:1; }

/* ── Search ── */
.aaf-search { display:flex; }
.aaf-search-box { display:flex; align-items:center; gap:10px; width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:999px; padding:11px 18px; transition:border-color .2s; }
.aaf-search-box:focus-within { border-color:rgba(232,201,106,.45); }
.aaf-search-box svg { width:17px; height:17px; color:var(--muted); flex:0 0 auto; }
.aaf-search-box input { flex:1; min-width:0; background:none; border:none; outline:none; color:var(--text); font-size:14px; }
.aaf-search-box input::placeholder { color:var(--muted); }

/* ── Table (desktop) ── */
.aaf-list { min-height:200px; }
.aaf-tablewrap { background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow-x:auto; animation:aaf-fade .4s ease both; }
.aaf-table { width:100%; border-collapse:collapse; min-width:860px; }
.aaf-table th { text-align:left; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); padding:14px 16px; border-bottom:1px solid var(--border); white-space:nowrap; }
.aaf-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13.5px; vertical-align:middle; }
.aaf-table tbody tr { transition:background .2s; }
.aaf-table tbody tr:hover { background:rgba(255,255,255,.03); }
.aaf-table tbody tr:last-child td { border-bottom:none; }
.aaf-table tr.is-off td { opacity:.55; }
.aaf-table tr.is-off td.aaf-action-cell { opacity:1; }
.aaf-who { display:flex; flex-direction:column; gap:3px; min-width:0; }
.aaf-name { font-family:var(--font-h); font-weight:700; font-size:14px; overflow-wrap:anywhere; }
.aaf-email { font-size:12px; color:var(--muted); overflow-wrap:anywhere; }
.aaf-code { font-family:ui-monospace, monospace; font-size:12px; font-weight:700; letter-spacing:.06em; color:var(--gold); background:var(--gold-dim); border:1px dashed rgba(232,201,106,.45); border-radius:8px; padding:5px 10px; white-space:nowrap; }
.aaf-num { font-variant-numeric:tabular-nums; white-space:nowrap; }
.aaf-dim { color:var(--muted); }
.aaf-action-cell { text-align:right; }
.aaf-visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }

/* ── Status chip ── */
.aaf-chip { display:inline-block; padding:5px 12px; border-radius:999px; font-weight:700; font-size:11px; letter-spacing:.06em; white-space:nowrap; }
.aaf-chip.is-live { background:rgba(107,240,160,.12); color:var(--live); border:1px solid rgba(107,240,160,.4); }
.aaf-chip.is-revoked { background:rgba(224,92,92,.15); color:var(--danger); border:1px solid rgba(224,92,92,.35); }

/* ── Buttons ── */
.aaf-btn-danger { background:rgba(224,92,92,.12); border:1px solid rgba(224,92,92,.45); color:var(--danger); padding:8px 16px; border-radius:999px; cursor:pointer; font-weight:700; font-size:12.5px; transition:background .2s; }
.aaf-btn-danger:hover:not(:disabled) { background:rgba(224,92,92,.22); }
.aaf-btn-gold-ghost { background:transparent; border:1px solid rgba(232,201,106,.45); color:var(--gold); padding:8px 16px; border-radius:999px; cursor:pointer; font-weight:700; font-size:12.5px; transition:background .2s, border-color .2s; }
.aaf-btn-gold-ghost:hover:not(:disabled) { background:var(--gold-dim); border-color:var(--gold); }
.aaf-btn-gold { background:var(--gold); border:none; color:#080910; padding:12px 22px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:transform .2s, box-shadow .2s; }
.aaf-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.aaf-btn-danger:disabled, .aaf-btn-gold-ghost:disabled, .aaf-btn-gold:disabled { opacity:.5; cursor:not-allowed; }

/* ── Empty state ── */
.aaf-empty { padding:64px 20px; text-align:center; background:var(--card); border:1px solid var(--border); border-radius:var(--r); }
.aaf-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin:0 auto 16px; }
.aaf-empty-icon svg { width:24px; height:24px; }
.aaf-empty-text { color:var(--muted); font-size:14px; }

/* ── Loading / skeleton ── */
.aaf-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.aaf-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.aaf-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:aaf-spin .9s linear infinite; }
.aaf-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:aaf-shimmer 1.3s linear infinite; }
.aaf-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:16px; }

/* ── Error ── */
.aaf-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.aaf-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:aaf-fade .35s ease; }
.aaf-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.aaf-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.aaf-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .aaf-page { flex-direction:column; }
  .aaf-sidebar { display:none; }
  .aaf-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .aaf-topbar .aaf-mark { padding:0; font-size:19px; }
  .aaf-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .aaf-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .aaf-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .aaf-burger.is-open span:nth-child(2) { opacity:0; }
  .aaf-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .aaf-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .aaf-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .aaf-drawer .aaf-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .aaf-drawer .aaf-nav-item.is-active::before { left:0; }
  .aaf-drawer .aaf-logout { margin-top:22px; }
}

/* ── Table → stacked cards ── */
@media (max-width:720px) {
  .aaf-tablewrap { background:none; border:none; border-radius:0; overflow:visible; }
  .aaf-table { min-width:0; display:block; }
  .aaf-table thead { display:none; }
  .aaf-table tbody { display:flex; flex-direction:column; gap:14px; }
  .aaf-table tbody tr { display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; animation:aaf-fade .4s ease both; }
  .aaf-table tbody tr:hover { background:var(--card); border-color:var(--border-h); }
  .aaf-table td { display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid var(--border); padding:12px 16px; }
  .aaf-table tbody tr:last-child td { border-bottom:1px solid var(--border); }
  .aaf-table td:last-child { border-bottom:none; }
  .aaf-table td::before { content:attr(data-label); font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); flex:0 0 auto; }
  .aaf-table td[data-label="Affiliate"] { justify-content:flex-start; }
  .aaf-table td[data-label="Affiliate"]::before { display:none; }
  .aaf-num { text-align:right; }
  .aaf-who { flex:1; }
  .aaf-action-cell { text-align:right; background:rgba(255,255,255,.02); }
  .aaf-action-cell button { flex:1; }
}
@media (max-width:480px) {
  .aaf-search-box { width:100%; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
