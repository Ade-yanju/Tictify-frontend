/* ═══════════════════════════════════════════════════════════
   AffiliateDashboard.jsx — Tictify 2026 Affiliate Hub
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
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" strokeLinecap="round" />
    </svg>
  ),
  out: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function fmtNaira(n) {
  const v = Number(n);
  return `₦${(isNaN(v) ? 0 : v).toLocaleString()}`;
}

function KpiCard({ icon, label, value, tone, gold }) {
  return (
    <div className="afd-kpi">
      <div className={`afd-kpi-icon is-${tone}`}>{icon}</div>
      <div className="afd-kpi-content">
        <p className="afd-kpi-label">{label}</p>
        <h3 className={`afd-kpi-value ${gold ? "afd-kpi-value-gold" : ""}`}>
          {value}
        </h3>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AffiliateDashboard() {
  injectStyles("tictify-affiliate-dash-css", CSS);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [copiedEventId, setCopiedEventId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getToken();
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/affiliates/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setMe(data);
        setLoading(false);

        // Load promotable events after the profile resolves
        try {
          const evRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/affiliates/events`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (evRes.ok) {
            const evData = await evRes.json();
            if (!cancelled) setEvents(Array.isArray(evData) ? evData : []);
          }
        } catch {
          /* events section falls back to empty state */
        } finally {
          if (!cancelled) setEventsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your dashboard. Please try again.");
          setLoading(false);
          setEventsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function copyText(text) {
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
  }

  async function copyCode() {
    await copyText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function eventLink(id) {
    return `${window.location.origin}/events/${id}?ref=${code}`;
  }

  async function copyEventLink(id) {
    await copyText(eventLink(id));
    setCopiedEventId(id);
    setTimeout(() => setCopiedEventId(null), 2000);
  }

  function shareWhatsApp(ev) {
    const text = `🎟 ${ev.title} — grab your ticket here: ${eventLink(ev._id)}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const firstName = me?.name?.trim().split(/\s+/)[0] || "Affiliate";
  const code = me?.affiliateCode || "";
  const balance = Number(me?.balance) || 0;

  /* WhatsApp bot deep link — buyers who open it land in the Tictify
     bot with this affiliate's code pre-attributed ("ref CODE").
     Hidden entirely unless the bot number is configured. */
  const waBotNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const waBotLink = waBotNumber
    ? `https://wa.me/${waBotNumber}?text=${encodeURIComponent(
        `Hi! I want tickets ref ${code}`,
      )}`
    : "";

  async function copyWaBotLink() {
    await copyText(waBotLink);
    setCopiedWaLink(true);
    setTimeout(() => setCopiedWaLink(false), 2000);
  }

  return (
    <div className="afd-page">
      {/* Slim header with logout */}
      <header className="afd-header">
        <div className="afd-container afd-nav">
          <img
            src={logo}
            alt="Tictify"
            className="afd-logo"
            onClick={() => navigate("/")}
          />
          <nav className="afd-nav-links" aria-label="Primary">
            <button
              className="afd-link afd-hide-sm"
              onClick={() => navigate("/events")}
            >
              Events
            </button>
            <button className="afd-btn-logout" onClick={() => logout()}>
              {Ic.out}
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="afd-main">
        <div className="afd-container afd-col">
          {loading ? (
            <div className="afd-loading">
              <div className="afd-spinner" />
              <p>Loading your dashboard…</p>
            </div>
          ) : error ? (
            <div className="afd-error-card">
              <div className="afd-error-icon">!</div>
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <button
                className="afd-btn afd-btn-gold"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Greeting */}
              <header className="afd-greet">
                <h1 className="afd-title">
                  Welcome, {firstName} <span aria-hidden="true">👋</span>
                </h1>
                <p className="afd-subtitle">
                  Share your links, sell tickets, get paid.
                </p>
              </header>

              {/* Affiliate code hero card */}
              <section className="afd-hero">
                <p className="afd-hero-label">Your promo code</p>
                <div className="afd-code">{code || "—"}</div>
                <div className="afd-hero-actions">
                  <button
                    className="afd-btn afd-btn-gold"
                    onClick={copyCode}
                    disabled={!code}
                  >
                    {Ic.copy}
                    <span>{copiedCode ? "Copied!" : "Copy code"}</span>
                  </button>
                  {waBotNumber && (
                    <button
                      className="afd-btn afd-btn-ghost"
                      onClick={copyWaBotLink}
                      disabled={!code}
                    >
                      {Ic.copy}
                      <span>
                        {copiedWaLink ? "Copied!" : "Share on WhatsApp"}
                      </span>
                    </button>
                  )}
                </div>
                <p className="afd-hero-note">
                  Every event link you copy below carries this code — sales
                  through it are yours.
                </p>
              </section>

              {/* KPIs */}
              <section className="afd-kpis">
                <KpiCard
                  icon={Ic.wallet}
                  label="Balance"
                  value={fmtNaira(me?.balance)}
                  tone="gold"
                  gold
                />
                <KpiCard
                  icon={Ic.coins}
                  label="Total earned"
                  value={fmtNaira(me?.totalEarned)}
                  tone="gold"
                />
                <KpiCard
                  icon={Ic.ticket}
                  label="Tickets sold"
                  value={(Number(me?.ticketsSold) || 0).toLocaleString()}
                  tone="live"
                />
                <KpiCard
                  icon={Ic.chart}
                  label="Sales volume"
                  value={fmtNaira(me?.salesVolume)}
                  tone="live"
                />
              </section>

              {/* Withdrawal */}
              <section className="afd-withdraw">
                {balance >= 500 ? (
                  <button
                    className="afd-btn afd-btn-gold"
                    onClick={() => navigate("/organizer/withdraw")}
                  >
                    Withdraw earnings →
                  </button>
                ) : (
                  <p className="afd-withdraw-note">
                    Withdrawals unlock at ₦500
                  </p>
                )}
              </section>

              {/* Events you can promote */}
              <section className="afd-events">
                <h2 className="afd-section-title">Events you can promote</h2>

                {eventsLoading ? (
                  <div className="afd-loading afd-loading-sm">
                    <div className="afd-spinner" />
                    <p>Finding events…</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="afd-empty">
                    <p className="afd-empty-icon" aria-hidden="true">
                      🎪
                    </p>
                    <p>
                      No events are open to affiliates yet — check back soon.
                    </p>
                  </div>
                ) : (
                  <div className="afd-grid">
                    {events.map((ev) => (
                      <article className="afd-event" key={ev._id}>
                        <div className="afd-event-banner">
                          {ev.banner ? (
                            ev.bannerFit === "contain" ? (
                              <>
                                <img
                                  src={ev.banner}
                                  alt=""
                                  aria-hidden="true"
                                  loading="lazy"
                                  className="afd-bimg-back"
                                />
                                <img
                                  src={ev.banner}
                                  alt=""
                                  loading="lazy"
                                  className="afd-bimg-front"
                                />
                              </>
                            ) : (
                              <img src={ev.banner} alt="" loading="lazy" />
                            )
                          ) : (
                            <span
                              className="afd-event-fallback"
                              aria-hidden="true"
                            >
                              {(ev.title || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="afd-pill">
                            {ev.affiliatePercent}% per ticket
                          </span>
                        </div>
                        <div className="afd-event-body">
                          <h3 className="afd-event-title">{ev.title}</h3>
                          <p className="afd-event-meta">
                            {ev.date
                              ? new Date(ev.date).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Date TBA"}
                            {ev.city ? ` · ${ev.city}` : ""}
                          </p>
                          {ev.fromPrice != null && (
                            <p className="afd-event-price">
                              From {fmtNaira(ev.fromPrice)}
                            </p>
                          )}
                        </div>
                        <div className="afd-event-actions">
                          <button
                            className="afd-btn afd-btn-gold afd-btn-sm"
                            onClick={() => copyEventLink(ev._id)}
                            disabled={!code}
                          >
                            {Ic.copy}
                            <span>
                              {copiedEventId === ev._id
                                ? "Copied ✓"
                                : "Copy my link"}
                            </span>
                          </button>
                          <button
                            className="afd-btn afd-btn-ghost afd-btn-sm"
                            onClick={() => shareWhatsApp(ev)}
                            disabled={!code}
                          >
                            Share on WhatsApp
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="afd-footer">
        <div className="afd-container">
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

@keyframes afdFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes afdSpin { to { transform:rotate(360deg); } }

.afd-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.afd-container { width:100%; max-width:960px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Header ── */
.afd-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.afd-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.afd-logo { height:30px; cursor:pointer; }
.afd-nav-links { display:flex; align-items:center; gap:8px; }
.afd-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.afd-link:hover { color:var(--text); background:var(--card); }
.afd-btn-logout { display:inline-flex; align-items:center; gap:8px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:13.5px; font-weight:600; padding:9px 18px; border-radius:999px; transition:background .2s, border-color .2s; }
.afd-btn-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.afd-btn-logout svg { width:15px; height:15px; }

/* ── Main column ── */
.afd-main { flex:1; padding:clamp(28px,6vw,56px) 0 clamp(40px,7vw,72px); }
.afd-col { display:flex; flex-direction:column; gap:clamp(20px,3.5vw,30px); }

.afd-greet { animation:afdFadeUp .4s ease both; }
.afd-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,5vw,36px); letter-spacing:-.02em; line-height:1.12; }
.afd-subtitle { color:var(--muted); font-size:clamp(13.5px,2vw,15px); margin-top:8px; }

/* ── Promo code hero card ── */
.afd-hero { background:linear-gradient(180deg, var(--gold-dim), var(--card) 70%); border:1px solid rgba(232,201,106,.35); border-radius:var(--r); padding:clamp(24px,5vw,40px); text-align:center; animation:afdFadeUp .45s ease both; }
.afd-hero-label { font-size:11.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:12px; }
.afd-code { font-family:var(--font-h); font-weight:800; font-size:clamp(30px,8vw,52px); letter-spacing:.06em; color:var(--text); overflow-wrap:anywhere; line-height:1.1; }
.afd-hero-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:22px; }
.afd-hero-note { margin-top:16px; font-size:12.5px; color:var(--muted); line-height:1.6; }

/* ── Buttons ── */
.afd-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; font-weight:700; font-size:13.5px; padding:12px 22px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.afd-btn svg { width:15px; height:15px; }
.afd-btn-gold { background:var(--gold); color:#080910; }
.afd-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.afd-btn-ghost { background:transparent; color:var(--text); border-color:var(--border-h); }
.afd-btn-ghost:hover:not(:disabled) { border-color:rgba(232,201,106,.5); transform:translateY(-2px); }
.afd-btn:disabled { opacity:.5; cursor:not-allowed; }
.afd-btn-sm { padding:10px 16px; font-size:12.5px; }

/* ── KPI cards ── */
.afd-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.afd-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(18px,3vw,24px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:afdFadeUp .5s ease both; }
.afd-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.afd-kpi-icon { width:42px; height:42px; border-radius:12px; display:grid; place-items:center; flex:0 0 auto; }
.afd-kpi-icon svg { width:19px; height:19px; }
.afd-kpi-icon.is-gold { background:var(--gold-dim); color:var(--gold); }
.afd-kpi-icon.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.afd-kpi-content { min-width:0; }
.afd-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); line-height:1.5; }
.afd-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(20px,3vw,26px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }
.afd-kpi-value-gold { color:var(--gold); }

/* ── Withdrawal ── */
.afd-withdraw { display:flex; justify-content:center; animation:afdFadeUp .55s ease both; }
.afd-withdraw-note { font-size:13px; color:var(--muted); text-align:center; }

/* ── Events section ── */
.afd-events { animation:afdFadeUp .6s ease both; }
.afd-section-title { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,3.4vw,24px); letter-spacing:-.01em; margin-bottom:clamp(14px,2.5vw,20px); }
.afd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr)); gap:clamp(14px,2vw,20px); }
.afd-event { display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; transition:transform .25s, border-color .25s; }
.afd-event:hover { transform:translateY(-3px); border-color:var(--border-h); }
.afd-event-banner { position:relative; aspect-ratio:16/10; background:linear-gradient(135deg, var(--gold-dim), rgba(255,255,255,.03)); display:grid; place-items:center; overflow:hidden; }
.afd-event-banner img { width:100%; height:100%; object-fit:cover; }
.afd-event-fallback { font-family:var(--font-h); font-weight:800; font-size:40px; color:rgba(232,201,106,.4); }
.afd-pill { position:absolute; top:12px; left:12px; background:var(--gold); color:#080910; font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; padding:5px 12px; border-radius:999px; white-space:nowrap; }

/* banner display mode (cover / contain) */
.afd-event-banner img.afd-bimg-back { position:absolute; inset:0; object-fit:cover; filter:blur(18px) saturate(1.1); transform:scale(1.15); opacity:.55; }
.afd-event-banner img.afd-bimg-front { position:relative; z-index:1; object-fit:contain; }
.afd-event-banner .afd-pill { z-index:2; }
.afd-event-body { flex:1; padding:16px 18px 6px; }
.afd-event-title { font-family:var(--font-h); font-weight:700; font-size:16px; letter-spacing:-.01em; margin-bottom:6px; overflow-wrap:anywhere; }
.afd-event-meta { color:var(--muted); font-size:13px; line-height:1.5; overflow-wrap:anywhere; }
.afd-event-price { margin-top:8px; font-family:var(--font-h); font-weight:700; font-size:14px; color:var(--gold); font-variant-numeric:tabular-nums; }
.afd-event-actions { display:flex; flex-direction:column; gap:8px; padding:14px 18px 18px; }
.afd-event-actions .afd-btn { width:100%; }

/* ── Empty state ── */
.afd-empty { text-align:center; padding:clamp(32px,6vw,56px) 24px; background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); color:var(--muted); font-size:14px; line-height:1.6; }
.afd-empty-icon { font-size:38px; margin-bottom:10px; }

/* ── Loading / error ── */
.afd-loading { display:flex; flex-direction:column; align-items:center; gap:14px; padding:80px 0; color:var(--muted); font-size:14px; }
.afd-loading-sm { padding:36px 0; }
.afd-spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:afdSpin .9s linear infinite; }
.afd-error-card { width:min(100%,420px); margin:40px auto; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:afdFadeUp .35s ease; }
.afd-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.afd-error-card h2 { font-family:var(--font-h); font-size:20px; margin-bottom:8px; }
.afd-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ── Footer ── */
.afd-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.afd-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .afd-hide-sm { display:none; }
}
@media (max-width: 480px) {
  .afd-nav { height:56px; }
  .afd-logo { height:26px; }
  .afd-btn-logout { padding:8px 14px; font-size:13px; }
  .afd-hero-actions { flex-direction:column; }
  .afd-hero-actions .afd-btn { width:100%; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .afd-greet, .afd-hero, .afd-kpi, .afd-withdraw, .afd-events, .afd-error-card { opacity:1; transform:none; }
}
`;
