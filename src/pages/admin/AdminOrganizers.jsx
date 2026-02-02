import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../../services/authService";

export default function AdminOrganizers() {
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ORGANIZERS ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/organizers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Unauthorized or session expired");

        const data = await res.json();
        setOrganizers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load organizers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button style={styles.primaryBtn} onClick={handleLogout}>
          Login Again
        </button>
      </div>
    );
  }

  const topOrganizers = organizers.slice(0, 5);

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Organizers</h1>
          <p style={styles.muted}>Top performers & platform contributors</p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ================= LEADERBOARD ================= */}
      <section style={styles.leaderboard}>
        <h3 style={{ marginBottom: 16 }}>Top Performing Organizers</h3>

        {topOrganizers.length === 0 ? (
          <p style={styles.muted}>No organizers yet.</p>
        ) : (
          topOrganizers.map((o, i) => (
            <div
              key={o._id}
              style={styles.leaderRow}
              onClick={() => navigate(`/admin/organizers/${o._id}`)}
            >
              <span style={styles.rank}>#{i + 1}</span>

              <div style={styles.flexCol}>
                <strong>{o.name}</strong>
                <span style={styles.muted}>{o.email}</span>
              </div>

              <strong>
                ₦{(o.revenue || 0).toLocaleString()}
              </strong>
            </div>
          ))
        )}
      </section>

      {/* ================= FULL LIST ================= */}
      <section style={styles.list}>
        {organizers.map((o) => (
          <div
            key={o._id}
            style={styles.card}
            onClick={() => navigate(`/admin/organizers/${o._id}`)}
          >
            <div style={styles.info}>
              <strong>{o.name}</strong>
              <p style={styles.muted}>{o.email}</p>
            </div>

            <Stat label="Events" value={o.events ?? 0} />
            <Stat label="Tickets Sold" value={o.ticketsSold ?? 0} />
            <Stat
              label="Revenue"
              value={`₦${(o.revenue || 0).toLocaleString()}`}
            />
          </div>
        ))}
      </section>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading organizers…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px,4vw,32px)",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
    marginBottom: 32,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
    marginBottom: 4,
  },

  leaderboard: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
  },

  leaderRow: {
    display: "grid",
    gridTemplateColumns: "40px 1fr auto",
    gap: 16,
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },

  rank: {
    fontWeight: 700,
    color: "#22F2A6",
  },

  list: {
    display: "grid",
    gap: 16,
  },

  card: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    cursor: "pointer",
  },

  /* Desktop enhancement */
  "@media (min-width: 720px)": {
    card: {
      gridTemplateColumns: "1fr repeat(3, minmax(100px, auto))",
      alignItems: "center",
    },
  },

  info: {
    minWidth: 0,
  },

  stat: {
    textAlign: "left",
  },

  statLabel: {
    display: "block",
    fontSize: 12,
    color: "#CFC9D6",
  },

  flexCol: {
    display: "flex",
    flexDirection: "column",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid #ff4d4f",
    color: "#ff4d4f",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "#0F0618",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  loadingModal: {
    background: "rgba(255,255,255,0.08)",
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

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
    textAlign: "center",
    padding: 20,
  },
};

/* ================= SPINNER ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
