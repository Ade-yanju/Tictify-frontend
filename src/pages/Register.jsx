import { useState } from "react";
import { register } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(form.password);
  const passwordsMatch =
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "organizer", // 🔒 HARD ENFORCED
      });

      window.location.href = "/login";
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.viewport}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create Organizer Account</h2>
        <p style={styles.subtitle}>
          Register as an event organizer to create and manage events on Tictify
        </p>

        <input
          style={styles.input}
          placeholder="Full name"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* PASSWORD */}
        <div style={styles.passwordField}>
          <input
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* STRENGTH */}
        {form.password && (
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

        {/* CONFIRM PASSWORD */}
        <div style={styles.passwordField}>
          <input
            style={styles.input}
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            required
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

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.submit} disabled={loading}>
          {loading ? "Creating account..." : "Create Organizer Account"}
        </button>

        <p style={styles.footer}>
          Already an organizer?{" "}
          <a href="/login" style={styles.link}>
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

/* ================= PASSWORD STRENGTH ================= */
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
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    padding: 20,
    color: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "36px 32px",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  title: { marginBottom: 6, fontSize: 24 },

  subtitle: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 24,
  },

  input: {
    width: "95%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    marginBottom: 14,
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

  error: {
    color: "#ff4d4f",
    fontSize: 13,
    marginBottom: 12,
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
    color: "#22F2A6",
    textDecoration: "none",
    fontWeight: 500,
  },
};
