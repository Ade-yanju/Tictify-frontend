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
import { getToken } from "../../services/authService";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, chartRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        const dash = await dashRes.json();
        const charts = await chartRes.json();

        setData(dash);
        setAnalytics(charts);
      } catch (err) {
        console.error("Admin dashboard load error", err);
      }
    }

    load();
  }, []);

  if (!data || !analytics) {
    return <div style={styles.loading}>Loading dashboard…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.muted}>Platform overview & financial insights</p>
      </header>

      {/* QUICK NAV */}
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

      {/* KPI */}
      <section style={styles.kpiGrid}>
        <KPI
          label="Total Revenue"
          value={`₦${(data.stats.revenue || 0).toLocaleString()}`}
        />
        <KPI
          label="Platform Fees"
          value={`₦${(data.stats.platformFees || 0).toLocaleString()}`}
        />
        <KPI label="Tickets Sold" value={data.stats.ticketsSold || 0} />
        <KPI label="Events Hosted" value={data.stats.events || 0} />
        <KPI
          label="Pending Withdrawals"
          value={data.stats.pendingWithdrawals || 0}
        />
      </section>

      {/* CHART */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Monthly Revenue vs Platform Fees</h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={analytics.monthlyRevenue || []}>
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

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
    fontSize: 16,
  },
};
