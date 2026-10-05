import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getToken, logout } from "../../services/authService";

const API = import.meta.env.VITE_API_URL;
const today = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const daysAgo = (days) => {
  const date = new Date(`${today()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
const number = (value) => Number(value || 0).toLocaleString("en-NG");

export default function AdminDailyReport() {
  const [from, setFrom] = useState(() => daysAgo(29));
  const [to, setTo] = useState(() => today());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async (silent = false) => {
    const token = getToken();
    if (!token) {
      logout();
      window.location.assign("/login");
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(`${API}/api/admin/daily-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to load daily report");
      setReport(data);
    } catch (err) {
      setError(err.message || "Unable to load daily report");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadReport();
    const timer = setInterval(() => loadReport(true), 60_000);
    return () => clearInterval(timer);
  }, [loadReport]);

  const totals = report?.totals || {};
  const rows = report?.rows || [];
  const refreshedAt = report?.refreshedAt
    ? new Date(report.refreshedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const totalInstallmentPayments = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.installmentPayments || 0), 0),
    [rows],
  );

  return (
    <AdminShell active="/admin/daily-report">
      <style>{CSS}</style>
      <header className="dfr-head">
        <div>
          <p className="dfr-eyebrow">ADMIN FINANCE</p>
          <h1>Daily sales report</h1>
          <p className="dfr-subtitle">
            Daily ticket activity, money collected, Tictify fees and affiliate commissions.
          </p>
        </div>
        <div className="dfr-head-meta">
          <span>Timezone: Africa/Lagos</span>
          <span>Updated {refreshedAt}</span>
        </div>
      </header>

      <section className="dfr-toolbar" aria-label="Report filters">
        <label>
          From
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} max={today()} onChange={(event) => setTo(event.target.value)} />
        </label>
        <button className="dfr-button" onClick={() => loadReport()} disabled={loading || refreshing}>
          {refreshing ? "Refreshing…" : "Refresh report"}
        </button>
      </section>

      {error && <div className="dfr-alert" role="alert">{error}</div>}

      {loading && !report ? (
        <div className="dfr-loading"><span className="dfr-spinner" /> Loading report…</div>
      ) : (
        <>
          <section className="dfr-kpis">
            <Metric label="Tickets sold" value={number(totals.ticketsSold)} detail={`${number(totals.ticketOrders)} completed orders`} />
            <Metric label="Amount collected" value={money(totals.grossCollected)} detail="Successful guest payments" />
            <Metric label="Platform fees gained" value={money(totals.platformFees)} detail="Tictify fee on ticket sales" tone="gold" />
            <Metric label="Affiliate commissions" value={money(totals.affiliatePaid)} detail={`${number(totals.affiliatePayments)} commission credits`} tone="purple" />
          </section>

          <section className="dfr-insight">
            <div>
              <strong>Installment activity</strong>
              <span>{number(totalInstallmentPayments)} successful installment payments in this range</span>
            </div>
            <p>
              Deposits appear on the day they are collected. A ticket is counted only when the guest completes the balance and the ticket is issued.
            </p>
          </section>

          <section className="dfr-card">
            <div className="dfr-card-head">
              <div>
                <h2>Daily breakdown</h2>
                <p>New rows will appear automatically as payments and commissions are recorded.</p>
              </div>
              {refreshing && <span className="dfr-live"><i /> Updating</span>}
            </div>

            <div className="dfr-table-wrap">
              <table className="dfr-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Tickets sold</th>
                    <th>Amount collected</th>
                    <th>Ticket revenue</th>
                    <th>Platform gain</th>
                    <th>Affiliate paid</th>
                    <th>Installment payments</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.date}>
                      <td className="dfr-date">{new Date(`${row.date}T12:00:00`).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td data-label="Tickets sold"><strong>{number(row.ticketsSold)}</strong><small>{number(row.ticketOrders)} orders</small></td>
                      <td data-label="Amount collected">{money(row.grossCollected)}</td>
                      <td data-label="Ticket revenue">{money(row.ticketRevenue)}</td>
                      <td data-label="Platform gain" className="dfr-gold">{money(row.platformFees)}</td>
                      <td data-label="Affiliate paid" className="dfr-purple">{money(row.affiliatePaid)}</td>
                      <td data-label="Installment payments">{number(row.installmentPayments)}<small>{number(row.installmentTicketOrders)} completed</small></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>{number(totals.ticketsSold)}</th>
                    <th>{money(totals.grossCollected)}</th>
                    <th>{money(totals.ticketRevenue)}</th>
                    <th className="dfr-gold">{money(totals.platformFees)}</th>
                    <th className="dfr-purple">{money(totals.affiliatePaid)}</th>
                    <th>{number(totals.installmentPayments)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}

function Metric({ label, value, detail, tone = "green" }) {
  return (
    <article className={`dfr-metric is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

const CSS = `
  .dfr-head { display:flex; justify-content:space-between; gap:24px; align-items:flex-end; margin-bottom:30px; }
  .dfr-eyebrow { color:#e8c96a; font-size:11px; letter-spacing:.16em; font-weight:800; margin-bottom:10px; }
  .dfr-head h1 { font:800 clamp(28px,4vw,46px)/1.05 Syne,sans-serif; letter-spacing:-.04em; margin:0; }
  .dfr-subtitle { color:#8b887e; margin-top:10px; font-size:14px; }
  .dfr-head-meta { display:flex; flex-direction:column; gap:6px; color:#8b887e; font-size:12px; text-align:right; white-space:nowrap; }
  .dfr-toolbar { display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; padding:16px; background:#0d0f16; border:1px solid rgba(255,255,255,.08); border-radius:16px; margin-bottom:18px; }
  .dfr-toolbar label { display:flex; flex-direction:column; gap:6px; color:#8b887e; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
  .dfr-toolbar input { color:#f0ede8; background:#080910; border:1px solid rgba(255,255,255,.12); border-radius:9px; padding:10px 12px; font-size:13px; color-scheme:dark; }
  .dfr-button { border:0; border-radius:999px; padding:11px 17px; background:#e8c96a; color:#080910; font-weight:800; cursor:pointer; }
  .dfr-button:disabled { opacity:.55; cursor:wait; }
  .dfr-alert { color:#ffaaa8; background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.35); border-radius:12px; padding:13px 16px; margin-bottom:18px; }
  .dfr-loading { min-height:260px; display:grid; place-items:center; color:#8b887e; gap:10px; }
  .dfr-spinner { width:20px; height:20px; border:2px solid rgba(255,255,255,.16); border-top-color:#e8c96a; border-radius:50%; animation:dfr-spin .8s linear infinite; }
  @keyframes dfr-spin { to { transform:rotate(360deg); } }
  .dfr-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
  .dfr-metric { min-width:0; padding:20px; background:#0d0f16; border:1px solid rgba(255,255,255,.08); border-radius:16px; }
  .dfr-metric span,.dfr-metric small { display:block; color:#8b887e; font-size:12px; }
  .dfr-metric strong { display:block; color:#6bf0a0; font:800 clamp(21px,2.5vw,30px)/1.1 Syne,sans-serif; margin:12px 0 8px; overflow-wrap:anywhere; }
  .dfr-metric.is-gold strong { color:#e8c96a; }.dfr-metric.is-purple strong { color:#c28cff; }
  .dfr-insight { display:flex; justify-content:space-between; gap:20px; align-items:center; padding:16px 18px; border:1px solid rgba(194,140,255,.2); background:rgba(194,140,255,.06); border-radius:14px; margin-bottom:18px; }
  .dfr-insight strong,.dfr-insight span { display:block; }.dfr-insight strong { font-size:14px; }.dfr-insight span,.dfr-insight p { color:#9d94aa; font-size:12px; margin-top:5px; }.dfr-insight p { max-width:520px; line-height:1.5; margin:0; }
  .dfr-card { background:#0d0f16; border:1px solid rgba(255,255,255,.08); border-radius:18px; overflow:hidden; }
  .dfr-card-head { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; padding:21px 22px; border-bottom:1px solid rgba(255,255,255,.08); }.dfr-card-head h2 { font:700 18px Syne,sans-serif; }.dfr-card-head p { color:#8b887e; font-size:12px; margin-top:6px; }.dfr-live { color:#6bf0a0; font-size:12px; display:flex; gap:7px; align-items:center; }.dfr-live i { width:7px; height:7px; border-radius:50%; background:#6bf0a0; box-shadow:0 0 0 4px rgba(107,240,160,.12); }
  .dfr-table-wrap { overflow:auto; }.dfr-table { width:100%; min-width:900px; border-collapse:collapse; font-size:13px; }.dfr-table th { color:#8b887e; font-size:10px; text-transform:uppercase; letter-spacing:.08em; text-align:left; padding:14px 18px; white-space:nowrap; }.dfr-table td { padding:15px 18px; border-top:1px solid rgba(255,255,255,.06); color:#f0ede8; white-space:nowrap; }.dfr-table tbody tr:hover { background:rgba(255,255,255,.025); }.dfr-table td small { display:block; color:#77746d; font-size:11px; margin-top:4px; }.dfr-date { color:#d9d2c4!important; font-weight:700; }.dfr-gold { color:#e8c96a!important; }.dfr-purple { color:#c28cff!important; }.dfr-table tfoot th { color:#f0ede8; background:rgba(255,255,255,.035); padding:16px 18px; white-space:nowrap; }
  @media(max-width:900px){.dfr-kpis{grid-template-columns:repeat(2,minmax(0,1fr));}.dfr-head{align-items:flex-start;flex-direction:column;}.dfr-head-meta{text-align:left;}.dfr-insight{align-items:flex-start;flex-direction:column;}}
  @media(max-width:520px){.dfr-kpis{grid-template-columns:1fr;}.dfr-toolbar label{flex:1;min-width:132px;}.dfr-button{width:100%;}.dfr-card-head{padding:18px;}}
  @media(prefers-reduced-motion:reduce){.dfr-spinner{animation:none;}}
`;
