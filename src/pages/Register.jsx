import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

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
    --bg:#080910; --card:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.08);
    --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12);
    --text:#F0EDE8; --muted:#7A7870; --danger:#E05C5C; --live:#6BF0A0;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif; --r:20px; --r-sm:12px;
  }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; }
  input,button { font-family:var(--font-b); outline:none; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glowPulse { 0%,100% { opacity:.5; } 50% { opacity:.9; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;

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

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
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
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
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
          }}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
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
          width: "min(100%-48px,360px)",
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
          {type === "error" ? "Registration Failed" : "Account Created!"}
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
          {type === "success" ? "Sign In →" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  injectStyles("tictify-base", BASE_CSS);
  const navigate = useNavigate();
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
  const focusBorder = (key) => ({
    border: `1px solid ${focused[key] ? "rgba(232,201,106,.5)" : "var(--border)"}`,
    boxShadow: focused[key] ? "0 0 0 3px var(--gold-dim)" : "none",
  });

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(16px,5vw,40px)",
        fontFamily: "var(--font-b)",
        position: "relative",
      }}
    >
      {/* Ambient */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(600px,80vw)",
          height: 280,
          background:
            "radial-gradient(ellipse, rgba(232,201,106,.05), transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "glowPulse 5s ease infinite",
        }}
      />

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
              Creating your account…
            </p>
          </div>
        </div>
      )}

      <button
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(100%, 460px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "clamp(28px,6vw,44px)",
          animation: "fadeUp .4s ease",
          boxShadow: "0 32px 80px rgba(0,0,0,.5)",
        }}
      >
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

        <h2
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "clamp(22px,4vw,28px)",
            fontWeight: 800,
            letterSpacing: "-.02em",
            marginBottom: 6,
          }}
        >
          Create an account
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--muted)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Register as an organizer on{" "}
          <strong style={{ color: "var(--text)" }}>Tictify</strong>
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Name */}
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
              Full Name
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={set("name")}
              onFocus={() => setFocused((f) => ({ ...f, name: true }))}
              onBlur={() => setFocused((f) => ({ ...f, name: false }))}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--card)",
                borderRadius: "var(--r-sm)",
                color: "var(--text)",
                fontSize: 14,
                transition: "border-color .2s, box-shadow .2s",
                ...focusBorder("name"),
              }}
            />
          </div>

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
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              onFocus={() => setFocused((f) => ({ ...f, email: true }))}
              onBlur={() => setFocused((f) => ({ ...f, email: false }))}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--card)",
                borderRadius: "var(--r-sm)",
                color: "var(--text)",
                fontSize: 14,
                transition: "border-color .2s, box-shadow .2s",
                ...focusBorder("email"),
              }}
            />
            {form.email && (
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
            <PasswordField
              label="Password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
            />
            {form.password && (
              <div style={{ marginTop: 10 }}>
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
              <p
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  color: passwordsMatch ? "var(--live)" : "var(--danger)",
                }}
              >
                {passwordsMatch ? "✓ Passwords match" : "Passwords don't match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              marginTop: 4,
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg,#E8C96A,#F5E196)",
              color: "#080910",
              fontFamily: "var(--font-h)",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 8px 24px rgba(232,201,106,.2)",
            }}
          >
            Create Organizer Account →
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
          Already registered?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
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
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
