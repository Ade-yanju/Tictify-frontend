import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

/* ================= SAFE DEFAULT ================= */
const EMPTY_SALES = {
  stats: {
    totalTickets: 0,
    totalRevenue: 0,
    platformFees: 0,
    scanned: 0,
    unscanned: 0,
  },
  events: [],
};

export default function TicketSales() {
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_SALES);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    type: "error",
    message: "",
  });

  useEffect(() => {
    async function loadSales() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/sales`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load ticket sales");

        const json = await res.json();

        // ✅ HARDEN RESPONSE
        setData({
          stats: json?.stats ?? EMPTY_SALES.stats,
          events: Array.isArray(json?.events) ? json.events : [],
        });
      } catch (err) {
        setModal({
          open: true,
          type: "error",
          message: err.message || "Unable to load ticket sales at the moment.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  return (
    <div style={styles.page}>
      {/* LOADING MODAL */}
      {loading && <LoadingModal />}

      {/* ERROR MODAL */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Back
        </button>

        <div>
          <h1 style={styles.title}>Ticket Sales</h1>
          <p style={styles.muted}>
            Track ticket purchases, fees, and earnings
          </p>
        </div>
      </header>

      {/* STATS */}
      <section style={styles.statsGrid}>
        <Stat title="Tickets Sold" value={data.stats.totalTickets} />
        <Stat
          title="Gross Revenue"
          value={`₦${data.stats.totalRevenue.toLocaleString()}`}
        />
        <Stat
          title="Platform Fees"
          value={`₦${data.stats.platformFees.toLocaleString()}`}
        />
        <Stat
          title="Your Earnings"
          value={`₦${(
            data.stats.totalRevenue - data.stats.platformFees
          ).toLocaleString()}`}
        />
        <Stat title="Scanned" value={data.stats.scanned} />
        <Stat title="Pending Entry" value={data.stats.unscanned} />
      </section>

      {/* EVENT BREAKDOWN */}
      <section style={styles.section}>
        <h2>Sales by Event</h2>

        {data.events.length === 0 ? (
          <p style={styles.muted}>No ticket sales yet.</p>
        ) : (
          <div style={styles.list}>
            {data.events.map((event) => (
              <div key={event.eventId} style={styles.eventCard}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={styles.eventTitle}>{event.title}</h3>
                  <p style={styles.muted}>
                    {event.ticketsSold} tickets sold
                  </p>
                </div>

                <div style={styles.right}>
                  <span style={styles.revenue}>
                    ₦{event.revenue.toLocaleString()}
                  </span>
                  <span style={styles.status(event.status)}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ title, value }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.muted}>{title}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 16 }}>Loading ticket sales…</p>
      </div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ color: type === "error" ? "#ff4d4f" : "#22F2A6" }}>
          {type === "error" ? "Error" : "Success"}
        </h3>
        <p style={{ marginTop: 10 }}>{message}</p>
        <button style={styles.modalBtn} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}


/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 16px",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
  },

  title: {
    fontSize: 26,
    margin: 0,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
    marginBottom: 36,
  },

  statCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 18,
  },

  statValue: {
    fontSize: 22,
    marginTop: 4,
  },

  section: {
    marginTop: 32,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 16,
  },

  eventCard: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.06)",
    padding: 16,
    borderRadius: 16,
  },

  eventTitle: {
    fontSize: 16,
    marginBottom: 4,
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  revenue: {
    fontWeight: 700,
    color: "#22F2A6",
    fontSize: 15,
  },

  status: (status) => ({
    fontSize: 12,
    fontWeight: 600,
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
        ? "#ff4d4f"
        : "#fadb14",
  }),

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
    width: 36,
    height: 36,
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
    padding: "10px 22px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
};
