import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState(null); // { type, message }

  /* ================= VALIDATION ================= */

  const emailValid = validateEmail(form.email);
  const passwordStrength = getPasswordStrength(form.password);
  const passwordsMatch =
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  /* ================= REGISTER ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    // 🚫 CLIENT-SIDE GUARDS
    if (!emailValid) {
      return setModal({
        type: "error",
        message: "Please enter a valid email address",
      });
    }

    if (form.password !== form.confirmPassword) {
      return setModal({
        type: "error",
        message: "Passwords do not match",
      });
    }

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
        message: "Account created successfully 🎉",
      });
    } catch {
      setModal({
        type: "error",
        message: "Registration failed. Email may already exist.",
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
          onClose={() => {
            setModal(null);
            if (modal.type === "success") navigate("/login", { replace: true });
          }}
        />
      )}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create Organizer Account</h2>
        <p style={styles.subtitle}>
          Register to create and manage events on <strong>Tictify</strong>
        </p>

        <input
          style={styles.input}
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* EMAIL FEEDBACK */}
        {form.email && (
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

        {/* PASSWORD */}
        <div style={styles.passwordField}>
          <input
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <button
            type="button"
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {form.password && (
          <div style={styles.strength}>
            <div
              style={{
                ...styles.strengthBar,
                width: passwordStrength.width,
                backgroundColor: passwordStrength.color,
              }}
            />
            <span style={{ color: passwordStrength.color, fontSize: 12 }}>
              {passwordStrength.label}
            </span>
          </div>
        )}

        {/* CONFIRM PASSWORD */}
        <div style={styles.passwordField}>
          <input
            style={styles.input}
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            required
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
          <button
            type="button"
            style={styles.eye}
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "🙈" : "👁️"}
          </button>
        </div>

        {form.confirmPassword && (
          <p
            style={{
              fontSize: 12,
              marginBottom: 12,
              color: passwordsMatch ? "#22F2A6" : "#ff4d4f",
            }}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

        <button style={styles.submit} disabled={loading}>
          Create Organizer Account
        </button>

        <p style={styles.footer}>
          Already an organizer?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.link}
          >
            Login
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
        <p style={{ marginTop: 12 }}>Creating account…</p>
      </div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ color: type === "error" ? "#ff4d4f" : "#22F2A6" }}>
          {type === "error" ? "Error" : "Success"}
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
/* (unchanged except modalBtn added) */

const styles = {
  viewport: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    padding: "clamp(16px,4vw,32px)",
    color: "#fff",
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
  },

  card: {
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "clamp(24px,5vw,36px)",
    borderRadius: 24,
  },

  title: { marginBottom: 6, fontSize: 24 },

  subtitle: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 24,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
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
    textAlign: "center",
    fontSize: 14,
    color: "#CFC9D6",
  },

  link: {
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
