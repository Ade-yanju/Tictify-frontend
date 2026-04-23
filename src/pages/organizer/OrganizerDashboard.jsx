import { useEffect, useState, useRef, useCallback } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { getToken, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

/* ── Helpers ─────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function fmtMoney(n) {
  if (typeof n !== "number" || isNaN(n)) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString()}`;
}

/* ── Eye Icons ───────────────────────────────────────────────── */
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

/* ── Safe defaults ───────────────────────────────────────────── */
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

/* ── Normalize API response defensively ─────────────────────── */
// Guarantees every number field is actually a number, never undefined/null
function normalizeStats(raw) {
  const s = raw ?? {};
  return {
    walletBalance: Number(s.walletBalance) || 0,
    totalEarnings: Number(s.totalEarnings) || 0,
    events: Number(s.events) || 0,
    ticketsSold: Number(s.ticketsSold) || 0,
    revenue: Number(s.revenue) || 0,
    upcoming: Number(s.upcoming) || 0,
    live: Number(s.live) || 0,
  };
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const prevBalanceRef = useRef(null);

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    isAuth: false,
  });

  const loadDashboard = useCallback(async () => {
    try {
      // ✅ Service handles token internally — no need to pass it
      const res = await fetchOrganizerDashboard();

      // ✅ Log response in dev so you can verify what backend returns
      if (import.meta.env.DEV) {
        console.log("📊 Dashboard response:", res);
      }

      setData((prev) => {
        prevBalanceRef.current = prev.stats.walletBalance;
        return {
          organizer: {
            name: res?.organizer?.name ?? "",
            email: res?.organizer?.email ?? "",
            avatar: res?.organizer?.avatar ?? null,
          },
          // ✅ normalizeStats ensures walletBalance is ALWAYS a number
          stats: normalizeStats(res?.stats),
          events: Array.isArray(res?.events) ? res.events : [],
        };
      });
    } catch (err) {
      // ✅ Only stop polling + show modal for AUTH errors
      // For network blips, silently retry on next poll interval
      if (err?.type === "AUTH") {
        clearInterval(pollingRef.current);
        setModal({
          open: true,
          isAuth: true,
          message:
            err.message || "Your session has expired. Please login again.",
        });
      } else {
        // Non-auth error (network/server) — log it but keep polling
        console.error("Dashboard fetch error:", err);
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

  function handleLogout() {
    clearInterval(pollingRef.current);
    logout();
    navigate("/login", { replace: true });
  }

  const { organizer, stats, events } = data;

  return (
    <main style={s.page}>
      {loading && <LoadingModal />}
      {modal.open && (
        <Modal
          message={modal.message}
          onConfirm={
            modal.isAuth
              ? handleLogout
              : () => setModal({ open: false, message: "", isAuth: false })
          }
          isAuth={modal.isAuth}
        />
      )}

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.avatar}>
            {organizer.avatar ? (
              <img
                src={organizer.avatar}
                alt={organizer.name}
                style={s.avatarImg}
              />
            ) : (
              <span style={s.avatarInitials}>{initials(organizer.name)}</span>
            )}
          </div>
          <div>
            <p style={s.greeting}>
              {getGreeting()},{" "}
              <strong style={s.greetingName}>{organizer.name || "…"}</strong> 👋
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
          {getToken() && (
            <button style={s.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* ── QUICK ACTIONS ── */}
      <section style={s.grid}>
        {[
          {
            title: "My Events",
            desc: "Create & manage events",
            path: "/organizer/events",
          },
          {
            title: "Ticket Sales",
            desc: "Track ticket revenue",
            path: "/organizer/sales",
          },
          {
            title: "Scan Tickets",
            desc: "Admit guests at venue",
            path: "/organizer/scan/select",
          },
          {
            title: "Event Stats",
            desc: "Detailed analytics",
            path: "/organizer/stats",
          },
          {
            title: "Withdraw",
            desc: "Transfer earnings",
            path: "/organizer/withdraw",
          },
        ].map(({ title, desc, path }) => (
          <ActionCard
            key={title}
            title={title}
            desc={desc}
            onClick={() => navigate(path)}
          />
        ))}
      </section>

      {/* ── STATS ── */}
      <section style={s.statsGrid}>
        <StatCard
          label="Wallet Balance"
          value={fmtMoney(stats.walletBalance)}
          accent="#22F2A6"
        />
        <StatCard
          label="Total Earnings"
          value={fmtMoney(stats.totalEarnings)}
        />
        <StatCard label="Revenue" value={fmtMoney(stats.revenue)} />
        <StatCard
          label="Tickets Sold"
          value={stats.ticketsSold.toLocaleString()}
        />
        <StatCard label="Total Events" value={stats.events} />
        <StatCard label="Upcoming Events" value={stats.upcoming} />
        <StatCard label="Live Now" value={stats.live} accent="#22F2A6" />
      </section>

      {/* ── EVENTS ── */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Recent Events</h2>
        </div>

        {events.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>🎪</p>
            <p style={{ color: "#9b93a8", marginTop: 8 }}>
              No events created yet.
            </p>
            <button
              style={{ ...s.primaryBtn, marginTop: 16 }}
              onClick={() => navigate("/organizer/create-event")}
            >
              Create your first event
            </button>
          </div>
        ) : (
          events.map((event) => (
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

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
function WalletCard({ balance, prevBalance }) {
  const [visible, setVisible] = useState(true);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (
      prevBalance === null ||
      prevBalance === undefined ||
      balance === prevBalance
    )
      return;
    setFlash(balance > prevBalance ? "up" : "down");
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [balance, prevBalance]);

  const flashColor =
    flash === "up" ? "#22F2A6" : flash === "down" ? "#ff4d4f" : "#fff";

  return (
    <div style={s.walletCard}>
      <div style={s.walletTopRow}>
        <span style={s.walletLabel}>Wallet</span>
        <div style={s.livePill}>
          <span style={s.liveDot} />
          <span style={s.liveText}>LIVE</span>
        </div>
      </div>
      <div style={s.walletBottomRow}>
        <strong
          style={{
            ...s.walletValue,
            color: flashColor,
            transition: "color 0.4s",
          }}
        >
          {visible ? fmtMoney(balance) : "••••••"}
        </strong>
        <button
          style={s.toggleBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide balance" : "Show balance"}
        >
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
      <h3 style={{ ...s.statValue, ...(accent ? { color: accent } : {}) }}>
        {value}
      </h3>
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
  const eventDate = new Date(event.date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article style={s.event}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={s.eventTitle}>{event.title}</strong>
        <p style={s.muted}>
          {eventDate} &nbsp;·&nbsp; {event.sold}/{event.capacity} tickets
          &nbsp;·&nbsp; {fmtMoney(event.revenue || 0)}
        </p>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${pct}%` }} />
        </div>
        <span style={s.pctLabel}>{pct}% sold</span>
      </div>
      <div style={s.eventActions}>
        <span style={s.status(event.status)}>{event.status}</span>
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
      <div style={s.loadingBox}>
        <div style={s.spinner} />
        <p style={{ marginTop: 14, color: "#9b93a8", fontSize: 14 }}>
          Loading your dashboard…
        </p>
      </div>
    </div>
  );
}

function Modal({ message, onConfirm, isAuth }) {
  return (
    <div style={s.overlay}>
      <div style={s.modalBox}>
        <h3 style={{ marginBottom: 8 }}>
          {isAuth ? "Session Expired" : "Something went wrong"}
        </h3>
        <p style={s.muted}>{message}</p>
        <button style={s.primaryBtn} onClick={onConfirm}>
          {isAuth ? "Login again" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const s = {
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
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  headerRight: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#22F2A6,#7CFF9B)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarInitials: { fontSize: 18, fontWeight: 700, color: "#0F0618" },
  greeting: { fontSize: 18, fontWeight: 400, color: "#e0d9e8" },
  greetingName: { fontWeight: 700 },
  email: { fontSize: 13, color: "#9b93a8", marginTop: 2 },
  walletCard: {
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    padding: "12px 16px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 155,
  },
  walletTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: {
    fontSize: 11,
    color: "#9b93a8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  walletValue: { fontSize: 20, fontWeight: 600 },
  livePill: { display: "flex", alignItems: "center", gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#22F2A6" },
  liveText: { fontSize: 10, color: "#22F2A6", fontWeight: 600 },
  toggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9b93a8",
    display: "flex",
  },
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
  section: { marginTop: 8 },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: 500, color: "#e0d9e8" },
  event: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 500,
    display: "block",
    marginBottom: 3,
  },
  eventActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  progressTrack: {
    height: 3,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    marginTop: 8,
    width: 200,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
  },
  pctLabel: { fontSize: 11, color: "#9b93a8", marginTop: 4, display: "block" },
  status: (status) => ({
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background:
      status === "LIVE"
        ? "rgba(34,242,166,0.12)"
        : status === "ENDED"
          ? "rgba(255,77,79,0.12)"
          : "rgba(250,219,20,0.12)",
    color:
      status === "LIVE"
        ? "#22F2A6"
        : status === "ENDED"
          ? "#ff4d4f"
          : "#fadb14",
  }),
  primaryBtn: {
    background: "linear-gradient(135deg,#22F2A6,#7CFF9B)",
    border: "none",
    padding: "11px 18px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    color: "#0F0618",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    background: "transparent",
    border: "0.5px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 13,
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#22F2A6",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
  },
  emptyIcon: { fontSize: 40 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 2000,
  },
  loadingBox: {
    background: "#1A0F2E",
    padding: 32,
    borderRadius: 18,
    textAlign: "center",
    width: "90%",
    maxWidth: 300,
  },
  modalBox: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 20,
    width: "90%",
    maxWidth: 360,
    textAlign: "center",
  },
  spinner: {
    width: 34,
    height: 34,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTop: "3px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  muted: { color: "#9b93a8", fontSize: 13 },
};
