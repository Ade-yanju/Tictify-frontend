/* ═══════════════════════════════════════════════════════════
   Login.jsx  — Tictify 2026 Redesign
═══════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  verifyEmail,
  resendVerification,
} from "../services/authService";

/* Where a fresh session lands */
function roleHome(role) {
  return role === "admin"
    ? "/admin/dashboard"
    : role === "ambassador"
      ? "/ambassador"
      : role === "affiliate"
        ? "/affiliate/dashboard"
        : "/organizer/dashboard";
}

const RESEND_COOLDOWN_S = 30;

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.16);
    --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.25);
    --text:#F0EDE8; --muted:#7A7870; --danger:#E05C5C; --live:#6BF0A0;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif; --r:20px; --r-sm:12px;
  }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
  input,select,button { font-family:var(--font-b); outline:none; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glowPulse { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }

  /* ── Responsive layout fixes (320px–768px) ── */
  @media (max-width:768px) {
    /* keep the card clear of the fixed Back pill on short/narrow viewports */
    .lg-page { padding-top:84px !important; align-content:start; }
  }
  @media (max-width:480px) {
    .lg-back { top:14px !important; left:14px !important; padding:8px 14px !important; }
    .lg-card { padding:24px 18px 28px !important; }
    .lg-input { font-size:16px !important; } /* prevents iOS focus zoom */
  }

  .lg-forgot { display:block; margin:14px auto 0; background:none; border:none; color:var(--muted); font-size:13px; font-weight:500; cursor:pointer; padding:4px 8px; transition:color .2s; }
  .lg-forgot:hover { color:var(--gold); }

  /* ── Email verification (OTP) step ── */
  .lg-otp {
    width:100%; padding:14px 16px; background:var(--card);
    border:1px solid var(--border); border-radius:var(--r-sm);
    color:var(--text); text-align:center; font-size:22px !important;
    font-weight:700; letter-spacing:10px; font-family:var(--font-h);
    transition:border-color .2s, box-shadow .2s;
  }
  .lg-otp:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
  .lg-otp::placeholder { color:var(--muted); opacity:.6; letter-spacing:10px; }
  .lg-resend {
    background:none; border:none; color:var(--gold); cursor:pointer;
    font-weight:600; font-size:13px; text-decoration:underline; padding:0;
  }
  .lg-resend:disabled { color:var(--muted); cursor:default; text-decoration:none; }
  .lg-otp-note { margin-top:14px; text-align:center; font-size:12px; color:var(--muted); line-height:1.6; }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;

function StrengthBar({ password }) {
  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 4) return { label: "Too short", pct: 15, color: "#E05C5C" };
    if (p.length < 6) return { label: "Weak", pct: 35, color: "#E8874A" };
    if (p.length < 9) return { label: "Good", pct: 68, color: "#E8C96A" };
    return { label: "Strong", pct: 100, color: "#6BF0A0" };
  };
  const s = getStrength(password);
  if (!s) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          height: 4,
          background: "var(--border)",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${s.pct}%`,
            background: s.color,
            borderRadius: 4,
            transition: "width .3s, background .3s",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</p>
    </div>
  );
}

function AuthModal({ type, message, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,9,16,.85)",
        backdropFilter: "blur(12px)",
        display: "grid",
        placeItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#0d0f16",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "clamp(24px,5vw,36px)",
          width: "min(100% - 48px, 360px)",
          textAlign: "center",
          animation: "fadeUp .3s ease",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 14 }}>
          {type === "error" ? "⚠️" : "🎉"}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-h)",
            fontWeight: 700,
            fontSize: 18,
            color: type === "error" ? "var(--danger)" : "var(--live)",
            marginBottom: 10,
          }}
        >
          {type === "error" ? "Login Failed" : "Success"}
        </h3>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px 24px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg,#E8C96A,#F5E196)",
            color: "#080910",
            fontFamily: "var(--font-h)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = "Password" }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        className="lg-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "14px 48px 14px 16px",
          background: "var(--card)",
          border: `1px solid ${focused ? "rgba(232,201,106,.5)" : "var(--border)"}`,
          borderRadius: "var(--r-sm)",
          color: "var(--text)",
          fontSize: 14,
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px var(--gold-dim)" : "none",
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          color: "var(--muted)",
          padding: 4,
          transition: "color .2s",
        }}
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

export default function Login() {
  injectStyles("tictify-base", BASE_CSS);
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* Email verification step (403 { requiresVerification: true }) */
  const [verify, setVerify] = useState(null); // { email, message }
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpNote, setOtpNote] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resending, setResending] = useState(false);

  /* Resend cooldown countdown */
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!emailValid)
      return setModal({
        type: "error",
        message: "Please enter a valid email address",
      });
    if (!password)
      return setModal({ type: "error", message: "Password is required" });

    setLoading(true);
    try {
      const res = await login({ email, password });
      const { user } = res;
      if (!user?.role) throw new Error();
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      if (err?.requiresVerification) {
        // Correct password, unverified email — the server just emailed
        // a fresh 6-digit code. Swap the card to the verify step.
        setOtp("");
        setOtpError("");
        setOtpNote("");
        setResendIn(RESEND_COOLDOWN_S);
        setVerify({
          email: email.trim().toLowerCase(),
          message:
            err.message || "Verify your email — we just sent you a new code",
        });
      } else {
        setModal({ type: "error", message: "Invalid email or password" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (verifying) return;
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);
    setOtpError("");
    setOtpNote("");
    try {
      // Same response shape + persistence as a successful login
      const result = await verifyEmail({ email: verify.email, otp });
      navigate(roleHome(result.user?.role), { replace: true });
    } catch (err) {
      setOtpError(err?.message || "Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setOtpError("");
    try {
      await resendVerification(verify.email);
      setOtpNote("A new code is on its way — check your inbox.");
    } catch (err) {
      setOtpError(err?.message || "Could not resend the code. Try again.");
    } finally {
      setResending(false);
      setResendIn(RESEND_COOLDOWN_S);
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

  return (
    <div
      className="lg-page"
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(16px,5vw,40px)",
        position: "relative",
        fontFamily: "var(--font-b)",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(600px,80vw)",
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(232,201,106,.06), transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "glowPulse 4s ease infinite",
        }}
      />

      {modal && (
        <AuthModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,16,.85)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                border: "3px solid var(--border)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontFamily: "var(--font-h)", fontWeight: 600 }}>
              Signing you in…
            </p>
          </div>
        </div>
      )}

      {/* Back */}
      <button
        className="lg-back"
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "rgba(13,15,22,.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "9px 16px",
          borderRadius: 999,
          cursor: "pointer",
          fontSize: 13,
          zIndex: 10,
        }}
      >
        ← Back
      </button>

      {/* Card */}
      <div
        className="lg-card"
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(100%, 420px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "clamp(28px,6vw,44px)",
          animation: "fadeUp .4s ease",
          boxShadow: "0 32px 80px rgba(0,0,0,.5)",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,#E8C96A,#F5E196)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 28,
            boxShadow: "0 8px 24px rgba(232,201,106,.3)",
          }}
        >
          🎟
        </div>

        {verify ? (
          /* ── Email verification step ── */
          <>
            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(22px,4vw,28px)",
                fontWeight: 800,
                letterSpacing: "-.02em",
                marginBottom: 6,
              }}
            >
              Check your email
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 32,
                lineHeight: 1.5,
              }}
            >
              {verify.message}
            </p>

            <form
              onSubmit={handleVerify}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 8,
                  }}
                >
                  6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  className="lg-otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  aria-label="6-digit verification code"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  required
                />
                {otpError && (
                  <p
                    role="alert"
                    style={{ fontSize: 12, marginTop: 8, color: "var(--danger)" }}
                  >
                    {otpError}
                  </p>
                )}
                {!otpError && otpNote && (
                  <p style={{ fontSize: 12, marginTop: 8, color: "var(--live)" }}>
                    {otpNote}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  marginTop: 8,
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg,#E8C96A,#F5E196)",
                  color: "#080910",
                  fontFamily: "var(--font-h)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor:
                    verifying || otp.length !== 6 ? "not-allowed" : "pointer",
                  opacity: verifying || otp.length !== 6 ? 0.7 : 1,
                  transition: "opacity .2s, box-shadow .2s",
                  boxShadow: "0 8px 24px rgba(232,201,106,.2)",
                }}
              >
                {verifying ? "Verifying…" : "Verify & Continue →"}
              </button>
            </form>

            <p
              style={{
                marginTop: 28,
                textAlign: "center",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              Didn&apos;t get it?{" "}
              <button
                type="button"
                className="lg-resend"
                onClick={handleResend}
                disabled={resendIn > 0 || resending}
              >
                {resendIn > 0
                  ? `Resend code in ${resendIn}s`
                  : resending
                    ? "Sending…"
                    : "Resend code"}
              </button>
            </p>
            <p className="lg-otp-note">
              The code expires in 10 minutes. Check your spam folder too.
            </p>
          </>
        ) : (
          /* ── Login form ── */
          <>
        <h2
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "clamp(22px,4vw,28px)",
            fontWeight: 800,
            letterSpacing: "-.02em",
            marginBottom: 6,
          }}
        >
          Welcome back
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--muted)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Sign in to manage your events on{" "}
          <strong style={{ color: "var(--text)" }}>Tictify</strong>
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="lg-input"
              placeholder="gabriel@tictify.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--card)",
                border: `1px solid ${emailFocused ? "rgba(232,201,106,.5)" : "var(--border)"}`,
                borderRadius: "var(--r-sm)",
                color: "var(--text)",
                fontSize: 14,
                transition: "border-color .2s, box-shadow .2s",
                boxShadow: emailFocused ? "0 0 0 3px var(--gold-dim)" : "none",
              }}
            />
            {email && (
              <p
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  color: emailValid ? "var(--live)" : "var(--danger)",
                }}
              >
                {emailValid ? "✓ Valid address" : "Enter a valid email"}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <div style={{ marginTop: 10 }}>
                <StrengthBar password={password} />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              marginTop: 8,
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg,#E8C96A,#F5E196)",
              color: "#080910",
              fontFamily: "var(--font-h)",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity .2s, box-shadow .2s",
              boxShadow: "0 8px 24px rgba(232,201,106,.2)",
            }}
          >
            Sign In →
          </button>
        </form>

        <button
          type="button"
          className="lg-forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>

        <p
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          New organizer?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "var(--gold)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            Create an account
          </button>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
