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
    let mounted = true;

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
        if (!mounted) return;

        setData({
          stats: {
            totalTickets: Number(json?.stats?.totalTickets || 0),
            totalRevenue: Number(json?.stats?.totalRevenue || 0),
            platformFees: Number(json?.stats?.platformFees || 0),
            scanned: Number(json?.stats?.scanned || 0),
            unscanned: Number(json?.stats?.unscanned || 0),
          },
          events: Array.isArray(json?.events)
            ? json.events.map((e) => ({
                eventId: e.eventId,
                title: e.title || "Untitled Event",
                ticketsSold: Number(e.ticketsSold || 0),
                revenue: Number(e.revenue || 0),
                status: e.status || "UNKNOWN",
              }))
            : [],
        });
      } catch (err) {
        if (!mounted) return;
        setModal({
          open: true,
          type: "error",
          message:
            err.message || "Unable to load ticket sales at the moment.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSales();
    return () => {
      mounted = false;
    };
  }, []);

  const earnings =
    data.stats.totalRevenue - data.stats.platformFees;

  return (
    <div style={styles.page}>
      {/* ================= LOADING ================= */}
      {loading && <LoadingModal />}

      {/* ================= ERROR MODAL ================= */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() =>
            setModal((m) => ({ ...m, open: false }))
          }
        />
      )}

      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() =>
            navigate("/organizer/dashboard")
          }
        >
          ← Dashboard
        </button>

        <div>
          <h1 style={styles.title}>Ticket Sales</h1>
          <p style={styles.muted}>
            Track ticket purchases, revenue & attendance
          </p>
        </div>
      </header>

      {/* ================= SUMMARY STATS ================= */}
      <section style={styles.statsGrid}>
        <Stat label="Tickets Sold" value={data.stats.totalTickets} />
        <Stat
          label="Gross Revenue"
          value={`₦${data.stats.totalRevenue.toLocaleString()}`}
        />
        <Stat
          label="Platform Fees"
          value={`₦${data.stats.platformFees.toLocaleString()}`}
        />
        <Stat
          label="Your Earnings"
          highlight
          value={`₦${earnings.toLocaleString()}`}
        />
        <Stat label="Scanned" value={data.stats.scanned} />
        <Stat
          label="Pending Entry"
          value={data.stats.unscanned}
        />
      </section>

      {/* ================= EVENT BREAKDOWN ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Sales by Event</h2>

        {data.events.length === 0 ? (
          <p style={styles.muted}>No ticket sales yet.</p>
        ) : (
          <div style={styles.list}>
            {data.events.map((event) => (
              <div
                key={event.eventId}
                style={styles.eventCard}
              >
                <div style={styles.eventInfo}>
                  <strong style={styles.eventTitle}>
                    {event.title}
                  </strong>
                  <span style={styles.small}>
                    {event.ticketsSold} tickets sold
                  </span>
                </div>

                <div style={styles.eventRight}>
                  <span style={styles.revenue}>
                    ₦{event.revenue.toLocaleString()}
                  </span>
                  <span
                    style={styles.status(event.status)}
                  >
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

function Stat({ label, value, highlight }) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(highlight && styles.highlight),
      }}
    >
      <span style={styles.small}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 14 }}>
          Loading ticket sales…
        </p>
      </div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3
          style={{
            color:
              type === "error"
                ? "#ff4d4f"
                : "#22F2A6",
          }}
        >
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
    padding: "clamp(16px,4vw,32px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
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
    fontSize: "clamp(22px,5vw,28px)",
    marginBottom: 4,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(160px,1fr))",
    gap: 14,
    marginBottom: 36,
  },

  statCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 18,
  },

  highlight: {
    background:
      "linear-gradient(135deg,rgba(34,242,166,0.25),rgba(255,255,255,0.06))",
  },

  statValue: {
    display: "block",
    fontSize: 22,
    marginTop: 6,
    fontWeight: 700,
  },

  section: {
    marginTop: 32,
  },

  sectionTitle: {
    marginBottom: 14,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
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

  eventInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 180,
  },

  eventTitle: {
    fontSize: 16,
  },

  eventRight: {
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
    fontWeight: 700,
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

  small: {
    fontSize: 12,
    color: "#CFC9D6",
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
    fontWeight: 700,
    cursor: "pointer",
  },
};
