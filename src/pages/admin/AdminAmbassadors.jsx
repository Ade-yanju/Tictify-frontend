/* ═══════════════════════════════════════════════════════════
   AdminAmbassadors.jsx — Tictify 2026 Admin
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
  grad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 4L2 9l10 5 10-5-10-5z" strokeLinejoin="round" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" strokeLinecap="round" />
      <path d="M22 9v5" strokeLinecap="round" />
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
  { label: "Ambassadors", path: "/admin/ambassadors", icon: Ic.grad },
  {
    label: "Affiliates",
    path: "/admin/affiliates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 15l6-6" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1.4" />
        <circle cx="15" cy="15" r="1.4" />
      </svg>
    ),
  },
];

const STATUSES = ["ALL", "APPLIED", "APPROVED", "REJECTED", "REVOKED"];

const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const normStatus = (s) => (s || "APPLIED").toUpperCase();

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminAmbassadors() {
  injectStyles("tictify-admin-ambassadors-css", CSS);
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [leaders, setLeaders] = useState([]);

  async function loadLeaderboard() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ambassadors/leaderboard`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeaders(Array.isArray(data) ? data : []);
    } catch {
      /* leaderboard is non-blocking — leave as-is */
    }
  }

  async function loadAmbassadors() {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ambassadors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Session expired");

      const data = await res.json();
      setAmbassadors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load ambassador applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAmbassadors();
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function handleAction(id, action) {
    if (processingId) return;

    setProcessingId(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ambassadors/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Action failed");

      setSuccessMessage(data.message || `Application ${action}d successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      setSelected(null);
      await Promise.all([loadAmbassadors(), loadLeaderboard()]);
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  function confirmRevoke(id) {
    if (
      window.confirm(
        "Revoke this partner? Their invite code will stop working immediately."
      )
    ) {
      handleAction(id, "revoke");
    }
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onLogout={() => { logout(); navigate("/login"); }} />;

  const filtered = ambassadors.filter(
    (a) => statusFilter === "ALL" || normStatus(a.status) === statusFilter
  );

  const stats = {
    applied: ambassadors.filter((a) => normStatus(a.status) === "APPLIED").length,
    approved: ambassadors.filter((a) => normStatus(a.status) === "APPROVED").length,
    rejected: ambassadors.filter((a) => normStatus(a.status) === "REJECTED").length,
  };

  return (
    <>
      <Shell
        active="/admin/ambassadors"
        title="Campus Ambassadors"
        subtitle="Review and approve Campus Partner applications"
        navigate={navigate}
        onLogout={() => { logout(); navigate("/login"); }}
      >
        {/* Stats Cards */}
        <section className="aam-kpis">
          <StatCard label="Applied" value={stats.applied} tone="gold" icon={Ic.clock} />
          <StatCard label="Approved" value={stats.approved} tone="live" icon={Ic.check} />
          <StatCard label="Rejected" value={stats.rejected} tone="danger" icon={Ic.cross} />
          <StatCard label="Total" value={ambassadors.length} tone="gold" icon={Ic.grad} />
        </section>

        {/* Success Message */}
        {successMessage && (
          <div className="aam-success">
            <span>{successMessage}</span>
            <button className="aam-success-close" onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}

        {/* Partner leaderboard */}
        <section className="aam-lb">
          <h2 className="aam-lb-title">Partner leaderboard</h2>
          {leaders.length === 0 ? (
            <p className="aam-lb-empty">No approved partners yet.</p>
          ) : (
            <div className="aam-lb-rows">
              {leaders.map((l, i) => (
                <div
                  key={l.id}
                  className={`aam-lb-row ${l.status === "REVOKED" ? "is-revoked" : ""}`}
                >
                  <span
                    className={`aam-lb-rank ${
                      i === 0
                        ? "is-1"
                        : i === 1
                          ? "is-2"
                          : i === 2
                            ? "is-3"
                            : ""
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="aam-lb-who">
                    <span className="aam-lb-name">
                      {l.fullName || "Partner"}
                      {l.status === "REVOKED" && (
                        <span className="aam-lb-revoked-badge">REVOKED</span>
                      )}
                    </span>
                    <span className="aam-lb-uni">{l.university || "—"}</span>
                    {l.inviteCode && (
                      <span className="aam-code-badge">{l.inviteCode}</span>
                    )}
                  </div>

                  <div className="aam-lb-stats">
                    <div className="aam-lb-stat">
                      <span className="aam-lb-num">
                        {Number(l.ticketsSold || 0).toLocaleString()}
                      </span>
                      <span className="aam-lb-cap">Tickets</span>
                    </div>
                    <div className="aam-lb-stat">
                      <span className="aam-lb-num">{fmtNaira(l.revenue)}</span>
                      <span className="aam-lb-cap">Revenue</span>
                    </div>
                    <div className="aam-lb-stat">
                      <span className="aam-lb-num">
                        {Number(l.organizersOnboarded || 0).toLocaleString()}
                      </span>
                      <span className="aam-lb-cap">Organizers</span>
                    </div>
                    <div className="aam-lb-stat">
                      <span className="aam-lb-num">
                        {fmtNaira(l.commissionEarned)}
                      </span>
                      <span className="aam-lb-cap">Commission</span>
                    </div>
                  </div>

                  <div className="aam-lb-actions">
                    {l.status === "APPROVED" ? (
                      <button
                        className="aam-btn-danger aam-btn-sm"
                        disabled={processingId === l.id}
                        onClick={() => confirmRevoke(l.id)}
                      >
                        {processingId === l.id ? "..." : "Revoke"}
                      </button>
                    ) : (
                      <button
                        className="aam-btn-gold-ghost aam-btn-sm"
                        disabled={processingId === l.id}
                        onClick={() => handleAction(l.id, "reinstate")}
                      >
                        {processingId === l.id ? "..." : "Reinstate"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Filter */}
        <section className="aam-filter">
          <div className="aam-filter-label">Filter by Status</div>
          <div className="aam-filter-btns">
            {STATUSES.map((status) => (
              <button
                key={status}
                className={`aam-filter-btn ${statusFilter === status ? "is-active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* List */}
        <section className="aam-list">
          {filtered.length === 0 ? (
            <div className="aam-empty">
              <div className="aam-empty-icon">{Ic.grad}</div>
              <p className="aam-empty-text">No ambassador applications</p>
            </div>
          ) : (
            <div className="aam-grid">
              {filtered.map((amb) => (
                <div
                  key={amb._id}
                  className="aam-card"
                  onClick={() => setSelected(amb)}
                >
                  <div className="aam-card-head">
                    <div className="aam-card-who">
                      <h4 className="aam-amb-name">{amb.fullName || "Applicant"}</h4>
                      <p className="aam-amb-uni">{amb.university || "—"}</p>
                    </div>
                    <StatusBadge status={normStatus(amb.status)} />
                  </div>

                  <div className="aam-card-body">
                    <div className="aam-info-row">
                      <span className="aam-info-label">Level</span>
                      <span>{amb.level || "—"}</span>
                    </div>

                    <div className="aam-info-row">
                      <span className="aam-info-label">WhatsApp</span>
                      <span className="aam-num">{amb.whatsapp || "—"}</span>
                    </div>

                    <div className="aam-info-row">
                      <span className="aam-info-label">Organizers known</span>
                      <span className="aam-num">{amb.organizersKnown ?? 0}</span>
                    </div>

                    <div className="aam-info-row">
                      <span className="aam-info-label">Organizations</span>
                      <span className="aam-num">{amb.organizationsCount ?? 0}</span>
                    </div>

                    {amb.motivation && (
                      <p className="aam-motivation">“{amb.motivation}”</p>
                    )}

                    {normStatus(amb.status) === "APPROVED" && amb.inviteCode && (
                      <span className="aam-code-badge">{amb.inviteCode}</span>
                    )}
                  </div>

                  {normStatus(amb.status) === "APPLIED" && (
                    <div className="aam-card-foot">
                      <p className="aam-hint">Click to review</p>
                    </div>
                  )}

                  {normStatus(amb.status) === "APPROVED" && (
                    <div className="aam-card-actions">
                      <button
                        className="aam-btn-danger aam-btn-sm"
                        disabled={processingId === amb._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmRevoke(amb._id);
                        }}
                      >
                        {processingId === amb._id ? "..." : "Revoke"}
                      </button>
                    </div>
                  )}

                  {normStatus(amb.status) === "REVOKED" && (
                    <div className="aam-card-actions">
                      <button
                        className="aam-btn-gold-ghost aam-btn-sm"
                        disabled={processingId === amb._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(amb._id, "reinstate");
                        }}
                      >
                        {processingId === amb._id ? "..." : "Reinstate"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Shell>

      {/* Modal */}
      {selected && (
        <AmbassadorModal
          ambassador={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleAction(selected._id, "approve")}
          onReject={() => handleAction(selected._id, "reject")}
          onRevoke={() => confirmRevoke(selected._id)}
          onReinstate={() => handleAction(selected._id, "reinstate")}
          isProcessing={processingId === selected._id}
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
      className={`aam-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      {n.icon}
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="aam-page">
      <aside className="aam-sidebar">
        <div className="aam-mark">Tic<em>tify</em></div>
        <nav className="aam-nav">{navButtons}</nav>
        <button className="aam-logout" onClick={onLogout}>
          {Ic.out}
          <span>Logout</span>
        </button>
      </aside>

      <div className="aam-body">
        <header className="aam-topbar">
          <div className="aam-mark">Tic<em>tify</em></div>
          <button
            className={`aam-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`aam-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="aam-logout" onClick={onLogout}>
            {Ic.out}
            <span>Logout</span>
          </button>
        </div>

        <div className="aam-content">
          <header className="aam-phead">
            <h1 className="aam-title">{title}</h1>
            <p className="aam-subtitle">{subtitle}</p>
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
    <div className="aam-kpi">
      <div className={`aam-kpi-icon is-${tone}`}>{icon}</div>
      <div className="aam-kpi-content">
        <p className="aam-kpi-label">{label}</p>
        <h3 className="aam-kpi-value">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const badgeClass = {
    APPLIED: "is-applied",
    APPROVED: "is-approved",
    REJECTED: "is-rejected",
    REVOKED: "is-revoked",
  };
  return (
    <span className={`aam-badge ${badgeClass[status] || "is-applied"}`}>
      {status}
    </span>
  );
}

function AmbassadorModal({
  ambassador,
  onClose,
  onApprove,
  onReject,
  onRevoke,
  onReinstate,
  isProcessing,
}) {
  const status = normStatus(ambassador.status);
  return (
    <div className="aam-modal" onClick={onClose}>
      <div className="aam-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="aam-modal-head">
          <h2 className="aam-modal-title">Review Ambassador Application</h2>
          <button className="aam-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="aam-modal-body">
          <Section title="Applicant">
            <Detail label="Full Name" value={ambassador.fullName} highlight />
            <Detail label="Email" value={ambassador.email} />
            <Detail label="WhatsApp" value={ambassador.whatsapp} />
            <Detail label="Status" value={status} />
            <Detail
              label="Applied"
              value={
                ambassador.createdAt
                  ? new Date(ambassador.createdAt).toLocaleDateString()
                  : "—"
              }
            />
          </Section>

          <Section title="Campus">
            <Detail label="University" value={ambassador.university} />
            <Detail label="Department" value={ambassador.department} />
            <Detail label="Level" value={ambassador.level} />
            <Detail label="Organizers known" value={ambassador.organizersKnown ?? 0} />
            <Detail label="Organizations" value={ambassador.organizationsCount ?? 0} />
          </Section>

          {ambassador.socials && (
            <Section title="Social Media">
              <p className="aam-longtext">{ambassador.socials}</p>
            </Section>
          )}

          <Section title="Motivation">
            <p className="aam-longtext">{ambassador.motivation || "—"}</p>
          </Section>

          {status === "APPROVED" && ambassador.inviteCode && (
            <Section title="Invite Code">
              <Detail label="Code" value={ambassador.inviteCode} highlight />
            </Section>
          )}
        </div>

        <div className="aam-modal-foot">
          <button className="aam-btn-ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          {status === "APPLIED" && (
            <>
              <button className="aam-btn-danger" onClick={onReject} disabled={isProcessing}>
                {isProcessing ? "..." : "Reject"}
              </button>
              <button className="aam-btn-gold" onClick={onApprove} disabled={isProcessing}>
                {isProcessing ? "..." : "Approve"}
              </button>
            </>
          )}
          {status === "APPROVED" && (
            <button className="aam-btn-danger" onClick={onRevoke} disabled={isProcessing}>
              {isProcessing ? "..." : "Revoke"}
            </button>
          )}
          {status === "REVOKED" && (
            <button className="aam-btn-gold-ghost" onClick={onReinstate} disabled={isProcessing}>
              {isProcessing ? "..." : "Reinstate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="aam-section">
      <h4 className="aam-section-title">{title}</h4>
      {children}
    </div>
  );
}

function Detail({ label, value, highlight }) {
  return (
    <div className="aam-detail">
      <span className="aam-detail-label">{label}</span>
      <span className={`aam-detail-value ${highlight ? "is-highlight" : ""}`}>
        {value === 0 ? "0" : value || "—"}
      </span>
    </div>
  );
}

function LoadingScreen() {
  injectStyles("tictify-admin-ambassadors-css", CSS);
  return (
    <div className="aam-loading">
      <div className="aam-loading-top">
        <div className="aam-spinner" />
        <p>Loading…</p>
      </div>
      <div className="aam-skel-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aam-skel" style={{ height: 92 }} />
        ))}
      </div>
      <div className="aam-skel" style={{ height: 46, maxWidth: 420 }} />
      <div className="aam-skel-row aam-skel-row-cards">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aam-skel" style={{ height: 230 }} />
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onLogout }) {
  injectStyles("tictify-admin-ambassadors-css", CSS);
  return (
    <div className="aam-error">
      <div className="aam-error-card">
        <div className="aam-error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="aam-btn-gold" onClick={onLogout}>Login Again</button>
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

@keyframes aam-spin { to { transform:rotate(360deg); } }
@keyframes aam-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes aam-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.aam-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.aam-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.aam-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.aam-mark em { font-style:normal; color:var(--gold); }
.aam-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.aam-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.aam-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.aam-nav-item:hover { color:var(--text); background:var(--card); }
.aam-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.aam-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.aam-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.aam-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.aam-logout svg { width:16px; height:16px; }
.aam-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.aam-topbar { display:none; }
.aam-drawer { display:none; }
.aam-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.aam-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.aam-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── KPI ── */
.aam-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.aam-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:aam-fade .4s ease both; }
.aam-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.aam-kpi-icon { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; flex:0 0 auto; }
.aam-kpi-icon svg { width:18px; height:18px; }
.aam-kpi-icon.is-gold { background:var(--gold-dim); color:var(--gold); }
.aam-kpi-icon.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.aam-kpi-icon.is-danger { background:rgba(224,92,92,.12); color:var(--danger); }
.aam-kpi-content { min-width:0; }
.aam-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aam-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,2.2vw,24px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }

/* ── Success alert ── */
.aam-success { background:rgba(107,240,160,.1); border:1px solid rgba(107,240,160,.4); color:var(--live); padding:13px 18px; border-radius:var(--r-sm); display:flex; justify-content:space-between; align-items:center; gap:12px; font-weight:600; font-size:14px; animation:aam-fade .3s ease; }
.aam-success-close { background:none; border:none; color:var(--live); font-size:20px; cursor:pointer; line-height:1; }

/* ── Filter ── */
.aam-filter { display:flex; flex-direction:column; gap:10px; }
.aam-filter-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aam-filter-btns { display:flex; gap:8px; flex-wrap:wrap; }
.aam-filter-btn { background:var(--card); border:1px solid var(--border); color:var(--muted); padding:9px 18px; border-radius:999px; cursor:pointer; font-size:12.5px; font-weight:600; letter-spacing:.04em; transition:color .2s, background .2s, border-color .2s; }
.aam-filter-btn:hover { color:var(--text); border-color:var(--border-h); }
.aam-filter-btn.is-active { background:var(--gold); border-color:var(--gold); color:#080910; }

/* ── Cards ── */
.aam-list { min-height:200px; }
.aam-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.aam-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); cursor:pointer; display:flex; flex-direction:column; transition:transform .25s, border-color .25s; animation:aam-fade .4s ease both; overflow:hidden; }
.aam-card:hover { transform:translateY(-3px); border-color:rgba(232,201,106,.4); }
.aam-card-head { padding:18px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.aam-card-who { min-width:0; }
.aam-amb-name { font-family:var(--font-h); font-size:15px; font-weight:700; overflow-wrap:anywhere; }
.aam-amb-uni { font-size:12.5px; color:var(--muted); margin-top:4px; overflow-wrap:anywhere; }
.aam-card-body { padding:18px; display:flex; flex-direction:column; gap:10px; flex:1; }
.aam-info-row { display:flex; justify-content:space-between; gap:10px; font-size:13.5px; }
.aam-info-label { color:var(--muted); }
.aam-num { font-variant-numeric:tabular-nums; }
.aam-motivation { color:var(--muted); font-size:13px; line-height:1.6; font-style:italic; margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.aam-code-badge { align-self:flex-start; margin-top:4px; font-family:ui-monospace, monospace; font-size:12px; font-weight:700; letter-spacing:.06em; color:var(--gold); background:var(--gold-dim); border:1px dashed rgba(232,201,106,.45); border-radius:8px; padding:5px 10px; }
.aam-card-foot { padding:12px; border-top:1px solid var(--border); text-align:center; background:var(--gold-dim); }
.aam-hint { font-size:12px; color:var(--gold); font-weight:600; }

/* ── Badges ── */
.aam-badge { padding:5px 12px; border-radius:999px; font-weight:700; font-size:11px; letter-spacing:.06em; white-space:nowrap; }
.aam-badge.is-applied { background:var(--gold-dim); color:var(--gold); border:1px solid rgba(232,201,106,.35); }
.aam-badge.is-approved { background:var(--live); color:#080910; }
.aam-badge.is-rejected { background:rgba(224,92,92,.15); color:var(--danger); border:1px solid rgba(224,92,92,.35); }
.aam-badge.is-revoked { background:rgba(224,92,92,.15); color:var(--danger); border:1px solid rgba(224,92,92,.35); }

/* ── Card actions (revoke / reinstate) ── */
.aam-card-actions { padding:12px 18px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; }
.aam-btn-sm { padding:8px 16px !important; font-size:12.5px !important; }
.aam-btn-gold-ghost { background:transparent; border:1px solid rgba(232,201,106,.45); color:var(--gold); padding:11px 20px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:background .2s, border-color .2s; }
.aam-btn-gold-ghost:hover:not(:disabled) { background:var(--gold-dim); border-color:var(--gold); }
.aam-btn-gold-ghost:disabled { opacity:.5; cursor:not-allowed; }

/* ── Partner leaderboard ── */
.aam-lb { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.6vw,24px); animation:aam-fade .4s ease both; }
.aam-lb-title { font-family:var(--font-h); font-weight:700; font-size:clamp(16px,2vw,19px); letter-spacing:-.01em; margin-bottom:16px; }
.aam-lb-empty { color:var(--muted); font-size:14px; padding:8px 0; }
.aam-lb-rows { display:flex; flex-direction:column; gap:8px; }
.aam-lb-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:13px 15px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); transition:border-color .2s; }
.aam-lb-row:hover { border-color:var(--border-h); }
.aam-lb-row.is-revoked { opacity:.55; }
.aam-lb-rank { flex:0 0 auto; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-family:var(--font-h); font-weight:800; font-size:13px; background:rgba(255,255,255,.05); border:1px solid var(--border); color:var(--muted); font-variant-numeric:tabular-nums; }
.aam-lb-rank.is-1 { background:var(--gold); border-color:var(--gold); color:#080910; box-shadow:0 0 14px var(--gold-glo); }
.aam-lb-rank.is-2 { background:rgba(220,224,232,.85); border-color:rgba(220,224,232,.85); color:#080910; }
.aam-lb-rank.is-3 { background:rgba(205,140,90,.85); border-color:rgba(205,140,90,.85); color:#080910; }
.aam-lb-who { display:flex; flex-direction:column; gap:3px; min-width:140px; flex:1 1 160px; }
.aam-lb-name { font-family:var(--font-h); font-weight:700; font-size:14px; overflow-wrap:anywhere; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.aam-lb-revoked-badge { font-family:var(--font-b); font-size:10px; font-weight:700; letter-spacing:.08em; color:var(--danger); background:rgba(224,92,92,.15); border:1px solid rgba(224,92,92,.35); border-radius:999px; padding:2px 8px; white-space:nowrap; }
.aam-lb-uni { font-size:12px; color:var(--muted); overflow-wrap:anywhere; }
.aam-lb-who .aam-code-badge { margin-top:2px; }
.aam-lb-stats { display:flex; gap:clamp(12px,2vw,26px); flex-wrap:wrap; flex:2 1 260px; }
.aam-lb-stat { display:flex; flex-direction:column; gap:2px; min-width:64px; }
.aam-lb-num { font-family:var(--font-h); font-weight:700; font-size:14px; color:var(--text); font-variant-numeric:tabular-nums; white-space:nowrap; }
.aam-lb-cap { font-size:10.5px; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:var(--muted); }
.aam-lb-actions { flex:0 0 auto; margin-left:auto; }

/* ── Empty state ── */
.aam-empty { padding:64px 20px; text-align:center; }
.aam-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin:0 auto 16px; }
.aam-empty-icon svg { width:24px; height:24px; }
.aam-empty-text { color:var(--muted); font-size:14px; }

/* ── Modal ── */
.aam-modal { position:fixed; inset:0; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:clamp(12px,3vw,24px); }
.aam-modal-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); width:min(100%,560px); max-height:90svh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.55); animation:aam-fade .3s ease; }
.aam-modal-head { padding:clamp(18px,3vw,24px); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; gap:12px; position:sticky; top:0; background:var(--surface); z-index:1; }
.aam-modal-title { font-family:var(--font-h); font-weight:700; font-size:clamp(16px,2.4vw,19px); }
.aam-modal-close { background:var(--card); border:1px solid var(--border); color:var(--text); width:34px; height:34px; border-radius:50%; font-size:18px; line-height:1; cursor:pointer; flex:0 0 auto; transition:border-color .2s; }
.aam-modal-close:hover { border-color:var(--border-h); }
.aam-modal-body { padding:clamp(18px,3vw,24px); display:flex; flex-direction:column; gap:22px; }
.aam-section { display:flex; flex-direction:column; gap:6px; }
.aam-section-title { font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:.1em; margin-bottom:6px; }
.aam-detail { display:flex; justify-content:space-between; gap:12px; font-size:14px; padding:8px 0; border-bottom:1px solid var(--border); }
.aam-detail:last-child { border-bottom:none; }
.aam-detail-label { color:var(--muted); }
.aam-detail-value { font-weight:500; text-align:right; overflow-wrap:anywhere; }
.aam-detail-value.is-highlight { font-family:var(--font-h); color:var(--gold); font-weight:700; }
.aam-longtext { color:var(--text); font-size:14px; line-height:1.7; white-space:pre-wrap; overflow-wrap:anywhere; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 16px; }
.aam-modal-foot { padding:clamp(18px,3vw,24px); border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; position:sticky; bottom:0; background:var(--surface); }
.aam-btn-ghost { background:transparent; border:1px solid var(--border); color:var(--text); padding:11px 20px; border-radius:999px; cursor:pointer; font-weight:600; font-size:13.5px; transition:border-color .2s; }
.aam-btn-ghost:hover:not(:disabled) { border-color:var(--border-h); }
.aam-btn-danger { background:rgba(224,92,92,.12); border:1px solid rgba(224,92,92,.45); color:var(--danger); padding:11px 20px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:background .2s; }
.aam-btn-danger:hover:not(:disabled) { background:rgba(224,92,92,.22); }
.aam-btn-gold { background:var(--gold); border:none; color:#080910; padding:12px 22px; border-radius:999px; cursor:pointer; font-weight:700; font-size:13.5px; transition:transform .2s, box-shadow .2s; }
.aam-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.aam-btn-ghost:disabled, .aam-btn-danger:disabled, .aam-btn-gold:disabled { opacity:.5; cursor:not-allowed; }

/* ── Loading / skeleton ── */
.aam-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.aam-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.aam-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:aam-spin .9s linear infinite; }
.aam-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:aam-shimmer 1.3s linear infinite; }
.aam-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:16px; }
.aam-skel-row-cards { grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr)); }

/* ── Error ── */
.aam-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.aam-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:aam-fade .35s ease; }
.aam-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.aam-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.aam-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .aam-page { flex-direction:column; }
  .aam-sidebar { display:none; }
  .aam-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .aam-topbar .aam-mark { padding:0; font-size:19px; }
  .aam-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .aam-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .aam-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .aam-burger.is-open span:nth-child(2) { opacity:0; }
  .aam-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .aam-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .aam-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .aam-drawer .aam-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .aam-drawer .aam-nav-item.is-active::before { left:0; }
  .aam-drawer .aam-logout { margin-top:22px; }
}
@media (max-width:480px) {
  .aam-modal { padding:10px; align-items:flex-end; }
  .aam-modal-card { max-height:94svh; }
  .aam-modal-foot { justify-content:stretch; }
  .aam-modal-foot button { flex:1; }
  .aam-filter-btn { flex:1 1 auto; text-align:center; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
