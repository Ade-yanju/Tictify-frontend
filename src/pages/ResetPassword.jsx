/* ═══════════════════════════════════════════════════════════
   ResetPassword.jsx — Tictify 2026 Auth
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useState } from "react";
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

/* ── Password input with show/hide ───────────────────────── */
function PasswordField({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="rp-label" htmlFor={id}>
        {label}
      </label>
      <div className="rp-pwrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="rp-input rp-input-pw"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="rp-eye"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  injectStyles("tictify-reset-password-css", CSS);
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [failed, setFailed] = useState(false);

  const longEnough = password.length >= 8;
  const passwordsMatch = password && confirm && password === confirm;
  const canSubmit = longEnough && passwordsMatch && !sending;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError("");
    setFailed(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessMsg(
          data.message || "Your password has been reset. You can now sign in.",
        );
      } else {
        setError(
          data.message || "This reset link is invalid or has expired.",
        );
        setFailed(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rp-page">
      <div className="rp-glow" aria-hidden="true" />

      <button className="rp-back" onClick={() => navigate("/login")}>
        ← Back
      </button>

      <div className="rp-card">
        <img
          src={logo}
          alt="Tictify"
          className="rp-logo"
          onClick={() => navigate("/")}
        />

        {!successMsg ? (
          <>
            <h2 className="rp-title">Set a new password</h2>
            <p className="rp-sub">
              Choose a strong password of at least 8 characters.
            </p>

            <form className="rp-form" onSubmit={handleSubmit}>
              <div>
                <PasswordField
                  id="rp-password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
                {password && !longEnough && (
                  <p className="rp-hint is-err">
                    Must be at least 8 characters
                  </p>
                )}
              </div>

              <div>
                <PasswordField
                  id="rp-confirm"
                  label="Confirm Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                />
                {confirm && (
                  <p className={`rp-hint ${passwordsMatch ? "is-ok" : "is-err"}`}>
                    {passwordsMatch
                      ? "✓ Passwords match"
                      : "Passwords don't match"}
                  </p>
                )}
              </div>

              {error && (
                <div className="rp-error">
                  {error}
                  {failed && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="rp-error-link"
                        onClick={() => navigate("/forgot-password")}
                      >
                        Request a new link
                      </button>
                    </>
                  )}
                </div>
              )}

              <button type="submit" className="rp-cta" disabled={!canSubmit}>
                {sending ? "Saving…" : "Set new password"}
              </button>
            </form>
          </>
        ) : (
          <div className="rp-success" role="status">
            <div className="rp-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="rp-title">Password updated</h2>
            <p className="rp-success-msg">{successMsg}</p>
            <button className="rp-cta" onClick={() => navigate("/login")}>
              Sign in →
            </button>
          </div>
        )}
      </div>
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
html { font-size:16px; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
input, button { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes rpFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes rpGlow { 0%,100% { opacity:.5; } 50% { opacity:.95; } }

.rp-page { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:clamp(16px,5vw,40px); position:relative; font-family:var(--font-b); }
.rp-glow { position:fixed; top:12%; left:50%; transform:translateX(-50%); width:min(640px,86vw); height:340px; background:radial-gradient(ellipse at center, var(--gold-glo), transparent 68%); opacity:.4; pointer-events:none; z-index:0; animation:rpGlow 6s ease-in-out infinite; }

.rp-back { position:fixed; top:20px; left:20px; z-index:10; background:rgba(13,15,22,.9); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); color:var(--text); padding:9px 16px; border-radius:999px; cursor:pointer; font-size:13px; transition:transform .25s, border-color .25s; }
.rp-back:hover { border-color:var(--border-h); transform:translateY(-2px); }

.rp-card { position:relative; z-index:1; width:min(100%,440px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,6vw,44px); animation:rpFadeUp .4s ease; box-shadow:0 32px 80px rgba(0,0,0,.5); }
.rp-logo { height:34px; cursor:pointer; margin-bottom:28px; }
.rp-title { font-family:var(--font-h); font-weight:800; letter-spacing:-.02em; font-size:clamp(22px,5.5vw,27px); line-height:1.15; margin-bottom:8px; text-wrap:balance; }
.rp-sub { font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:28px; }

.rp-form { display:flex; flex-direction:column; gap:16px; }
.rp-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.rp-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.rp-input::placeholder { color:var(--muted); opacity:.75; }
.rp-input:hover { border-color:var(--border-h); }
.rp-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.rp-pwrap { position:relative; }
.rp-input-pw { padding-right:48px; }
.rp-eye { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; color:var(--muted); padding:4px; line-height:1; transition:color .2s; }
.rp-eye:hover { color:var(--text); }
.rp-hint { font-size:11px; margin-top:6px; }
.rp-hint.is-ok { color:var(--live); }
.rp-hint.is-err { color:var(--danger); }

.rp-error { padding:12px 16px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.6; }
.rp-error-link { background:none; border:none; color:var(--gold); cursor:pointer; font-weight:600; font-size:13px; text-decoration:underline; padding:0; }

.rp-cta { width:100%; margin-top:4px; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.rp-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.rp-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }

.rp-success { text-align:center; animation:rpFadeUp .35s ease both; }
.rp-success-icon { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.35); color:var(--live); display:grid; place-items:center; }
.rp-success-icon svg { width:30px; height:30px; }
.rp-success-msg { color:var(--muted); font-size:14.5px; line-height:1.7; margin-bottom:22px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .rp-page { padding-top:84px; align-content:start; }
}
@media (max-width: 480px) {
  .rp-back { top:14px; left:14px; padding:8px 14px; }
  .rp-card { padding:24px 18px 28px; }
  .rp-input { font-size:16px; }   /* prevents iOS focus zoom */
  .rp-logo { height:30px; margin-bottom:22px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
