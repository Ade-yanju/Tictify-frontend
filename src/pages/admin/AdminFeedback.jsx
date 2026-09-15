import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getToken } from "../../services/authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/feedback/admin`;
const STATUS_FILTERS = ["ALL", "NEW", "REVIEWED", "RESOLVED"];
const ROLE_FILTERS = ["ALL", "ORGANIZER", "AFFILIATE", "AMBASSADOR", "GUEST"];
const CATEGORY_FILTERS = ["ALL", "GENERAL", "BUG", "FEATURE", "PAYMENT", "OTHER"];

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

function normaliseRole(role) {
  return String(role || "guest").toUpperCase();
}

function pretty(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AdminFeedback() {
  injectStyles("tictify-admin-feedback-css", CSS);

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [savingId, setSavingId] = useState(null);

  const loadFeedback = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body.message || "Could not load feedback");
      setFeedback(Array.isArray(body) ? body : []);
    } catch (err) {
      setError(err.message || "Could not load feedback");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  async function updateStatus(item, status) {
    const previous = feedback;
    setSavingId(item._id);
    setError("");
    setFeedback((rows) => rows.map((row) => (row._id === item._id ? { ...row, status } : row)));

    try {
      const response = await fetch(`${API}/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not update feedback");
      setFeedback((rows) => rows.map((row) => (row._id === item._id ? body : row)));
    } catch (err) {
      setFeedback(previous);
      setError(err.message || "Could not update feedback");
    } finally {
      setSavingId(null);
    }
  }

  const counts = useMemo(() => ({
    all: feedback.length,
    new: feedback.filter((item) => item.status === "NEW").length,
    reviewed: feedback.filter((item) => item.status === "REVIEWED").length,
    resolved: feedback.filter((item) => item.status === "RESOLVED").length,
  }), [feedback]);

  const visibleFeedback = useMemo(() => feedback.filter((item) => {
    const roleMatches = roleFilter === "ALL" || normaliseRole(item.role) === roleFilter;
    const categoryMatches = categoryFilter === "ALL" || item.category === categoryFilter;
    const statusMatches = statusFilter === "ALL" || item.status === statusFilter;
    return roleMatches && categoryMatches && statusMatches;
  }), [feedback, roleFilter, categoryFilter, statusFilter]);

  return (
    <AdminShell active="/admin/feedback">
      <div className="afb-page">
        <header className="afb-hero">
          <div>
            <p className="afb-kicker">Admin workspace · community voice</p>
            <h1>Feedback inbox</h1>
            <p className="afb-subtitle">Keep every suggestion, bug report, and payment concern visible and moving.</p>
          </div>
          <button className="afb-refresh" onClick={() => loadFeedback({ silent: true })} disabled={refreshing}>
            <span className={refreshing ? "afb-refresh-icon is-spinning" : "afb-refresh-icon"}>↻</span>
            {refreshing ? "Refreshing…" : "Refresh inbox"}
          </button>
        </header>

        <section className="afb-stats" aria-label="Feedback summary">
          <SummaryCard label="All submissions" value={counts.all} tone="gold" />
          <SummaryCard label="Needs attention" value={counts.new} tone="danger" />
          <SummaryCard label="In review" value={counts.reviewed} tone="info" />
          <SummaryCard label="Resolved" value={counts.resolved} tone="live" />
        </section>

        {error && <div className="afb-alert" role="alert">{error}</div>}

        <section className="afb-toolbar" aria-label="Feedback filters">
          <div className="afb-status-tabs">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                className={statusFilter === status ? "is-active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL" ? "All" : pretty(status)}
                {status !== "ALL" && <span>{status === "NEW" ? counts.new : status === "REVIEWED" ? counts.reviewed : counts.resolved}</span>}
              </button>
            ))}
          </div>
          <div className="afb-selects">
            <label>
              <span>Role</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                {ROLE_FILTERS.map((role) => <option key={role} value={role}>{role === "ALL" ? "Every role" : pretty(role)}</option>)}
              </select>
            </label>
            <label>
              <span>Category</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                {CATEGORY_FILTERS.map((category) => <option key={category} value={category}>{category === "ALL" ? "Every category" : pretty(category)}</option>)}
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <div className="afb-grid" aria-label="Loading feedback">
            {[0, 1, 2].map((item) => <div className="afb-skeleton" key={item} />)}
          </div>
        ) : visibleFeedback.length === 0 ? (
          <div className="afb-empty">
            <div className="afb-empty-icon">✓</div>
            <h2>No feedback matches these filters</h2>
            <p>Try another status, role, or category to see more submissions.</p>
          </div>
        ) : (
          <div className="afb-grid">
            {visibleFeedback.map((item) => (
              <article className="afb-card" key={item._id}>
                <div className="afb-card-top">
                  <div className="afb-person">
                    <div className="afb-avatar">{initials(item.name)}</div>
                    <div>
                      <h2>{item.name}</h2>
                      <p>{item.email}</p>
                    </div>
                  </div>
                  <span className={`afb-status is-${String(item.status || "NEW").toLowerCase()}`}>{pretty(item.status || "NEW")}</span>
                </div>

                <div className="afb-meta">
                  <span className="afb-role">{pretty(item.role || "guest")}</span>
                  <span>{pretty(item.category || "GENERAL")}</span>
                  <span>{item.rating ? `${item.rating}/5 rating` : "No rating"}</span>
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                </div>

                <p className="afb-message">{item.message}</p>

                <div className="afb-card-foot">
                  <span className="afb-foot-label">Update status</span>
                  <select
                    value={item.status || "NEW"}
                    onChange={(event) => updateStatus(item, event.target.value)}
                    disabled={savingId === item._id}
                    aria-label={`Update status for ${item.name}`}
                  >
                    <option value="NEW">New</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`afb-summary is-${tone}`}>
      <span className="afb-summary-dot" />
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </div>
  );
}

const CSS = `
.afb-page { max-width:1180px; margin:0 auto; }
.afb-hero { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; margin-bottom:30px; }
.afb-kicker { color:var(--gold); font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
.afb-hero h1 { color:var(--text); font:800 clamp(32px,5vw,52px)/1.05 var(--font-h); letter-spacing:-.035em; margin:10px 0 12px; }
.afb-subtitle { color:var(--muted); font-size:15px; line-height:1.65; max-width:610px; }
.afb-refresh { display:inline-flex; align-items:center; gap:8px; background:var(--gold); border:1px solid var(--gold); color:var(--on-gold); border-radius:999px; padding:12px 18px; font-weight:800; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.afb-refresh:hover:not(:disabled) { transform:translateY(-2px); box-shadow:var(--e-gold); }
.afb-refresh:disabled { opacity:.65; cursor:wait; }
.afb-refresh-icon { display:inline-block; font-size:18px; line-height:1; }
.afb-refresh-icon.is-spinning { animation:afb-spin .8s linear infinite; }
@keyframes afb-spin { to { transform:rotate(360deg); } }
.afb-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:24px; }
.afb-summary { display:flex; align-items:center; gap:12px; padding:17px; border:1px solid var(--border); border-radius:var(--r); background:var(--ink-700); box-shadow:var(--e-1); }
.afb-summary-dot { width:10px; height:10px; border-radius:50%; background:var(--muted); box-shadow:0 0 0 5px rgba(139,136,126,.1); flex:none; }
.afb-summary p { color:var(--muted); font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; margin:0 0 5px; }
.afb-summary strong { color:var(--text); font:800 25px/1 var(--font-h); }
.afb-summary.is-gold { border-color:rgba(232,201,106,.3); }.afb-summary.is-gold .afb-summary-dot { background:var(--gold); box-shadow:0 0 0 5px var(--gold-dim); }
.afb-summary.is-danger { border-color:rgba(242,104,94,.3); }.afb-summary.is-danger .afb-summary-dot { background:var(--danger); box-shadow:0 0 0 5px var(--danger-dim); }
.afb-summary.is-info { border-color:rgba(107,168,245,.3); }.afb-summary.is-info .afb-summary-dot { background:var(--info); box-shadow:0 0 0 5px var(--info-dim); }
.afb-summary.is-live { border-color:rgba(91,227,154,.3); }.afb-summary.is-live .afb-summary-dot { background:var(--live); box-shadow:0 0 0 5px var(--live-dim); }
.afb-alert { padding:13px 16px; border-radius:var(--r-sm); margin-bottom:18px; background:var(--danger-dim); border:1px solid rgba(242,104,94,.35); color:var(--danger); font-size:13px; }
.afb-toolbar { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
.afb-status-tabs { display:flex; gap:7px; flex-wrap:wrap; }
.afb-status-tabs button { display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); color:var(--muted); border-radius:999px; padding:9px 13px; font-size:12px; font-weight:700; cursor:pointer; transition:.2s; }
.afb-status-tabs button:hover { color:var(--text); border-color:var(--border-h); }.afb-status-tabs button.is-active { background:var(--gold); border-color:var(--gold); color:var(--on-gold); }
.afb-status-tabs button span { min-width:18px; padding:2px 5px; border-radius:999px; background:rgba(0,0,0,.16); text-align:center; font-size:10px; }
.afb-selects { display:flex; gap:9px; flex-wrap:wrap; }.afb-selects label { display:flex; align-items:center; gap:8px; color:var(--muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
.afb-selects select, .afb-card-foot select { color:var(--text); background:var(--ink-600); border:1px solid var(--border); border-radius:9px; padding:9px 11px; font-size:12px; cursor:pointer; }
.afb-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(330px,100%),1fr)); gap:16px; }
.afb-card { display:flex; flex-direction:column; min-height:270px; padding:20px; border:1px solid var(--border); border-radius:var(--r-lg); background:var(--ink-700); box-shadow:var(--e-1); animation:afb-rise .35s ease both; }
@keyframes afb-rise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.afb-card:hover { border-color:var(--border-h); box-shadow:var(--e-2); }
.afb-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }.afb-person { display:flex; align-items:center; gap:11px; min-width:0; }
.afb-avatar { width:40px; height:40px; flex:none; display:grid; place-items:center; border-radius:13px; background:var(--gold-dim); color:var(--gold); font-weight:800; font-size:12px; }
.afb-person h2 { color:var(--text); font:700 15px/1.2 var(--font-h); overflow-wrap:anywhere; }.afb-person p { color:var(--muted); font-size:12px; margin-top:4px; overflow-wrap:anywhere; }
.afb-status { flex:none; padding:5px 9px; border-radius:999px; border:1px solid var(--border); font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; }
.afb-status.is-new { color:var(--gold); background:var(--gold-dim); border-color:rgba(232,201,106,.3); }.afb-status.is-reviewed { color:var(--info); background:var(--info-dim); border-color:rgba(107,168,245,.3); }.afb-status.is-resolved { color:var(--live); background:var(--live-dim); border-color:rgba(91,227,154,.3); }
.afb-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin:17px 0 14px; color:var(--muted); font-size:11.5px; }.afb-meta span:not(:last-of-type)::after { content:"·"; color:var(--text-dim); margin-left:8px; }.afb-role { color:var(--gold); font-weight:700; }.afb-meta time { margin-left:auto; font-size:11px; }
.afb-message { color:var(--text-2); font-size:14px; line-height:1.7; white-space:pre-wrap; overflow-wrap:anywhere; flex:1; }
.afb-card-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid var(--border); margin-top:18px; padding-top:15px; }.afb-foot-label { color:var(--muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.afb-empty { padding:70px 24px; border:1px dashed var(--border); border-radius:var(--r-lg); text-align:center; background:var(--card); }.afb-empty-icon { display:grid; place-items:center; width:48px; height:48px; margin:0 auto 15px; border-radius:16px; color:var(--live); background:var(--live-dim); font-size:22px; font-weight:800; }.afb-empty h2 { font:700 18px var(--font-h); }.afb-empty p { color:var(--muted); margin-top:7px; font-size:13px; }
.afb-skeleton { min-height:270px; border-radius:var(--r-lg); border:1px solid var(--border); background:linear-gradient(100deg,var(--ink-700) 20%,var(--ink-600) 40%,var(--ink-700) 60%); background-size:200% 100%; animation:afb-shimmer 1.4s linear infinite; }@keyframes afb-shimmer { to { background-position:-200% 0; } }
@media(max-width:850px){.afb-stats{grid-template-columns:repeat(2,minmax(0,1fr));}.afb-meta time{margin-left:0;}.afb-toolbar{align-items:flex-start;}}
@media(max-width:560px){.afb-stats{grid-template-columns:1fr 1fr;gap:10px;}.afb-summary{padding:13px;}.afb-summary strong{font-size:21px;}.afb-selects{width:100%;}.afb-selects label{flex:1;justify-content:space-between;}.afb-selects select{flex:1;min-width:0;}.afb-card{padding:17px;}.afb-card-foot{align-items:flex-start;flex-direction:column;}.afb-card-foot select{width:100%;}}
@media(prefers-reduced-motion:reduce){.afb-card,.afb-refresh-icon,.afb-skeleton{animation:none;}}
`;
