/* ═══════════════════════════════════════════════════════════
   AdminOrganizers.jsx — Tictify 2026 Admin
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
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6H4a1 1 0 00-1 1c0 2.2 1.8 4 4 4M17 6h3a1 1 0 011 1c0 2.2-1.8 4-4 4" strokeLinecap="round" />
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

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminOrganizers() {
  injectStyles("tictify-admin-organizers-css", CSS);
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  /* ================= LOAD ORGANIZERS ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/organizers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Unauthorized or session expired");

        const data = await res.json();
        setOrganizers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load organizers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div className="aor-error">
        <div className="aor-error-card">
          <div className="aor-error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="aor-btn-gold" onClick={handleLogout}>
            Login Again
          </button>
        </div>
      </div>
    );
  }

  const topOrganizers = organizers.slice(0, 5);

  return (
    <Shell
      active="/admin/organizers"
      title="Organizers"
      subtitle="Top performers & platform contributors"
      navigate={navigate}
      onLogout={handleLogout}
    >
      {/* ================= HEADER ACTIONS ================= */}
      <div className="aor-actions">
        <button
          className="aor-btn-broadcast"
          onClick={() => setBroadcastOpen(true)}
        >
          <span aria-hidden="true">✉️</span> Email all organizers
        </button>
      </div>

      {/* ================= LEADERBOARD ================= */}
      <section className="aor-card">
        <div className="aor-card-head">
          <span className="aor-card-head-icon">{Ic.trophy}</span>
          <h3 className="aor-card-title">Top Performing Organizers</h3>
        </div>

        {topOrganizers.length === 0 ? (
          <p className="aor-muted">No organizers yet.</p>
        ) : (
          topOrganizers.map((o, i) => (
            <div
              key={o._id}
              className="aor-leader-row"
              onClick={() => setSelectedOrg(o)}
            >
              <span className={`aor-rank ${i === 0 ? "is-first" : ""}`}>#{i + 1}</span>

              <div className="aor-leader-info">
                <strong className="aor-name">{o.name}</strong>
                <span className="aor-muted">{o.email}</span>
              </div>

              <strong className="aor-leader-revenue">
                ₦{(o.revenue || 0).toLocaleString()}
              </strong>
            </div>
          ))
        )}
      </section>

      {/* ================= FULL LIST ================= */}
      <section className="aor-list">
        {organizers.map((o) => (
          <div
            key={o._id}
            className="aor-org-card"
            onClick={() => setSelectedOrg(o)}
          >
            <div className="aor-org-info">
              <strong className="aor-name">{o.name}</strong>
              <p className="aor-muted">{o.email}</p>
            </div>

            <Stat label="Events" value={o.events ?? 0} />
            <Stat label="Tickets Sold" value={o.ticketsSold ?? 0} />
            <Stat
              label="Revenue"
              value={`₦${(o.revenue || 0).toLocaleString()}`}
            />
          </div>
        ))}
      </section>

      {/* ================= ORGANIZER DETAIL ================= */}
      {selectedOrg && (
        <div
          className="aor-modal-overlay"
          onClick={() => setSelectedOrg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="aor-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="aor-modal-close"
              onClick={() => setSelectedOrg(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="aor-modal-avatar">
              {(selectedOrg.name || "?").charAt(0).toUpperCase()}
            </div>
            <h3 className="aor-modal-name">{selectedOrg.name}</h3>
            <a className="aor-modal-email" href={`mailto:${selectedOrg.email}`}>
              {selectedOrg.email}
            </a>
            <div className="aor-modal-stats">
              <div className="aor-modal-stat">
                <span className="aor-modal-stat-label">Events</span>
                <strong>{selectedOrg.events ?? 0}</strong>
              </div>
              <div className="aor-modal-stat">
                <span className="aor-modal-stat-label">Tickets Sold</span>
                <strong>{selectedOrg.ticketsSold ?? 0}</strong>
              </div>
              <div className="aor-modal-stat">
                <span className="aor-modal-stat-label">Revenue</span>
                <strong>₦{(selectedOrg.revenue || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BROADCAST COMPOSE MODAL ================= */}
      {broadcastOpen && (
        <BroadcastModal onClose={() => setBroadcastOpen(false)} />
      )}
    </Shell>
  );
}

/* ══════════════════════════════════════════════════════════
   BROADCAST COMPOSE MODAL
══════════════════════════════════════════════════════════ */
const DEFAULT_SUBJECT = "New on Tictify: what's improved for you";
const DEFAULT_BODY = `Hi [First Name],

Thanks for being part of Tictify. We've shipped a lot lately to help you sell more and get paid faster, and I wanted to make sure you're getting the most out of it:

- You keep the full ticket price — the platform and payment fees are added on top and paid by the guest.
- Withdraw your earnings to your Nigerian bank account, protected by an email verification code so no one can move your funds without you.
- Sell right up to the gate — fast, secure QR entry, including offline scanning when the venue network is weak.
- Promoter and affiliate links, plus discount and early-bird codes, to push your sales harder.
- A real-time sales dashboard so you always know exactly what's sold and what's left.

If you've got an event coming up, now's a great time to set it up at tictify.ng. Just reply to this email if you'd like a hand — we're happy to help.

Warm regards,
[Your Name]
Tictify · tictify.ng · tictify@gmail.com`;

function BroadcastModal({ onClose }) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);

  const [recipients, setRecipients] = useState([]);
  const [count, setCount] = useState(null);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [recipientsError, setRecipientsError] = useState("");

  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [failedList, setFailedList] = useState([]);
  const [inlineError, setInlineError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  /* ---- Escape to close ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  /* ---- Load recipient count/preview on open ---- */
  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        const res = await fetch(`${API}/api/admin/broadcast/recipients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load organizer list.");
        const data = await res.json();
        setCount(data.count ?? 0);
        setRecipients(Array.isArray(data.recipients) ? data.recipients : []);
      } catch (err) {
        setRecipientsError(err.message || "Could not load organizer list.");
      } finally {
        setLoadingRecipients(false);
      }
    }
    load();
  }, [API]);

  function resetMessages() {
    setTestMsg("");
    setResultMsg("");
    setFailedList([]);
    setInlineError("");
  }

  async function post(payload) {
    const token = getToken();
    const res = await fetch(`${API}/api/admin/broadcast/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Something went wrong. Please try again.");
    }
    return data;
  }

  async function handleTest() {
    resetMessages();
    setSending(true);
    try {
      const data = await post({ subject, body, test: true });
      if (data.ok) {
        setTestMsg(`Test sent to ${data.sentTo} — check it looks right.`);
      } else {
        setInlineError(
          `Test could not be sent to ${data.sentTo}. Check the email provider setup and try again.`,
        );
      }
    } catch (err) {
      setInlineError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleSendAll() {
    resetMessages();
    setSending(true);
    try {
      const data = await post({ subject, body });
      setConfirming(false);
      setResultMsg(
        `Sent to ${data.sent} of ${data.total}.` +
          (data.failed ? ` (${data.failed} failed)` : ""),
      );
      setFailedList(Array.isArray(data.failedList) ? data.failedList : []);
    } catch (err) {
      setInlineError(err.message);
    } finally {
      setSending(false);
    }
  }

  const preview = recipients.slice(0, 8);

  return (
    <div
      className="aor-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aor-bc-title"
    >
      <div
        className="aor-bc-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="aor-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h3 className="aor-bc-title" id="aor-bc-title">
          ✉️ Email all organizers
        </h3>

        {/* recipients summary */}
        <div className="aor-bc-recipients">
          {loadingRecipients ? (
            <p className="aor-muted">Loading recipients…</p>
          ) : recipientsError ? (
            <p className="aor-bc-inline-error">{recipientsError}</p>
          ) : (
            <>
              <p className="aor-bc-count">
                This will send to <strong>{count}</strong> organizer
                {count === 1 ? "" : "s"}.
              </p>
              {preview.length > 0 && (
                <div className="aor-bc-preview">
                  {preview.map((r, i) => (
                    <div key={i} className="aor-bc-preview-row">
                      <span className="aor-bc-preview-name">{r.name || "—"}</span>
                      <span className="aor-bc-preview-email">{r.email}</span>
                    </div>
                  ))}
                  {count > preview.length && (
                    <p className="aor-muted aor-bc-more">
                      + {count - preview.length} more
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* subject */}
        <label className="aor-bc-label" htmlFor="aor-bc-subject">
          Subject
        </label>
        <input
          id="aor-bc-subject"
          className="aor-bc-input"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={sending}
        />

        {/* body */}
        <label className="aor-bc-label" htmlFor="aor-bc-body">
          Message
        </label>
        <textarea
          id="aor-bc-body"
          className="aor-bc-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending}
          rows={16}
        />
        <p className="aor-bc-caption">
          Tip: [First Name] is filled in automatically for each organizer.
          Replace [Your Name] with your name before sending.
        </p>

        {/* messages */}
        {testMsg && <p className="aor-bc-ok">{testMsg}</p>}
        {resultMsg && (
          <div className="aor-bc-ok">
            <p>{resultMsg}</p>
            {failedList.length > 0 && (
              <ul className="aor-bc-failed">
                {failedList.map((f, i) => (
                  <li key={i}>
                    {f.email} — {f.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {inlineError && <p className="aor-bc-inline-error">{inlineError}</p>}

        {/* actions */}
        {confirming ? (
          <div className="aor-bc-confirm">
            <p className="aor-bc-confirm-text">
              This emails {count} organizer{count === 1 ? "" : "s"}. Send now?
            </p>
            <div className="aor-bc-btn-row">
              <button
                className="aor-btn-gold aor-bc-btn"
                onClick={handleSendAll}
                disabled={sending}
              >
                {sending ? <span className="aor-spinner aor-bc-spin" /> : null}
                {sending ? "Sending…" : "Yes, send"}
              </button>
              <button
                className="aor-bc-btn-ghost"
                onClick={() => setConfirming(false)}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="aor-bc-btn-row">
            <button
              className="aor-bc-btn-ghost"
              onClick={handleTest}
              disabled={sending || loadingRecipients}
            >
              {sending ? "Working…" : "Send test to me"}
            </button>
            <button
              className="aor-btn-gold aor-bc-btn"
              onClick={() => {
                resetMessages();
                setConfirming(true);
              }}
              disabled={sending || loadingRecipients || !count}
            >
              Send to all {count ?? ""}
            </button>
          </div>
        )}

        <p className="aor-bc-note">
          Free email tier sends a limited number per day — if you have many
          organizers, some may queue for tomorrow.
        </p>
      </div>
    </div>
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
      className={`aor-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      {n.icon}
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="aor-page">
      <aside className="aor-sidebar">
        <div className="aor-mark">Tic<em>tify</em></div>
        <nav className="aor-nav">{navButtons}</nav>
        <button className="aor-logout" onClick={onLogout}>
          {Ic.out}
          <span>Logout</span>
        </button>
      </aside>

      <div className="aor-body">
        <header className="aor-topbar">
          <div className="aor-mark">Tic<em>tify</em></div>
          <button
            className={`aor-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`aor-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="aor-logout" onClick={onLogout}>
            {Ic.out}
            <span>Logout</span>
          </button>
        </div>

        <div className="aor-content">
          <header className="aor-phead">
            <h1 className="aor-title">{title}</h1>
            <p className="aor-subtitle">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Stat({ label, value }) {
  return (
    <div className="aor-stat">
      <span className="aor-stat-label">{label}</span>
      <strong className="aor-stat-value">{value}</strong>
    </div>
  );
}

function LoadingModal() {
  injectStyles("tictify-admin-organizers-css", CSS);
  return (
    <div className="aor-loading">
      <div className="aor-loading-top">
        <div className="aor-spinner" />
        <p>Loading organizers…</p>
      </div>
      <div className="aor-skel" style={{ height: 280 }} />
      <div className="aor-skel-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aor-skel" style={{ height: 88 }} />
        ))}
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

@keyframes aor-spin { to { transform:rotate(360deg); } }
@keyframes aor-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes aor-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.aor-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.aor-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.aor-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.aor-mark em { font-style:normal; color:var(--gold); }
.aor-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.aor-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.aor-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.aor-nav-item:hover { color:var(--text); background:var(--card); }
.aor-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.aor-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.aor-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.aor-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.aor-logout svg { width:16px; height:16px; }
.aor-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.aor-topbar { display:none; }
.aor-drawer { display:none; }
.aor-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.aor-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.aor-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }
.aor-muted { color:var(--muted); font-size:13.5px; overflow-wrap:anywhere; }
.aor-name { font-weight:600; font-size:14.5px; overflow-wrap:anywhere; }

/* ── Leaderboard ── */
.aor-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,2.6vw,26px); animation:aor-fade .4s ease both; }
.aor-card-head { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.aor-card-head-icon { width:38px; height:38px; border-radius:12px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; flex:0 0 auto; }
.aor-card-head-icon svg { width:18px; height:18px; }
.aor-card-title { font-family:var(--font-h); font-weight:700; font-size:16px; }
.aor-leader-row { display:grid; grid-template-columns:44px 1fr auto; gap:14px; align-items:center; padding:14px 4px; border-bottom:1px solid var(--border); cursor:pointer; border-radius:var(--r-sm); transition:background .2s; }
.aor-leader-row:last-child { border-bottom:none; }
.aor-leader-row:hover { background:rgba(255,255,255,0.03); }
.aor-rank { font-family:var(--font-h); font-weight:800; font-size:14px; color:var(--muted); display:grid; place-items:center; width:36px; height:36px; border-radius:50%; border:1px dashed var(--border-h); font-variant-numeric:tabular-nums; }
.aor-rank.is-first { color:var(--gold); border-color:rgba(232,201,106,.5); background:var(--gold-dim); }
.aor-leader-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
.aor-leader-revenue { font-family:var(--font-h); font-weight:700; font-size:15px; color:var(--gold); font-variant-numeric:tabular-nums; white-space:nowrap; }

/* ── Full list ── */
.aor-list { display:grid; gap:clamp(10px,1.6vw,14px); }
.aor-org-card { display:grid; grid-template-columns:1fr; gap:14px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); cursor:pointer; transition:transform .25s, border-color .25s; animation:aor-fade .4s ease both; }
.aor-org-card:hover { transform:translateY(-2px); border-color:rgba(232,201,106,.4); }
.aor-org-info { min-width:0; display:flex; flex-direction:column; gap:2px; }
.aor-stat { display:flex; flex-direction:column; gap:2px; }
.aor-stat-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aor-stat-value { font-family:var(--font-h); font-weight:700; font-size:15px; font-variant-numeric:tabular-nums; }

/* ── Loading / skeleton ── */
.aor-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.aor-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.aor-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:aor-spin .9s linear infinite; }
.aor-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:aor-shimmer 1.3s linear infinite; }
.aor-skel-row { display:grid; gap:14px; }

/* ── Error ── */
.aor-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.aor-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:aor-fade .35s ease; }

/* ── Organizer detail modal ── */
.aor-modal-overlay { position:fixed; inset:0; background:rgba(8,9,16,.78); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:200; animation:aor-fade .2s ease; }
.aor-modal { position:relative; width:min(100%,440px); background:var(--surface); border:1px solid var(--border-h); border-radius:var(--r); padding:clamp(26px,5vw,38px); text-align:center; animation:aor-fade .3s ease; }
.aor-modal-close { position:absolute; top:14px; right:16px; background:none; border:none; color:var(--muted); font-size:26px; line-height:1; cursor:pointer; }
.aor-modal-close:hover { color:var(--text); }
.aor-modal-avatar { width:64px; height:64px; border-radius:50%; margin:0 auto 14px; background:var(--gold-dim); border:1px solid var(--gold); color:var(--gold); font-family:var(--font-h); font-size:26px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.aor-modal-name { font-family:var(--font-h); font-size:20px; margin-bottom:4px; }
.aor-modal-email { display:block; color:var(--muted); font-size:13px; text-decoration:none; margin-bottom:22px; word-break:break-all; }
.aor-modal-email:hover { color:var(--gold); }
.aor-modal-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.aor-modal-stat { background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 8px; display:flex; flex-direction:column; gap:6px; }
.aor-modal-stat-label { font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aor-modal-stat strong { font-size:15px; }
@media (max-width:380px) { .aor-modal-stats { grid-template-columns:1fr; } }
.aor-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.aor-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.aor-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }
.aor-btn-gold { background:var(--gold); color:#080910; border:none; border-radius:999px; font-weight:700; font-size:14px; padding:13px 26px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.aor-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

/* ── Header actions / broadcast button ── */
.aor-actions { display:flex; justify-content:flex-end; }
.aor-btn-broadcast { display:inline-flex; align-items:center; gap:8px; background:var(--gold); color:#080910; border:none; border-radius:999px; font-family:var(--font-b); font-weight:700; font-size:14px; padding:12px 20px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.aor-btn-broadcast:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

/* ── Broadcast compose modal ── */
.aor-bc-modal { position:relative; width:min(100%,620px); max-height:90svh; overflow-y:auto; background:var(--surface); border:1px solid var(--border-h); border-radius:var(--r); padding:clamp(22px,4vw,34px); animation:aor-fade .3s ease; }
.aor-bc-title { font-family:var(--font-h); font-weight:800; font-size:20px; margin-bottom:16px; padding-right:30px; }
.aor-bc-recipients { background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 16px; margin-bottom:18px; }
.aor-bc-count { font-size:14px; margin-bottom:10px; }
.aor-bc-count strong { color:var(--gold); }
.aor-bc-preview { max-height:150px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; border-top:1px solid var(--border); padding-top:10px; }
.aor-bc-preview-row { display:flex; flex-direction:column; gap:1px; font-size:12.5px; }
.aor-bc-preview-name { font-weight:600; overflow-wrap:anywhere; }
.aor-bc-preview-email { color:var(--muted); font-size:12px; overflow-wrap:anywhere; }
.aor-bc-more { margin-top:6px; }
.aor-bc-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:14px 0 6px; }
.aor-bc-input { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; padding:12px 14px; outline:none; transition:border-color .2s; }
.aor-bc-input:focus { border-color:var(--gold); }
.aor-bc-textarea { width:100%; min-height:260px; resize:vertical; background:var(--bg); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-family:ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace; font-size:13px; line-height:1.6; padding:14px; outline:none; transition:border-color .2s; }
.aor-bc-textarea:focus { border-color:var(--gold); }
.aor-bc-caption { font-size:12px; color:var(--muted); margin-top:8px; line-height:1.5; }
.aor-bc-ok { margin-top:14px; padding:12px 14px; border-radius:var(--r-sm); background:rgba(107,240,160,.1); border:1px solid rgba(107,240,160,.35); color:var(--live); font-size:13.5px; line-height:1.5; }
.aor-bc-failed { margin:8px 0 0; padding-left:18px; font-size:12.5px; color:var(--text); }
.aor-bc-failed li { margin-bottom:3px; overflow-wrap:anywhere; }
.aor-bc-inline-error { margin-top:14px; padding:12px 14px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.35); color:var(--danger); font-size:13.5px; line-height:1.5; }
.aor-bc-btn-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:20px; }
.aor-bc-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.aor-bc-btn-ghost { background:transparent; border:1px solid var(--border-h); color:var(--text); border-radius:999px; font-family:var(--font-b); font-weight:600; font-size:14px; padding:12px 22px; cursor:pointer; transition:background .2s, border-color .2s; }
.aor-bc-btn-ghost:hover:not(:disabled) { background:var(--card); border-color:var(--gold); }
.aor-bc-btn-ghost:disabled, .aor-bc-btn:disabled { opacity:.55; cursor:not-allowed; }
.aor-bc-confirm { margin-top:20px; padding:16px; border-radius:var(--r-sm); background:var(--gold-dim); border:1px solid rgba(232,201,106,.35); }
.aor-bc-confirm-text { font-size:14px; font-weight:600; margin-bottom:12px; }
.aor-bc-confirm .aor-bc-btn-row { margin-top:0; }
.aor-bc-spin { width:16px; height:16px; border-width:2px; }
.aor-bc-note { font-size:12px; color:var(--muted); margin-top:16px; line-height:1.5; }

/* ══════════ RESPONSIVE ══════════ */
@media (min-width:768px) {
  .aor-org-card { grid-template-columns:minmax(0,1.6fr) repeat(3, minmax(100px, 1fr)); align-items:center; }
}
@media (max-width:1023px) {
  .aor-page { flex-direction:column; }
  .aor-sidebar { display:none; }
  .aor-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .aor-topbar .aor-mark { padding:0; font-size:19px; }
  .aor-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .aor-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .aor-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .aor-burger.is-open span:nth-child(2) { opacity:0; }
  .aor-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .aor-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .aor-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .aor-drawer .aor-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .aor-drawer .aor-nav-item.is-active::before { left:0; }
  .aor-drawer .aor-logout { margin-top:22px; }
}
@media (max-width:480px) {
  .aor-leader-row { grid-template-columns:36px 1fr; }
  .aor-leader-revenue { grid-column:2; justify-self:start; }
  .aor-rank { grid-row:span 2; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
