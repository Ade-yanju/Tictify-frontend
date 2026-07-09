/* ═══════════════════════════════════════════════════════════
   AmbassadorDashboard.jsx — Tictify 2026 Campus Partner Hub
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../services/authService";

const logo = "/logo.png";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Inline icons (dependency-free) ─────────────────────── */
const Ic = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5c2.4.5 4 2.7 4 5.5" strokeLinecap="round" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M10 14a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 5.93" strokeLinecap="round" />
      <path d="M14 10a5 5 0 00-7.07 0L4.8 12.12a5 5 0 007.07 7.07L13 18.07" strokeLinecap="round" />
    </svg>
  ),
  out: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function KpiCard({ icon, label, value, tone }) {
  return (
    <div className="amb-kpi">
      <div className={`amb-kpi-icon is-${tone}`}>{icon}</div>
      <div className="amb-kpi-content">
        <p className="amb-kpi-label">{label}</p>
        <h3 className="amb-kpi-value">{value}</h3>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AmbassadorDashboard() {
  injectStyles("tictify-ambassador-dash-css", CSS);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(""); // "" | "code" | "link"

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      const token = getToken();
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ambassadors/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) setError("Unable to load your dashboard. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function copyText(text, which) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(which);
    setTimeout(() => setCopied(""), 2000);
  }

  const firstName = me?.fullName?.trim().split(/\s+/)[0] || "Partner";
  const code = me?.inviteCode || "";
  const inviteLink = `${window.location.origin}/register?invite=${code}`;
  const stats = me?.stats || {};

  return (
    <div className="amb-page">
      {/* Slim header with logout */}
      <header className="amb-header">
        <div className="amb-container amb-nav">
          <img
            src={logo}
            alt="Tictify"
            className="amb-logo"
            onClick={() => navigate("/")}
          />
          <nav className="amb-nav-links" aria-label="Primary">
            <button className="amb-link amb-hide-sm" onClick={() => navigate("/events")}>
              Events
            </button>
            <button className="amb-btn-logout" onClick={() => logout()}>
              {Ic.out}
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="amb-main">
        <div className="amb-container amb-col">
          {loading ? (
            <div className="amb-loading">
              <div className="amb-spinner" />
              <p>Loading your dashboard…</p>
            </div>
          ) : error ? (
            <div className="amb-error-card">
              <div className="amb-error-icon">!</div>
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <button
                className="amb-btn amb-btn-gold"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Greeting */}
              <header className="amb-greet">
                <h1 className="amb-title">
                  Welcome, {firstName} <span aria-hidden="true">👋</span>
                </h1>
                {me?.university && (
                  <p className="amb-subtitle">{me.university}</p>
                )}
              </header>

              {/* Invite code hero card */}
              <section className="amb-invite">
                <p className="amb-invite-label">Your invite code</p>
                <div className="amb-code">{code || "—"}</div>
                <div className="amb-invite-actions">
                  <button
                    className="amb-btn amb-btn-gold"
                    onClick={() => copyText(code, "code")}
                    disabled={!code}
                  >
                    {Ic.copy}
                    <span>{copied === "code" ? "Copied!" : "Copy code"}</span>
                  </button>
                  <button
                    className="amb-btn amb-btn-ghost"
                    onClick={() => copyText(inviteLink, "link")}
                    disabled={!code}
                  >
                    {Ic.link}
                    <span>{copied === "link" ? "Copied!" : "Copy invite link"}</span>
                  </button>
                </div>
                <p className="amb-invite-note">
                  Promoter tip: add <code>?ref={code || "YOURCODE"}</code> to any
                  event link to track your ticket sales.
                </p>
              </section>

              {/* KPIs */}
              <section className="amb-kpis">
                <KpiCard
                  icon={Ic.users}
                  label="Organizers onboarded"
                  value={(stats.organizersOnboarded ?? 0).toLocaleString()}
                  tone="gold"
                />
                <KpiCard
                  icon={Ic.ticket}
                  label="Tickets sold via your links"
                  value={(stats.ticketsSold ?? 0).toLocaleString()}
                  tone="live"
                />
                <KpiCard
                  icon={Ic.coins}
                  label="Sales revenue driven"
                  value={`₦${(stats.salesRevenue ?? 0).toLocaleString()}`}
                  tone="gold"
                />
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="amb-footer">
        <div className="amb-container">
          <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

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
button { font-family:var(--font-b); cursor:pointer; }
img { display:block; }

@keyframes ambFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes ambSpin { to { transform:rotate(360deg); } }

.amb-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.amb-container { width:100%; max-width:860px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Header ── */
.amb-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.amb-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.amb-logo { height:30px; cursor:pointer; }
.amb-nav-links { display:flex; align-items:center; gap:8px; }
.amb-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.amb-link:hover { color:var(--text); background:var(--card); }
.amb-btn-logout { display:inline-flex; align-items:center; gap:8px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:13.5px; font-weight:600; padding:9px 18px; border-radius:999px; transition:background .2s, border-color .2s; }
.amb-btn-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.amb-btn-logout svg { width:15px; height:15px; }

/* ── Main column ── */
.amb-main { flex:1; padding:clamp(28px,6vw,56px) 0 clamp(40px,7vw,72px); }
.amb-col { display:flex; flex-direction:column; gap:clamp(20px,3.5vw,30px); }

.amb-greet { animation:ambFadeUp .4s ease both; }
.amb-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,5vw,36px); letter-spacing:-.02em; line-height:1.12; }
.amb-subtitle { color:var(--muted); font-size:clamp(13.5px,2vw,15px); margin-top:8px; }

/* ── Invite hero card ── */
.amb-invite { background:linear-gradient(180deg, var(--gold-dim), var(--card) 70%); border:1px solid rgba(232,201,106,.35); border-radius:var(--r); padding:clamp(24px,5vw,40px); text-align:center; animation:ambFadeUp .45s ease both; }
.amb-invite-label { font-size:11.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:12px; }
.amb-code { font-family:var(--font-h); font-weight:800; font-size:clamp(30px,8vw,52px); letter-spacing:.06em; color:var(--text); overflow-wrap:anywhere; line-height:1.1; }
.amb-invite-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:22px; }
.amb-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; font-weight:700; font-size:13.5px; padding:12px 22px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.amb-btn svg { width:15px; height:15px; }
.amb-btn-gold { background:var(--gold); color:#080910; }
.amb-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.amb-btn-ghost { background:transparent; color:var(--text); border-color:var(--border-h); }
.amb-btn-ghost:hover:not(:disabled) { border-color:rgba(232,201,106,.5); transform:translateY(-2px); }
.amb-btn:disabled { opacity:.5; cursor:not-allowed; }
.amb-invite-note { margin-top:18px; font-size:12.5px; color:var(--muted); line-height:1.6; }
.amb-invite-note code { font-family:ui-monospace, monospace; color:var(--gold); background:rgba(232,201,106,.08); border:1px solid rgba(232,201,106,.25); border-radius:6px; padding:2px 7px; font-size:12px; overflow-wrap:anywhere; }

/* ── KPI cards ── */
.amb-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.amb-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,3vw,24px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:ambFadeUp .5s ease both; }
.amb-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.amb-kpi-icon { width:42px; height:42px; border-radius:12px; display:grid; place-items:center; flex:0 0 auto; }
.amb-kpi-icon svg { width:19px; height:19px; }
.amb-kpi-icon.is-gold { background:var(--gold-dim); color:var(--gold); }
.amb-kpi-icon.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.amb-kpi-content { min-width:0; }
.amb-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); line-height:1.5; }
.amb-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(20px,3vw,27px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }

/* ── Loading / error ── */
.amb-loading { display:flex; flex-direction:column; align-items:center; gap:14px; padding:80px 0; color:var(--muted); font-size:14px; }
.amb-spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:ambSpin .9s linear infinite; }
.amb-error-card { width:min(100%,420px); margin:40px auto; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:ambFadeUp .35s ease; }
.amb-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.amb-error-card h2 { font-family:var(--font-h); font-size:20px; margin-bottom:8px; }
.amb-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ── Footer ── */
.amb-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.amb-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .amb-hide-sm { display:none; }
}
@media (max-width: 480px) {
  .amb-nav { height:56px; }
  .amb-logo { height:26px; }
  .amb-btn-logout { padding:8px 14px; font-size:13px; }
  .amb-invite-actions { flex-direction:column; }
  .amb-invite-actions .amb-btn { width:100%; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .amb-greet, .amb-invite, .amb-kpi, .amb-error-card { opacity:1; transform:none; }
}
`;
