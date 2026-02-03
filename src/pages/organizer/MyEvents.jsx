import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function MyEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ================= FETCH ================= */
  async function fetchEvents() {
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
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= ACTIONS ================= */
  async function updateStatus(id, action) {
    if (processingId) return;
    setProcessingId(id);

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${action}/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      await fetchEvents();
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteEvent(id) {
  if (processingId) return;
  setProcessingId(id);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/events/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete failed");
    }

    await fetchEvents();
  } catch (err) {
    alert(err.message);
  } finally {
    setProcessingId(null);
    setConfirmDelete(null);
  }
}


  function copyEventLink(id) {
    const link = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main style={styles.page}>
      {loading && <LoadingModal />}

      {confirmDelete && (
        <ConfirmModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deleteEvent(confirmDelete)}
        />
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>My Events</h1>
          <p style={styles.muted}>Manage, publish, and monitor your events</p>
        </div>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/organizer/create-event")}
        >
          + Create Event
        </button>
      </header>

      {/* EMPTY */}
      {!loading && events.length === 0 && (
        <section style={styles.empty}>
          <h3>No events yet</h3>
          <p style={styles.muted}>
            Create your first event and start selling tickets.
          </p>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/organizer/create-event")}
          >
            Create Event
          </button>
        </section>
      )}

      {/* GRID */}
      <section style={styles.grid}>
        {events.map((event) => (
          <article key={event._id} style={styles.card}>
            <div>
              <h3 style={styles.cardTitle}>{event.title}</h3>
              <p style={styles.muted}>
                {new Date(event.date).toDateString()} • {event.location}
              </p>

              <span style={styles.status(event.status)}>
                {event.status}
              </span>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.shareBtn}
                onClick={() => copyEventLink(event._id)}
              >
                {copiedId === event._id ? "Copied ✓" : "Share"}
              </button>

              {event.status === "DRAFT" && (
                <button
                  style={styles.publishBtn}
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
                    End
                  </button>

                  <button
                    style={styles.linkBtn}
                    onClick={() =>
                      navigate(`/organizer/scan?event=${event._id}`)
                    }
                  >
                    Scan
                  </button>
                </>
              )}

              {event.status === "ENDED" && (
                <button
                  style={styles.deleteBtn}
                  disabled={processingId === event._id}
                  onClick={() => setConfirmDelete(event._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

/* ================= MODALS ================= */

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

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>Delete Event?</h3>
        <p style={styles.muted}>
          This action cannot be undone.
        </p>
        <div style={styles.confirmActions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.deleteBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100svh",
    padding: "clamp(16px,4vw,40px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 32,
  },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 22,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 18,
  },

  cardTitle: {
    fontSize: 18,
    marginBottom: 6,
  },

  status: (status) => ({
    display: "inline-block",
    marginTop: 10,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background:
      status === "LIVE"
        ? "rgba(34,242,166,0.15)"
        : status === "ENDED"
        ? "rgba(255,77,79,0.15)"
        : "rgba(250,219,20,0.15)",
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
        ? "#ff4d4f"
        : "#fadb14",
  }),

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  publishBtn: {
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

  deleteBtn: {
    background: "#b91c1c",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },

  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  linkBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  shareBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
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
    padding: "clamp(24px,5vw,48px)",
    borderRadius: 24,
    textAlign: "center",
    marginTop: 40,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 2000,
  },

  modal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 20,
    width: "90%",
    maxWidth: 360,
    textAlign: "center",
  },

  confirmActions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
    flexWrap: "wrap",
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
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
