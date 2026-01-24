import { useEffect, useState } from "react";
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
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function load() {
      const [dash, charts] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then((r) => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then((r) => r.json()),
      ]);

      setData(dash);
      setAnalytics(charts);
    }
    load();
  }, []);

  if (!data || !analytics) return <p style={styles.loading}>Loading…</p>;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1>Admin Dashboard</h1>
        <p style={styles.muted}>Platform overview & financial insights</p>
      </header>

      {/* QUICK NAV */}
      <section style={styles.navGrid}>
        <NavCard
          title="Withdrawals"
          desc="Approve payouts"
          link="/admin/withdrawals"
        />
        <NavCard
          title="Organizers"
          desc="Top performers"
          link="/admin/organizers"
        />
        <NavCard title="Events" desc="All hosted events" link="/admin/events" />
        <NavCard
          title="Sales & Revenue"
          desc="Tickets & analytics"
          link="/admin/sales"
        />
      </section>

      {/* KPI */}
      <section style={styles.grid}>
        <KPI
          label="Total Revenue"
          value={`₦${data.stats.revenue.toLocaleString()}`}
        />
        <KPI
          label="Platform Fees"
          value={`₦${data.stats.platformFees.toLocaleString()}`}
        />
        <KPI label="Tickets Sold" value={data.stats.ticketsSold} />
        <KPI label="Events Hosted" value={data.stats.events} />
        <KPI
          label="Pending Withdrawals"
          value={data.stats.pendingWithdrawals}
        />
      </section>

      {/* CHART */}
      <section style={styles.card}>
        <h3>Monthly Revenue vs Platform Fees</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={analytics.monthlyRevenue}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#22F2A6"
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="platformFees"
              stroke="#facc15"
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
      <h2>{value}</h2>
    </div>
  );
}

function NavCard({ title, desc, link }) {
  return (
    <div style={styles.navCard} onClick={() => (window.location.href = link)}>
      <h3>{title}</h3>
      <p style={styles.muted}>{desc}</p>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 32,
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: { marginBottom: 32 },

  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 40,
  },

  navCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
    cursor: "pointer",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 40,
  },

  kpi: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 24,
  },

  muted: { color: "#CFC9D6", fontSize: 14 },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },
};
