import { useEffect, useState } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { getToken, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

/* ================= SAFE DEFAULT ================= */
const EMPTY_DASHBOARD = {
  stats: {
    walletBalance: 0,
    events: 0,
    ticketsSold: 0,
    revenue: 0,
    upcoming: 0,
  },
  events: [],
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  /* ================= LOAD DASHBOARD ================= */
  async function loadDashboard() {
    try {
      const res = await fetchOrganizerDashboard();

      // ✅ HARDEN AGAINST BAD API RESPONSES
      setData({
        stats: res?.stats ?? EMPTY_DASHBOARD.stats,
        events: Array.isArray(res?.events) ? res.events : [],
      });
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

  /* ================= LOGOUT ================= */
  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      {/* ================= LOADING MODAL ================= */}
      {loading && <LoadingModal />}

      {/* ================= ERROR MODAL ================= */}
      {modal.open && (
        <Modal
          message={modal.message}
          onConfirm={() => navigate("/login")}
        />
      )}

      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Organizer Dashboard</h1>
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

          {getToken() && (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
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
              <div style={{ minWidth: 180 }}>
                <strong>{event.title}</strong>
                <p style={styles.muted}>
                  {event.sold}/{event.capacity} tickets sold
                </p>
              </div>

              <div style={styles.eventActions}>
                <span style={styles.status(event.status)}>
                  {event.status}
                </span>

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

/* ================= COMPONENTS ================= */

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

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 14 }}>Loading dashboard…</p>
      </div>
    </div>
  );
}

function Modal({ message, onConfirm }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>Error</h3>
        <p>{message}</p>
        <button style={styles.modalBtn} onClick={onConfirm}>
          Login
        </button>
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
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 32,
  },

  title: {
    fontSize: "clamp(22px,5vw,30px)",
  },

  headerActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 16,
    marginBottom: 32,
  },

  action: {
    background: "rgba(255,255,255,0.07)",
    padding: 20,
    borderRadius: 18,
    cursor: "pointer",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    marginBottom: 40,
  },

  stat: {
    background: "rgba(255,255,255,0.08)",
    padding: 22,
    borderRadius: 18,
  },

  section: {
    marginTop: 32,
  },

  event: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    background: "rgba(255,255,255,0.05)",
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
  },

  eventActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
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

  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
  },

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
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
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 18,
    width: "90%",
    maxWidth: 360,
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
