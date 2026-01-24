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

export default function AdminSalesAnalytics() {
  const [data, setData] = useState({
    revenueByMonth: [],
    ticketsByMonth: [],
    topEvents: [],
    topOrganizers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        if (!res.ok) throw new Error("Failed to load analytics");

        const json = await res.json();

        setData({
          revenueByMonth: json.revenueByMonth || [],
          ticketsByMonth: json.ticketsByMonth || [],
          topEvents: json.topEvents || [],
          topOrganizers: json.topOrganizers || [],
        });
      } catch {
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading analytics…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Sales & Revenue Analytics</h1>
        <p style={styles.muted}>Insights across events & organizers</p>
      </header>

      {/* CHARTS */}
      <div style={styles.grid}>
        <Chart
          title="Monthly Revenue"
          data={data.revenueByMonth}
          dataKey="total"
        />
        <Chart
          title="Tickets Sold"
          data={data.ticketsByMonth}
          dataKey="count"
        />
      </div>

      {/* TABLES */}
      <Table
        title="Top Events"
        rows={data.topEvents.map((e) => ({
          name: e.event?.title || "Unknown",
          sold: e.sold || 0,
          revenue: `₦${(e.revenue || 0).toLocaleString()}`,
        }))}
      />

      <Table
        title="Top Organizers"
        rows={data.topOrganizers.map((o) => ({
          name: o.organizer?.name || "Unknown",
          sold: o.sold || 0,
          revenue: `₦${(o.revenue || 0).toLocaleString()}`,
        }))}
      />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Chart({ title, data, dataKey }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p style={styles.muted}>No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#22F2A6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Table({ title, rows }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>

      {rows.length === 0 ? (
        <p style={styles.muted}>No records found</p>
      ) : (
        rows.map((r, i) => (
          <div key={i} style={styles.row}>
            <strong>{r.name}</strong>
            <span>{r.sold} sold</span>
            <span>{r.revenue}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "clamp(16px,4vw,32px)",
    minHeight: "100vh",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    marginBottom: 32,
  },

  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    marginBottom: 32,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    gap: 12,
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
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
