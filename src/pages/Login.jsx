import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 LOGIN REQUEST
      const res = await login({ email, password });

      /**
       * Expected response:
       * {
       *   token,
       *   user: { role: "admin" | "organizer" }
       * }
       */
      const { user } = res;

      if (!user?.role) {
        throw new Error("Invalid authentication response");
      }

      // ✅ ROLE-BASED NAVIGATION (SPA SAFE)
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "organizer") {
        navigate("/organizer/dashboard", { replace: true });
      } else {
        throw new Error("Unauthorized role");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(password);

  return (
    <div style={styles.viewport}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>
          Login to manage your events on <strong>Tictify</strong>
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          style={styles.input}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
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
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* PASSWORD STRENGTH */}
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

        {/* ERROR */}
        {error && <p style={styles.error}>{error}</p>}

        {/* SUBMIT */}
        <button style={styles.submit} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* REGISTER LINK */}
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
    color: "#fff",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "36px 32px",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  title: {
    marginBottom: 6,
    fontSize: 24,
  },

  subtitle: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 24,
  },

  input: {
    width: "95%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    marginBottom: 14,
  },

  passwordField: {
    position: "relative",
  },

  eye: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    opacity: 0.8,
  },

  strength: {
    marginBottom: 16,
  },

  strengthBar: {
    height: 6,
    borderRadius: 6,
    marginBottom: 4,
    transition: "width 0.3s ease",
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
};
