import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function TicketSales() {
  const [data, setData] = useState(null);
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
        setData(json);
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

  if (loading) {
    return <div style={styles.loading}>Loading ticket sales…</div>;
  }

  if (!data) return null;

  const {
    totalTickets,
    totalRevenue,
    scanned,
    unscanned,
    platformFees = 0,
  } = data.stats;

  const netRevenue = totalRevenue - platformFees;

  return (
    <div style={styles.page}>
      {/* MODAL */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <h1>Ticket Sales</h1>
        <p style={styles.muted}>Track ticket purchases, fees, and earnings</p>
      </header>

      {/* STATS */}
      <section style={styles.statsGrid}>
        <Stat title="Tickets Sold" value={totalTickets} />
        <Stat
          title="Gross Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
        />
        <Stat
          title="Platform Fees"
          value={`₦${platformFees.toLocaleString()}`}
        />
        <Stat title="Your Earnings" value={`₦${netRevenue.toLocaleString()}`} />
        <Stat title="Scanned" value={scanned} />
        <Stat title="Pending Entry" value={unscanned} />
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
                <div>
                  <h3>{event.title}</h3>
                  <p style={styles.muted}>{event.ticketsSold} tickets sold</p>
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
      <h2>{value}</h2>
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
        <p style={{ marginTop: 8 }}>{message}</p>
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
    padding: "24px 16px",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    marginBottom: 32,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    marginBottom: 40,
  },

  statCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 18,
  },

  section: {
    marginTop: 32,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },

  eventCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    background: "rgba(255,255,255,0.06)",
    padding: 18,
    borderRadius: 16,
    flexWrap: "wrap",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  revenue: {
    fontWeight: 700,
    color: "#22F2A6",
  },

  status: (status) => ({
    fontSize: 13,
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
    maxWidth: 360,
    width: "100%",
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
