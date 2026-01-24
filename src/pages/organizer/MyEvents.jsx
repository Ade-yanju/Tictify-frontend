import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function MyEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  async function fetchEvents() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/organizer`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      const data = await res.json();
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, action) {
    if (processingId) return;

    setProcessingId(id);

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${action}/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      await fetchEvents();
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading your events…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1>My Events</h1>
          <p style={styles.muted}>Manage and monitor your events</p>
        </div>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/organizer/create-event")}
        >
          + Create Event
        </button>
      </header>

      {/* EMPTY STATE */}
      {events.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.muted}>You haven’t created any events yet.</p>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/organizer/create-event")}
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((event) => (
            <div key={event._id} style={styles.card}>
              <div>
                <h3>{event.title}</h3>
                <p style={styles.muted}>
                  {new Date(event.date).toDateString()} • {event.location}
                </p>

                <span style={styles.status(event.status)}>{event.status}</span>
              </div>

              <div style={styles.actions}>
                {event.status === "DRAFT" && (
                  <button
                    style={styles.actionBtn}
                    disabled={processingId === event._id}
                    onClick={() => updateStatus(event._id, "publish")}
                  >
                    Publish
                  </button>
                )}

                {event.status === "LIVE" && (
                  <>
                    <button
                      style={styles.endBtn}
                      disabled={processingId === event._id}
                      onClick={() => updateStatus(event._id, "end")}
                    >
                      End Event
                    </button>

                    <button
                      style={styles.linkBtn}
                      onClick={() =>
                        navigate(`/organizer/scan?event=${event._id}`)
                      }
                    >
                      Scan Tickets
                    </button>
                  </>
                )}

                {event.status === "ENDED" && (
                  <span style={styles.muted}>Event completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px,4vw,32px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },

  status: (status) => ({
    display: "inline-block",
    marginTop: 8,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.5,
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
          ? "#ff4d4f"
          : "#fadb14",
  }),

  actions: {
    display: "flex",
    gap: 10,
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

  endBtn: {
    background: "#ff4d4f",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },

  linkBtn: {
    background: "transparent",
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
    fontWeight: 700,
    cursor: "pointer",
  },

  empty: {
    background: "rgba(255,255,255,0.06)",
    padding: 40,
    borderRadius: 20,
    textAlign: "center",
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
