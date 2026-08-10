/* ═══════════════════════════════════════════════════════════
   BecomeAffiliate.jsx — Tictify 2026 Affiliate Signup
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

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

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="baf-header">
      <div className="baf-container baf-nav">
        <img
          src={logo}
          alt="Tictify"
          className="baf-logo"
          onClick={() => navigate("/")}
        />
        <nav className="baf-nav-links" aria-label="Primary">
          <button
            className="baf-link baf-hide-sm"
            onClick={() => navigate("/events")}
          >
            Events
          </button>
          <button
            className="baf-btn baf-btn-ghost"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ── Slim footer ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="baf-footer">
      <div className="baf-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

const STEPS = [
  {
    icon: <Icon name="user" />,
    title: "Create your free account",
    text: "Sign up in under a minute — no fees, no approval wait.",
  },
  {
    icon: <Icon name="link" />,
    title: "Pick an event & copy your link",
    text: "Browse events open to affiliates and grab your unique link.",
  },
  {
    icon: <Icon name="coins" />,
    title: "Earn ₦ on every ticket sold through it",
    text: "Your commission lands in your balance the moment a sale clears.",
  },
];

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function BecomeAffiliate() {
  injectStyles("tictify-become-affiliate-css", CSS);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!name.trim()) return setError("Please enter your full name.");
    if (!emailValid) return setError("Please enter a valid email address.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/affiliates/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email,
            password,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.message || "Could not start signup. Please try again.");
      }
      // ₦1,000 membership fee → Paystack; on success they're
      // redirected to login and their dashboard shows the code
      window.location.href = data.paymentUrl;
      return;
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="baf-page">
      <Header />

      <main className="baf-main">
        {/* Hero */}
        <section className="baf-hero">
          <div className="baf-container baf-hero-inner">
            <p className="baf-eyebrow">Tictify Affiliates</p>
            <h1 className="baf-h1">
              Promote events. <em>Earn on every ticket.</em>
            </h1>
            <p className="baf-sub">
              Organizers set a commission — up to 50% of the ticket price — on
              events that allow affiliates. Grab your link, share it anywhere,
              get paid per sale.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="baf-steps-wrap">
          <div className="baf-container">
            <div className="baf-steps">
              {STEPS.map((s, i) => (
                <div className="baf-step" key={i}>
                  <div className="baf-step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup card */}
        <section className="baf-signup-wrap">
          <div className="baf-container baf-signup-center">
            <div className="baf-card">
              {!affiliateCode ? (
                <>
                  <h2 className="baf-card-title">Create your affiliate account</h2>
                  <p className="baf-card-sub">
                    Free forever — start earning today.
                  </p>

                  <form className="baf-form" onSubmit={handleSubmit}>
                    <div className="baf-field">
                      <label className="baf-label" htmlFor="baf-name">
                        Full name
                      </label>
                      <input
                        id="baf-name"
                        className="baf-input"
                        type="text"
                        placeholder="Ada Obi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>

                    <div className="baf-field">
                      <label className="baf-label" htmlFor="baf-email">
                        Email
                      </label>
                      <input
                        id="baf-email"
                        className="baf-input"
                        type="email"
                        placeholder="ada@tictify.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <div className="baf-field">
                      <label className="baf-label" htmlFor="baf-password">
                        Password
                      </label>
                      <div className="baf-pw-wrap">
                        <input
                          id="baf-password"
                          className="baf-input baf-pw-input"
                          type={showPw ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="baf-pw-toggle"
                          aria-label={showPw ? "Hide password" : "Show password"}
                          onClick={() => setShowPw((v) => !v)}
                        >
                          <Icon name={showPw ? "eyeOff" : "eye"} size={17} />
                        </button>
                      </div>
                      {password && password.length < 8 && (
                        <p className="baf-field-hint">
                          {8 - password.length} more character
                          {8 - password.length === 1 ? "" : "s"} to go
                        </p>
                      )}
                    </div>

                    {error && <div className="baf-error">{error}</div>}

                    <button
                      type="submit"
                      className="baf-cta"
                      disabled={submitting}
                    >
                      {submitting ? "Starting secure payment…" : "Pay ₦1,000 & join →"}
                    </button>
                  <p className="baf-feenote">One-time ₦1,000 membership fee · paid securely via Paystack · your account activates the moment payment succeeds</p>
                  </form>

                  <p className="baf-login-note">
                    Already an affiliate?{" "}
                    <button
                      type="button"
                      className="baf-login-link"
                      onClick={() => navigate("/login")}
                    >
                      Log in
                    </button>
                  </p>
                </>
              ) : (
                <div className="baf-success" role="status">
                  <div className="baf-success-icon" aria-hidden="true">
                    <Icon name="check" />
                  </div>
                  <h2 className="baf-card-title">You&rsquo;re in! 🎉</h2>
                  <p className="baf-success-label">Your promo code</p>
                  <div className="baf-code">{affiliateCode}</div>
                  <p className="baf-success-msg">
                    Log in to grab event links, track your sales and withdraw
                    your earnings.
                  </p>
                  <button className="baf-cta" onClick={() => navigate("/login")}>
                    Log in to your dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `

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

@keyframes bafFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

.baf-feenote { margin-top:12px; font-size:12.5px; color:var(--muted); text-align:center; line-height:1.6; }
.baf-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.baf-container { width:100%; max-width:1080px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.baf-btn { border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.baf-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.baf-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Header ── */
.baf-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.baf-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.baf-logo { height:30px; cursor:pointer; }
.baf-nav-links { display:flex; align-items:center; gap:8px; }
.baf-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.baf-link:hover { color:var(--text); background:var(--card); }

/* ── Hero ── */
.baf-main { flex:1; }
.baf-hero { position:relative; padding:clamp(48px,8vw,88px) 0 clamp(24px,4vw,40px); }
.baf-hero::before { content:''; position:absolute; top:-140px; left:50%; transform:translateX(-50%); width:min(680px,90vw); height:420px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); pointer-events:none; }
.baf-hero-inner { position:relative; display:flex; flex-direction:column; align-items:center; text-align:center; animation:bafFadeUp .45s ease both; }
.baf-eyebrow { color:var(--gold); font-size:12.5px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; margin-bottom:14px; }
.baf-h1 { font-family:var(--font-h); font-weight:800; font-size:clamp(28px,6.4vw,56px); line-height:1.08; letter-spacing:-.02em; max-width:720px; text-wrap:balance; }
.baf-h1 em { font-style:normal; color:var(--gold); }
.baf-sub { color:var(--muted); font-size:clamp(14px,2vw,17px); line-height:1.7; max-width:560px; margin-top:18px; }

/* ── Steps ── */
.baf-steps-wrap { padding:clamp(20px,4vw,40px) 0; }
.baf-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.baf-step { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,3vw,26px); transition:transform .3s, border-color .3s; animation:bafFadeUp .5s ease both; }
.baf-step:hover { transform:translateY(-4px); border-color:var(--border-h); }
.baf-step-icon { width:42px; height:42px; border-radius:12px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin-bottom:14px; }
.baf-step-icon svg { width:19px; height:19px; }
.baf-step h3 { font-family:var(--font-h); font-size:15.5px; font-weight:700; margin-bottom:8px; }
.baf-step p { color:var(--muted); font-size:13.5px; line-height:1.6; }

/* ── Signup card ── */
.baf-signup-wrap { padding:clamp(16px,3vw,32px) 0 clamp(48px,8vw,88px); }
.baf-signup-center { display:flex; justify-content:center; }
.baf-card { width:min(100%,460px); background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,6vw,40px) clamp(20px,5vw,36px); animation:bafFadeUp .55s ease both; }
.baf-card-title { font-family:var(--font-h); font-weight:800; font-size:clamp(20px,4.5vw,25px); letter-spacing:-.02em; line-height:1.2; margin-bottom:8px; }
.baf-card-sub { color:var(--muted); font-size:13.5px; line-height:1.6; margin-bottom:24px; }

.baf-form { display:flex; flex-direction:column; gap:16px; }
.baf-field { display:flex; flex-direction:column; gap:8px; }
.baf-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.baf-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.baf-input::placeholder { color:var(--muted); opacity:.7; }
.baf-input:hover { border-color:var(--border-h); }
.baf-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.baf-pw-wrap { position:relative; }
.baf-pw-input { padding-right:48px; }
.baf-pw-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:16px; color:var(--muted); padding:4px; transition:color .2s; }
.baf-pw-toggle:hover { color:var(--text); }
.baf-field-hint { font-size:11.5px; color:var(--muted); }

.baf-error { padding:12px 16px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }

.baf-cta { width:100%; margin-top:4px; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, opacity .2s; }
.baf-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.baf-cta:disabled { opacity:.6; cursor:not-allowed; }

.baf-login-note { margin-top:20px; text-align:center; font-size:13px; color:var(--muted); }
.baf-login-link { background:none; border:none; color:var(--gold); font-weight:600; font-size:13px; text-decoration:underline; padding:0; }

/* ── Success panel ── */
.baf-success { text-align:center; animation:bafFadeUp .35s ease both; }
.baf-success-icon { width:60px; height:60px; margin:0 auto 16px; border-radius:50%; background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.35); color:var(--live); display:grid; place-items:center; }
.baf-success-icon svg { width:28px; height:28px; }
.baf-success .baf-card-title { text-align:center; }
.baf-success-label { margin-top:14px; font-size:11.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); }
.baf-code { font-family:var(--font-h); font-weight:800; font-size:clamp(28px,8vw,44px); letter-spacing:.06em; color:var(--gold); margin-top:8px; overflow-wrap:anywhere; line-height:1.15; }
.baf-success-msg { color:var(--muted); font-size:13.5px; line-height:1.7; margin:16px 0 22px; }

/* ── Footer ── */
.baf-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.baf-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .baf-hide-sm { display:none; }
}
@media (max-width: 480px) {
  .baf-nav { height:56px; }
  .baf-logo { height:26px; }
  .baf-btn { padding:8px 14px; font-size:13px; }
  .baf-cta { padding:15px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .baf-hero-inner, .baf-step, .baf-card, .baf-success { opacity:1; transform:none; }
}
`;
