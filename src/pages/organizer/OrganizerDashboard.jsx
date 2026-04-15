import { useEffect, useState, useRef, useCallback } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { getToken, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const EMPTY_DASHBOARD = {
  stats: { walletBalance: 0, events: 0, ticketsSold: 0, revenue: 0, upcoming: 0 },
  events: [],
};

/* ── Eye icons ─────────────────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

/* ── Live wallet display ────────────────────────────────────────── */
function WalletCard({ balance, prevBalance }) {
  const [visible, setVisible] = useState(true);
  const [flash, setFlash] = useState(null); // "up" | "down" | null
  const [lastUpdated, setLastUpdated] = useState("Updated just now");

  useEffect(() => {
    if (prevBalance === null || balance === prevBalance) return;
    setFlash(balance > prevBalance ? "up" : "down");
    setLastUpdated("Updated just now");
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [balance, prevBalance]);

  const flashColor =
    flash === "up" ? "#22F2A6" : flash === "down" ? "#ff4d4f" : "#fff";

  return (
    <div style={styles.walletCard}>
      <div style={styles.walletTopRow}>
        <span style={styles.walletLabel}>Wallet balance</span>
        <div style={styles.livePill}>
          <span style={styles.liveDot} />
          <span style={styles.liveText}>LIVE</span>
        </div>
      </div>

      <div style={styles.walletBottomRow}>
        <strong
          style={{
            ...styles.walletValue,
            color: flashColor,
            transition: "color 0.4s",
            letterSpacing: visible ? "-0.3px" : "4px",
          }}
        >
          {visible ? `₦${balance.toLocaleString()}` : "••••••"}
        </strong>

        <button
          style={styles.toggleBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide balance" : "Show balance"}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>

      <span style={styles.lastUpdated}>{lastUpdated}</span>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────── */
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const prevBalanceRef = useRef(null);

  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "" });

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetchOrganizerDashboard();
      setData((prev) => {
        prevBalanceRef.current = prev.stats.walletBalance;
        return {
          stats: res?.stats ?? EMPTY_DASHBOARD.stats,
          events: Array.isArray(res?.events) ? res.events : [],
        };
      });
    } catch (err) {
      clearInterval(pollingRef.current);
      setModal({
        open: true,
        message: err?.message || "Your session has expired. Please login again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    pollingRef.current = setInterval(loadDashboard, 15000);
    return () => clearInterval(pollingRef.current);
  }, [loadDashboard]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main style={styles.page}>
      {loading && <LoadingModal />}
      {modal.open && (
        <Modal message={modal.message} onConfirm={() => navigate("/login")} />
      )}

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Organizer Dashboard</h1>
          <p style={styles.muted}>Manage events, sales, and revenue in real time</p>
        </div>

        <div style={styles.headerActions}>
          <WalletCard
            balance={data.stats.walletBalance}
            prevBalance={prevBalanceRef.current}
          />
          <button style={styles.primaryBtn} onClick={() => navigate("/organizer/create-event")}>
            + Create Event
          </button>
          {getToken() && (
            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      {/* ── QUICK ACTIONS ── */}
      <section style={styles.grid}>
        {[
          { title: "My Events", desc: "Create & manage events", path: "/organizer/events" },
          { title: "Ticket Sales", desc: "Track ticket revenue", path: "/organizer/sales" },
          { title: "Scan Tickets", desc: "Admit guests at venue", path: "/organizer/scan/select" },
          { title: "Event Stats", desc: "Detailed analytics", path: "/organizer/stats" },
          { title: "Withdraw", desc: "Transfer earnings", path: "/organizer/withdraw" },
        ].map(({ title, desc, path }) => (
          <Action key={title} title={title} desc={desc} onClick={() => navigate(path)} />
        ))}
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsGrid}>
        <Stat label="Total Events" value={data.stats.events} />
        <Stat label="Tickets Sold" value={data.stats.ticketsSold.toLocaleString()} />
        <Stat label="Revenue" value={`₦${(data.stats.revenue / 1e6).toFixed(1)}M`} />
        <Stat label="Upcoming Events" value={data.stats.upcoming} />
      </section>

      {/* ── EVENTS ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Events</h2>
        </div>

        {data.events.length === 0 ? (
          <p style={styles.muted}>No events created yet.</p>
        ) : (
          data.events.map((event) => (
            <EventRow
              key={event._id}
              event={event}
              onView={() => navigate(`/organizer/stats?eventId=${event._id}`)}
            />
          ))
        )}
      </section>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <h3 style={styles.statValue}>{value}</h3>
    </div>
  );
}

function Action({ title, desc, onClick }) {
  return (
    <button style={styles.action} onClick={onClick}>
      <h3 style={styles.actionTitle}>{title}</h3>
      <p style={styles.muted}>{desc}</p>
    </button>
  );
}

function EventRow({ event, onView }) {
  const pct = Math.round((event.sold / event.capacity) * 100);
  return (
    <article style={styles.event}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={styles.eventTitle}>{event.title}</strong>
        <p style={styles.muted}>
          {event.sold.toLocaleString()}/{event.capacity.toLocaleString()} tickets sold
        </p>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${pct}%` }} />
        </div>
      </div>
      <div style={styles.eventActions}>
        <span style={styles.status(event.status)}>{event.status}</span>
        <button style={styles.linkBtn} onClick={onView}>View</button>
      </div>
    </article>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12, color: "#9b93a8", fontSize: 14 }}>Loading dashboard…</p>
      </div>
    </div>
  );
}

function Modal({ message, onConfirm }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: 8 }}>Session Expired</h3>
        <p style={styles.muted}>{message}</p>
        <button style={styles.modalBtn} onClick={onConfirm}>Login again</button>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

const styles = {
  page: {
    minHeight: "100svh",
    padding: "clamp(16px,4vw,40px)",
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
  title: { fontSize: "clamp(22px,4vw,28px)", fontWeight: 600, letterSpacing: "-0.3px" },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  /* wallet card */
  walletCard: {
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    padding: "12px 16px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 160,
  },
  walletTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  walletBottomRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { fontSize: 11, color: "#9b93a8", textTransform: "uppercase", letterSpacing: "0.06em" },
  walletValue: { fontSize: 20, fontWeight: 600 },
  livePill: { display: "flex", alignItems: "center", gap: 4 },
  liveDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#22F2A6",
    animation: "pulse 2s infinite",
  },
  liveText: { fontSize: 10, color: "#22F2A6", fontWeight: 600, letterSpacing: "0.05em" },
  lastUpdated: { fontSize: 11, color: "#9b93a8", marginTop: 2 },
  toggleBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#9b93a8", display: "flex", alignItems: "center", padding: 2,
  },

  /* grid & actions */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
    marginBottom: 28,
  },
  action: {
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    padding: "18px 16px",
    borderRadius: 18,
    textAlign: "left",
    cursor: "pointer",
    color: "#fff",
  },
  actionTitle: { fontSize: 14, fontWeight: 500, marginBottom: 4 },

  /* stats */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
    marginBottom: 36,
  },
  stat: {
    background: "rgba(255,255,255,0.06)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    padding: "18px 16px",
    borderRadius: 16,
  },
  statLabel: { fontSize: 12, color: "#9b93a8", marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px" },

  /* events */
  section: { marginTop: 8 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: 500, color: "#e0d9e8" },
  event: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    padding: "16px",
    borderRadius: 16,
    marginBottom: 10,
  },
  eventTitle: { fontSize: 14, fontWeight: 500 },
  eventActions: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },

  /* progress bar */
  progressTrack: {
    height: 3,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    marginTop: 8,
    width: 180,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
  },

  status: (status) => ({
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background:
      status === "LIVE" ? "rgba(34,242,166,0.12)"
      : status === "ENDED" ? "rgba(255,77,79,0.12)"
      : "rgba(250,219,20,0.12)",
    color:
      status === "LIVE" ? "#22F2A6"
      : status === "ENDED" ? "#ff4d4f"
      : "#fadb14",
  }),

  primaryBtn: {
    background: "linear-gradient(135deg,#22F2A6,#7CFF9B)",
    border: "none", padding: "11px 18px",
    borderRadius: 999, fontWeight: 600, fontSize: 13,
    cursor: "pointer", color: "#0F0618", whiteSpace: "nowrap",
  },
  logoutBtn: {
    background: "transparent",
    border: "0.5px solid rgba(255,255,255,0.2)",
    color: "#fff", padding: "10px 16px",
    borderRadius: 999, cursor: "pointer", fontSize: 13,
  },
  linkBtn: {
    background: "transparent", border: "none",
    color: "#22F2A6", fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
  muted: { color: "#9b93a8", fontSize: 13 },

  /* modals */
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid", placeItems: "center", zIndex: 2000,
  },
  loadingModal: {
    background: "#1A0F2E", padding: 28, borderRadius: 18,
    textAlign: "center", width: "90%", maxWidth: 320,
  },
  spinner: {
    width: 34, height: 34,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTop: "3px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  modal: {
    background: "#1A0F2E", padding: 26, borderRadius: 20,
    width: "90%", maxWidth: 360, textAlign: "center",
  },
  modalBtn: {
    marginTop: 18, padding: "10px 22px",
    borderRadius: 999, border: "none",
    background: "#22F2A6", fontWeight: 600,
    cursor: "pointer", color: "#0F0618",
  },
};
