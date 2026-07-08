/* ═══════════════════════════════════════════════════════════
   AdminWithdrawals.jsx — Tictify 2026 Admin
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
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
];

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminWithdrawals() {
  injectStyles("tictify-admin-withdrawals-css", CSS);
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadWithdrawals() {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Session expired");

      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function handleAction(id, action) {
    if (processingId) return;

    setProcessingId(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/withdrawals/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (!res.ok) throw new Error("Action failed");

      setSuccessMessage(`Withdrawal ${action}d successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      setSelectedWithdrawal(null);
      await loadWithdrawals();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onLogout={() => { logout(); navigate("/login"); }} />;

  const filteredWithdrawals = withdrawals.filter(
    (w) => statusFilter === "ALL" || w.status === statusFilter
  );

  const stats = {
    pending: withdrawals.filter((w) => w.status === "PENDING").length,
    approved: withdrawals.filter((w) => w.status === "APPROVED").length,
    rejected: withdrawals.filter((w) => w.status === "REJECTED").length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0),
  };

  return (
    <>
      <Shell
        active="/admin/withdrawals"
        title="Withdrawal Requests"
        subtitle="Review and approve payout requests"
        navigate={navigate}
        onLogout={() => { logout(); navigate("/login"); }}
      >
        {/* Stats Cards */}
        <section className="awd-kpis">
          <StatCard label="Pending" value={stats.pending} tone="gold" icon={Ic.clock} />
          <StatCard label="Approved" value={stats.approved} tone="live" icon={Ic.check} />
          <StatCard label="Rejected" value={stats.rejected} tone="danger" icon={Ic.cross} />
          <StatCard label="Total Amount" value={`₦${stats.totalAmount.toLocaleString()}`} tone="gold" icon={Ic.coins} />
        </section>

        {/* Success Message */}
        {successMessage && (
          <div className="awd-success">
            <span>{successMessage}</span>
            <button className="awd-success-close" onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}

        {/* Filter */}
        <section className="awd-filter">
          <div className="awd-filter-label">Filter by Status</div>
          <div className="awd-filter-btns">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                className={`awd-filter-btn ${statusFilter === status ? "is-active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* List */}
        <section className="awd-list">
          {filteredWithdrawals.length === 0 ? (
            <div className="awd-empty">
              <div className="awd-empty-icon">{Ic.wallet}</div>
              <p className="awd-empty-text">No withdrawal requests</p>
            </div>
          ) : (
            <div className="awd-grid">
              {filteredWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="awd-card"
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                >
                  <div className="awd-card-head">
                    <div className="awd-card-who">
                      <h4 className="awd-org-name">
                        {withdrawal.organizer?.name || "Organizer"}
                      </h4>
                      <p className="awd-org-email">
                        {withdrawal.organizer?.email}
                      </p>
                    </div>
                    <StatusBadge status={withdrawal.status} />
                  </div>

                  <div className="awd-card-body">
                    <div className="awd-info-row">
                      <span className="awd-info-label">Amount</span>
                      <span className="awd-amount">
                        ₦{(withdrawal.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="awd-info-row">
                      <span className="awd-info-label">Bank</span>
                      <span>{withdrawal.bankDetails?.bankName || "—"}</span>
                    </div>

                    <div className="awd-info-row">
                      <span className="awd-info-label">Account</span>
                      <span className="awd-account">
                        {withdrawal.bankDetails?.accountNumber || "—"}
                      </span>
                    </div>

                    <div className="awd-info-row">
                      <span className="awd-info-label">Date</span>
                      <span>
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {withdrawal.status === "PENDING" && (
                    <div className="awd-card-foot">
                      <p className="awd-hint">Click to review</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Shell>

      {/* Modal */}
      {selectedWithdrawal && (
        <WithdrawalModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={() => handleAction(selectedWithdrawal._id, "approve")}
          onReject={() => handleAction(selectedWithdrawal._id, "reject")}
          isProcessing={processingId === selectedWithdrawal._id}
        />
      )}
    </>
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
      className={`awd-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      {n.icon}
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="awd-page">
      <aside className="awd-sidebar">
        <div className="awd-mark">Tic<em>tify</em></div>
        <nav className="awd-nav">{navButtons}</nav>
        <button className="awd-logout" onClick={onLogout}>
          {Ic.out}
          <span>Logout</span>
        </button>
      </aside>

      <div className="awd-body">
        <header className="awd-topbar">
          <div className="awd-mark">Tic<em>tify</em></div>
          <button
            className={`awd-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`awd-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="awd-logout" onClick={onLogout}>
            {Ic.out}
            <span>Logout</span>
          </button>
        </div>

        <div className="awd-content">
          <header className="awd-phead">
            <h1 className="awd-title">{title}</h1>
            <p className="awd-subtitle">{subtitle}</p>
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
    <div className="awd-kpi">
      <div className={`awd-kpi-icon is-${tone}`}>{icon}</div>
      <div className="awd-kpi-content">
        <p className="awd-kpi-label">{label}</p>
        <h3 className="awd-kpi-value">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const badgeClass = {
    PENDING: "is-pending",
    APPROVED: "is-approved",
    REJECTED: "is-rejected",
  };
  return (
    <span className={`awd-badge ${badgeClass[status] || "is-pending"}`}>
      {status}
    </span>
  );
}

function WithdrawalModal({ withdrawal, onClose, onApprove, onReject, isProcessing }) {
  return (
    <div className="awd-modal" onClick={onClose}>
      <div className="awd-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="awd-modal-head">
          <h2 className="awd-modal-title">Review Withdrawal Request</h2>
          <button className="awd-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="awd-modal-body">
          <Section title="Organizer Information">
            <Detail label="Name" value={withdrawal.organizer?.name} />
            <Detail label="Email" value={withdrawal.organizer?.email} />
          </Section>

          <Section title="Withdrawal Details">
            <Detail label="Amount" value={`₦${(withdrawal.amount || 0).toLocaleString()}`} highlight />
            <Detail label="Status" value={withdrawal.status} />
            <Detail label="Request Date" value={new Date(withdrawal.createdAt).toLocaleDateString()} />
          </Section>

          <Section title="Bank Details">
            <Detail label="Bank Name" value={withdrawal.bankDetails?.bankName} />
            <Detail label="Account Number" value={withdrawal.bankDetails?.accountNumber} />
            <Detail label="Account Name" value={withdrawal.bankDetails?.accountName} />
          </Section>

          {withdrawal.bankDetails?.swiftCode && (
            <Section title="Additional Details">
              <Detail label="SWIFT Code" value={withdrawal.bankDetails?.swiftCode} />
            </Section>
          )}
        </div>

        <div className="awd-modal-foot">
          <button className="awd-btn-ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          {withdrawal.status === "PENDING" && (
            <>
              <button className="awd-btn-danger" onClick={onReject} disabled={isProcessing}>
                {isProcessing ? "..." : "Reject"}
              </button>
              <button className="awd-btn-gold" onClick={onApprove} disabled={isProcessing}>
                {isProcessing ? "..." : "Approve"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="awd-section">
      <h4 className="awd-section-title">{title}</h4>
      {children}
    </div>
  );
}

function Detail({ label, value, highlight }) {
  return (
    <div className="awd-detail">
      <span className="awd-detail-label">{label}</span>
      <span className={`awd-detail-value ${highlight ? "is-highlight" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function LoadingScreen() {
  injectStyles("tictify-admin-withdrawals-css", CSS);
  return (
    <div className="awd-loading">
      <div className="awd-loading-top">
        <div className="awd-spinner" />
        <p>Loading…</p>
      </div>
      <div className="awd-skel-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="awd-skel" style={{ height: 92 }} />
        ))}
      </div>
      <div className="awd-skel" style={{ height: 46, maxWidth: 420 }} />
      <div className="awd-skel-row awd-skel-row-cards">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="awd-skel" style={{ height: 230 }} />
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onLogout }) {
  injectStyles("tictify-admin-withdrawals-css", CSS);
  return (
    <div className="awd-error">
      <div className="awd-error-card">
        <div className="awd-error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="awd-btn-gold" onClick={onLogout}>Login Again</button>
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

@keyframes awd-spin { to { transform:rotate(360deg); } }
@keyframes awd-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes awd-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.awd-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.awd-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.awd-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.awd-mark em { font-style:normal; color:var(--gold); }
.awd-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.awd-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.awd-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.awd-nav-item:hover { color:var(--text); background:var(--card); }
.awd-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.awd-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.awd-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.awd-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.awd-logout svg { width:16px; height:16px; }
.awd-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.awd-topbar { display:none; }
.awd-drawer { display:none; }
.awd-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.awd-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.awd-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── KPI ── */
.awd-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.awd-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:awd-fade .4s ease both; }
.awd-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.awd-kpi-icon { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; flex:0 0 auto; }
.awd-kpi-icon svg { width:18px; height:18px; }
.awd-kpi-icon.is-gold { background:var(--gold-dim); color:var(--gold); }
.awd-kpi-icon.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.awd-kpi-icon.is-danger { background:rgba(224,92,92,.12); color:var(--danger); }
.awd-kpi-content { min-width:0; }
.awd-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.awd-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,2.2vw,24px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }

/* ── Success alert ── */
.awd-success { background:rgba(107,240,160,.1); border:1px solid rgba(107,240,160,.4); color:var(--live); padding:13px 18px; border-radius:var(--r-sm); display:flex; justify-content:space-between; align-items:center; gap:12px; font-weight:600; font-size:14px; animation:awd-fade .3s ease; }
.awd-success-close { background:none; border:none; color:var(--live); font-size:20px; cursor:pointer; line-height:1; }

/* ── Filter ── */
.awd-filter { display:flex; flex-direction:column; gap:10px; }
.awd-filter-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.awd-filter-btns { display:flex; gap:8px; flex-wrap:wrap; }
.awd-filter-btn { background:var(--card); border:1px solid var(--border); color:var(--muted); padding:9px 18px; border-radius:999px; cursor:pointer; font-size:12.5px; font-weight:600; letter-spacing:.04em; transition:color .2s, background .2s, border-color .2s; }
.awd-filter-btn:hover { color:var(--text); border-color:var(--border-h); }
.awd-filter-btn.is-active { background:var(--gold); border-color:var(--gold); color:#080910; }

/* ── Cards ── */
.awd-list { min-height:200px; }
.awd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.awd-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); cursor:pointer; display:flex; flex-direction:column; transition:transform .25s, border-color .25s; animation:awd-fade .4s ease both; overflow:hidden; }
.awd-card:hover { transform:translateY(-3px); border-color:rgba(232,201,106,.4); }
.awd-card-head { padding:18px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.awd-card-who { min-width:0; }
.awd-org-name { font-family:var(--font-h); font-size:15px; font-weight:700; overflow-wrap:anywhere; }
.awd-org-email { font-size:12.5px; color:var(--muted); margin-top:4px; overflow-wrap:anywhere; }
.awd-card-body { padding:18px; display:flex; flex-direction:column; gap:10px; flex:1; }
.awd-info-row { display:flex; justify-content:space-between; gap:10px; font-size:13.5px; }
.awd-info-label { color:var(--muted); }
.awd-amount { font-family:var(--font-h); font-weight:700; color:var(--gold); font-variant-numeric:tabular-nums; }
.awd-account { font-variant-numeric:tabular-nums; letter-spacing:.04em; }
.awd-card-foot { padding:12px; border-top:1px solid var(--border); text-align:center; background:var(--gold-dim); }
.awd-hint { font-size:12px; color:var(--gold); font-weight:600; }

/* ── Badges ── */
.awd-badge { padding:5px 12px; border-radius:999px; font-weight:700; font-size:11px; letter-spacing:.06em; white-space:nowrap; }
.awd-badge.is-pending { background:var(--gold-dim); color:var(--gold); border:1px solid rgba(232,201,106,.35); }
.awd-badge.is-approved { background:var(--live); color:#080910; }
.awd-badge.is-rejected { background:rgba(224,92,92,.15); color:var(--danger); border:1px solid rgba(224,92,92,.35); }

/* ── Empty state ── */
.awd-empty { padding:64px 20px; text-align:center; }
.awd-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin:0 auto 16px; }
.awd-empty-icon svg { width:24px; height:24px; }
.awd-empty-text { color:var(--muted); font-size:14px; }

/* ── Modal ── */
.awd-modal { position:fixed; inset:0; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:clamp(12px,3vw,24px); }
.awd-modal-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); width:min(100%,560px); max-height:90svh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.55); animation:awd-fade .3s ease; }
.awd-modal-head { padding:clamp(18px,3vw,24px); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; gap:12px; position:sticky; top:0; background:var(--surface); z-index:1; }
.awd-modal-title { font-family:var(--font-h); font-weight:700; font-size:clamp(16px,2.4vw,19px); }
.awd-modal-close { background:var(--card); border:1px solid var(--border); color:var(--text); width:34px; height:34px; border-radius:50%; font-size:18px; line-height:1; cursor:pointer; flex:0 0 auto; transition:border-color .2s; }
.awd-modal-close:hover { border-color:var(--border-h); }
.awd-modal-body { padding:clamp(18px,3vw,24px); display:flex; flex-direction:column; gap:22px; }
.awd-section { display:flex; flex-direction:column; gap:6px; }
.awd-section-title { font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:.1em; margin-bottom:6px; }
.awd-detail { display:flex; justify-content:space-between; gap:12px; font-size:14px; padding:8px 0; border-bottom:1px solid var(--border); }
.awd-detail:last-child { border-bottom:none; }
.awd-detail-label { color:var(--muted); }
.awd-detail-value { font-weight:500; text-align:right; overflow-wrap:anywhere; }
.awd-detail-value.is-highlight { font-family:var(--font-h); color:var(--gold); font-weight:700; font-variant-numeric:tabular-nums; }
.awd-modal-foot { padding:clamp(18px,3vw,24px); border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; position:sticky; bottom:0; background:var(--surface); }
.awd-btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text); padding:11px 20px; border-radius:999px; cursor:pointer; font-weight:600; font-size:13.5px; transition:border-color .2s; }
.awd-btn-ghost:hover:not(:disabled) { border-color:var(--border-h); }
.awd-btn-danger { background:rgba(224,92,92,.12); border:1px solid rgba(224,92,92,.45); color:var(--danger); padding:11px 20px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:background .2s; }
.awd-btn-danger:hover:not(:disabled) { background:rgba(224,92,92,.22); }
.awd-btn-gold { background:var(--gold); border:none; color:#080910; padding:12px 22px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:transform .2s, box-shadow .2s; }
.awd-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.awd-btn-ghost:disabled, .awd-btn-danger:disabled, .awd-btn-gold:disabled { opacity:.5; cursor:not-allowed; }

/* ── Loading / skeleton ── */
.awd-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.awd-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.awd-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:awd-spin .9s linear infinite; }
.awd-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:awd-shimmer 1.3s linear infinite; }
.awd-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:16px; }
.awd-skel-row-cards { grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr)); }

/* ── Error ── */
.awd-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.awd-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:awd-fade .35s ease; }
.awd-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.awd-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.awd-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .awd-page { flex-direction:column; }
  .awd-sidebar { display:none; }
  .awd-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .awd-topbar .awd-mark { padding:0; font-size:19px; }
  .awd-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .awd-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .awd-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .awd-burger.is-open span:nth-child(2) { opacity:0; }
  .awd-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .awd-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .awd-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .awd-drawer .awd-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .awd-drawer .awd-nav-item.is-active::before { left:0; }
  .awd-drawer .awd-logout { margin-top:22px; }
}
@media (max-width:480px) {
  .awd-modal { padding:10px; align-items:flex-end; }
  .awd-modal-card { max-height:94svh; }
  .awd-modal-foot { justify-content:stretch; }
  .awd-modal-foot button { flex:1; }
  .awd-filter-btn { flex:1 1 auto; text-align:center; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
