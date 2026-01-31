import { useEffect, useState } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { useNavigate } from "react-router-dom";

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  /* ================= LOAD DASHBOARD ================= */
  async function loadDashboard() {
    try {
      const res = await fetchOrganizerDashboard();
      setData(res);
    } catch (err) {
      setModal({
        open: true,
        message: err.message || "Session expired. Please login again.",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= SAFE POLLING ================= */
  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading dashboard…</div>;
  }

  if (!data) return null;

  return (
    <div style={styles.page}>
      {/* ================= MODAL ================= */}
      {modal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Error</h3>
            <p>{modal.message}</p>
            <button style={styles.modalBtn} onClick={() => navigate("/login")}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1>Organizer Dashboard</h1>
          <p style={styles.muted}>
            Welcome back, manage your events in real time
          </p>
        </div>

        <div style={styles.headerActions}>
          <Stat
            label="Wallet Balance"
            value={`₦${data.stats.walletBalance.toLocaleString()}`}
          />

          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/organizer/create-event")}
          >
            + Create Event
          </button>
        </div>
      </header>

      {/* ================= QUICK ACTIONS ================= */}
      <section style={styles.grid}>
        <Action
          title="My Events"
          desc="View & manage events"
          onClick={() => navigate("/organizer/events")}
        />
        <Action
          title="Ticket Sales"
          desc="Track sales & revenue"
          onClick={() => navigate("/organizer/sales")}
        />
        <Action
          title="Scan Tickets"
          desc="Admit guests at venue"
          onClick={() => navigate("/organizer/scan")}
        />
        <Action
          title="Withdraw Revenue"
          desc="Transfer earnings"
          onClick={() => navigate("/organizer/withdraw")}
        />
      </section>

      {/* ================= STATS ================= */}
      <section style={styles.stats}>
        <Stat label="Total Events" value={data.stats.events} />
        <Stat label="Tickets Sold" value={data.stats.ticketsSold} />
        <Stat label="Revenue" value={`₦${data.stats.revenue}`} />
        <Stat label="Upcoming Events" value={data.stats.upcoming} />
      </section>

      {/* ================= EVENTS ================= */}
      <section style={styles.section}>
        <h2>My Events</h2>

        {data.events.length === 0 ? (
          <p style={styles.muted}>No events created yet.</p>
        ) : (
          data.events.map((event) => (
            <div key={event._id} style={styles.event}>
              <div>
                <strong>{event.title}</strong>
                <p style={styles.muted}>
                  {event.sold}/{event.capacity} tickets sold
                </p>
              </div>

              <div style={styles.eventActions}>
                <span style={styles.status(event.status)}>{event.status}</span>

                <button
                  style={styles.linkBtn}
                  onClick={() =>
                    navigate(`/organizer/stats?eventId=${event._id}`)
                  }
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* ================= LOCAL COMPONENTS ================= */

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <p style={styles.muted}>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Action({ title, desc, onClick }) {
  return (
    <div style={styles.action} onClick={onClick}>
      <h3>{title}</h3>
      <p style={styles.muted}>{desc}</p>
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
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },

  headerActions: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
    marginBottom: 32,
  },

  action: {
    background: "rgba(255,255,255,0.07)",
    padding: 20,
    borderRadius: 18,
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 20,
    marginBottom: 40,
  },

  stat: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 18,
  },

  section: {
    marginTop: 32,
  },

  event: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },

  eventActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  status: (status) => ({
    fontWeight: 700,
    fontSize: 12,
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
          ? "#ff4d4f"
          : "#fadb14",
  }),

  primaryBtn: {
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    border: "none",
    padding: "12px 20px",
    borderRadius: 999,
    fontWeight: 700,
    cursor: "pointer",
  },

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
    fontWeight: 600,
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 18,
    width: 320,
    textAlign: "center",
  },

  modalBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
};
