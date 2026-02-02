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

const EMPTY_DATA = {
  revenueByMonth: [],
  ticketsByMonth: [],
  topEvents: [],
  topOrganizers: [],
};

export default function AdminSalesAnalytics() {
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ANALYTICS ================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Session expired or unauthorized");

        const json = await res.json();

        setData({
          revenueByMonth: json.revenueByMonth || [],
          ticketsByMonth: json.ticketsByMonth || [],
          topEvents: json.topEvents || [],
          topOrganizers: json.topOrganizers || [],
        });
      } catch (err) {
        setError(err.message || "Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) return <LoadingModal />;

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

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales & Revenue Analytics</h1>
          <p style={styles.muted}>Insights across events & organizers</p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ================= CHARTS ================= */}
      <section style={styles.grid}>
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
      </section>

      {/* ================= TABLES ================= */}
      <section style={styles.tableGrid}>
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
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Chart({ title, data, dataKey }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>

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
      <h3 style={styles.cardTitle}>{title}</h3>

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

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading analytics…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px,4vw,32px)",
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

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
    marginBottom: 4,
  },

  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    marginBottom: 32,
  },

  tableGrid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },

  cardTitle: {
    marginBottom: 16,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontSize: 14,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid #ff4d4f",
    color: "#ff4d4f",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "#0F0618",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  loadingModal: {
    background: "rgba(255,255,255,0.08)",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
    width: "90%",
    maxWidth: 320,
  },

  spinner: {
    width: 34,
    height: 34,
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

/* ================= SPINNER ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
