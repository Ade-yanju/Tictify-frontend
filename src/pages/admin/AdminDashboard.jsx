import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getToken, logout } from "../../services/authService";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= AUTH + LOAD ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const [dashRes, chartRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashRes.ok || !chartRes.ok) {
          throw new Error("Session expired or unauthorized");
        }

        const dash = await dashRes.json();
        const charts = await chartRes.json();

        setData(dash || {});
        setAnalytics(charts || {});
      } catch (err) {
        setError(err.message || "Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  /* ================= LOGOUT ================= */
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) {
    return <LoadingModal />;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button style={styles.primaryBtn} onClick={handleLogout}>
          Login Again
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const chartData = analytics?.monthlyRevenue || [];

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.muted}>Platform overview & financial insights</p>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* ================= QUICK NAV ================= */}
      <section style={styles.navGrid}>
        <NavCard
          title="Withdrawals"
          desc="Approve payouts"
          onClick={() => navigate("/admin/withdrawals")}
        />
        <NavCard
          title="Organizers"
          desc="Top performers"
          onClick={() => navigate("/admin/organizers")}
        />
        <NavCard
          title="Events"
          desc="All hosted events"
          onClick={() => navigate("/admin/events")}
        />
        <NavCard
          title="Sales & Revenue"
          desc="Tickets & analytics"
          onClick={() => navigate("/admin/sales")}
        />
      </section>

      {/* ================= KPI ================= */}
      <section style={styles.kpiGrid}>
        <KPI
          label="Total Revenue"
          value={`₦${(stats.revenue || 0).toLocaleString()}`}
        />
        <KPI
          label="Platform Fees"
          value={`₦${(stats.platformFees || 0).toLocaleString()}`}
        />
        <KPI label="Tickets Sold" value={stats.ticketsSold || 0} />
        <KPI label="Events Hosted" value={stats.events || 0} />
        <KPI
          label="Pending Withdrawals"
          value={stats.pendingWithdrawals || 0}
        />
      </section>

      {/* ================= CHART ================= */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Monthly Revenue vs Platform Fees</h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#22F2A6"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="platformFees"
              stroke="#facc15"
              strokeWidth={2}
              name="Platform Fees"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ label, value }) {
  return (
    <div style={styles.kpi}>
      <p style={styles.muted}>{label}</p>
      <h2 style={styles.kpiValue}>{value}</h2>
    </div>
  );
}

function NavCard({ title, desc, onClick }) {
  return (
    <button style={styles.navCard} onClick={onClick}>
      <h3>{title}</h3>
      <p style={styles.muted}>{desc}</p>
    </button>
  );
}

function LoadingModal() {
  return (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingCard}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading admin dashboard…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px, 4vw, 32px)",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
    marginBottom: 32,
  },

  title: {
    fontSize: "clamp(24px, 4vw, 36px)",
    marginBottom: 6,
  },

  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },

  navCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
    cursor: "pointer",
    border: "none",
    textAlign: "left",
    color: "#fff",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },

  kpi: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  kpiValue: {
    fontSize: "clamp(20px, 3vw, 26px)",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 24,
  },

  cardTitle: {
    marginBottom: 16,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },

  primaryBtn: {
    marginTop: 16,
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  loadingOverlay: {
    position: "fixed",
    inset: 0,
    background: "#0F0618",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    color: "#fff",
  },

  loadingCard: {
    background: "rgba(255,255,255,0.08)",
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

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
    textAlign: "center",
    padding: 20,
  },
};

/* ================= SPINNER KEYFRAMES ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
