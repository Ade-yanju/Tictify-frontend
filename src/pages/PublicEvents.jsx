import { useEffect, useState } from "react";

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError("Unable to load events at the moment.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const getStartingPrice = (ticketTypes = []) => {
    if (!ticketTypes.length) return "Free";
    const prices = ticketTypes.map((t) => t.price);
    const min = Math.min(...prices);
    return min > 0 ? `₦${min}` : "Free";
  };

  if (loading) {
    return <div style={styles.loading}>Loading events…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.heading}>Upcoming Events</h1>
        <p style={styles.subtitle}>
          Discover events happening around you and secure your tickets instantly
        </p>
      </header>

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      {/* EMPTY */}
      {!error && events.length === 0 && (
        <p style={styles.empty}>No upcoming events at the moment.</p>
      )}

      {/* EVENTS GRID */}
      <div style={styles.grid}>
        {events.map((event) => (
          <div key={event._id} style={styles.card}>
            {/* IMAGE */}
            <div style={styles.imageWrapper}>
              <img src={event.banner} alt={event.title} style={styles.image} />
            </div>

            {/* CONTENT */}
            <div style={styles.cardBody}>
              <h3 style={styles.title}>{event.title}</h3>

              <p style={styles.meta}>📍 {event.location || "TBA"}</p>
              <p style={styles.meta}>
                📅 {new Date(event.date).toDateString()}
              </p>
              <p style={styles.meta}>👥 Capacity: {event.capacity}</p>
            </div>

            {/* FOOTER */}
            <div style={styles.cardFooter}>
              <span style={styles.price}>
                {getStartingPrice(event.ticketTypes)}
              </span>

              <button
                style={styles.cta}
                onClick={() => (window.location.href = `/events/${event._id}`)}
              >
                View Event →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    maxWidth: 1200,
    margin: "0 auto 32px",
    textAlign: "center",
  },

  heading: {
    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
  },

  subtitle: {
    color: "#CFC9D6",
    marginTop: 8,
    fontSize: 15,
  },

  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  imageWrapper: {
    width: "100%",
    height: 180,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  cardBody: {
    padding: 16,
    flexGrow: 1,
  },

  title: {
    marginBottom: 10,
    fontSize: 18,
  },

  meta: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 6,
  },

  cardFooter: {
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  price: {
    fontWeight: 600,
    color: "#22F2A6",
  },

  cta: {
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
    color: "#000",
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },

  empty: {
    textAlign: "center",
    color: "#CFC9D6",
    marginTop: 60,
  },

  error: {
    color: "#ff4d4f",
    textAlign: "center",
    marginBottom: 24,
  },
};
