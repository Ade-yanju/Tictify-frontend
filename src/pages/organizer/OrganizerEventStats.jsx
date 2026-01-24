import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function OrganizerEventStats() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/organizer/events/stats`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load stats");

        const data = await res.json();
        setEvents(data);
      } catch {
        setError("Unable to load event statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading analytics…</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Event Performance</h1>
          <p style={styles.subtitle}>
            Overview of ticket sales, scans, and revenue for your events
          </p>
        </div>

        <button
          style={styles.backBtn}
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* EMPTY STATE */}
      {events.length === 0 && (
        <p style={styles.empty}>You haven’t hosted any events yet.</p>
      )}

      {/* EVENTS GRID */}
      <div style={styles.grid}>
        {events.map((event) => (
          <div key={event.eventId} style={styles.card}>
            {/* BANNER */}
            <div style={styles.bannerWrapper}>
              <img src={event.banner} alt={event.title} style={styles.banner} />
              <span style={styles.status(event.status)}>{event.status}</span>
            </div>

            {/* BODY */}
            <div style={styles.body}>
              <h3 style={styles.title}>{event.title}</h3>

              <p style={styles.meta}>
                📅 {new Date(event.date).toDateString()}
              </p>

              {/* STATS */}
              <div style={styles.statsGrid}>
                <Stat label="Tickets Sold" value={event.ticketsSold} />
                <Stat label="Remaining" value={event.ticketsRemaining} />
                <Stat label="Scanned" value={event.ticketsScanned} />
                <Stat
                  label="Revenue"
                  value={`₦${event.revenue.toLocaleString()}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STAT COMPONENT ================= */

function Stat({ label, value }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F0618",
    color: "#fff",
    padding: "clamp(16px,4vw,32px)",
    fontFamily: "Inter, system-ui",
  },

  header: {
    maxWidth: 1200,
    margin: "0 auto 32px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
  },

  heading: {
    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
    marginBottom: 6,
  },

  subtitle: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: 22,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },

  bannerWrapper: {
    position: "relative",
    height: 160,
  },

  banner: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  status: (status) => ({
    position: "absolute",
    top: 12,
    right: 12,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
          ? "#ff4d4f"
          : "#fadb14",
    color: "#000",
  }),

  body: {
    padding: 18,
  },

  title: {
    fontSize: 17,
    marginBottom: 8,
  },

  meta: {
    fontSize: 13,
    color: "#CFC9D6",
    marginBottom: 16,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },

  statCard: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "12px 10px",
    textAlign: "center",
  },

  statLabel: {
    display: "block",
    fontSize: 12,
    color: "#CFC9D6",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 16,
    fontWeight: 700,
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#CFC9D6",
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
