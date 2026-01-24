import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function AdminOrganizers() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/organizers`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        if (!res.ok) throw new Error("Failed to load organizers");

        const data = await res.json();
        setOrganizers(data);
      } catch {
        setError("Unable to load organizers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading organizers…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  const topOrganizers = organizers.slice(0, 5);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1>Organizers</h1>
        <p style={styles.muted}>Top performers & platform contributors</p>
      </header>

      {/* LEADERBOARD */}
      <section style={styles.leaderboard}>
        <h3>Top Performing Organizers</h3>

        {topOrganizers.length === 0 ? (
          <p style={styles.muted}>No organizers yet.</p>
        ) : (
          topOrganizers.map((o, i) => (
            <div
              key={o._id}
              style={styles.leaderRow}
              onClick={() => navigate(`/admin/organizers/${o._id}`)}
            >
              <span style={styles.rank}>#{i + 1}</span>

              <div style={styles.flexCol}>
                <strong>{o.name}</strong>
                <span style={styles.muted}>{o.email}</span>
              </div>

              <strong>₦{(o.revenue || 0).toLocaleString()}</strong>
            </div>
          ))
        )}
      </section>

      {/* FULL LIST */}
      <section style={styles.list}>
        {organizers.map((o) => (
          <div
            key={o._id}
            style={styles.card}
            onClick={() => navigate(`/admin/organizers/${o._id}`)}
          >
            <div style={styles.info}>
              <strong>{o.name}</strong>
              <p style={styles.muted}>{o.email}</p>
            </div>

            <Stat label="Events" value={o.events} />
            <Stat label="Tickets Sold" value={o.ticketsSold} />
            <Stat
              label="Revenue"
              value={`₦${(o.revenue || 0).toLocaleString()}`}
            />
          </div>
        ))}
      </section>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <strong>{value}</strong>
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
    gap: 16,
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },

  rank: {
    fontWeight: 700,
    color: "#22F2A6",
  },

  list: {
    display: "grid",
    gap: 16,
  },

  card: {
    display: "grid",
    gridTemplateColumns: "1fr repeat(3, minmax(80px, auto))",
    gap: 16,
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    cursor: "pointer",
  },

  info: {
    minWidth: 0,
  },

  stat: {
    textAlign: "right",
  },

  statLabel: {
    display: "block",
    fontSize: 12,
    color: "#CFC9D6",
  },

  flexCol: {
    display: "flex",
    flexDirection: "column",
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
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};

/* ================= MOBILE TWEAK ================= */
if (window.innerWidth < 640) {
  styles.card.gridTemplateColumns = "1fr 1fr";
  styles.stat.textAlign = "left";
}
