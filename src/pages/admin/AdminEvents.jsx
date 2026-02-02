import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../../services/authService";

export default function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD EVENTS ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/events`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Unauthorized or session expired");

        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load events");
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
  if (loading) {
    return <LoadingModal />;
  }

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

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>All Events</h1>
          <p style={styles.muted}>Platform-wide event monitoring</p>
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

      {/* ================= LIST ================= */}
      {events.length === 0 ? (
        <p style={styles.muted}>No events found.</p>
      ) : (
        <div style={styles.list}>
          {events.map((e) => (
            <div
              key={e._id}
              style={styles.card}
              onClick={() => navigate(`/admin/events/${e._id}`)}
            >
              {/* LEFT */}
              <div style={styles.left}>
                <strong style={styles.eventTitle}>{e.title}</strong>
                <p style={styles.small}>
                  📅 {new Date(e.date).toDateString()}
                </p>
                <p style={styles.muted}>
                  Organizer: {e.organizerName || "—"}
                </p>
              </div>

              {/* CENTER */}
              <div style={styles.center}>
                <span style={styles.small}>Tickets</span>
                <strong>
                  {(e.ticketsSold ?? 0)}/{e.capacity ?? "—"}
                </strong>
              </div>

              {/* RIGHT */}
              <div style={styles.right}>
                <StatusBadge status={e.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  const color =
    status === "LIVE"
      ? "#22F2A6"
      : status === "ENDED"
      ? "#ff4d4f"
      : "#fadb14";

  return (
    <span style={{ ...styles.badge, background: color }}>
      {status || "UNKNOWN"}
    </span>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading events…</p>
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

  /* Desktop layout */
  "@media (min-width: 720px)": {
    card: {
      gridTemplateColumns: "2fr 1fr auto",
      alignItems: "center",
    },
  },

  left: {
    minWidth: 0,
  },

  center: {
    textAlign: "left",
  },

  right: {
    display: "flex",
    justifyContent: "flex-start",
  },

  eventTitle: {
    fontSize: 16,
    marginBottom: 4,
  },

  badge: {
    padding: "6px 14px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
    color: "#000",
    whiteSpace: "nowrap",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  small: {
    color: "#CFC9D6",
    fontSize: 12,
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
