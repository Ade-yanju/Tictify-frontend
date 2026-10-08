import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getToken, logout } from "../../services/authService";

const API = import.meta.env.VITE_API_URL || "";
const PAGE_SIZE_OPTIONS = [20, 25, 50];

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
const formatDate = (value) => value
  ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
  : "—";

export default function AdminPaystackActivity() {
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageCount: 0, perPage: 25 });
  const [availableBalance, setAvailableBalance] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const loadActivity = useCallback(async (silent = false) => {
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
      const response = await fetch(`${API}/api/admin/paystack-activity?page=${page}&perPage=${perPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to load Paystack activity");
      setEntries(Array.isArray(body.entries) ? body.entries : []);
      setMeta(body.meta || { total: 0, page, pageCount: 0, perPage });
      setAvailableBalance(body.availableBalance ?? null);
      setWarning(body.warning || "");
    } catch (loadError) {
      setError(loadError.message || "Unable to load Paystack activity");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const pageCount = Math.max(1, Number(meta.pageCount || Math.ceil(Number(meta.total || 0) / perPage) || 1));
  const incoming = useMemo(() => entries.filter((entry) => Number(entry.difference) >= 0).reduce((sum, entry) => sum + Number(entry.difference || 0), 0), [entries]);
  const outgoing = useMemo(() => entries.filter((entry) => Number(entry.difference) < 0).reduce((sum, entry) => sum + Math.abs(Number(entry.difference || 0)), 0), [entries]);

  return (
    <AdminShell active="/admin/paystack-activity">
      <style>{CSS}</style>
      <div className="psa-page">
        <header className="psa-head">
          <div>
            <p className="psa-eyebrow">PAYSTACK CONTROL ROOM</p>
            <h1>Account activity</h1>
            <p className="psa-subtitle">
              Every provider ledger movement, with local withdrawal attribution where a reliable reference exists.
            </p>
          </div>
          <button className="psa-refresh" onClick={() => loadActivity(true)} disabled={refreshing}>
            <span className={refreshing ? "is-spinning" : ""}>↻</span>
            {refreshing ? "Refreshing…" : "Refresh activity"}
          </button>
        </header>

        <section className="psa-kpis" aria-label="Paystack activity summary">
          <Metric label="Available balance" value={availableBalance == null ? "Unavailable" : money(availableBalance)} tone="gold" />
          <Metric label="All provider entries" value={Number(meta.total || 0).toLocaleString("en-NG")} detail={`Page ${page} of ${pageCount}`} />
          <Metric label="Money in this page" value={money(incoming)} tone="live" />
          <Metric label="Money out this page" value={money(outgoing)} tone="danger" />
        </section>

        {error && <div className="psa-alert is-error" role="alert">{error}</div>}
        {warning && <div className="psa-alert" role="status">{warning}</div>}

        <section className="psa-card">
          <div className="psa-card-head">
            <div>
              <h2>Provider ledger</h2>
              <p>Paystack uses paginated ledger records for pay-ins and pay-outs. Amounts are shown in NGN.</p>
            </div>
            <label className="psa-page-size">
              Rows
              <select value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setPage(1); }}>
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="psa-loading"><span className="psa-spinner" /> Loading Paystack activity…</div>
          ) : entries.length === 0 ? (
            <div className="psa-empty"><strong>No activity returned</strong><span>Paystack has not returned ledger entries for this page.</span></div>
          ) : (
            <div className="psa-table-wrap">
              <table className="psa-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Movement</th>
                    <th>Reason / provider source</th>
                    <th>Initiation</th>
                    <th>Balance after</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const isIncoming = Number(entry.difference || 0) >= 0;
                    const organizer = entry.withdrawal?.organizer;
                    return (
                      <tr key={entry.id || `${entry.createdAt}-${entry.sourceId}`}>
                        <td data-label="Date" className="psa-date">{formatDate(entry.createdAt)}</td>
                        <td data-label="Movement" className={`psa-movement ${isIncoming ? "is-in" : "is-out"}`}>
                          {isIncoming ? "+" : "−"}{money(Math.abs(Number(entry.difference || 0)))}
                        </td>
                        <td data-label="Reason / provider source">
                          <strong className="psa-reason">{entry.reason || "No reason supplied"}</strong>
                          <small>{entry.source}{entry.sourceId ? ` · provider row ${entry.sourceId}` : ""}</small>
                          {(entry.providerReference || entry.providerTransferCode) && (
                            <small className="psa-reference">{entry.providerReference || entry.providerTransferCode}</small>
                          )}
                        </td>
                        <td data-label="Initiation">
                          <span className={`psa-origin is-${String(entry.origin || "PAYSTACK_ACTIVITY").toLowerCase()}`}>
                            {entry.originLabel}
                          </span>
                          <small>{entry.initiatedFrom}</small>
                          {organizer && <small className="psa-organizer">{organizer.name} · {organizer.email}</small>}
                          {entry.withdrawal && (
                            <small className="psa-withdrawal-detail">
                              {entry.withdrawal.status} · Requested {money(entry.withdrawal.requestedAmount)} · {entry.withdrawal.bankName || "Bank account"} ····{entry.withdrawal.accountLast4 || "—"}
                            </small>
                          )}
                        </td>
                        <td data-label="Balance after" className="psa-balance">{money(entry.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <footer className="psa-pagination">
            <span>Showing {entries.length ? ((page - 1) * perPage) + 1 : 0}–{Math.min(page * perPage, Number(meta.total || 0))} of {Number(meta.total || 0).toLocaleString("en-NG")}</span>
            <div>
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || page <= 1}>Previous</button>
              <strong>{page} / {pageCount}</strong>
              <button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={loading || page >= pageCount}>Next</button>
            </div>
          </footer>
        </section>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value, detail, tone = "neutral" }) {
  return (
    <article className={`psa-metric is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

const CSS = `
  .psa-page { max-width:1280px; margin:0 auto; }
  .psa-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:28px; }
  .psa-eyebrow { color:#e8c96a; font-size:11px; font-weight:800; letter-spacing:.16em; margin:0 0 10px; }
  .psa-head h1 { margin:0; color:#f0ede8; font:800 clamp(30px,4.8vw,52px)/1.05 Syne,sans-serif; letter-spacing:-.04em; }
  .psa-subtitle { max-width:700px; margin:10px 0 0; color:#8b887e; font-size:14px; line-height:1.6; }
  .psa-refresh { display:inline-flex; align-items:center; gap:8px; border:1px solid #e8c96a; border-radius:999px; padding:12px 17px; background:#e8c96a; color:#080910; font:800 13px DM Sans,sans-serif; cursor:pointer; }
  .psa-refresh span { font-size:18px; line-height:1; }.psa-refresh span.is-spinning { animation:psa-spin .8s linear infinite; } @keyframes psa-spin { to { transform:rotate(360deg); } }
  .psa-refresh:disabled { opacity:.6; cursor:wait; }
  .psa-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:14px; margin-bottom:18px; }
  .psa-metric { padding:19px; border:1px solid rgba(255,255,255,.09); border-radius:16px; background:#0d0f16; min-width:0; }.psa-metric span,.psa-metric small { display:block; color:#8b887e; font-size:12px; }.psa-metric strong { display:block; margin:11px 0 5px; color:#f0ede8; font:800 clamp(21px,2.5vw,30px)/1.1 Syne,sans-serif; overflow-wrap:anywhere; }.psa-metric.is-gold { border-color:rgba(232,201,106,.3); }.psa-metric.is-gold strong { color:#e8c96a; }.psa-metric.is-live { border-color:rgba(107,240,160,.24); }.psa-metric.is-live strong { color:#6bf0a0; }.psa-metric.is-danger { border-color:rgba(224,92,92,.3); }.psa-metric.is-danger strong { color:#ffaaa8; }
  .psa-alert { margin-bottom:16px; padding:13px 16px; border:1px solid rgba(232,201,106,.3); border-radius:12px; background:rgba(232,201,106,.08); color:#e8c96a; font-size:13px; }.psa-alert.is-error { border-color:rgba(224,92,92,.35); background:rgba(224,92,92,.1); color:#ffaaa8; }
  .psa-card { overflow:hidden; border:1px solid rgba(255,255,255,.09); border-radius:18px; background:#0d0f16; }.psa-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:21px 22px; border-bottom:1px solid rgba(255,255,255,.08); }.psa-card-head h2 { margin:0; color:#f0ede8; font:700 19px Syne,sans-serif; }.psa-card-head p { margin:6px 0 0; color:#8b887e; font-size:12px; line-height:1.5; }.psa-page-size { display:flex; align-items:center; gap:8px; color:#8b887e; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; white-space:nowrap; }.psa-page-size select { border:1px solid rgba(255,255,255,.14); border-radius:9px; padding:8px 10px; color:#f0ede8; background:#080910; }
  .psa-table-wrap { overflow:auto; }.psa-table { width:100%; min-width:980px; border-collapse:collapse; font-size:13px; }.psa-table th { padding:14px 18px; color:#8b887e; font-size:10px; text-align:left; text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; }.psa-table td { padding:16px 18px; border-top:1px solid rgba(255,255,255,.06); color:#f0ede8; vertical-align:top; }.psa-table tbody tr:hover { background:rgba(255,255,255,.025); }.psa-table td small { display:block; margin-top:5px; color:#8b887e; font-size:11px; line-height:1.45; }.psa-date { color:#d9d2c4!important; white-space:nowrap; }.psa-movement { font:800 14px Syne,sans-serif; white-space:nowrap; }.psa-movement.is-in { color:#6bf0a0; }.psa-movement.is-out { color:#ffaaa8; }.psa-reason { display:block; max-width:260px; overflow-wrap:anywhere; }.psa-reference { color:#c28cff!important; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; overflow-wrap:anywhere; }.psa-origin { display:block; width:max-content; max-width:260px; padding:5px 9px; border:1px solid rgba(255,255,255,.12); border-radius:999px; color:#d9d2c4; font-size:10px; font-weight:800; line-height:1.25; }.psa-origin.is-organizer_withdrawal { border-color:rgba(107,240,160,.3); color:#6bf0a0; background:rgba(107,240,160,.08); }.psa-origin.is-unlinked_transfer { border-color:rgba(232,201,106,.35); color:#e8c96a; background:rgba(232,201,106,.08); }.psa-organizer { color:#c28cff!important; }.psa-withdrawal-detail { color:#d9d2c4!important; max-width:320px; }.psa-balance { color:#d9d2c4!important; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .psa-loading { display:grid; place-items:center; min-height:280px; gap:12px; color:#8b887e; }.psa-spinner { width:24px; height:24px; border:2px solid rgba(255,255,255,.15); border-top-color:#e8c96a; border-radius:50%; animation:psa-spin .8s linear infinite; }.psa-empty { display:grid; place-items:center; min-height:240px; gap:8px; color:#8b887e; }.psa-empty strong { color:#f0ede8; font:700 17px Syne,sans-serif; }
  .psa-pagination { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:16px 18px; border-top:1px solid rgba(255,255,255,.08); color:#8b887e; font-size:12px; }.psa-pagination div { display:flex; align-items:center; gap:10px; }.psa-pagination button { border:1px solid rgba(255,255,255,.14); border-radius:999px; padding:9px 13px; color:#f0ede8; background:transparent; font:700 12px DM Sans,sans-serif; cursor:pointer; }.psa-pagination button:hover:not(:disabled) { border-color:#e8c96a; color:#e8c96a; }.psa-pagination button:disabled { opacity:.4; cursor:not-allowed; }.psa-pagination strong { color:#e8c96a; white-space:nowrap; }
  @media(max-width:600px){.psa-card-head{flex-direction:column;padding:18px}.psa-page-size{width:100%;justify-content:space-between}.psa-page-size select{flex:1}.psa-pagination{align-items:flex-start;flex-direction:column}.psa-pagination div{width:100%;justify-content:space-between}.psa-pagination button{flex:1}.psa-pagination strong{padding:10px 0}}
  @media(prefers-reduced-motion:reduce){.psa-spinner,.psa-refresh span.is-spinning{animation:none}}
`;
