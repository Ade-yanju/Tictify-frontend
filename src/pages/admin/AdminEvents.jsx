import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";

export default function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/events`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load events");

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message || "Unable to load events");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading events…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>All Events</h1>
        <p style={styles.muted}>Platform-wide event monitoring</p>
      </header>

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
              <div style={styles.left}>
                <strong>{e.title}</strong>
                <p style={styles.small}>{new Date(e.date).toDateString()}</p>
                <p style={styles.muted}>Organizer: {e.organizerName || "—"}</p>
              </div>

              <div style={styles.center}>
                <p style={styles.muted}>Tickets</p>
                <strong>
                  {e.ticketsSold}/{e.capacity}
                </strong>
              </div>

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

/* ================= HELPERS ================= */

function StatusBadge({ status }) {
  const color =
    status === "LIVE" ? "#22F2A6" : status === "ENDED" ? "#ff4d4f" : "#fadb14";

  return <span style={{ ...styles.badge, background: color }}>{status}</span>;
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

  header: { marginBottom: 32 },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
  },

  list: {
    display: "grid",
    gap: 16,
  },

  card: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr auto",
    gap: 16,
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    cursor: "pointer",
  },

  left: {
    minWidth: 0,
  },

  center: {
    textAlign: "center",
  },

  right: {
    display: "flex",
    justifyContent: "flex-end",
  },

  badge: {
    padding: "6px 14px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
    color: "#000",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  small: {
    color: "#CFC9D6",
    fontSize: 12,
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
