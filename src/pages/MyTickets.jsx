/* ═══════════════════════════════════════════════════════════
   MyTickets.jsx — Tictify 2026 Ticket Wallet
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  ticket: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M8.5 12.5l2.5 2.5 4.5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </svg>
  ),
};

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="mtw-header">
      <div className="mtw-container mtw-nav">
        <img
          src={logo}
          alt="Tictify"
          className="mtw-logo"
          onClick={() => navigate("/")}
        />
        <nav className="mtw-nav-links" aria-label="Primary">
          <button
            className="mtw-link mtw-hide-sm"
            onClick={() => navigate("/events")}
          >
            Events
          </button>
          <button
            className="mtw-btn mtw-btn-ghost"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="mtw-btn mtw-btn-gold"
            onClick={() => navigate("/register")}
          >
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
    <footer className="mtw-footer">
      <div className="mtw-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE — Ticket Wallet
══════════════════════════════════════════════════════════ */
export default function MyTickets() {
  injectStyles("tictify-mytickets-css", CSS);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emailValid || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/my-tickets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(
          data.message ||
            "If any tickets match this email, they're on their way to your inbox.",
        );
        setSent(true);
      } else if (res.status === 429) {
        setError(
          data.message || "Too many requests — please try again in a moment.",
        );
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  function resetForm() {
    setSent(false);
    setMessage("");
    setError("");
    setEmail("");
  }

  return (
    <div className="mtw-page">
      <Header />

      <main className="mtw-main">
        <div className="mtw-card">
          {!sent ? (
            <>
              <div className="mtw-card-icon" aria-hidden="true">
                {Ic.ticket}
              </div>
              <h1 className="mtw-title">Your ticket wallet</h1>
              <p className="mtw-sub">
                Every ticket you&rsquo;ve bought, delivered to your inbox in one
                tap.
              </p>

              <form className="mtw-form" onSubmit={handleSubmit}>
                <label className="mtw-label" htmlFor="mtw-email">
                  Email Address
                </label>
                <input
                  id="mtw-email"
                  className={`mtw-input ${focused ? "is-focus" : ""} ${email && !emailValid ? "is-invalid" : ""}`}
                  type="email"
                  placeholder="gabriel@tictify.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="email"
                />
                {email && !emailValid && (
                  <p className="mtw-field-err">
                    Please enter a valid email address
                  </p>
                )}

                {error && <div className="mtw-error">{error}</div>}

                <button
                  type="submit"
                  className="mtw-cta"
                  disabled={!emailValid || sending}
                >
                  {sending ? "Sending…" : "Email me my tickets"}
                </button>
              </form>

              <p className="mtw-trust">
                <span className="mtw-trust-ic">{Ic.lock}</span> Private &amp;
                secure — we only email the address you enter
              </p>
            </>
          ) : (
            <div className="mtw-success" role="status">
              <div className="mtw-success-icon" aria-hidden="true">
                {Ic.check}
              </div>
              <h2 className="mtw-title">Check your inbox</h2>
              <p className="mtw-success-msg">{message}</p>
              <button className="mtw-cta" onClick={() => navigate("/events")}>
                Browse events
              </button>
              <button className="mtw-ghost" onClick={resetForm}>
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>

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

@keyframes mtwFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

.mtw-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.mtw-container { width:100%; max-width:1200px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.mtw-btn { border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.mtw-btn-gold { background:var(--gold); color:#080910; }
.mtw-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.mtw-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.mtw-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Header ── */
.mtw-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.mtw-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.mtw-logo { height:30px; cursor:pointer; }
.mtw-nav-links { display:flex; align-items:center; gap:8px; }
.mtw-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.mtw-link:hover { color:var(--text); background:var(--card); }

/* ── Main / card ── */
.mtw-main { flex:1; display:flex; align-items:center; justify-content:center; padding:clamp(40px,8vw,88px) clamp(16px,4.5vw,32px); }
.mtw-card { width:min(100%,460px); background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,6vw,44px) clamp(20px,5vw,40px); text-align:center; animation:mtwFadeUp .45s ease both; }
.mtw-card-icon { width:56px; height:56px; margin:0 auto 18px; border-radius:16px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--gold); display:grid; place-items:center; }
.mtw-card-icon svg { width:26px; height:26px; }
.mtw-title { font-family:var(--font-h); font-weight:800; font-size:clamp(22px,5.4vw,28px); letter-spacing:-.02em; line-height:1.15; margin-bottom:10px; text-wrap:balance; }
.mtw-sub { color:var(--muted); font-size:clamp(13px,3vw,14.5px); line-height:1.65; margin-bottom:clamp(20px,5vw,28px); }

/* ── Form ── */
.mtw-form { text-align:left; }
.mtw-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.mtw-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.mtw-input::placeholder { color:var(--muted); opacity:.7; }
.mtw-input:hover { border-color:var(--border-h); }
.mtw-input.is-focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.mtw-input.is-invalid { border-color:rgba(224,92,92,.5); }
.mtw-field-err { font-size:11px; color:var(--danger); margin-top:6px; }

.mtw-error { margin-top:14px; padding:12px 16px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }

.mtw-cta { width:100%; margin-top:18px; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.mtw-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.mtw-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }

.mtw-trust { margin-top:16px; font-size:12px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:7px; line-height:1.5; }
.mtw-trust-ic { display:inline-grid; place-items:center; flex-shrink:0; }
.mtw-trust-ic svg { width:13px; height:13px; }

/* ── Success state ── */
.mtw-success { animation:mtwFadeUp .35s ease both; }
.mtw-success-icon { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.35); color:var(--live); display:grid; place-items:center; }
.mtw-success-icon svg { width:30px; height:30px; }
.mtw-success-msg { color:var(--muted); font-size:clamp(13px,3vw,14.5px); line-height:1.7; margin-bottom:6px; }
.mtw-ghost { display:block; width:100%; margin-top:12px; background:none; border:none; color:var(--muted); font-size:13px; font-weight:500; padding:8px 6px; transition:color .25s; }
.mtw-ghost:hover { color:var(--gold); }

/* ── Footer ── */
.mtw-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.mtw-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .mtw-hide-sm { display:none; }
}
@media (max-width: 480px) {
  .mtw-nav { height:56px; }
  .mtw-logo { height:26px; }
  .mtw-btn { padding:8px 14px; font-size:13px; }
  .mtw-cta { padding:15px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .mtw-card, .mtw-success { opacity:1; transform:none; }
}
`;
