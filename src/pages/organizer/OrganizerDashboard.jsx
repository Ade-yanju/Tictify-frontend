import { useEffect, useState, useRef, useCallback } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

/* ── Helpers ────────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const fmtMoney = (n) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${(n || 0).toLocaleString()}`;
};

/* ── Icons ── */
const EyeIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

const EMPTY = {
  organizer: { name: "", email: "", avatar: null },
  stats: {
    walletBalance: 0,
    totalEarnings: 0,
    events: 0,
    ticketsSold: 0,
    revenue: 0,
    upcoming: 0,
    live: 0,
  },
  events: [],
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const prevBalanceRef = useRef(null);

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "" });

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetchOrganizerDashboard();
      setData((prev) => {
        prevBalanceRef.current = prev.stats.walletBalance;
        return res;
      });
    } catch (err) {
      if (err.type === "AUTH") {
        clearInterval(pollingRef.current);
        setModal({ open: true, message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    pollingRef.current = setInterval(loadDashboard, 15_000);
    return () => clearInterval(pollingRef.current);
  }, [loadDashboard]);

  const { organizer, stats, events } = data;

  return (
    <main style={s.page}>
      {loading && <LoadingModal />}
      {modal.open && (
        <Modal message={modal.message} onConfirm={() => navigate("/login")} />
      )}

      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.avatar}>
            {organizer.avatar ? (
              <img src={organizer.avatar} style={s.avatarImg} alt="" />
            ) : (
              <span>{initials(organizer.name)}</span>
            )}
          </div>
          <div>
            <p style={s.greeting}>
              {getGreeting()}, <strong>{organizer.name}</strong> 👋
            </p>
            <p style={s.email}>{organizer.email}</p>
          </div>
        </div>
        <div style={s.headerRight}>
          <WalletCard
            balance={stats.walletBalance}
            prevBalance={prevBalanceRef.current}
          />
          <button
            style={s.primaryBtn}
            onClick={() => navigate("/organizer/create-event")}
          >
            + Create Event
          </button>
          <button
            style={s.logoutBtn}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <section style={s.grid}>
        <ActionCard
          title="My Events"
          desc="Manage yours"
          onClick={() => navigate("/organizer/events")}
        />
        <ActionCard
          title="Scan Tickets"
          desc="Admit guests"
          onClick={() => navigate("/organizer/scan/select")}
        />
        <ActionCard
          title="Withdraw"
          desc="Get paid"
          onClick={() => navigate("/organizer/withdraw")}
        />
      </section>

      <section style={s.statsGrid}>
        <StatCard
          label="Wallet"
          value={fmtMoney(stats.walletBalance)}
          accent="#22F2A6"
        />
        <StatCard label="Earnings" value={fmtMoney(stats.totalEarnings)} />
        <StatCard label="Sold" value={stats.ticketsSold} />
        <StatCard label="Live" value={stats.live} accent="#22F2A6" />
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Recent Events</h2>
        {events.length === 0 ? (
          <div style={s.emptyState}>No events yet.</div>
        ) : (
          events.map((ev) => (
            <EventRow
              key={ev._id}
              event={ev}
              onView={() => navigate(`/organizer/stats?eventId=${ev._id}`)}
            />
          ))
        )}
      </section>
    </main>
  );
}

/* ── Sub-components ── */
function WalletCard({ balance, prevBalance }) {
  const [visible, setVisible] = useState(true);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (prevBalance !== null && balance !== prevBalance) {
      setFlash(balance > prevBalance ? "up" : "down");
      setTimeout(() => setFlash(null), 800);
    }
  }, [balance, prevBalance]);

  const color =
    flash === "up" ? "#22F2A6" : flash === "down" ? "#ff4d4f" : "#fff";

  return (
    <div style={s.walletCard}>
      <div style={s.walletTopRow}>
        <span style={s.walletLabel}>Wallet</span>
        <div style={s.livePill}>
          <span style={s.liveDot} />
          LIVE
        </div>
      </div>
      <div style={s.walletBottomRow}>
        <strong style={{ ...s.walletValue, color, transition: "0.4s" }}>
          {visible ? `₦${balance.toLocaleString()}` : "••••••"}
        </strong>
        <button style={s.toggleBtn} onClick={() => setVisible(!visible)}>
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={s.stat}>
      <p style={s.statLabel}>{label}</p>
      <h3 style={{ ...s.statValue, color: accent || "#fff" }}>{value}</h3>
    </div>
  );
}

function ActionCard({ title, desc, onClick }) {
  return (
    <button style={s.action} onClick={onClick}>
      <h3 style={s.actionTitle}>{title}</h3>
      <p style={s.muted}>{desc}</p>
    </button>
  );
}

function EventRow({ event, onView }) {
  const pct =
    event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
  return (
    <article style={s.event}>
      <div style={{ flex: 1 }}>
        <strong style={s.eventTitle}>{event.title}</strong>
        <p style={s.muted}>
          {new Date(event.date).toDateString()} · {event.sold}/{event.capacity}{" "}
          sold
        </p>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${pct}%` }} />
        </div>
      </div>
      <div style={s.eventActions}>
        <button style={s.linkBtn} onClick={onView}>
          View →
        </button>
      </div>
    </article>
  );
}

function LoadingModal() {
  return (
    <div style={s.overlay}>
      <div style={s.spinner} />
    </div>
  );
}
function Modal({ message, onConfirm }) {
  return (
    <div style={s.overlay}>
      <div style={s.modalBox}>
        <p>{message}</p>
        <button style={s.primaryBtn} onClick={onConfirm}>
          Login
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100svh",
    padding: 24,
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
    flexWrap: "wrap",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#22F2A6,#7CFF9B)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  greeting: { fontSize: 16, margin: 0 },
  email: { fontSize: 12, color: "#9b93a8", margin: 0 },
  walletCard: {
    background: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 12,
    minWidth: 160,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  walletTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  walletBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: { fontSize: 10, color: "#9b93a8", textTransform: "uppercase" },
  walletValue: { fontSize: 18 },
  livePill: {
    color: "#22F2A6",
    fontSize: 9,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 700,
  },
  liveDot: { width: 5, height: 5, background: "#22F2A6", borderRadius: "50%" },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#9b93a8",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  action: {
    background: "rgba(255,255,255,0.05)",
    border: "none",
    padding: 16,
    borderRadius: 12,
    textAlign: "left",
    color: "#fff",
    cursor: "pointer",
  },
  actionTitle: { margin: "0 0 4px 0", fontSize: 14 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 32,
  },
  stat: { background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12 },
  statLabel: { color: "#9b93a8", fontSize: 12, margin: "0 0 8px 0" },
  statValue: { fontSize: 20, margin: 0 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  event: {
    display: "flex",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  eventTitle: { fontSize: 14, display: "block", marginBottom: 4 },
  progressTrack: {
    height: 4,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 8,
    width: "100%",
    maxWidth: 200,
  },
  progressFill: { height: "100%", background: "#22F2A6", borderRadius: 2 },
  primaryBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "10px 16px",
    borderRadius: 20,
    fontWeight: 700,
    cursor: "pointer",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #9b93a8",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    cursor: "pointer",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
  },
  muted: { color: "#9b93a8", fontSize: 12, margin: 0 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalBox: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 16,
    textAlign: "center",
  },
  spinner: {
    width: 30,
    height: 30,
    border: "3px solid #22F2A6",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
