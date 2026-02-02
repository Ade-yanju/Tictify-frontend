import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD EVENTS ================= */
  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        if (!mounted) return;

        setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setError("Unable to load events at the moment.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEvents();
    return () => (mounted = false);
  }, []);

  /* ================= HELPERS ================= */

  const getStartingPrice = (ticketTypes = []) => {
    const prices = ticketTypes
      .map((t) => Number(t.price) || 0)
      .filter((p) => p > 0);
    return prices.length ? `₦${Math.min(...prices)}` : "Free";
  };

  const getRemainingTickets = (event) => {
    const sold = (event.ticketTypes || []).reduce(
      (sum, t) => sum + (t.sold || 0),
      0,
    );
    return Math.max((event.capacity || 0) - sold, 0);
  };

  const getCountdown = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return "Starting now";

    const hours = Math.floor(diff / 36e5);
    const days = Math.floor(hours / 24);

    return days > 0
      ? `Starts in ${days} day${days > 1 ? "s" : ""}`
      : `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
  };

  /* ================= SEARCH FILTER ================= */
  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [events, search]);

  /* ================= FEATURED ================= */
  const featuredIds = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
      .map((e) => e._id);
  }, [events]);

  return (
    <div style={styles.page}>
      {loading && <LoadingModal />}

      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <h1 style={styles.heading}>Upcoming Events</h1>
        <p style={styles.subtitle}>
          Discover events happening around you
        </p>

        {/* SEARCH */}
        <input
          style={styles.search}
          placeholder="Search by event or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* ERROR */}
      {error && !loading && <p style={styles.error}>{error}</p>}

      {/* EMPTY */}
      {!loading && !error && filteredEvents.length === 0 && (
        <p style={styles.empty}>No matching events found.</p>
      )}

      {/* GRID */}
      <div style={styles.grid}>
        {filteredEvents.map((event) => {
          const remaining = getRemainingTickets(event);
          const featured = featuredIds.includes(event._id);

          return (
            <div key={event._id} style={styles.card}>
              {/* IMAGE */}
              <div style={styles.imageWrapper}>
                <img
                  src={event.banner}
                  alt={event.title}
                  style={styles.image}
                />
                {featured && <span style={styles.featured}>Featured</span>}
              </div>

              {/* BODY */}
              <div style={styles.cardBody}>
                <h3 style={styles.title}>{event.title}</h3>
                <p style={styles.meta}>📍 {event.location || "TBA"}</p>
                <p style={styles.meta}>
                  📅 {new Date(event.date).toDateString()}
                </p>
                <p style={styles.meta}>⏳ {getCountdown(event.date)}</p>

                <p style={styles.tickets}>
                  🎟 {remaining} ticket{remaining !== 1 && "s"} left
                </p>
              </div>

              {/* FOOTER */}
              <div style={styles.cardFooter}>
                <span style={styles.price}>
                  {getStartingPrice(event.ticketTypes)}
                </span>

                <button
                  style={styles.cta}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  View Event →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= LOADING ================= */

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading events…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px,4vw,32px)",
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
    fontSize: "clamp(1.6rem,3vw,2.2rem)",
  },

  subtitle: {
    color: "#CFC9D6",
    marginTop: 8,
    fontSize: 15,
  },

  search: {
    marginTop: 20,
    width: "100%",
    maxWidth: 420,
    padding: "12px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },

  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  imageWrapper: {
    position: "relative",
    height: 180,
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  featured: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#22F2A6",
    color: "#000",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  cardBody: {
    padding: 16,
    flexGrow: 1,
  },

  title: {
    fontSize: 18,
    marginBottom: 8,
  },

  meta: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 6,
  },

  tickets: {
    marginTop: 8,
    fontSize: 14,
    color: "#22F2A6",
    fontWeight: 600,
  },

  cardFooter: {
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  price: {
    fontWeight: 700,
    color: "#22F2A6",
  },

  cta: {
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    border: "none",
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
    color: "#000",
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  loadingModal: {
    background: "#1A0F2E",
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
};
