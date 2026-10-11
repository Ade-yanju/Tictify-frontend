import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getToken, logout } from "../../services/authService";

const API = `${import.meta.env.VITE_API_URL || ""}/api/installments/admin/list`;
const STATUS_FILTERS = ["ALL", "RESERVED", "PARTIALLY_PAID", "PAID", "EXPIRED", "CANCELLED", "REFUNDED"];

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
const date = (value) => value
  ? new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

export default function AdminInstallments() {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    const token = getToken();
    if (!token) {
      logout();
      window.location.assign("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to load installment plans");
      setPlans(Array.isArray(body) ? body : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load installment plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data load is the external synchronization this screen needs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans();
  }, [loadPlans]);

  const visiblePlans = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesStatus = status === "ALL" || plan.status === status;
      if (!normalized) return matchesStatus;
      return matchesStatus && [
        plan.event?.title,
        plan.eventTitle,
        plan.organizer?.name,
        plan.name,
        plan.email,
        plan.reference,
      ].some((value) => String(value || "").toLowerCase().includes(normalized));
    });
  }, [plans, query, status]);

  const totals = useMemo(() => ({
    all: plans.length,
    active: plans.filter((plan) => ["RESERVED", "PARTIALLY_PAID"].includes(plan.status)).length,
    paid: plans.filter((plan) => plan.status === "PAID").length,
    outstanding: plans
      .filter((plan) => ["RESERVED", "PARTIALLY_PAID"].includes(plan.status))
      .reduce((sum, plan) => sum + Number(plan.amountRemaining || 0), 0),
  }), [plans]);

  return (
    <AdminShell active="/admin/installments">
      <style>{CSS}</style>
      <div className="ain-page">
        <header className="ain-head">
          <div>
            <p className="ain-eyebrow">OPERATIONS</p>
            <h1>Installment plans</h1>
            <p className="ain-subtitle">Review reserved tickets, guest balances and completed payment plans in one focused view.</p>
          </div>
          <button className="ain-refresh" type="button" onClick={loadPlans} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh plans"}
          </button>
        </header>

        <section className="ain-stats" aria-label="Installment summary">
          <Metric label="All plans" value={totals.all} />
          <Metric label="Active reservations" value={totals.active} tone="gold" />
          <Metric label="Completed" value={totals.paid} tone="live" />
          <Metric label="Outstanding balance" value={money(totals.outstanding)} tone="danger" />
        </section>

        {error && <div className="ain-alert" role="alert">{error}</div>}

        <section className="ain-card">
          <div className="ain-toolbar">
            <label className="ain-search">
              <span>Search plans</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Event, guest or reference" />
            </label>
            <label className="ain-filter">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUS_FILTERS.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : item.replace(/_/g, " ")}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="ain-loading">Loading installment plans…</div>
          ) : visiblePlans.length === 0 ? (
            <div className="ain-empty">
              <strong>{plans.length ? "No plans match these filters" : "No installment plans yet"}</strong>
              <span>{plans.length ? "Try a different status or search term." : "New installment reservations will appear here."}</span>
            </div>
          ) : (
            <div className="ain-table-wrap">
              <table className="ain-table">
                <thead>
                  <tr><th>Event</th><th>Guest</th><th>Organizer</th><th>Due</th><th className="ain-number">Paid</th><th className="ain-number">Balance</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {visiblePlans.map((plan) => (
                    <tr key={plan._id || plan.reference}>
                      <td data-label="Event"><strong>{plan.event?.title || plan.eventTitle || "Untitled event"}</strong><small>{plan.reference}</small></td>
                      <td data-label="Guest"><strong>{plan.name || "Guest"}</strong><small>{plan.email || "—"}</small></td>
                      <td data-label="Organizer">{plan.organizer?.name || plan.organizer?.email || "—"}</td>
                      <td data-label="Due">{date(plan.dueAt)}</td>
                      <td data-label="Paid" className="ain-number ain-gold">{money(plan.amountPaid)}</td>
                      <td data-label="Balance" className="ain-number">{money(plan.amountRemaining)}</td>
                      <td data-label="Status"><span className={`ain-status is-${String(plan.status || "unknown").toLowerCase()}`}>{String(plan.status || "UNKNOWN").replace(/_/g, " ")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value, tone = "" }) {
  return <div className={`ain-metric ${tone ? `is-${tone}` : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

const CSS = `
.ain-page { max-width:1440px; margin:0 auto; }
.ain-head { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom:32px; }
.ain-eyebrow { color:var(--gold,#e8c96a); font-size:13px !important; font-weight:800; letter-spacing:.14em; margin:0 0 8px; }
.ain-head h1 { margin:0; font-size:clamp(30px,4vw,46px); line-height:1.1; }
.ain-subtitle { max-width:680px; color:var(--text-2,#c9c5bc); margin:12px 0 0; }
.ain-refresh { min-height:46px; padding:11px 18px; border:1px solid var(--border-h,#ffffff22); border-radius:999px; background:var(--gold-dim,#ffffff10); color:var(--gold,#e8c96a); font-weight:700; cursor:pointer; white-space:nowrap; }
.ain-refresh:disabled { opacity:.6; cursor:wait; }
.ain-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; margin-bottom:28px; }
.ain-metric { min-width:0; padding:20px; border:1px solid var(--border,#ffffff12); border-radius:16px; background:var(--card,#ffffff08); }
.ain-metric span { display:block; color:var(--muted,#aaa69d); font-size:14px; font-weight:700; }
.ain-metric strong { display:block; margin-top:8px; color:var(--text,#f0ede8); font:700 clamp(22px,3vw,30px)/1.15 var(--font-h,'Syne',sans-serif); overflow-wrap:anywhere; }
.ain-metric.is-gold strong { color:var(--gold,#e8c96a); }
.ain-metric.is-live strong { color:var(--live,#5be39a); }
.ain-metric.is-danger strong { color:var(--danger,#f2685e); }
.ain-alert { margin-bottom:18px; padding:14px 16px; border:1px solid rgba(242,104,94,.35); border-radius:12px; color:#ffb4ad; background:rgba(242,104,94,.1); }
.ain-card { overflow:hidden; border:1px solid var(--border,#ffffff12); border-radius:18px; background:var(--card,#ffffff08); }
.ain-toolbar { display:flex; align-items:flex-end; gap:16px; padding:20px; border-bottom:1px solid var(--border,#ffffff12); }
.ain-toolbar label { display:flex; flex-direction:column; gap:7px; color:var(--text-2,#c9c5bc); font-weight:700; }
.ain-search { flex:1; max-width:520px; }
.ain-toolbar input,.ain-toolbar select { width:100%; min-height:46px; padding:10px 13px; border:1px solid var(--border-h,#ffffff22); border-radius:10px; background:var(--ink-600,#1a1d2b); color:var(--text,#f0ede8); }
.ain-loading,.ain-empty { padding:56px 20px; color:var(--text-2,#c9c5bc); text-align:center; }
.ain-empty { display:flex; flex-direction:column; gap:8px; }
.ain-empty strong { color:var(--text,#f0ede8); font-size:18px; }
.ain-table-wrap { overflow-x:auto; }
.ain-table { width:100%; min-width:880px; border-collapse:collapse; }
.ain-table th { padding:15px 18px; border-bottom:1px solid var(--border,#ffffff12); color:var(--muted,#aaa69d); font-size:13px !important; letter-spacing:.06em; text-align:left; text-transform:uppercase; white-space:nowrap; }
.ain-table td { padding:16px 18px; border-bottom:1px solid var(--border,#ffffff12); color:var(--text-2,#c9c5bc); vertical-align:middle; }
.ain-table tbody tr:last-child td { border-bottom:0; }
.ain-table td strong { display:block; color:var(--text,#f0ede8); }
.ain-table td small { display:block; margin-top:4px; color:var(--muted,#aaa69d); font-size:13px !important; overflow-wrap:anywhere; }
.ain-number { text-align:right !important; white-space:nowrap; }
.ain-gold { color:var(--gold,#e8c96a) !important; font-weight:700; }
.ain-status { display:inline-flex; padding:6px 10px; border:1px solid var(--border,#ffffff12); border-radius:999px; color:var(--text-2,#c9c5bc); font-size:13px !important; font-weight:800; letter-spacing:.04em; white-space:nowrap; }
.ain-status.is-paid { color:var(--live,#5be39a); border-color:rgba(91,227,154,.35); background:rgba(91,227,154,.1); }
.ain-status.is-reserved,.ain-status.is-partially_paid { color:var(--gold,#e8c96a); border-color:rgba(232,201,106,.35); background:var(--gold-dim,#ffffff10); }
.ain-status.is-expired,.ain-status.is-cancelled,.ain-status.is-refunded { color:var(--danger,#f2685e); border-color:rgba(242,104,94,.35); background:rgba(242,104,94,.1); }
@media(max-width:700px) {
  .ain-head { flex-direction:column; }
  .ain-refresh { width:100%; }
  .ain-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ain-toolbar { align-items:stretch; flex-direction:column; }
  .ain-search { max-width:none; }
}
`;
