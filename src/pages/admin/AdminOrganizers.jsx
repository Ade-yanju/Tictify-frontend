import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/organizers", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load organizers");

        const data = await res.json();
        setOrganizers(data);
      } catch (err) {
        setError(err.message || "Unable to load organizers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading organizers…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Organizers</h1>
        <p style={styles.muted}>Top performers & platform contributors</p>
      </header>

      {/* LEADERBOARD */}
      <section style={styles.leaderboard}>
        <h3>Top Performing Organizers</h3>

        {organizers.slice(0, 5).map((o, i) => (
          <div key={o._id} style={styles.leaderRow}>
            <span style={styles.rank}>#{i + 1}</span>
            <div>
              <strong>{o.name}</strong>
              <p style={styles.muted}>{o.email}</p>
            </div>
            <strong>₦{o.revenue.toLocaleString()}</strong>
          </div>
        ))}
      </section>

      {/* FULL LIST */}
      <section style={styles.table}>
        {organizers.map((o) => (
          <div key={o._id} style={styles.row}>
            <div>
              <strong>{o.name}</strong>
              <p style={styles.muted}>{o.email}</p>
            </div>

            <div>
              <p>Events</p>
              <strong>{o.events}</strong>
            </div>

            <div>
              <p>Tickets Sold</p>
              <strong>{o.ticketsSold}</strong>
            </div>

            <div>
              <p>Revenue</p>
              <strong>₦{o.revenue.toLocaleString()}</strong>
            </div>
          </div>
        ))}
      </section>
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

  header: {
    marginBottom: 32,
  },

  leaderboard: {
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
  },

  leaderRow: {
    display: "grid",
    gridTemplateColumns: "40px 1fr auto",
    alignItems: "center",
    gap: 16,
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  rank: {
    fontWeight: 700,
    color: "#22F2A6",
  },

  table: {
    display: "grid",
    gap: 16,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 16,
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
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
