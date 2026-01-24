import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/events/organizer`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }

  async function updateStatus(id, action) {
    await fetch(`${import.meta.env.VITE_API_URL}/api/events/${action}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    fetchEvents();
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading events...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>My Events</h1>
        <button
          style={styles.primaryBtn}
          onClick={() => (window.location.href = "/organizer/create-event")}
        >
          + Create Event
        </button>
      </header>

      <div style={styles.grid}>
        {events.map((event) => (
          <div key={event._id} style={styles.card}>
            <h3>{event.title}</h3>
            <p style={styles.muted}>
              {new Date(event.date).toDateString()} • {event.location}
            </p>

            <span style={styles.status(event.status)}>{event.status}</span>

            <div style={styles.actions}>
              {event.status === "DRAFT" && (
                <button
                  style={styles.actionBtn}
                  onClick={() => updateStatus(event._id, "publish")}
                >
                  Publish
                </button>
              )}

              {event.status === "LIVE" && (
                <>
                  <button
                    style={styles.actionBtn}
                    onClick={() => updateStatus(event._id, "end")}
                  >
                    End Event
                  </button>
                  <button
                    style={styles.linkBtn}
                    onClick={() =>
                      (window.location.href = `/organizer/scan?event=${event._id}`)
                    }
                  >
                    Scan Tickets
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#0F0618",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 32,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  status: (status) => ({
    display: "inline-block",
    marginTop: 10,
    marginBottom: 12,
    fontWeight: 600,
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
          ? "#ff4d4f"
          : "#fadb14",
  }),

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  actionBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  linkBtn: {
    background: "none",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  primaryBtn: {
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    border: "none",
    padding: "12px 20px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },
};
