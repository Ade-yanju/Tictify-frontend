/* ═══════════════════════════════════════════════════════════
   EventDetails.jsx — Tictify 2026 Event Page
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-7-5.6-7-11a7 7 0 0114 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.5V6M16 2.5V6" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" strokeLinejoin="round" />
      <path d="M12 10v4.5M12 17.6v.4" strokeLinecap="round" />
    </svg>
  ),
};

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="ed-header">
      <div className="ed-container ed-nav">
        <img
          src={logo}
          alt="Tictify"
          className="ed-logo"
          onClick={() => navigate("/")}
        />
        <nav className="ed-nav-links" aria-label="Primary">
          <button className="ed-link ed-hide-sm" onClick={() => navigate("/events")}>
            Events
          </button>
          <button className="ed-btn ed-btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="ed-btn ed-btn-gold" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ── Slim footer ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="ed-footer">
      <div className="ed-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ── Ticket-type option card ─────────────────────────────── */
function TicketOption({ ticket, selected, onSelect }) {
  return (
    <label
      onClick={() => onSelect(ticket)}
      className={`ed-ticket ${selected ? "is-selected" : ""}`}
    >
      <div className="ed-ticket-main">
        <span className="ed-radio">
          {selected && <span className="ed-radio-dot" />}
        </span>
        <span className="ed-ticket-info">
          <span className="ed-ticket-name">{ticket.name}</span>
          {ticket.description && (
            <span className="ed-ticket-desc">{ticket.description}</span>
          )}
        </span>
      </div>
      <span className="ed-ticket-price">
        {ticket.price > 0 ? `₦${ticket.price.toLocaleString()}` : "Free"}
      </span>
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function EventDetails() {
  injectStyles("tictify-event-details-css", CSS);
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid event link.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvent(data);
      } catch {
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const canProceed = emailValid && selectedTicket;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="ed-page">
        <Header />
        <div className="ed-center">
          <div className="ed-spinner" />
          <p className="ed-center-sub">Loading event…</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div className="ed-page">
        <Header />
        <div className="ed-center">
          <span className="ed-center-ic">{Ic.warn}</span>
          <p className="ed-center-title">{error}</p>
          <button className="ed-btn ed-btn-ghost ed-back-lg" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const ctaLabel = !selectedTicket
    ? "Select a ticket type"
    : !emailValid
      ? "Enter your email"
      : "Proceed to Payment →";
  const goToCheckout = () =>
    navigate(`/checkout/${event._id}`, {
      state: { ticket: selectedTicket, email },
    });

  return (
    <div className="ed-page">
      <Header />

      <main className="ed-main">
        <div className="ed-container">
          {/* ── Back ── */}
          <button className="ed-back" onClick={() => navigate(-1)}>
            <span className="ed-back-ic">{Ic.back}</span> Back to Events
          </button>

          {/* ── Hero banner ── */}
          <div className="ed-hero">
            <img src={event.banner} alt={event.title} />
            <div className="ed-hero-shade" aria-hidden="true" />
          </div>

          {/* ── Content grid ── */}
          <div className="ed-layout">
            {/* LEFT — event info */}
            <section className="ed-info">
              <h1 className="ed-title">{event.title}</h1>

              <div className="ed-meta">
                {[
                  { icon: Ic.pin, text: event.location },
                  { icon: Ic.cal, text: eventDate.toDateString() },
                  ...(event.time ? [{ icon: Ic.clock, text: event.time }] : []),
                ].map((m, i) => (
                  <span className="ed-chip" key={i}>
                    <span className="ed-chip-ic">{m.icon}</span> {m.text}
                  </span>
                ))}
              </div>

              <div className="ed-divider" />

              <h2 className="ed-h2">About this Event</h2>
              <p className="ed-desc">{event.description}</p>
            </section>

            {/* RIGHT — purchase panel */}
            <aside className="ed-panel">
              <div className="ed-panel-head">
                <h2 className="ed-panel-title">Get Tickets</h2>
                <span className="ed-panel-sold">
                  {(event.ticketTypes || []).reduce(
                    (s, t) => s + (t.sold || 0),
                    0,
                  )}{" "}
                  sold
                </span>
              </div>

              {/* Ticket options */}
              <div className="ed-tickets">
                {(event.ticketTypes || []).map((ticket) => (
                  <TicketOption
                    key={ticket.name}
                    ticket={ticket}
                    selected={selectedTicket?.name === ticket.name}
                    onSelect={setSelectedTicket}
                  />
                ))}
              </div>

              {/* Email */}
              <div className="ed-field">
                <label className="ed-label">Your Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`ed-input ${emailFocused ? "is-focus" : ""} ${email && !emailValid ? "is-invalid" : ""}`}
                />
                {email && !emailValid && (
                  <p className="ed-field-err">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* CTA (hidden <768px — replaced by fixed bottom bar) */}
              <button
                disabled={!canProceed}
                onClick={goToCheckout}
                className="ed-cta ed-cta-panel"
              >
                {ctaLabel}
              </button>

              <p className="ed-secure">
                <span className="ed-secure-ic">{Ic.lock}</span> Secure checkout
                · No account required
              </p>
            </aside>
          </div>
        </div>
      </main>

      {/* ── Fixed bottom CTA bar (<768px) ── */}
      <div className="ed-ctabar">
        <div className="ed-ctabar-info">
          <span className="ed-ctabar-name">
            {selectedTicket ? selectedTicket.name : "No ticket selected"}
          </span>
          <span className="ed-ctabar-price">
            {selectedTicket
              ? selectedTicket.price > 0
                ? `₦${selectedTicket.price.toLocaleString()}`
                : "Free"
              : "—"}
          </span>
        </div>
        <button disabled={!canProceed} onClick={goToCheckout} className="ed-cta">
          {ctaLabel}
        </button>
      </div>

      <Footer />
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
input { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes edSpin { to { transform:rotate(360deg); } }
@keyframes edFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

.ed-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.ed-container { width:100%; max-width:1200px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.ed-btn { border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.ed-btn-gold { background:var(--gold); color:#080910; }
.ed-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ed-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.ed-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }
.ed-back-lg { margin-top:20px; padding:12px 28px; font-size:14px; }

/* ── Header ── */
.ed-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.ed-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.ed-logo { height:30px; cursor:pointer; }
.ed-nav-links { display:flex; align-items:center; gap:8px; }
.ed-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.ed-link:hover { color:var(--text); background:var(--card); }

/* ── Centered states ── */
.ed-center { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:64px 24px; animation:edFadeUp .4s ease; }
.ed-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:edSpin 1s linear infinite; margin-bottom:16px; }
.ed-center-sub { font-size:13px; color:var(--muted); }
.ed-center-ic { display:grid; place-items:center; width:64px; height:64px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); margin-bottom:18px; }
.ed-center-ic svg { width:28px; height:28px; }
.ed-center-title { font-family:var(--font-h); font-size:20px; font-weight:700; color:var(--text); }

/* ── Main ── */
.ed-main { flex:1; padding:clamp(20px,3.5vw,36px) 0 clamp(48px,7vw,88px); }

/* back */
.ed-back { display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); color:var(--text); padding:9px 18px; border-radius:999px; font-size:13px; font-weight:500; margin-bottom:clamp(18px,3vw,28px); transition:border-color .25s, transform .25s; }
.ed-back:hover { border-color:var(--border-h); transform:translateY(-2px); }
.ed-back-ic { display:inline-grid; place-items:center; }
.ed-back-ic svg { width:14px; height:14px; }

/* ── Hero banner ── */
.ed-hero { position:relative; border-radius:var(--r); overflow:hidden; border:1px solid var(--border); aspect-ratio:21/9; margin-bottom:clamp(24px,4vw,40px); }
.ed-hero img { width:100%; height:100%; object-fit:cover; object-position:center; }
.ed-hero-shade { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,9,16,.75) 0%, transparent 45%); }

/* ── Layout ── */
.ed-layout { display:grid; grid-template-columns:1fr; gap:clamp(24px,4vw,40px); align-items:start; }

/* ── Info column ── */
.ed-info { animation:edFadeUp .4s ease both; min-width:0; }
.ed-title { font-family:var(--font-h); font-size:clamp(26px,5vw,46px); font-weight:800; line-height:1.1; letter-spacing:-.02em; color:var(--text); margin-bottom:20px; text-wrap:balance; }
.ed-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:clamp(24px,4vw,32px); }
.ed-chip { display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); border-radius:999px; padding:8px 16px; font-size:13px; color:var(--muted); }
.ed-chip-ic { display:inline-grid; place-items:center; color:var(--gold); flex-shrink:0; }
.ed-chip-ic svg { width:14px; height:14px; }
.ed-divider { height:1px; background:var(--border); margin-bottom:28px; }
.ed-h2 { font-family:var(--font-h); font-size:16px; font-weight:700; color:var(--text); margin-bottom:14px; }
.ed-desc { font-size:15px; color:var(--muted); line-height:1.8; max-width:640px; white-space:pre-line; }

