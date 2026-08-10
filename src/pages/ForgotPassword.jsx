/* ═══════════════════════════════════════════════════════════
   ForgotPassword.jsx — Tictify 2026 Auth
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useState } from "react";
import Icon from "../components/Icon";
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

export default function ForgotPassword() {
  injectStyles("tictify-forgot-password-css", CSS);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emailValid || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json().catch(() => ({}));
      setSentMessage(
        data.message ||
          "If an account exists for that email, a reset link is on its way.",
      );
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fp-page">
      <div className="fp-glow" aria-hidden="true" />

      <button className="fp-back" onClick={() => navigate("/login")}>
        ← Back
      </button>

      <div className="fp-card">
        <img
          src={logo}
          alt="Tictify"
          className="fp-logo"
          onClick={() => navigate("/")}
        />

        {!sentMessage ? (
          <>
            <h2 className="fp-title">Forgot your password?</h2>
            <p className="fp-sub">
              Enter your email and we&rsquo;ll send you a link to reset it.
            </p>

            <form className="fp-form" onSubmit={handleSubmit}>
              <div>
                <label className="fp-label" htmlFor="fp-email">
                  Email Address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className="fp-input"
                  placeholder="gabriel@tictify.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                {email && !emailValid && (
                  <p className="fp-field-err">Enter a valid email address</p>
                )}
              </div>

              {error && <div className="fp-error">{error}</div>}

              <button
                type="submit"
                className="fp-cta"
                disabled={!emailValid || sending}
              >
                {sending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div className="fp-success" role="status">
            <div className="fp-success-icon" aria-hidden="true">
              <Icon name="checkCircle" />
            </div>
            <h2 className="fp-title">Check your inbox</h2>
            <p className="fp-success-msg">{sentMessage}</p>
            <button className="fp-cta" onClick={() => navigate("/login")}>
              Back to sign in
            </button>
          </div>
        )}

        <p className="fp-alt">
          Remembered it?{" "}
          <button
            type="button"
            className="fp-link"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>
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
html { font-size:16px; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
input, button { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes fpFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fpGlow { 0%,100% { opacity:.5; } 50% { opacity:.95; } }

.fp-page { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:clamp(16px,5vw,40px); position:relative; font-family:var(--font-b); }
.fp-glow { position:fixed; top:12%; left:50%; transform:translateX(-50%); width:min(640px,86vw); height:340px; background:radial-gradient(ellipse at center, var(--gold-glo), transparent 68%); opacity:.4; pointer-events:none; z-index:0; animation:fpGlow 6s ease-in-out infinite; }

.fp-back { position:fixed; top:20px; left:20px; z-index:10; background:rgba(13,15,22,.9); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); color:var(--text); padding:9px 16px; border-radius:999px; cursor:pointer; font-size:13px; transition:transform .25s, border-color .25s; }
.fp-back:hover { border-color:var(--border-h); transform:translateY(-2px); }

.fp-card { position:relative; z-index:1; width:min(100%,440px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,6vw,44px); animation:fpFadeUp .4s ease; box-shadow:0 32px 80px rgba(0,0,0,.5); }
.fp-logo { height:34px; cursor:pointer; margin-bottom:28px; }
.fp-title { font-family:var(--font-h); font-weight:800; letter-spacing:-.02em; font-size:clamp(22px,5.5vw,27px); line-height:1.15; margin-bottom:8px; text-wrap:balance; }
.fp-sub { font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:28px; }

.fp-form { display:flex; flex-direction:column; gap:16px; }
.fp-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.fp-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.fp-input::placeholder { color:var(--muted); opacity:.75; }
.fp-input:hover { border-color:var(--border-h); }
.fp-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.fp-field-err { font-size:11px; color:var(--danger); margin-top:6px; }
.fp-error { padding:12px 16px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }

.fp-cta { width:100%; margin-top:4px; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.fp-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.fp-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }

.fp-success { text-align:center; animation:fpFadeUp .35s ease both; }
.fp-success-icon { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.35); color:var(--live); display:grid; place-items:center; }
.fp-success-icon svg { width:30px; height:30px; }
.fp-success-msg { color:var(--muted); font-size:14.5px; line-height:1.7; margin-bottom:22px; }

.fp-alt { margin-top:28px; text-align:center; font-size:13px; color:var(--muted); }
.fp-link { background:none; border:none; color:var(--gold); cursor:pointer; font-weight:600; font-size:13px; text-decoration:underline; padding:0; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .fp-page { padding-top:84px; align-content:start; }
}
@media (max-width: 480px) {
  .fp-back { top:14px; left:14px; padding:8px 14px; }
  .fp-card { padding:24px 18px 28px; }
  .fp-input { font-size:16px; }   /* prevents iOS focus zoom */
  .fp-logo { height:30px; margin-bottom:22px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
