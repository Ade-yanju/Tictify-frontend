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
      } catch (err) {
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p style={styles.loading}>Loading analytics…</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>Sales & Revenue Analytics</h1>

      {/* ===== CHARTS ===== */}
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

      {/* ===== TOP EVENTS ===== */}
      <Table
        title="Top Events"
        rows={data.topEvents.map((e) => ({
          name: e.event?.title || "Unknown",
          sold: e.sold,
          revenue: `₦${e.revenue}`,
        }))}
      />

      {/* ===== TOP ORGANIZERS ===== */}
      <Table
        title="Top Organizers"
        rows={data.topOrganizers.map((o) => ({
          name: o.organizer?.name || "Unknown",
          sold: o.sold,
          revenue: `₦${o.revenue}`,
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
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line dataKey={dataKey} stroke="#22F2A6" />
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
    padding: 32,
    minHeight: "100vh",
    background: "#0F0618",
    color: "#fff",
  },

  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    marginBottom: 32,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  loading: {
    padding: 60,
    textAlign: "center",
  },

  error: {
    padding: 60,
    textAlign: "center",
    color: "#ff4d4f",
  },
};