/* ── Purchase panel ── */
.ed-panel { background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:edFadeUp .4s ease .1s both; min-width:0; }
.ed-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:22px; }
.ed-panel-title { font-family:var(--font-h); font-size:18px; font-weight:700; color:var(--text); }
.ed-panel-sold { font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); white-space:nowrap; }

/* ticket options */
.ed-tickets { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
.ed-ticket { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-radius:var(--r-sm); border:1px solid var(--border); background:transparent; cursor:pointer; transition:border-color .2s, background .2s, transform .2s; }
.ed-ticket:hover { border-color:var(--border-h); }
.ed-ticket.is-selected { border-color:rgba(232,201,106,.5); background:var(--gold-dim); }
.ed-ticket-main { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
.ed-radio { width:18px; height:18px; border-radius:50%; border:2px solid var(--muted); display:grid; place-items:center; flex-shrink:0; transition:border-color .2s; }
.ed-ticket.is-selected .ed-radio { border-color:var(--gold); }
.ed-radio-dot { width:8px; height:8px; border-radius:50%; background:var(--gold); }
.ed-ticket-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ed-ticket-name { font-family:var(--font-h); font-weight:600; font-size:14px; color:var(--text); }
.ed-ticket-desc { font-size:12px; color:var(--muted); }
.ed-ticket-price { font-family:var(--font-h); font-weight:800; font-size:16px; color:var(--gold); white-space:nowrap; flex-shrink:0; }

/* email field */
.ed-field { margin-bottom:20px; }
.ed-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.ed-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.ed-input::placeholder { color:var(--muted); }
.ed-input.is-invalid { border-color:rgba(224,92,92,.5); }
.ed-input.is-focus { border-color:rgba(232,201,106,.4); box-shadow:0 0 0 3px var(--gold-dim); }
.ed-field-err { font-size:11px; color:var(--danger); margin-top:6px; }

/* CTA */
.ed-cta { width:100%; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.ed-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ed-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }
.ed-secure { margin-top:14px; text-align:center; font-size:12px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:7px; }
.ed-secure-ic { display:inline-grid; place-items:center; }
.ed-secure-ic svg { width:13px; height:13px; }

/* fixed bottom CTA bar — hidden by default, shown <768px */
.ed-ctabar { display:none; }

/* ── Footer ── */
.ed-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.ed-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (min-width: 1024px) {
  .ed-layout { grid-template-columns:1fr 400px; }
  .ed-panel { position:sticky; top:84px; }
}
@media (max-width: 768px) {
  .ed-hide-sm { display:none; }
  .ed-hero { aspect-ratio:16/10; }
  .ed-cta-panel { display:none; }
  .ed-main { padding-bottom:120px; }
  .ed-ctabar { display:flex; align-items:center; gap:14px; position:fixed; left:0; right:0; bottom:0; z-index:200; padding:12px clamp(16px,4.5vw,32px) calc(12px + env(safe-area-inset-bottom)); background:rgba(8,9,16,.92); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-top:1px solid var(--border); }
  .ed-ctabar-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .ed-ctabar-name { font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
  .ed-ctabar-price { font-family:var(--font-h); font-weight:800; font-size:16px; color:var(--gold); white-space:nowrap; }
  .ed-ctabar .ed-cta { flex:1; width:auto; padding:14px 18px; font-size:14px; }
  .ed-footer { padding-bottom:calc(22px + env(safe-area-inset-bottom)); }
}
@media (max-width: 480px) {
  .ed-nav { height:56px; }
  .ed-logo { height:26px; }
  .ed-btn { padding:8px 14px; font-size:13px; }
  .ed-chip { padding:7px 13px; font-size:12.5px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .ed-info, .ed-panel, .ed-center { opacity:1; transform:none; }
}
`;
