/* ═══════════════════════════════════════════════════════════
   Register.jsx — Tictify 2026 Redesign
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const logo = "/logo.png";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Password strength meter ─────────────────────────────── */
function StrengthBar({ password }) {
  if (!password) return null;
  const levels = [
    { min: 0, max: 4, label: "Too short", pct: 15, color: "#E05C5C" },
    { min: 4, max: 6, label: "Weak", pct: 35, color: "#E8874A" },
    { min: 6, max: 9, label: "Good", pct: 68, color: "#E8C96A" },
    { min: 9, max: 999, label: "Strong", pct: 100, color: "#6BF0A0" },
  ];
  const s =
    levels.find((l) => password.length >= l.min && password.length < l.max) ||
    levels[3];
  return (
    <div className="rg-sb">
      <div className="rg-sb-track">
        <div
          className="rg-sb-fill"
          style={{ width: `${s.pct}%`, background: s.color }}
        />
      </div>
      <p className="rg-sb-label" style={{ color: s.color }}>
        {s.label}
      </p>
    </div>
  );
}

/* ── Password input with show/hide ───────────────────────── */
function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label className="rg-label">{label}</label>}
      <div className="rg-pwrap">
        <input
          type={show ? "text" : "password"}
          className={`rg-input rg-input-pw${focused ? " is-f" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
        />
        <button
          type="button"
          className="rg-eye"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

/* ── Result modal ────────────────────────────────────────── */
function AuthModal({ type, message, onClose }) {
  return (
    <div className="rg-ov">
      <div className="rg-modal">
        <div className="rg-modal-ic" aria-hidden="true">
          {type === "error" ? "⚠️" : "🎉"}
        </div>
        <h3
          className={`rg-modal-title ${type === "error" ? "is-err" : "is-ok"}`}
        >
          {type === "error" ? "Registration Failed" : "Account Created!"}
        </h3>
        <p className="rg-modal-msg">{message}</p>
        <button className="rg-btn rg-btn-gold rg-w100" onClick={onClose}>
          {type === "success" ? "Sign In →" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Register() {
  injectStyles("tictify-register-css", CSS);
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [focused, setFocused] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    const invite = new URLSearchParams(location.search).get("invite");
    if (invite && /^[A-Za-z0-9_-]{2,30}$/.test(invite)) {
      setInviteCode(invite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passwordsMatch =
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!emailValid)
      return setModal({
        type: "error",
        message: "Please enter a valid email address.",
      });
    if (form.password !== form.confirmPassword)
      return setModal({ type: "error", message: "Passwords do not match." });

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "organizer",
        ...(inviteCode ? { referredBy: inviteCode } : {}),
      });
      setModal({
        type: "success",
        message: "Your organizer account is ready. You can now sign in.",
      });
    } catch {
      setModal({
        type: "error",
        message: "Registration failed. This email may already be in use.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) navigate("/");
    };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="rg-page">
      {/* Ambient gold glow behind the card */}
      <div className="rg-glow" aria-hidden="true" />

      {modal && (
        <AuthModal
          type={modal.type}
          message={modal.message}
          onClose={() => {
            setModal(null);
            if (modal.type === "success") navigate("/login", { replace: true });
          }}
        />
      )}

      {loading && (
        <div className="rg-ov">
          <div className="rg-load">
            <div className="rg-spinner" />
            <p>Creating your account…</p>
          </div>
        </div>
      )}

      <button className="rg-back" onClick={() => navigate("/")}>
        ← Back
      </button>

      <div className="rg-card">
        <img
          src={logo}
          alt="Tictify"
          className="rg-logo"
          onClick={() => navigate("/")}
        />

        <h2 className="rg-title">Create an account</h2>
        <p className="rg-sub">
          Register as an organizer on <strong>Tictify</strong>
        </p>

        {inviteCode && (
          <div className="rg-invite-pill">
            Invited by a Campus Partner ({inviteCode})
          </div>
        )}

        <form className="rg-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="rg-label">Full Name</label>
            <input
              type="text"
              className={`rg-input${focused.name ? " is-f" : ""}`}
              placeholder="Jane Doe"
              value={form.name}
              onChange={set("name")}
              onFocus={() => setFocused((f) => ({ ...f, name: true }))}
              onBlur={() => setFocused((f) => ({ ...f, name: false }))}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="rg-label">Email Address</label>
            <input
              type="email"
              className={`rg-input${focused.email ? " is-f" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              onFocus={() => setFocused((f) => ({ ...f, email: true }))}
              onBlur={() => setFocused((f) => ({ ...f, email: false }))}
              required
            />
            {form.email && (
              <p className={`rg-hint ${emailValid ? "is-ok" : "is-err"}`}>
                {emailValid ? "✓ Valid address" : "Enter a valid email"}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <PasswordField
              label="Password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
            />
            {form.password && (
              <div className="rg-sb-wrap">
                <StrengthBar password={form.password} />
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Repeat your password"
            />
            {form.confirmPassword && (
              <p className={`rg-hint ${passwordsMatch ? "is-ok" : "is-err"}`}>
                {passwordsMatch ? "✓ Passwords match" : "Passwords don't match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="rg-btn rg-btn-gold rg-submit"
            disabled={loading}
          >
            Create Organizer Account →
          </button>
        </form>

        <p className="rg-alt">
          Already registered?{" "}
          <button
            type="button"
            className="rg-link"
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

@keyframes rgSpin { to { transform:rotate(360deg); } }
@keyframes rgFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes rgGlow { 0%,100% { opacity:.5; } 50% { opacity:.95; } }

/* ── Page ── */
.rg-page {
  min-height:100svh; background:var(--bg); display:grid; place-items:center;
  padding:clamp(16px,5vw,40px); position:relative; font-family:var(--font-b);
}
.rg-glow {
  position:fixed; top:12%; left:50%; transform:translateX(-50%);
  width:min(640px,86vw); height:340px;
  background:radial-gradient(ellipse at center, var(--gold-glo), transparent 68%);
  opacity:.4; pointer-events:none; z-index:0; animation:rgGlow 6s ease-in-out infinite;
}

/* ── Back pill ── */
.rg-back {
  position:fixed; top:20px; left:20px; z-index:10;
  background:rgba(13,15,22,.9); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1px solid var(--border); color:var(--text);
  padding:9px 16px; border-radius:999px; cursor:pointer; font-size:13px;
  transition:transform .25s, border-color .25s;
}
.rg-back:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Card ── */
.rg-card {
  position:relative; z-index:1; width:min(100%,460px);
  background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:clamp(24px,6vw,44px); animation:rgFadeUp .4s ease;
  box-shadow:0 32px 80px rgba(0,0,0,.5);
}
.rg-logo { height:34px; display:block; cursor:pointer; margin-bottom:28px; }

.rg-title {
  font-family:var(--font-h); font-weight:800; letter-spacing:-.02em;
  font-size:clamp(23px,5.5vw,29px); line-height:1.1; margin-bottom:6px;
}
.rg-sub { font-size:clamp(13.5px,1.8vw,14.5px); color:var(--muted); line-height:1.55; margin-bottom:32px; }
.rg-sub strong { color:var(--text); }

/* ── Invite pill ── */
.rg-invite-pill {
  display:inline-block; margin:-16px 0 24px; padding:8px 16px;
  background:var(--gold-dim); border:1px solid rgba(232,201,106,.35);
  color:var(--gold); font-size:12.5px; font-weight:600; letter-spacing:.02em;
  border-radius:999px; overflow-wrap:anywhere;
}

/* ── Form ── */
.rg-form { display:flex; flex-direction:column; gap:16px; }
.rg-label {
  display:block; font-size:11px; font-weight:600; letter-spacing:.08em;
  text-transform:uppercase; color:var(--muted); margin-bottom:8px;
}
.rg-input {
  width:100%; padding:14px 16px; background:var(--card);
  border:1px solid var(--border); border-radius:var(--r-sm);
  color:var(--text); font-size:14px;
  transition:border-color .2s, box-shadow .2s;
}
.rg-input::placeholder { color:var(--muted); opacity:.75; }
.rg-input:focus, .rg-input.is-f {
  border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim);
}
.rg-pwrap { position:relative; }
.rg-input-pw { padding-right:48px; }
.rg-eye {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; font-size:16px;
  color:var(--muted); padding:4px; line-height:1; transition:color .2s;
}
.rg-eye:hover { color:var(--text); }

.rg-hint { font-size:11px; margin-top:6px; }
.rg-hint.is-ok { color:var(--live); }
.rg-hint.is-err { color:var(--danger); }

/* ── Strength bar ── */
.rg-sb-wrap { margin-top:10px; }
.rg-sb { margin-bottom:4px; }
.rg-sb-track { height:4px; background:var(--border); border-radius:4px; overflow:hidden; margin-bottom:6px; }
.rg-sb-fill { height:100%; border-radius:4px; transition:width .3s, background .3s; }
.rg-sb-label { font-size:11px; font-weight:600; }

/* ── Buttons ── */
.rg-btn {
  border-radius:999px; border:1px solid transparent; cursor:pointer;
  font-family:var(--font-h); font-weight:700; font-size:15px;
  padding:15px 24px; transition:transform .25s, box-shadow .25s, opacity .2s;
}
.rg-btn-gold { background:var(--gold); color:#080910; box-shadow:0 8px 24px var(--gold-dim); }
.rg-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 34px var(--gold-glo); }
.rg-btn:disabled { cursor:not-allowed; opacity:.7; }
.rg-submit { width:100%; margin-top:4px; }
.rg-w100 { width:100%; }

.rg-alt { margin-top:28px; text-align:center; font-size:13px; color:var(--muted); }
.rg-link {
  background:none; border:none; color:var(--gold); cursor:pointer;
  font-weight:600; font-size:13px; text-decoration:underline; padding:0;
}

/* ── Overlays (modal + loading) ── */
.rg-ov {
  position:fixed; inset:0; background:rgba(8,9,16,.85);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  display:grid; place-items:center; z-index:2000; padding:24px;
}
.rg-modal {
  background:var(--surface); border:1px solid var(--border); border-radius:var(--r);
  padding:clamp(24px,5vw,36px); width:min(100%,360px); text-align:center;
  animation:rgFadeUp .3s ease;
}
.rg-modal-ic { font-size:36px; margin-bottom:14px; }
.rg-modal-title { font-family:var(--font-h); font-weight:700; font-size:18px; margin-bottom:10px; }
.rg-modal-title.is-err { color:var(--danger); }
.rg-modal-title.is-ok { color:var(--live); }
.rg-modal-msg { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:24px; }

.rg-load { text-align:center; }
.rg-load p { font-family:var(--font-h); font-weight:600; }
.rg-spinner {
  width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--gold);
  border-radius:50%; animation:rgSpin 1s linear infinite; margin:0 auto 16px;
}

/* ══════════ RESPONSIVE ══════════ */
@media (min-width: 1024px) {
  .rg-glow { width:720px; height:400px; }
}
@media (max-width: 768px) {
  .rg-page { padding-top:84px; align-content:start; }
}
@media (max-width: 480px) {
  .rg-back { top:14px; left:14px; padding:8px 14px; }
  .rg-card { padding:24px 18px 28px; }
  .rg-input { font-size:16px; }   /* prevents iOS focus zoom */
  .rg-form { gap:14px; }
  .rg-logo { height:30px; margin-bottom:22px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
