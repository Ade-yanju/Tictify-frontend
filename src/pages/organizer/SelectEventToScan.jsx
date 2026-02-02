import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";

export default function SelectEventToScan() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/organizer`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to load events");

      const data = await res.json();

      // ✅ Only LIVE events are scannable
      setEvents(
        Array.isArray(data) ? data.filter((e) => e.status === "LIVE") : [],
      );
    } catch {
      setError("Unable to load your events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div style={styles.page}>
      {/* ================= LOADING MODAL ================= */}
      {loading && <LoadingModal />}

      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Dashboard
        </button>

        <div>
          <h1 style={styles.title}>Select Event to Scan</h1>
          <p style={styles.muted}>
            Choose an active event to begin ticket scanning
          </p>
        </div>
      </header>

      {/* ================= ERROR ================= */}
      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={loadEvents}>
            Retry
          </button>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && !error && events.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.muted}>No active events available for scanning.</p>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/organizer/create-event")}
          >
            Create an Event
          </button>
        </div>
      )}

      {/* ================= EVENT LIST ================= */}
      {!loading && !error && events.length > 0 && (
        <div style={styles.list}>
          {events.map((event) => (
            <button
              key={event._id}
              style={styles.card}
              onClick={() => navigate(`/organizer/scan?event=${event._id}`)}
            >
              <div style={styles.cardInfo}>
                <strong style={styles.eventTitle}>{event.title}</strong>
                <span style={styles.small}>
                  📅 {new Date(event.date).toDateString()}
                </span>
                <span style={styles.small}>📍 {event.location}</span>
              </div>

              <span style={styles.scanBtn}>Scan →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= LOADING MODAL ================= */

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 14 }}>Loading your events…</p>
      </div>
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
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },

  title: {
    fontSize: "clamp(20px,4vw,26px)",
    marginBottom: 4,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
  },

  list: {
    display: "grid",
    gap: 16,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    border: "none",
    color: "#fff",
    textAlign: "left",
  },

  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },

  eventTitle: {
    fontSize: 16,
    marginBottom: 2,
  },

  scanBtn: {
    color: "#22F2A6",
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  small: {
    fontSize: 12,
    color: "#CFC9D6",
  },

  empty: {
    background: "rgba(255,255,255,0.06)",
    padding: 32,
    borderRadius: 20,
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 16,
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 700,
    cursor: "pointer",
  },

  errorBox: {
    background: "rgba(255,77,79,0.12)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  retryBtn: {
    marginTop: 12,
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    cursor: "pointer",
  },

  /* ===== MODAL ===== */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
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
    width: 36,
    height: 36,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
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
