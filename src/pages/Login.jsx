import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { type, message }

  const emailValid = validateEmail(email);
  const strength = getPasswordStrength(password);

  /* ================= LOGIN ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    if (!emailValid) {
      return setModal({
        type: "error",
        message: "Please enter a valid email address",
      });
    }

    if (!password) {
      return setModal({
        type: "error",
        message: "Password is required",
      });
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      const { user } = res;

      if (!user?.role) throw new Error();

      navigate(
        user.role === "admin"
          ? "/admin/dashboard"
          : "/organizer/dashboard",
        { replace: true },
      );
    } catch {
      setModal({
        type: "error",
        message: "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= SWIPE BACK ================= */
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 80) navigate("/");
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);

  return (
    <div style={styles.viewport}>
      {loading && <LoadingModal />}

      {modal && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>
          Login to manage your events on <strong>Tictify</strong>
        </p>

        <input
          type="email"
          placeholder="Email address"
          style={styles.input}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {email && (
          <p
            style={{
              fontSize: 12,
              marginBottom: 12,
              color: emailValid ? "#22F2A6" : "#ff4d4f",
            }}
          >
            {emailValid ? "Valid email address" : "Invalid email format"}
          </p>
        )}

        <div style={styles.passwordField}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            style={styles.input}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {password && (
          <div style={styles.strength}>
            <div
              style={{
                ...styles.strengthBar,
                width: strength.width,
                backgroundColor: strength.color,
              }}
            />
            <span style={{ color: strength.color, fontSize: 12 }}>
              {strength.label}
            </span>
          </div>
        )}

        <button style={styles.submit} disabled={loading}>
          Login
        </button>

        <p style={styles.footer}>
          Organizer only?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={styles.linkBtn}
          >
            Create an organizer account
          </button>
        </p>
      </form>
    </div>
  );
}

/* ================= MODALS ================= */

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Signing you in…</p>
      </div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ color: type === "error" ? "#ff4d4f" : "#22F2A6" }}>
          {type === "error" ? "Login Failed" : "Success"}
        </h3>
        <p style={{ marginTop: 10 }}>{message}</p>
        <button style={styles.modalBtn} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password) {
  if (password.length < 4)
    return { label: "Too short", width: "25%", color: "#ff4d4f" };
  if (password.length < 6)
    return { label: "Weak", width: "40%", color: "#ff7a45" };
  if (password.length < 9)
    return { label: "Good", width: "70%", color: "#fadb14" };
  return { label: "Strong", width: "100%", color: "#22F2A6" };
}

/* ================= STYLES ================= */

const styles = {
  viewport: {
    minHeight: "100svh", // 🔥 mobile-safe
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    padding: "clamp(16px,4vw,32px)",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "clamp(24px,5vw,36px)",
    borderRadius: 24,
  },

  title: { marginBottom: 6, fontSize: "clamp(20px,4vw,26px)" },

  subtitle: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 24,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    marginBottom: 8,
  },

  passwordField: { position: "relative" },

  eye: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  strength: { marginBottom: 16 },

  strengthBar: {
    height: 6,
    borderRadius: 6,
    marginBottom: 4,
    transition: "width 0.3s ease",
  },

  submit: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  footer: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#CFC9D6",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
    fontWeight: 500,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 2000,
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 18,
    width: 320,
    textAlign: "center",
  },

  modalBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },

  loadingModal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
    width: "90%",
    maxWidth: 320,
  },

  spinner: {
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

/* spinner */
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
