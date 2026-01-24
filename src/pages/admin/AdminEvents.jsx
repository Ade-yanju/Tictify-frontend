import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function AdminEvents() {
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
        <h1>All Events</h1>
        <p style={styles.muted}>Platform-wide event monitoring</p>
      </header>

      {events.length === 0 ? (
        <p style={styles.muted}>No events found.</p>
      ) : (
        <div style={styles.table}>
          {events.map((e) => (
            <div key={e._id} style={styles.row}>
              <div>
                <strong>{e.title}</strong>
                <p style={styles.small}>{new Date(e.date).toDateString()}</p>
                <p style={styles.muted}>Organizer: {e.organizerName}</p>
              </div>

              <div>
                <p>Tickets</p>
                <strong>
                  {e.ticketsSold}/{e.capacity}
                </strong>
              </div>

              <div>
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
  return (
    <span
      style={{
        ...styles.badge,
        background:
          status === "LIVE"
            ? "#22F2A6"
            : status === "ENDED"
              ? "#ff4d4f"
              : "#fadb14",
      }}
    >
      {status}
    </span>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 32,
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    marginBottom: 32,
  },

  table: {
    display: "grid",
    gap: 16,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 16,
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
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
